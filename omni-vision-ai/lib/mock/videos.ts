import { GeneratedVideo, ShotScript } from '@/types/video';

// 模拟视频 URL (使用示例视频)
const SAMPLE_VIDEOS = [
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://www.w3schools.com/html/movie.mp4',
];

// 生成随机种子
function generateSeed(): string {
  return Math.random().toString(36).substring(7);
}

// 模拟生成的视频
export function generateMockVideo(prompt: string, duration: number = 5): GeneratedVideo {
  const seed = generateSeed();
  const videoIndex = Math.floor(Math.random() * SAMPLE_VIDEOS.length);

  return {
    id: `vid-${Date.now()}-${seed}`,
    url: SAMPLE_VIDEOS[videoIndex],
    thumbnailUrl: `https://picsum.photos/seed/${seed}/320/180`,
    prompt,
    duration,
    aspectRatio: '16:9',
    resolution: '1080p',
    api: 'mock',
    createdAt: new Date(),
    isMock: true,
  };
}

// 模拟图生视频
export function generateMockImageToVideo(imageUrl: string, prompt: string, duration: number = 5): GeneratedVideo {
  const seed = generateSeed();
  const videoIndex = Math.floor(Math.random() * SAMPLE_VIDEOS.length);

  return {
    id: `vid-i2v-${Date.now()}-${seed}`,
    url: SAMPLE_VIDEOS[videoIndex],
    thumbnailUrl: imageUrl,
    prompt,
    imageUrl,
    duration,
    aspectRatio: '16:9',
    resolution: '1080p',
    api: 'mock',
    createdAt: new Date(),
    isMock: true,
  };
}

// 模拟镜头脚本生成
export function generateMockShotScripts(count: number = 6): ShotScript[] {
  const shotTypes: ShotScript['shotType'][] = ['WS', 'MS', 'CU', 'ECU', 'OTS', 'POV', 'PAN', 'TILT', 'DOLLY'];

  const scripts: ShotScript[] = [];

  for (let i = 0; i < count; i++) {
    scripts.push({
      id: `shot-${i + 1}`,
      shotNumber: i + 1,
      shotType: shotTypes[Math.floor(Math.random() * shotTypes.length)],
      duration: Math.floor(Math.random() * 4) + 3,
      visual: `镜头${i + 1}画面描述：这是一个${shotTypes[Math.floor(Math.random() * shotTypes.length)]}镜头，展示了主要场景和人物的动作。`,
      audio: `镜头${i + 1}音频：背景音乐渐入，配合环境音效。`,
      camera: '缓慢推进',
      notes: '注意保持画面稳定',
    });
  }

  return scripts;
}

// 模拟视频高清化
export function generateMockUpscale(videoUrl: string, targetResolution: string): GeneratedVideo {
  const seed = generateSeed();

  return {
    id: `vid-upscaled-${Date.now()}-${seed}`,
    url: videoUrl,
    thumbnailUrl: `https://picsum.photos/seed/${seed}/320/180`,
    prompt: 'Upscaled video',
    duration: 5,
    aspectRatio: '16:9',
    resolution: targetResolution,
    api: 'mock',
    createdAt: new Date(),
    isMock: true,
  };
}

// 视频风格示例
export const videoStyleExamples: Record<string, { prompt: string; thumbnail: string }> = {
  cinematic: {
    prompt: 'Cinematic video, dramatic lighting, film look, anamorphic lens',
    thumbnail: 'https://picsum.photos/seed/cine1/320/180',
  },
  anime: {
    prompt: 'Anime style video, vibrant colors, fluid animation',
    thumbnail: 'https://picsum.photos/seed/anime1/320/180',
  },
  realistic: {
    prompt: 'Photorealistic video, natural lighting, documentary style',
    thumbnail: 'https://picsum.photos/seed/real1/320/180',
  },
  artistic: {
    prompt: 'Artistic video, stylized visuals, creative effects',
    thumbnail: 'https://picsum.photos/seed/art1/320/180',
  },
};
