import { APIConfig } from '@/types/api';

// 默认 API 配置
export const defaultAPIConfig: APIConfig = {
  jimeng: {
    enabled: true,
    apiKey: '',
    endpoint: 'https://api.jimeng.ai/v1',
  },
  kling: {
    enabled: true,
    apiKey: '',
    endpoint: 'https://api.klingai.com/v1',
  },
  vidu: {
    enabled: true,
    apiKey: '',
    endpoint: 'https://api.vidu.ai/v1',
  },
  openai: {
    enabled: true,
    apiKey: '',
    endpoint: 'https://api.openai.com/v1',
  },
  midjourney: {
    enabled: true,
    apiKey: '',
    endpoint: 'https://api.midjourney.com',
  },
  doubao: {
    enabled: true,
    apiKey: '',
    endpoint: 'https://api.doubao.ai/v1',
  },
  runway: {
    enabled: true,
    apiKey: '',
    endpoint: 'https://api.runwayml.com/v1',
  },
  sora: {
    enabled: false,
    apiKey: '',
    endpoint: 'https://api.openai.com/v1',
  },
};

// API 提供商信息
export const API_PROVIDERS = {
  // 图像生成 API
  image: {
    jimeng: {
      name: '即梦',
      provider: '字节跳动',
      strengths: ['中文优化', '速度快', '价格实惠'],
      maxResolution: '2048x2048',
      supportsI2I: true,
      supportsInpainting: true,
      supportsBackgroundRemoval: true,
    },
    kling: {
      name: '可灵',
      provider: '快手',
      strengths: ['高质量写实', '人像优化'],
      maxResolution: '2048x2048',
      supportsI2I: true,
      supportsInpainting: true,
      supportsBackgroundRemoval: false,
    },
    midjourney: {
      name: 'Midjourney',
      provider: 'Midjourney',
      strengths: ['艺术质量高', '风格独特'],
      maxResolution: '2048x2048',
      supportsI2I: true,
      supportsInpainting: false,
      supportsBackgroundRemoval: false,
    },
    dalle: {
      name: 'DALL-E 3',
      provider: 'OpenAI',
      strengths: ['文本理解强', '自动优化'],
      maxResolution: '1024x1024',
      supportsI2I: false,
      supportsInpainting: false,
      supportsBackgroundRemoval: false,
    },
    doubao: {
      name: '豆包',
      provider: '字节跳动',
      strengths: ['多功能', '中文优化'],
      maxResolution: '2048x2048',
      supportsI2I: true,
      supportsInpainting: true,
      supportsBackgroundRemoval: true,
    },
  },
  // 视频生成 API
  video: {
    jimeng: {
      name: '即梦 Seedance',
      provider: '字节跳动',
      strengths: ['中文优化', '速度快', '人物一致性'],
      maxDuration: 10,
      maxResolution: '1080p',
    },
    kling: {
      name: '可灵 3.0',
      provider: '快手',
      strengths: ['高质量写实', '运动流畅', '支持图生视频'],
      maxDuration: 10,
      maxResolution: '1080p',
    },
    vidu: {
      name: 'Vidu',
      provider: '生数科技',
      strengths: ['超快生成', '人物一致性优秀'],
      maxDuration: 4,
      maxResolution: '1080p',
    },
    sora: {
      name: 'Sora',
      provider: 'OpenAI',
      strengths: ['质量顶尖', '时长长', '物理模拟优秀'],
      maxDuration: 60,
      maxResolution: '1080p',
    },
    runway: {
      name: 'Runway Gen-3',
      provider: 'Runway',
      strengths: ['艺术风格强', '视频编辑功能'],
      maxDuration: 10,
      maxResolution: '1080p',
    },
  },
};

// API 路由策略
export const ROUTING_STRATEGY = {
  image: {
    chinese: ['jimeng', 'doubao', 'kling', 'midjourney'],
    english: ['midjourney', 'dalle', 'sd'],
    highQuality: ['midjourney', 'kling', 'sd'],
    fast: ['jimeng', 'doubao', 'dalle'],
  },
  video: {
    chinese: ['jimeng', 'kling', 'vidu'],
    english: ['sora', 'runway', 'kling'],
    highQuality: ['sora', 'kling', 'runway'],
    fast: ['vidu', 'jimeng'],
    consistency: ['vidu', 'kling', 'sora'],
  },
};
