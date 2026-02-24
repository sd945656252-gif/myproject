import { ShotScript, VideoAspectRatio, VideoStyle } from './video';
import { GeneratedImage, ImageStyle } from './image';

// 工作流步骤
export type WorkflowStep =
  | 'story'        // 故事起稿
  | 'script'       // 分段脚本
  | 'config'       // 创作配置
  | 'character'    // 角色设定
  | 'shots'        // 分镜生成
  | 'postproduction'; // 成片建议

// 工作流状态
export type WorkflowStatus = 'idle' | 'active' | 'paused' | 'completed';

// 故事大纲
export interface StoryOutline {
  title: string;
  logline: string;
  act1: string;  // 开端
  act2: string;  // 冲突
  act3: string;  // 结局
  characters: Character[];
  setting: string;
}

// 角色
export interface Character {
  id: string;
  name: string;
  description: string;
  referenceImage?: GeneratedImage;
  expressionSheet?: GeneratedImage[];
}

// 创作配置
export interface ProductionConfig {
  aspectRatio: VideoAspectRatio;
  resolution: '720p' | '1080p' | '4K';
  frameRate: 24 | 30 | 60;
  style: VideoStyle | ImageStyle;
  totalDuration: number;
  primaryAPI: string;
  fallbackAPIs: string[];
}

// 分镜素材
export interface ShotAsset {
  id: string;
  shot: ShotScript;
  image?: GeneratedImage;
  video?: {
    url: string;
    thumbnailUrl?: string;
    duration: number;
  };
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

// 后期制作建议
export interface PostProductionGuide {
  editDecisionList: {
    shotId: string;
    transition: 'cut' | 'dissolve' | 'fade' | 'wipe';
    transitionDuration?: number;
  }[];
  musicPrompt: string;
  soundEffects: {
    time: number;
    sound: string;
    description: string;
  }[];
  colorGrade: {
    style: string;
    palette: string[];
    lut?: string;
  };
  exportSettings: {
    format: string;
    resolution: string;
    bitrate: string;
  };
}

// 工作流会话
export interface WorkflowSession {
  id: string;
  idea: string;
  currentStep: WorkflowStep;
  status: WorkflowStatus;
  story?: StoryOutline;
  script?: ShotScript[];
  config?: ProductionConfig;
  characters?: Character[];
  shotAssets?: ShotAsset[];
  postProduction?: PostProductionGuide;
  createdAt: Date;
  updatedAt: Date;
}

// 工作流步骤配置
export const WORKFLOW_STEPS: { id: WorkflowStep; title: string; description: string }[] = [
  { id: 'story', title: '故事起稿', description: '将一句话灵感扩展为三幕剧结构' },
  { id: 'script', title: '分段脚本', description: '拆解为具体的视频分镜脚本' },
  { id: 'config', title: '创作配置', description: '确定画面比例、帧率、风格、API选择' },
  { id: 'character', title: '角色设定', description: '生成角色参考图与三视图' },
  { id: 'shots', title: '分镜生成', description: '批量生成每个分镜的画面或视频' },
  { id: 'postproduction', title: '成片建议', description: '输出剪辑顺序、转场、配乐提示词' },
];
