'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  MessageSquare,
  Wand2,
  Image,
  Video,
  Workflow,
  Music,
  Mic,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react'

const sidebarItems = [
  { id: 'chat', label: '智能对话', icon: MessageSquare, href: '/' },
  { id: 'prompt', label: '提示词专家', icon: Wand2, href: '/prompt' },
  { id: 'image', label: 'AI 生图', icon: Image, href: '/image' },
  { id: 'video', label: 'AI 生视频', icon: Video, href: '/video' },
  { id: 'workflow', label: '一键工作流', icon: Workflow, href: '/workflow' },
  { id: 'audio', label: '音乐生成', icon: Music, href: '/audio' },
  { id: 'voice', label: '语音合成', icon: Mic, href: '/voice' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, toggleSidebar, theme, setTheme, setCurrentModule } = useAppStore()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useState(() => setMounted(true))

  if (!mounted) return null

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-card border-r transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <h1 className="text-xl font-bold text-primary">AI Creative Hub</h1>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 hover:bg-accent rounded-md"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => setCurrentModule(item.id as any)}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              {theme === 'light' ? '深色模式' : '浅色模式'}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 lg:hidden p-2 bg-primary text-primary-foreground rounded-md shadow-lg"
      >
        <Menu size={20} />
      </button>
    </>
  )
}
