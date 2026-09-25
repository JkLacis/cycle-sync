"""One coach turn, independent of the AI provider: system prompt, user context, history, errors,
and the streaming loop that stores a finished turn. Provider-specific code is in server/providers/.

Prompt layout (prompt caching is a prefix match, so stable parts come first):
  system    frozen coach prompt + knowledge   (same bytes for every user)
  messages  stored history (text only), new user turn, then the per-turn "User context"
"""

import asyncio
import json
import logging
import math
from collections.abc import AsyncIterator
from typing import Protocol

from .config import ROOT, settings
from .schemas import CoachContext, CoachRequest
from .storage import ConversationStore

log = logging.getLogger("cyclesync.coach")

APP_NAME = "Cycle Sync"
PROMPTS_DIR = ROOT / "server" / "prompts"
PHASE_POWR = {"menstrual": "Rest", "follicular": "Prepare", "ovulatory": "Open Up", "luteal": "Work"}
LEVEL_LABEL = {"high": "High Sync", "good": "Good", "moderate": "Moderate", "low": "Low Sync"}
LANGUAGE_NAME = {
    "en": "English", "lv": "Latvian", "lt": "Lithuanian", "et": "Estonian", "pl": "Polish",
    "de": "German", "fr": "French", "es": "Spanish", "it": "Italian",
}


def load_system_prompt() -> str:
    template = (PROMPTS_DIR / "coach.md").read_text(encoding="utf-8")
    knowledge = (PROMPTS_DIR / "knowledge.md").read_text(encoding="utf-8").strip()
    return template.replace("{{app_name}}", APP_NAME).replace("{{knowledge}}", knowledge)


# Rendered once: identical bytes on every request, so it is served from the prompt cache.
SYSTEM_PROMPT = load_system_prompt()


def render_context(ctx: CoachContext | None) -> str:
    if ctx is None:
        return (
            "User context: not available (the app sent none). Answer generally, "
            "and ask about her cycle only if it matters for the answer."
        )
    days = "day" if ctx.next_phase_in_days == 1 else "days"
    lines = [
        "User context (from the app, may be incomplete):",
        f"- Today: {ctx.date.isoformat()} ({ctx.date.strftime('%A')}) | Cycle day {ctx.cycle_day} of ~{ctx.cycle_length} "
        f"(period ~{ctx.period_length} days) | Phase: {ctx.phase.title()} ({PHASE_POWR[ctx.phase]}), {ctx.phase_days}, estimated",
        f"- Next phase: {ctx.next_phase.title()} in {ctx.next_phase_in_days} {days} (estimated)",
        f"- Today's alignment score: {ctx.score}/100" if ctx.score is not None else "- Today's alignment score: none (no tasks today)",
        "- Goals: not set in the app.",
    ]
    if ctx.tasks:
        # Titles are user-written: JSON-quoted so they read as data, not instructions.
        lines.append("- Today's tasks (titles are user-written text):")
        lines += [
            f"  - {t.start}–{t.end} {json.dumps(t.title, ensure_ascii=False)} | {t.type} | {LEVEL_LABEL[t.level]}"
            for t in ctx.tasks
        ]
    else:
        lines.append("- Today's tasks: none")
    if ctx.checkins:
        lines.append("- Recent check-ins (last 7 days):")
        for c in ctx.checkins:
            parts = [
                f"energy {c.energy}/10" if c.energy is not None else None,
                f"mood {c.mood}" if c.mood else None,
                f"focus {c.focus}" if c.focus else None,
                f"sleep {c.sleep}" if c.sleep else None,
            ]
            lines.append(f"  - {c.date.isoformat()}: " + ", ".join(p for p in parts if p))
    else:
        lines.append("- Recent check-ins: none logged")
    if ctx.language != "en":
        # Per turn (not in the system prompt), so the cached prompt stays the same for every language.
        name = LANGUAGE_NAME[ctx.language]
        lines.append(f"- App language: {name}. Write your whole answer in {name}, whatever language the context above is in.")
    return "\n".join(lines)


