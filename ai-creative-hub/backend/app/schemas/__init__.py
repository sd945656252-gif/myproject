"""
Pydantic schemas for API request/response validation.
"""
import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


# ============== Common Schemas ==============

class ApiResponse(BaseModel):
    """Standard API response wrapper."""

    success: bool = True
    message: Optional[str] = None
    data: Optional[Any] = None


class PaginatedResponse(BaseModel):
    """Paginated response for list endpoints."""

    items: list[Any]
    total: int
    page: int
    page_size: int
    total_pages: int


# ============== Task Schemas ==============

class TaskStatus(BaseModel):
    """Task status response."""

    task_id: uuid.UUID
    status: str
    progress: int = 0
    result: Optional[dict] = None
    error: Optional[str] = None


# ============== Prompt Schemas (Module 1) ==============

class PromptGenerateRequest(BaseModel):
    """Request for prompt generation."""

    type: str = Field(..., description="image_to_prompt or optimize")
    image: Optional[str] = Field(None, description="Base64 encoded image for image_to_prompt")
    prompt: Optional[str] = Field(None, description="Prompt to optimize")
    target_api: Optional[str] = Field(None, description="Target API: midjourney, jimeng, sora, etc.")
    language: str = Field("zh", description="Output language: zh or en")


class PromptGenerateResponse(BaseModel):
    """Response for prompt generation."""

    prompt: str
    tags: Optional[list[str]] = None
    suggestions: Optional[list[str]] = None


# ============== Image Schemas (Module 2) ==============

class ImageGenerateRequest(BaseModel):
    """Request for image generation."""

    prompt: str
    negative_prompt: Optional[str] = None
    width: int = Field(1024, ge=256, le=2048)
    height: int = Field(1024, ge=256, le=2048)
    style: Optional[str] = None
    model: Optional[str] = None
    seed: Optional[int] = None
    steps: int = Field(30, ge=1, le=100)
    cfg_scale: float = Field(7.0, ge=1.0, le=20.0)


class GeneratedImage(BaseModel):
    """Generated image result."""

    url: str
    seed: int
    model: str


class ImageGenerateResponse(BaseModel):
    """Response for image generation."""

    images: list[GeneratedImage]
    task_id: uuid.UUID


# ============== Video Schemas (Module 3) ==============

class VideoGenerateRequest(BaseModel):
    """Request for video generation."""

    type: str = Field(..., description="text_to_video, image_to_video, or video_to_video")
    prompt: str
    image: Optional[str] = Field(None, description="Base64 image for image_to_video")
    video: Optional[str] = Field(None, description="Base64/video URL for video_to_video")
    duration: Optional[int] = Field(5, ge=1, le=60)
    fps: Optional[int] = Field(24, ge=1, le=60)
    width: Optional[int] = Field(1280, ge=256, le=4096)
    height: Optional[int] = Field(720, ge=256, le=4096)
    style: Optional[str] = None
    model: Optional[str] = None


class VideoGenerateResponse(BaseModel):
    """Response for video generation."""

    video_url: str
    task_id: uuid.UUID
    duration: float


# ============== Music Schemas (Module 5) ==============

class MusicGenerateRequest(BaseModel):
    """Request for music generation."""

    prompt: str
    style: Optional[str] = None
    duration: Optional[int] = Field(30, ge=5, le=300)
    lyrics: Optional[str] = None
    instrumental: bool = False


class MusicGenerateResponse(BaseModel):
    """Response for music generation."""

    audio_url: str
    task_id: uuid.UUID
    duration: float


# ============== Voice Schemas (Module 6) ==============

class VoiceGenerateRequest(BaseModel):
    """Request for voice synthesis."""

    text: str
    voice_id: Optional[str] = None
    speed: float = Field(1.0, ge=0.5, le=2.0)
    pitch: float = Field(1.0, ge=0.5, le=2.0)
    emotion: Optional[str] = None


class VoiceGenerateResponse(BaseModel):
    """Response for voice synthesis."""

    audio_url: str
    task_id: uuid.UUID
    duration: float


# ============== Workflow Schemas (Module 4) ==============

class WorkflowCreateRequest(BaseModel):
    """Request to create a new workflow."""

    title: Optional[str] = None
    description: Optional[str] = None


class WorkflowStepRequest(BaseModel):
    """Request for a workflow step."""

    step: str
    input: dict


class WorkflowStepResponse(BaseModel):
    """Response from a workflow step."""

    step: str
    output: dict
    next_step: Optional[str] = None


class WorkflowDetail(BaseModel):
    """Workflow detail response."""

    id: uuid.UUID
    title: Optional[str]
    current_step: str
    status: str
    story_data: Optional[dict] = None
    script_data: Optional[dict] = None
    config_data: Optional[dict] = None
    character_data: Optional[dict] = None
    storyboard_data: Optional[dict] = None
    edit_data: Optional[dict] = None
    created_at: datetime
    updated_at: datetime


# ============== User Schemas ==============

class UserCreate(BaseModel):
    """Request to create a user."""

    email: str
    name: str
    password: str


class UserLogin(BaseModel):
    """Login request."""

    email: str
    password: str


class UserResponse(BaseModel):
    """User response."""

    id: uuid.UUID
    email: str
    name: str
    avatar: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Token response."""

    access_token: str
    token_type: str = "bearer"
