import api from "./api";
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
    const response = await api.post<ApiResponse<ImageGenerateResponse>>("/image/generate", data);
    return response.data;
  },

  /**
   * Image to image transformation
   */
  async imageToImage(formData: FormData): Promise<ApiResponse<ImageGenerateResponse>> {
    const response = await api.post<ApiResponse<ImageGenerateResponse>>("/image/image-to-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * ControlNet generation
   */
  async controlNet(formData: FormData): Promise<ApiResponse<ImageGenerateResponse>> {
    const response = await api.post<ApiResponse<ImageGenerateResponse>>("/image/controlnet", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Inpainting
   */
  async inpaint(formData: FormData): Promise<ApiResponse<ImageGenerateResponse>> {
    const response = await api.post<ApiResponse<ImageGenerateResponse>>("/image/inpaint", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Remove background
   */
  async removeBackground(formData: FormData): Promise<ApiResponse<ImageGenerateResponse>> {
    const response = await api.post<ApiResponse<ImageGenerateResponse>>("/image/remove-background", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<ApiResponse<TaskStatus>> {
    const response = await api.get<ApiResponse<TaskStatus>>(`/image/task/${taskId}`);
    return response.data;
  },

  /**
   * Get available models
   */
  async getModels(): Promise<ApiResponse<{ models: Array<{ id: string; name: string; provider: string }> }>> {
    const response = await api.get<ApiResponse<{ models: Array<{ id: string; name: string; provider: string }> }>>("/image/models");
    return response.data;
  },
};
