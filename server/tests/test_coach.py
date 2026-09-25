"""Offline tests for prompt assembly and the streaming turn (fake Claude and Gemini clients, no API calls).

Run:  .venv/bin/python -m unittest discover -s server/tests -t .
"""

import asyncio
import dataclasses
import tempfile
import unittest
from datetime import date
from pathlib import Path
from types import SimpleNamespace
from unittest import mock

import anthropic
import httpx
import httpx2
from google.genai import errors as genai_errors
from google.genai import types as genai_types

from server import coach
from server.providers import claude, gemini
from server.schemas import CheckIn, CoachContext, CoachRequest, Task
from server.storage import ConversationStore

# Claude tests run with Claude settings, whatever COACH_PROVIDER is in .env.
CLAUDE_SETTINGS = dataclasses.replace(coach.settings, provider="claude", model="claude-opus-5-5", effort="low")
GEMINI_SETTINGS = dataclasses.replace(
    coach.settings, provider="gemini", model="gemini-3.8-flash", fallback_models=("gemini-3.5-flash-lite",), effort="low"
)

CONV = "123e4567-e89b-12d3-a456-426614174000"

CTX = CoachContext(
    date=date(2026, 9, 24), cycle_day=14, cycle_length=28, period_length=5, phase="ovulatory",
    phase_days="Days 13–15", next_phase="luteal", next_phase_in_days=2, score=78,
    tasks=[Task(title='Client "pitch"', start="10:00", end="11:00", type="Pitch / presentation", level="high")],
    checkins=[CheckIn(date=date(2026, 9, 24), energy=7, mood="Good", focus="High", sleep="8h")],
)


class FakeStream:
    def __init__(self, chunks, stop_reason="end_turn", error=None):
        self.chunks, self.stop_reason, self.error = chunks, stop_reason, error

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    @property
    def text_stream(self):
        async def gen():
            for chunk in self.chunks:
                yield chunk
            if self.error:
                raise self.error
        return gen()

    async def get_final_message(self):
        usage = SimpleNamespace(input_tokens=10, cache_read_input_tokens=0, cache_creation_input_tokens=0, output_tokens=5)
        return SimpleNamespace(stop_reason=self.stop_reason, usage=usage, model="fake", stop_details=None)


class FakeClient:
    def __init__(self, stream):
        self.calls = []
        self.messages = SimpleNamespace(stream=lambda **params: self.calls.append(params) or stream)


def gemini_chunk(text=None, finish=None, block=None):
    return genai_types.GenerateContentResponse(
        candidates=[genai_types.Candidate(
            content=genai_types.Content(role="model", parts=[genai_types.Part(text=text)] if text else []),
            finish_reason=finish,
        )],
        prompt_feedback=genai_types.GenerateContentResponsePromptFeedback(block_reason=block) if block else None,
        usage_metadata=genai_types.GenerateContentResponseUsageMetadata(prompt_token_count=10, candidates_token_count=5) if finish else None,
    )


class FakeGemini:
    def __init__(self, chunks, error=None, busy=()):
        self.calls = []

        async def generate_content_stream(**params):
            self.calls.append(params)
            if params["model"] in busy:
                raise genai_errors.ServerError(503, {"error": {"message": "high demand", "status": "UNAVAILABLE"}})

            async def gen():
                for chunk in chunks:
                    yield chunk
                if error:
                    raise error
            return gen()

        self.aio = SimpleNamespace(models=SimpleNamespace(generate_content_stream=generate_content_stream))


def run(client, store, req, provider=claude):
    async def collect():
        return [e async for e in coach.stream_reply(provider, client, store, req)]
    return asyncio.run(collect())


