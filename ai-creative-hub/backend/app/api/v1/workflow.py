"""
One-Click Video Workflow API - Module 4
"""
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import Workflow, User
from app.schemas import (
    ApiResponse,
    WorkflowCreateRequest,
    WorkflowStepRequest,
    WorkflowStepResponse,
    WorkflowDetail,
)

router = APIRouter()

# Step order for workflow
STEP_ORDER = ["story", "script", "config", "character", "storyboard", "edit"]


@router.post("/create", response_model=ApiResponse)
async def create_workflow(
    request: WorkflowCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new one-click video workflow.
    """
    # TODO: Get actual user from auth
    workflow = Workflow(
        title=request.title,
        current_step="story",
        status="in_progress",
    )

    db.add(workflow)
    await db.commit()
    await db.refresh(workflow)

    return ApiResponse(
        success=True,
        message="Workflow created",
        data={"workflow_id": workflow.id},
    )


@router.get("/{workflow_id}", response_model=ApiResponse)
async def get_workflow(
    workflow_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Get workflow details and current state.
    """
    result = await db.execute(
        select(Workflow).where(Workflow.id == workflow_id)
    )
    workflow = result.scalar_one_or_none()

    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )

    return ApiResponse(
        success=True,
        data=WorkflowDetail(
            id=workflow.id,
            title=workflow.title,
            current_step=workflow.current_step,
            status=workflow.status,
            story_data=workflow.story_data,
            script_data=workflow.script_data,
            config_data=workflow.config_data,
            character_data=workflow.character_data,
            storyboard_data=workflow.storyboard_data,
            edit_data=workflow.edit_data,
            created_at=workflow.created_at,
            updated_at=workflow.updated_at,
        ),
    )


@router.post("/{workflow_id}/step", response_model=ApiResponse)
async def execute_step(
    workflow_id: uuid.UUID,
    request: WorkflowStepRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Execute a workflow step and get results.

    Steps:
    1. **story**: Generate three-act story outline from one sentence
    2. **script**: Break down into scenes with narration and visual descriptions
    3. **config**: Recommend aspect ratio, style, frame rate, and model
    4. **character**: Generate character reference images and views
    5. **storyboard**: Generate scene images/videos
    6. **edit**: Provide editing suggestions (sequence, transitions, music)
    """
    result = await db.execute(
        select(Workflow).where(Workflow.id == workflow_id)
    )
    workflow = result.scalar_one_or_none()

    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )

    step = request.step
    input_data = request.input

    # Validate step
    if step not in STEP_ORDER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid step: {step}",
        )

    # TODO: Implement actual AI generation for each step
    output_data = {}
    next_step = None

    if step == "story":
        # Generate story outline
        output_data = {
            "outline": "Generated story outline based on input",
            "acts": ["Act 1: Setup", "Act 2: Confrontation", "Act 3: Resolution"],
        }
        workflow.story_data = output_data
        next_step = "script"

    elif step == "script":
        # Generate script with scenes
        output_data = {
            "scenes": [
                {
                    "id": "scene_1",
                    "description": "Opening scene",
                    "narration": "Narration text",
                    "visualDescription": "Visual description",
                }
            ]
        }
        workflow.script_data = output_data
        next_step = "config"

    elif step == "config":
        # Generate configuration
        output_data = {
            "aspectRatio": "16:9",
            "style": "cinematic",
            "frameRate": 24,
            "recommendedModel": "kling-3.0",
        }
        workflow.config_data = output_data
        next_step = "character"

    elif step == "character":
        # Generate character references
        output_data = {
            "referenceImages": [],
            "views": ["front", "side", "back"],
        }
        workflow.character_data = output_data
        next_step = "storyboard"

    elif step == "storyboard":
        # Generate storyboard scenes
        output_data = {
            "generatedScenes": [],
        }
        workflow.storyboard_data = output_data
        next_step = "edit"

    elif step == "edit":
        # Generate edit suggestions
        output_data = {
            "sequence": [],
            "transitions": [],
            "musicSuggestions": [],
        }
        workflow.edit_data = output_data
        workflow.status = "completed"

    # Update workflow
    if next_step:
        workflow.current_step = next_step
    workflow.updated_at = datetime.utcnow()

    await db.commit()

    return ApiResponse(
        success=True,
        data=WorkflowStepResponse(
            step=step,
            output=output_data,
            next_step=next_step,
        ),
    )


@router.post("/{workflow_id}/step/{step}/confirm", response_model=ApiResponse)
async def confirm_step(
    workflow_id: uuid.UUID,
    step: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Confirm user is satisfied with step result and proceed to next step.
    """
    result = await db.execute(
        select(Workflow).where(Workflow.id == workflow_id)
    )
    workflow = result.scalar_one_or_none()

    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )

    if workflow.current_step != step:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Current step is {workflow.current_step}, not {step}",
        )

    # Move to next step
    current_index = STEP_ORDER.index(step)
    if current_index < len(STEP_ORDER) - 1:
        workflow.current_step = STEP_ORDER[current_index + 1]
        workflow.updated_at = datetime.utcnow()
        await db.commit()

        return ApiResponse(
            success=True,
            message=f"Moved to step: {workflow.current_step}",
            data={"current_step": workflow.current_step},
        )
    else:
        workflow.status = "completed"
        await db.commit()

        return ApiResponse(
            success=True,
            message="Workflow completed!",
            data={"status": "completed"},
        )


@router.delete("/{workflow_id}", response_model=ApiResponse)
async def delete_workflow(
    workflow_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a workflow.
    """
    result = await db.execute(
        select(Workflow).where(Workflow.id == workflow_id)
    )
    workflow = result.scalar_one_or_none()

    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )

    await db.delete(workflow)
    await db.commit()

    return ApiResponse(success=True, message="Workflow deleted")
