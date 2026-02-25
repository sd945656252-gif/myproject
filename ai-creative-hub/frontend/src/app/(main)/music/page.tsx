"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Mic2, Sparkles, MessageSquare } from "lucide-react";
import { ChatInterface } from "@/components/chat";
import { useChatStore } from "@/stores";

type MusicMode = "background" | "song";

const MODE_CONFIG = {
  background: {
    icon: Music,
    title: "背景音乐",
    description: "根据场景生成背景音乐",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    placeholder: "描述你想要的场景氛围，例如：宁静的夜晚、温暖的咖啡馆、激烈的战斗...",
  },
  song: {
    icon: Mic2,
    title: "歌词创作",
    description: "根据歌词生成完整歌曲",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    placeholder: "输入歌词或主题，AI 将为你创作完整的歌曲...",
  },
};

export default function MusicPage() {
  const [mode, setMode] = useState<MusicMode>("background");
  const { setCurrentModule } = useChatStore();

  // Set current module on mount
  useState(() => {
    setCurrentModule("music");
  });

  const currentMode = MODE_CONFIG[mode];

  return (
    <div className="flex h-full gap-6">
      {/* Left Panel - Mode Selection */}
      <div className="w-80 shrink-0 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">音乐生成</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              AI 音乐与音效创作
            </p>
          </div>
          <Badge variant="secondary">Module 5</Badge>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as MusicMode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="background">背景音乐</TabsTrigger>
            <TabsTrigger value="song">歌词创作</TabsTrigger>
          </TabsList>

          {(Object.keys(MODE_CONFIG) as MusicMode[]).map((key) => {
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
                      {key === "background" && "描述场景氛围，AI 将为你生成匹配的背景音乐。支持多种风格：古典、电子、爵士、氛围等。"}
                      {key === "song" && "输入歌词或主题描述，AI 将创作完整的歌曲，包括旋律、编曲和人声。"}
                    </p>
                  </CardContent>
                </Card>

                {key === "song" && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">风格选择</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">流行</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">摇滚</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">民谣</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">电子</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">古典</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">说唱</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
              <Badge variant="outline">Suno</Badge>
              <Badge variant="outline">Udio</Badge>
              <Badge variant="outline">更多即将上线</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>提示: 详细描述场景或情感可以获得更精准的音乐。</p>
                <p>歌曲创作支持指定风格、节奏、情感等参数。</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Chat Interface */}
      <div className="flex-1 rounded-lg border bg-card">
        <ChatInterface
          placeholder={currentMode.placeholder}
          module="music"
        />
      </div>
    </div>
  );
}
