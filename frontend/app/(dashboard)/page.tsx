'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import ChatInterface from '@/components/chat/ChatInterface'

export default function HomePage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '你好！我是 AI Creative Hub 的智能助手。我可以帮你：\n\n🎨 **AI 生图** - 文生图、图生图、ControlNet 姿态控制\n🎬 **AI 生视频** - 文/图生视频、风格转绘、角色一致性\n🔧 **提示词优化** - 反推提示词、针对不同模型优化\n🎥 **一键工作流** - 从故事到成片的六步完整流程\n🎵 **音乐生成** - 根据场景生成背景音乐\n🎤 **语音合成** - 语音克隆与旁白合成\n\n请告诉我你想做什么？'
    }
  ])

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <Sparkles className="text-primary" />
          欢迎使用 AI Creative Hub
        </h1>
        <p className="text-muted-foreground mt-2">
          全能 AI 创作工作站 - 从创意到成片的一站式解决方案
        </p>
      </div>

      {/* Chat Interface */}
      <ChatInterface />
    </div>
  )
}
