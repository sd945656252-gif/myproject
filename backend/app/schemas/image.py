from pydantic import BaseModel, HttpUrl, Field, confloat
from typing import Optional, List
from enum import Enum


class GenerationTaskStatus(str, Enum):
    """Status of image generation task"""
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class TextToImageRequest(BaseModel):
    """Request to generate image from text"""
    prompt: str = Field(..., min_length=1, max_length=1000, description="Image generation prompt")
    negative_prompt: Optional[str] = Field(None, max_length=500, description="Negative prompt")
    width: int = Field(default=1024, ge=256, le=2048, description="Image width")
    height: int = Field(default=1024, ge=256, le=2048, description="Image height")
    steps: int = Field(default=30, ge=10, le=100, description="Number of inference steps")
    cfg_scale: float = Field(default=7.5, ge=1.0, le=20.0, description="Classifier free guidance scale")
    seed: Optional[int] = Field(None, description="Random seed for reproducibility")
    num_images: int = Field(default=1, ge=1, le=4, description="Number of images to generate")


class ImageToImageRequest(BaseModel):
    """Request to generate image from image"""
    source_image_url: HttpUrl = Field(..., description="Source image URL")
    prompt: str = Field(..., min_length=1, max_length=1000, description="Generation prompt")
    negative_prompt: Optional[str] = Field(None, max_length=500, description="Negative prompt")
    strength: confloat(ge=0.0, le=1.0) = Field(default=0.75, description="How much to transform the source")
    steps: int = Field(default=30, ge=10, le=100, description="Number of inference steps")
    cfg_scale: float = Field(default=7.5, ge=1.0, le=20.0, description="CFG scale")
    seed: Optional[int] = Field(None, description="Random seed")


class InpaintingRequest(BaseModel):
    """Request for image inpainting"""
    image_url: HttpUrl = Field(..., description="Base image URL")
    mask_url: HttpUrl = Field(..., description="Mask image URL")
    prompt: str = Field(..., min_length=1, max_length=1000, description="Inpainting prompt")
    negative_prompt: Optional[str] = Field(None, max_length=500, description="Negative prompt")
    strength: confloat(ge=0.0, le=1.0) = Field(default=0.9, description="Inpainting strength")


class ControlNetRequest(BaseModel):
    """Request for ControlNet-based generation"""
    source_image_url: HttpUrl = Field(..., description="Source image for control")
    prompt: str = Field(..., min_length=1, max_length=1000, description="Generation prompt")
    control_type: str = Field(default="pose", description="Control type (pose/canny/depth/scribble)")
    control_weight: confloat(ge=0.0, le=2.0) = Field(default=1.0, description="Control weight")
    negative_prompt: Optional[str] = Field(None, max_length=500, description="Negative prompt")
    steps: int = Field(default=30, ge=10, le=100, description="Number of inference steps")


class ImageGenerationResponse(BaseModel):
    """Response for image generation request"""
    task_id: str = Field(..., description="Task ID for polling")
    status: GenerationTaskStatus = Field(..., description="Task status")
    message: str = Field(..., description="Status message")
    estimated_time: Optional[int] = Field(None, description="Estimated completion time (seconds)")


class ImageResult(BaseModel):
    """Result of completed image generation"""
    task_id: str = Field(..., description="Task ID")
    status: GenerationTaskStatus = Field(..., description="Task status")
    images: List[HttpUrl] = Field(default_factory=list, description="Generated image URLs")
    meta: dict = Field(default_factory=dict, description="Generation metadata")
    error: Optional[str] = Field(None, description="Error message if failed")
