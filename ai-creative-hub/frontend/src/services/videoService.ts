import fetchApi from "./api";
import type {
  ApiResponse,
  VideoGenerateRequest,
  VideoGenerateResponse,
  TaskStatus,
} from "@/types/api";

export const videoService = {
  /**
   * Generate video from text
   */
  async generate(data: VideoGenerateRequest): Promise<ApiResponse<VideoGenerateResponse>> {
    return fetchApi<VideoGenerateResponse>("/video/generate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Image to video
   */
  async imageToVideo(image: string, prompt: string, duration?: number): Promise<ApiResponse<VideoGenerateResponse>> {
    return fetchApi<VideoGenerateResponse>("/video/generate", {
      method: "POST",
      body: JSON.stringify({
        type: "image_to_video",
        image,
        prompt,
        duration,
      }),
    });
  },

  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<ApiResponse<TaskStatus>> {
    return fetchApi<TaskStatus>(`/video/task/${taskId}`);
  },

  /**
   * Get available models
   */
  async getModels(): Promise<ApiResponse<{ models: Array<{ id: string; name: string; provider: string }> }>> {
    return fetchApi<{ models: Array<{ id: string; name: string; provider: string }> }>("/video/models");
  },
};
