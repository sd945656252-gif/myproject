"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, Copy, Volume2, Sparkles } from "lucide-react";

export default function VoicePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">语音合成</h1>
          <p className="text-muted-foreground mt-1">
            TTS 与语音克隆
          </p>
        </div>
        <Badge variant="secondary">Module 6</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Volume2 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle>文本转语音</CardTitle>
                <CardDescription>TTS 语音合成</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              输入文本，选择音色，快速生成自然流畅的语音。
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Copy className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardTitle>语音克隆</CardTitle>
                <CardDescription>复刻任意音色</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              上传音频样本，AI 将学习并克隆该音色。
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Mic className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <CardTitle>音色设计</CardTitle>
                <CardDescription>定制专属音色</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              调整音色参数，创造独一无二的合成语音。
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>支持模型</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Minimax TTS</Badge>
            <Badge variant="outline">Azure TTS</Badge>
            <Badge variant="outline">ElevenLabs</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Mic className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              输入文本开始语音合成
            </p>
            <Button>开始合成语音</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
