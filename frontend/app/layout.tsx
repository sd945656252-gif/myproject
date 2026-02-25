import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'latin-ext'] })

export const metadata: Metadata = {
  title: 'AI Creative Hub - 全能 AI 创作工作站',
  description: '商业级 AI 创作、生图、生视频、音乐生成一站式平台',
  keywords: 'AI创作, 图像生成, 视频生成, 音乐生成, 提示词优化, 工作流',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
