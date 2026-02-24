# Prompt Style Templates

This file contains predefined style templates for prompt optimization.

## Realistic / Photorealistic

```json
{
  "name": "realistic",
  "displayName": "Realistic / Photorealistic",
  "description": "Photorealistic style with detailed textures and natural lighting",
  "positiveModifiers": [
    "photorealistic",
    "highly detailed",
    "8K resolution",
    "professional photography",
    "DSLR quality",
    "natural lighting",
    "sharp focus",
    "realistic textures"
  ],
  "negativeModifiers": [
    "cartoon",
    "anime",
    "illustration",
    "painting",
    "drawing",
    "artificial",
    "fake"
  ],
  "examplePrompts": [
    "A photorealistic portrait of a young woman with freckles, natural window lighting, soft bokeh background, shot on 85mm lens, professional photography",
    "A highly detailed photograph of a vintage pocket watch on aged leather, macro photography, dramatic side lighting, 8K resolution"
  ]
}
```

## Anime / Manga

```json
{
  "name": "anime",
  "displayName": "Anime / Manga",
  "description": "Japanese animation and manga art style",
  "positiveModifiers": [
    "anime style",
    "manga art",
    "cel shading",
    "vibrant colors",
    "expressive eyes",
    "clean lineart",
    "Studio Ghibli inspired",
    "anime aesthetic"
  ],
  "negativeModifiers": [
    "photorealistic",
    "3D render",
    "western cartoon",
    "realistic proportions",
    "photography"
  ],
  "examplePrompts": [
    "Anime style illustration of a magical girl with flowing pink hair, surrounded by cherry blossoms, soft pastel colors, Studio Ghibli inspired",
    "Dynamic manga panel showing a samurai warrior mid-strike, dramatic action lines, intense expression, black and white with screentones"
  ]
}
```

## Oil Painting

```json
{
  "name": "oil-painting",
  "displayName": "Oil Painting",
  "description": "Classic oil painting style with rich textures and brushstrokes",
  "positiveModifiers": [
    "oil painting",
    "classical art",
    "rich brushstrokes",
    "impasto technique",
    "museum quality",
    "old master style",
    "canvas texture",
    "dramatic chiaroscuro"
  ],
  "negativeModifiers": [
    "digital art",
    "photorealistic",
    "smooth",
    "modern",
    "flat colors"
  ],
  "examplePrompts": [
    "Classical oil painting of a serene landscape at golden hour, in the style of Claude Monet, visible brushstrokes, rich earth tones, museum quality",
    "Renaissance-style oil portrait, dramatic chiaroscuro lighting, rich deep colors, old master technique, ornate frame"
  ]
}
```

## Watercolor

```json
{
  "name": "watercolor",
  "displayName": "Watercolor",
  "description": "Soft watercolor painting style with gentle gradients",
  "positiveModifiers": [
    "watercolor painting",
    "soft washes",
    "delicate gradients",
    "wet-on-wet technique",
    "loose style",
    "paper texture",
    "flowing colors",
    "artistic splashes"
  ],
  "negativeModifiers": [
    "digital art",
    "sharp edges",
    "photorealistic",
    "heavy texture",
    "dark colors"
  ],
  "examplePrompts": [
    "Delicate watercolor painting of a Japanese garden, soft pink cherry blossoms, gentle color washes, white paper showing through, loose artistic style",
    "Watercolor illustration of a mountain lake at sunrise, soft gradients, artistic splashes, traditional Japanese sumi-e influence"
  ]
}
```

## Digital Art

```json
{
  "name": "digital-art",
  "displayName": "Digital Art / Illustration",
  "description": "Modern digital illustration and concept art style",
  "positiveModifiers": [
    "digital art",
    "concept art",
    "digital illustration",
    "trending on ArtStation",
    "highly detailed",
    "vibrant colors",
    "digital painting",
    "professional artwork"
  ],
  "negativeModifiers": [
    "photorealistic",
    "traditional media",
    "low resolution",
    "amateur"
  ],
  "examplePrompts": [
    "Digital concept art of a futuristic cityscape, neon lights reflecting on wet streets, cyberpunk aesthetic, trending on ArtStation, highly detailed",
    "Fantasy digital illustration of a dragon perched on a crystal spire, magical atmosphere, digital painting, professional artwork"
  ]
}
```

## 3D Render

```json
{
  "name": "3d-render",
  "displayName": "3D Render",
  "description": "3D rendered style with realistic materials and lighting",
  "positiveModifiers": [
    "3D render",
    "Cinema 4D",
    "Octane render",
    "ray tracing",
    "subsurface scattering",
    "volumetric lighting",
    "photorealistic materials",
    "product visualization"
  ],
  "negativeModifiers": [
    "illustration",
    "painting",
    "2D",
    "flat",
    "cartoon"
  ],
  "examplePrompts": [
    "Professional 3D render of a minimalist living room, soft natural lighting, photorealistic materials, Octane render, architectural visualization",
    "Product 3D render of a luxury watch, studio lighting, metallic materials, subsurface scattering, high-end advertising quality"
  ]
}
```

## Sketch / Drawing

