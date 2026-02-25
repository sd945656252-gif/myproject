import fetchApi from "./api";
import type {
  ApiResponse,
  ImageGenerateRequest,
  ImageGenerateResponse,
  TaskStatus,
} from "@/types/api";

export const imageService = {
  /**
   * Generate images from text
   */
  async generate(data: ImageGenerateRequest): Promise<ApiResponse<ImageGenerateResponse>> {
    return fetchApi<ImageGenerateResponse>("/image/generate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Image to image transformation
   */
  async imageToImage(formData: FormData): Promise<ApiResponse<ImageGenerateResponse>> {
    const response = await fetch("/api/v1/image/image-to-image", {
      method: "POST",
      body: formData,
    });
    return response.json();
  },

  /**
   * ControlNet generation
   */
  async controlNet(formData: FormData): Promise<ApiResponse<ImageGenerateResponse>> {
    const response = await fetch("/api/v1/image/controlnet", {
      method: "POST",
      body: formData,
    });
    return response.json();
  },

  /**
   * Inpainting
   */
  async inpaint(formData: FormData): Promise<ApiResponse<ImageGenerateResponse>> {
    const response = await fetch("/api/v1/image/inpaint", {
      method: "POST",
      body: formData,
    });
    return response.json();
  },

  /**
   * Remove background
   */
  async removeBackground(formData: FormData): Promise<ApiResponse<ImageGenerateResponse>> {
    const response = await fetch("/api/v1/image/remove-background", {
      method: "POST",
      body: formData,
    });
    return response.json();
  },

  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<ApiResponse<TaskStatus>> {
    return fetchApi<TaskStatus>(`/image/task/${taskId}`);
  },

  /**
   * Get available models
   */
  async getModels(): Promise<ApiResponse<{ models: Array<{ id: string; name: string; provider: string }> }>> {
    return fetchApi<{ models: Array<{ id: string; name: string; provider: string }> }>("/image/models");
  },
};
