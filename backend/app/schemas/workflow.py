from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime


class WorkflowStep(str, Enum):
    STORY = "story"
    SCRIPT = "script"
    CONFIG = "config"
    CHARACTER = "character"
    SHOTS = "shots"
    EDIT = "edit"


class CreateWorkflowRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)


class StoryInput(BaseModel):
    idea: str = Field(..., min_length=10, max_length=2000)


class StoryOutput(BaseModel):
    title: str
    plot_summary: str
    three_act_structure: Dict[str, List[str]]  # {setup: [], confrontation: [], resolution: []}
    themes: List[str]


class ScriptInput(BaseModel):
    story_data: Dict[str, Any]


class ScriptOutput(BaseModel):
    scenes: List[Dict[str, Any]]  # Each scene has dialogue, action, visual description
    total_scenes: int


class ConfigInput(BaseModel):
    script_data: Dict[str, Any]
    style_preference: Optional[str] = None
    aspect_ratio: Optional[str] = "16:9"
    fps: Optional[int] = 24


class ConfigOutput(BaseModel):
    recommended_model: str
    resolution: str
    fps: int
    style_config: Dict[str, Any]


class CharacterInput(BaseModel):
    script_data: Dict[str, Any]
    character_descriptions: Optional[List[str]] = None


class CharacterOutput(BaseModel):
    characters: List[Dict[str, Any]]  # Each has name, description, reference_image_url, views
    main_characters: List[str]


class ShotsInput(BaseModel):
    script_data: Dict[str, Any]
    config_data: Dict[str, Any]
    character_data: Dict[str, Any]


class ShotsOutput(BaseModel):
    shots: List[Dict[str, Any]]  # Each has scene_number, type (image/video), prompt, result_url
    total_shots: int
    generated_assets: List[str]


class EditInput(BaseModel):
    shots_data: Dict[str, Any]
    music_preference: Optional[str] = None


class EditOutput(BaseModel):
    edit_plan: List[Dict[str, Any]]  # Sequencing, transitions, timing
    music_suggestions: List[str]
    final_video_url: Optional[str] = None


class WorkflowResponse(BaseModel):
    workflow_id: str
    name: str
    status: str
    current_step: str
    created_at: datetime


class WorkflowStepResponse(BaseModel):
    workflow_id: str
    step: str
    status: str
    data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None


class WorkflowCompleteResponse(BaseModel):
    workflow_id: str
    status: str
    final_video_url: Optional[str] = None
    total_duration: Optional[float] = None
    completed_at: Optional[datetime] = None
