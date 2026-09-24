"""AI providers for the coach. Each module exposes: name, create_client(api_key), stream_turn(...), classify_error(err)."""

from ..config import settings


def load_provider():
    if settings.provider == "claude":
        from . import claude as provider
    else:
        from . import gemini as provider
    return provider
