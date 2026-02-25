from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TaskType(str, Enum):
    IMAGE_GENERATION = "image_generation"
    VIDEO_GENERATION = "video_generation"
    MUSIC_GENERATION = "music_generation"
    TTS = "tts"
    WORKFLOW = "workflow"


class TaskResponse(BaseModel):
    task_id: str
    task_type: str
    status: TaskStatus
    progress: int
    message: Optional[str] = None
    output_data: Optional[Any] = None
    error_message: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    estimated_time_remaining: Optional[int] = None


class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
    total: int
    page: int
    page_size: int
