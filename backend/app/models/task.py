from app.database import Base
from sqlalchemy import Column, String, DateTime, Enum, Text, JSON, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
import enum


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TaskType(str, enum.Enum):
    IMAGE_GENERATION = "image_generation"
    VIDEO_GENERATION = "video_generation"
    MUSIC_GENERATION = "music_generation"
    TTS = "tts"
    WORKFLOW = "workflow"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    task_type = Column(Enum(TaskType), nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING, index=True)
    priority = Column(Integer, default=5)

    # Input parameters
    input_data = Column(JSON, nullable=False)

    # Output results
    output_data = Column(JSON, nullable=True)
    output_urls = Column(JSON, nullable=True)  # List of URLs

    # Progress tracking
    progress = Column(Integer, default=0)
    progress_message = Column(Text, nullable=True)

    # Error handling
    error_message = Column(Text, nullable=True)
    error_details = Column(JSON, nullable=True)

    # Metadata
    provider = Column(String(50), nullable=True)  # Which AI provider was used
    model = Column(String(100), nullable=True)  # Which model was used
    fallback_used = Column(Boolean, default=False)
    attempts = Column(Integer, default=0)

    # Timing
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Celery task ID
    celery_task_id = Column(String(255), nullable=True, index=True)
