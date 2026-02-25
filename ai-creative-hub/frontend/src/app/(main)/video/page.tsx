"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Film, Sparkles, ZoomIn } from "lucide-react";

export default function VideoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">生视频矩阵</h1>
          <p className="text-muted-foreground mt-1">
            AI 视频生成与增强
          </p>
        </div>
        <Badge variant="secondary">Module 3</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <Video className="h-5 w-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base">文生视频</CardTitle>
            <CardDescription>文字描述生成视频</CardDescription>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Film className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base">图生视频</CardTitle>
            <CardDescription>图片转换为动态视频</CardDescription>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Sparkles className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base">风格转绘</CardTitle>
            <CardDescription>Vid2Vid 风格迁移</CardDescription>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
              <ZoomIn className="h-5 w-5 text-cyan-500" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base">高级增强</CardTitle>
            <CardDescription>超分、插帧、角色一致</CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>支持模型</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">即梦 Seedance 2.0</Badge>
            <Badge variant="outline">可灵 3.0/o1</Badge>
            <Badge variant="outline">Vidu</Badge>
            <Badge variant="outline">Sora</Badge>
            <Badge variant="outline">Veo</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Video className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              选择功能开始视频创作
            </p>
            <Button>开始生成视频</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
