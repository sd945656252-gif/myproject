'use client'

import { useState } from 'react'
import { X, ZoomIn, Download, Share2 } from 'lucide-react'

interface ImageViewerProps {
  images: Array<{
    id: string
    url: string
    prompt?: string
  }>
  initialIndex?: number
  onClose?: () => void
}

export default function ImageViewer({
  images,
  initialIndex = 0,
  onClose,
}: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [showPrompt, setShowPrompt] = useState(false)

  if (!images || images.length === 0) {
    return null
  }

  const currentImage = images[currentIndex]

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = currentImage.url
    link.download = `image-${currentImage.id}.png`
    link.click()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI 生成的图片',
          url: currentImage.url,
        })
      } catch (err) {
        console.error('分享失败:', err)
      }
    } else {
      navigator.clipboard.writeText(currentImage.url)
      alert('链接已复制到剪贴板')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
      >
        <X size={24} />
      </button>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            ←
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            →
          </button>
        </>
      )}

      {/* Image */}
      <div className="flex items-center justify-center h-full p-4">
        <img
          src={currentImage.url}
          alt={currentImage.prompt || `Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>

      {/* Info bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">
              {currentIndex + 1} / {images.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPrompt(!showPrompt)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                title="查看提示词"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                title="下载"
              >
                <Download size={16} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                title="分享"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {showPrompt && currentImage.prompt && (
            <div className="bg-white/10 rounded-lg p-3 text-white text-sm">
              <p>{currentImage.prompt}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
