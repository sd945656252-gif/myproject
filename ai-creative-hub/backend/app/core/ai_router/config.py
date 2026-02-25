"""
AI Router - Provider configuration and priority management.
"""
from dataclasses import dataclass

from app.config import settings
from app.core.ai_router.base import ProviderConfig, ProviderType, TaskType


@dataclass
class ModelMapping:
    """Mapping of task types to preferred providers and models."""

    task_type: TaskType
    providers: list[ProviderType]  # Ordered by priority


# Provider configurations based on environment settings
def get_provider_configs() -> dict[ProviderType, ProviderConfig]:
    """Get provider configurations from settings."""
    return {
        ProviderType.HUGGINGFACE: ProviderConfig(
            provider=ProviderType.HUGGINGFACE,
            api_key=settings.huggingface_api_key,
            api_url=settings.huggingface_endpoint,
            models=[
                "stabilityai/stable-diffusion-xl-base-1.0",
                "runwayml/stable-diffusion-v1-5",
            ],
            enabled=bool(settings.huggingface_api_key),
            priority=10,  # High priority (free/open source)
        ),
        ProviderType.OPENAI: ProviderConfig(
            provider=ProviderType.OPENAI,
            api_key=settings.openai_api_key,
            api_url="https://api.openai.com/v1",
            models=["dall-e-3", "gpt-4-vision-preview", "gpt-4o"],
            enabled=bool(settings.openai_api_key),
            priority=20,
        ),
        ProviderType.JIMENG: ProviderConfig(
            provider=ProviderType.JIMENG,
            api_key=settings.jimeng_api_key,
            api_url=settings.jimeng_api_url,
            models=["jimeng-2.1", "seedance-2.0"],
            enabled=bool(settings.jimeng_api_key),
            priority=30,
        ),
        ProviderType.KLING: ProviderConfig(
            provider=ProviderType.KLING,
            api_key=settings.kling_api_key,
            api_url=settings.kling_api_url,
            models=["kling-3.0", "kling-o1"],
            enabled=bool(settings.kling_api_key),
            priority=35,
        ),
        ProviderType.MINIMAX: ProviderConfig(
            provider=ProviderType.MINIMAX,
            api_key=settings.minimax_api_key,
            api_url=settings.minimax_api_url,
            models=["speech-01", "voice-cloning"],
            enabled=bool(settings.minimax_api_key),
            priority=40,
        ),
        ProviderType.SUNO: ProviderConfig(
            provider=ProviderType.SUNO,
            api_key=settings.suno_api_key,
            api_url=settings.suno_api_url,
            models=["suno-v3", "suno-v3.5"],
            enabled=bool(settings.suno_api_key),
            priority=40,
        ),
        ProviderType.VIDU: ProviderConfig(
            provider=ProviderType.VIDU,
            api_key=settings.vidu_api_key,
            api_url=settings.vidu_api_url,
            models=["vidu-1.0"],
            enabled=bool(settings.vidu_api_key),
            priority=35,
        ),
        ProviderType.COMFYUI: ProviderConfig(
            provider=ProviderType.COMFYUI,
            api_url=settings.comfyui_url,
            models=["custom"],
            enabled=settings.comfyui_enabled,
            priority=100,  # Lowest priority (local fallback)
        ),
    }


# Task type to provider mapping (ordered by priority)
TASK_PROVIDER_MAP: dict[TaskType, list[ProviderType]] = {
    # Prompt
    TaskType.IMAGE_TO_PROMPT: [
        ProviderType.OPENAI,  # GPT-4V
        ProviderType.HUGGINGFACE,  # BLIP/LLaVA
    ],
    TaskType.PROMPT_OPTIMIZE: [
        ProviderType.OPENAI,  # GPT-4
        ProviderType.HUGGINGFACE,
    ],
    # Image
    TaskType.TEXT_TO_IMAGE: [
        ProviderType.HUGGINGFACE,  # SDXL (free)
        ProviderType.JIMENG,
        ProviderType.OPENAI,  # DALL-E
        ProviderType.COMFYUI,
    ],
    TaskType.IMAGE_TO_IMAGE: [
        ProviderType.HUGGINGFACE,
        ProviderType.JIMENG,
        ProviderType.COMFYUI,
    ],
    TaskType.CONTROLNET: [
        ProviderType.COMFYUI,  # Best local support
        ProviderType.HUGGINGFACE,
    ],
    TaskType.INPAINTING: [
        ProviderType.COMFYUI,
        ProviderType.HUGGINGFACE,
    ],
    TaskType.REMOVE_BACKGROUND: [
        ProviderType.HUGGINGFACE,
        ProviderType.COMFYUI,
    ],
    # Video
    TaskType.TEXT_TO_VIDEO: [
        ProviderType.JIMENG,  # Seedance
        ProviderType.KLING,
        ProviderType.VIDU,
        ProviderType.COMFYUI,
    ],
    TaskType.IMAGE_TO_VIDEO: [
        ProviderType.KLING,
        ProviderType.JIMENG,
        ProviderType.VIDU,
        ProviderType.COMFYUI,
    ],
    TaskType.VIDEO_TO_VIDEO: [
        ProviderType.KLING,
        ProviderType.JIMENG,
        ProviderType.COMFYUI,
    ],
    TaskType.VIDEO_UPSCALE: [
        ProviderType.COMFYUI,
        ProviderType.KLING,
    ],
    # Audio
    TaskType.MUSIC_GENERATE: [
        ProviderType.SUNO,
    ],
    TaskType.VOICE_SYNTHESIZE: [
        ProviderType.MINIMAX,
        ProviderType.OPENAI,  # TTS
    ],
    TaskType.VOICE_CLONE: [
        ProviderType.MINIMAX,
    ],
}


def get_providers_for_task(task_type: TaskType) -> list[ProviderType]:
    """Get ordered list of providers for a task type."""
    return TASK_PROVIDER_MAP.get(task_type, [])


def get_model_for_task(task_type: TaskType, provider: ProviderType) -> str | None:
    """Get the default model for a task type and provider."""
    configs = get_provider_configs()
    config = configs.get(provider)
    if config and config.models:
        return config.models[0]
    return None
