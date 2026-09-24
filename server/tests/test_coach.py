"""Offline tests for prompt assembly and the streaming turn (fake client, no API calls).

Run:  .venv/bin/python -m unittest discover -s server/tests -t .
"""

import asyncio
import tempfile
import unittest
from datetime import date
from pathlib import Path
from types import SimpleNamespace

import anthropic
import httpx2

from server import coach
from server.schemas import CheckIn, CoachContext, CoachRequest, Task
from server.storage import ConversationStore

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


def run(client, store, req):
    async def collect():
        return [e async for e in coach.stream_reply(client, store, req)]
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

    def test_request_layout(self):
        req = coach.build_request([{"role": "user", "content": "a"}, {"role": "assistant", "content": "b"}], "hi", CTX)
        self.assertEqual(req["model"], coach.settings.model)
        self.assertEqual(req["system"][0]["cache_control"], {"type": "ephemeral"})
        roles = [m["role"] for m in req["messages"]]
        self.assertEqual(roles, ["user", "assistant", "user", "system"])  # context after the cached prefix
        self.assertEqual(req["messages"][2]["content"][0]["cache_control"], {"type": "ephemeral"})
        self.assertNotIn("thinking", req)  # Opus 5.5: adaptive thinking is always on; effort controls it

    def test_trim_history_in_steps(self):
        msgs = [{"role": "user" if i % 2 == 0 else "assistant", "content": "x"} for i in range(34)]
        trimmed = coach.trim_history(msgs)
        self.assertEqual(len(trimmed), 24)  # 34 > 30 → drop one step of 10
        self.assertEqual(trimmed[0]["role"], "user")
        big = [{"role": "user" if i % 2 == 0 else "assistant", "content": "y" * 5000} for i in range(10)]
        self.assertLessEqual(sum(len(m["content"]) for m in coach.trim_history(big)), coach.settings.history_max_chars)


class StreamTests(unittest.TestCase):
    def setUp(self):
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


class ErrorMappingTests(unittest.TestCase):
    def test_classification(self):
        req = httpx2.Request("POST", "https://api.anthropic.com")
        def status(code):
            return anthropic.APIStatusError("x", response=httpx2.Response(code, request=req), body=None)
        self.assertEqual(coach.classify_error(TimeoutError()), "timeout")
        self.assertEqual(coach.classify_error(status(500)), "unavailable")
        self.assertEqual(coach.classify_error(status(529)), "unavailable")
        self.assertEqual(coach.classify_error(status(400)), "bad_request")
        self.assertEqual(coach.classify_error(anthropic.RateLimitError("x", response=httpx2.Response(429, request=req), body=None)), "rate_limited")
        self.assertEqual(coach.classify_error(anthropic.AuthenticationError("x", response=httpx2.Response(401, request=req), body=None)), "config")


if __name__ == "__main__":
    unittest.main()
