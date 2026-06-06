from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from core.config import settings

_mongo_client: AsyncIOMotorClient | None = None
_mongo_db: AsyncIOMotorDatabase | None = None


async def init_mongodb() -> None:
    global _mongo_client, _mongo_db
    _mongo_client = AsyncIOMotorClient(settings.mongo_uri, serverSelectionTimeoutMS=3000)
    _mongo_db = _mongo_client[settings.mongo_db_name]


async def close_mongodb() -> None:
    global _mongo_client
    if _mongo_client is not None:
        _mongo_client.close()
        _mongo_client = None


def get_mongo_db() -> AsyncIOMotorDatabase:
    if _mongo_db is None:
        raise RuntimeError("MongoDB is not initialized")
    return _mongo_db


async def insert_activity_log(payload: dict) -> None:
    try:
        db = get_mongo_db()
        await db.activity_logs.insert_one(payload)
    except Exception:
        return


async def insert_state_history(payload: dict) -> None:
    try:
        db = get_mongo_db()
        await db.state_history.insert_one(payload)
    except Exception:
        return


async def insert_notification_history(payload: dict) -> None:
    try:
        db = get_mongo_db()
        await db.notification_history.insert_one(payload)
    except Exception:
        return
