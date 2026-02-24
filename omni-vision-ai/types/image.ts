import { GenerationStatus } from './api';

// 图像尺寸
export type ImageSize = '1024x1024' | '1920x1080' | '1080x1920' | '512x512' | '2048x2048';

// 图像风格
export type ImageStyle =
  | 'photorealistic'
  | 'anime'
  | 'digital-art'
  | 'oil-painting'
  | 'watercolor'
  | '3d-render'
  | 'cinematic'
  | 'fantasy'
  | 'minimalist';

// 生成的图像
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  negativePrompt?: string;
  size: ImageSize;
  style?: ImageStyle;
  seed?: number;
  api: string;
  createdAt: Date;
  isMock?: boolean;
}

// 图像生成请求
export interface ImageGenerateRequest {
  prompt: string;
  negativePrompt?: string;
  size?: ImageSize;
  style?: ImageStyle;
  api?: 'auto' | 'jimeng' | 'kling' | 'midjourney' | 'dalle' | 'sd';
  numImages?: number;
  seed?: number;
}

// 图像编辑请求
export interface ImageEditRequest {
  imageUrl: string;
  prompt: string;
  maskUrl?: string;
  strength?: number;
}

// 背景移除请求
export interface RemoveBackgroundRequest {
  imageUrl: string;
}

// 图像分析结果
export interface ImageAnalysis {
  subject: string;
  composition: string;
  lighting: string;
  color: string;
  style: string;
  mood?: string;
  technical?: string;
}

// 图片画廊项
export interface GalleryItem {
  id: string;
  image: GeneratedImage;
  analysis?: ImageAnalysis;
  favorite: boolean;
}
