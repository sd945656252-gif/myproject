import { useApiConfigStore, ApiProvider, ApiConfig } from "@/stores/useApiConfigStore";

// 获取当前激活的 API 配置
export function getActiveApiConfig(category: ApiProvider["category"]): {
  provider: ApiProvider | undefined;
  config: ApiConfig | undefined;
} {
  const store = useApiConfigStore.getState();
  const provider = store.providers.find((p) => p.category === category && p.isActive);
  const config = provider ? store.configs.find((c) => c.providerId === provider.id && c.isActive) : undefined;
  return { provider, config };
}

// 通用 API 调用函数
export async function callAiApi(
  category: ApiProvider["category"],
  endpoint: string,
  body: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const { provider, config } = getActiveApiConfig(category);

  // 如果没有配置真实 API，使用本地 Mock API
  if (!provider || !config) {
    return callMockApi(category, endpoint, body);
  }

  try {
    const baseUrl = config.baseUrl || provider.baseUrl;
    const url = `${baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // 根据不同的提供商设置认证头
    switch (provider.id) {
      case "openai-dalle":
      case "openai-gpt":
      case "openai-tts":
        headers["Authorization"] = `Bearer ${config.apiKey}`;
        break;
      case "anthropic-claude":
        headers["x-api-key"] = config.apiKey;
        headers["anthropic-version"] = "2023-06-01";
        break;
      case "stability-ai":
        headers["Authorization"] = `Bearer ${config.apiKey}`;
        break;
      case "elevenlabs":
        headers["xi-api-key"] = config.apiKey;
        break;
      case "deepseek":
      case "moonshot":
        headers["Authorization"] = `Bearer ${config.apiKey}`;
        break;
      default:
        headers["Authorization"] = `Bearer ${config.apiKey}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`${category} API error:`, error);
    // 如果真实 API 调用失败，回退到 Mock
    console.log("Falling back to mock API...");
    return callMockApi(category, endpoint, body);
  }
}

