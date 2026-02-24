# Prompt Optimization Templates

This file contains templates and strategies for optimizing prompts.

## Optimization Strategies

### Strategy 1: Structure Enhancement

Transform simple prompts into well-structured, detailed prompts.

**Input Structure:**
```
[Subject] + [Action/Pose] + [Setting] + [Lighting] + [Style] + [Technical Details]
```

**Example Transformation:**

| Level | Prompt |
|-------|--------|
| Original | `cat` |
| Basic | `A cat sitting on a chair` |
| Enhanced | `A fluffy orange tabby cat sitting gracefully on a vintage wooden chair, warm afternoon sunlight streaming through a nearby window, soft shadows, photorealistic style` |
| Comprehensive | `A majestic Maine Coon cat with luxurious long fur in shades of orange and cream, sitting elegantly on an antique mahogany chair with velvet upholstery, warm golden hour light filtering through sheer curtains, creating soft bokeh in the background, detailed fur texture with individual hairs visible, emerald green eyes with catchlights, professional pet photography, shot with 85mm lens at f/1.8, shallow depth of field, 8K resolution, natural color grading` |

### Strategy 2: Style Injection

Add style-specific modifiers to enhance the aesthetic.

**Template:**
```
[Original Prompt] + [Style Modifiers] + [Artist References] + [Quality Tags]
```

**Example:**

| Style | Enhanced Prompt |
|-------|-----------------|
| Anime | `[prompt], anime style, cel shading, vibrant colors, Studio Ghibli inspired, clean lineart, expressive features` |
| Oil Painting | `[prompt], classical oil painting, visible brushstrokes, rich textures, museum quality, in the style of Monet, dramatic chiaroscuro` |
| Cyberpunk | `[prompt], cyberpunk aesthetic, neon lights, rain-slicked surfaces, futuristic, Blade Runner inspired, holographic elements` |

### Strategy 3: Technical Enhancement

Add technical specifications for better output quality.

**Common Technical Modifiers:**

| Category | Modifiers |
|----------|-----------|
| Resolution | `8K resolution`, `4K`, `highly detailed`, `sharp focus` |
| Lighting | `golden hour`, `studio lighting`, `volumetric lighting`, `soft shadows` |
| Camera | `shot on 85mm lens`, `shallow depth of field`, `bokeh`, `wide angle` |
| Quality | `professional`, `masterpiece`, `trending on ArtStation`, `award-winning` |

### Strategy 4: Negative Prompt Generation

Generate negative prompts to avoid unwanted elements.

**Template:**
```
Negative: [Quality Issues] + [Style Conflicts] + [Unwanted Elements]
```

**Common Negative Prompts by Category:**

```json
{
  "general": [
    "blurry", "low quality", "pixelated", "distorted",
    "deformed", "ugly", "bad anatomy", "watermark",
    "signature", "text", "logo"
  ],
  "portrait": [
    "bad proportions", "extra limbs", "missing fingers",
    "distorted face", "asymmetric features", "bad hands"
  ],
  "landscape": [
    "cropped", "tilted horizon", "lens flare",
    "overexposed", "underexposed"
  ],
  "anime": [
    "photorealistic", "3D", "western cartoon",
    "realistic proportions", "photography"
  ],
  "realistic": [
    "cartoon", "anime", "illustration", "painting",
    "drawing", "artificial", "fake"
  ]
}
```

---

## Platform-Specific Optimization

### OpenAI DALL-E 3

DALL-E 3 works best with natural language descriptions.

**Guidelines:**
- Use complete sentences
- Describe the scene naturally
- Include emotional context
- Avoid technical jargon

**Example:**
```
A serene Japanese garden at golden hour, with a traditional red bridge
crossing over a koi pond filled with colorful fish. Cherry blossom petals
float gently in the air, and warm sunlight filters through maple trees.
The scene has a peaceful, meditative atmosphere.
```

### Stability AI (Stable Diffusion)

Stable Diffusion responds well to comma-separated tags.

**Guidelines:**
- Use comma-separated tags
- Put important elements first
- Include quality tags
- Use artist names for style

**Example:**
```
serene Japanese garden, red bridge, koi pond, cherry blossoms,
golden hour lighting, maple trees, peaceful atmosphere,
highly detailed, 8K, masterpiece, by Greg Rutkowski,
soft lighting, warm colors, professional photography
```

### Midjourney

Midjourney has its own syntax preferences.

**Guidelines:**
- Use `--` for parameters
- Put important concepts at the start
- Use `::` for weights (v5)
- Include aspect ratio `--ar`

**Example:**
```
serene Japanese garden with red bridge and koi pond,
cherry blossoms, golden hour, maple trees
--ar 16:9 --v 5.2 --style scenic --q 2
```

---

## Prompt Enhancement Templates

### Template 1: Subject Enhancement

For prompts focusing on a main subject:

```markdown
**Input:** [simple subject]

**Output Structure:**
[Adjectives] [Subject] with [Distinctive Features],
[Action/Pose/Position],
[Setting/Environment],
[Lighting Conditions],
[Atmosphere/Mood],
[Style Modifiers],
[Technical Specifications]
```

