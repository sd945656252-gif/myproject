"""
AI Router - Main router module that orchestrates AI providers.
"""
from typing import Any, Optional

from loguru import logger

from app.core.ai_router.base import GenerationResult, ProviderType, TaskType
from app.core.ai_router.config import get_provider_configs, get_providers_for_task
from app.core.ai_router.fallback import (
    FallbackNotification,
    FallbackResult,
    FallbackStrategy,
)
from app.core.ai_router.validator import ParameterValidator


class AIRouter:
    """Main AI Router that orchestrates provider selection and fallback."""

    def __init__(self):
        self.fallback_strategy = FallbackStrategy()
        self._providers_initialized = False

    async def initialize(self) -> None:
        """Initialize the router and load providers."""
        if self._providers_initialized:
            return

        # Import providers here to avoid circular imports
        from app.core.providers import initialize_providers

        providers = await initialize_providers()
        for provider in providers:
            self.fallback_strategy.register_provider(provider)

        self._providers_initialized = True
        logger.info("AI Router initialized with providers")

    async def generate(
        self,
        task_type: TaskType,
        validate: bool = True,
        **kwargs,
    ) -> tuple[GenerationResult, Optional[str]]:
        """Generate content with automatic provider selection and fallback.

        Args:
            task_type: Type of generation task
            validate: Whether to validate parameters before execution
            **kwargs: Task-specific parameters

        Returns:
            Tuple of (generation_result, notification_message)
        """
        # Ensure router is initialized
        if not self._providers_initialized:
            await self.initialize()

        # Validate parameters
        if validate:
            is_valid, error = ParameterValidator.validate(task_type, **kwargs)
            if not is_valid:
                logger.warning(f"Parameter validation failed: {error}")
                return GenerationResult(
                    success=False,
                    error=error,
                ), None

        # Execute with fallback
        fallback_result = await self.fallback_strategy.execute_with_fallback(
            task_type, **kwargs
        )

        # Generate notification if fallback occurred
        notification = FallbackNotification.generate_message(fallback_result)

        return fallback_result.result, notification

    async def get_available_providers(self, task_type: TaskType) -> list[ProviderType]:
        """Get list of available providers for a task type."""
        provider_types = get_providers_for_task(task_type)
        configs = get_provider_configs()

        available = []
        for pt in provider_types:
            config = configs.get(pt)
            if config and config.enabled:
                available.append(pt)

        return available

    def get_missing_params(self, task_type: TaskType, **kwargs) -> list[str]:
        """Get list of missing required parameters."""
        return ParameterValidator.get_missing_params(task_type, **kwargs)

    def get_param_suggestions(self, task_type: TaskType) -> dict[str, str]:
        """Get suggestions for missing parameters."""
        return ParameterValidator.get_param_suggestions(task_type)


# Global router instance
router = AIRouter()


async def get_router() -> AIRouter:
    """Get the global router instance."""
    if not router._providers_initialized:
        await router.initialize()
    return router
