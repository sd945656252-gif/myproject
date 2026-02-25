"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Film, Sparkles, ZoomIn, ImageIcon } from "lucide-react";
import { ChatInterface } from "@/components/chat";
import { useChatStore } from "@/stores";

type VideoMode = "text_to_video" | "image_to_video" | "style_transfer" | "enhance";

const MODE_CONFIG = {
  text_to_video: {
    icon: Video,
    title: "文生视频",
    description: "文字描述生成视频",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    placeholder: "描述你想要生成的视频内容，例如：一只蝴蝶在花丛中翩翩起舞...",
  },
  image_to_video: {
    icon: Film,
    title: "图生视频",
    description: "图片转换为动态视频",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    placeholder: "上传图片，描述想要的动态效果，例如：让画面中的云朵缓缓飘动...",
  },
  style_transfer: {
    icon: Sparkles,
    title: "风格转绘",
    description: "Vid2Vid 风格迁移",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    placeholder: "上传视频或描述风格，AI 将进行风格转换...",
  },
  enhance: {
    icon: ZoomIn,
    title: "高级增强",
    description: "超分、插帧、角色一致",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    placeholder: "上传视频，选择增强选项：超分辨率、插帧、角色一致性...",
  },
};

export default function VideoPage() {
  const [mode, setMode] = useState<VideoMode>("text_to_video");
  const { setCurrentModule } = useChatStore();

  // Set current module on mount
  useState(() => {
    setCurrentModule("video");
  });

  const currentMode = MODE_CONFIG[mode];

  return (
    <div className="flex h-full gap-6">
      {/* Left Panel - Mode Selection */}
      <div className="w-80 shrink-0 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">生视频矩阵</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              AI 视频生成与增强
            </p>
          </div>
          <Badge variant="secondary">Module 3</Badge>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as VideoMode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text_to_video">文生视频</TabsTrigger>
            <TabsTrigger value="image_to_video">图生视频</TabsTrigger>
            <TabsTrigger value="style_transfer">风格转绘</TabsTrigger>
            <TabsTrigger value="enhance">增强</TabsTrigger>
          </TabsList>

          {(Object.keys(MODE_CONFIG) as VideoMode[]).map((key) => {
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
                      {key === "text_to_video" && "输入文字描述，AI 将为你生成精彩的视频内容。支持不同时长和分辨率。"}
                      {key === "image_to_video" && "上传静态图片，AI 将为其添加动态效果，生成生动的视频。"}
                      {key === "style_transfer" && "将视频转换为不同艺术风格，支持动漫、油画、水彩等多种风格。"}
                      {key === "enhance" && "提升视频质量：超分辨率增强、帧率插值、保持角色一致性。"}
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
              <Badge variant="outline">即梦 Seedance 2.0</Badge>
              <Badge variant="outline">可灵 3.0</Badge>
              <Badge variant="outline">Vidu</Badge>
              <Badge variant="outline">Sora</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <ImageIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>提示: 图生视频和增强功能支持上传图片或视频。</p>
                <p>视频生成时间较长，请耐心等待。</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Chat Interface */}
      <div className="flex-1 rounded-lg border bg-card">
        <ChatInterface
          placeholder={currentMode.placeholder}
          enableImageUpload={mode !== "text_to_video"}
          module="video"
        />
      </div>
    </div>
  );
}
