'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface IntentOption {
  id: string
  label: string
  icon: string
  description: string
  href: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是 AI Creative Hub 的智能助手。我可以帮你：\n\n🎨 **AI 生图** - 文生图、图生图、ControlNet\n🎬 **AI 生视频** - 文/图生视频、风格转绘\n🔧 **提示词优化** - 针对不同模型优化\n🎥 **一键工作流** - 从故事到成片的六步流程\n🎵 **音乐生成** - 根据场景生成背景音乐\n🎤 **语音合成** - 语音克隆与旁白合成\n\n请告诉我你想做什么？',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showIntentPicker, setShowIntentPicker] = useState(false)

  const intentOptions: IntentOption[] = [
    {
      id: 'image',
      label: 'AI 生图',
      icon: '🎨',
      description: '生成高质量图片',
      href: '/image',
    },
    {
      id: 'video',
      label: 'AI 生视频',
      icon: '🎬',
      description: '生成创意视频',
      href: '/video',
    },
    {
      id: 'workflow',
      label: '一键工作流',
      icon: '🎥',
      description: '完整创作流程',
      href: '/workflow',
    },
    {
      id: 'prompt',
      label: '提示词优化',
      icon: '🔧',
      description: '优化提示词',
      href: '/prompt',
    },
  ]

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response (will be replaced with real API)
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '收到！让我帮你处理这个请求...',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)

      // Show intent picker if it's a general request
      setShowIntentPicker(true)
    }, 1000)
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                {message.content}
              </div>
              <div className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">思考中...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Intent Picker */}
      {showIntentPicker && (
        <div className="mb-4 p-4 bg-card rounded-lg border">
          <h3 className="text-sm font-medium mb-3">你想做什么？</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {intentOptions.map((option) => (
              <a
                key={option.id}
                href={option.href}
                className="flex flex-col items-center p-3 rounded-lg border hover:border-primary hover:bg-accent transition-colors"
              >
                <span className="text-2xl mb-1">{option.icon}</span>
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground mt-1">
                  {option.description}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="描述你的创意需求..."
          className="flex-1 rounded-md border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send size={18} />
          )}
          发送
        </button>
      </div>
    </div>
  )
}
