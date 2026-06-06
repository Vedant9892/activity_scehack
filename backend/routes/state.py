from datetime import datetime

from fastapi import APIRouter

from db.redis_client import get_current_state

router = APIRouter(prefix="", tags=["state"])


@router.get("/state")
async def get_state(user_id: str = "demo-user") -> dict:
    state = await get_current_state(user_id)
    if state:
        return state

    return {
        "user_id": user_id,
        "focus_state": "focused",
        "active_url": "",
        "tab_switch_count": 0,
        "tab_switches_last_5s": 0,
        "idle_seconds": 0,
        "activity_frequency": 0,
        "updated_at": datetime.utcnow().isoformat(),
    }
