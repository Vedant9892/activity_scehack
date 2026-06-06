import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass
class Settings:
    # App
    app_name: str = os.getenv("APP_NAME", "AI Context-Aware Notification Backend")
    app_version: str = os.getenv("APP_VERSION", "1.0.0")
    backend_host: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    backend_port: int = int(os.getenv("BACKEND_PORT", "8000"))

    # Data stores
    mongo_uri: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    mongo_db_name: str = os.getenv("MONGO_DB_NAME", "context_notifier")
    redis_host: str = os.getenv("REDIS_HOST", "localhost")
    redis_port: int = int(os.getenv("REDIS_PORT", "6379"))
    redis_db: int = int(os.getenv("REDIS_DB", "0"))

    # AI
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    # Rules
    idle_threshold_seconds: int = int(os.getenv("IDLE_THRESHOLD_SECONDS", "30"))
    high_tab_switch_threshold: int = int(os.getenv("HIGH_TAB_SWITCH_THRESHOLD", "5"))
    simulator_interval_seconds: int = int(os.getenv("SIMULATOR_INTERVAL_SECONDS", "10"))

    # Channels/keys
    redis_channel_updates: str = os.getenv("REDIS_CHANNEL_UPDATES", "casn:updates")


settings = Settings()
