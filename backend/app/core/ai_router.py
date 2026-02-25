from typing import Dict, Any, Optional, List
from enum import Enum
from loguru import logger
import asyncio

from app.integrations.base import BaseProvider, ProviderStatus
from app.integrations.huggingface import HuggingFaceProvider
from app.integrations.openai import OpenAIProvider
from app.integrations.jimeng import JimengProvider
from app.integrations.kling import KlingProvider
from app.integrations.suno import SunoProvider
from app.integrations.minimax import MinimaxProvider

from app.config import get_settings
from app.core.router import MODEL_PRIORITIES

settings = get_settings()


class TaskType(str, Enum):
    IMAGE_GENERATION = "image_generation"
    VIDEO_GENERATION = "video_generation"
    MUSIC_GENERATION = "music_generation"
    TTS = "tts"


class AIRequest:
    """AI request wrapper with metadata"""
    def __init__(
        self,
        task_type: TaskType,
        params: Dict[str, Any],
        fallback_enabled: bool = True,
    ):
        self.task_type = task_type
        self.params = params
        self.fallback_enabled = fallback_enabled
        self.attempted_providers: List[str] = []
        self.success_provider: Optional[str] = None


class AIRouter:
    """
    AI Router - Intelligent routing for multiple AI providers
    Implements priority-based routing with automatic fallback
    """

    def __init__(self):
        self.providers: Dict[str, BaseProvider] = {}
        self._initialized = False

    async def initialize(self):
        """Initialize all available providers"""
        if self._initialized:
            return

        logger.info("Initializing AI Router...")

        # Initialize HuggingFace if API key is provided
        if settings.huggingface_api_key:
            try:
                self.providers["huggingface"] = HuggingFaceProvider(
                    api_key=settings.huggingface_api_key,
                    timeout=60
                )
                logger.info("HuggingFace provider initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize HuggingFace: {e}")

        # Initialize OpenAI if API key is provided
        if settings.openai_api_key:
            try:
                self.providers["openai"] = OpenAIProvider(
                    api_key=settings.openai_api_key,
                    timeout=120
                )
                logger.info("OpenAI provider initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI: {e}")

        # Initialize Jimeng if API key is provided
        if settings.jimeng_api_key:
            try:
                self.providers["jimeng"] = JimengProvider(
                    api_key=settings.jimeng_api_key,
                    timeout=180
                )
                logger.info("Jimeng provider initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Jimeng: {e}")

        # Initialize Kling if API key is provided
        if settings.kling_api_key:
            try:
                self.providers["kling"] = KlingProvider(
                    api_key=settings.kling_api_key,
                    timeout=300
                )
                logger.info("Kling provider initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Kling: {e}")

        # Initialize Suno if API key is provided
        if settings.suno_api_key:
            try:
                self.providers["suno"] = SunoProvider(
                    api_key=settings.suno_api_key,
                    timeout=300
                )
                logger.info("Suno provider initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Suno: {e}")

        # Initialize Minimax if API key is provided
        if settings.minimax_api_key:
            try:
                self.providers["minimax"] = MinimaxProvider(
                    api_key=settings.minimax_api_key,
                    timeout=120
                )
                logger.info("Minimax provider initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Minimax: {e}")

        # Run health checks
        await self._health_check_all()

        self._initialized = True
        logger.info(f"AI Router initialized with {len(self.providers)} providers")

    async def _health_check_all(self):
        """Run health check on all providers"""
        for name, provider in self.providers.items():
            try:
                is_healthy = await provider.health_check()
                logger.info(f"{name} health check: {'OK' if is_healthy else 'FAILED'}")
            except Exception as e:
                logger.error(f"{name} health check error: {e}")

    async def route(
        self,
        task_type: TaskType,
        params: Dict[str, Any],
        fallback_enabled: bool = True,
    ) -> Dict[str, Any]:
        """
        Route request to best available provider
        """
        if not self._initialized:
            await self.initialize()

        request = AIRequest(task_type, params, fallback_enabled)

        # Get provider priority list for this task type
        priority_list = MODEL_PRIORITIES.get(task_type.value, [])

        if not priority_list:
            raise ValueError(f"No priority configuration for task type: {task_type}")

        # Try providers in priority order
        for provider_config in priority_list:
            provider_name = provider_config["provider"]

            # Skip fallback-only providers if not in fallback mode
            if provider_config.get("fallback_only") and not request.fallback_enabled:
                continue

            # Check if provider is initialized
            if provider_name not in self.providers:
                logger.warning(f"Provider {provider_name} not initialized, skipping")
                continue

            # Check if provider is healthy
            provider = self.providers[provider_name]
            if provider.status != ProviderStatus.HEALTHY:
                logger.warning(f"Provider {provider_name} is {provider.status}, skipping")
                continue

            # Check if provider supports this task
            if not provider.supports_task(task_type.value):
                logger.warning(f"Provider {provider_name} doesn't support {task_type}, skipping")
                continue

            try:
                logger.info(f"Routing to provider: {provider_name}")

                # Execute request
                result = await self._execute_provider(provider, task_type, params)

                request.success_provider = provider_name
                request.attempted_providers.append(provider_name)

                # Add routing metadata
                result["routing"] = {
                    "provider": provider_name,
                    "model": provider_config.get("model"),
                    "cost": provider_config.get("cost"),
                    "fallback_used": len(request.attempted_providers) > 1,
                }

                # Log if fallback was used
                if len(request.attempted_providers) > 1:
                    logger.info(f"Request completed after {len(request.attempted_providers)} attempts")
                    result["routing"]["message"] = f"Successfully switched to {provider_name}"

                return result

            except Exception as e:
                logger.error(f"Provider {provider_name} failed: {str(e)}")
                provider.record_failure()
                request.attempted_providers.append(provider_name)

                # Continue to next provider if fallback is enabled
                if not request.fallback_enabled:
                    raise

        # All providers failed
        error_msg = f"All providers failed. Attempted: {request.attempted_providers}"
        logger.error(error_msg)
        raise Exception(error_msg)

    async def _execute_provider(
        self,
        provider: BaseProvider,
        task_type: TaskType,
        params: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Execute request on specific provider"""
        async with provider:
            if task_type == TaskType.IMAGE_GENERATION:
                if params.get("source_image"):
                    return await provider.image_to_image(
                        image_url=params["source_image"],
                        prompt=params["prompt"],
                        **{k: v for k, v in params.items() if k not in ["source_image", "prompt"]}
                    )
                else:
                    return await provider.generate_image(**params)

            elif task_type == TaskType.VIDEO_GENERATION:
                if params.get("source_image"):
                    return await provider.image_to_video(
                        image_url=params["source_image"],
                        **{k: v for k, v in params.items() if k != "source_image"}
                    )
                elif params.get("source_video"):
                    if params.get("scale_factor"):
                        return await provider.upscaling(
                            video_url=params["source_video"],
                            **{k: v for k, v in params.items() if k != "source_video"}
                        )
                    else:
                        return await provider.video_to_video(
                            source_video_url=params["source_video"],
                            **{k: v for k, v in params.items() if k != "source_video"}
                        )
                else:
                    return await provider.generate_video(**params)

            elif task_type == TaskType.MUSIC_GENERATION:
                return await provider.generate_music(**params)

            elif task_type == TaskType.TTS:
                if params.get("reference_audio_url"):
                    return await provider.voice_clone(
                        reference_audio_url=params["reference_audio_url"],
                        text=params["text"],
                        **{k: v for k, v in params.items() if k not in ["reference_audio_url", "text"]}
                    )
                else:
                    return await provider.text_to_speech(**params)

            else:
                raise ValueError(f"Unsupported task type: {task_type}")

    async def get_provider_status(self) -> Dict[str, str]:
        """Get status of all providers"""
        if not self._initialized:
            await self.initialize()

        return {
            name: provider.status.value
            for name, provider in self.providers.items()
        }

    async def close(self):
        """Close all providers"""
        for provider in self.providers.values():
            try:
                await provider.close()
            except Exception as e:
                logger.error(f"Error closing provider: {e}")


# Global router instance
_router: Optional[AIRouter] = None


async def get_router() -> AIRouter:
    """Get or create global router instance"""
    global _router
    if _router is None:
        _router = AIRouter()
        await _router.initialize()
    return _router