class PromptTests(unittest.TestCase):
    def test_system_prompt_is_frozen_and_filled(self):
        self.assertNotIn("{{", coach.SYSTEM_PROMPT)
        self.assertIn("Cycle Sync", coach.SYSTEM_PROMPT)
        self.assertIn("Luteal — Work", coach.SYSTEM_PROMPT)
        self.assertEqual(coach.SYSTEM_PROMPT, coach.load_system_prompt())  # same bytes each time → cacheable

    def test_context_rendering(self):
        text = coach.render_context(CTX)
        self.assertIn("Cycle day 14 of ~28", text)
        self.assertIn("Ovulatory (Open Up)", text)
        self.assertIn('"Client \\"pitch\\""', text)  # user text is JSON-quoted
        self.assertIn("energy 7/10, mood Good, focus High, sleep 8h", text)
        self.assertIn("not available", coach.render_context(None))

    def test_language_line(self):
        self.assertNotIn("App language", coach.render_context(CTX))  # English: no extra line
        text = coach.render_context(CTX.model_copy(update={"language": "lv"}))
        self.assertIn("Write your whole answer in Latvian", text)
        with self.assertRaises(ValueError):
            CoachContext(**{**CTX.model_dump(), "language": "xx"})

    @mock.patch.object(claude, "settings", CLAUDE_SETTINGS)
    def test_request_layout(self):
        req = claude.build_request([{"role": "user", "content": "a"}, {"role": "assistant", "content": "b"}], "hi", CTX)
        self.assertEqual(req["model"], "claude-opus-5-5")
        self.assertEqual(req["system"][0]["cache_control"], {"type": "ephemeral"})
        roles = [m["role"] for m in req["messages"]]
        self.assertEqual(roles, ["user", "assistant", "user", "system"])  # context after the cached prefix
        self.assertEqual(req["messages"][2]["content"][0]["cache_control"], {"type": "ephemeral"})
        self.assertNotIn("thinking", req)  # Opus 5.5: adaptive thinking is always on; effort controls it

    @mock.patch.object(gemini, "settings", GEMINI_SETTINGS)
    def test_gemini_request_layout(self):
        req = gemini.build_request([{"role": "user", "content": "a"}, {"role": "assistant", "content": "b"}], "hi", CTX)
        self.assertEqual([c["role"] for c in req["contents"]], ["user", "model", "user"])
        context, text = req["contents"][-1]["parts"]
        self.assertTrue(context["text"].startswith("<app_context>\nUser context"))  # context first, her words after
        self.assertEqual(text["text"], "hi")
        self.assertEqual(req["config"].system_instruction, coach.SYSTEM_PROMPT)
        self.assertEqual(req["config"].thinking_config.thinking_level, genai_types.ThinkingLevel.LOW)

    def test_trim_history_in_steps(self):
        msgs = [{"role": "user" if i % 2 == 0 else "assistant", "content": "x"} for i in range(34)]
        trimmed = coach.trim_history(msgs)
        self.assertEqual(len(trimmed), 24)  # 34 > 30 → drop one step of 10
        self.assertEqual(trimmed[0]["role"], "user")
        big = [{"role": "user" if i % 2 == 0 else "assistant", "content": "y" * 5000} for i in range(10)]
        self.assertLessEqual(sum(len(m["content"]) for m in coach.trim_history(big)), coach.settings.history_max_chars)


class StreamTests(unittest.TestCase):
    def setUp(self):
        patcher = mock.patch.object(claude, "settings", CLAUDE_SETTINGS)
        patcher.start()
        self.addCleanup(patcher.stop)
        self.dir = tempfile.TemporaryDirectory()
        self.store = ConversationStore(Path(self.dir.name) / "t.db")
        self.req = CoachRequest(conversation_id=CONV, message="How should I train today?", context=CTX)

    def tearDown(self):
        self.dir.cleanup()

    def test_success_streams_and_stores_turn(self):
        events = run(FakeClient(FakeStream(["Go ", "hard."])), self.store, self.req)
        self.assertEqual([e["event"] for e in events], ["delta", "delta", "done"])
        self.assertEqual(self.store.history(CONV)[-1], {"role": "assistant", "content": "Go hard."})

    def test_history_is_sent_next_turn(self):
        run(FakeClient(FakeStream(["First."])), self.store, self.req)
        client = FakeClient(FakeStream(["Second."]))
        run(client, self.store, self.req)
        self.assertEqual([m["role"] for m in client.calls[0]["messages"]], ["user", "assistant", "user", "system"])

    def test_error_mid_stream_stores_nothing(self):
        err = anthropic.APIConnectionError(request=httpx2.Request("POST", "https://api.anthropic.com"))
        events = run(FakeClient(FakeStream(["partial"], error=err)), self.store, self.req)
        self.assertEqual(events[-1]["event"], "error")
        self.assertEqual(events[-1]["code"], "network")
        self.assertTrue(events[-1]["retryable"])
        self.assertEqual(self.store.history(CONV), [])

    def test_refusal_is_reported_not_stored(self):
        events = run(FakeClient(FakeStream(["x"], stop_reason="refusal")), self.store, self.req)
        self.assertEqual(events[-1]["code"], "refusal")
        self.assertEqual(self.store.history(CONV), [])

    def test_delete(self):
        run(FakeClient(FakeStream(["ok"])), self.store, self.req)
        self.assertEqual(self.store.delete(CONV), 2)
        self.assertEqual(self.store.history(CONV), [])


