"""
Database models for AI Creative Hub.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    """User model."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    hashed_password: Mapped[str] = mapped_column(String(255))
    avatar: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    workflows: Mapped[list["Workflow"]] = relationship(
        "Workflow", back_populates="user", cascade="all, delete-orphan"
    )
    tasks: Mapped[list["Task"]] = relationship(
        "Task", back_populates="user", cascade="all, delete-orphan"
    )


class Workflow(Base):
    """Workflow model for one-click video creation."""

    __tablename__ = "workflows"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    current_step: Mapped[str] = mapped_column(String(50), default="story")
    status: Mapped[str] = mapped_column(String(20), default="in_progress")

    # Step data stored as JSON
    story_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    script_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    config_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    character_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    storyboard_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    edit_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="workflows")


class Task(Base):
    """Task model for async AI generation tasks."""

    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )
    workflow_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("workflows.id", ondelete="SET NULL"), nullable=True
    )

    task_type: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(20), default="pending")
    progress: Mapped[int] = mapped_column(Integer, default=0)

    # Input and output
    input_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    output_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Model used
    provider: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    model: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="tasks")


class Asset(Base):
    """Asset model for generated images, videos, audio files."""

    __tablename__ = "assets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )
    task_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True
    )

    asset_type: Mapped[str] = mapped_column(String(20))  # image, video, audio
    file_url: Mapped[str] = mapped_column(String(500))
    file_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    file_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    mime_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Metadata
    width: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    height: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    duration: Mapped[Optional[float]] = mapped_column(Integer, nullable=True)

    # Generation metadata
    prompt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    model: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    seed: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
