import { ImageAnalysis } from '@/types/image';

// 模拟图片分析结果
export const mockImageAnalyses: Record<string, ImageAnalysis> = {
  portrait: {
    subject: '一位年轻女性，长发飘逸，面带微笑',
    composition: '中景特写，居中构图，浅景深',
    lighting: '柔和的自然光，从左侧45度照射，面部轮廓清晰',
    color: '暖色调为主，肤色红润，背景偏冷色形成对比',
    style: '专业人像摄影，佳能风格，高画质',
    mood: '温暖、亲切、自然',
    technical: '使用85mm镜头，光圈f/1.8，快门1/200s',
  },
  landscape: {
    subject: '山川湖泊，远处雪山，近处森林',
    composition: '广角镜头，三分法构图，前景有树木作为引导线',
    lighting: '黄金时段光线，日出侧光，山脉有层次感',
    color: '冷色调为主，蓝天白云，雪山洁白，森林翠绿',
    style: '风光摄影，HDR效果，细节丰富',
    mood: '壮阔、宁静、震撼',
    technical: '使用16-35mm广角镜头，小光圈f/11，长曝光',
  },
  urban: {
    subject: '现代都市街景，霓虹灯闪烁，行人穿梭',
    composition: '低角度仰拍，建筑线条引导视线',
    lighting: '夜景人造光源，霓虹灯作为主要光源，冷暖对比',
    color: '高对比度，霓虹蓝紫色与暖黄色混合',
    style: '赛博朋克风格，电影感',
    mood: '繁华、未来感、神秘',
    technical: '高ISO拍摄，慢快门捕捉光轨',
  },
  anime: {
    subject: '动漫风格少女，手持魔杖，周围有魔法粒子',
    composition: '全身像，动态姿势，背景虚化',
    lighting: '柔和的魔法光芒，面部高光明显',
    color: '鲜艳明亮的色彩，粉色和蓝色为主',
    style: '日式动漫风格，新海诚风格',
    mood: '梦幻、可爱、充满希望',
    technical: '数字绘画，赛璐璐风格',
  },
};

// 随机获取一个分析结果
export function getRandomAnalysis(): ImageAnalysis {
  const keys = Object.keys(mockImageAnalyses);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return mockImageAnalyses[randomKey];
}

// 根据图片类型生成分析结果
export function generateAnalysis(imageType: 'portrait' | 'landscape' | 'urban' | 'anime' = 'portrait'): ImageAnalysis {
  return mockImageAnalyses[imageType] || mockImageAnalyses.portrait;
}
