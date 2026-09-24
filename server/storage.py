"""Conversation history in SQLite (local file, gitignored).

A turn is stored only after the reply finished, as one user + one assistant message, so a
failed or retried request never leaves a half turn behind.
"""

import sqlite3
import threading
import time
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id, id);
"""


class ConversationStore:
    def __init__(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        self._db = sqlite3.connect(path, check_same_thread=False)
        self._db.executescript(SCHEMA)
        self._lock = threading.Lock()

    def history(self, conversation_id: str) -> list[dict]:
        with self._lock:
            rows = self._db.execute(
                "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY id",
                (conversation_id,),
            ).fetchall()
        return [{"role": role, "content": content} for role, content in rows]

    def add_turn(self, conversation_id: str, user_text: str, assistant_text: str) -> None:
        now = time.time()
        with self._lock, self._db:
            self._db.executemany(
                "INSERT INTO messages (conversation_id, role, content, created_at) VALUES (?, ?, ?, ?)",
                [(conversation_id, "user", user_text, now), (conversation_id, "assistant", assistant_text, now)],
            )

    def delete(self, conversation_id: str) -> int:
        with self._lock, self._db:
            return self._db.execute("DELETE FROM messages WHERE conversation_id = ?", (conversation_id,)).rowcount
