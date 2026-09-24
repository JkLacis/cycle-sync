"""Request validation for POST /api/coach. Unknown fields are rejected."""

from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

MESSAGE_MAX_CHARS = 1000

Phase = Literal["menstrual", "follicular", "ovulatory", "luteal"]
Level = Literal["high", "good", "moderate", "low"]
TIME = r"^([01]\d|2[0-3]):[0-5]\d$"
CONVERSATION_ID = r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"


class Strict(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class Task(Strict):
    title: str = Field(max_length=60)
    start: str = Field(pattern=TIME)
    end: str = Field(pattern=TIME)
    type: str = Field(max_length=40)
    level: Level


class CheckIn(Strict):
    date: date
    energy: int | None = Field(default=None, ge=0, le=10)
    mood: Literal["Low", "Okay", "Good", "Great"] | None = None
    focus: Literal["Low", "Medium", "High"] | None = None
    sleep: Literal["<8h", "8h", ">8h"] | None = None


class CoachContext(Strict):
    """What the app knows about today. Computed on the device; never contains name or email."""

    date: date
    cycle_day: int = Field(ge=1, le=35)
    cycle_length: int = Field(ge=21, le=35)
    period_length: int = Field(ge=2, le=7)
    phase: Phase
    phase_days: str = Field(max_length=20)  # e.g. "Days 13–15"
    next_phase: Phase
    next_phase_in_days: int = Field(ge=1, le=35)
    score: int | None = Field(default=None, ge=0, le=100)
    tasks: list[Task] = Field(default_factory=list, max_length=12)
    checkins: list[CheckIn] = Field(default_factory=list, max_length=7)


class CoachRequest(Strict):
    conversation_id: str = Field(pattern=CONVERSATION_ID)
    message: str = Field(min_length=1, max_length=MESSAGE_MAX_CHARS)
    # Optional: without it the coach answers generally (the prompt covers missing context).
    context: CoachContext | None = None
