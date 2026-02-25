import { NextRequest } from "next/server";

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
      return new Response(
        JSON.stringify({ error: "Invalid type. Must be 'optimize' or 'image_to_prompt'" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (type === "optimize" && !inputPrompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required for optimization" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create a TransformStream for SSE
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Process in background
    (async () => {
      try {
        // Send initial chunk
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ content: "", done: false })}\n\n`)
        );

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Generate result
        const result = type === "optimize" ? optimizePrompt(inputPrompt) : imageToPrompt();

        // Stream the prompt character by character for effect
        const promptText = result.prompt;
        const chunkSize = 20;

        for (let i = 0; i < promptText.length; i += chunkSize) {
          const chunk = promptText.slice(i, i + chunkSize);
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ content: chunk, done: false })}\n\n`)
          );
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Send final chunk with metadata
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              content: "",
              done: true,
              metadata: {
                tags: result.tags,
                suggestions: result.suggestions,
                notification: "Prompt generated successfully",
              },
            })}\n\n`
          )
        );
      } catch (error) {
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ error: "Stream error", done: true })}\n\n`)
        );
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Prompt generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate prompt" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
