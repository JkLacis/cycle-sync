"""Google Gemini (official `google-genai` SDK). Default provider: COACH_PROVIDER=gemini and GEMINI_API_KEY
(free key from https://aistudio.google.com). Free tier: Google may use prompts to improve its products.

Gemini has no system message mid-conversation, so the user context is a tagged block at the start of the
new user turn. Everything before it (system instruction + history) is a stable prefix for implicit caching.
"""

from collections.abc import AsyncIterator

import httpx
import httpx2
from google import genai
from google.genai import errors, types

from ..coach import SYSTEM_PROMPT, TurnOutcome, context_block
from ..config import settings
from ..schemas import CoachContext

name = "gemini"
REFUSAL_REASONS = {"SAFETY", "PROHIBITED_CONTENT", "BLOCKLIST", "SPII"}  # finish reasons that mean "blocked"
THINKING_LEVELS = {"minimal", "low", "medium", "high"}


def create_client(api_key: str) -> genai.Client:
    return genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(
            timeout=settings.request_timeout_s * 1000,  # milliseconds
            retry_options=types.HttpRetryOptions(attempts=2),  # one retry on 408/429/5xx; the UI offers Retry after that
        ),
    )


def build_request(history: list[dict], user_text: str, ctx: CoachContext | None) -> dict:
    contents = [
        {"role": "model" if m["role"] == "assistant" else "user", "parts": [{"text": m["content"]}]} for m in history
    ]
    contents.append({"role": "user", "parts": [{"text": context_block(ctx)}, {"text": user_text}]})
    level = settings.effort if settings.effort in THINKING_LEVELS else "low"
    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        max_output_tokens=settings.max_tokens,  # includes thinking tokens
        thinking_config=types.ThinkingConfig(thinking_level=level.upper()),
        automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),  # no tools
    )
    return {"model": settings.model, "contents": contents, "config": config}


async def stream_turn(client, history, user_text, ctx, outcome: TurnOutcome) -> AsyncIterator[str]:
    stream = await client.aio.models.generate_content_stream(**build_request(history, user_text, ctx))
    finish, blocked, usage = None, None, None
    async for chunk in stream:
        if chunk.prompt_feedback and chunk.prompt_feedback.block_reason:
            blocked = str(chunk.prompt_feedback.block_reason.value)
        if chunk.candidates and chunk.candidates[0].finish_reason:
            finish = str(chunk.candidates[0].finish_reason.value)
        usage = chunk.usage_metadata or usage
        text = chunk.text  # text parts only; thought summaries are skipped
        if text:
            yield text
    if blocked or finish in REFUSAL_REASONS:
        outcome.stop = "refusal"
    elif finish == "MAX_TOKENS":
        outcome.stop = "max_tokens"
    u = usage
    outcome.usage = (
        f"model={settings.model} in={u.prompt_token_count} cached={u.cached_content_token_count} "
        f"thinking={u.thoughts_token_count} out={u.candidates_token_count}"
        if u else f"model={settings.model}"
    ) + (f" finish={finish}" if finish else "") + (f" blocked={blocked}" if blocked else "")


def classify_error(err: Exception) -> str:
    if isinstance(err, (httpx.TimeoutException, httpx2.TimeoutException)):
        return "timeout"
    if isinstance(err, (httpx.TransportError, httpx2.TransportError)):
        return "network"
    if isinstance(err, errors.APIError):
        if err.code == 429:
            return "rate_limited"  # includes the free tier's per-minute / per-day quota
        if err.code in (401, 403, 404) or (err.code == 400 and "API key" in str(err.message or "")):
            return "config"  # bad key, no access, or unknown model name
        if err.code >= 500:
            return "unavailable"
        return "bad_request"
    return "unavailable"
