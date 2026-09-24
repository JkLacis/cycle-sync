"""One coach turn: assemble the Claude request, stream the reply, store the finished turn.

Request layout (prompt caching is a prefix match, so stable parts come first):
  system    frozen coach prompt + knowledge            <- cache breakpoint 1 (same bytes for every user)
  messages  stored history (text only), new user turn  <- cache breakpoint 2 (history prefix reused next turn)
            per-turn "User context" system message     <- volatile, after the last breakpoint
"""

import asyncio
import json
import logging
import math
from collections.abc import AsyncIterator

import anthropic

from .config import ROOT, settings
from .schemas import CoachContext, CoachRequest
from .storage import ConversationStore

log = logging.getLogger("cyclesync.coach")

APP_NAME = "Cycle Sync"
PROMPTS_DIR = ROOT / "server" / "prompts"
PHASE_POWR = {"menstrual": "Rest", "follicular": "Prepare", "ovulatory": "Open Up", "luteal": "Work"}
LEVEL_LABEL = {"high": "High Sync", "good": "Good", "moderate": "Moderate", "low": "Low Sync"}
# Models that accept a {"role": "system"} message inside `messages` (the operator channel).
# Other models get the context as a tagged block in the user turn instead.
SYSTEM_ROLE_MODELS = {"claude-opus-5-5", "claude-opus-5", "claude-opus-4-8", "claude-fable-5", "claude-fable-5-1"}


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


def build_request(history: list[dict], user_text: str, ctx: CoachContext | None) -> dict:
    context_text = render_context(ctx)
    user_turn = {"type": "text", "text": user_text, "cache_control": {"type": "ephemeral"}}
    if settings.model in SYSTEM_ROLE_MODELS:
        messages = [*history, {"role": "user", "content": [user_turn]}, {"role": "system", "content": context_text}]
    else:
        context_block = {"type": "text", "text": f"<app_context>\n{context_text}\n</app_context>"}
        messages = [*history, {"role": "user", "content": [context_block, user_turn]}]
    return {
        "model": settings.model,
        "max_tokens": settings.max_tokens,
        "system": [{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
        "messages": messages,
        # Thinking is adaptive (always on for Opus 5.5); effort controls depth, latency and cost.
        "output_config": {"effort": settings.effort},
    }


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


def classify_error(err: Exception) -> str:
    # Most specific first: retryable (rate limit, overload, 5xx, network, timeout) vs not (4xx).
    if isinstance(err, (TimeoutError, anthropic.APITimeoutError)):
        return "timeout"
    if isinstance(err, anthropic.RateLimitError):
        return "rate_limited"
    if isinstance(err, (anthropic.AuthenticationError, anthropic.PermissionDeniedError, anthropic.NotFoundError)):
        return "config"
    if isinstance(err, anthropic.BadRequestError):
        return "bad_request"
    if isinstance(err, anthropic.APIStatusError):
        return "unavailable" if err.status_code >= 500 or err.status_code == 529 else "bad_request"
    if isinstance(err, anthropic.APIConnectionError):
        return "network"
    return "unavailable"


async def stream_reply(client: anthropic.AsyncAnthropic, store: ConversationStore, req: CoachRequest) -> AsyncIterator[dict]:
    """Yields {"event": "delta", "text"} ... then {"event": "done"} or {"event": "error", ...}.
    After an error the client discards any partial text; nothing is stored for a failed turn."""
    history = trim_history(await asyncio.to_thread(store.history, req.conversation_id))
    params = build_request(history, req.message, req.context)
    parts: list[str] = []
    try:
        async with asyncio.timeout(settings.request_timeout_s):
            async with client.messages.stream(**params) as stream:
                async for text in stream.text_stream:
                    parts.append(text)
                    yield {"event": "delta", "text": text}
                final = await stream.get_final_message()
    except Exception as err:  # noqa: BLE001 — every failure becomes a typed event for the UI
        code = classify_error(err)
        # Log type and request id only — never message content.
        log.warning("coach turn failed: %s (%s) request_id=%s", code, type(err).__name__, getattr(err, "request_id", None))
        yield error_event(code)
        return

    reply = "".join(parts).strip()
    if final.stop_reason == "refusal":
        log.info("coach refusal category=%s", getattr(final.stop_details, "category", None))
        yield error_event("refusal")
        return
    if not reply:
        yield error_event("empty")
        return

    await asyncio.to_thread(store.add_turn, req.conversation_id, req.message, reply)
    u = final.usage
    log.info(
        "coach turn ok model=%s in=%s cache_read=%s cache_write=%s out=%s stop=%s",
        final.model, u.input_tokens, u.cache_read_input_tokens, u.cache_creation_input_tokens, u.output_tokens, final.stop_reason,
    )
    yield {"event": "done", "truncated": final.stop_reason == "max_tokens"}
