'use client';

import { useState } from 'react';
import {
  Video as VideoIcon,
  Sparkles,
  Download,
  RefreshCw,
  Copy,
  Image as ImageIcon,
  Settings2,
  Play,
  Pause,
  Volume2,
  VolumeX,
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
import { Slider } from '@/components/ui/slider';
import { GeneratedVideo, VideoAspectRatio, VideoStyle } from '@/types/video';
import { generateMockVideo, generateMockImageToVideo } from '@/lib/mock/videos';
import { useGalleryStore } from '@/lib/store/gallery';
import { copyToClipboard, downloadFile } from '@/lib/utils/helpers';

const aspectRatios: { value: VideoAspectRatio; label: string }[] = [
  { value: '16:9', label: '16:9 横版' },
  { value: '9:16', label: '9:16 竖版' },
  { value: '1:1', label: '1:1 正方形' },
  { value: '4:3', label: '4:3 传统' },
];

const videoStyles: { value: VideoStyle; label: string }[] = [
  { value: 'cinematic', label: '电影感' },
  { value: 'realistic', label: '写实' },
  { value: 'anime', label: '动漫' },
  { value: 'artistic', label: '艺术风格' },
  { value: 'documentary', label: '纪录片' },
  { value: 'commercial', label: '商业广告' },
];

const durations = [4, 5, 10, 15, 30];

export default function VideoPage() {
  const [mode, setMode] = useState<'text2video' | 'image2video'>('text2video');
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('16:9');
  const [style, setStyle] = useState<VideoStyle>('cinematic');
  const [duration, setDuration] = useState(5);
  const [selectedApi, setSelectedApi] = useState<string>('auto');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const addVideo = useGalleryStore((state) => state.addVideo);

  // 生成视频
  const handleGenerate = async () => {
    if (!prompt) return;

    setIsGenerating(true);
    setProgress(0);

    // 模拟进度
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 500);

    // 模拟生成延迟 (视频生成更慢)
    await new Promise((resolve) => setTimeout(resolve, 5000));

    let video: GeneratedVideo;
    if (mode === 'image2video' && imageUrl) {
      video = generateMockImageToVideo(imageUrl, prompt, duration);
    } else {
      video = generateMockVideo(prompt, duration);
    }

    video.aspectRatio = aspectRatio;

    setGeneratedVideo(video);
    addVideo(video);
    setProgress(100);
    setIsGenerating(false);
    clearInterval(interval);
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">视频生成矩阵</h1>
        <p className="text-muted-foreground">
          文生视频、图生视频、风格转绘、角色一致性
        </p>
      </div>

      {/* Mode Tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
        <TabsList>
          <TabsTrigger value="text2video">
            <VideoIcon className="h-4 w-4 mr-2" />
            文生视频
          </TabsTrigger>
          <TabsTrigger value="image2video">
            <ImageIcon className="h-4 w-4 mr-2" />
            图生视频
          </TabsTrigger>
        </TabsList>

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
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
                <Label>场景描述</Label>
                <Textarea
                  placeholder="描述你想要生成的视频场景..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Image URL for image2video */}
              {mode === 'image2video' && (
                <div className="space-y-2">
                  <Label>参考图片 URL</Label>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                  />
                  {imageUrl && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={imageUrl}
                        alt="Reference"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Aspect Ratio */}
              <div className="space-y-2">
                <Label>画面比例</Label>
                <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as VideoAspectRatio)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aspectRatios.map((ar) => (
                      <SelectItem key={ar.value} value={ar.value}>
                        {ar.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Style */}
              <div className="space-y-2">
                <Label>风格</Label>
                <Select value={style} onValueChange={(v) => setStyle(v as VideoStyle)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {videoStyles.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label>时长: {duration}秒</Label>
                <Slider
                  value={[duration]}
                  onValueChange={([v]) => setDuration(v)}
                  min={4}
                  max={30}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>4秒</span>
                  <span>30秒</span>
                </div>
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
                    <SelectItem value="jimeng">即梦 Seedance</SelectItem>
                    <SelectItem value="kling">可灵 3.0</SelectItem>
                    <SelectItem value="vidu">Vidu</SelectItem>
                    <SelectItem value="sora">Sora</SelectItem>
                    <SelectItem value="runway">Runway</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!prompt || isGenerating || (mode === 'image2video' && !imageUrl)}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    生成中... {progress}%
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    生成视频
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
                AI 生成的视频将显示在这里
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedVideo ? (
                <div className="space-y-4">
                  {/* Video Player */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                    <video
                      src={generatedVideo.url}
                      poster={generatedVideo.thumbnailUrl}
                      className="w-full h-full object-contain"
                      loop
                      muted={isMuted}
                      autoPlay={isPlaying}
                      controls
                    />
                    {/* Controls Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="p-3 rounded bg-muted">
                      <div className="text-muted-foreground">API</div>
                      <div className="font-medium">{generatedVideo.api}</div>
                    </div>
                    <div className="p-3 rounded bg-muted">
                      <div className="text-muted-foreground">时长</div>
                      <div className="font-medium">{generatedVideo.duration}秒</div>
                    </div>
                    <div className="p-3 rounded bg-muted">
                      <div className="text-muted-foreground">分辨率</div>
                      <div className="font-medium">{generatedVideo.resolution}</div>
                    </div>
                    <div className="p-3 rounded bg-muted">
                      <div className="text-muted-foreground">比例</div>
                      <div className="font-medium">{generatedVideo.aspectRatio}</div>
                    </div>
                  </div>

                  {/* Prompt */}
                  <div className="space-y-2">
                    <Label>提示词</Label>
                    <div className="p-3 rounded bg-muted text-sm">
                      {generatedVideo.prompt}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(generatedVideo.prompt)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      复制提示词
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => downloadFile(generatedVideo.url, `video-${generatedVideo.id}.mp4`)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      下载视频
                    </Button>
                  </div>

                  {generatedVideo.isMock && (
                    <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
                      当前使用模拟数据。请前往设置配置 API Key 以使用真实服务。
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 text-muted-foreground">
                  <VideoIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>输入场景描述后点击生成</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>

      {/* Supported APIs */}
      <Card>
        <CardHeader>
          <CardTitle>支持的视频 API</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: '即梦 Seedance', provider: '字节跳动', duration: '最长10秒' },
              { name: '可灵 3.0', provider: '快手', duration: '最长10秒' },
              { name: 'Vidu', provider: '生数科技', duration: '最长4秒' },
              { name: 'Sora', provider: 'OpenAI', duration: '最长60秒' },
              { name: 'Runway', provider: 'Runway', duration: '最长10秒' },
            ].map((api) => (
              <div key={api.name} className="p-3 rounded border text-center">
                <div className="font-medium">{api.name}</div>
                <div className="text-xs text-muted-foreground">{api.provider}</div>
                <div className="text-xs text-muted-foreground">{api.duration}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
