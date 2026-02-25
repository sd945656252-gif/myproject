'use client'

import { useState } from 'react'
import { Mic, Loader2, Download } from 'lucide-react'
import { voiceApi, TTSRequest } from '@/app/lib/api/voice'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function VoicePage() {
  const [text, setText] = useState('')
  const [voice, setVoice] = useState('default')
  const [speed, setSpeed] = useState(1.0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleGenerate = async () => {
    if (!text.trim()) return

    setIsGenerating(true)
    setAudioUrl(null)
    setProgress(0)

    try {
      const request: TTSRequest = {
        text,
        voice,
        speed,
        output_format: 'mp3',
      }

      const response = await voiceApi.textToSpeech(request)

      // Poll for result
      const result = await voiceApi.pollTask(response.task_id, (p) => {
        setProgress(p)
      })

      if (result.audio_url) {
        setAudioUrl(result.audio_url)
      }
    } catch (error) {
      console.error('TTS failed:', error)
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
      link.download = `generated-speech-${Date.now()}.mp3`
      link.click()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <Mic className="text-primary" />
          语音合成
        </h1>
        <p className="text-muted-foreground mt-2">
          使用 Minimax API 进行高质量语音合成
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <div className="p-6 bg-card rounded-lg border space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                文本内容 *
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="输入要转换为语音的文本..."
                className="w-full min-h-[200px] px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isGenerating}
                maxLength={10000}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {text.length} / 10000
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  音色
                </label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isGenerating}
                >
                  <option value="default">默认音色</option>
                  <option value="female1">女声 1</option>
                  <option value="female2">女声 2</option>
                  <option value="male1">男声 1</option>
                  <option value="male2">男声 2</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  语速
                </label>
                <input
                  type="number"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isGenerating}
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !text.trim()}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  合成中... {progress}%
                </>
              ) : (
                <>
                  <Mic size={18} />
                  生成语音
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
                <LoadingSpinner text="AI 正在合成中..." />
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
                  下载语音
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                合成的语音将显示在这里
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
