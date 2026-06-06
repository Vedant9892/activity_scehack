from datetime import datetime

from core.config import settings
from models.user_state import ActivityPayload, UserState


class ContextEngine:
    def __init__(self) -> None:
        self._last_seen: dict[str, datetime] = {}

    def compute_state(self, payload: ActivityPayload) -> UserState:
        previous_seen = self._last_seen.get(payload.user_id)
        self._last_seen[payload.user_id] = payload.timestamp

        if previous_seen is None:
            frequency = 1.0
        else:
            delta_seconds = (payload.timestamp - previous_seen).total_seconds()
            frequency = 1 / max(delta_seconds, 1)

        # Rule-based context classification for hackathon speed and explainability.
        if payload.idle_seconds > settings.idle_threshold_seconds:
            focus_state = "idle"
        elif payload.tab_switches_last_5s >= settings.high_tab_switch_threshold:
            focus_state = "distracted"
        elif frequency >= 0.15 and payload.idle_seconds < 10:
            focus_state = "focused"
        else:
            focus_state = "focused"

        return UserState(
            user_id=payload.user_id,
            focus_state=focus_state,
            active_url=payload.active_url,
            tab_switch_count=payload.tab_switch_count,
            tab_switches_last_5s=payload.tab_switches_last_5s,
            idle_seconds=payload.idle_seconds,
            activity_frequency=round(frequency, 3),
            updated_at=payload.timestamp,
        )


context_engine = ContextEngine()
