from app.workers.celery_app import celery_app
from loguru import logger
import time


@celery_app.task(bind=True, name="app.workers.audio_worker.generate_music")
def generate_music_task(self, task_data: dict):
    """
    Celery task for music generation
    """
    logger.info(f"Starting music generation task: {task_data}")
    task_id = self.request.id

    # Simulate music generation
    for i in range(0, 101, 10):
        time.sleep(1)
        self.update_state(
            state="PROGRESS",
            meta={
                "progress": i,
                "message": f"Generating music... {i}%",
            }
        )

    logger.info(f"Completed music generation task: {task_id}")
    return {
        "task_id": task_id,
        "status": "success",
        "audio_url": "https://example.com/generated_music.mp3",
    }
