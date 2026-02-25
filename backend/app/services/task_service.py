from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from app.models.task import Task, TaskStatus, TaskType
from app.schemas.task import TaskResponse, TaskListResponse


class TaskService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_task(self, task_id: str) -> TaskResponse:
        """Get task by ID"""
        result = await self.db.execute(
            select(Task).where(Task.id == task_id)
        )
        task = result.scalar_one_or_none()
        if not task:
            raise ValueError("Task not found")
        return self._to_response(task)

    async def list_tasks(
        self,
        skip: int = 0,
        limit: int = 20,
        task_type: str = None,
        status: str = None,
    ) -> TaskListResponse:
        """List tasks with optional filtering"""
        query = select(Task).where(Task.user_id == "default_user")

        if task_type:
            query = query.where(Task.task_type == TaskType(task_type))
        if status:
            query = query.where(Task.status == TaskStatus(status))

        query = query.order_by(Task.created_at.desc()).offset(skip).limit(limit)

        result = await self.db.execute(query)
        tasks = result.scalars().all()

        return TaskListResponse(
            tasks=[self._to_response(task) for task in tasks],
            total=len(tasks),
            page=skip // limit + 1,
            page_size=limit,
        )

    async def cancel_task(self, task_id: str) -> None:
        """Cancel a running task"""
        result = await self.db.execute(
            select(Task).where(Task.id == task_id)
        )
        task = result.scalar_one_or_none()
        if not task:
            raise ValueError("Task not found")

        task.status = TaskStatus.CANCELLED
        task.completed_at = datetime.utcnow()
        await self.db.commit()
        # TODO: Cancel Celery task if running

    def _to_response(self, task: Task) -> TaskResponse:
        """Convert task model to response"""
        estimated_time = None
        if task.status == TaskStatus.RUNNING:
            # Simple estimation logic
            elapsed = (datetime.utcnow() - task.started_at).total_seconds() if task.started_at else 0
            if task.progress > 0:
                estimated_time = int((elapsed / task.progress) * (100 - task.progress))

        return TaskResponse(
            task_id=str(task.id),
            task_type=task.task_type.value,
            status=task.status.value,
            progress=task.progress,
            message=task.progress_message,
            output_data=task.output_data,
            error_message=task.error_message,
            created_at=task.created_at,
            started_at=task.started_at,
            completed_at=task.completed_at,
            estimated_time_remaining=estimated_time,
        )
