"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Key,
  Image,
  Video,
  Music,
  Mic,
  Sparkles,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { useApiConfigStore, ApiProvider, ApiConfig } from "@/stores/useApiConfigStore";
import { toast } from "sonner";

const categoryIcons = {
  image: Image,
  video: Video,
  music: Music,
  voice: Mic,
  prompt: Sparkles,
};

const categoryNames = {
  image: "图像生成",
  video: "视频生成",
  music: "音乐生成",
  voice: "语音合成",
  prompt: "提示词优化",
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"image" | "video" | "music" | "voice" | "prompt">("image");
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  const { configs, providers, addConfig, updateConfig, deleteConfig, setActiveProvider } = useApiConfigStore();

  const getProviderConfigs = (providerId: string) => {
    return configs.filter((c) => c.providerId === providerId);
  };

  const handleToggleProvider = (provider: ApiProvider) => {
    setActiveProvider(activeTab, provider.id);
    toast.success(`已切换到 ${provider.name}`);
  };

  const handleSaveConfig = (providerId: string, apiKey: string, apiSecret?: string, baseUrl?: string) => {
    const existingConfig = configs.find((c) => c.providerId === providerId);
    const provider = providers.find((p) => p.id === providerId);

    if (existingConfig) {
      updateConfig(existingConfig.id, { apiKey, apiSecret, baseUrl, isActive: true });
      toast.success("配置已更新");
    } else {
      addConfig({
        providerId,
        providerName: provider?.name || "",
        apiKey,
        apiSecret,
        baseUrl,
        isActive: true,
      });
      toast.success("配置已保存");
    }

    // Activate the provider after saving config
    if (provider) {
      setActiveProvider(provider.category, providerId);
    }

    setEditingConfig(null);
  };

  const handleDeleteConfig = (configId: string) => {
    deleteConfig(configId);
    toast.success("配置已删除");
  };

  const renderProviderCard = (provider: ApiProvider) => {
    const providerConfigs = getProviderConfigs(provider.id);
    const currentConfig = providerConfigs[0];
    const isEditing = editingConfig === provider.id;
    const isShowKey = showApiKey[provider.id];

    return (
      <Card key={provider.id} className={`relative ${provider.isActive ? "ring-2 ring-primary" : ""}`}>
        {provider.isActive && (
          <div className="absolute -top-2 -right-2">
            <Badge className="bg-green-500 hover:bg-green-600">
              <Check className="h-3 w-3 mr-1" />
              已启用
            </Badge>
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">{provider.name}</CardTitle>
              <CardDescription className="text-sm mt-1">{provider.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 可用模型 */}
          <div>
            <Label className="text-xs text-muted-foreground">可用模型</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {provider.models.map((model) => (
                <Badge key={model.id} variant="outline" className="text-xs">
                  {model.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* API 配置 */}
          {isEditing ? (
            <ConfigForm
              provider={provider}
              initialConfig={currentConfig}
              onSave={(apiKey, apiSecret, baseUrl) => handleSaveConfig(provider.id, apiKey, apiSecret, baseUrl)}
              onCancel={() => setEditingConfig(null)}
              showApiKey={isShowKey}
              onToggleShowKey={() => setShowApiKey((prev) => ({ ...prev, [provider.id]: !prev[provider.id] }))}
            />
          ) : (
            <div className="space-y-2">
              {currentConfig ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">API Key:</span>
                    <span className="font-mono">
                      {isShowKey ? currentConfig.apiKey : "••••••••" + currentConfig.apiKey.slice(-4)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setShowApiKey((prev) => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                    >
                      {isShowKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                  {currentConfig.baseUrl && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Base URL:</span>
                      <span className="font-mono text-xs truncate max-w-[200px]">{currentConfig.baseUrl}</span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => setEditingConfig(provider.id)}>
                      <Edit className="h-3 w-3 mr-1" />
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteConfig(currentConfig.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      删除
                    </Button>
                    {!provider.isActive && (
                      <Button size="sm" onClick={() => handleToggleProvider(provider)}>
                        启用
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <Button size="sm" className="w-full" onClick={() => setEditingConfig(provider.id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加配置
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const currentProviders = providers.filter((p) => p.category === activeTab);
  const CategoryIcon = categoryIcons[activeTab];

  return (
    <div className="flex h-full">
      {/* 左侧边栏 */}
      <div className="w-64 shrink-0 border-r bg-muted/30 p-4">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-5 w-5" />
          <h1 className="text-xl font-bold">API 设置</h1>
        </div>

        <nav className="space-y-1">
          {(Object.keys(categoryNames) as Array<keyof typeof categoryNames>).map((category) => {
            const Icon = categoryIcons[category];
            const isActive = activeTab === category;
            const hasConfig = providers.some((p) => p.category === category && p.isActive);

            return (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{categoryNames[category]}</span>
                {hasConfig && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-green-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* 帮助信息 */}
        <div className="mt-8 p-3 rounded-lg bg-muted text-xs text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">配置说明</p>
          <p>1. 选择需要配置的服务类别</p>
          <p>2. 点击"添加配置"输入 API Key</p>
          <p>3. 点击"启用"激活该服务</p>
          <p className="pt-2 border-t">
            API Key 仅存储在本地浏览器中，不会上传到服务器。
          </p>
        </div>
      </div>

      {/* 右侧内容区 */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CategoryIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{categoryNames[activeTab]}</h2>
                <p className="text-sm text-muted-foreground">
                  配置 {categoryNames[activeTab]} 服务的 API 接口
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {currentProviders.map(renderProviderCard)}
          </div>

          {currentProviders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无可用的服务提供商</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 配置表单组件
function ConfigForm({
  provider,
  initialConfig,
  onSave,
  onCancel,
  showApiKey,
  onToggleShowKey,
}: {
  provider: ApiProvider;
  initialConfig?: ApiConfig;
  onSave: (apiKey: string, apiSecret?: string, baseUrl?: string) => void;
  onCancel: () => void;
  showApiKey: boolean;
  onToggleShowKey: () => void;
}) {
  const [apiKey, setApiKey] = useState(initialConfig?.apiKey || "");
  const [apiSecret, setApiSecret] = useState(initialConfig?.apiSecret || "");
  const [customBaseUrl, setCustomBaseUrl] = useState(initialConfig?.baseUrl || provider.baseUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error("请输入 API Key");
      return;
    }
    onSave(apiKey.trim(), apiSecret.trim() || undefined, customBaseUrl.trim() || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="apiKey" className="text-xs">API Key *</Label>
        <div className="relative mt-1">
          <Input
            id="apiKey"
            type={showApiKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={onToggleShowKey}
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {provider.category === "voice" && (
        <div>
          <Label htmlFor="apiSecret" className="text-xs">API Secret (可选)</Label>
          <Input
            id="apiSecret"
            type="password"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            placeholder="可选"
            className="mt-1"
          />
        </div>
      )}

      <div>
        <Label htmlFor="baseUrl" className="text-xs">Base URL</Label>
        <Input
          id="baseUrl"
          type="url"
          value={customBaseUrl}
          onChange={(e) => setCustomBaseUrl(e.target.value)}
          placeholder={provider.baseUrl}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          默认: {provider.baseUrl}
        </p>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" size="sm">
          <Check className="h-3 w-3 mr-1" />
          保存
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          <X className="h-3 w-3 mr-1" />
          取消
        </Button>
      </div>
    </form>
  );
}
