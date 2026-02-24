# API Configuration Utilities

This file contains utilities for API configuration and platform detection.

## Environment Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...  # Optional

# Stability AI Configuration
STABILITY_API_KEY=sk-...

# Replicate Configuration
REPLICATE_API_TOKEN=r8_...

# Runway Configuration
RUNWAY_API_KEY=...
```

## Platform Detection

### Automatic Platform Selection

When `platform=auto`, the system selects the best platform based on:

1. **Available API Keys**
   - Check which API keys are configured
   - Use the first available platform

2. **Task Requirements**
   - Image generation -> Prefer DALL-E 3 or Stable Diffusion XL
   - Video generation -> Prefer Runway or Pika
   - Reverse prompt -> Prefer Vision API (Claude/GPT-4V)

3. **Style Compatibility**
   - Anime/Fantasy -> Stability AI (better style control)
   - Photorealistic -> OpenAI DALL-E 3
   - Artistic -> Stability AI

### Platform Capabilities Matrix

| Feature | OpenAI | Stability AI | Replicate | Runway |
|---------|--------|--------------|-----------|--------|
| Image Generation | DALL-E 3 | SDXL, SD 1.5 | Multiple | No |
| Video Generation | Sora (limited) | Coming Soon | Yes | Yes |
| Image-to-Image | Yes | Yes | Yes | Yes |
| Inpainting | Yes | Yes | Yes | Yes |
| Upscaling | Yes | Yes | Yes | Yes |
| Reverse Prompt | Via Vision | Via CLIP | Yes | No |
| Speed | Medium | Fast | Variable | Slow |
| Cost | Higher | Lower | Variable | Higher |

## Configuration File

Default location: `~/.ai-media-toolkit/config.json`

```json
{
  "version": "1.0.0",
  "default_platform": "auto",
  "default_style": "realistic",
  "default_size": "1024x1024",
  "output_directory": "./ai-media-output",

  "platforms": {
    "openai": {
      "enabled": true,
      "model": "dall-e-3",
      "quality": "standard",
      "size": "1024x1024"
    },
    "stability": {
      "enabled": true,
      "model": "stable-diffusion-xl-1024-v1-0",
      "steps": 30,
      "cfg_scale": 7
    },
    "replicate": {
      "enabled": false,
      "model_version": "latest"
    },
    "runway": {
      "enabled": false,
      "model": "gen2"
    }
  },

  "prompt_optimization": {
    "detail_level": "balanced",
    "include_negative": true,
    "max_length": 1000,
    "default_style": "realistic"
  },

  "reverse_prompt": {
    "method": "auto",
    "detail_level": "detailed",
    "include_style_tags": true
  },

  "rate_limiting": {
    "requests_per_minute": 10,
    "retry_attempts": 3,
    "retry_delay_ms": 1000
  }
}
```

## API Endpoints

### OpenAI

```yaml
Base URL: https://api.openai.com/v1

Endpoints:
  - POST /images/generations    # DALL-E image generation
  - POST /images/edits          # Image editing
  - POST /images/variations     # Image variations
  - POST /chat/completions      # GPT-4V for vision tasks

Models:
  - dall-e-3    # Latest, highest quality
  - dall-e-2    # Legacy, cheaper
  - gpt-4-vision-preview  # For reverse prompts
  - gpt-4o      # For prompt optimization
```

### Stability AI

```yaml
Base URL: https://api.stability.ai/v1

Endpoints:
  - POST /generation/{model_id}/text-to-image
  - POST /generation/{model_id}/image-to-image
  - POST /generation/{model_id}/image-to-video
  - POST /generation/{model_id}/upscale

Models:
  - stable-diffusion-xl-1024-v1-0
  - stable-diffusion-v1-6
  - stable-video-diffusion-v1
```

### Replicate

```yaml
Base URL: https://api.replicate.com/v1

Models:
  - stability-ai/sdxl
  - stability-ai/sdv1-5
  - runwayml/gen2
  - anotherjesse/zeroscope-v2-xl

Endpoints:
  - POST /predictions
  - GET /predictions/{id}
```

## Error Handling

### Common Error Codes

| Code | Platform | Description | Solution |
|------|----------|-------------|----------|
| 401 | All | Invalid API key | Check key configuration |
| 429 | All | Rate limited | Wait and retry |
| 400 | All | Invalid request | Check parameters |
| 500 | All | Server error | Retry with backoff |
| content_policy | OpenAI | Content violation | Modify prompt |

### Retry Strategy

```python
def retry_with_backoff(func, max_retries=3, base_delay=1):
    """
    Retry a function with exponential backoff.

    Delays: 1s, 2s, 4s
    """
    for attempt in range(max_retries):
        try:
            return func()
        except RateLimitError:
            if attempt == max_retries - 1:
                raise
            delay = base_delay * (2 ** attempt)
            time.sleep(delay)
    raise MaxRetriesExceededError()
```

## Response Caching

Cache generated images and prompts to avoid duplicate API calls:

```python
import hashlib
import json

def get_cache_key(prompt, platform, style, size):
    """
    Generate a unique cache key for a generation request.
    """
    data = f"{prompt}|{platform}|{style}|{size}"
    return hashlib.sha256(data.encode()).hexdigest()

def cache_response(cache_key, response, ttl=86400):
    """
    Cache API response with TTL (default 24 hours).
    """
    # Implementation depends on cache backend
    pass
```

## Cost Estimation

### OpenAI DALL-E 3 Pricing

| Quality | Size | Price |
|---------|------|-------|
| Standard | 1024x1024 | $0.040 |
| Standard | 1792x1024 | $0.080 |
| Standard | 1024x1792 | $0.080 |
| HD | 1024x1024 | $0.080 |
| HD | 1792x1024 | $0.120 |
| HD | 1024x1792 | $0.120 |

### Stability AI Pricing

| Plan | Credits/Month | Cost |
|------|---------------|------|
| Free | 25 | $0 |
| Pro | 1000 | $10 |
| Premium | 5000 | $49 |

Cost per image: ~1-2 credits depending on steps and size.

### Cost Optimization Tips

1. **Use Stability AI for iterations** - Cheaper for experimentation
2. **Use DALL-E 3 for final outputs** - Higher quality when needed
3. **Cache repeated requests** - Avoid duplicate generations
4. **Batch similar requests** - Some platforms offer batch discounts
5. **Use lower steps for drafts** - Reduce steps for quick previews
