import { ModuleType } from "@/stores/useChatStore";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TaskResponse {
  taskId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  result?: unknown;
  error?: string;
}

export interface TaskStatus {
  taskId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  result?: Record<string, unknown>;
  error?: string;
}

export interface PromptGenerateRequest {
  type: "image_to_prompt" | "optimize";
  image?: string;
  prompt?: string;
  targetApi?: ModuleType;
  language?: "zh" | "en";
}

export interface PromptGenerateResponse {
  prompt: string;
  tags?: string[];
  suggestions?: string[];
}

export interface ImageGenerateRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  style?: string;
  model?: string;
  seed?: number;
  steps?: number;
  cfgScale?: number;
}

export interface ImageGenerateResponse {
  images: Array<{
    url: string;
    seed: number;
    model: string;
  }>;
  taskId: string;
}

export interface VideoGenerateRequest {
  type: "text_to_video" | "image_to_video" | "video_to_video";
  prompt: string;
  image?: string;
  video?: string;
  duration?: number;
  fps?: number;
  width?: number;
  height?: number;
  style?: string;
  model?: string;
}

export interface VideoGenerateResponse {
  videoUrl: string;
  taskId: string;
  duration: number;
}

export interface MusicGenerateRequest {
  prompt: string;
  style?: string;
  duration?: number;
  lyrics?: string;
  instrumental?: boolean;
}

export interface MusicGenerateResponse {
  audioUrl: string;
  taskId: string;
  duration: number;
}

export interface VoiceGenerateRequest {
  text: string;
  voiceId?: string;
  speed?: number;
  pitch?: number;
  emotion?: string;
}

export interface VoiceGenerateResponse {
  audioUrl: string;
  taskId: string;
  duration: number;
}

export interface WorkflowCreateRequest {
  title?: string;
  description?: string;
}

export interface WorkflowStepRequest {
  step: string;
  input: Record<string, unknown>;
}

export interface WorkflowStepResponse {
  step: string;
  output: Record<string, unknown>;
  nextStep?: string;
}
