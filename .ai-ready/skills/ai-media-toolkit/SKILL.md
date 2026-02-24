---
name: ai-media-toolkit
description: AI multimedia toolkit for image generation, video generation, image-to-prompt reverse engineering, and prompt optimization. Supports multiple AI platforms including OpenAI DALL-E, Stability AI, and more.
arguments:
  - name: action
    description: Action to perform - generate-image, generate-video, reverse-prompt, optimize-prompt
    required: true
  - name: prompt
    description: The prompt text for generation or optimization
    required: false
  - name: image_path
    description: Path to the image file for reverse prompt or reference
    required: false
  - name: platform
    description: AI platform to use - openai, stability, auto (default: auto)
    required: false
  - name: style
    description: Style preset for image generation - realistic, anime, oil-painting, watercolor, digital-art, 3d-render, etc.
    required: false
---

# AI Media Toolkit

A comprehensive AI multimedia toolkit that provides image generation, video generation, image-to-prompt reverse engineering, and prompt optimization capabilities across multiple AI platforms.

## Features

- **AI Image Generation**: Generate images from text prompts using DALL-E 3, Stable Diffusion, etc.
- **AI Video Generation**: Create videos from text or image prompts
- **Image-to-Prompt Reverse Engineering**: Analyze images to generate descriptive prompts
- **Prompt Optimization**: Enhance and refine prompts for better generation results

## Supported Platforms

| Platform | Image Gen | Video Gen | Reverse Prompt | Capabilities |
|----------|-----------|-----------|----------------|--------------|
| OpenAI (DALL-E/Sora) | Yes | Yes | Via Vision API | High quality, creative |
| Stability AI | Yes | Coming Soon | Yes | Fast, customizable |
| Replicate | Yes | Yes | Yes | Multi-model access |

## Quick Start

### 1. Generate Image

```bash
npx ai-media-toolkit generate-image --prompt "A serene Japanese garden at sunset" --style realistic
```

Or use in conversation:
```
/ai-media-toolkit generate-image "A serene Japanese garden at sunset" --style realistic
```

### 2. Generate Video

```bash
npx ai-media-toolkit generate-video --prompt "A cat playing piano" --duration 5
```

### 3. Reverse Engineer Image Prompt

```bash
npx ai-media-toolkit reverse-prompt --image_path ./my-image.jpg
```

### 4. Optimize Prompt

```bash
npx ai-media-toolkit optimize-prompt --prompt "cat" --style anime
```

---

## Detailed Usage

## 1. AI Image Generation (`generate-image`)

Generate high-quality images from text descriptions.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| prompt | string | Yes | Text description of the image to generate |
| platform | string | No | Platform: `openai`, `stability`, `auto` (default: auto) |
| style | string | No | Style preset (see Style Presets below) |
| size | string | No | Image size: `1024x1024`, `1792x1024`, `1024x1792` |
| quality | string | No | Quality: `standard`, `hd` (OpenAI only) |
| n | integer | No | Number of images to generate (1-4) |

### Style Presets

| Style | Description | Best For |
|-------|-------------|----------|
| realistic | Photorealistic, detailed | Photography, portraits |
| anime | Japanese animation style | Characters, scenes |
| oil-painting | Classic oil painting look | Artistic, classical |
| watercolor | Soft watercolor effect | Gentle, artistic |
| digital-art | Modern digital illustration | Concept art, graphics |
| 3d-render | 3D rendered style | Product visualization |
| sketch | Pencil sketch style | Quick concepts |
| cyberpunk | Futuristic, neon-lit | Sci-fi scenes |
| fantasy | Fantasy art style | Magical, mythical |

### Examples

**Basic Generation:**
```
Generate an image: "A majestic mountain landscape with a crystal clear lake"
```

**With Style:**
```
Generate an anime-style image: "A young warrior standing on a cliff at dawn"
```

**With Platform Selection:**
```
Generate using Stability AI: "A futuristic cityscape with flying cars"
```

## 2. AI Video Generation (`generate-video`)

Create videos from text prompts or animate existing images.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| prompt | string | Yes* | Text description (required if no image) |
| image_path | string | Yes* | Source image for animation (required if no prompt) |
| platform | string | No | Platform: `openai`, `stability`, `runway`, `auto` |
| duration | integer | No | Video duration in seconds (default: 5) |
| aspect_ratio | string | No | Aspect ratio: `16:9`, `9:16`, `1:1` |
| fps | integer | No | Frames per second (default: 24) |

### Examples

**Text to Video:**
```
Generate a 5-second video: "A peaceful forest with sunlight filtering through leaves"
```

**Image to Video:**
```
Animate this image: ./landscape.jpg with gentle camera zoom
```

## 3. Image-to-Prompt Reverse Engineering (`reverse-prompt`)

Analyze an image to generate a detailed text prompt that could recreate it.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| image_path | string | Yes | Path to the image file |
| method | string | No | Analysis method: `vision`, `clip`, `auto` |
| detail_level | string | No | Detail level: `brief`, `detailed`, `comprehensive` |
| output_format | string | No | Format: `prompt`, `description`, `tags` |

### Methods

| Method | Description | Best For |
|--------|-------------|----------|
| vision | LLM Vision (Claude/GPT-4V) | Complex scenes, artistic analysis |
| clip | CLIP Interrogator | Style identification, tags |
| auto | Automatically select | General use |

### Example Output

```
Input: ./artwork.jpg

Output Prompt:
"A vibrant digital painting of a mystical forest at twilight,
bioluminescent mushrooms glowing along a winding path,
towering ancient trees with twisted branches,
ethereal mist rolling through the scene,
soft purple and blue color palette,
fantasy art style, highly detailed, by Greg Rutkowski and Artgerm"
```

