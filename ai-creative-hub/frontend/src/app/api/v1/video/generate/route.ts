import { NextRequest, NextResponse } from "next/server";

// Mock video generation for demo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, type = "text_to_video", duration = 5 } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: prompt" },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const taskId = `video-task-${Date.now()}`;

    return NextResponse.json({
      success: true,
      message: "Video generation started",
      data: {
        taskId,
        status: "processing",
        estimatedTime: duration * 10, // seconds
        videoUrl: null, // Will be available when processing completes
      },
    });
  } catch (error) {
    console.error("Video generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to start video generation" },
      { status: 500 }
    );
  }
}
