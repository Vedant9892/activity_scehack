import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.websocket_manager import websocket_manager
from db.mongodb import close_mongodb, init_mongodb
from db.redis_client import close_redis, init_redis, start_pubsub_listener
from routes.activity import router as activity_router
from routes.notifications import router as notifications_router
from routes.state import router as state_router
from routes.websocket import router as websocket_router
from services.notification_engine import notification_engine

app = FastAPI(title=settings.app_name, version=settings.app_version)

# Allow extension and local web app calls during hackathon development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(activity_router)
app.include_router(state_router)
app.include_router(notifications_router)
app.include_router(websocket_router)


@app.on_event("startup")
async def startup_event() -> None:
    await init_mongodb()
    await init_redis()

    asyncio.create_task(start_pubsub_listener(websocket_manager.broadcast_json))
    asyncio.create_task(notification_engine.start_simulator())


@app.on_event("shutdown")
async def shutdown_event() -> None:
    await close_redis()
    await close_mongodb()


@app.get("/")
def health() -> dict[str, str]:
    return {"status": "running", "service": settings.app_name}
