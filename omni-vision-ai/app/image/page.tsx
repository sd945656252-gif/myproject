'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  RefreshCw,
  Copy,
  Eraser,
  Wand2,
  Layers,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { GeneratedImage, ImageSize, ImageStyle } from '@/types/image';
import { generateMockImage, generateMockRemoveBackground } from '@/lib/mock/images';
import { useGalleryStore } from '@/lib/store/gallery';
import { copyToClipboard, downloadFile } from '@/lib/utils/helpers';

const imageSizes: { value: ImageSize; label: string }[] = [
  { value: '1024x1024', label: '1:1 正方形' },
  { value: '1920x1080', label: '16:9 横版' },
  { value: '1080x1920', label: '9:16 竖版' },
  { value: '512x512', label: '512x512 小图' },
];

const imageStyles: { value: ImageStyle; label: string }[] = [
  { value: 'photorealistic', label: '写实摄影' },
  { value: 'anime', label: '动漫风格' },
  { value: 'cinematic', label: '电影感' },
  { value: 'digital-art', label: '数字艺术' },
  { value: '3d-render', label: '3D 渲染' },
  { value: 'oil-painting', label: '油画风格' },
  { value: 'watercolor', label: '水彩风格' },
  { value: 'fantasy', label: '奇幻风格' },
];

export default function ImagePage() {
  const [mode, setMode] = useState<'generate' | 'edit' | 'background'>('generate');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [size, setSize] = useState<ImageSize>('1024x1024');
  const [style, setStyle] = useState<ImageStyle>('photorealistic');
  const [selectedApi, setSelectedApi] = useState<string>('auto');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);

  // 背景移除
  const [bgImageUrl, setBgImageUrl] = useState('');
  const [removedBgImage, setRemovedBgImage] = useState<GeneratedImage | null>(null);

  const addImage = useGalleryStore((state) => state.addImage);

  // 生成图像
  const handleGenerate = async () => {
    if (!prompt) return;

    setIsGenerating(true);
    setProgress(0);

    // 模拟进度
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);

    // 模拟生成延迟
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const image = generateMockImage(prompt, size);
    image.style = style;

    setGeneratedImage(image);
    addImage(image);
    setProgress(100);
    setIsGenerating(false);
    clearInterval(interval);
  };

  // 移除背景
  const handleRemoveBackground = async () => {
    if (!bgImageUrl) return;

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const image = generateMockRemoveBackground(bgImageUrl);
    setRemovedBgImage(image);
    addImage(image);
    setIsGenerating(false);
  };

  // 复制提示词
  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">图像生成矩阵</h1>
        <p className="text-muted-foreground">
          文生图、图生图、局部重绘、背景移除，多 API 智能路由
        </p>
      </div>

      {/* Mode Tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
        <TabsList>
          <TabsTrigger value="generate">
            <ImageIcon className="h-4 w-4 mr-2" />
            文生图
          </TabsTrigger>
          <TabsTrigger value="edit">
            <Wand2 className="h-4 w-4 mr-2" />
            图像编辑
          </TabsTrigger>
          <TabsTrigger value="background">
            <Eraser className="h-4 w-4 mr-2" />
            背景移除
          </TabsTrigger>
        </TabsList>

        {/* Generate Mode */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Settings */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  生成配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Prompt */}
                <div className="space-y-2">
                  <Label>提示词</Label>
                  <Textarea
                    placeholder="描述你想要生成的图像..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Negative Prompt */}
                <div className="space-y-2">
                  <Label>负面提示词 (可选)</Label>
                  <Textarea
                    placeholder="不想要的元素..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Size */}
                <div className="space-y-2">
                  <Label>图像尺寸</Label>
                  <Select value={size} onValueChange={(v) => setSize(v as ImageSize)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {imageSizes.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Style */}
                <div className="space-y-2">
                  <Label>风格</Label>
                  <Select value={style} onValueChange={(v) => setStyle(v as ImageStyle)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {imageStyles.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* API */}
                <div className="space-y-2">
                  <Label>API 选择</Label>
                  <Select value={selectedApi} onValueChange={setSelectedApi}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">自动选择</SelectItem>
                      <SelectItem value="jimeng">即梦</SelectItem>
                      <SelectItem value="kling">可灵</SelectItem>
                      <SelectItem value="midjourney">Midjourney</SelectItem>
                      <SelectItem value="dalle">DALL-E 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      生成图像
                    </>
                  )}
                </Button>

                {/* Progress */}
                {isGenerating && (
                  <Progress value={progress} className="w-full" />
                )}
              </CardContent>
            </Card>

            {/* Result */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>生成结果</CardTitle>
                <CardDescription>
                  AI 生成的图像将显示在这里
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedImage ? (
                  <div className="space-y-4">
                    {/* Image */}
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={generatedImage.url}
                        alt={generatedImage.prompt}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">API:</span>
                        <span>{generatedImage.api}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">尺寸:</span>
                        <span>{generatedImage.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">种子:</span>
                        <span>{generatedImage.seed}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleCopy(generatedImage.prompt)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        复制提示词
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => downloadFile(generatedImage.url, `image-${generatedImage.id}.png`)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        下载图像
                      </Button>
                    </div>

                    {generatedImage.isMock && (
                      <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                        当前使用模拟数据。请前往设置配置 API Key 以使用真实服务。
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20 text-muted-foreground">
                    <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>输入提示词后点击生成</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Edit Mode */}
        <TabsContent value="edit">
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Layers className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">图像编辑功能</h3>
                <p>支持图生图、局部重绘、风格迁移等功能</p>
                <p className="text-sm mt-2">配置 API Key 后可用</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Background Removal Mode */}
        <TabsContent value="background" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input */}
            <Card>
              <CardHeader>
                <CardTitle>上传图片</CardTitle>
                <CardDescription>
                  上传需要移除背景的图片
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>图片 URL</Label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      value={bgImageUrl}
                      onChange={(e) => setBgImageUrl(e.target.value)}
                      className="flex-1 h-10 px-3 rounded-md border bg-background text-sm"
                    />
                    <Button
                      onClick={handleRemoveBackground}
                      disabled={!bgImageUrl || isGenerating}
                    >
                      {isGenerating ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Eraser className="h-4 w-4" />
                      )}
                      移除背景
                    </Button>
                  </div>
                </div>

                {bgImageUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={bgImageUrl}
                      alt="Original"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Output */}
            <Card>
              <CardHeader>
                <CardTitle>处理结果</CardTitle>
                <CardDescription>
                  背景移除后的图片
                </CardDescription>
              </CardHeader>
              <CardContent>
                {removedBgImage ? (
                  <div className="space-y-4">
                    <div
                      className="aspect-video rounded-lg overflow-hidden"
                      style={{
                        backgroundImage:
                          'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                      }}
                    >
                      <img
                        src={removedBgImage.url}
                        alt="No background"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => downloadFile(removedBgImage.url, `nobg-${removedBgImage.id}.png`)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      下载透明背景图
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-20 text-muted-foreground">
                    <Eraser className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>上传图片后移除背景</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
