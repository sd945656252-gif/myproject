"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Sparkles, PenTool, Layers, Scissors, ImageIcon, Wand2 } from "lucide-react";
import { ChatInterface } from "@/components/chat";
import { useChatStore } from "@/stores";

type ImageMode = "text_to_image" | "image_to_image" | "controlnet" | "edit";

const MODE_CONFIG = {
  text_to_image: {
    icon: Sparkles,
    title: "文生图",
    description: "文字描述生成图像",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    placeholder: "描述你想要生成的图像，例如：一只可爱的橘猫在阳光下打盹...",
  },
  image_to_image: {
    icon: Image,
    title: "图生图",
    description: "参考图风格迁移",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    placeholder: "上传参考图片，描述你想要的风格变化...",
  },
  controlnet: {
    icon: Layers,
    title: "ControlNet",
    description: "姿态控制、多图融合",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    placeholder: "上传控制图，描述你想要的生成效果...",
  },
  edit: {
    icon: Scissors,
    title: "智能编辑",
    description: "抠图、换装、局部重绘",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    placeholder: "上传图片，描述你想要的编辑效果，例如：将背景替换为海边...",
  },
};

export default function ImagePage() {
  const [mode, setMode] = useState<ImageMode>("text_to_image");
  const { setCurrentModule } = useChatStore();

  // Set current module on mount
  useState(() => {
    setCurrentModule("image");
  });

  const currentMode = MODE_CONFIG[mode];
  const ModeIcon = currentMode.icon;

  return (
    <div className="flex h-full gap-6">
      {/* Left Panel - Mode Selection */}
      <div className="w-80 shrink-0 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">生图矩阵</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              多功能 AI 图像生成与编辑
            </p>
          </div>
          <Badge variant="secondary">Module 2</Badge>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as ImageMode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text_to_image">文生图</TabsTrigger>
            <TabsTrigger value="image_to_image">图生图</TabsTrigger>
            <TabsTrigger value="controlnet">ControlNet</TabsTrigger>
            <TabsTrigger value="edit">编辑</TabsTrigger>
          </TabsList>

          {(Object.keys(MODE_CONFIG) as ImageMode[]).map((key) => {
            const config = MODE_CONFIG[key];
            const Icon = config.icon;
            return (
              <TabsContent key={key} value={key} className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bgColor}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{config.title}</CardTitle>
                        <CardDescription>{config.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {key === "text_to_image" && "输入文字描述，AI 将为你生成精美的图像。支持多种风格和尺寸。"}
                      {key === "image_to_image" && "上传参考图片，描述风格变化，AI 将生成风格迁移后的图像。"}
                      {key === "controlnet" && "通过姿态图、深度图等控制生成结果，实现精确构图控制。"}
                      {key === "edit" && "上传图片后描述编辑需求，AI 将智能完成抠图、换装、局部重绘等操作。"}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Supported Models */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">支持模型</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">DALL-E 3</Badge>
              <Badge variant="outline">Midjourney</Badge>
              <Badge variant="outline">Stable Diffusion</Badge>
              <Badge variant="outline">即梦</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <ImageIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>提示: 图生图、ControlNet、编辑模式支持上传图片。</p>
                <p>建议使用详细的描述以获得更好的生成效果。</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Chat Interface */}
      <div className="flex-1 rounded-lg border bg-card">
        <ChatInterface
          placeholder={currentMode.placeholder}
          enableImageUpload={mode !== "text_to_image"}
          module="image"
        />
      </div>
    </div>
  );
}