// Mock API 调用（本地演示）
async function callMockApi(
  category: ApiProvider["category"],
  endpoint: string,
  body: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const response = await fetch(`/api/v1/${category}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error || "Request failed" };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ============ 具体的 AI 服务调用 ============

// 图像生成
export async function generateImage(params: {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  style?: string;
  model?: string;
  seed?: number;
}): Promise<{ success: boolean; data?: { images: Array<{ url: string; seed: number }> }; error?: string }> {
  const { provider, config } = getActiveApiConfig("image");

  // 使用真实 API
  if (provider && config) {
    switch (provider.id) {
      case "openai-dalle": {
        const size = params.width === 1792 && params.height === 1024 ? "1792x1024" :
                     params.width === 1024 && params.height === 1792 ? "1024x1792" : "1024x1024";
        const result = await callOpenAiDalle(config.apiKey, params.prompt, params.model || "dall-e-3", size);
        return result;
      }
      case "stability-ai": {
        const result = await callStabilityAi(config.apiKey, params.prompt, params.negativePrompt, params.width, params.height);
        return result;
      }
      default:
        break;
    }
  }

  // 使用 Mock API
  const result = await callMockApi("image", "/generate", params);
  return result as { success: boolean; data?: { images: Array<{ url: string; seed: number }> }; error?: string };
}

// OpenAI DALL-E 调用
async function callOpenAiDalle(
  apiKey: string,
  prompt: string,
  model: string,
  size: string
): Promise<{ success: boolean; data?: { images: Array<{ url: string; seed: number }> }; error?: string }> {
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        n: 1,
        size,
        quality: "standard",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message || "DALL-E API failed" };
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        images: data.data.map((img: { url: string }, idx: number) => ({
          url: img.url,
          seed: Date.now() + idx,
        })),
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Stability AI 调用
async function callStabilityAi(
  apiKey: string,
  prompt: string,
  negativePrompt?: string,
  width?: number,
  height?: number
): Promise<{ success: boolean; data?: { images: Array<{ url: string; seed: number }> }; error?: string }> {
  try {
    const response = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json",
      },
      body: JSON.stringify({
        text_prompts: [
          { text: prompt, weight: 1 },
          ...(negativePrompt ? [{ text: negativePrompt, weight: -1 }] : []),
        ],
        cfg_scale: 7,
        height: height || 1024,
        width: width || 1024,
        samples: 1,
        steps: 30,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Stability AI API failed" };
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        images: data.artifacts.map((img: { base64: string; seed: number }, idx: number) => ({
          url: `data:image/png;base64,${img.base64}`,
          seed: img.seed,
        })),
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// 视频生成
export async function generateVideo(params: {
  prompt: string;
  type?: "text_to_video" | "image_to_video";
  image?: string;
  duration?: number;
}): Promise<{ success: boolean; data?: { videoUrl: string; taskId: string; duration: number }; error?: string }> {
  const result = await callAiApi("video", "/generations", params);
  return result as { success: boolean; data?: { videoUrl: string; taskId: string; duration: number }; error?: string };
}

// 音乐生成
export async function generateMusic(params: {
  prompt: string;
  style?: string;
  duration?: number;
  lyrics?: string;
  instrumental?: boolean;
}): Promise<{ success: boolean; data?: { audioUrl: string; taskId: string; duration: number }; error?: string }> {
  const result = await callAiApi("music", "/generate", params);
  return result as { success: boolean; data?: { audioUrl: string; taskId: string; duration: number }; error?: string };
}

// 语音合成
export async function generateVoice(params: {
  text: string;
  voiceId?: string;
  speed?: number;
  pitch?: number;
}): Promise<{ success: boolean; data?: { audioUrl: string; taskId: string; duration: number }; error?: string }> {
  const result = await callAiApi("voice", "/text-to-speech", params);
  return result as { success: boolean; data?: { audioUrl: string; taskId: string; duration: number }; error?: string };
}

// 提示词优化（使用 LLM）
export async function optimizePrompt(params: {
  prompt: string;
  targetApi?: string;
  language?: "zh" | "en";
}): Promise<{ success: boolean; data?: { prompt: string; tags: string[]; suggestions: string[] }; error?: string }> {
  const { provider, config } = getActiveApiConfig("prompt");

  if (provider && config) {
    switch (provider.id) {
      case "openai-gpt":
        return callOpenAiGpt(config.apiKey, params.prompt, params.targetApi, params.language);
      case "anthropic-claude":
        return callAnthropicClaude(config.apiKey, params.prompt, params.targetApi, params.language);
      case "deepseek":
        return callDeepSeek(config.apiKey, config.baseUrl || "https://api.deepseek.com/v1", params.prompt, params.targetApi, params.language);
      case "moonshot":
        return callMoonshot(config.apiKey, params.prompt, params.targetApi, params.language);
      default:
        break;
    }
  }

  // Mock 流式 API
  return streamMockPrompt(params);
}

// OpenAI GPT 调用
async function callOpenAiGpt(
  apiKey: string,
  prompt: string,
  targetApi?: string,
  language?: "zh" | "en"
): Promise<{ success: boolean; data?: { prompt: string; tags: string[]; suggestions: string[] }; error?: string }> {
  try {
    const systemPrompt = language === "zh"
      ? `你是一个专业的 AI 绘画提示词专家。请优化用户的提示词，使其更适合 ${targetApi || "通用"} API。
输出格式要求：
1. optimized_prompt: 优化后的提示词
2. tags: 相关标签数组
3. suggestions: 改进建议数组

请用 JSON 格式输出。`
      : `You are a professional AI art prompt expert. Optimize the user's prompt for ${targetApi || "general"} API.
Output format:
1. optimized_prompt: the optimized prompt
2. tags: array of relevant tags
3. suggestions: array of improvement suggestions

Output in JSON format.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `请优化这个提示词: ${prompt}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message || "OpenAI API failed" };
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return {
      success: true,
      data: {
        prompt: content.optimized_prompt || content.prompt,
        tags: content.tags || [],
        suggestions: content.suggestions || [],
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Anthropic Claude 调用
async function callAnthropicClaude(
  apiKey: string,
  prompt: string,
  targetApi?: string,
  language?: "zh" | "en"
): Promise<{ success: boolean; data?: { prompt: string; tags: string[]; suggestions: string[] }; error?: string }> {
  try {
    const systemPrompt = language === "zh"
      ? `你是一个专业的 AI 绘画提示词专家。请优化用户的提示词。输出 JSON 格式，包含 optimized_prompt, tags, suggestions 字段。`
      : `You are a professional AI art prompt expert. Optimize the prompt. Output JSON with optimized_prompt, tags, suggestions fields.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          { role: "user", content: `请优化这个提示词: ${prompt}` },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message || "Claude API failed" };
    }

    const data = await response.json();
    const content = JSON.parse(data.content[0].text);

    return {
      success: true,
      data: {
        prompt: content.optimized_prompt || content.prompt,
        tags: content.tags || [],
        suggestions: content.suggestions || [],
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// DeepSeek 调用
async function callDeepSeek(
  apiKey: string,
  baseUrl: string,
  prompt: string,
  targetApi?: string,
  language?: "zh" | "en"
): Promise<{ success: boolean; data?: { prompt: string; tags: string[]; suggestions: string[] }; error?: string }> {
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: language === "zh"
              ? "你是AI绘画提示词专家。输出JSON格式，包含 optimized_prompt, tags, suggestions。"
              : "You are an AI art prompt expert. Output JSON with optimized_prompt, tags, suggestions.",
          },
          { role: "user", content: `优化提示词: ${prompt}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message || "DeepSeek API failed" };
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return {
      success: true,
      data: {
        prompt: content.optimized_prompt || content.prompt,
        tags: content.tags || [],
        suggestions: content.suggestions || [],
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Moonshot 调用
async function callMoonshot(
  apiKey: string,
  prompt: string,
  targetApi?: string,
  language?: "zh" | "en"
): Promise<{ success: boolean; data?: { prompt: string; tags: string[]; suggestions: string[] }; error?: string }> {
  try {
    const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [
          {
            role: "system",
            content: "你是AI绘画提示词专家。输出JSON格式，包含 optimized_prompt, tags, suggestions。",
          },
          { role: "user", content: `优化提示词: ${prompt}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message || "Moonshot API failed" };
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return {
      success: true,
      data: {
        prompt: content.optimized_prompt || content.prompt,
        tags: content.tags || [],
        suggestions: content.suggestions || [],
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Mock 流式提示词
async function streamMockPrompt(params: {
  prompt: string;
}): Promise<{ success: boolean; data?: { prompt: string; tags: string[]; suggestions: string[] }; error?: string }> {
  const response = await fetch("/api/v1/prompt/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "optimize", prompt: params.prompt }),
  });

  if (!response.ok) {
    return { success: false, error: "Mock API failed" };
  }

  // 读取 SSE 流
  const reader = response.body?.getReader();
  if (!reader) {
    return { success: false, error: "No response body" };
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let fullContent = "";
  let metadata: { tags?: string[]; suggestions?: string[] } = {};

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const chunk = JSON.parse(line.slice(6));
          fullContent += chunk.content || "";
          if (chunk.metadata) {
            metadata = chunk.metadata;
          }
        } catch {
          // skip
        }
      }
    }
  }

  return {
    success: true,
    data: {
      prompt: fullContent,
      tags: metadata.tags || [],
      suggestions: metadata.suggestions || [],
    },
  };
}
