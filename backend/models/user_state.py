from datetime import datetime

from pydantic import BaseModel, Field


class ActivityPayload(BaseModel):
    user_id: str = "demo-user"
    active_url: str = ""
    tab_switch_count: int = 0
    tab_switches_last_5s: int = 0
    idle_seconds: int = 0
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class UserState(BaseModel):
    user_id: str
    focus_state: str
    active_url: str
    tab_switch_count: int
    tab_switches_last_5s: int
    idle_seconds: int
    activity_frequency: float
    updated_at: datetime = Field(default_factory=datetime.utcnow)
