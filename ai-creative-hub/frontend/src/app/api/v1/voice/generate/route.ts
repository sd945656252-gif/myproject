import { NextRequest, NextResponse } from "next/server";

// Available voice presets
const VOICE_PRESETS = [
  { id: "zh-female-1", name: "小美", gender: "female", language: "zh" },
  { id: "zh-female-2", name: "小雅", gender: "female", language: "zh" },
  { id: "zh-male-1", name: "小明", gender: "male", language: "zh" },
  { id: "zh-male-2", name: "大伟", gender: "male", language: "zh" },
  { id: "en-female-1", name: "Sarah", gender: "female", language: "en" },
  { id: "en-male-1", name: "John", gender: "male", language: "en" },
];

// Mock voice synthesis for demo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voiceId, speed = 1.0, pitch = 1.0, emotion } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: text" },
        { status: 400 }
      );
    }

    // Simulate processing delay based on text length
    const processingTime = Math.min(500 + text.length * 20, 3000);
    await new Promise(resolve => setTimeout(resolve, processingTime));

    const taskId = `voice-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const selectedVoice = VOICE_PRESETS.find(v => v.id === voiceId) || VOICE_PRESETS[0];

    // Calculate duration based on text length and speed
    const wordsPerMinute = 150 * speed;
    const wordCount = text.length / 2; // Approximate for Chinese
    const duration = Math.ceil((wordCount / wordsPerMinute) * 60);

    return NextResponse.json({
      success: true,
      message: "Voice synthesis completed",
      data: {
        audioUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3`,
        taskId,
        duration,
        voice: selectedVoice,
        metadata: {
          speed,
          pitch,
          emotion: emotion || "neutral",
        },
      },
    });
  } catch (error) {
    console.error("Voice synthesis error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to synthesize voice" },
      { status: 500 }
    );
  }
}

// Get available voices
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      voices: VOICE_PRESETS,
    },
  });
}
