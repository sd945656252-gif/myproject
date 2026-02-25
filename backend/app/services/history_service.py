import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.models.task import Task, TaskStatus, TaskType
from loguru import logger
from typing import Optional, List, Dict


class HistoryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_history(
        self,
        user_id: str = "default_user",
        task_type: Optional[TaskType] = None,
        status: Optional[TaskStatus] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Dict:
        """Get user's generation history with filters"""
        query = select(Task).where(Task.user_id == user_id)

        if task_type:
            query = query.where(Task.task_type == task_type)

        if status:
            query = query.where(Task.status == status)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # Get paginated results
        query = query.order_by(desc(Task.created_at)).offset(offset).limit(limit)
        result = await self.db.execute(query)
        tasks = result.scalars().all()

        return {
            "tasks": [self._to_dict(task) for task in tasks],
            "total": total,
            "page": offset // limit + 1,
            "page_size": limit,
            "has_more": offset + limit < total,
        }

    async def get_task_by_id(self, task_id: str) -> Optional[Dict]:
        """Get task details by ID"""
        result = await self.db.execute(
            select(Task).where(Task.id == task_id)
        )
        task = result.scalar_one_or_none()

        if not task:
            return None

        return self._to_dict(task)

    async def update_task_status(
        self,
        task_id: str,
        status: TaskStatus,
        output_data: Optional[Dict] = None,
        error_message: Optional[str] = None,
    ) -> bool:
        """Update task status and output data"""
        result = await self.db.execute(
            select(Task).where(Task.id == task_id)
        )
        task = result.scalar_one_or_none()

        if not task:
            logger.error(f"Task not found: {task_id}")
            return False

        task.status = status
        task.updated_at = datetime.utcnow()

        if output_data:
            task.output_data = output_data

        if error_message:
            task.error_message = error_message

        if status == TaskStatus.COMPLETED:
            task.completed_at = datetime.utcnow()

        await self.db.commit()
        return True

    async def delete_task(self, task_id: str) -> bool:
        """Delete a task from history"""
        result = await self.db.execute(
            select(Task).where(Task.id == task_id)
        )
        task = result.scalar_one_or_none()

        if not task:
            return False

        await self.db.delete(task)
        await self.db.commit()
        logger.info(f"Task deleted: {task_id}")
        return True

    async def get_statistics(self, user_id: str = "default_user") -> Dict:
        """Get user generation statistics"""
        # Total tasks
        total_result = await self.db.execute(
            select(func.count()).where(Task.user_id == user_id)
        )
        total_tasks = total_result.scalar()

        # Tasks by type
        type_stats = {}
        for task_type in TaskType:
            result = await self.db.execute(
                select(func.count()).where(
                    Task.user_id == user_id,
                    Task.task_type == task_type
                )
            )
            type_stats[task_type.value] = result.scalar()

        # Tasks by status
        status_stats = {}
        for task_status in TaskStatus:
            result = await self.db.execute(
                select(func.count()).where(
                    Task.user_id == user_id,
                    Task.status == task_status
                )
            )
            status_stats[task_status.value] = result.scalar()

        # Recent activity (last 7 days)
        seven_days_ago = datetime.utcnow().timestamp() - 7 * 24 * 3600
        recent_result = await self.db.execute(
            select(func.count()).where(
                Task.user_id == user_id,
                Task.created_at >= datetime.fromtimestamp(seven_days_ago)
            )
        )
        recent_tasks = recent_result.scalar()

        return {
            "total_tasks": total_tasks,
            "by_type": type_stats,
            "by_status": status_stats,
            "recent_7_days": recent_tasks,
            "success_rate": (
                (status_stats.get("completed", 0) / total_tasks * 100)
                if total_tasks > 0 else 0
            ),
        }

    def _to_dict(self, task: Task) -> Dict:
        """Convert task model to dictionary"""
        return {
            "id": task.id,
            "user_id": task.user_id,
            "task_type": task.task_type.value,
            "status": task.status.value,
            "input_data": task.input_data,
            "output_data": task.output_data,
            "error_message": task.error_message,
            "provider_used": task.provider_used,
            "created_at": task.created_at.isoformat() if task.created_at else None,
            "updated_at": task.updated_at.isoformat() if task.updated_at else None,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None,
        }

    async def search_tasks(
        self,
        user_id: str = "default_user",
        query: str = "",
        limit: int = 20,
    ) -> List[Dict]:
        """Search tasks by prompt or output content"""
        # Simple search in input_data and output_data
        tasks = []

        result = await self.db.execute(
            select(Task)
            .where(Task.user_id == user_id)
            .order_by(desc(Task.created_at))
            .limit(limit * 2)  # Get more to filter
        )

        for task in result.scalars().all():
            # Search in input_data (prompt)
            if task.input_data and query.lower() in str(task.input_data).lower():
                tasks.append(self._to_dict(task))
                continue

            # Search in output_data
            if task.output_data and query.lower() in str(task.output_data).lower():
                tasks.append(self._to_dict(task))
                continue

            if len(tasks) >= limit:
                break

        return tasks
