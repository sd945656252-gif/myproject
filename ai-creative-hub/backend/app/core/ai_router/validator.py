"""
AI Router - Parameter validation for different task types.
"""
from typing import Any, Optional

from app.core.ai_router.base import TaskType


class ParameterValidator:
    """Validates parameters for AI generation tasks."""

    # Required parameters for each task type
    REQUIRED_PARAMS: dict[TaskType, list[str]] = {
        TaskType.IMAGE_TO_PROMPT: ["image"],
        TaskType.PROMPT_OPTIMIZE: ["prompt"],
        TaskType.TEXT_TO_IMAGE: ["prompt"],
        TaskType.IMAGE_TO_IMAGE: ["prompt", "image"],
        TaskType.CONTROLNET: ["prompt", "control_image"],
        TaskType.INPAINTING: ["prompt", "image", "mask"],
        TaskType.REMOVE_BACKGROUND: ["image"],
        TaskType.TEXT_TO_VIDEO: ["prompt"],
        TaskType.IMAGE_TO_VIDEO: ["prompt", "image"],
        TaskType.VIDEO_TO_VIDEO: ["prompt", "video"],
        TaskType.VIDEO_UPSCALE: ["video"],
        TaskType.MUSIC_GENERATE: ["prompt"],
        TaskType.VOICE_SYNTHESIZE: ["text"],
        TaskType.VOICE_CLONE: ["text", "reference_audio"],
    }

    # Parameter constraints
    CONSTRAINTS: dict[str, dict[str, Any]] = {
        "width": {"min": 256, "max": 4096},
        "height": {"min": 256, "max": 4096},
        "duration": {"min": 1, "max": 300},
        "fps": {"min": 1, "max": 60},
        "steps": {"min": 1, "max": 100},
        "cfg_scale": {"min": 1.0, "max": 20.0},
        "seed": {"min": 0, "max": 2**32 - 1},
        "speed": {"min": 0.5, "max": 2.0},
        "pitch": {"min": 0.5, "max": 2.0},
    }

    @classmethod
    def validate(
        cls,
        task_type: TaskType,
        **kwargs,
    ) -> tuple[bool, Optional[str]]:
        """Validate parameters for a task type.

        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check required parameters
        required = cls.REQUIRED_PARAMS.get(task_type, [])
        for param in required:
            if param not in kwargs or kwargs[param] is None:
                return False, f"Missing required parameter: {param}"

        # Check constraints
        for param, value in kwargs.items():
            if param in cls.CONSTRAINTS and value is not None:
                constraint = cls.CONSTRAINTS[param]
                if isinstance(value, (int, float)):
                    if "min" in constraint and value < constraint["min"]:
                        return False, f"{param} must be >= {constraint['min']}"
                    if "max" in constraint and value > constraint["max"]:
                        return False, f"{param} must be <= {constraint['max']}"

        # Task-specific validation
        return cls._validate_task_specific(task_type, **kwargs)

    @classmethod
    def _validate_task_specific(
        cls,
        task_type: TaskType,
        **kwargs,
    ) -> tuple[bool, Optional[str]]:
        """Task-specific parameter validation."""
        if task_type == TaskType.TEXT_TO_IMAGE:
            return cls._validate_image_params(**kwargs)

        if task_type in (TaskType.TEXT_TO_VIDEO, TaskType.IMAGE_TO_VIDEO):
            return cls._validate_video_params(**kwargs)

        if task_type == TaskType.MUSIC_GENERATE:
            return cls._validate_music_params(**kwargs)

        if task_type == TaskType.VOICE_SYNTHESIZE:
            return cls._validate_voice_params(**kwargs)

        return True, None

    @classmethod
    def _validate_image_params(cls, **kwargs) -> tuple[bool, Optional[str]]:
        """Validate image generation parameters."""
        width = kwargs.get("width", 1024)
        height = kwargs.get("height", 1024)

        # Check aspect ratio constraints for some models
        # Most models prefer dimensions in multiples of 64
        if width % 64 != 0 or height % 64 != 0:
            return False, "Width and height should be multiples of 64"

        return True, None

    @classmethod
    def _validate_video_params(cls, **kwargs) -> tuple[bool, Optional[str]]:
        """Validate video generation parameters."""
        duration = kwargs.get("duration", 5)

        # Some models have max duration limits
        if duration > 60:
            return False, "Duration exceeds maximum of 60 seconds"

        return True, None

    @classmethod
    def _validate_music_params(cls, **kwargs) -> tuple[bool, Optional[str]]:
        """Validate music generation parameters."""
        prompt = kwargs.get("prompt", "")
        lyrics = kwargs.get("lyrics")
        instrumental = kwargs.get("instrumental", False)

        if not prompt.strip():
            return False, "Prompt cannot be empty"

        # If instrumental is True, lyrics should not be provided
        if instrumental and lyrics:
            return False, "Lyrics should not be provided for instrumental music"

        return True, None

    @classmethod
    def _validate_voice_params(cls, **kwargs) -> tuple[bool, Optional[str]]:
        """Validate voice synthesis parameters."""
        text = kwargs.get("text", "")

        if not text.strip():
            return False, "Text cannot be empty"

        if len(text) > 5000:
            return False, "Text exceeds maximum length of 5000 characters"

        return True, None

    @classmethod
    def get_missing_params(cls, task_type: TaskType, **kwargs) -> list[str]:
        """Get list of missing required parameters."""
        required = cls.REQUIRED_PARAMS.get(task_type, [])
        return [p for p in required if p not in kwargs or kwargs[p] is None]

    @classmethod
    def get_param_suggestions(cls, task_type: TaskType) -> dict[str, str]:
        """Get suggestions for missing parameters."""
        suggestions = {
            "prompt": "请输入描述提示词",
            "image": "请上传图片",
            "video": "请上传视频",
            "control_image": "请上传控制参考图",
            "mask": "请标注需要编辑的区域",
            "reference_audio": "请上传参考音频",
            "text": "请输入要合成的文本",
        }

        result = {}
        for param in cls.REQUIRED_PARAMS.get(task_type, []):
            if param in suggestions:
                result[param] = suggestions[param]

        return result
