'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2,
  ChevronRight,
  ChevronLeft,
  Check,
  RefreshCw,
  Download,
  FileText,
  Users,
  Settings2,
  Film,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  WorkflowStep,
  StoryOutline,
  ShotScript,
  ProductionConfig,
  Character,
  WORKFLOW_STEPS,
} from '@/types/workflow';
import { useWorkflowStore } from '@/lib/store/workflow';
import { generateMockShotScripts } from '@/lib/mock/videos';
import { generateMockImage } from '@/lib/mock/images';

export default function WorkflowPage() {
  const {
    currentStep,
    story,
    script,
    config,
    characters,
    isProcessing,
    setStory,
    setScript,
    setConfig,
    addCharacter,
    nextStep,
    prevStep,
    goToStep,
    setProcessing,
    resetWorkflow,
    getStepIndex,
    getTotalSteps,
  } = useWorkflowStore();

  const [idea, setIdea] = useState('');
  const [localStory, setLocalStory] = useState<StoryOutline | null>(null);
  const [localScript, setLocalScript] = useState<ShotScript[]>([]);
  const [localConfig, setLocalConfig] = useState<ProductionConfig>({
    aspectRatio: '16:9',
    resolution: '1080p',
    frameRate: 24,
    style: 'cinematic',
    totalDuration: 60,
    primaryAPI: 'jimeng',
    fallbackAPIs: ['kling', 'vidu'],
  });

  const stepIndex = getStepIndex();
  const totalSteps = getTotalSteps();
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  // Step 1: 生成故事
  const handleGenerateStory = async () => {
    if (!idea) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));

    const storyResult: StoryOutline = {
      title: '未命名故事',
      logline: idea,
      act1: `开端：${idea}。故事从一个平静的场景开始，主角的日常生活被打破。`,
      act2: `冲突：主角面临挑战，经历成长与挣扎。转折点出现在关键时刻。`,
      act3: `结局：故事走向高潮与结局，主角完成了蜕变。`,
      characters: [
        { id: 'char-1', name: '主角', description: '故事的核心人物' },
      ],
      setting: '现代都市',
    };

    setLocalStory(storyResult);
    setStory(storyResult);
    setProcessing(false);
  };

  // Step 2: 生成分镜脚本
  const handleGenerateScript = async () => {
    if (!story) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));

    const scripts = generateMockShotScripts(8);
    setLocalScript(scripts);
    setScript(scripts);
    setProcessing(false);
  };

  // Step 3: 保存配置
  const handleSaveConfig = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 500));
    setConfig(localConfig);
    setProcessing(false);
    nextStep();
  };

  // Step 4: 生成角色
  const handleGenerateCharacter = async () => {
    if (!story?.characters.length) return;
    setProcessing(true);

    for (const char of story.characters) {
      await new Promise((r) => setTimeout(r, 1000));
      const refImage = generateMockImage(
        `Character design sheet of ${char.description}, three-view: front, side, back`,
        '1024x1024'
      );
      addCharacter({
        ...char,
        referenceImage: refImage,
      });
    }

    setProcessing(false);
  };

  // 渲染步骤图标
  const renderStepIcon = (stepId: WorkflowStep) => {
    const icons = {
      story: FileText,
      script: Film,
      config: Settings2,
      character: Users,
      shots: Play,
      postproduction: Download,
    };
    const Icon = icons[stepId] || Wand2;
    return <Icon className="h-5 w-5" />;
  };

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 'story':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: 故事起稿</CardTitle>
              <CardDescription>将一句话灵感扩展为三幕剧结构</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>你的灵感</Label>
                <Textarea
                  placeholder="例如：一个孤独的老人在公园里遇到一只流浪狗"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleGenerateStory}
                disabled={!idea || isProcessing}
              >
                {isProcessing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                生成故事大纲
              </Button>

              {localStory && (
                <div className="space-y-4 mt-6">
                  <div className="p-4 rounded-lg bg-muted space-y-3">
                    <div>
                      <h4 className="font-semibold">故事标题</h4>
                      <p className="text-muted-foreground">{localStory.title}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">一句话梗概</h4>
                      <p className="text-muted-foreground">{localStory.logline}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">第一幕 - 开端</h4>
                      <p className="text-sm">{localStory.act1}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">第二幕 - 冲突</h4>
                      <p className="text-sm">{localStory.act2}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">第三幕 - 结局</h4>
                      <p className="text-sm">{localStory.act3}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">角色</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {localStory.characters.map((c) => (
                          <span
                            key={c.id}
                            className="px-2 py-1 bg-background rounded text-sm"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={nextStep}>
                      满意，继续 <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'script':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: 分段脚本</CardTitle>
              <CardDescription>拆解为具体的视频分镜脚本</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleGenerateScript}
                disabled={!story || isProcessing}
              >
                {isProcessing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                生成分镜脚本
              </Button>

              {localScript.length > 0 && (
                <div className="space-y-3 mt-4">
                  {localScript.map((shot) => (
                    <div key={shot.id} className="p-3 rounded border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded text-xs">
                          镜头 {shot.shotNumber}
                        </span>
                        <span className="text-sm font-medium">{shot.shotType}</span>
                        <span className="text-xs text-muted-foreground">
                          {shot.duration}秒
                        </span>
                      </div>
                      <p className="text-sm">{shot.visual}</p>
                    </div>
                  ))}

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={prevStep}>
                      <ChevronLeft className="h-4 w-4 mr-2" /> 返回修改
                    </Button>
                    <Button onClick={nextStep}>
                      满意，继续 <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'config':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: 创作配置</CardTitle>
              <CardDescription>确定画面比例、帧率、风格、API 选择</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>画面比例</Label>
                  <Select
                    value={localConfig.aspectRatio}
                    onValueChange={(v) =>
                      setLocalConfig({ ...localConfig, aspectRatio: v as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:9">16:9 横版</SelectItem>
                      <SelectItem value="9:16">9:16 竖版</SelectItem>
                      <SelectItem value="1:1">1:1 正方形</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>分辨率</Label>
                  <Select
                    value={localConfig.resolution}
                    onValueChange={(v) =>
                      setLocalConfig({ ...localConfig, resolution: v as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p (推荐)</SelectItem>
                      <SelectItem value="4K">4K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>帧率</Label>
                  <Select
                    value={String(localConfig.frameRate)}
                    onValueChange={(v) =>
                      setLocalConfig({ ...localConfig, frameRate: Number(v) as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24fps (电影)</SelectItem>
                      <SelectItem value="30">30fps (标准)</SelectItem>
                      <SelectItem value="60">60fps (流畅)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>风格</Label>
                  <Select
                    value={localConfig.style}
                    onValueChange={(v) =>
                      setLocalConfig({ ...localConfig, style: v as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cinematic">电影感</SelectItem>
                      <SelectItem value="realistic">写实</SelectItem>
                      <SelectItem value="anime">动漫</SelectItem>
                      <SelectItem value="artistic">艺术风格</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>主要 API</Label>
                  <Select
                    value={localConfig.primaryAPI}
                    onValueChange={(v) =>
                      setLocalConfig({ ...localConfig, primaryAPI: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jimeng">即梦 Seedance</SelectItem>
                      <SelectItem value="kling">可灵 3.0</SelectItem>
                      <SelectItem value="vidu">Vidu</SelectItem>
                      <SelectItem value="sora">Sora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>总时长</Label>
                  <Select
                    value={String(localConfig.totalDuration)}
                    onValueChange={(v) =>
                      setLocalConfig({ ...localConfig, totalDuration: Number(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30秒</SelectItem>
                      <SelectItem value="60">1分钟</SelectItem>
                      <SelectItem value="120">2分钟</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> 返回修改
                </Button>
                <Button onClick={handleSaveConfig}>
                  保存配置 <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'character':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 4: 角色设定</CardTitle>
              <CardDescription>生成角色参考图与三视图</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {story?.characters && story.characters.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    找到 {story.characters.length} 个角色，点击生成角色设定图
                  </p>

                  <Button
                    onClick={handleGenerateCharacter}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    生成角色设定
                  </Button>

                  {characters.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      {characters.map((char) => (
                        <div key={char.id} className="p-4 rounded border space-y-2">
                          <h4 className="font-semibold">{char.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {char.description}
                          </p>
                          {char.referenceImage && (
                            <div className="aspect-square rounded overflow-hidden bg-muted">
                              <img
                                src={char.referenceImage.url}
                                alt={char.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> 返回修改
                </Button>
                <Button onClick={nextStep} disabled={characters.length === 0}>
                  继续 <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'shots':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 5: 分镜生成</CardTitle>
              <CardDescription>批量生成每个分镜的画面或视频</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                <Film className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>分镜生成功能需要配置 API Key</p>
                <p className="text-sm mt-2">
                  在设置页面配置视频生成 API 后可用
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> 返回修改
                </Button>
                <Button onClick={nextStep}>
                  继续 <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'postproduction':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 6: 成片建议</CardTitle>
              <CardDescription>输出剪辑顺序、转场、配乐提示词</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-muted space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">剪辑顺序建议</h4>
                  <p className="text-sm">
                    按照故事情感曲线排列分镜，高潮部分增加快速切换，结尾使用慢镜头和渐变。
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">转场建议</h4>
                  <ul className="text-sm space-y-1">
                    <li>- 镜头 1-3: 硬切</li>
                    <li>- 镜头 4-6: 溶解</li>
                    <li>- 镜头 7-8: 淡入淡出</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">配乐提示词</h4>
                  <p className="text-sm bg-background p-2 rounded font-mono">
                    Emotional orchestral piece for piano and strings,
                    beginning with lonely piano melody,
                    gradually building to hopeful resolution,
                    cinematic style
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> 返回修改
                </Button>
                <Button onClick={resetWorkflow}>
                  <Check className="h-4 w-4 mr-2" />
                  完成工作流
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">一键视频工作流</h1>
        <p className="text-muted-foreground">
          从一句话灵感到完整成片，6 步标准化流程自动推进
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>进度</span>
          <span>
            步骤 {stepIndex + 1} / {totalSteps}
          </span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Steps Navigation */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-2">
          {WORKFLOW_STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < stepIndex;
            return (
              <button
                key={step.id}
                onClick={() => (isCompleted ? goToStep(step.id) : null)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors
                  ${isActive ? 'bg-primary text-primary-foreground' : ''}
                  ${isCompleted ? 'bg-muted cursor-pointer hover:bg-muted/80' : ''}
                  ${!isActive && !isCompleted ? 'bg-muted/50 text-muted-foreground' : ''}
                `}
              >
                <span
                  className={`
                    flex h-6 w-6 items-center justify-center rounded-full text-xs
                    ${isActive ? 'bg-primary-foreground text-primary' : ''}
                    ${isCompleted ? 'bg-primary text-primary-foreground' : ''}
                    ${!isActive && !isCompleted ? 'bg-muted' : ''}
                  `}
                >
                  {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                <span className="text-sm font-medium">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Tips */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">
            提示：每个步骤完成后，你可以选择满意继续，或者返回修改。工作流会自动保存你的进度。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
