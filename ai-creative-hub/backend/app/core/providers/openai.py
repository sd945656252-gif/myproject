"""
AI Provider - OpenAI provider implementation.
"""
import base64
from io import BytesIO
from typing import Optional

from openai import AsyncOpenAI
from loguru import logger

from app.core.ai_router.base import (
    BaseProvider,
    GenerationResult,
    ProviderType,
    TaskType,
)
from app.core.ai_router.config import ProviderConfig


class OpenAIProvider(BaseProvider):
    """OpenAI API provider for GPT, DALL-E, and TTS."""

    SUPPORTED_TASKS = {
        TaskType.TEXT_TO_IMAGE,
        TaskType.IMAGE_TO_PROMPT,
        TaskType.PROMPT_OPTIMIZE,
        TaskType.VOICE_SYNTHESIZE,
    }

    # Model mapping
    TASK_MODELS = {
        TaskType.TEXT_TO_IMAGE: "dall-e-3",
        TaskType.IMAGE_TO_PROMPT: "gpt-4o",
        TaskType.PROMPT_OPTIMIZE: "gpt-4o",
        TaskType.VOICE_SYNTHESIZE: "tts-1",
    }

    def __init__(self, config: ProviderConfig):
        super().__init__(config)
        self.client = AsyncOpenAI(
            api_key=config.api_key,
            organization=config.api_url if config.api_url else None,
        )

    async def generate(
        self,
        task_type: TaskType,
        **kwargs,
    ) -> GenerationResult:
        """Generate content using OpenAI API."""
        if not self.supports_task(task_type):
            return GenerationResult(
                success=False,
                error=f"Task type {task_type} not supported by OpenAI",
            )

        try:
            if task_type == TaskType.TEXT_TO_IMAGE:
                return await self._text_to_image(**kwargs)
            elif task_type == TaskType.IMAGE_TO_PROMPT:
                return await self._image_to_prompt(**kwargs)
            elif task_type == TaskType.PROMPT_OPTIMIZE:
                return await self._optimize_prompt(**kwargs)
            elif task_type == TaskType.VOICE_SYNTHESIZE:
                return await self._synthesize_voice(**kwargs)
            else:
                return GenerationResult(
                    success=False,
                    error=f"Task {task_type} not implemented",
                )

        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return GenerationResult(
                success=False,
                error=str(e),
                provider=ProviderType.OPENAI,
            )

    async def _text_to_image(
        self,
        prompt: str,
        width: int = 1024,
        height: int = 1024,
        model: Optional[str] = None,
        quality: str = "standard",
        style: str = "vivid",
        **kwargs,
    ) -> GenerationResult:
        """Generate image using DALL-E."""
        model = model or self.TASK_MODELS[TaskType.TEXT_TO_IMAGE]

        # DALL-E 3 supports 1024x1024, 1792x1024, or 1024x1792
        size = "1024x1024"
        if width > height:
            size = "1792x1024"
        elif height > width:
            size = "1024x1792"

        response = await self.client.images.generate(
            model=model,
            prompt=prompt,
            size=size,
            quality=quality,
            style=style,
            n=1,
            response_format="url",
        )

        image = response.data[0]
        return GenerationResult(
            success=True,
            data={
                "images": [
                    {
                        "url": image.url,
                        "seed": 0,
                        "model": model,
                        "revised_prompt": image.revised_prompt,
                    }
                ],
            },
            provider=ProviderType.OPENAI,
            model=model,
        )

    async def _image_to_prompt(
        self,
        image: str,
        language: str = "zh",
        **kwargs,
    ) -> GenerationResult:
        """Analyze image and generate prompt using GPT-4V."""
        model = self.TASK_MODELS[TaskType.IMAGE_TO_PROMPT]

        # Prepare image content
        if image.startswith("data:"):
            image_content = {
                "type": "image_url",
                "image_url": {"url": image},
            }
        else:
            # Assume base64
            image_content = {
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{image}"},
            }

        system_prompt = """You are an expert at analyzing images and generating detailed prompts for AI image generation.
Analyze the image carefully and describe:
1. Main subject(s) and their appearance
2. Composition and framing
3. Lighting and atmosphere
4. Color palette and style
5. Background and environment
6. Camera angle and perspective

Generate a detailed prompt that could recreate this image."""

        if language == "zh":
            system_prompt += "\n\nPlease provide the output in Chinese (简体中文)."

        response = await self.client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Please analyze this image and generate a prompt."},
                        image_content,
                    ],
                },
            ],
            max_tokens=1000,
        )

        prompt = response.choices[0].message.content

        return GenerationResult(
            success=True,
            data={
                "prompt": prompt,
                "tags": [],
                "suggestions": [],
            },
            provider=ProviderType.OPENAI,
            model=model,
        )

    async def _optimize_prompt(
        self,
        prompt: str,
        target_api: Optional[str] = None,
        language: str = "zh",
        **kwargs,
    ) -> GenerationResult:
        """Optimize prompt for better AI generation results."""
        model = self.TASK_MODELS[TaskType.PROMPT_OPTIMIZE]

        api_specific_hints = {
            "midjourney": "Use --v 6 parameters, aspect ratio --ar, and Midjourney-specific syntax.",
            "sora": "Focus on cinematic descriptions, camera movements, and temporal flow.",
            "jimeng": "Use concise Chinese descriptions with style keywords.",
            "kling": "Describe motion, transitions, and scene dynamics.",
        }

        hint = api_specific_hints.get(target_api, "")

        system_prompt = f"""You are an expert prompt engineer specializing in AI image and video generation.
Optimize the user's prompt to be more detailed, professional, and effective.

Guidelines:
1. Add specific details about lighting, composition, and style
2. Include camera angles and perspectives
3. Describe textures, materials, and atmosphere
4. Use professional photography/filmmaking terminology
5. Keep the core intent while enhancing descriptiveness

{f'Target API: {target_api}. {hint}' if target_api else ''}

{"Provide the output in Chinese (简体中文)." if language == "zh" else "Provide the output in English."}"""

        response = await self.client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Original prompt: {prompt}"},
            ],
            max_tokens=1000,
        )

        optimized = response.choices[0].message.content

        return GenerationResult(
            success=True,
            data={
                "prompt": optimized,
                "tags": [],
                "suggestions": [],
            },
            provider=ProviderType.OPENAI,
            model=model,
        )

    async def _synthesize_voice(
        self,
        text: str,
        voice_id: Optional[str] = None,
        speed: float = 1.0,
        **kwargs,
    ) -> GenerationResult:
        """Synthesize voice using OpenAI TTS."""
        model = "tts-1"
        voice = voice_id or "alloy"

        response = await self.client.audio.speech.create(
            model=model,
            voice=voice,
            input=text,
            speed=speed,
            response_format="mp3",
        )

        # Get audio data
        audio_data = response.content
        audio_base64 = base64.b64encode(audio_data).decode()
        audio_url = f"data:audio/mp3;base64,{audio_base64}"

        return GenerationResult(
            success=True,
            data={
                "audio_url": audio_url,
                "duration": len(text) / 15,  # Rough estimate
            },
            provider=ProviderType.OPENAI,
            model=model,
        )

    async def validate_params(
        self, task_type: TaskType, **kwargs
    ) -> tuple[bool, Optional[str]]:
        """Validate parameters for OpenAI."""
        from app.core.ai_router.validator import ParameterValidator

        return ParameterValidator.validate(task_type, **kwargs)

    def supports_task(self, task_type: TaskType) -> bool:
        """Check if task is supported."""
        return task_type in self.SUPPORTED_TASKS
