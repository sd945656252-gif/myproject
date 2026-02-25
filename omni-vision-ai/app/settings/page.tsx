'use client';

import { useState } from 'react';
import { Settings2, Key, Globe, Palette, Save, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useConfigStore } from '@/lib/store/config';
import { API_PROVIDERS } from '@/lib/api/config';

export default function SettingsPage() {
  const {
    apiConfig,
    preferences,
    setAPIKey,
    toggleAPI,
    setPreferences,
    resetConfig,
    hasAnyAPIKey,
  } = useConfigStore();

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 保存配置
  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // API 配置列表
  const apiList = [
    { key: 'jimeng' as const, name: '即梦', provider: '字节跳动' },
    { key: 'kling' as const, name: '可灵', provider: '快手' },
    { key: 'vidu' as const, name: 'Vidu', provider: '生数科技' },
    { key: 'openai' as const, name: 'OpenAI', provider: 'OpenAI' },
    { key: 'midjourney' as const, name: 'Midjourney', provider: 'Midjourney' },
    { key: 'doubao' as const, name: '豆包', provider: '字节跳动' },
    { key: 'runway' as const, name: 'Runway', provider: 'Runway' },
    { key: 'sora' as const, name: 'Sora', provider: 'OpenAI' },
  ];

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">设置</h1>
        <p className="text-muted-foreground">
          配置 API Key、用户偏好和系统设置
        </p>
      </div>

      {/* Status */}
      {!hasAnyAPIKey() && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">未检测到 API Key</p>
              <p className="text-amber-700">
                当前运行在模拟模式。配置 API Key 后可使用真实服务。
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="api">
        <TabsList>
          <TabsTrigger value="api">
            <Key className="h-4 w-4 mr-2" />
            API 配置
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Palette className="h-4 w-4 mr-2" />
            偏好设置
          </TabsTrigger>
          <TabsTrigger value="about">
            <Globe className="h-4 w-4 mr-2" />
            关于
          </TabsTrigger>
        </TabsList>

        {/* API Configuration */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Key 配置</CardTitle>
              <CardDescription>
                配置各平台 API Key 以使用真实服务。所有密钥仅保存在本地浏览器中。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {apiList.map((api) => (
                <div key={api.key} className="flex items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`${api.key}-key`}>{api.name}</Label>
                      <span className="text-xs text-muted-foreground">
                        ({api.provider})
                      </span>
                    </div>
                    <Input
                      id={`${api.key}-key`}
                      type="password"
                      placeholder={`输入 ${api.name} API Key`}
                      value={apiConfig[api.key].apiKey || ''}
                      onChange={(e) => setAPIKey(api.key, e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`${api.key}-enabled`} className="text-sm">
                      启用
                    </Label>
                    <Switch
                      id={`${api.key}-enabled`}
                      checked={apiConfig[api.key].enabled}
                      onCheckedChange={() => toggleAPI(api.key)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Default API Selection */}
          <Card>
            <CardHeader>
              <CardTitle>默认 API 选择</CardTitle>
              <CardDescription>
                设置自动模式下优先使用的 API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>默认图像生成 API</Label>
                <Select
                  value={preferences.defaultImageAPI}
                  onValueChange={(v) =>
                    setPreferences({ defaultImageAPI: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">自动选择</SelectItem>
                    <SelectItem value="jimeng">即梦</SelectItem>
                    <SelectItem value="kling">可灵</SelectItem>
                    <SelectItem value="midjourney">Midjourney</SelectItem>
                    <SelectItem value="dalle">DALL-E 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>默认视频生成 API</Label>
                <Select
                  value={preferences.defaultVideoAPI}
                  onValueChange={(v) =>
                    setPreferences({ defaultVideoAPI: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">自动选择</SelectItem>
                    <SelectItem value="jimeng">即梦 Seedance</SelectItem>
                    <SelectItem value="kling">可灵 3.0</SelectItem>
                    <SelectItem value="vidu">Vidu</SelectItem>
                    <SelectItem value="sora">Sora</SelectItem>
                    <SelectItem value="runway">Runway</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>用户偏好</CardTitle>
              <CardDescription>
                自定义应用的外观和行为
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>界面语言</Label>
                <Select
                  value={preferences.language}
                  onValueChange={(v) =>
                    setPreferences({ language: v as 'zh' | 'en' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh">简体中文</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>主题</Label>
                <Select
                  value={preferences.theme}
                  onValueChange={(v) =>
                    setPreferences({ theme: v as 'light' | 'dark' | 'system' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">浅色</SelectItem>
                    <SelectItem value="dark">深色</SelectItem>
                    <SelectItem value="system">跟随系统</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>关于 Omni-Vision AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Omni-Vision AI 是一个全能视觉创作引擎，集成提示词工程、图像生成、视频生成、一键工作流四大核心功能。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded bg-muted">
                  <div className="text-muted-foreground">版本</div>
                  <div className="font-medium">v1.0.0</div>
                </div>
                <div className="p-3 rounded bg-muted">
                  <div className="text-muted-foreground">框架</div>
                  <div className="font-medium">Next.js 14</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">支持的平台</h4>
                <div className="flex flex-wrap gap-2">
                  {apiList.map((api) => (
                    <span
                      key={api.key}
                      className="px-3 py-1 rounded-full bg-muted text-sm"
                    >
                      {api.name}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={resetConfig}>
          重置配置
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saved ? '已保存' : '保存配置'}
        </Button>
      </div>
    </div>
  );
}
