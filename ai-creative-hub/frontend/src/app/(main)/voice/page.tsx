"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Copy, Volume2, MessageSquare } from "lucide-react";
import { ChatInterface } from "@/components/chat";
import { useChatStore } from "@/stores";

type VoiceMode = "tts" | "clone" | "design";

const MODE_CONFIG = {
  tts: {
    icon: Volume2,
    title: "文本转语音",
    description: "TTS 语音合成",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    placeholder: "输入要转换的文本，AI 将为你生成自然流畅的语音...",
  },
  clone: {
    icon: Copy,
    title: "语音克隆",
    description: "复刻任意音色",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    placeholder: "上传音频样本，AI 将学习并克隆该音色...",
  },
  design: {
    icon: Mic,
    title: "音色设计",
    description: "定制专属音色",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    placeholder: "描述你想要的音色特征，AI 将为你创建专属音色...",
  },
};

export default function VoicePage() {
  const [mode, setMode] = useState<VoiceMode>("tts");
  const { setCurrentModule } = useChatStore();

  // Set current module on mount
  useState(() => {
    setCurrentModule("voice");
  });

  const currentMode = MODE_CONFIG[mode];

  return (
    <div className="flex h-full gap-6">
      {/* Left Panel - Mode Selection */}
      <div className="w-80 shrink-0 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">语音合成</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              TTS 与语音克隆
            </p>
          </div>
          <Badge variant="secondary">Module 6</Badge>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as VoiceMode)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tts">TTS</TabsTrigger>
            <TabsTrigger value="clone">克隆</TabsTrigger>
            <TabsTrigger value="design">设计</TabsTrigger>
          </TabsList>

          {(Object.keys(MODE_CONFIG) as VoiceMode[]).map((key) => {
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
                      {key === "tts" && "输入文本，选择音色，快速生成自然流畅的语音。支持多种语言和情感表达。"}
                      {key === "clone" && "上传音频样本，AI 将学习并克隆该音色。支持短音频快速克隆和高质量长音频克隆。"}
                      {key === "design" && "调整音色参数，创造独一无二的合成语音。支持音调、语速、情感等精细调整。"}
                    </p>
                  </CardContent>
                </Card>

                {key === "tts" && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">预设音色</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">温柔女声</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">磁性男声</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">活泼少女</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">沉稳旁白</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">儿童声音</Badge>
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
              <Badge variant="outline">Minimax TTS</Badge>
              <Badge variant="outline">Azure TTS</Badge>
              <Badge variant="outline">ElevenLabs</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>提示: 语音克隆功能支持上传音频样本进行分析。</p>
                <p>TTS 支持多语言，包括中文、英文、日文等。</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Chat Interface */}
      <div className="flex-1 rounded-lg border bg-card">
        <ChatInterface
          placeholder={currentMode.placeholder}
          module="voice"
        />
      </div>
    </div>
  );
}
