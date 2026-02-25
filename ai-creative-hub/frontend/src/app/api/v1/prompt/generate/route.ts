import { NextRequest, NextResponse } from "next/server";

// Mock prompt optimization for demo
function optimizePrompt(input: string): { prompt: string; tags: string[]; suggestions: string[] } {
  // Simulated prompt optimization
  const keywords = input.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  const styles = ["cinematic", "photorealistic", "professional", "artistic", "high-quality"];
  const qualities = ["8K", "ultra-detailed", "masterpiece", "award-winning", "trending on artstation"];

  const selectedStyles = styles.slice(0, 2);
  const selectedQualities = qualities.slice(0, 2);

  const optimizedPrompt = `${input}, ${selectedStyles.join(", ")}, ${selectedQualities.join(", ")}, perfect composition, professional lighting, sharp focus`;

  const tags = [...keywords.slice(0, 3), ...selectedStyles];
  const suggestions = [
    "Try adding specific lighting conditions like 'golden hour' or 'studio lighting'",
    "Include camera settings for more realistic results, e.g., '85mm f/1.4'",
    "Add style references like 'cinematic' or 'editorial photography'",
  ];

  return {
    prompt: optimizedPrompt,
    tags,
    suggestions,
  };
}

// Mock image-to-prompt reverse engineering
function imageToPrompt(): { prompt: string; tags: string[]; suggestions: string[] } {
  const subjects = ["portrait", "landscape", "still life", "abstract", "architecture"];
  const styles = ["impressionist", "realistic", "surreal", "minimalist", "contemporary"];
  const moods = ["serene", "dramatic", "whimsical", "melancholic", "vibrant"];

  const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  const randomMood = moods[Math.floor(Math.random() * moods.length)];

  const prompt = `A ${randomMood} ${randomSubject} in ${randomStyle} style, carefully composed with attention to light and shadow, rich color palette, intricate details, professional quality`;

  return {
    prompt,
    tags: [randomSubject, randomStyle, randomMood],
    suggestions: [
      "Add more specific subject details for better generation results",
      "Include environment or background context",
      "Specify color preferences or mood keywords",
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, prompt, image, targetApi, language } = body;

    // Validate required fields
    if (!type || !["image_to_prompt", "optimize"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid type. Must be 'image_to_prompt' or 'optimize'" },
        { status: 400 }
      );
    }

    if (type === "optimize" && !prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required for optimization" },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    let result;
    if (type === "optimize") {
      result = optimizePrompt(prompt);
    } else {
      result = imageToPrompt();
    }

    return NextResponse.json({
      success: true,
      message: "Prompt generated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Prompt generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate prompt" },
      { status: 500 }
    );
  }
}
