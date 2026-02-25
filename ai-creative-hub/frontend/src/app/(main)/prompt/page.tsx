"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ImageIcon, Wand2, MessageSquare } from "lucide-react";
import { ChatInterface } from "@/components/chat";
import { useWebSocket } from "@/hooks";
import { useChatStore } from "@/stores";

type PromptMode = "image_to_prompt" | "optimize";

export default function PromptPage() {
  const [mode, setMode] = useState<PromptMode>("optimize");
  const { status: wsStatus, generate, lastMessage } = useWebSocket();
  const { setCurrentModule } = useChatStore();

  // Set current module on mount
  useState(() => {
    setCurrentModule("prompt");
  });

  const handleSendMessage = useCallback(
    async (message: string) => {
      // WebSocket-based generation (for real-time updates)
      if (mode === "optimize") {
        generate("prompt_optimize", {
          prompt: message,
          language: "zh",
        });
      }
    },
    [mode, generate]
  );

  return (
    <div className="flex h-full gap-6">
      {/* Left Panel - Mode Selection */}
      <div className="w-80 shrink-0 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">提示词专家</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              图像反推、提示词优化
            </p>
          </div>
          <Badge variant="secondary">Module 1</Badge>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as PromptMode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="optimize">优化</TabsTrigger>
            <TabsTrigger value="image_to_prompt">反推</TabsTrigger>
          </TabsList>

          <TabsContent value="optimize" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <Wand2 className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">提示词优化</CardTitle>
                    <CardDescription>优化提示词适配不同 API</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  将简单描述针对 Midjourney、即梦、Sora 等 API 优化，
                  加入专业摄影/分镜术语。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">目标 API</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    通用
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    Midjourney
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    即梦
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    Sora
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="image_to_prompt" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <ImageIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">图像反推</CardTitle>
                    <CardDescription>上传图片，AI 反推提示词</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  支持视觉模型反推，生成详细的主体、光影、构图描述。
                  在聊天区域上传图片即可开始分析。
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Connection Status */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div
            className={`h-2 w-2 rounded-full ${
              wsStatus === "connected"
                ? "bg-green-500"
                : wsStatus === "connecting"
                ? "bg-yellow-500 animate-pulse"
                : "bg-red-500"
            }`}
          />
          <span>
            {wsStatus === "connected"
              ? "WebSocket 已连接"
              : wsStatus === "connecting"
              ? "连接中..."
              : "未连接"}
          </span>
        </div>

        {/* Tips */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>提示: 切换到「反推」模式后，可以在聊天区域上传图片进行分析。</p>
                <p>支持的图片格式: JPG, PNG, WebP</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Chat Interface */}
      <div className="flex-1 rounded-lg border bg-card">
        <ChatInterface
          placeholder={
            mode === "optimize"
              ? "输入简单的描述，AI 将优化为专业提示词..."
              : "上传图片后，AI 将分析并生成提示词..."
          }
          onSendMessage={handleSendMessage}
          enableImageUpload={mode === "image_to_prompt"}
          module="prompt"
        />
      </div>
    </div>
  );
}
