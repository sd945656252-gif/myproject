'use client'

import { useState } from 'react'
import { Video, Loader2 } from 'lucide-react'
import { videoApi, TextToVideoRequest } from '@/app/lib/api/video'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function VideoPage() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setVideoUrl(null)
    setProgress(0)

    try {
      const request: TextToVideoRequest = {
        prompt,
        duration: 5.0,
        fps: 24,
        width: 1280,
        height: 720,
      }

      const response = await videoApi.textToVideo(request)

      // Poll for result
      const result = await videoApi.pollTask(response.task_id, (p) => {
        setProgress(p)
      })

      if (result.video_url) {
        setVideoUrl(result.video_url)
      }
    } catch (error) {
      console.error('Video generation failed:', error)
      alert('生成失败，请稍后重试')
    } finally {
      setIsGenerating(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <Video className="text-primary" />
          AI 生视频
        </h1>
        <p className="text-muted-foreground mt-2">
          使用智能路由系统生成高质量视频
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <div className="p-6 bg-card rounded-lg border space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                视频描述 *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述你想要生成的视频内容..."
                className="w-full min-h-[120px] px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isGenerating}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  时长（秒）
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  step="0.5"
                  defaultValue="5"
                  className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isGenerating}
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  帧率
                </label>
                <select
                  className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isGenerating}
                  defaultValue="24"
                >
                  <option value="24">24 fps</option>
                  <option value="30">30 fps</option>
                  <option value="60">60 fps</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  宽度
                </label>
                <select
                  className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isGenerating}
                  defaultValue="1280"
                >
                  <option value="720">720</option>
                  <option value="1280">1280</option>
                  <option value="1920">1920</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  高度
                </label>
                <select
                  className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isGenerating}
                  defaultValue="720"
                >
                  <option value="480">480</option>
                  <option value="720">720</option>
                  <option value="1080">1080</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  生成中... {progress}%
                </>
              ) : (
                <>
                  <Video size={18} />
                  生成视频
                </>
              )}
            </button>
          </div>

          {/* Progress */}
          {isGenerating && progress > 0 && (
            <div className="p-4 bg-card rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">生成进度</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">生成结果</h3>

            {isGenerating && !videoUrl ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner text="AI 正在创作中..." />
              </div>
            ) : videoUrl ? (
              <video
                src={videoUrl}
                controls
                className="w-full rounded-lg"
                autoPlay
              />
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                生成的视频将显示在这里
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
