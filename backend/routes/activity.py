from fastapi import APIRouter

from db.mongodb import insert_activity_log, insert_state_history
from db.redis_client import get_notifications, publish_update, set_current_state
from models.user_state import ActivityPayload
from services.context_engine import context_engine

router = APIRouter(prefix="", tags=["activity"])


@router.post("/activity")
async def post_activity(payload: ActivityPayload) -> dict:
    state = context_engine.compute_state(payload)

    # Persist source activity and derived context for analytics/history.
    await insert_activity_log(payload.model_dump(mode="json"))
    await insert_state_history(state.model_dump(mode="json"))

    await set_current_state(payload.user_id, state.model_dump(mode="json"))

    delayed = await get_notifications("delayed", payload.user_id, limit=200)

    await publish_update(
        {
            "type": "state_update",
            "user_id": payload.user_id,
            "state": state.model_dump(mode="json"),
            "pending_count": len(delayed),
        }
    )

    return {
        "status": "ok",
        "focus_state": state.focus_state,
        "pending_notifications": len(delayed),
        "state": state.model_dump(mode="json"),
    }
