from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from enum import Enum
import asyncio
from loguru import logger


class ProviderStatus(str, Enum):
    """Provider health status"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"


class BaseProvider(ABC):
    """
    Abstract base class for all AI API providers
    All providers must implement these methods
    """

    def __init__(self, api_key: str, timeout: int = 60):
        self.api_key = api_key
        self.timeout = timeout
        self._status = ProviderStatus.HEALTHY
        self._failure_count = 0
        self._last_check = None

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Provider name identifier"""
        pass

    @property
    @abstractmethod
    def supported_tasks(self) -> List[str]:
        """List of supported task types"""
        pass

    @property
    def status(self) -> ProviderStatus:
        """Get current provider status"""
        return self._status

    @abstractmethod
    async def health_check(self) -> bool:
        """
        Check if provider API is accessible
        Returns True if healthy, False otherwise
        """
        pass

    @abstractmethod
    async def generate_image(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: int = 1024,
        height: int = 1024,
        **kwargs
    ) -> Dict[str, Any]:
        """Generate image from text prompt"""
        pass

    @abstractmethod
    async def generate_video(
        self,
        prompt: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Generate video from text prompt"""
        pass

    async def image_to_image(
        self,
        image_url: str,
        prompt: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Generate image from image (optional, override if supported)"""
        raise NotImplementedError(f"{self.provider_name} does not support image-to-image")

    async def generate_text(
        self,
        prompt: str,
        **kwargs
    ) -> str:
        """Generate text completion (optional, override if supported)"""
        raise NotImplementedError(f"{self.provider_name} does not support text generation")

    def record_failure(self):
        """Record a failure for health tracking"""
        self._failure_count += 1
        if self._failure_count >= 3:
            self._status = ProviderStatus.UNHEALTHY
            logger.warning(f"Provider {self.provider_name} marked as UNHEALTHY")
        elif self._failure_count >= 1:
            self._status = ProviderStatus.DEGRADED

    def record_success(self):
        """Record a successful request"""
        self._failure_count = max(0, self._failure_count - 1)
        if self._failure_count == 0:
            self._status = ProviderStatus.HEALTHY

    def supports_task(self, task_type: str) -> bool:
        """Check if provider supports a specific task type"""
        return task_type in self.supported_tasks

    async def __aenter__(self):
        """Async context manager entry"""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if exc_type is not None:
            self.record_failure()
        else:
            self.record_success()
