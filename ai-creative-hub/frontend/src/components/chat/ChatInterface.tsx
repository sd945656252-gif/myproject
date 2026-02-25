"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Sparkles, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useChatStore, useUserStore } from "@/stores";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { promptService } from "@/services/promptService";
import { imageService } from "@/services/imageService";
import { FileUpload, UploadedFile } from "@/components/ui/file-upload";
import { StreamingText } from "@/components/ui/streaming-text";

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
  const abortControllerRef = useRef<AbortController | null>(null);

  const { messages, addMessage, currentModule, isLoading: chatLoading, setIsLoading: setChatLoading } = useChatStore();
  const { user } = useUserStore();

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handlePromptGenerate = useCallback(async (userMessage: string, imageBase64?: string) => {
    abortControllerRef.current = new AbortController();

    // Determine request type
    const requestType = imageBase64 ? "image_to_prompt" : "optimize";

    try {
      setIsStreaming(true);
      setStreamingContent("");

      // Use streaming API
      for await (const chunk of promptService.stream(
        {
          type: requestType,
          prompt: userMessage,
          image: imageBase64,
          targetApi: currentModule || undefined,
          language: "zh",
        },
        abortControllerRef.current.signal
      )) {
        if (chunk.error) {
          throw new Error(chunk.error);
        }

        setStreamingContent((prev) => prev + chunk.content);

        if (chunk.done && chunk.metadata) {
          // Add the complete message
          addMessage({
            role: "assistant",
            content: streamingContent + chunk.content,
            metadata: {
              tags: chunk.metadata.tags,
              suggestions: chunk.metadata.suggestions,
              provider: chunk.metadata.notification?.includes("fallback") ? "fallback" : "primary",
            },
          });
          setStreamingContent("");
        }
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        // User cancelled
        addMessage({
          role: "system",
          content: "已取消生成",
        });
      } else {
        throw error;
      }
    } finally {
      setIsStreaming(false);
    }
  }, [currentModule, addMessage, streamingContent]);

  const handleImageGenerate = useCallback(async (userMessage: string) => {
    try {
      const response = await imageService.generate({
        prompt: userMessage,
        width: 1024,
        height: 1024,
      });

      if (response.success && response.data) {
        addMessage({
          role: "assistant",
          content: "图像生成完成",
          metadata: {
            images: response.data.images.map((img) => img.url),
            provider: response.data.images[0]?.model,
            model: response.data.images[0]?.model,
          },
        });
      } else {
        throw new Error(response.error || "生成失败");
      }
    } catch (error) {
      throw error;
    }
  }, [addMessage]);

  const handleSubmit = async () => {
    if ((!input.trim() && uploadedFiles.length === 0) || isLoading) return;

    const userMessage = input.trim();
    const imageBase64 = uploadedFiles[0]?.url; // For image_to_prompt

    // Add user message
    addMessage({
      role: "user",
      content: userMessage || "分析这张图片",
      metadata: imageBase64 ? { images: [imageBase64] } : undefined,
    });

    setInput("");
    setUploadedFiles([]);
    setIsLoading(true);
    setChatLoading(true);

    try {
      // Call the callback if provided
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
        default:
          // Default response for other modules
          addMessage({
            role: "assistant",
            content: `收到您的请求: "${userMessage}"。${module} 模块正在开发中...`,
            metadata: {
              provider: "system",
              model: "demo",
            },
          });
      }
    } catch (error) {
      addMessage({
        role: "system",
        content: `抱歉，处理您的请求时出现错误: ${(error as Error).message}`,
      });
    } finally {
      setIsLoading(false);
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCancelStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleFileUpload = async (files: File[]): Promise<UploadedFile[]> => {
    // Convert files to base64 for preview and API usage
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

  return (
    <div className="flex h-full flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">开始创作</h3>
            <p className="text-muted-foreground max-w-sm">
              输入你的创意想法，AI 将帮助你将其变为现实
            </p>
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

                {/* Display generated content */}
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
                        />
                      </div>
                    ))}
                  </div>
                )}

                {message.metadata?.video && (
                  <video
                    src={message.metadata.video}
                    controls
                    className="mt-2 rounded-lg max-h-64"
                  />
                )}

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
                    {message.metadata.model && (
                      <Badge variant="outline" className="text-xs">
                        {message.metadata.model}
                      </Badge>
                    )}
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
              {isStreaming && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelStream}
                  className="h-6 px-2"
                >
                  取消
                </Button>
              )}
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
          {enableImageUpload
            ? "支持上传图片进行图生文分析 | "
            : ""}
          按 Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </div>
  );
}