```json
{
  "name": "sketch",
  "displayName": "Sketch / Drawing",
  "description": "Pencil sketch and hand-drawn illustration style",
  "positiveModifiers": [
    "pencil sketch",
    "hand-drawn",
    "charcoal drawing",
    "graphite",
    "paper texture",
    "artistic lines",
    "cross-hatching",
    "rough sketch"
  ],
  "negativeModifiers": [
    "digital",
    "photorealistic",
    "colorful",
    "rendered",
    "smooth"
  ],
  "examplePrompts": [
    "Detailed pencil sketch of an elderly fisherman, expressive cross-hatching, graphite on textured paper, artistic portrait study",
    "Rough charcoal sketch of a city street, loose gestural lines, dramatic shadows, artistic drawing style"
  ]
}
```

## Cyberpunk

```json
{
  "name": "cyberpunk",
  "displayName": "Cyberpunk",
  "description": "Futuristic cyberpunk aesthetic with neon lights and technology",
  "positiveModifiers": [
    "cyberpunk",
    "neon lights",
    "futuristic",
    "high-tech",
    "dystopian",
    "blade runner aesthetic",
    "holographic displays",
    "rain-slicked streets"
  ],
  "negativeModifiers": [
    "medieval",
    "natural",
    "rustic",
    "bright daylight",
    "pastoral"
  ],
  "examplePrompts": [
    "Cyberpunk cityscape at night, towering skyscrapers with neon advertisements, rain-slicked streets reflecting colorful lights, Blade Runner inspired, atmospheric fog",
    "Futuristic cyberpunk street vendor, holographic menu displays, neon-lit food stall, rain, high-tech aesthetic, moody atmosphere"
  ]
}
```

## Fantasy

```json
{
  "name": "fantasy",
  "displayName": "Fantasy Art",
  "description": "Magical fantasy art style with mythical elements",
  "positiveModifiers": [
    "fantasy art",
    "magical",
    "ethereal",
    "mystical",
    "enchanted",
    "otherworldly",
    "by Greg Rutkowski",
    "by Artgerm"
  ],
  "negativeModifiers": [
    "modern",
    "urban",
    "realistic",
    "technology",
    "contemporary"
  ],
  "examplePrompts": [
    "Epic fantasy art of an ancient tree spirit awakening, bioluminescent glow, mystical forest, by Greg Rutkowski, ethereal atmosphere, magical essence particles",
    "Fantasy illustration of a phoenix rising from flames, golden feathers, magical fire, dramatic lighting, by Artgerm, epic composition"
  ]
}
```

## Minimalist

```json
{
  "name": "minimalist",
  "displayName": "Minimalist",
  "description": "Clean, simple designs with minimal elements",
  "positiveModifiers": [
    "minimalist",
    "clean design",
    "simple",
    "negative space",
    "flat design",
    "modern",
    "elegant",
    "reduced color palette"
  ],
  "negativeModifiers": [
    "detailed",
    "complex",
    "busy",
    "ornate",
    "realistic"
  ],
  "examplePrompts": [
    "Minimalist illustration of a mountain landscape, simple geometric shapes, limited color palette of blue and white, clean modern design, ample negative space",
    "Minimalist logo design concept, abstract nature elements, elegant simplicity, flat design, single color on white background"
  ]
}
```

## Portrait

```json
{
  "name": "portrait",
  "displayName": "Portrait Photography",
  "description": "Professional portrait photography style",
  "positiveModifiers": [
    "portrait photography",
    "professional lighting",
    "studio lighting",
    "shallow depth of field",
    "bokeh",
    "85mm lens",
    "skin texture detail",
    "eye-level shot"
  ],
  "negativeModifiers": [
    "full body",
    "landscape",
    "distorted",
    "wide angle",
    "amateur"
  ],
  "examplePrompts": [
    "Professional portrait photography, young professional woman, studio lighting, soft shadows, shallow depth of field, 85mm lens, clean background, natural expression",
    "Environmental portrait of an artisan in their workshop, natural window light, shallow depth of field, authentic moment, professional portrait style"
  ]
}
```

## Cinematic

```json
{
  "name": "cinematic",
  "displayName": "Cinematic",
  "description": "Movie-like cinematic style with dramatic lighting",
  "positiveModifiers": [
    "cinematic",
    "movie still",
    "dramatic lighting",
    "anamorphic lens",
    "film grain",
    "color grading",
    "widescreen",
    "directorial style"
  ],
  "negativeModifiers": [
    "flat lighting",
    "amateur video",
    "documentary style",
    "studio backdrop"
  ],
  "examplePrompts": [
    "Cinematic wide shot of a lone figure walking through foggy streets, dramatic lighting, film noir aesthetic, anamorphic lens flare, atmospheric, like a Christopher Nolan film",
    "Movie still from an epic fantasy film, dramatic golden hour lighting, sweeping landscape, anamorphic widescreen, cinematic color grading, epic scale"
  ]
}
```

---

## Usage in Code

When applying style templates:

```python
def apply_style(prompt, style_name, intensity=0.7):
    """
    Apply style modifiers to a prompt.

    Args:
        prompt: Original user prompt
        style_name: Name of the style preset
        intensity: How strongly to apply the style (0.0-1.0)

    Returns:
        Enhanced prompt with style modifiers
    """
    style = STYLE_TEMPLATES.get(style_name)
    if not style:
        return prompt

    # Add positive modifiers based on intensity
    num_modifiers = int(len(style['positiveModifiers']) * intensity)
    selected_modifiers = style['positiveModifiers'][:num_modifiers]

    enhanced_prompt = f"{prompt}, {', '.join(selected_modifiers)}"

    return enhanced_prompt
```
