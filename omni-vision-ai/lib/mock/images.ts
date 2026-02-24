import { GeneratedImage } from '@/types/image';

// 模拟图像 URL (使用 picsum.photos 作为占位图)
const PLACEHOLDER_BASE = 'https://picsum.photos/seed';

// 生成随机种子
function generateSeed(): string {
  return Math.random().toString(36).substring(7);
}

// 模拟生成的图像
export function generateMockImage(prompt: string, size: string = '1024x1024'): GeneratedImage {
  const [width, height] = size.split('x').map(Number);
  const seed = generateSeed();

  return {
    id: `img-${Date.now()}-${seed}`,
    url: `${PLACEHOLDER_BASE}/${seed}/${width}/${height}`,
    prompt,
    size: size as GeneratedImage['size'],
    api: 'mock',
    createdAt: new Date(),
    isMock: true,
    seed: Math.floor(Math.random() * 1000000),
  };
}

// 模拟图生图
export function generateMockImageToImage(imageUrl: string, prompt: string): GeneratedImage {
  const seed = generateSeed();

  return {
    id: `img-i2i-${Date.now()}-${seed}`,
    url: `${PLACEHOLDER_BASE}/${seed}/1024/1024`,
    prompt,
    size: '1024x1024',
    api: 'mock',
    createdAt: new Date(),
    isMock: true,
  };
}

// 模拟背景移除
export function generateMockRemoveBackground(imageUrl: string): GeneratedImage {
  const seed = generateSeed();

  return {
    id: `img-nobg-${Date.now()}-${seed}`,
    url: `${PLACEHOLDER_BASE}/${seed}/1024/1024`,
    prompt: 'Background removed',
    size: '1024x1024',
    api: 'mock',
    createdAt: new Date(),
    isMock: true,
  };
}

// 模拟局部重绘
export function generateMockInpainting(imageUrl: string, prompt: string): GeneratedImage {
  const seed = generateSeed();

  return {
    id: `img-inpaint-${Date.now()}-${seed}`,
    url: `${PLACEHOLDER_BASE}/${seed}/1024/1024`,
    prompt,
    size: '1024x1024',
    api: 'mock',
    createdAt: new Date(),
    isMock: true,
  };
}

// 模拟多图融合
export function generateMockFusion(imageUrls: string[], prompt: string): GeneratedImage {
  const seed = generateSeed();

  return {
    id: `img-fusion-${Date.now()}-${seed}`,
    url: `${PLACEHOLDER_BASE}/${seed}/1024/1024`,
    prompt,
    size: '1024x1024',
    api: 'mock',
    createdAt: new Date(),
    isMock: true,
  };
}

// 预设风格示例图像
export const styleExamples: Record<string, { prompt: string; thumbnail: string }> = {
  photorealistic: {
    prompt: 'Professional portrait photography, studio lighting, 85mm lens, photorealistic, 8K',
    thumbnail: `${PLACEHOLDER_BASE}/photo1/400/400`,
  },
  anime: {
    prompt: 'Anime style, vibrant colors, studio ghibli inspired, cel shading',
    thumbnail: `${PLACEHOLDER_BASE}/anime1/400/400`,
  },
  cinematic: {
    prompt: 'Cinematic shot, dramatic lighting, film look, anamorphic lens',
    thumbnail: `${PLACEHOLDER_BASE}/cine1/400/400`,
  },
  '3d-render': {
    prompt: '3D render, octane render, unreal engine, highly detailed',
    thumbnail: `${PLACEHOLDER_BASE}/3d1/400/400`,
  },
  'digital-art': {
    prompt: 'Digital art, concept art, artstation trending, detailed illustration',
    thumbnail: `${PLACEHOLDER_BASE}/digital1/400/400`,
  },
};