## 4. Prompt Optimization (`optimize-prompt`)

Enhance simple prompts into detailed, effective prompts for better generation results.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| prompt | string | Yes | Original prompt to optimize |
| style | string | No | Target style for optimization |
| platform | string | No | Target platform for optimization |
| detail_level | string | No | `concise`, `balanced`, `detailed` |
| include_negative | boolean | No | Include negative prompts |

### Optimization Strategies

1. **LLM Enhancement**: Uses Claude/GPT to expand and refine prompts
2. **Style Templates**: Applies predefined style modifiers
3. **Platform Optimization**: Tailors prompts for specific AI models

### Example Transformations

**Input:**
```
"cat"
```

**Optimized Output:**
```
"A majestic Maine Coon cat with luxurious fluffy fur,
sitting gracefully on a velvet cushion in a sunlit library,
warm golden hour lighting streaming through tall windows,
bokeh effect in the background, detailed fur texture,
emerald green eyes looking directly at the camera,
photorealistic style, 8K resolution, shallow depth of field"
```

**With Style (Anime):**
```
"An adorable chibi-style cat character with large expressive eyes,
soft pastel fur in cream and orange patches,
wearing a small blue bow tie,
sitting on a cherry blossom branch,
springtime anime aesthetic, Studio Ghibli inspired,
warm soft lighting, gentle color palette"
```

---

## Configuration

### Environment Variables

Set these environment variables for API access:

```bash
# OpenAI
export OPENAI_API_KEY="sk-..."

# Stability AI
export STABILITY_API_KEY="sk-..."

# Replicate (optional)
export REPLICATE_API_TOKEN="r8_..."
```

### Configuration File

Create `~/.ai-media-toolkit/config.json`:

```json
{
  "default_platform": "auto",
  "default_style": "realistic",
  "default_size": "1024x1024",
  "platforms": {
    "openai": {
      "model": "dall-e-3",
      "quality": "standard"
    },
    "stability": {
      "model": "stable-diffusion-xl",
      "steps": 30
    }
  },
  "prompt_optimization": {
    "detail_level": "balanced",
    "include_negative": true
  }
}
```

---

## Workflow Examples

### Complete Image Generation Workflow

1. **Start with a simple idea:**
   ```
   Optimize this prompt: "castle"
   ```

2. **Review the optimized prompt:**
   ```
   "A majestic medieval castle perched on a rocky cliff overlooking a stormy sea,
   dramatic lightning in the background, dark clouds swirling,
   gothic architecture with towering spires, torch lights glowing from windows,
   fantasy art style, cinematic lighting, highly detailed, 8K resolution"
   ```

3. **Generate the image:**
   ```
   Generate image with the optimized prompt, style: fantasy
   ```

### Reverse Engineer and Recreate

1. **Analyze an existing image:**
   ```
   Reverse prompt from: ./reference-image.jpg
   ```

2. **Get the extracted prompt:**
   ```
   "A minimalist workspace with a MacBook, succulent plant, and ceramic coffee cup,
   natural daylight from a nearby window, clean white desk surface,
   Scandinavian design aesthetic, soft shadows, product photography style"
   ```

3. **Generate similar images:**
   ```
   Generate image with that prompt, style: realistic
   ```

---

## Best Practices

### Prompt Writing Tips

1. **Be Specific**: Include details about subject, setting, lighting, and style
2. **Use Descriptive Adjectives**: Instead of "nice", use "ethereal", "dramatic", "serene"
3. **Reference Art Styles**: Mention artists or movements (e.g., "in the style of Monet")
4. **Specify Technical Details**: Resolution, aspect ratio, quality level

### Negative Prompts

When using platforms that support negative prompts:

```
Negative prompt: "blurry, low quality, distorted, deformed,
ugly, bad anatomy, watermark, signature, text"
```

### Style Modifiers

Common style modifiers to add to prompts:

| Modifier | Effect |
|----------|--------|
| highly detailed | Adds fine details |
| cinematic lighting | Dramatic, film-like lighting |
| golden hour | Warm, soft lighting |
| bokeh | Blurred background |
| 8K resolution | High detail |
| trending on artstation | Popular art styles |

---

## Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Ensure environment variables are set correctly
   - Check the configuration file path

2. **Rate Limiting**
   - Wait and retry with exponential backoff
   - Consider using a different platform

3. **Poor Quality Results**
   - Optimize your prompt with more details
   - Try a different style preset
   - Increase quality settings

4. **Image Analysis Fails**
   - Ensure image format is supported (JPG, PNG, WebP)
   - Check file size limits (typically < 20MB)

---

## API Reference

### generate-image

```javascript
{
  "action": "generate-image",
  "prompt": "string",
  "platform": "openai|stability|auto",
  "style": "realistic|anime|...",
  "size": "1024x1024|1792x1024|1024x1792",
  "quality": "standard|hd",
  "n": 1
}
```

### generate-video

```javascript
{
  "action": "generate-video",
  "prompt": "string",
  "image_path": "string",
  "platform": "openai|stability|runway|auto",
  "duration": 5,
  "aspect_ratio": "16:9|9:16|1:1"
}
```

### reverse-prompt

```javascript
{
  "action": "reverse-prompt",
  "image_path": "string",
  "method": "vision|clip|auto",
  "detail_level": "brief|detailed|comprehensive"
}
```

### optimize-prompt

```javascript
{
  "action": "optimize-prompt",
  "prompt": "string",
  "style": "string",
  "platform": "string",
  "detail_level": "concise|balanced|detailed",
  "include_negative": true
}
```
