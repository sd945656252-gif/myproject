"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Sparkles, Image as ImageIcon, X, Settings, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useChatStore, useUserStore, useApiConfigStore } from "@/stores";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { FileUpload, UploadedFile } from "@/components/ui/file-upload";
import { StreamingText } from "@/components/ui/streaming-text";
import Link from "next/link";
import {
  generateImage,
  generateVideo,
  generateMusic,
  generateVoice,
  optimizePrompt,
  getActiveApiConfig,
} from "@/services/aiService";

interface ChatInterfaceProps {
  placeholder?: string;
  onSendMessage?: (message: string) => void;
  enableImageUpload?: boolean;
  module?: "prompt" | "image" | "video" | "music" | "voice" | "workflow";
}

export function ChatInterface({
  placeholder = "输入你的创意想法...",
  onSendMessage,
  enableImageUpload = false,
  module = "prompt",
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, addMessage, currentModule } = useChatStore();
  const { user } = useUserStore();
  const { providers, configs } = useApiConfigStore();

  // Check if API is configured
  const hasApiConfig = useCallback(() => {
    // workflow uses prompt category for API calls
    const apiCategory = module === "workflow" ? "prompt" : module;
    const { config } = getActiveApiConfig(apiCategory as "prompt" | "image" | "video" | "music" | "voice");
    return !!config;
  }, [module]);

  // Get active provider name
  const getActiveProviderName = useCallback(() => {
    // workflow uses prompt category for API calls
    const apiCategory = module === "workflow" ? "prompt" : module;
    const { provider } = getActiveApiConfig(apiCategory as "prompt" | "image" | "video" | "music" | "voice");
    return provider?.name || "Mock API (演示模式)";
  }, [module]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Handle prompt optimization
  const handlePromptGenerate = useCallback(async (userMessage: string, imageBase64?: string) => {
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const result = await optimizePrompt({
        prompt: userMessage,
        targetApi: currentModule || undefined,
        language: "zh",
      });

      if (result.success && result.data) {
        // Simulate streaming effect
        const prompt = result.data.prompt;
        const chunkSize = 15;

        for (let i = 0; i < prompt.length; i += chunkSize) {
          const chunk = prompt.slice(i, i + chunkSize);
          setStreamingContent((prev) => prev + chunk);
          await new Promise((resolve) => setTimeout(resolve, 30));
        }

        addMessage({
          role: "assistant",
          content: result.data.prompt,
          metadata: {
            tags: result.data.tags,
            suggestions: result.data.suggestions,
            provider: getActiveProviderName(),
          },
        });
        setStreamingContent("");
      } else {
        throw new Error(result.error || "生成失败");
      }
    } catch (error) {
      addMessage({
        role: "system",
        content: `生成失败: ${(error as Error).message}`,
      });
    } finally {
      setIsStreaming(false);
    }
  }, [currentModule, addMessage, getActiveProviderName]);

  // Handle image generation
  const handleImageGenerate = useCallback(async (userMessage: string) => {
    const result = await generateImage({
      prompt: userMessage,
      width: 1024,
      height: 1024,
    });

    if (result.success && result.data) {
      addMessage({
        role: "assistant",
        content: "图像生成完成",
        metadata: {
          images: result.data.images.map((img) => img.url),
          provider: getActiveProviderName(),
        },
      });
    } else {
      throw new Error(result.error || "图像生成失败");
    }
  }, [addMessage, getActiveProviderName]);

  // Handle video generation
  const handleVideoGenerate = useCallback(async (userMessage: string) => {
    const result = await generateVideo({
      prompt: userMessage,
      type: "text_to_video",
      duration: 5,
    });

    if (result.success && result.data) {
      addMessage({
        role: "assistant",
        content: "视频生成完成",
        metadata: {
          video: result.data.videoUrl,
          provider: getActiveProviderName(),
        },
      });
    } else {
      throw new Error(result.error || "视频生成失败");
    }
  }, [addMessage, getActiveProviderName]);

  // Handle music generation
  const handleMusicGenerate = useCallback(async (userMessage: string) => {
    const result = await generateMusic({
      prompt: userMessage,
      duration: 30,
      instrumental: true,
    });

    if (result.success && result.data) {
      addMessage({
        role: "assistant",
        content: "音乐生成完成",
        metadata: {
          audio: result.data.audioUrl,
          provider: getActiveProviderName(),
        },
      });
    } else {
      throw new Error(result.error || "音乐生成失败");
    }
  }, [addMessage, getActiveProviderName]);

  // Handle voice generation
  const handleVoiceGenerate = useCallback(async (userMessage: string) => {
    const result = await generateVoice({
      text: userMessage,
      speed: 1.0,
    });

    if (result.success && result.data) {
      addMessage({
        role: "assistant",
        content: "语音合成完成",
        metadata: {
          audio: result.data.audioUrl,
          provider: getActiveProviderName(),
        },
      });
    } else {
      throw new Error(result.error || "语音合成失败");
    }
  }, [addMessage, getActiveProviderName]);

  // Main submit handler
  const handleSubmit = async () => {
    if ((!input.trim() && uploadedFiles.length === 0) || isLoading) return;

    const userMessage = input.trim();
    const imageBase64 = uploadedFiles[0]?.url;

    // Add user message
    addMessage({
      role: "user",
      content: userMessage || "分析这张图片",
      metadata: imageBase64 ? { images: [imageBase64] } : undefined,
    });

    setInput("");
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      if (onSendMessage) {
        onSendMessage(userMessage);
      }

      // Route to appropriate service based on module
      switch (module) {
        case "prompt":
          await handlePromptGenerate(userMessage, imageBase64);
          break;
        case "image":
          await handleImageGenerate(userMessage);
          break;
        case "video":
          await handleVideoGenerate(userMessage);
          break;
        case "music":
          await handleMusicGenerate(userMessage);
          break;
        case "voice":
          await handleVoiceGenerate(userMessage);
          break;
        default:
          addMessage({
            role: "assistant",
            content: `收到您的请求: "${userMessage}"。${module} 模块正在开发中...`,
            metadata: { provider: "system" },
          });
      }
    } catch (error) {
      addMessage({
        role: "system",
        content: `处理失败: ${(error as Error).message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = async (files: File[]): Promise<UploadedFile[]> => {
    return Promise.all(
      files.map((file) => {
        return new Promise<UploadedFile>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              size: file.size,
              type: file.type,
              url: reader.result as string,
              preview: reader.result as string,
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );
  };

  const isConfigured = hasApiConfig();

  return (
    <div className="flex h-full flex-col">
      {/* API Status Banner */}
      {!isConfigured && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span className="text-sm text-amber-700 dark:text-amber-400">
            当前使用演示模式，配置 API 后可使用真实服务
          </span>
          <Link href="/settings">
            <Button variant="link" size="sm" className="text-amber-600 dark:text-amber-400 px-2">
              <Settings className="h-3 w-3 mr-1" />
              配置 API
            </Button>
          </Link>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">开始创作</h3>
            <p className="text-muted-foreground max-w-sm mb-4">
              输入你的创意想法，AI 将帮助你将其变为现实
            </p>
            {isConfigured && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                已连接: {getActiveProviderName()}
              </Badge>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : message.role === "system"
                    ? "bg-muted text-muted-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {/* Display generated images */}
                {message.metadata?.images && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {message.metadata.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square overflow-hidden rounded-lg"
                      >
                        <Image
                          src={img}
                          alt={`Generated image ${idx + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Display video */}
                {message.metadata?.video && (
                  <video
                    src={message.metadata.video}
                    controls
                    className="mt-2 rounded-lg max-h-64 w-full"
                  />
                )}

                {/* Display audio */}
                {message.metadata?.audio && (
                  <audio
                    src={message.metadata.audio}
                    controls
                    className="mt-2 w-full"
                  />
                )}

                {/* Tags */}
                {message.metadata?.tags && message.metadata.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {message.metadata.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">建议:</p>
                    {message.metadata.suggestions.map((suggestion, idx) => (
                      <p key={idx} className="text-xs text-muted-foreground">
                        - {suggestion}
                      </p>
                    ))}
                  </div>
                )}

                {/* Provider info */}
                {message.metadata?.provider && (
                  <div className="mt-2 flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {message.metadata.provider}
                    </Badge>
                  </div>
                )}
              </div>

              {message.role === "user" && user?.avatar && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                  <Image
                    src={user.avatar}
                    alt={user.name || "User"}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          ))
        )}

        {/* Streaming content */}
        {isStreaming && streamingContent && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="max-w-[80%] rounded-2xl bg-muted px-4 py-2.5">
              <StreamingText
                content={streamingContent}
                isStreaming={isStreaming}
                className="text-sm"
              />
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !isStreaming && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">生成中...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <Card>
          <CardContent className="p-3">
            {/* File upload preview */}
            {uploadedFiles.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="relative group inline-flex items-center gap-2 bg-secondary rounded-lg p-1 pr-2"
                  >
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    )}
                    <span className="text-xs truncate max-w-[100px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setUploadedFiles([])}
                      className="p-0.5 hover:bg-destructive/20 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              {/* Image upload button */}
              {enableImageUpload && (
                <FileUpload
                  accept="image/*"
                  multiple={false}
                  value={uploadedFiles}
                  onChange={setUploadedFiles}
                  onUpload={handleFileUpload}
                  variant="button"
                  className="flex-shrink-0"
                />
              )}

              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="min-h-[44px] max-h-[200px] resize-none border-0 focus-visible:ring-0 p-2"
                rows={1}
                disabled={isLoading}
              />
              <Button
                onClick={handleSubmit}
                disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
                size="icon"
                className="shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {enableImageUpload ? "支持上传图片进行图生文分析 | " : ""}
          按 Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </div>
  );
}
