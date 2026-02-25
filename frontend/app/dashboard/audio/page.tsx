'use client'

import { useState } from 'react'
import { Music, Loader2, Download } from 'lucide-react'
import { audioApi, MusicGenerationRequest } from '@/app/lib/api/audio'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function AudioPage() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('cinematic')
  const [mood, setMood] = useState('epic')
  const [duration, setDuration] = useState(30)
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setAudioUrl(null)
    setProgress(0)

    try {
      const request: MusicGenerationRequest = {
        prompt: prompt || undefined,
        style,
        mood,
        duration,
      }

      const response = await audioApi.generateMusic(request)

      // Poll for result
      const result = await audioApi.pollTask(response.task_id, (p) => {
        setProgress(p)
      })

      if (result.audio_url) {
        setAudioUrl(result.audio_url)
      }
    } catch (error) {
      console.error('Music generation failed:', error)
      alert('生成失败，请稍后重试')
    } finally {
      setIsGenerating(false)
      setProgress(0)
    }
  }

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a')
      link.href = audioUrl
      link.download = `generated-music-${Date.now()}.mp3`
      link.click()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <Music className="text-primary" />
          音乐生成
        </h1>
        <p className="text-muted-foreground mt-2">
          使用 Suno API 生成高质量背景音乐
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <div className="p-6 bg-card rounded-lg border space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                描述（可选）
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述你想要的音乐风格..."
                className="w-full min-h-[80px] px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isGenerating}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  风格
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isGenerating}
                >
                  <option value="cinematic">电影感</option>
                  <option value="pop">流行</option>
                  <option value="electronic">电子</option>
                  <option value="classical">古典</option>
                  <option value="rock">摇滚</option>
                  <option value="jazz">爵士</option>
                  <option value="ambient">氛围</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  情绪
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isGenerating}
                >
                  <option value="happy">快乐</option>
                  <option value="sad">悲伤</option>
                  <option value="epic">史诗</option>
                  <option value="calm">平静</option>
                  <option value="energetic">充满活力</option>
                  <option value="dramatic">戏剧性</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                时长（秒）
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="10"
                max="300"
                className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isGenerating}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  生成中... {progress}%
                </>
              ) : (
                <>
                  <Music size={18} />
                  生成音乐
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

            {isGenerating && !audioUrl ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner text="AI 正在创作中..." />
              </div>
            ) : audioUrl ? (
              <div className="space-y-4">
                <audio
                  src={audioUrl}
                  controls
                  className="w-full"
                />
                <button
                  onClick={handleDownload}
                  className="w-full px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  下载音乐
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                生成的音乐将显示在这里
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
