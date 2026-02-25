# AI Router Priority Configuration
# Priority: 1 (highest) -> N (lowest)

MODEL_PRIORITIES = {
    "image_generation": [
        {
            "provider": "huggingface",
            "model": "stabilityai/stable-diffusion-xl-base-1.0",
            "priority": 1,
            "cost": "free",
        },
        {
            "provider": "jimeng",
            "model": "jimeng-v1",
            "priority": 2,
            "cost": "paid",
        },
        {
            "provider": "openai",
            "model": "dall-e-3",
            "priority": 3,
            "cost": "paid",
        },
        {
            "provider": "comfyui",
            "model": "local-sdxl",
            "priority": 99,
            "cost": "free",
            "fallback_only": True,
        },
    ],
    "video_generation": [
        {
            "provider": "jimeng",
            "model": "seedance2.0",
            "priority": 1,
            "cost": "paid",
        },
        {
            "provider": "kling",
            "model": "kling-3.0",
            "priority": 2,
            "cost": "paid",
        },
        {
            "provider": "vidu",
            "model": "vidu-pro",
            "priority": 3,
            "cost": "paid",
        },
        {
            "provider": "sora",
            "model": "sora-1.0",
            "priority": 4,
            "cost": "paid",
        },
        {
            "provider": "comfyui",
            "model": "local-video",
            "priority": 99,
            "cost": "free",
            "fallback_only": True,
        },
    ],
    "music_generation": [
        {
            "provider": "suno",
            "model": "suno-v3",
            "priority": 1,
            "cost": "paid",
        },
    ],
    "tts": [
        {
            "provider": "minimax",
            "model": "speech-01",
            "priority": 1,
            "cost": "paid",
        },
        {
            "provider": "openai",
            "model": "tts-1",
            "priority": 2,
            "cost": "paid",
        },
    ],
}

# Retry configuration
RETRY_CONFIG = {
    "max_attempts": 3,
    "initial_delay": 1.0,
    "max_delay": 10.0,
    "backoff_factor": 2.0,
}