**Example:**
```
Input: wizard

Output:
An ancient wizard with a flowing white beard and piercing blue eyes,
raising a gnarled oak staff crowned with a glowing crystal,
standing on a rocky cliff overlooking a stormy sea,
dramatic lightning illuminating the scene,
mystical and powerful atmosphere,
fantasy art style, by Frank Frazetta,
highly detailed, dramatic chiaroscuro, 8K resolution
```

### Template 2: Scene Enhancement

For prompts describing environments or landscapes:

```markdown
**Input:** [location/scene]

**Output Structure:**
[Atmospheric Opening],
[Main Environment Description],
[Secondary Elements],
[Weather/Time of Day],
[Lighting Effects],
[Mood/Feeling],
[Art Style],
[Quality Tags]
```

**Example:**
```
Input: forest

Output:
A mystical ancient forest shrouded in ethereal morning mist,
towering trees with twisted branches covered in bioluminescent moss,
a winding path of fallen leaves leading into the depths,
soft diffused light filtering through the canopy,
fireflies dancing in the air,
peaceful yet mysterious atmosphere,
fantasy landscape art, Studio Ghibli inspired,
highly detailed, volumetric lighting, 8K resolution
```

### Template 3: Action Enhancement

For prompts involving movement or action:

```markdown
**Input:** [subject doing action]

**Output Structure:**
[Dynamic Subject Description],
[Action Details with Motion],
[Impact/Result of Action],
[Setting/Background],
[Camera Angle/Movement],
[Atmospheric Effects],
[Style],
[Technical Details]
```

**Example:**
```
Input: knight fighting dragon

Output:
A valiant knight in gleaming silver armor, mid-swing with a flaming sword,
clashing against a massive crimson dragon with scales reflecting firelight,
sparks and embers flying from the impact,
in a crumbling ancient temple with shattered pillars,
dynamic low-angle shot emphasizing the epic scale,
smoke and dramatic lighting,
fantasy action art, cinematic composition,
dramatic chiaroscuro, motion blur, 8K
```

---

## Quality Enhancement Phrases

### For Image Quality

| Phrase | Effect |
|--------|--------|
| `highly detailed` | Adds fine details |
| `8K resolution` | Increases clarity |
| `sharp focus` | Improves definition |
| `professional photography` | Enhances realism |
| `masterpiece` | Overall quality boost |
| `trending on ArtStation` | Modern art style |
| `award-winning` | Quality indicator |

### For Lighting

| Phrase | Effect |
|--------|--------|
| `golden hour` | Warm, soft light |
| `volumetric lighting` | Atmospheric rays |
| `dramatic lighting` | High contrast |
| `soft shadows` | Gentle gradients |
| `rim lighting` | Edge highlights |
| `studio lighting` | Controlled, professional |

### For Atmosphere

| Phrase | Effect |
|--------|--------|
| `ethereal` | Dreamy, otherworldly |
| `cinematic` | Movie-like quality |
| `moody` | Emotional depth |
| `atmospheric` | Environmental depth |
| `mysterious` | Intriguing ambiguity |
| `serene` | Peaceful calm |

---

## Common Prompt Problems and Fixes

### Problem: Vague Subject

| Bad | Good |
|-----|------|
| `a person` | `a young woman with flowing auburn hair, wearing a vintage cream dress` |
| `an animal` | `a majestic snow leopard with piercing amber eyes, thick silver fur with black rosettes` |

### Problem: Missing Context

| Bad | Good |
|-----|------|
| `a house` | `a cozy Victorian cottage nestled in a misty forest clearing, ivy climbing the stone walls` |
| `a car` | `a vintage 1967 Mustang fastback in cherry red, parked on a sunlit coastal road` |

### Problem: No Style Direction

| Bad | Good |
|-----|------|
| `a dragon` | `a fearsome dragon, fantasy art style, by Todd Lockwood, highly detailed, epic composition` |
| `a city` | `a futuristic cityscape, cyberpunk aesthetic, neon-lit streets, Blade Runner inspired` |

### Problem: Weak Lighting

| Bad | Good |
|-----|------|
| `a portrait` | `a portrait with dramatic Rembrandt lighting, soft shadows, catchlights in eyes` |
| `a landscape` | `a landscape at golden hour, warm sunlight, long shadows, rich colors` |

---

## Weighted Prompts

For platforms that support prompt weighting:

### Stable Diffusion (AUTOMATIC1111)

```
(subject:1.2), (details:1.1), background, (quality tags:1.3)
```

### Midjourney v5+

```
subject::2 details::1.5 background::1 quality::1.5
```

---

## Iterative Optimization Process

1. **Start with Core Concept**
   - Identify the main subject and action
   - Note the desired mood and style

2. **Add Descriptive Layers**
   - Physical characteristics
   - Environmental context
   - Atmospheric conditions

3. **Apply Style Modifiers**
   - Choose appropriate style template
   - Add artist references if relevant

4. **Enhance Technical Quality**
   - Add resolution and quality tags
   - Include lighting specifications

5. **Generate and Evaluate**
   - Create the image
   - Note what works and what doesn't

6. **Refine**
   - Adjust based on results
   - Add negative prompts if needed
   - Re-weight important elements
