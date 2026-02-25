'use client'

import { useState } from 'react'
import { Wand2, Loader2, Check, ArrowRight } from 'lucide-react'
import { workflowApi, StoryInput } from '@/app/lib/api/workflow'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function PromptPage() {
  const [input, setInput] = useState('')
  const [optimizedPrompt, setOptimizedPrompt] = useState('')
  const [targetStyle, setTargetStyle] = useState('midjourney')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleOptimize = async () => {
    if (!input.trim()) return

    setIsProcessing(true)

    // Simulate optimization (will be replaced with real API call)
    setTimeout(() => {
      const optimized = `[${targetStyle}] ${input}\n\nAdditional keywords: cinematic, detailed, high quality, 8k, professional lighting`
      setOptimizedPrompt(optimized)
      setIsProcessing(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <Wand2 className="text-primary" />
          提示词专家
        </h1>
        <p className="text-muted-foreground mt-2">
          优化提示词以获得更好的 AI 生成效果
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div className="p-6 bg-card rounded-lg border space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                原始提示词 *
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入你的提示词..."
                className="w-full min-h-[200px] px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isProcessing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                目标模型
              </label>
              <select
                value={targetStyle}
                onChange={(e) => setTargetStyle(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isProcessing}
              >
                <option value="midjourney">Midjourney</option>
                <option value="stable_diffusion">Stable Diffusion</option>
                <option value="dall_e">DALL-E 3</option>
                <option value="sora">Sora</option>
              </select>
            </div>

            <button
              onClick={handleOptimize}
              disabled={isProcessing || !input.trim()}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  优化中...
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  优化提示词
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-4">
          <div className="p-6 bg-card rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">优化结果</h3>
              {optimizedPrompt && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check size={16} />
                  已优化
                </div>
              )}
            </div>

            {isProcessing ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner text="AI 正在优化..." />
              </div>
            ) : optimizedPrompt ? (
              <div className="space-y-4">
                <textarea
                  value={optimizedPrompt}
                  readOnly
                  className="w-full min-h-[200px] px-4 py-3 rounded-md border border-input bg-background focus:outline-none"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(optimizedPrompt)}
                  className="w-full px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md flex items-center justify-center gap-2"
                >
                  复制优化后的提示词
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                优化后的提示词将显示在这里
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="p-6 bg-card rounded-lg border">
            <h4 className="font-semibold mb-3">优化技巧</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 使用具体、详细的描述</li>
              <li>• 包含光照、构图等专业术语</li>
              <li>• 添加风格和情绪关键词</li>
              <li>• 指定质量和分辨率</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
