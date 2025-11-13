from functools import lru_cache
from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: str = Field(default="development", alias="APP_ENV")
    secret_key: str = Field(default="change-me", alias="APP_SECRET_KEY")
    database_url: str = Field(default="sqlite+aiosqlite:///./data/app.db", alias="DATABASE_URL")
    sync_database_url: str = Field(default="sqlite:///./data/app.db", alias="SYNC_DATABASE_URL")
    cors_allowed_origins: List[str] = Field(
        default_factory=lambda: [
            "http://localhost",
            "http://localhost:5173",
            "http://127.0.0.1",
            "http://127.0.0.1:5173",
            "tauri://localhost",
            "capacitor://localhost",
        ],
        alias="CORS_ALLOWED_ORIGINS",
    )
    encryption_key: Optional[str] = Field(default=None, alias="ENCRYPTION_KEY")
    dashboard_cache_ttl: int = Field(default=180, alias="DASHBOARD_CACHE_TTL")
    default_profile_seed_path: str = Field(default="seed_data/primer_perfil.json")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

