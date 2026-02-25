import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ApiProvider {
  id: string;
  name: string;
  description: string;
  category: "image" | "video" | "music" | "voice" | "prompt";
  baseUrl: string;
  apiKey: string;
  isActive: boolean;
  models: ApiModel[];
}

export interface ApiModel {
  id: string;
  name: string;
  description?: string;
  maxTokens?: number;
  pricing?: {
    input: number;
    output: number;
    unit: string;
  };
}

export interface ApiConfig {
  id: string;
  providerId: string;
  providerName: string;
  apiKey: string;
  apiSecret?: string;
  baseUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiConfigState {
  configs: ApiConfig[];
  providers: ApiProvider[];
  addConfig: (config: Omit<ApiConfig, "id" | "createdAt" | "updatedAt">) => void;
  updateConfig: (id: string, config: Partial<ApiConfig>) => void;
  deleteConfig: (id: string) => void;
  setActiveProvider: (category: ApiProvider["category"], providerId: string) => void;
  getActiveProvider: (category: ApiProvider["category"]) => ApiProvider | undefined;
  getActiveConfig: (category: ApiProvider["category"]) => ApiConfig | undefined;
}

// 预设的 API 提供商
const DEFAULT_PROVIDERS: ApiProvider[] = [
  // 图像生成
  {
    id: "openai-dalle",
    name: "OpenAI DALL-E",
    description: "OpenAI 的图像生成模型，支持 DALL-E 3",
    category: "image",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    isActive: false,
    models: [
      { id: "dall-e-3", name: "DALL-E 3", description: "最新版本，支持 1024x1024, 1792x1024, 1024x1792" },
      { id: "dall-e-2", name: "DALL-E 2", description: "稳定版本，支持多种尺寸" },
    ],
  },
  {
    id: "stability-ai",
    name: "Stability AI",
    description: "Stable Diffusion 图像生成服务",
    category: "image",
    baseUrl: "https://api.stability.ai/v1",
    apiKey: "",
    isActive: false,
    models: [
      { id: "stable-diffusion-xl-1024-v1-0", name: "SDXL 1.0", description: "高分辨率图像生成" },
      { id: "stable-diffusion-v1-6", name: "SD 1.6", description: "稳定版本" },
    ],
  },
  {
    id: "midjourney",
    name: "Midjourney",
    description: "Midjourney 图像生成服务",
    category: "image",
    baseUrl: "https://api.midjourney.com",
    apiKey: "",
    isActive: false,
    models: [
      { id: "midjourney-v6", name: "Midjourney V6", description: "最新版本" },
    ],
  },
  {
    id: "kling-image",
    name: "Kling 可灵",
    description: "快手可灵 AI 图像生成服务",
    category: "image",
    baseUrl: "https://api.klingai.com/v1",
    apiKey: "",
    isActive: false,
    models: [
      { id: "kling-v1", name: "Kling V1", description: "可灵图像生成" },
    ],
  },
  // 视频生成
  {
    id: "kling-video",
    name: "Kling 可灵视频",
    description: "快手可灵 AI 视频生成服务",
    category: "video",
    baseUrl: "https://api.klingai.com/v1",
    apiKey: "",
    isActive: false,
    models: [
      { id: "kling-video-v1", name: "Kling Video V1", description: "支持文生视频、图生视频" },
    ],
  },
  {
    id: "runway",
    name: "Runway",
    description: "Runway Gen-3 视频生成服务",
    category: "video",
    baseUrl: "https://api.runwayml.com/v1",
    apiKey: "",
    isActive: false,
    models: [
      { id: "gen3-alpha", name: "Gen-3 Alpha", description: "最新视频生成模型" },
      { id: "gen2", name: "Gen-2", description: "稳定版本" },
    ],
  },
  {
    id: "pika",
    name: "Pika Labs",
    description: "Pika Labs 视频生成服务",
    category: "video",
    baseUrl: "https://api.pika.art/v1",
    apiKey: "",
    isActive: false,
    models: [
      { id: "pika-v1", name: "Pika V1", description: "视频生成模型" },
    ],
  },
  // 音乐生成
  {
    id: "suno",
    name: "Suno AI",
    description: "Suno AI 音乐生成服务",
    category: "music",
    baseUrl: "https://api.suno.ai/v1",
    apiKey: "",
    isActive: false,
    models: [
      { id: "suno-v3", name: "Suno V3", description: "最新音乐生成模型" },
      { id: "suno-v3.5", name: "Suno V3.5", description: "增强版本" },
    ],
  },
  {
    id: "udio",
    name: "Udio",
    description: "Udio 音乐生成服务",
    category: "music",
    baseUrl: "https://api.udio.com/v1",
    apiKey: "",
    isActive: false,
    models: [
      { id: "udio-v1", name: "Udio V1", description: "高质量音乐生成" },
    ],
  },
  // 语音合成
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "ElevenLabs 语音合成服务",
    category: "voice",
    baseUrl: "https://api.elevenlabs.io/v1",
    apiKey: "",
    isActive: false,
    models: [
      { id: "eleven_multilingual_v2", name: "Multilingual V2", description: "多语言支持" },
      { id: "eleven_monolingual_v1", name: "Monolingual V1", description: "英语专用" },
    ],
  },
  {
    id: "azure-tts",
    name: "Azure TTS",
    description: "Azure 语音服务",
    category: "voice",
    baseUrl: "https://eastus.tts.speech.microsoft.com",
    apiKey: "",
    isActive: false,
    models: [
      { id: "azure-tts", name: "Azure Neural TTS", description: "神经网络语音合成" },
    ],
  },
  {
    id: "openai-tts",
    name: "OpenAI TTS",
    description: "OpenAI 文本转语音服务",
    category: "voice",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    isActive: false,
    models: [
      { id: "tts-1", name: "TTS-1", description: "标准质量" },
      { id: "tts-1-hd", name: "TTS-1-HD", description: "高清质量" },
    ],
  },
  // 提示词优化
  {
    id: "openai-gpt",
    name: "OpenAI GPT",
    description: "OpenAI GPT 模型用于提示词优化",
    category: "prompt",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    isActive: false,
    models: [
      { id: "gpt-4o", name: "GPT-4o", description: "最新多模态模型" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "高性能版本" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "经济实惠" },
    ],
  },
  {
    id: "anthropic-claude",
    name: "Anthropic Claude",
    description: "Claude 模型用于提示词优化",
    category: "prompt",
    baseUrl: "https://api.anthropic.com/v1",
    apiKey: "",
    isActive: false,
    models: [
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "最新版本" },
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus", description: "最强性能" },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "DeepSeek 模型",
    category: "prompt",
    baseUrl: "https://api.deepseek.com/v1",
    apiKey: "",
    isActive: false,
    models: [
      { id: "deepseek-chat", name: "DeepSeek Chat", description: "对话模型" },
      { id: "deepseek-coder", name: "DeepSeek Coder", description: "代码模型" },
    ],
  },
  {
    id: "moonshot",
    name: "Moonshot Kimi",
    description: "月之暗面 Kimi 模型",
    category: "prompt",
    baseUrl: "https://api.moonshot.cn/v1",
    apiKey: "",
    isActive: false,
    models: [
      { id: "moonshot-v1-8k", name: "Moonshot V1 8K", description: "8K 上下文" },
      { id: "moonshot-v1-32k", name: "Moonshot V1 32K", description: "32K 上下文" },
      { id: "moonshot-v1-128k", name: "Moonshot V1 128K", description: "128K 上下文" },
    ],
  },
];

