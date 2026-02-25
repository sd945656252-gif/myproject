from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.history_service import HistoryService
from app.models.task import TaskType, TaskStatus

router = APIRouter()


@router.get("/")
async def get_history(
    task_type: str = Query(None, description="Filter by task type"),
    status: str = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    offset: int = Query(0, ge=0, description="Items to skip"),
    db: AsyncSession = Depends(get_db),
):
    """Get user generation history with optional filters"""
    try:
        service = HistoryService(db)

        # Convert string to enum if provided
        task_type_enum = TaskType(task_type) if task_type else None
        status_enum = TaskStatus(status) if status else None

        result = await service.get_user_history(
            task_type=task_type_enum,
            status=status_enum,
            limit=limit,
            offset=offset,
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid filter value: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get history: {str(e)}"
        )


@router.get("/task/{task_id}")
async def get_task_details(
    task_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get detailed information about a specific task"""
    try:
        service = HistoryService(db)
        task = await service.get_task_by_id(task_id)

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        return task
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get task details: {str(e)}"
        )


@router.delete("/task/{task_id}")
async def delete_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a task from history"""
    try:
        service = HistoryService(db)
        success = await service.delete_task(task_id)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        return {"message": "Task deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete task: {str(e)}"
        )


@router.get("/statistics")
async def get_statistics(
    db: AsyncSession = Depends(get_db),
):
    """Get user generation statistics"""
    try:
        service = HistoryService(db)
        stats = await service.get_statistics()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get statistics: {str(e)}"
        )


@router.get("/search")
async def search_tasks(
    query: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=100, description="Results limit"),
    db: AsyncSession = Depends(get_db),
):
    """Search tasks by prompt or output content"""
    try:
        service = HistoryService(db)
        results = await service.search_tasks(query=query, limit=limit)
        return {"results": results, "total": len(results)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search tasks: {str(e)}"
        )


@router.get("/by-type/{task_type}")
async def get_tasks_by_type(
    task_type: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Get tasks filtered by type"""
    try:
        service = HistoryService(db)
        task_type_enum = TaskType(task_type)
        result = await service.get_user_history(
            task_type=task_type_enum,
            limit=limit,
            offset=offset,
        )
        return result
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid task type: {task_type}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tasks by type: {str(e)}"
        )
