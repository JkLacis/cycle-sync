"""HTTP server: serves the app files and the coach API.

  GET    /                          the app (index.html + a fixed allowlist of static files)
  GET    /api/health                {"status", "coach": "ready" | "not_configured", "provider", "model"}
  POST   /api/coach                 streams one reply as server-sent events (see coach.stream_reply)
  DELETE /api/coach/{conversation}  deletes a conversation's stored history
"""

import json
import logging
import re

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse, Response, StreamingResponse
from fastapi.staticfiles import StaticFiles

from .coach import stream_reply
from .config import PROVIDERS, ROOT, settings
from .providers import load_provider
from .ratelimit import RateLimiter
from .schemas import CONVERSATION_ID, CoachRequest
from .storage import ConversationStore

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

# Only these files are public — never the repo root (it holds .env, server/, reference/).
STATIC_FILES = {"index.html", "style.css", "content.js", "app.js"}

app = FastAPI(title="Cycle Sync", docs_url=None, redoc_url=None, openapi_url=None)
store = ConversationStore(settings.db_path)
limiter = RateLimiter(settings.rate_per_minute, settings.rate_per_day)
daily_cap = RateLimiter(per_minute=10**9, per_day=settings.rate_global_per_day)
provider = load_provider()  # COACH_PROVIDER: gemini (default) or claude
client = provider.create_client(settings.api_key) if settings.api_key else None


def api_error(status: int, code: str, message: str, headers: dict | None = None) -> JSONResponse:
    return JSONResponse({"code": code, "message": message}, status_code=status, headers=headers)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
    # Report which fields failed, never the submitted values (they can contain health data).
    fields = sorted({".".join(str(p) for p in e["loc"][1:]) for e in exc.errors()})
    message = "Message must be 1–1000 characters." if "message" in fields else "Invalid request."
    return api_error(422, "invalid_request", message + (" Fields: " + ", ".join(fields) if fields else ""))


@app.get("/api/health")
async def health() -> dict:
    return {
        "status": "ok",
        "coach": "ready" if client else "not_configured",
        "provider": settings.provider,
        "model": settings.model,
    }


def sse(event: dict) -> str:
    return f"event: {event['event']}\ndata: {json.dumps(event, ensure_ascii=False)}\n\n"


@app.post("/api/coach")
async def coach(req: CoachRequest, request: Request):
    if client is None:
        key_name = PROVIDERS[settings.provider][0]
        return api_error(503, "not_configured", f"The AI coach isn't set up: add {key_name} to .env and restart the server.")
    # Behind a proxy (Render), set FORWARDED_ALLOW_IPS so request.client is the visitor, not the proxy.
    wait = limiter.check(request.client.host if request.client else "unknown")
    if wait is not None:
        return api_error(429, "rate_limited", "Too many messages. Please wait a moment.", {"Retry-After": str(wait)})
    wait = daily_cap.check("all")
    if wait is not None:
        return api_error(429, "daily_limit", "The coach has reached today's limit. Please try again tomorrow.", {"Retry-After": str(wait)})

    async def events():
        async for event in stream_reply(provider, client, store, req):
            yield sse(event)

    return StreamingResponse(
        events(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"},
    )


@app.delete("/api/coach/{conversation_id}", status_code=204)
async def delete_conversation(conversation_id: str) -> Response:
    if not re.fullmatch(CONVERSATION_ID, conversation_id):
        return api_error(422, "invalid_request", "Invalid conversation id.")
    store.delete(conversation_id)
    return Response(status_code=204)


@app.get("/")
async def index() -> FileResponse:
    return FileResponse(ROOT / "index.html")


@app.get("/{name}")
async def static_file(name: str):
    if name not in STATIC_FILES:
        return api_error(404, "not_found", "Not found.")
    return FileResponse(ROOT / name)


app.mount("/tests", StaticFiles(directory=ROOT / "tests", html=True), name="tests")
