from fastapi import APIRouter
from app.api.v1 import image, prompt, workflow, video, audio, history, root

api_router = APIRouter()
api_router.include_router(root.router, prefix="")
api_router.include_router(image.router, prefix="/image", tags=["image"])
api_router.include_router(prompt.router, prefix="/prompt", tags=["prompt"])
api_router.include_router(workflow.router, prefix="/workflow", tags=["workflow"])
api_router.include_router(video.router, prefix="/video", tags=["video"])
api_router.include_router(audio.router, prefix="/audio", tags=["audio"])
api_router.include_router(history.router, prefix="/history", tags=["history"])
