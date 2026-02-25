'use client'

import { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: number
  text?: string
  className?: string
}

export default function LoadingSpinner({
  size = 24,
  text,
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 size={size} className="animate-spin text-primary" />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

// Full page loading
export function FullPageLoader({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

// Inline loading
export function InlineLoader({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner text={text} />
    </div>
  )
}
