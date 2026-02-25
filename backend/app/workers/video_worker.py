from app.workers.celery_app import celery_app
from loguru import logger
import time


@celery_app.task(bind=True, name="app.workers.video_worker.generate_video")
def generate_video_task(self, task_data: dict):
    """
    Celery task for video generation
    """
    logger.info(f"Starting video generation task: {task_data}")
    task_id = self.request.id

    # Simulate video generation
    for i in range(0, 101, 10):
        time.sleep(2)
        self.update_state(
            state="PROGRESS",
            meta={
                "progress": i,
                "message": f"Generating video... {i}%",
            }
        )

    logger.info(f"Completed video generation task: {task_id}")
    return {
        "task_id": task_id,
        "status": "success",
        "video_url": "https://example.com/generated_video.mp4",
    }
