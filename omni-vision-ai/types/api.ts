// API 配置类型
export interface APIConfig {
  jimeng: {
    enabled: boolean;
    apiKey?: string;
    endpoint?: string;
  };
  kling: {
    enabled: boolean;
    apiKey?: string;
    endpoint?: string;
  };
  vidu: {
    enabled: boolean;
    apiKey?: string;
    endpoint?: string;
  };
  openai: {
    enabled: boolean;
    apiKey?: string;
    endpoint?: string;
  };
  midjourney: {
    enabled: boolean;
    apiKey?: string;
    endpoint?: string;
  };
  doubao: {
    enabled: boolean;
    apiKey?: string;
    endpoint?: string;
  };
  runway: {
    enabled: boolean;
    apiKey?: string;
    endpoint?: string;
  };
  sora: {
    enabled: boolean;
    apiKey?: string;
    endpoint?: string;
  };
}

// API 响应基础类型
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  usedAPI?: string;
  isMock?: boolean;
}

// API 提供商枚举
export type ImageAPIProvider = 'auto' | 'jimeng' | 'kling' | 'midjourney' | 'dalle' | 'sd' | 'doubao';
export type VideoAPIProvider = 'auto' | 'jimeng' | 'kling' | 'vidu' | 'sora' | 'runway' | 'veo';

// 生成状态
export type GenerationStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
