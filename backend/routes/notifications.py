from fastapi import APIRouter
from pydantic import BaseModel, Field

from db.redis_client import get_notifications
from services.gemini_service import summarize_notifications
from services.notification_engine import notification_engine

router = APIRouter(prefix="", tags=["notifications"])


class SnoozeRequest(BaseModel):
    user_id: str = "demo-user"
    notification_id: int
    minutes: int = Field(default=10, ge=1, le=240)


@router.get("/notifications")
async def get_notification_snapshot(user_id: str = "demo-user") -> dict:
    delayed = await get_notifications("delayed", user_id, limit=50)
    delivered = await get_notifications("delivered", user_id, limit=50)

    return {
        "delayed": delayed,
        "delivered": delivered,
        "pending_count": len(delayed),
    }


@router.get("/notifications/summary")
async def get_notifications_summary(user_id: str = "demo-user") -> dict:
    delayed = await get_notifications("delayed", user_id, limit=20)
    delivered = await get_notifications("delivered", user_id, limit=20)
    summary = await summarize_notifications(delayed + delivered)

    return {"summary": summary}


@router.post("/notifications/simulate")
async def simulate_notification(user_id: str = "demo-user") -> dict:
    notification = await notification_engine.process_notification(
        user_id=user_id,
        focus_state="focused",
        title="Manual Simulation",
        message="Manual test notification generated from API.",
        importance="medium",
    )

    return {"status": "ok", "notification": notification.model_dump(mode="json")}


@router.post("/notifications/snooze")
async def snooze_notification(payload: SnoozeRequest) -> dict:
    result = await notification_engine.snooze_notification(
        user_id=payload.user_id,
        notification_id=payload.notification_id,
        minutes=payload.minutes,
    )
    return result
