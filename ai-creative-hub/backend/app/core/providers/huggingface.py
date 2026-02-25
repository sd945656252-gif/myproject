"""
AI Provider - HuggingFace provider implementation.
"""
import base64
from io import BytesIO
from typing import Optional

import httpx
from loguru import logger

from app.core.ai_router.base import (
    BaseProvider,
    GenerationResult,
    ProviderType,
    TaskType,
)
from app.core.ai_router.config import ProviderConfig


class HuggingFaceProvider(BaseProvider):
    """HuggingFace Inference API provider."""

    SUPPORTED_TASKS = {
        TaskType.TEXT_TO_IMAGE,
        TaskType.IMAGE_TO_IMAGE,
        TaskType.IMAGE_TO_PROMPT,
        TaskType.PROMPT_OPTIMIZE,
        TaskType.REMOVE_BACKGROUND,
    }

    # Model mapping for different tasks
    TASK_MODELS = {
        TaskType.TEXT_TO_IMAGE: "stabilityai/stable-diffusion-xl-base-1.0",
        TaskType.IMAGE_TO_IMAGE: "stabilityai/stable-diffusion-xl-refiner-1.0",
        TaskType.IMAGE_TO_PROMPT: "Salesforce/blip-image-captioning-large",
        TaskType.PROMPT_OPTIMIZE: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        TaskType.REMOVE_BACKGROUND: "stabilityai/stable-diffusion-xl-inpainting-1.0",
    }

    def __init__(self, config: ProviderConfig):
        super().__init__(config)
        self.api_url = config.api_url or "https://api-inference.huggingface.co/models"

    async def generate(
        self,
        task_type: TaskType,
        **kwargs,
    ) -> GenerationResult:
        """Generate content using HuggingFace Inference API."""
        if not self.supports_task(task_type):
            return GenerationResult(
                success=False,
                error=f"Task type {task_type} not supported by HuggingFace",
            )

        model = self.TASK_MODELS.get(task_type)
        if not model:
            return GenerationResult(
                success=False,
                error=f"No model configured for task {task_type}",
            )

        try:
            if task_type == TaskType.TEXT_TO_IMAGE:
                return await self._text_to_image(model, **kwargs)
            elif task_type == TaskType.IMAGE_TO_IMAGE:
                return await self._image_to_image(model, **kwargs)
            elif task_type == TaskType.IMAGE_TO_PROMPT:
                return await self._image_to_prompt(model, **kwargs)
            elif task_type == TaskType.PROMPT_OPTIMIZE:
                return await self._optimize_prompt(model, **kwargs)
            else:
                return GenerationResult(
                    success=False,
                    error=f"Task {task_type} not implemented",
                )

        except Exception as e:
            logger.error(f"HuggingFace API error: {e}")
            return GenerationResult(
                success=False,
                error=str(e),
                provider=ProviderType.HUGGINGFACE,
            )

    async def _text_to_image(
        self,
        model: str,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: int = 1024,
        height: int = 1024,
        **kwargs,
    ) -> GenerationResult:
        """Generate image from text."""
        url = f"{self.api_url}/{model}"

        payload = {
            "inputs": prompt,
            "parameters": {
                "negative_prompt": negative_prompt,
                "width": width,
                "height": height,
            },
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=payload,
                headers={"Authorization": f"Bearer {self.config.api_key}"},
                timeout=self.config.timeout,
            )

        if response.status_code != 200:
            return GenerationResult(
                success=False,
                error=f"API error: {response.status_code} - {response.text}",
                provider=ProviderType.HUGGINGFACE,
            )

        # Response is image bytes
        image_data = base64.b64encode(response.content).decode()
        image_url = f"data:image/png;base64,{image_data}"

        return GenerationResult(
            success=True,
            data={
                "images": [{"url": image_url, "seed": 0, "model": model}],
            },
            provider=ProviderType.HUGGINGFACE,
            model=model,
        )

    async def _image_to_prompt(
        self,
        model: str,
        image: str,
        **kwargs,
    ) -> GenerationResult:
        """Generate prompt from image."""
        url = f"{self.api_url}/{model}"

        # Handle base64 image
        if image.startswith("data:"):
            image_data = image.split(",")[1]
            image_bytes = base64.b64decode(image_data)
        else:
            image_bytes = base64.b64decode(image)

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                content=image_bytes,
                headers={"Authorization": f"Bearer {self.config.api_key}"},
                timeout=self.config.timeout,
            )

        if response.status_code != 200:
            return GenerationResult(
                success=False,
                error=f"API error: {response.status_code}",
                provider=ProviderType.HUGGINGFACE,
            )

        result = response.json()
        prompt = result[0].get("generated_text", "") if isinstance(result, list) else result

        return GenerationResult(
            success=True,
            data={
                "prompt": prompt,
                "tags": [],
                "suggestions": [],
            },
            provider=ProviderType.HUGGINGFACE,
            model=model,
        )

    async def _optimize_prompt(
        self,
        model: str,
        prompt: str,
        target_api: Optional[str] = None,
        **kwargs,
    ) -> GenerationResult:
        """Optimize a prompt for better results."""
        url = f"{self.api_url}/{model}"

        system_prompt = """You are an expert prompt engineer. Optimize the user's prompt
        to be more detailed and professional for AI image/video generation.
        Add details about lighting, composition, style, and camera angles.
        Keep the core intent but make it more vivid and specific."""

        full_prompt = f"{system_prompt}\n\nUser prompt: {prompt}"

        payload = {
            "inputs": full_prompt,
            "parameters": {
                "max_new_tokens": 500,
                "temperature": 0.7,
            },
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=payload,
                headers={"Authorization": f"Bearer {self.config.api_key}"},
                timeout=self.config.timeout,
            )

        if response.status_code != 200:
            return GenerationResult(
                success=False,
                error=f"API error: {response.status_code}",
                provider=ProviderType.HUGGINGFACE,
            )

        result = response.json()
        optimized = result[0].get("generated_text", prompt) if isinstance(result, list) else result

        return GenerationResult(
            success=True,
            data={
                "prompt": optimized,
                "tags": [],
                "suggestions": [],
            },
            provider=ProviderType.HUGGINGFACE,
            model=model,
        )

    async def _image_to_image(
        self,
        model: str,
        prompt: str,
        image: str,
        **kwargs,
    ) -> GenerationResult:
        """Transform image based on prompt."""
        # Implementation similar to text_to_image but with image input
        return GenerationResult(
            success=False,
            error="Image-to-image not yet implemented",
            provider=ProviderType.HUGGINGFACE,
        )

    async def validate_params(
        self, task_type: TaskType, **kwargs
    ) -> tuple[bool, Optional[str]]:
        """Validate parameters for HuggingFace."""
        # Use common validator
        from app.core.ai_router.validator import ParameterValidator

        return ParameterValidator.validate(task_type, **kwargs)

    def supports_task(self, task_type: TaskType) -> bool:
        """Check if task is supported."""
        return task_type in self.SUPPORTED_TASKS
