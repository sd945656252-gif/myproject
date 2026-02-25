"""
AI Router - Fallback strategy and retry logic.
"""
import asyncio
from dataclasses import dataclass
from typing import Optional

from loguru import logger
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

from app.core.ai_router.base import (
    BaseProvider,
    GenerationResult,
    ProviderType,
    TaskType,
)
from app.core.ai_router.config import get_provider_configs, get_providers_for_task


@dataclass
class FallbackResult:
    """Result of fallback execution."""

    result: GenerationResult
    providers_tried: list[ProviderType]
    fallback_occurred: bool
    original_provider: Optional[ProviderType] = None


class FallbackStrategy:
    """Handles fallback logic when primary provider fails."""

    def __init__(
        self,
        max_retries: int = 3,
        retry_delay: float = 1.0,
        fallback_enabled: bool = True,
    ):
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.fallback_enabled = fallback_enabled
        self.providers: dict[ProviderType, BaseProvider] = {}

    def register_provider(self, provider: BaseProvider) -> None:
        """Register a provider instance."""
        self.providers[provider.provider_type] = provider

    async def execute_with_fallback(
        self,
        task_type: TaskType,
        **kwargs,
    ) -> FallbackResult:
        """Execute task with automatic fallback on failure."""
        providers_tried: list[ProviderType] = []
        last_error: Optional[str] = None
        original_provider: Optional[ProviderType] = None

        # Get ordered providers for this task
        provider_types = get_providers_for_task(task_type)
        configs = get_provider_configs()

        if not provider_types:
            return FallbackResult(
                result=GenerationResult(
                    success=False,
                    error="No providers available for this task type",
                ),
                providers_tried=[],
                fallback_occurred=False,
            )

        for provider_type in provider_types:
            config = configs.get(provider_type)
            if not config or not config.enabled:
                continue

            provider = self.providers.get(provider_type)
            if not provider:
                logger.warning(f"Provider {provider_type} not registered")
                continue

            # Validate parameters first
            is_valid, validation_error = await provider.validate_params(
                task_type, **kwargs
            )
            if not is_valid:
                return FallbackResult(
                    result=GenerationResult(
                        success=False,
                        error=f"Parameter validation failed: {validation_error}",
                    ),
                    providers_tried=[],
                    fallback_occurred=False,
                )

            # Track original provider
            if not original_provider:
                original_provider = provider_type

            providers_tried.append(provider_type)

            try:
                # Try with retry logic
                result = await self._execute_with_retry(
                    provider, task_type, **kwargs
                )

                if result.success:
                    # Check if fallback was used
                    fallback_occurred = provider_type != original_provider
                    if fallback_occurred:
                        result.fallback_used = True
                        result.fallback_from = original_provider
                        logger.info(
                            f"Fallback succeeded: {original_provider} -> {provider_type}"
                        )

                    return FallbackResult(
                        result=result,
                        providers_tried=providers_tried,
                        fallback_occurred=fallback_occurred,
                        original_provider=original_provider,
                    )

                last_error = result.error
                logger.warning(
                    f"Provider {provider_type} failed: {result.error}"
                )

            except Exception as e:
                last_error = str(e)
                logger.error(f"Provider {provider_type} raised exception: {e}")

            # If fallback is disabled, stop after first provider
            if not self.fallback_enabled:
                break

            # Delay before trying next provider
            if self.retry_delay > 0:
                await asyncio.sleep(self.retry_delay)

        # All providers failed
        return FallbackResult(
            result=GenerationResult(
                success=False,
                error=f"All providers failed. Last error: {last_error}",
            ),
            providers_tried=providers_tried,
            fallback_occurred=len(providers_tried) > 1,
            original_provider=original_provider,
        )

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type(Exception),
        reraise=True,
    )
    async def _execute_with_retry(
        self,
        provider: BaseProvider,
        task_type: TaskType,
        **kwargs,
    ) -> GenerationResult:
        """Execute with exponential backoff retry."""
        return await provider.generate(task_type, **kwargs)


class FallbackNotification:
    """Generates user-friendly fallback notifications."""

    PROVIDER_NAMES = {
        ProviderType.HUGGINGFACE: "HuggingFace",
        ProviderType.OPENAI: "OpenAI",
        ProviderType.JIMENG: "即梦",
        ProviderType.KLING: "可灵",
        ProviderType.MINIMAX: "Minimax",
        ProviderType.SUNO: "Suno",
        ProviderType.VIDU: "Vidu",
        ProviderType.COMFYUI: "本地 ComfyUI",
    }

    @classmethod
    def generate_message(cls, fallback_result: FallbackResult) -> Optional[str]:
        """Generate a notification message for fallback."""
        if not fallback_result.fallback_occurred:
            return None

        original = cls.PROVIDER_NAMES.get(
            fallback_result.original_provider, "原服务"
        )
        current = cls.PROVIDER_NAMES.get(
            fallback_result.providers_tried[-1], "备用服务"
        )

        return f"{original} 调用失败，已为您无缝切换至 {current}"
