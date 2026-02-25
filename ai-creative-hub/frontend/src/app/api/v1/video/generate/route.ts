import { NextRequest, NextResponse } from "next/server";

// Available video models
const VIDEO_MODELS = [
  { id: "kling-video", name: "Kling Video", provider: "Kuaishou" },
  { id: "runway-gen3", name: "Runway Gen-3", provider: "Runway" },
  { id: "pika-labs", name: "Pika Labs", provider: "Pika" },
  { id: "sora", name: "Sora", provider: "OpenAI" },
  { id: "stable-video", name: "Stable Video Diffusion", provider: "Stability AI" },
];

// Video styles
const VIDEO_STYLES = [
  { id: "cinematic", name: "Cinematic" },
  { id: "anime", name: "Anime" },
  { id: "3d-animation", name: "3D Animation" },
  { id: "realistic", name: "Realistic" },
  { id: "artistic", name: "Artistic" },
];

// Mock video generation for demo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, type = "text_to_video", duration = 5, image, video, fps, width, height, style, model } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: prompt" },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const taskId = `video-task-${Date.now()}`;
    const selectedModel = model || VIDEO_MODELS[0].id;

    return NextResponse.json({
      success: true,
      message: "Video generation completed",
      data: {
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        taskId,
        duration,
        model: selectedModel,
        parameters: {
          type,
          fps: fps || 24,
          width: width || 1024,
          height: height || 576,
          style: style || "cinematic",
        },
      },
    });
  } catch (error) {
    console.error("Video generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate video" },
      { status: 500 }
    );
  }
}

// Get available models and styles
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      models: VIDEO_MODELS,
      styles: VIDEO_STYLES,
    },
  });
}
