import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.workflow import Workflow, WorkflowStatus, WorkflowStep
from app.schemas.workflow import (
    CreateWorkflowRequest,
    WorkflowResponse,
    WorkflowStepResponse,
    WorkflowCompleteResponse,
)


class WorkflowService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_workflow(self, request: CreateWorkflowRequest) -> WorkflowResponse:
        """Create a new workflow"""
        workflow = Workflow(
            id=str(uuid.uuid4()),
            user_id="default_user",
            name=request.name,
            description=request.description,
            status=WorkflowStatus.DRAFT,
            current_step=WorkflowStep.STORY,
        )
        self.db.add(workflow)
        await self.db.commit()
        await self.db.refresh(workflow)
        return self._to_response(workflow)

    async def get_workflow(self, workflow_id: str) -> WorkflowResponse:
        """Get workflow by ID"""
        result = await self.db.execute(
            select(Workflow).where(Workflow.id == workflow_id)
        )
        workflow = result.scalar_one_or_none()
        if not workflow:
            raise ValueError("Workflow not found")
        return self._to_response(workflow)

    async def list_workflows(self, skip: int = 0, limit: int = 20) -> dict:
        """List workflows for user"""
        result = await self.db.execute(
            select(Workflow)
            .where(Workflow.user_id == "default_user")
            .offset(skip)
            .limit(limit)
        )
        workflows = result.scalars().all()
        return {
            "workflows": [self._to_response(w) for w in workflows],
            "total": len(workflows),
            "page": skip // limit + 1,
            "page_size": limit,
        }

    async def execute_story_step(self, workflow_id: str, idea: str) -> WorkflowStepResponse:
        """Step 1: Generate story from idea"""
        workflow = await self._get_workflow_by_id(workflow_id)
        # TODO: Call AI to generate story
        workflow.story_data = {
            "title": "Generated Title",
            "plot_summary": "Generated plot from idea",
            "three_act_structure": {
                "setup": ["Setup point 1", "Setup point 2"],
                "confrontation": ["Conflict 1", "Conflict 2"],
                "resolution": ["Resolution 1"],
            },
        }
        workflow.current_step = WorkflowStep.SCRIPT
        workflow.updated_at = datetime.utcnow()
        await self.db.commit()
        return WorkflowStepResponse(
            workflow_id=workflow_id,
            step="story",
            status="completed",
            data=workflow.story_data,
        )

    async def execute_script_step(self, workflow_id: str, script_data: dict) -> WorkflowStepResponse:
        """Step 2: Generate script from story"""
        workflow = await self._get_workflow_by_id(workflow_id)
        # TODO: Generate script from story_data
        workflow.script_data = {
            "scenes": [
                {
                    "scene_number": 1,
                    "location": "Scene location",
                    "dialogue": "Sample dialogue",
                    "action": "Sample action",
                    "visual_description": "Visual description",
                }
            ],
            "total_scenes": 1,
        }
        workflow.current_step = WorkflowStep.CONFIG
        workflow.updated_at = datetime.utcnow()
        await self.db.commit()
        return WorkflowStepResponse(
            workflow_id=workflow_id,
            step="script",
            status="completed",
            data=workflow.script_data,
        )

    async def execute_config_step(self, workflow_id: str, config_input: dict) -> WorkflowStepResponse:
        """Step 3: Generate configuration"""
        workflow = await self._get_workflow_by_id(workflow_id)
        workflow.config_data = {
            "recommended_model": "jimeng_seedance",
            "resolution": "1280x720",
            "fps": 24,
            "style_config": {"style": "cinematic", "quality": "high"},
        }
        workflow.current_step = WorkflowStep.CHARACTER
        workflow.updated_at = datetime.utcnow()
        await self.db.commit()
        return WorkflowStepResponse(
            workflow_id=workflow_id,
            step="config",
            status="completed",
            data=workflow.config_data,
        )

    async def execute_character_step(self, workflow_id: str, character_input: dict) -> WorkflowStepResponse:
        """Step 4: Generate character references"""
        workflow = await self._get_workflow_by_id(workflow_id)
        workflow.character_data = {
            "characters": [
                {
                    "name": "Character 1",
                    "description": "Description",
                    "reference_image_url": None,
                    "views": [],
                }
            ],
            "main_characters": ["Character 1"],
        }
        workflow.current_step = WorkflowStep.SHOTS
        workflow.updated_at = datetime.utcnow()
        await self.db.commit()
        return WorkflowStepResponse(
            workflow_id=workflow_id,
            step="character",
            status="completed",
            data=workflow.character_data,
        )

    async def execute_shots_step(self, workflow_id: str, shots_input: dict) -> WorkflowStepResponse:
        """Step 5: Generate shots"""
        workflow = await self._get_workflow_by_id(workflow_id)
        workflow.shots_data = {
            "shots": [
                {
                    "scene_number": 1,
                    "type": "video",
                    "prompt": "Shot prompt",
                    "result_url": None,
                }
            ],
            "total_shots": 1,
            "generated_assets": [],
        }
        workflow.current_step = WorkflowStep.EDIT
        workflow.updated_at = datetime.utcnow()
        await self.db.commit()
        return WorkflowStepResponse(
            workflow_id=workflow_id,
            step="shots",
            status="completed",
            data=workflow.shots_data,
        )

    async def execute_edit_step(self, workflow_id: str, edit_input: dict) -> WorkflowCompleteResponse:
        """Step 6: Generate edit suggestions"""
        workflow = await self._get_workflow_by_id(workflow_id)
        workflow.edit_data = {
            "edit_plan": [
                {
                    "shot_id": "shot_1",
                    "sequence": 1,
                    "duration": 5.0,
                    "transition": "fade",
                }
            ],
            "music_suggestions": ["cinematic_ambient"],
        }
        workflow.status = WorkflowStatus.COMPLETED
        workflow.completed_at = datetime.utcnow()
        workflow.updated_at = datetime.utcnow()
        await self.db.commit()
        return WorkflowCompleteResponse(
            workflow_id=workflow_id,
            status="completed",
            final_video_url=None,
            total_duration=5.0,
            completed_at=workflow.completed_at,
        )

    async def _get_workflow_by_id(self, workflow_id: str) -> Workflow:
        """Helper to get workflow by ID"""
        result = await self.db.execute(
            select(Workflow).where(Workflow.id == workflow_id)
        )
        workflow = result.scalar_one_or_none()
        if not workflow:
            raise ValueError("Workflow not found")
        return workflow

    def _to_response(self, workflow: Workflow) -> WorkflowResponse:
        """Convert workflow model to response"""
        return WorkflowResponse(
            workflow_id=str(workflow.id),
            name=workflow.name,
            status=workflow.status.value,
            current_step=workflow.current_step.value,
            created_at=workflow.created_at,
        )
