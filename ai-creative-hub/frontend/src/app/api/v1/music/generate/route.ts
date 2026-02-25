import { NextRequest, NextResponse } from "next/server";

// Available music styles
const MUSIC_STYLES = [
  { id: "pop", name: "Pop" },
  { id: "electronic", name: "Electronic" },
  { id: "classical", name: "Classical" },
  { id: "jazz", name: "Jazz" },
  { id: "rock", name: "Rock" },
  { id: "hiphop", name: "Hip Hop" },
  { id: "ambient", name: "Ambient" },
  { id: "cinematic", name: "Cinematic" },
  { id: "lofi", name: "Lo-Fi" },
  { id: "chinese-traditional", name: "Chinese Traditional" },
];

// Music generation demo samples
const DEMO_TRACKS = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
];

// Mock music generation for demo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, style, duration = 30, lyrics, instrumental = true } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: prompt" },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const taskId = `music-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const selectedStyle = style || MUSIC_STYLES[0].id;
    const audioUrl = DEMO_TRACKS[Math.floor(Math.random() * DEMO_TRACKS.length)];

    return NextResponse.json({
      success: true,
      message: "Music generated successfully",
      data: {
        audioUrl,
        taskId,
        duration,
        style: selectedStyle,
        instrumental,
        metadata: {
          hasLyrics: !!lyrics,
          lyrics,
          prompt,
        },
      },
    });
  } catch (error) {
    console.error("Music generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate music" },
      { status: 500 }
    );
  }
}

// Get available styles
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      styles: MUSIC_STYLES,
    },
  });
}
