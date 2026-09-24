"""Run with:  .venv/bin/python -m server"""

import uvicorn

from .config import settings

if __name__ == "__main__":
    uvicorn.run("server.app:app", host=settings.host, port=settings.port, log_level="info")
