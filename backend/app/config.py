from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List, Union


class Settings(BaseSettings):
    # Application
    app_name: str = "AI Creative Hub"
    app_version: str = "0.1.0"
    app_env: str = "development"
    debug: bool = True

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = 4

    # Database
    database_url: str
    database_test_url: str

    # Redis
    redis_url: str

    # Celery
    celery_broker_url: str
    celery_result_backend: str

    # CORS - Support both list and comma-separated string
    cors_origins: Union[List[str], str] = ["http://localhost:3000"]
    cors_allow_credentials: bool = True

    # AI API Keys
    openai_api_key: str = ""
    huggingface_api_key: str = ""
    jimeng_api_key: str = ""
    kling_api_key: str = ""
    suno_api_key: str = ""
    minimax_api_key: str = ""

    # ComfyUI
    comfyui_host: str = "localhost"
    comfyui_port: int = 8188
    comfyui_api_url: str = "http://localhost:8188"

    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # File Storage
    upload_dir: str = "./uploads"
    output_dir: str = "./outputs"
    max_upload_size: int = 10485760  # 10MB

    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def comfyui_ws_url(self) -> str:
        return f"ws://{self.comfyui_host}:{self.comfyui_port}/ws"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
