import { NextRequest, NextResponse } from "next/server";

// Mock image generation for demo
function generateImages(prompt: string, count: number = 1): { images: Array<{ url: string; seed: number; model: string }>; taskId: string } {
  const images = [];
  const seed = Math.floor(Math.random() * 1000000);

  for (let i = 0; i < count; i++) {
    // Using placeholder images for demo
    const imageSeed = seed + i;
    images.push({
      url: `https://picsum.photos/seed/${imageSeed}/1024/1024`,
      seed: imageSeed,
      model: "demo-model",
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
    const { prompt, negativePrompt, width = 1024, height = 1024, style, model } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: prompt" },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = generateImages(prompt, 1);

    return NextResponse.json({
      success: true,
      message: "Images generated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate images" },
      { status: 500 }
    );
  }
}
