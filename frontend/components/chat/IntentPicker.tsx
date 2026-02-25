'use client'

import { useState } from 'react'
import { Image, Video, Music, Mic, Wand2, Workflow as WorkflowIcon } from 'lucide-react'

interface IntentOption {
  id: string
  label: string
  icon: React.ElementType
  description: string
  href: string
  color: string
}

interface IntentPickerProps {
  onSelect?: (intent: string) => void
  className?: string
}

export default function IntentPicker({ onSelect, className = '' }: IntentPickerProps) {
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null)

  const intentOptions: IntentOption[] = [
    {
      id: 'image',
      label: 'AI 生图',
      icon: Image,
      description: '文生图、图生图、ControlNet',
      href: '/image',
      color: 'text-purple-500',
    },
    {
      id: 'video',
      label: 'AI 生视频',
      icon: Video,
      description: '文/图生视频、风格转绘',
      href: '/video',
      color: 'text-blue-500',
    },
    {
      id: 'workflow',
      label: '一键工作流',
      icon: WorkflowIcon,
      description: '从故事到成片的六步流程',
      href: '/workflow',
      color: 'text-green-500',
    },
    {
      id: 'prompt',
      label: '提示词优化',
      icon: Wand2,
      description: '针对不同模型优化',
      href: '/prompt',
      color: 'text-orange-500',
    },
    {
      id: 'audio',
      label: '音乐生成',
      icon: Music,
      description: '根据场景生成背景音乐',
      href: '/audio',
      color: 'text-pink-500',
    },
    {
      id: 'voice',
      label: '语音合成',
      icon: Mic,
      description: '语音克隆与旁白合成',
      href: '/voice',
      color: 'text-cyan-500',
    },
  ]

  const handleSelect = (intent: IntentOption) => {
    setSelectedIntent(intent.id)
    if (onSelect) {
      onSelect(intent.id)
    }
  }

  return (
    <div className={`p-6 bg-card rounded-lg border ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">选择功能</h3>
        <span className="text-sm text-muted-foreground">选择你想使用的功能</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {intentOptions.map((option) => {
          const Icon = option.icon
          const isSelected = selectedIntent === option.id

          return (
            <a
              key={option.id}
              href={option.href}
              onClick={() => handleSelect(option)}
              className={`group relative p-6 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-accent'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-background ${option.color}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{option.label}</h4>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 rounded-lg ring-2 ring-primary ring-opacity-0 group-hover:ring-opacity-10 transition-all duration-200" />
            </a>
          )
        })}
      </div>
    </div>
  )
}
