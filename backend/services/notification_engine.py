import asyncio
import random
from datetime import datetime, timedelta

from core.config import settings
from db.mongodb import insert_notification_history
from db.redis_client import (
    get_current_state,
    get_notifications,
    pop_all_notifications,
    publish_update,
    push_notification,
    replace_notifications_queue,
)
from models.notification import Notification
from services.gemini_service import summarize_notifications


class NotificationEngine:
    def __init__(self) -> None:
        self._counter = 1

    def _next_id(self) -> int:
        current = self._counter
        self._counter += 1
        return current

    @staticmethod
    def decide_action(focus_state: str) -> str:
        if focus_state == "idle":
            return "deliver"
        if focus_state == "distracted":
            return "batch"
        return "delay"

    async def process_notification(
        self,
        *,
        user_id: str,
        focus_state: str,
        title: str,
        message: str,
        importance: str = "medium",
    ) -> Notification:
        action = self.decide_action(focus_state)
        notification = Notification(
            id=self._next_id(),
            user_id=user_id,
            title=title,
            message=message,
            importance=importance,
            action=action,
            created_at=datetime.utcnow(),
        )

        if action == "deliver":
            flushed = await pop_all_notifications("delayed", user_id)
            for item in flushed:
                await push_notification("delivered", user_id, item)
            await push_notification("delivered", user_id, notification.model_dump(mode="json"))
        else:
            await push_notification("delayed", user_id, notification.model_dump(mode="json"))

        await insert_notification_history(notification.model_dump(mode="json"))
        await self.publish_notification_update(user_id=user_id)
        return notification

    async def publish_notification_update(self, *, user_id: str) -> None:
        delayed = await get_notifications("delayed", user_id, limit=50)
        delivered = await get_notifications("delivered", user_id, limit=50)
        summary = await summarize_notifications(delayed[:10] + delivered[:10])

        await publish_update(
            {
                "type": "notifications_update",
                "user_id": user_id,
                "delayed": delayed,
                "delivered": delivered,
                "pending_count": len(delayed),
                "summary": summary,
            }
        )

    async def snooze_notification(self, *, user_id: str, notification_id: int, minutes: int) -> dict:
        delayed = await get_notifications("delayed", user_id, limit=200)
        delivered = await get_notifications("delivered", user_id, limit=200)

        target = None

        updated_delayed: list[dict] = []
        for item in delayed:
            if int(item.get("id", -1)) == notification_id and target is None:
                target = item
                continue
            updated_delayed.append(item)

        updated_delivered: list[dict] = []
        for item in delivered:
            if int(item.get("id", -1)) == notification_id and target is None:
                target = item
                continue
            updated_delivered.append(item)

        if target is None:
            return {"status": "not_found", "notification_id": notification_id}

        snoozed_until = (datetime.utcnow() + timedelta(minutes=minutes)).isoformat()
        target["action"] = "snoozed"
        target["snoozed_until"] = snoozed_until

        updated_delayed.insert(0, target)

        await replace_notifications_queue("delayed", user_id, updated_delayed)
        await replace_notifications_queue("delivered", user_id, updated_delivered)
        await self.publish_notification_update(user_id=user_id)

        return {
            "status": "ok",
            "notification_id": notification_id,
            "snoozed_until": snoozed_until,
        }

    async def start_simulator(self) -> None:
        templates = [
            "Team message requires your response",
            "Build completed with warnings",
            "Calendar reminder for upcoming meeting",
            "Product analytics spike detected",
            "Code review request is waiting",
        ]
        while True:
            await asyncio.sleep(settings.simulator_interval_seconds)
            message = random.choice(templates)
            importance = random.choice(["low", "medium", "high"])

            state = await get_current_state("demo-user")
            focus_state = (state or {}).get("focus_state", "focused")

            await self.process_notification(
                user_id="demo-user",
                focus_state=focus_state,
                title="Incoming Notification",
                message=message,
                importance=importance,
            )


notification_engine = NotificationEngine()
