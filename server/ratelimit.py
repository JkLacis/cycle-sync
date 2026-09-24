"""In-memory sliding-window rate limit per client (single-process prototype server)."""

import threading
import time
from collections import defaultdict, deque

MINUTE = 60
DAY = 24 * 60 * 60


class RateLimiter:
    def __init__(self, per_minute: int, per_day: int) -> None:
        self.per_minute = per_minute
        self.per_day = per_day
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, key: str) -> int | None:
        """Records a hit and returns None, or returns seconds to wait if over a limit."""
        now = time.monotonic()
        with self._lock:
            hits = self._hits[key]
            while hits and now - hits[0] > DAY:
                hits.popleft()
            last_minute = [t for t in hits if now - t <= MINUTE]
            if len(last_minute) >= self.per_minute:
                return int(MINUTE - (now - last_minute[0])) + 1
            if len(hits) >= self.per_day:
                return int(DAY - (now - hits[0])) + 1
            hits.append(now)
            return None
