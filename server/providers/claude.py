"""Anthropic Claude (official `anthropic` SDK). Set COACH_PROVIDER=claude and ANTHROPIC_API_KEY.

Cache breakpoints: the frozen system prompt, and the new user turn (history prefix reused next turn).
The per-turn user context comes after the last breakpoint.
"""

from collections.abc import AsyncIterator

import anthropic

from ..coach import SYSTEM_PROMPT, TurnOutcome, context_block, render_context
from ..config import settings
from ..schemas import CoachContext

name = "claude"
# Models that accept a {"role": "system"} message inside `messages` (the operator channel).
# Other models get the context as a tagged block in the user turn instead.
SYSTEM_ROLE_MODELS = {"claude-opus-5-5", "claude-opus-5", "claude-opus-4-8", "claude-fable-5", "claude-fable-5-1"}


def create_client(api_key: str) -> anthropic.AsyncAnthropic:
    return anthropic.AsyncAnthropic(
        api_key=api_key,
        max_retries=1,  # the SDK retries 429/5xx/connection errors once; the UI offers Retry after that
        timeout=anthropic.Timeout(float(settings.request_timeout_s), connect=10.0),
    )


def build_request(history: list[dict], user_text: str, ctx: CoachContext | None) -> dict:
    user_turn = {"type": "text", "text": user_text, "cache_control": {"type": "ephemeral"}}
    if settings.model in SYSTEM_ROLE_MODELS:
        messages = [*history, {"role": "user", "content": [user_turn]}, {"role": "system", "content": render_context(ctx)}]
    else:
        messages = [*history, {"role": "user", "content": [{"type": "text", "text": context_block(ctx)}, user_turn]}]
    return {
        "model": settings.model,
        "max_tokens": settings.max_tokens,
        "system": [{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
        "messages": messages,
        # Thinking is adaptive (always on for Opus 5.5); effort controls depth, latency and cost.
        "output_config": {"effort": settings.effort},
    }


async def stream_turn(client, history, user_text, ctx, outcome: TurnOutcome) -> AsyncIterator[str]:
    async with client.messages.stream(**build_request(history, user_text, ctx)) as stream:
        async for text in stream.text_stream:
            yield text
        final = await stream.get_final_message()
    outcome.stop = {"refusal": "refusal", "max_tokens": "max_tokens"}.get(final.stop_reason, "end")
    u = final.usage
    outcome.usage = (
        f"model={final.model} in={u.input_tokens} cache_read={u.cache_read_input_tokens} "
        f"cache_write={u.cache_creation_input_tokens} out={u.output_tokens}"
    )
    if outcome.stop == "refusal":
        outcome.usage += f" category={getattr(final.stop_details, 'category', None)}"


def classify_error(err: Exception) -> str:
    # Most specific first: retryable (rate limit, overload, 5xx, network, timeout) vs not (4xx).
    if isinstance(err, anthropic.APITimeoutError):
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
