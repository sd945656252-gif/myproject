import fetchApi from "./api";
import type {
  ApiResponse,
  VoiceGenerateRequest,
  VoiceGenerateResponse,
  TaskStatus,
} from "@/types/api";

export const voiceService = {
  /**
   * Generate voice from text
   */
  async generate(data: VoiceGenerateRequest): Promise<ApiResponse<VoiceGenerateResponse>> {
    return fetchApi<VoiceGenerateResponse>("/voice/generate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<ApiResponse<TaskStatus>> {
    return fetchApi<TaskStatus>(`/voice/task/${taskId}`);
  },

  /**
   * Get available voices
   */
  async getVoices(): Promise<ApiResponse<{ voices: Array<{ id: string; name: string; gender: string; language: string }> }>> {
    return fetchApi<{ voices: Array<{ id: string; name: string; gender: string; language: string }> }>("/voice/voices");
  },
};
