import { NextRequest, NextResponse } from "next/server";

// Mock prompt optimization for demo
function optimizePrompt(input: string): { prompt: string; tags: string[]; suggestions: string[] } {
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
  const styles = ["impressionist", "realistic", "professional", "artistic", "high-quality"];
  const qualities = ["8K", "ultra-detailed", "masterpiece", "award-winning", "trending on artstation"];

  const selectedStyles = styles.slice(0, 2);
  const selectedQualities = qualities.slice(0, 2);

  const prompt = `A stunning visual composition featuring intricate details and masterful lighting. Professional photography style with ${selectedStyles.join(" and ")} elements. ${selectedQualities.join(", ")} quality, perfect composition, sharp focus, rich colors`;

  const tags = [...selectedStyles, "professional", "detailed"];
  const suggestions = [
    "Consider adding more specific subject matter description",
    "Include lighting direction and quality for better results",
    "Add mood or atmosphere keywords for enhanced generation",
  ];

  return {
    prompt,
    tags,
    suggestions,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, prompt: inputPrompt } = body;

    // Validate request
    if (type !== "optimize" && type !== "image_to_prompt") {
      return NextResponse.json(
        { success: false, error: "Invalid type. Must be 'optimize' or 'image_to_prompt'" },
        { status: 400 }
      );
    }

    if (type === "optimize" && !inputPrompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required for optimization" },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Generate result
    let result;
    if (type === "optimize") {
      result = optimizePrompt(inputPrompt);
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
