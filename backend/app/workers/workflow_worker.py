from app.workers.celery_app import celery_app
from loguru import logger


@celery_app.task(bind=True, name="app.workers.workflow_worker.execute_step")
def execute_workflow_step_task(self, workflow_id: str, step: str, data: dict):
    """
    Celery task for workflow step execution
    """
    logger.info(f"Executing workflow step: {workflow_id} - {step}")
    # TODO: Implement actual workflow step logic
    return {
        "workflow_id": workflow_id,
        "step": step,
        "status": "success",
    }
