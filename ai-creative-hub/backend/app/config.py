"""
Application configuration management.
"""
from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "AI Creative Hub"
    app_version: str = "0.1.0"
    debug: bool = False
    secret_key: str = "your-super-secret-key-change-in-production"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ai_creative_hub"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Celery
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    # Storage (S3/MinIO)
    s3_endpoint: Optional[str] = None
    s3_access_key: Optional[str] = None
    s3_secret_key: Optional[str] = None
    s3_bucket: str = "ai-creative-assets"
    s3_region: str = "us-east-1"

    # AI Providers - OpenAI
    openai_api_key: Optional[str] = None
    openai_org_id: Optional[str] = None

    # AI Providers - HuggingFace
    huggingface_api_key: Optional[str] = None
    huggingface_endpoint: Optional[str] = None

    # AI Providers - 即梦 (字节跳动)
    jimeng_api_key: Optional[str] = None
    jimeng_api_url: str = "https://api.jimeng.ai"

    # AI Providers - 可灵 (快手)
    kling_api_key: Optional[str] = None
    kling_api_url: str = "https://api.kling.ai"

    # AI Providers - Minimax
    minimax_api_key: Optional[str] = None
    minimax_group_id: Optional[str] = None
    minimax_api_url: str = "https://api.minimax.chat"

    # AI Providers - Suno
    suno_api_key: Optional[str] = None
    suno_api_url: str = "https://api.suno.ai"

    # AI Providers - Vidu
    vidu_api_key: Optional[str] = None
    vidu_api_url: str = "https://api.vidu.ai"

    # ComfyUI (Local)
    comfyui_url: str = "http://localhost:8188"
    comfyui_enabled: bool = False

    # Logging
    log_level: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
