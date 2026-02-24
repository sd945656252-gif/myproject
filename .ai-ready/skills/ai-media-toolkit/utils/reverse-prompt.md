# Image-to-Prompt Reverse Engineering

This document describes how to analyze images and generate descriptive prompts.

## Overview

Image-to-prompt reverse engineering (also called "image captioning" or "prompt interrogation") analyzes an image to generate a text prompt that could recreate similar images.

## Methods

### Method 1: LLM Vision Analysis

Uses large language models with vision capabilities (GPT-4V, Claude 3) to analyze images.

**Advantages:**
- Natural language descriptions
- Understands complex scenes and context
- Can describe mood and atmosphere
- Good at identifying artistic styles

**Best For:**
- Complex scenes
- Artistic images
- Images with emotional content
- Professional photography

**Example Output:**
```
A serene Japanese garden at twilight, featuring a traditional curved wooden bridge
spanning a calm koi pond. Cherry blossom trees in full bloom cast delicate pink
petals across the scene. Soft ambient lighting creates a peaceful atmosphere.
The composition follows classic Japanese aesthetic principles with careful balance
of natural elements. Photorealistic style with warm color grading.
```

**Implementation:**

```python
def reverse_prompt_vision(image_path, detail_level="detailed"):
    """
    Use LLM Vision to analyze an image and generate a prompt.

    Args:
        image_path: Path to the image file
        detail_level: "brief", "detailed", or "comprehensive"

    Returns:
        Generated prompt string
    """
    import base64

    # Encode image
    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode()

    # Detail level prompts
    detail_prompts = {
        "brief": "Describe this image in a single sentence suitable for AI image generation.",
        "detailed": """Analyze this image and create a detailed prompt for AI image generation.
Include:
- Main subject(s) and their appearance
- Setting and environment
- Lighting and atmosphere
- Color palette and mood
- Art style or photography style
- Technical details (composition, angle, etc.)""",
        "comprehensive": """Create a comprehensive AI image generation prompt for this image.

Provide:
1. SUBJECT: Detailed description of main subjects
2. SETTING: Environment, background, location details
3. LIGHTING: Light source, quality, direction, shadows
4. ATMOSPHERE: Mood, feeling, emotional tone
5. COLORS: Dominant colors and color palette
6. STYLE: Art style, photography style, artistic influences
7. COMPOSITION: Camera angle, framing, perspective
8. TECHNICAL: Resolution hints, quality tags

Format as a single detailed prompt suitable for image generation."""
    }

    # Call vision API (Claude or GPT-4V)
    response = call_vision_api(
        image_data=image_data,
        prompt=detail_prompts[detail_level]
    )

    return response
```

### Method 2: CLIP Interrogator

Uses CLIP (Contrastive Language-Image Pre-training) models to identify image content.

**Advantages:**
- Fast processing
- Good at identifying styles and artists
- Generates tag-based prompts
- Works well with Stable Diffusion

**Best For:**
- Art and illustration
- Style identification
- Generating tag-based prompts
- Midjourney-style prompts

**Example Output:**
```
a beautiful japanese garden with cherry blossoms,
traditional wooden bridge over koi pond, serenity,
by Studio Ghibli, makoto shinkai style,
peaceful atmosphere, golden hour lighting,
highly detailed, 8k, artstation trending,
anime landscape, cinematic composition
```

**Implementation:**

```python
def reverse_prompt_clip(image_path, max_flavors=8):
    """
    Use CLIP Interrogator to analyze an image and generate tags.

    Args:
        image_path: Path to the image file
        max_flavors: Number of style tags to include

    Returns:
        Generated prompt string with tags
    """
    from PIL import Image
    # Note: Requires clip_interrogator library

    image = Image.open(image_path)

    # CLIP analysis
    results = analyze_with_clip(image)

    # Build prompt from components
    prompt_components = []

    # Main subject (from BLIP)
    prompt_components.append(results['caption'])

    # Style tags (from CLIP)
    prompt_components.extend(results['styles'][:max_flavors])

    # Artist influences
    if results.get('artists'):
        prompt_components.append(f"by {', '.join(results['artists'][:3])}")

    # Medium
    if results.get('medium'):
        prompt_components.append(results['medium'])

    return ', '.join(prompt_components)
```

### Method 3: Hybrid Approach

Combines both methods for comprehensive analysis.

**Workflow:**
1. Use CLIP for style, artist, and tag identification
2. Use Vision LLM for detailed scene description
3. Combine results into a comprehensive prompt

**Example Output:**
```
A traditional Japanese garden at twilight featuring a curved wooden arched bridge
crossing a tranquil koi pond with orange and white fish visible beneath the
surface. Cherry blossom trees in full bloom frame the scene, their delicate
pink petals floating on the water and scattered across the moss-covered stones.
Paper lanterns cast a warm, soft glow throughout the garden.

Style tags: Studio Ghibli inspired, Makoto Shinkai aesthetic, anime landscape,
peaceful atmosphere, golden hour lighting, highly detailed, cinematic
composition, by Kazuo Oga, environmental art, concept art, 8K resolution,
trending on ArtStation, masterful use of light and shadow.
```