def trim_history(messages: list[dict]) -> list[dict]:
    """Keep recent turns. Drops the oldest in fixed steps (not one-by-one) so the history prefix
    stays byte-identical for several turns and keeps hitting the prompt cache."""
    count = len(messages)
    if count > settings.history_max_messages:
        step = settings.history_trim_step
        drop = step * math.ceil((count - settings.history_max_messages) / step)
        messages = messages[drop:]
    # Hard cap on size; turns are stored in user/assistant pairs, so drop pairs.
    while len(messages) >= 2 and sum(len(m["content"]) for m in messages) > settings.history_max_chars:
        messages = messages[2:]
    return messages


def context_block(ctx: CoachContext | None) -> str:
    """The user context as a tagged block, for providers without a mid-conversation system message."""
    return f"<app_context>\n{render_context(ctx)}\n</app_context>"


# code, user-facing message, retryable
ERRORS = {
    "rate_limited": ("The coach is busy right now. Try again in a moment.", True),
    "unavailable": ("The AI service is temporarily unavailable. Try again in a moment.", True),
    "timeout": ("The coach took too long to answer. Try again.", True),
    "network": ("Couldn't reach the AI service. Check the internet connection and try again.", True),
    "config": ("The coach isn't set up correctly (API key). Check the server's .env file.", False),
    "bad_request": ("The coach couldn't process that message.", False),
    "refusal": ("I can't help with that request. If you're in danger or need urgent help, contact your local emergency services.", False),
    "empty": ("The coach didn't return an answer. Try again.", True),
}


def error_event(code: str) -> dict:
    message, retryable = ERRORS[code]
    return {"event": "error", "code": code, "message": message, "retryable": retryable}


# Yielded by a provider instead of text when it restarts the answer on a backup model.
RESTART = object()


class TurnOutcome:
    """Filled in by a provider once its stream ends."""

    def __init__(self) -> None:
        self.stop = "end"  # "end" | "max_tokens" | "refusal"
        self.usage = ""  # token counts for the log (never content)


class Provider(Protocol):
    name: str

    def create_client(self, api_key: str): ...

    def stream_turn(self, client, history: list[dict], user_text: str, ctx: CoachContext | None, outcome: TurnOutcome) -> AsyncIterator[str]: ...

    def classify_error(self, err: Exception) -> str: ...


async def stream_reply(provider: Provider, client, store: ConversationStore, req: CoachRequest) -> AsyncIterator[dict]:
    """Yields {"event": "delta", "text"} ... then {"event": "done"} or {"event": "error", ...}.
    {"event": "reset"} means: discard the text so far, the answer starts again (backup model).
    After an error the client discards any partial text; nothing is stored for a failed turn."""
    history = trim_history(await asyncio.to_thread(store.history, req.conversation_id))
    outcome = TurnOutcome()
    parts: list[str] = []
    try:
        async with asyncio.timeout(settings.request_timeout_s):
            async for text in provider.stream_turn(client, history, req.message, req.context, outcome):
                if text is RESTART:
                    parts.clear()
                    yield {"event": "reset"}
                    continue
                parts.append(text)
                yield {"event": "delta", "text": text}
    except Exception as err:  # noqa: BLE001 — every failure becomes a typed event for the UI
        code = "timeout" if isinstance(err, TimeoutError) else provider.classify_error(err)
        # Log the error type only — never message content.
        log.warning("coach turn failed: %s (%s) %s", code, type(err).__name__, getattr(err, "request_id", "") or "")
        yield error_event(code)
        return

    reply = "".join(parts).strip()
    if outcome.stop == "refusal":
        log.info("coach refusal %s", outcome.usage)
        yield error_event("refusal")
        return
    if not reply:
        yield error_event("empty")
        return

    await asyncio.to_thread(store.add_turn, req.conversation_id, req.message, reply)
    log.info("coach turn ok provider=%s %s stop=%s", provider.name, outcome.usage, outcome.stop)
    yield {"event": "done", "truncated": outcome.stop == "max_tokens"}
