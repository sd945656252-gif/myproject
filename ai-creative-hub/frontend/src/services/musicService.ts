import fetchApi from "./api";
import type {
  ApiResponse,
  MusicGenerateRequest,
  MusicGenerateResponse,
  TaskStatus,
} from "@/types/api";

export const musicService = {
  /**
   * Generate music from text
   */
  async generate(data: MusicGenerateRequest): Promise<ApiResponse<MusicGenerateResponse>> {
    return fetchApi<MusicGenerateResponse>("/music/generate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<ApiResponse<TaskStatus>> {
    return fetchApi<TaskStatus>(`/music/task/${taskId}`);
  },

  /**
   * Get available styles
   */
  async getStyles(): Promise<ApiResponse<{ styles: Array<{ id: string; name: string }> }>> {
    return fetchApi<{ styles: Array<{ id: string; name: string }> }>("/music/styles");
  },
};
