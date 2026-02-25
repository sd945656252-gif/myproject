"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image, Sparkles, PenTool, Layers, Scissors } from "lucide-react";

export default function ImagePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">生图矩阵</h1>
          <p className="text-muted-foreground mt-1">
            多功能 AI 图像生成与编辑
          </p>
        </div>
        <Badge variant="secondary">Module 2</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <Sparkles className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base">文生图</CardTitle>
            <CardDescription>文字描述生成图像</CardDescription>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Image className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base">图生图</CardTitle>
            <CardDescription>参考图风格迁移</CardDescription>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <Layers className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base">ControlNet</CardTitle>
            <CardDescription>姿态控制、多图融合</CardDescription>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10">
              <Scissors className="h-5 w-5 text-pink-500" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base">智能编辑</CardTitle>
            <CardDescription>抠图、换装、局部重绘</CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>创作画布</CardTitle>
          <CardDescription>选择功能后在下方进行创作</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
            <PenTool className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              选择功能开始创作
            </p>
            <Button>开始生图</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
