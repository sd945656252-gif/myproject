"""
Prompt Engineering API - Module 1
"""
import uuid
import json
import asyncio
from typing import Optional, AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.core.ai_router import get_router, AIRouter
from app.core.ai_router.base import TaskType
from app.schemas import (
    ApiResponse,
    PromptGenerateRequest,
    PromptGenerateResponse,
    TaskStatus,
)

router = APIRouter()


async def stream_response(
    content: str,
    metadata: Optional[dict] = None,
) -> AsyncGenerator[str, None]:
    """Generate SSE stream response."""
    # Split content into chunks for streaming effect
    chunk_size = 5  # characters per chunk
    for i in range(0, len(content), chunk_size):
        chunk = content[i:i + chunk_size]
        data = json.dumps({"content": chunk, "done": False})
        yield f"data: {data}\n\n"
        await asyncio.sleep(0.02)  # Small delay for effect

    # Send final chunk with metadata
    final_data = json.dumps({"content": "", "done": True, "metadata": metadata or {}})
    yield f"data: {final_data}\n\n"


@router.post("/generate", response_model=ApiResponse)
async def generate_prompt(
    request: PromptGenerateRequest,
    ai_router: AIRouter = Depends(get_router),
):
    """
    Generate or optimize prompts.

    - **image_to_prompt**: Reverse engineer prompt from an image
    - **optimize**: Optimize a prompt for specific API
    """
    task_type = (
        TaskType.IMAGE_TO_PROMPT
        if request.type == "image_to_prompt"
        else TaskType.PROMPT_OPTIMIZE
    )

    # Validate required params
    missing = ai_router.get_missing_params(
        task_type,
        image=request.image,
        prompt=request.prompt,
    )

    if missing:
        suggestions = ai_router.get_param_suggestions(task_type)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Missing required parameters",
                "missing": missing,
                "suggestions": suggestions,
            },
        )

    result, notification = await ai_router.generate(
        task_type,
        validate=True,
        image=request.image,
        prompt=request.prompt,
        target_api=request.target_api,
        language=request.language,
    )

    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.error,
        )

    return ApiResponse(
        success=True,
        message=notification,
        data=PromptGenerateResponse(**result.data),
    )


@router.post("/stream", response_class=StreamingResponse)
async def stream_prompt_generation(
    request: PromptGenerateRequest,
    ai_router: AIRouter = Depends(get_router),
):
    """
    Stream prompt generation results using Server-Sent Events.
    """
    task_type = (
        TaskType.IMAGE_TO_PROMPT
        if request.type == "image_to_prompt"
        else TaskType.PROMPT_OPTIMIZE
    )

    # Validate required params
    missing = ai_router.get_missing_params(
        task_type,
        image=request.image,
        prompt=request.prompt,
    )

    if missing:
        error_data = json.dumps({"content": "", "done": True, "error": f"Missing params: {missing}"})
        return StreamingResponse(
            iter([f"data: {error_data}\n\n"]),
            media_type="text/event-stream",
        )

    # Generate the prompt
    result, notification = await ai_router.generate(
        task_type,
        validate=True,
        image=request.image,
        prompt=request.prompt,
        target_api=request.target_api,
        language=request.language,
    )

    if not result.success:
        error_data = json.dumps({"content": "", "done": True, "error": result.error})
        return StreamingResponse(
            iter([f"data: {error_data}\n\n"]),
            media_type="text/event-stream",
        )

    # Stream the response
    prompt_data = result.data
    content = prompt_data.get("prompt", "")

    return StreamingResponse(
        stream_response(
            content,
            metadata={
                "tags": prompt_data.get("tags", []),
                "suggestions": prompt_data.get("suggestions", []),
                "notification": notification,
            },
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/task/{task_id}", response_model=TaskStatus)
async def get_task_status(task_id: uuid.UUID):
    """
    Get status of an async prompt generation task.
    """
    # TODO: Implement task status lookup
    return TaskStatus(
        task_id=task_id,
        status="completed",
        progress=100,
    )
