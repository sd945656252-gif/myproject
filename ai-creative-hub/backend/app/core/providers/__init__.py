"""
AI Provider - Provider factory and initialization.
"""
from typing import Optional

from loguru import logger

from app.config import settings
from app.core.ai_router.base import BaseProvider, ProviderType
from app.core.ai_router.config import get_provider_configs
from app.core.providers.huggingface import HuggingFaceProvider
from app.core.providers.comfyui import ComfyUIProvider
from app.core.providers.openai import OpenAIProvider
from app.core.providers.kling import KlingProvider
from app.core.providers.suno import SunoProvider
from app.core.providers.minimax import MinimaxProvider


# Provider class mapping
PROVIDER_CLASSES = {
    ProviderType.HUGGINGFACE: HuggingFaceProvider,
    ProviderType.COMFYUI: ComfyUIProvider,
    ProviderType.OPENAI: OpenAIProvider,
    ProviderType.KLING: KlingProvider,
    ProviderType.SUNO: SunoProvider,
    ProviderType.MINIMAX: MinimaxProvider,
    # TODO: Add more providers as implemented
    # ProviderType.JIMENG: JimengProvider,
    # ProviderType.VIDU: ViduProvider,
}


async def initialize_providers() -> list[BaseProvider]:
    """Initialize all configured providers."""
    providers = []
    configs = get_provider_configs()

    for provider_type, config in configs.items():
        if not config.enabled:
            logger.debug(f"Provider {provider_type} is disabled")
            continue

        provider_class = PROVIDER_CLASSES.get(provider_type)
        if not provider_class:
            logger.warning(f"No implementation for provider {provider_type}")
            continue

        try:
            provider = provider_class(config)
            if await provider.health_check():
                providers.append(provider)
                logger.info(f"Initialized provider: {provider_type}")
            else:
                logger.warning(f"Provider {provider_type} health check failed")
        except Exception as e:
            logger.error(f"Failed to initialize provider {provider_type}: {e}")

    return providers


def get_provider(provider_type: ProviderType) -> Optional[BaseProvider]:
    """Get a specific provider instance by type."""
    configs = get_provider_configs()
    config = configs.get(provider_type)

    if not config or not config.enabled:
        return None

    provider_class = PROVIDER_CLASSES.get(provider_type)
    if not provider_class:
        return None

    return provider_class(config)
