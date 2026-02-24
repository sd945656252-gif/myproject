import { ImageAnalysis } from '@/types/image';

// 提示词模板
export const PROMPT_TEMPLATES = {
  portrait: {
    english: (subject: string) =>
      `Portrait of ${subject}, professional photography, studio lighting, 85mm lens, shallow depth of field, bokeh, photorealistic, 8K`,
    chinese: (subject: string) =>
      `${subject}的人像摄影，专业摄影，影棚光线，85mm镜头，浅景深，背景虚化，照片级真实感，8K画质`,
  },
  landscape: {
    english: (subject: string) =>
      `${subject}, wide angle shot, dramatic composition, nature photography, 8K, HDR, professional landscape`,
    chinese: (subject: string) =>
      `${subject}，广角镜头，戏剧性构图，自然摄影，8K画质，HDR效果，专业风光摄影`,
  },
  cinematic: {
    english: (subject: string) =>
      `Cinematic shot of ${subject}, dramatic lighting, film look, anamorphic lens, movie still, 4K`,
    chinese: (subject: string) =>
      `${subject}的电影镜头，戏剧性光线，电影质感，变形宽银幕镜头，电影剧照，4K画质`,
  },
  anime: {
    english: (subject: string) =>
      `${subject}, anime style, studio ghibli inspired, cel shading, vibrant colors, detailed`,
    chinese: (subject: string) =>
      `${subject}，动漫风格，吉卜力风格，赛璐璐上色，鲜艳色彩，细节丰富`,
  },
};

// API 格式转换
export function convertToMidjourneyFormat(prompt: string, options?: {
  aspectRatio?: string;
  version?: string;
  style?: string;
  quality?: number;
}): string {
  let result = prompt;

  if (options?.aspectRatio) {
    result += ` --ar ${options.aspectRatio}`;
  }
  if (options?.version) {
    result += ` --v ${options.version}`;
  }
  if (options?.style) {
    result += ` --style ${options.style}`;
  }
  if (options?.quality) {
    result += ` --q ${options.quality}`;
  }

  return result;
}

export function convertToSDFormat(prompt: string, negativePrompt?: string): {
  positive: string;
  negative: string;
} {
  return {
    positive: prompt,
    negative: negativePrompt || 'blurry, low quality, distorted, deformed, ugly, bad anatomy, watermark, signature, text, logo',
  };
}

export function convertToJimengFormat(prompt: string, options?: {
  style?: string;
  size?: string;
}): string {
  let result = prompt;

  if (options?.style) {
    result += `，${options.style}风格`;
  }

  return result;
}

// 从分析结果生成提示词
export function generatePromptFromAnalysis(analysis: ImageAnalysis): {
  english: string;
  chinese: string;
} {
  const englishPrompt = `${analysis.subject}, ${analysis.composition}, ${analysis.lighting}, ${analysis.color} color palette, ${analysis.style}${analysis.mood ? `, ${analysis.mood} mood` : ''}${analysis.technical ? `, ${analysis.technical}` : ''}`;

  const chinesePrompt = `${analysis.subject}，${analysis.composition}，${analysis.lighting}，${analysis.color}色调，${analysis.style}${analysis.mood ? `，${analysis.mood}氛围` : ''}`;

  return {
    english: englishPrompt,
    chinese: chinesePrompt,
  };
}

// 优化提示词
export function optimizePrompt(
  originalPrompt: string,
  targetApi: 'midjourney' | 'sd' | 'jimeng' | 'dalle',
  style?: string
): string {
  // 基础质量标签
  const qualityTags = {
    midjourney: 'highly detailed, 8k, photorealistic',
    sd: 'highly detailed, best quality, masterpiece, 8k',
    jimeng: '高清画质，精细细节，专业摄影',
    dalle: 'highly detailed, professional quality',
  };

  // 风格标签
  const styleTags: Record<string, string> = {
    photorealistic: 'photorealistic, raw photo, shot on Canon EOS',
    anime: 'anime style, cel shading, studio ghibli',
    cinematic: 'cinematic, film look, dramatic lighting',
    'digital-art': 'digital art, concept art, artstation trending',
    '3d-render': '3D render, octane render, unreal engine',
  };

  let optimized = originalPrompt;

  // 添加风格标签
  if (style && styleTags[style]) {
    optimized += `, ${styleTags[style]}`;
  }

  // 添加质量标签
  optimized += `, ${qualityTags[targetApi]}`;

  return optimized;
}

// 常用提示词片段
export const PROMPT_FRAGMENTS = {
  lighting: {
    goldenHour: 'golden hour lighting, warm sunset glow',
    blueHour: 'blue hour, twilight, moody atmosphere',
    studio: 'studio lighting, soft diffused light',
    dramatic: 'dramatic lighting, chiaroscuro, high contrast',
    neon: 'neon lights, cyberpunk, neon glow',
  },
  camera: {
    closeUp: 'close-up shot, detailed',
    mediumShot: 'medium shot, waist up',
    wideShot: 'wide shot, environmental',
    aerial: 'aerial view, drone shot, bird eye view',
    lowAngle: 'low angle, dramatic perspective',
  },
  quality: {
    high: 'highly detailed, 8k, photorealistic, sharp focus',
    cinematic: 'cinematic, film grain, anamorphic',
    artistic: 'artistic, stylized, creative',
  },
};
