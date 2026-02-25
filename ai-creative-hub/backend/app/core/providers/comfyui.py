"""
AI Provider - ComfyUI local provider implementation.
"""
import json
from typing import Any, Optional

import httpx
from loguru import logger

from app.core.ai_router.base import (
    BaseProvider,
    GenerationResult,
    ProviderType,
    TaskType,
)
from app.core.ai_router.config import ProviderConfig


class ComfyUIProvider(BaseProvider):
    """ComfyUI local instance provider."""

    SUPPORTED_TASKS = {
        TaskType.TEXT_TO_IMAGE,
        TaskType.IMAGE_TO_IMAGE,
        TaskType.CONTROLNET,
        TaskType.INPAINTING,
        TaskType.REMOVE_BACKGROUND,
        TaskType.TEXT_TO_VIDEO,
        TaskType.IMAGE_TO_VIDEO,
        TaskType.VIDEO_UPSCALE,
    }

    def __init__(self, config: ProviderConfig):
        super().__init__(config)
        self.client_id = "ai-creative-hub"

    async def generate(
        self,
        task_type: TaskType,
        **kwargs,
    ) -> GenerationResult:
        """Generate content using ComfyUI."""
        if not self.supports_task(task_type):
            return GenerationResult(
                success=False,
                error=f"Task type {task_type} not supported by ComfyUI",
            )

        try:
            # Get workflow for task type
            workflow = self._get_workflow(task_type, **kwargs)

            # Queue prompt
            result = await self._queue_prompt(workflow)

            if not result.get("success"):
                return GenerationResult(
                    success=False,
                    error=result.get("error", "Failed to queue prompt"),
                    provider=ProviderType.COMFYUI,
                )

            # Wait for result
            images = await self._wait_for_result(result["prompt_id"])

            return GenerationResult(
                success=True,
                data={"images": images},
                provider=ProviderType.COMFYUI,
                model="comfyui",
            )

        except Exception as e:
            logger.error(f"ComfyUI error: {e}")
            return GenerationResult(
                success=False,
                error=str(e),
                provider=ProviderType.COMFYUI,
            )

    def _get_workflow(self, task_type: TaskType, **kwargs) -> dict:
        """Get ComfyUI workflow for task type."""
        # Basic SDXL workflow
        if task_type == TaskType.TEXT_TO_IMAGE:
            return self._text_to_image_workflow(**kwargs)
        elif task_type == TaskType.IMAGE_TO_IMAGE:
            return self._image_to_image_workflow(**kwargs)
        elif task_type == TaskType.CONTROLNET:
            return self._controlnet_workflow(**kwargs)
        else:
            return {}

    def _text_to_image_workflow(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: int = 1024,
        height: int = 1024,
        steps: int = 30,
        cfg_scale: float = 7.0,
        seed: Optional[int] = None,
        **kwargs,
    ) -> dict:
        """Generate text-to-image workflow."""
        return {
            "3": {
                "inputs": {
                    "seed": seed or 0,
                    "steps": steps,
                    "cfg": cfg_scale,
                    "sampler_name": "euler",
                    "scheduler": "normal",
                    "denoise": 1,
                    "model": ["4", 0],
                    "positive": ["6", 0],
                    "negative": ["7", 0],
                    "latent_image": ["5", 0],
                },
                "class_type": "KSampler",
            },
            "4": {
                "inputs": {
                    "ckpt_name": "sdxl_base.safetensors",
                },
                "class_type": "CheckpointLoaderSimple",
            },
            "5": {
                "inputs": {
                    "width": width,
                    "height": height,
                    "batch_size": 1,
                },
                "class_type": "EmptyLatentImage",
            },
            "6": {
                "inputs": {
                    "text": prompt,
                    "clip": ["4", 1],
                },
                "class_type": "CLIPTextEncode",
            },
            "7": {
                "inputs": {
                    "text": negative_prompt or "",
                    "clip": ["4", 1],
                },
                "class_type": "CLIPTextEncode",
            },
            "8": {
                "inputs": {
                    "samples": ["3", 0],
                    "vae": ["4", 2],
                },
                "class_type": "VAEDecode",
            },
            "9": {
                "inputs": {
                    "filename_prefix": "ComfyUI",
                    "images": ["8", 0],
                },
                "class_type": "SaveImage",
            },
        }

    def _image_to_image_workflow(self, **kwargs) -> dict:
        """Generate image-to-image workflow."""
        # Simplified placeholder
        return {}

    def _controlnet_workflow(self, **kwargs) -> dict:
        """Generate ControlNet workflow."""
        return {}

    async def _queue_prompt(self, workflow: dict) -> dict:
        """Queue a prompt to ComfyUI."""
        url = f"{self.config.api_url}/prompt"

        payload = {
            "prompt": workflow,
            "client_id": self.client_id,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=payload,
                timeout=30,
            )

        if response.status_code != 200:
            return {"success": False, "error": response.text}

        return {"success": True, **response.json()}

    async def _wait_for_result(self, prompt_id: str, timeout: int = 300) -> list[dict]:
        """Wait for generation to complete and get results."""
        import asyncio

        start_time = asyncio.get_event_loop().time()

        while True:
            elapsed = asyncio.get_event_loop().time() - start_time
            if elapsed > timeout:
                raise TimeoutError("ComfyUI generation timed out")

            # Check history
            url = f"{self.config.api_url}/history/{prompt_id}"
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=10)

            if response.status_code == 200:
                history = response.json()
                if prompt_id in history:
                    outputs = history[prompt_id].get("outputs", {})
                    images = []
                    for node_id, output in outputs.items():
                        if "images" in output:
                            for img in output["images"]:
                                images.append({
                                    "url": f"{self.config.api_url}/view?filename={img['filename']}",
                                    "filename": img["filename"],
                                })
                    if images:
                        return images

            await asyncio.sleep(1)

    async def validate_params(
        self, task_type: TaskType, **kwargs
    ) -> tuple[bool, Optional[str]]:
        """Validate parameters."""
        from app.core.ai_router.validator import ParameterValidator

        return ParameterValidator.validate(task_type, **kwargs)

    def supports_task(self, task_type: TaskType) -> bool:
        """Check if task is supported."""
        return task_type in self.SUPPORTED_TASKS

    async def health_check(self) -> bool:
        """Check if ComfyUI is running."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.config.api_url}/system_stats",
                    timeout=5,
                )
                return response.status_code == 200
        except Exception:
            return False
