'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Sparkles, Copy, RefreshCw, ArrowRight } from 'lucide-react';
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
import { ImageAnalysis } from '@/types/image';
import { getRandomAnalysis } from '@/lib/mock/prompts';
import {
  generatePromptFromAnalysis,
  convertToMidjourneyFormat,
  convertToSDFormat,
  convertToJimengFormat,
  optimizePrompt,
} from '@/lib/utils/prompt-engineering';
import { copyToClipboard } from '@/lib/utils/helpers';

export default function PromptPage() {
  const [mode, setMode] = useState<'reverse' | 'optimize'>('reverse');
  const [imageUrl, setImageUrl] = useState('');
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [prompts, setPrompts] = useState<{ english: string; chinese: string } | null>(null);
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [targetApi, setTargetApi] = useState<'midjourney' | 'sd' | 'jimeng' | 'dalle'>('midjourney');
  const [style, setStyle] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 模拟图片分析
  const handleAnalyze = async () => {
    if (!imageUrl) return;

    setIsProcessing(true);
    // 模拟 API 延迟
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockAnalysis = getRandomAnalysis();
    setAnalysis(mockAnalysis);
    setPrompts(generatePromptFromAnalysis(mockAnalysis));
    setIsProcessing(false);
  };

  // 处理图片上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  // 优化提示词
  const handleOptimize = async () => {
    if (!originalPrompt) return;

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const optimized = optimizePrompt(originalPrompt, targetApi, style);
    setOptimizedPrompt(optimized);
    setIsProcessing(false);
  };

  // 复制提示词
  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      // 可以添加 toast 提示
      console.log('Copied to clipboard');
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">提示词工程</h1>
        <p className="text-muted-foreground">
          图片反推提示词、提示词优化、多 API 格式适配
        </p>
      </div>

      {/* Mode Tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'reverse' | 'optimize')}>
        <TabsList>
          <TabsTrigger value="reverse">
            <Upload className="h-4 w-4 mr-2" />
            图片反推
          </TabsTrigger>
          <TabsTrigger value="optimize">
            <Sparkles className="h-4 w-4 mr-2" />
            提示词优化
          </TabsTrigger>
        </TabsList>

        {/* Reverse Mode */}
        <TabsContent value="reverse" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input */}
            <Card>
              <CardHeader>
                <CardTitle>上传图片</CardTitle>
                <CardDescription>
                  上传图片或输入图片 URL，AI 将分析并生成提示词
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* URL Input */}
                <div className="space-y-2">
                  <Label>图片 URL</Label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 h-10 px-3 rounded-md border bg-background text-sm"
                    />
                    <Button onClick={handleAnalyze} disabled={!imageUrl || isProcessing}>
                      {isProcessing ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      分析
                    </Button>
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label>或上传文件</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        点击上传或拖拽图片到这里
                      </span>
                    </label>
                  </div>
                </div>

                {/* Preview */}
                {imageUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Output */}
            <Card>
              <CardHeader>
                <CardTitle>分析结果</CardTitle>
                <CardDescription>
                  AI 识别的图片要素和生成的提示词
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis ? (
                  <>
                    {/* Analysis */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">图片分析</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 rounded bg-muted">
                          <span className="text-muted-foreground">主体：</span>
                          <span>{analysis.subject}</span>
                        </div>
                        <div className="p-2 rounded bg-muted">
                          <span className="text-muted-foreground">构图：</span>
                          <span>{analysis.composition}</span>
                        </div>
                        <div className="p-2 rounded bg-muted">
                          <span className="text-muted-foreground">光影：</span>
                          <span>{analysis.lighting}</span>
                        </div>
                        <div className="p-2 rounded bg-muted">
                          <span className="text-muted-foreground">色彩：</span>
                          <span>{analysis.color}</span>
                        </div>
                        <div className="p-2 rounded bg-muted col-span-2">
                          <span className="text-muted-foreground">风格：</span>
                          <span>{analysis.style}</span>
                        </div>
                      </div>
                    </div>

                    {/* Prompts */}
                    {prompts && (
                      <div className="space-y-3">
                        <h4 className="font-semibold">生成提示词</h4>

                        <div className="space-y-2">
                          <Label>英文提示词</Label>
                          <div className="relative">
                            <Textarea
                              value={prompts.english}
                              readOnly
                              className="pr-10"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-2"
                              onClick={() => handleCopy(prompts.english)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>中文提示词</Label>
                          <div className="relative">
                            <Textarea
                              value={prompts.chinese}
                              readOnly
                              className="pr-10"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-2"
                              onClick={() => handleCopy(prompts.chinese)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* API Formats */}
                    {prompts && (
                      <div className="space-y-3">
                        <h4 className="font-semibold">API 格式适配</h4>
                        <div className="space-y-2">
                          <Label>Midjourney 格式</Label>
                          <Textarea
                            value={convertToMidjourneyFormat(prompts.english, { aspectRatio: '16:9' })}
                            readOnly
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>即梦格式</Label>
                          <Textarea
                            value={convertToJimengFormat(prompts.chinese)}
                            readOnly
                            className="text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>上传图片后开始分析</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Optimize Mode */}
        <TabsContent value="optimize" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input */}
            <Card>
              <CardHeader>
                <CardTitle>原始提示词</CardTitle>
                <CardDescription>
                  输入简单描述，AI 将扩写为专业提示词
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>原始提示词</Label>
                  <Textarea
                    placeholder="例如：一只在草地上奔跑的金毛犬"
                    value={originalPrompt}
                    onChange={(e) => setOriginalPrompt(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>目标 API</Label>
                    <Select value={targetApi} onValueChange={(v) => setTargetApi(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="midjourney">Midjourney</SelectItem>
                        <SelectItem value="sd">Stable Diffusion</SelectItem>
                        <SelectItem value="jimeng">即梦</SelectItem>
                        <SelectItem value="dalle">DALL-E 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>风格 (可选)</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择风格" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photorealistic">写实摄影</SelectItem>
                        <SelectItem value="anime">动漫风格</SelectItem>
                        <SelectItem value="cinematic">电影感</SelectItem>
                        <SelectItem value="digital-art">数字艺术</SelectItem>
                        <SelectItem value="3d-render">3D 渲染</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleOptimize}
                  disabled={!originalPrompt || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  优化提示词
                </Button>
              </CardContent>
            </Card>

            {/* Output */}
            <Card>
              <CardHeader>
                <CardTitle>优化结果</CardTitle>
                <CardDescription>
                  针对目标 API 优化的专业提示词
                </CardDescription>
              </CardHeader>
              <CardContent>
                {optimizedPrompt ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>优化后的提示词</Label>
                      <div className="relative">
                        <Textarea
                          value={optimizedPrompt}
                          readOnly
                          rows={6}
                          className="pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2"
                          onClick={() => handleCopy(optimizedPrompt)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" asChild>
                        <a href="/image">
                          去生成图像 <ArrowRight className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>输入原始提示词后开始优化</p>
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
