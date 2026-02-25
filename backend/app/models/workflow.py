from app.database import Base
from sqlalchemy import Column, String, DateTime, Enum, Text, JSON, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
import enum


class WorkflowStep(str, enum.Enum):
    STORY = "story"
    SCRIPT = "script"
    CONFIG = "config"
    CHARACTER = "character"
    SHOTS = "shots"
    EDIT = "edit"


class WorkflowStatus(str, enum.Enum):
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    status = Column(Enum(WorkflowStatus), default=WorkflowStatus.DRAFT, index=True)
    current_step = Column(Enum(WorkflowStep), default=WorkflowStep.STORY)

    # Step data (JSON stores the output of each step)
    story_data = Column(JSON, nullable=True)
    script_data = Column(JSON, nullable=True)
    config_data = Column(JSON, nullable=True)
    character_data = Column(JSON, nullable=True)
    shots_data = Column(JSON, nullable=True)
    edit_data = Column(JSON, nullable=True)

    # Generated assets
    asset_urls = Column(JSON, nullable=True)  # Character images, shots, etc.

    # Metadata
    total_duration = Column(Integer, nullable=True)  # Total video duration in seconds
    estimated_cost = Column(String(50), nullable=True)

    # Timing
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime(timezone=True), nullable=True)
