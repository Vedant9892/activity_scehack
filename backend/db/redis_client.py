import json
from collections.abc import Awaitable, Callable

import redis.asyncio as redis

from core.config import settings

_redis_client: redis.Redis | None = None


def _key_current_state(user_id: str) -> str:
    return f"casn:state:{user_id}"


def _key_queue(queue_name: str, user_id: str) -> str:
    return f"casn:queue:{queue_name}:{user_id}"


async def init_redis() -> None:
    global _redis_client
    _redis_client = redis.Redis(
        host=settings.redis_host,
        port=settings.redis_port,
        db=settings.redis_db,
        decode_responses=True,
    )
    await _redis_client.ping()


async def close_redis() -> None:
    global _redis_client
    if _redis_client is not None:
        await _redis_client.close()
        _redis_client = None


def get_redis() -> redis.Redis:
    if _redis_client is None:
        raise RuntimeError("Redis is not initialized")
    return _redis_client


async def set_current_state(user_id: str, state_payload: dict) -> None:
    await get_redis().set(_key_current_state(user_id), json.dumps(state_payload))


async def get_current_state(user_id: str) -> dict | None:
    raw = await get_redis().get(_key_current_state(user_id))
    return json.loads(raw) if raw else None


async def push_notification(queue_name: str, user_id: str, notification: dict) -> None:
    await get_redis().lpush(_key_queue(queue_name, user_id), json.dumps(notification))


async def get_notifications(queue_name: str, user_id: str, limit: int = 50) -> list[dict]:
    items = await get_redis().lrange(_key_queue(queue_name, user_id), 0, limit - 1)
    return [json.loads(item) for item in items]


async def replace_notifications_queue(queue_name: str, user_id: str, items: list[dict]) -> None:
    redis_client = get_redis()
    queue_key = _key_queue(queue_name, user_id)

    await redis_client.delete(queue_key)
    for item in reversed(items):
        await redis_client.lpush(queue_key, json.dumps(item))


async def pop_all_notifications(queue_name: str, user_id: str) -> list[dict]:
    redis_client = get_redis()
    queue_key = _key_queue(queue_name, user_id)
    items: list[dict] = []

    while True:
        item = await redis_client.rpop(queue_key)
        if item is None:
            break
        items.append(json.loads(item))

    return items


async def publish_update(payload: dict) -> None:
    await get_redis().publish(settings.redis_channel_updates, json.dumps(payload))


async def start_pubsub_listener(
    callback: Callable[[dict], Awaitable[None]],
) -> None:
    pubsub = get_redis().pubsub()
    await pubsub.subscribe(settings.redis_channel_updates)
    try:
        async for message in pubsub.listen():
            if message.get("type") != "message":
                continue

            try:
                payload = json.loads(message["data"])
            except Exception:
                continue

            await callback(payload)
    except Exception:
        # On reload/shutdown Redis can close connection abruptly; this is safe to ignore.
        return
