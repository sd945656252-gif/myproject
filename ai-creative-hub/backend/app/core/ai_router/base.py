"""
AI Router - Base classes and interfaces for AI providers.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Optional


class ProviderType(str, Enum):
    """AI provider types."""

    HUGGINGFACE = "huggingface"
    OPENAI = "openai"
    JIMENG = "jimeng"
    KLING = "kling"
    MINIMAX = "minimax"
    SUNO = "suno"
    VIDU = "vidu"
    COMFYUI = "comfyui"


class TaskType(str, Enum):
    """Task types for AI generation."""

    # Prompt
    IMAGE_TO_PROMPT = "image_to_prompt"
    PROMPT_OPTIMIZE = "prompt_optimize"

    # Image
    TEXT_TO_IMAGE = "text_to_image"
    IMAGE_TO_IMAGE = "image_to_image"
    CONTROLNET = "controlnet"
    INPAINTING = "inpainting"
    REMOVE_BACKGROUND = "remove_background"

    # Video
    TEXT_TO_VIDEO = "text_to_video"
    IMAGE_TO_VIDEO = "image_to_video"
    VIDEO_TO_VIDEO = "video_to_video"
    VIDEO_UPSCALE = "video_upscale"

    # Audio
    MUSIC_GENERATE = "music_generate"
    VOICE_SYNTHESIZE = "voice_synthesize"
    VOICE_CLONE = "voice_clone"


@dataclass
class ProviderConfig:
    """Configuration for an AI provider."""

    provider: ProviderType
    api_key: Optional[str] = None
    api_url: Optional[str] = None
    models: list[str] = field(default_factory=list)
    enabled: bool = True
    priority: int = 100  # Lower = higher priority
    rate_limit: int = 60  # Requests per minute
    timeout: int = 300  # Seconds


@dataclass
class GenerationResult:
    """Result from a generation task."""

    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    provider: Optional[ProviderType] = None
    model: Optional[str] = None
    fallback_used: bool = False
    fallback_from: Optional[ProviderType] = None


class BaseProvider(ABC):
    """Base class for all AI providers."""

    def __init__(self, config: ProviderConfig):
        self.config = config

    @property
    def provider_type(self) -> ProviderType:
        """Return the provider type."""
        return self.config.provider

    @abstractmethod
    async def generate(
        self,
        task_type: TaskType,
        **kwargs,
    ) -> GenerationResult:
        """Generate content based on task type."""
        pass

    @abstractmethod
    async def validate_params(self, task_type: TaskType, **kwargs) -> tuple[bool, Optional[str]]:
        """Validate parameters for the given task type.

        Returns:
            Tuple of (is_valid, error_message)
        """
        pass

    @abstractmethod
    def supports_task(self, task_type: TaskType) -> bool:
        """Check if this provider supports the given task type."""
        pass

    async def health_check(self) -> bool:
        """Check if the provider is healthy and accessible."""
        return self.config.enabled and self.config.api_key is not None