class GeminiStreamTests(unittest.TestCase):
    def setUp(self):
        patcher = mock.patch.object(gemini, "settings", GEMINI_SETTINGS)
        patcher.start()
        self.addCleanup(patcher.stop)
        self.dir = tempfile.TemporaryDirectory()
        self.store = ConversationStore(Path(self.dir.name) / "t.db")
        self.req = CoachRequest(conversation_id=CONV, message="How should I train today?", context=CTX)

    def tearDown(self):
        self.dir.cleanup()

    def test_success_streams_and_stores_turn(self):
        client = FakeGemini([gemini_chunk("Go "), gemini_chunk("hard.", finish="STOP")])
        events = run(client, self.store, self.req, gemini)
        self.assertEqual([e["event"] for e in events], ["delta", "delta", "done"])
        self.assertFalse(events[-1]["truncated"])
        self.assertEqual(self.store.history(CONV)[-1], {"role": "assistant", "content": "Go hard."})
        client = FakeGemini([gemini_chunk("Next.", finish="STOP")])
        run(client, self.store, self.req, gemini)
        self.assertEqual([c["role"] for c in client.calls[0]["contents"]], ["user", "model", "user"])

    def test_busy_model_falls_back(self):
        client = FakeGemini([gemini_chunk("Fine.", finish="STOP")], busy={"gemini-3.8-flash"})
        events = run(client, self.store, self.req, gemini)
        self.assertEqual(events[-1]["event"], "done")
        self.assertEqual([c["model"] for c in client.calls], ["gemini-3.8-flash", "gemini-3.5-flash-lite"])
        # Busy mid-answer: the client is told to reset, and only the backup model's answer is stored.
        calls = []

        async def flaky(**params):
            calls.append(params["model"])

            async def gen():
                if params["model"] == "gemini-3.8-flash":
                    yield gemini_chunk("Half an ")
                    raise genai_errors.ServerError(503, {"error": {"message": "high demand", "status": "UNAVAILABLE"}})
                yield gemini_chunk("Whole answer.", finish="STOP")
            return gen()

        client = SimpleNamespace(aio=SimpleNamespace(models=SimpleNamespace(generate_content_stream=flaky)))
        events = run(client, self.store, self.req, gemini)
        self.assertEqual([e["event"] for e in events], ["delta", "reset", "delta", "done"])
        self.assertEqual(self.store.history(CONV)[-1]["content"], "Whole answer.")
        client = FakeGemini([], busy={"gemini-3.8-flash", "gemini-3.5-flash-lite"})
        events = run(client, self.store, self.req, gemini)
        self.assertEqual((events[-1]["code"], events[-1]["retryable"]), ("unavailable", True))

    def test_max_tokens_is_truncated(self):
        events = run(FakeGemini([gemini_chunk("Long", finish="MAX_TOKENS")]), self.store, self.req, gemini)
        self.assertTrue(events[-1]["truncated"])

    def test_safety_block_is_refusal(self):
        for client in (FakeGemini([gemini_chunk(finish="SAFETY")]), FakeGemini([gemini_chunk(block="PROHIBITED_CONTENT")])):
            events = run(client, self.store, self.req, gemini)
            self.assertEqual(events[-1]["code"], "refusal")
        self.assertEqual(self.store.history(CONV), [])

    def test_error_mid_stream_stores_nothing(self):
        err = httpx.ConnectError("down")
        events = run(FakeGemini([gemini_chunk("partial")], error=err), self.store, self.req, gemini)
        self.assertEqual((events[-1]["event"], events[-1]["code"]), ("error", "network"))
        self.assertEqual(self.store.history(CONV), [])


class ErrorMappingTests(unittest.TestCase):
    def test_classification(self):
        req = httpx2.Request("POST", "https://api.anthropic.com")
        def status(code):
            return anthropic.APIStatusError("x", response=httpx2.Response(code, request=req), body=None)
        self.assertEqual(claude.classify_error(status(500)), "unavailable")
        self.assertEqual(claude.classify_error(status(529)), "unavailable")
        self.assertEqual(claude.classify_error(status(400)), "bad_request")
        self.assertEqual(claude.classify_error(anthropic.RateLimitError("x", response=httpx2.Response(429, request=req), body=None)), "rate_limited")
        self.assertEqual(claude.classify_error(anthropic.AuthenticationError("x", response=httpx2.Response(401, request=req), body=None)), "config")


    def test_gemini_classification(self):
        def api(code, message="x"):
            return genai_errors.APIError(code, {"error": {"message": message, "status": "X"}})
        self.assertEqual(gemini.classify_error(api(429)), "rate_limited")
        self.assertEqual(gemini.classify_error(api(400, "API key not valid. Please pass a valid API key.")), "config")
        self.assertEqual(gemini.classify_error(api(404)), "config")
        self.assertEqual(gemini.classify_error(api(400)), "bad_request")
        self.assertEqual(gemini.classify_error(api(503)), "unavailable")
        self.assertEqual(gemini.classify_error(httpx.ReadTimeout("slow")), "timeout")
        self.assertEqual(gemini.classify_error(httpx2.ConnectError("down")), "network")


if __name__ == "__main__":
    unittest.main()