export const useApiConfigStore = create<ApiConfigState>()(
  persist(
    (set, get) => ({
      configs: [],
      providers: DEFAULT_PROVIDERS,

      addConfig: (configData) => {
        const config: ApiConfig = {
          ...configData,
          id: `config-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          configs: [...state.configs, config],
        }));
      },

      updateConfig: (id, configData) => {
        set((state) => ({
          configs: state.configs.map((config) =>
            config.id === id
              ? { ...config, ...configData, updatedAt: new Date().toISOString() }
              : config
          ),
        }));
      },

      deleteConfig: (id) => {
        set((state) => ({
          configs: state.configs.filter((config) => config.id !== id),
        }));
      },

      setActiveProvider: (category, providerId) => {
        set((state) => ({
          providers: state.providers.map((provider) =>
            provider.category === category
              ? { ...provider, isActive: provider.id === providerId }
              : provider
          ),
        }));
      },

      getActiveProvider: (category) => {
        const state = get();
        return state.providers.find((p) => p.category === category && p.isActive);
      },

      getActiveConfig: (category) => {
        const state = get();
        const activeProvider = state.providers.find((p) => p.category === category && p.isActive);
        if (!activeProvider) return undefined;
        return state.configs.find((c) => c.providerId === activeProvider.id && c.isActive);
      },
    }),
    {
      name: "api-config-storage",
      partialize: (state) => ({
        configs: state.configs,
        providers: state.providers,
      }),
    }
  )
);
