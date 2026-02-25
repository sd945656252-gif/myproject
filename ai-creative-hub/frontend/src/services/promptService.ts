import fetchApi from "./api";
import type {
  ApiResponse,
  PromptGenerateRequest,
  PromptGenerateResponse,
  TaskStatus,
} from "@/types/api";

export interface StreamChunk {
  content: string;
  done: boolean;
  error?: string;
  metadata?: {
    tags?: string[];
    suggestions?: string[];
    notification?: string;
  };
}

export const promptService = {
  /**
   * Generate or optimize a prompt
   */
  async generate(data: PromptGenerateRequest): Promise<ApiResponse<PromptGenerateResponse>> {
    return fetchApi<PromptGenerateResponse>("/prompt/generate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Stream prompt generation results using SSE
   */
  async *stream(
    data: PromptGenerateRequest,
    signal?: AbortSignal
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const response = await fetch("/api/v1/prompt/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(data),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE events
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const chunk = JSON.parse(line.slice(6)) as StreamChunk;
            yield chunk;
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  },

  /**
   * Get task status for async prompt generation
   */
  async getTaskStatus(taskId: string): Promise<ApiResponse<TaskStatus>> {
    return fetchApi<TaskStatus>(`/prompt/task/${taskId}`);
  },
};
