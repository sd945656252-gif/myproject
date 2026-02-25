from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.workflow import (
    CreateWorkflowRequest,
    WorkflowResponse,
    WorkflowStepResponse,
    WorkflowCompleteResponse,
    WorkflowListResponse,
)
from app.services.workflow_service import WorkflowService

router = APIRouter()


@router.post("/", response_model=WorkflowResponse)
async def create_workflow(
    request: CreateWorkflowRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create a new one-click video generation workflow"""
    try:
        service = WorkflowService(db)
        workflow = await service.create_workflow(request)
        return workflow
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create workflow: {str(e)}"
        )


@router.get("/", response_model=WorkflowListResponse)
async def list_workflows(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """List user workflows"""
    try:
        service = WorkflowService(db)
        result = await service.list_workflows(skip=skip, limit=limit)
        return WorkflowListResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list workflows: {str(e)}"
        )


@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get workflow details"""
    try:
        service = WorkflowService(db)
        workflow = await service.get_workflow(workflow_id)
        return workflow
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get workflow: {str(e)}"
        )


@router.post("/{workflow_id}/story", response_model=WorkflowStepResponse)
async def execute_story_step(
    workflow_id: str,
    idea: str,
    db: AsyncSession = Depends(get_db),
):
    """Execute Step 1: Generate story from idea"""
    try:
        service = WorkflowService(db)
        result = await service.execute_story_step(workflow_id, idea)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute story step: {str(e)}"
        )


@router.post("/{workflow_id}/script", response_model=WorkflowStepResponse)
async def execute_script_step(
    workflow_id: str,
    script_data: dict,
    db: AsyncSession = Depends(get_db),
):
    """Execute Step 2: Generate script from story"""
    try:
        service = WorkflowService(db)
        result = await service.execute_script_step(workflow_id, script_data)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute script step: {str(e)}"
        )


@router.post("/{workflow_id}/config", response_model=WorkflowStepResponse)
async def execute_config_step(
    workflow_id: str,
    config_input: dict,
    db: AsyncSession = Depends(get_db),
):
    """Execute Step 3: Generate configuration"""
    try:
        service = WorkflowService(db)
        result = await service.execute_config_step(workflow_id, config_input)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute config step: {str(e)}"
        )


@router.post("/{workflow_id}/character", response_model=WorkflowStepResponse)
async def execute_character_step(
    workflow_id: str,
    character_input: dict,
    db: AsyncSession = Depends(get_db),
):
    """Execute Step 4: Generate character references"""
    try:
        service = WorkflowService(db)
        result = await service.execute_character_step(workflow_id, character_input)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute character step: {str(e)}"
        )


@router.post("/{workflow_id}/shots", response_model=WorkflowStepResponse)
async def execute_shots_step(
    workflow_id: str,
    shots_input: dict,
    db: AsyncSession = Depends(get_db),
):
    """Execute Step 5: Generate shots"""
    try:
        service = WorkflowService(db)
        result = await service.execute_shots_step(workflow_id, shots_input)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute shots step: {str(e)}"
        )


@router.post("/{workflow_id}/edit", response_model=WorkflowCompleteResponse)
async def execute_edit_step(
    workflow_id: str,
    edit_input: dict,
    db: AsyncSession = Depends(get_db),
):
    """Execute Step 6: Generate edit suggestions"""
    try:
        service = WorkflowService(db)
        result = await service.execute_edit_step(workflow_id, edit_input)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute edit step: {str(e)}"
        )


@router.post("/{workflow_id}/run-all")
async def run_workflow_all_steps(
    workflow_id: str,
    idea: str,
    db: AsyncSession = Depends(get_db),
):
    """Execute all workflow steps sequentially"""
    try:
        service = WorkflowService(db)

        # Execute all steps
        story = await service.execute_story_step(workflow_id, idea)
        script = await service.execute_script_step(workflow_id, {})
        config = await service.execute_config_step(workflow_id, {})
        character = await service.execute_character_step(workflow_id, {})
        shots = await service.execute_shots_step(workflow_id, {})
        edit = await service.execute_edit_step(workflow_id, {})

        return {
            "workflow_id": workflow_id,
            "steps": {
                "story": story,
                "script": script,
                "config": config,
                "character": character,
                "shots": shots,
                "edit": edit,
            },
            "status": "completed",
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to run workflow: {str(e)}"
        )
