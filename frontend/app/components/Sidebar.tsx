'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/app/lib/store'
import { cn } from '@/app/lib/utils'
import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Image,
  Video,
  Music,
  Mic,
  Clock,
  Zap,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react'

const sidebarItems = [
  { id: 'dashboard', label: '仪表板', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'chat', label: '智能对话', icon: MessageSquare, href: '/dashboard/chat' },
  { id: 'prompt', label: '提示词专家', icon: Sparkles, href: '/dashboard/prompt-expert' },
  { id: 'image', label: '图像生成', icon: Image, href: '/dashboard/ai-generation' },
  { id: 'video', label: '视频生成', icon: Video, href: '/dashboard/video-generation' },
  { id: 'audio', label: '音频生成', icon: Music, href: '/dashboard/audio-generation' },
  { id: 'history', label: '历史记录', icon: Clock, href: '/dashboard/history' },
  { id: 'workflow', label: '工作流', icon: Zap, href: '/dashboard/workflows' },
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
          'fixed left-0 top-0 z-50 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Zap className="text-white" size={18} />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Hub</h1>
            </Link>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => setCurrentModule(item.id as any)}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
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
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
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
        className="fixed left-4 top-4 z-50 lg:hidden p-2 bg-purple-600 text-white rounded-md shadow-lg"
      >
        <Menu size={20} />
      </button>
    </>
  )
}
