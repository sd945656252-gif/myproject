import { useState } from 'react'
import { Download, Copy, Eye, X } from 'lucide-react'

interface Image {
  id: string
  url: string
  prompt: string
}

interface ImageGenerationResult {
  task_id: string
  status: string
  images?: Image[]
  routing?: {
    provider: string
    model: string
    fallback_used: boolean
    message?: string
  }
}

interface ChatMessageProps {
  message: {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    data?: ImageGenerationResult
    timestamp: Date
  }
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-2xl rounded-lg p-4 ${
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        {/* Content */}
        <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Images */}
        {message.data?.images && message.data.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {message.data.images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="rounded-lg w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                  <button
                    onClick={() => window.open(image.url, '_blank')}
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleCopy(image.prompt)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = image.url
                      link.download = `image-${image.id}.png`
                      link.click()
                    }}
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Routing Info */}
        {message.data?.routing && (
          <div className="mt-3 p-2 bg-background/50 rounded text-xs">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {message.data.routing.provider} ({message.data.routing.model})
              </span>
              {message.data.routing.fallback_used && (
                <span className="text-yellow-500">
                  {message.data.routing.message || '已切换备用提供商'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs mt-2 opacity-70">
          {message.timestamp.toLocaleTimeString()}
        </div>

        {/* Copy button */}
        {message.role === 'assistant' && !message.data?.images && (
          <button
            onClick={() => handleCopy(message.content)}
            className="mt-2 text-xs opacity-50 hover:opacity-100 transition-opacity"
          >
            {copied ? '已复制' : '复制'}
          </button>
        )}
      </div>
    </div>
  )
}
