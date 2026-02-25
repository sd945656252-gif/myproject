import { NextRequest, NextResponse } from "next/server";

// Available models for image generation
const IMAGE_MODELS = [
  { id: "stable-diffusion-xl", name: "Stable Diffusion XL", provider: "Stability AI" },
  { id: "midjourney", name: "Midjourney", provider: "Midjourney" },
  { id: "dall-e-3", name: "DALL-E 3", provider: "OpenAI" },
  { id: "kling-image", name: "Kling Image", provider: "Kuaishou" },
  { id: "flux-pro", name: "Flux Pro", provider: "Black Forest Labs" },
];

// Image styles
const IMAGE_STYLES = [
  { id: "photorealistic", name: "Photorealistic" },
  { id: "anime", name: "Anime" },
  { id: "digital-art", name: "Digital Art" },
  { id: "oil-painting", name: "Oil Painting" },
  { id: "watercolor", name: "Watercolor" },
  { id: "3d-render", name: "3D Render" },
  { id: "cinematic", name: "Cinematic" },
  { id: "minimalist", name: "Minimalist" },
];

// Mock image generation for demo
function generateImages(prompt: string, count: number = 1, model?: string): { images: Array<{ url: string; seed: number; model: string }>; taskId: string } {
  const images = [];
  const seed = Math.floor(Math.random() * 1000000);
  const selectedModel = model || IMAGE_MODELS[0].id;

  for (let i = 0; i < count; i++) {
    const imageSeed = seed + i;
    images.push({
      url: `https://picsum.photos/seed/${imageSeed}/1024/1024`,
      seed: imageSeed,
      model: selectedModel,
    });
  }

  return {
    images,
    taskId: `img-task-${Date.now()}`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, negativePrompt, width = 1024, height = 1024, style, model, seed, steps, cfgScale } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: prompt" },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const result = generateImages(prompt, 1, model);

    return NextResponse.json({
      success: true,
      message: "Images generated successfully",
      data: {
        ...result,
        parameters: {
          width,
          height,
          style,
          model: model || IMAGE_MODELS[0].id,
          negativePrompt,
          seed: seed || result.images[0].seed,
          steps: steps || 30,
          cfgScale: cfgScale || 7.5,
        },
      },
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate images" },
      { status: 500 }
    );
  }
}

// Get available models and styles
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      models: IMAGE_MODELS,
      styles: IMAGE_STYLES,
    },
  });
}
