'use client'

import { useState } from 'react'
import { Wand2, Loader2, Download, Eye } from 'lucide-react'
import { imageApi, TextToImageRequest } from '@/app/lib/api/image'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function ImagePage() {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [taskId, setTaskId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setImages([])
    setProgress(0)

    try {
      const request: TextToImageRequest = {
        prompt,
        negative_prompt: negativePrompt || undefined,
        width: 1024,
        height: 1024,
        steps: 30,
        cfg_scale: 7.5,
        num_images: 2,
      }

      const response = await imageApi.textToImage(request)
      setTaskId(response.task_id)

      // Poll for result
      const result = await imageApi.pollTask(response.task_id, (p) => {
        setProgress(p)
      })

      if (result.images) {
        setImages(result.images)
      }
    } catch (error) {
      console.error('Generation failed:', error)
      alert('生成失败，请稍后重试')
    } finally {
      setIsGenerating(false)
      setProgress(0)
    }
  }

  const handleDownload = (url: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `generated-image-${Date.now()}.png`
    link.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <Wand2 className="text-primary" />
          AI 生图
        </h1>
        <p className="text-muted-foreground mt-2">
          使用智能路由系统生成高质量图片
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <div className="p-6 bg-card rounded-lg border space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                提示词 *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述你想要生成的图片..."
                className="w-full min-h-[120px] px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isGenerating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                负面提示词（可选）
              </label>
              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="描述你不希望出现在图片中的内容..."
                className="w-full min-h-[80px] px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isGenerating}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  宽度
                </label>
                <select
                  className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isGenerating}
                  defaultValue="1024"
                >
                  <option value="512">512</option>
                  <option value="768">768</option>
                  <option value="1024">1024</option>
                  <option value="1280">1280</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  高度
                </label>
                <select
                  className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isGenerating}
                  defaultValue="1024"
                >
                  <option value="512">512</option>
                  <option value="768">768</option>
                  <option value="1024">1024</option>
                  <option value="1280">1280</option>
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
                  <Wand2 size={18} />
                  生成图片
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

            {isGenerating && !images.length ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner text="AI 正在创作中..." />
              </div>
            ) : images.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <img
                      src={image}
                      alt={`Generated ${index + 1}`}
                      className="w-full rounded-lg"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(image, '_blank')}
                        className="flex-1 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm flex items-center justify-center gap-1"
                      >
                        <Eye size={14} />
                        查看
                      </button>
                      <button
                        onClick={() => handleDownload(image)}
                        className="flex-1 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm flex items-center justify-center gap-1"
                      >
                        <Download size={14} />
                        下载
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                生成的图片将显示在这里
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
