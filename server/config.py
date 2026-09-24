"""Settings from environment variables (.env in the repo root). No secrets in code."""

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")


# provider -> (API key variable, default model)
PROVIDERS = {
    "gemini": ("GEMINI_API_KEY", "gemini-3.8-flash"),
    "claude": ("ANTHROPIC_API_KEY", "claude-opus-5-5"),
}
# Free-tier Gemini models are often "busy" (503); a lighter model usually still answers.
DEFAULT_FALLBACKS = {"gemini": "gemini-3.5-flash-lite,gemini-3.1-flash-lite"}


def _int(name: str, default: int) -> int:
    value = os.getenv(name, "").strip()
    return int(value) if value else default


@dataclass(frozen=True)
class Settings:
    provider: str  # "gemini" or "claude"
    api_key: str | None
    model: str
    fallback_models: tuple[str, ...]  # tried in order when the model is busy (Gemini only)
    effort: str
    max_tokens: int
    request_timeout_s: int
    history_max_messages: int
    history_trim_step: int
    history_max_chars: int
    rate_per_minute: int
    rate_per_day: int
    db_path: Path
    host: str
    port: int


def load_settings() -> Settings:
    provider = os.getenv("COACH_PROVIDER", "gemini").strip().lower()
    if provider not in PROVIDERS:
        raise SystemExit(f"COACH_PROVIDER must be one of {', '.join(PROVIDERS)} (got {provider!r})")
    key_name, default_model = PROVIDERS[provider]
    return Settings(
        provider=provider,
        api_key=os.getenv(key_name, "").strip() or None,
        model=os.getenv("COACH_MODEL", "").strip() or default_model,
        fallback_models=tuple(
            m.strip() for m in os.getenv("COACH_FALLBACK_MODELS", DEFAULT_FALLBACKS.get(provider, "")).split(",") if m.strip()
        ),
        effort=os.getenv("COACH_EFFORT", "low").strip().lower(),
        # Thinking counts toward max_tokens, so leave room beyond the short reply.
        max_tokens=_int("COACH_MAX_TOKENS", 16000),
        request_timeout_s=_int("COACH_TIMEOUT_SECONDS", 90),
        # History sent to the model: at most this many messages, trimmed in steps so the
        # cached prefix stays the same for several turns in a row.
        history_max_messages=_int("COACH_HISTORY_MAX_MESSAGES", 30),
        history_trim_step=_int("COACH_HISTORY_TRIM_STEP", 10),
        history_max_chars=_int("COACH_HISTORY_MAX_CHARS", 24000),
        rate_per_minute=_int("RATE_LIMIT_PER_MINUTE", 10),
        rate_per_day=_int("RATE_LIMIT_PER_DAY", 200),
        db_path=Path(os.getenv("COACH_DB_PATH", str(ROOT / "server" / "data" / "coach.db"))),
        host=os.getenv("HOST", "127.0.0.1"),
        port=_int("PORT", 8000),
    )


settings = load_settings()
