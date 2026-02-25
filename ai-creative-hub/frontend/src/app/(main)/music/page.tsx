"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music, Mic2, Sparkles } from "lucide-react";

export default function MusicPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">音乐生成</h1>
          <p className="text-muted-foreground mt-1">
            AI 音乐与音效创作
          </p>
        </div>
        <Badge variant="secondary">Module 5</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10">
                <Music className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <CardTitle>背景音乐</CardTitle>
                <CardDescription>根据场景生成背景音乐</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              描述你想要的场景氛围，AI 将为你生成匹配的背景音乐。
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                <Mic2 className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <CardTitle>歌词创作</CardTitle>
                <CardDescription>根据歌词生成完整歌曲</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              输入你的歌词，选择风格，AI 将生成完整的歌曲作品。
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
            <Badge variant="outline">Suno</Badge>
            <Badge variant="outline">Udio</Badge>
            <Badge variant="outline">更多模型即将上线</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Sparkles className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              描述你想要的音乐风格
            </p>
            <Button>开始创作音乐</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