## Output Formats

### Format 1: Natural Language Prompt

Best for DALL-E 3 and other natural-language models.

```
A peaceful Japanese garden scene at dusk. A curved wooden bridge arcs
gracefully over a still pond where koi fish swim lazily. Cherry blossom
trees surround the water, their pink petals drifting down like snow.
Traditional stone lanterns line a pathway, their warm light creating
gentle reflections on the water's surface. The scene has a serene,
meditative quality with soft, diffused lighting and a muted color
palette of pinks, greens, and warm earth tones.
```

### Format 2: Tag-Based Prompt

Best for Stable Diffusion and Midjourney.

```
japanese garden, cherry blossoms, wooden bridge, koi pond,
serene atmosphere, twilight, traditional architecture,
stone lanterns, mossy stones, falling petals,
by Studio Ghibli, Kazuo Oga style,
anime landscape, peaceful mood,
golden hour lighting, soft shadows,
highly detailed, 8K, cinematic,
trending on ArtStation, masterpiece
```

### Format 3: Structured Description

Best for detailed documentation and prompt refinement.

```yaml
Subject:
  - Traditional Japanese garden
  - Arched wooden bridge
  - Koi pond with fish

Setting:
  - Cherry blossom trees
  - Stone lanterns
  - Moss-covered pathway

Lighting:
  - Twilight / golden hour
  - Soft, diffused
  - Warm lantern glow

Colors:
  - Pink (cherry blossoms)
  - Green (foliage, moss)
  - Brown (wood, stone)
  - Orange (koi, lanterns)

Style:
  - Japanese aesthetic
  - Anime / Ghibli inspired
  - Environmental art

Mood:
  - Serene
  - Peaceful
  - Meditative

Technical:
  - Cinematic composition
  - Wide angle
  - High detail
```

### Format 4: Tags Only

Best for searching and categorization.

```json
{
  "subjects": ["japanese garden", "bridge", "koi fish", "cherry blossoms"],
  "styles": ["anime", "ghibli", "environmental art"],
  "artists": ["Kazuo Oga", "Studio Ghibli"],
  "mood": ["serene", "peaceful", "meditative"],
  "lighting": ["twilight", "golden hour", "soft"],
  "colors": ["pink", "green", "brown", "orange"],
  "quality": ["highly detailed", "8K", "cinematic"]
}
```

## Advanced Features

### Style Extraction

Identify artistic styles present in the image:

```python
def extract_style(image_path):
    """
    Extract style information from an image.

    Returns:
        Dictionary with style components
    """
    styles = {
        "art_movement": None,     # impressionism, surrealism, etc.
        "medium": None,           # oil painting, digital art, etc.
        "era": None,              # renaissance, modern, etc.
        "influences": [],         # artist names
        "techniques": [],         # cel shading, impasto, etc.
        "aesthetic": []           # cyberpunk, vaporwave, etc.
    }

    # Analysis logic here
    return styles
```

### Color Palette Extraction

Extract dominant colors:

```python
def extract_colors(image_path, n_colors=5):
    """
    Extract dominant color palette.

    Returns:
        List of (color, percentage, name) tuples
    """
    from PIL import Image
    import numpy as np

    img = Image.open(image_path)
    img = img.resize((150, 150))  # Resize for faster processing
    img_array = np.array(img)

    # K-means clustering for dominant colors
    colors = get_dominant_colors(img_array, n_colors)

    return [
        {
            "hex": rgb_to_hex(color),
            "rgb": color,
            "name": get_color_name(color),
            "percentage": percentage
        }
        for color, percentage in colors
    ]
```

### Composition Analysis

Analyze image composition:

```python
def analyze_composition(image_path):
    """
    Analyze compositional elements.

    Returns:
        Dictionary with composition details
    """
    return {
        "orientation": "landscape",  # or portrait, square
        "aspect_ratio": "16:9",
        "rule_of_thirds": {
            "main_subject_position": "left third",
            "horizon_line": "lower third"
        },
        "depth": "shallow",  # or medium, deep
        "leading_lines": ["bridge", "pathway"],
        "framing": ["trees on sides"],
        "symmetry": "none",  # or bilateral, radial
        "focal_points": ["bridge", "lantern"]
    }
```

## Quality Indicators

When analyzing an image, also identify:

| Indicator | Description |
|-----------|-------------|
| Sharpness | Is the image sharp or soft-focused? |
| Noise | Is there visible grain or noise? |
| Artifacts | JPEG compression, editing artifacts? |
| Resolution | Estimate original resolution |
| Dynamic Range | High contrast or flat? |

## Best Practices

1. **Use appropriate method for task:**
   - Vision LLM for detailed descriptions
   - CLIP for style/artist identification
   - Hybrid for comprehensive analysis

2. **Match output format to target platform:**
   - DALL-E 3 -> Natural language
   - Stable Diffusion -> Tag-based
   - Midjourney -> Tag-based with parameters

3. **Include negative prompt suggestions:**
   - Identify potential issues in the original
   - Suggest elements to avoid

4. **Provide multiple prompt variations:**
   - Simple version
   - Detailed version
   - Platform-specific versions
