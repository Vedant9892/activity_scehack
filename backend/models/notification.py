from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


NotificationAction = Literal["deliver", "delay", "batch"]


class Notification(BaseModel):
    id: int
    user_id: str
    title: str
    message: str
    importance: str = "medium"
    action: NotificationAction
    created_at: datetime = Field(default_factory=datetime.utcnow)


class NotificationSnapshot(BaseModel):
    delayed: list[Notification]
    delivered: list[Notification]
    pending_count: int
