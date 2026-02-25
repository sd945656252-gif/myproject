import { GenerationStatus } from './api';

// 视频时长
export type VideoDuration = 4 | 5 | 10 | 15 | 30 | 60;

// 视频比例
export type VideoAspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '21:9';

// 视频风格
export type VideoStyle =
  | 'cinematic'
  | 'anime'
  | 'realistic'
  | 'artistic'
  | 'documentary'
  | 'commercial';

// 生成的视频
export interface GeneratedVideo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  prompt: string;
  imageUrl?: string;
  duration: number;
  aspectRatio: VideoAspectRatio;
  style?: VideoStyle;
  resolution: string;
  api: string;
  createdAt: Date;
  isMock?: boolean;
}

// 视频生成请求
export interface VideoGenerateRequest {
  prompt: string;
  imageUrl?: string;
  duration?: VideoDuration;
  aspectRatio?: VideoAspectRatio;
  style?: VideoStyle;
  api?: 'auto' | 'jimeng' | 'kling' | 'vidu' | 'sora' | 'runway';
  seed?: number;
}

// 视频增强请求
export interface VideoEnhanceRequest {
  videoUrl: string;
  targetResolution?: '1080p' | '2K' | '4K';
  frameInterpolation?: boolean;
}

// 镜头类型
export type ShotType =
  | 'WS'   // Wide Shot
  | 'MS'   // Medium Shot
  | 'CU'   // Close-up
  | 'ECU'  // Extreme Close-up
  | 'OTS'  // Over Shoulder
  | 'POV'  // Point of View
  | 'PAN'  // Pan
  | 'TILT' // Tilt
  | 'DOLLY'; // Dolly

// 镜头脚本
export interface ShotScript {
  id: string;
  shotNumber: number;
  shotType: ShotType;
  duration: number;
  visual: string;
  audio: string;
  camera?: string;
  notes?: string;
}
