from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.task import TaskResponse, TaskListResponse
from app.services.task_service import TaskService

router = APIRouter()


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Get task status and result
    """
    try:
        service = TaskService(db)
        task = await service.get_task(task_id)
        return task
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task not found: {str(e)}"
        )


@router.get("/", response_model=TaskListResponse)
async def list_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    task_type: str = Query(None),
    status: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    List tasks with filtering
    """
    try:
        service = TaskService(db)
        tasks = await service.list_tasks(
            skip=skip,
            limit=limit,
            task_type=task_type,
            status=status
        )
        return tasks
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list tasks: {str(e)}"
        )


@router.delete("/{task_id}")
async def cancel_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Cancel a running task
    """
    try:
        service = TaskService(db)
        await service.cancel_task(task_id)
        return {"message": "Task cancelled successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel task: {str(e)}"
        )
