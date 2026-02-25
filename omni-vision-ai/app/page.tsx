'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Image,
  Video,
  Wand2,
  ArrowRight,
  Zap,
  Palette,
  Film,
  Cpu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Sparkles,
    title: '提示词工程',
    description: '精准识别图片，反推生成高质量提示词，支持多 API 格式适配',
    href: '/prompt',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Image,
    title: '图像生成矩阵',
    description: '文生图、图生图、局部重绘、背景移除，多 API 智能路由',
    href: '/image',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Video,
    title: '视频生成矩阵',
    description: '文生视频、图生视频、风格转绘、角色一致性，对接全球顶尖模型',
    href: '/video',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Wand2,
    title: '一键视频工作流',
    description: '从一句话灵感到完整成片，6 步标准化流程自动推进',
    href: '/workflow',
    color: 'from-purple-500 to-pink-500',
  },
];

const highlights = [
  {
    icon: Cpu,
    title: '智能路由',
    description: '根据需求自动选择最优 API',
  },
  {
    icon: Palette,
    title: '多风格支持',
    description: '写实、动漫、电影感等多种风格',
  },
  {
    icon: Film,
    title: '全流程覆盖',
    description: '从创意到成片一站式服务',
  },
  {
    icon: Zap,
    title: '混合模式',
    description: '支持真实 API 和模拟演示',
  },
];

const supportedAPIs = [
  { name: '即梦', provider: '字节跳动' },
  { name: '可灵', provider: '快手' },
  { name: 'Vidu', provider: '生数科技' },
  { name: 'Midjourney', provider: 'Midjourney' },
  { name: 'Sora', provider: 'OpenAI' },
  { name: 'DALL-E 3', provider: 'OpenAI' },
  { name: 'Runway', provider: 'Runway' },
  { name: '豆包', provider: '字节跳动' },
];

export default function HomePage() {
  return (
    <div className="container py-8 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="gradient-text">Omni-Vision AI</span>
          </h1>
          <p className="text-2xl text-muted-foreground">
            全能视觉创作引擎
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          集成提示词工程、图像生成、视频生成、一键工作流的完整 AI 视觉创作解决方案。
          <br />
          支持多 API 智能路由，根据需求自动选择最优生成服务。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center gap-4"
        >
          <Button size="lg" asChild>
            <Link href="/workflow">
              开始创作 <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/settings">配置 API</Link>
          </Button>
        </motion.div>
      </section>

      {/* Highlights */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {highlights.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </section>

      {/* Features */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">四大核心功能</h2>
          <p className="text-muted-foreground">覆盖 AI 视觉创作全链路</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Link href={feature.href}>
                  <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer">
                    <CardHeader>
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${feature.color} text-white mb-4`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="group">
                        立即使用
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Supported APIs */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">支持的 API</h2>
          <p className="text-muted-foreground">智能路由，自动选择最优服务</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {supportedAPIs.map((api, index) => (
            <motion.div
              key={api.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.05 * index }}
            >
              <div className="px-4 py-2 rounded-full border bg-card hover:bg-accent transition-colors">
                <span className="font-medium">{api.name}</span>
                <span className="text-muted-foreground text-sm ml-2">({api.provider})</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold">准备好开始创作了吗？</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            从一键工作流开始，输入你的创意灵感，让 AI 为你完成从故事到成片的全流程创作。
          </p>
          <Button size="lg" asChild className="animate-pulse-glow">
            <Link href="/workflow">
              <Wand2 className="mr-2 h-5 w-5" />
              启动一键工作流
            </Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
