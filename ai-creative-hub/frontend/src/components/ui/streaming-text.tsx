"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface StreamingTextProps {
  content: string;
  isStreaming: boolean;
  className?: string;
  speed?: number; // ms per character for typing effect
  showCursor?: boolean;
  onDone?: () => void;
}

export function StreamingText({
  content,
  isStreaming,
  className,
  showCursor = true,
  onDone,
}: StreamingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content]);

  useEffect(() => {
    if (!isStreaming && content && onDone) {
      onDone();
    }
  }, [isStreaming, content, onDone]);

  return (
    <div
      ref={containerRef}
      className={cn("relative whitespace-pre-wrap break-words", className)}
    >
      {content}
      {isStreaming && showCursor && (
        <span className="inline-block w-2 h-4 bg-current animate-pulse ml-0.5" />
      )}
    </div>
  );
}

interface StreamingResponseProps {
  content: string;
  isStreaming: boolean;
  error?: string | null;
  className?: string;
  placeholder?: string;
}

export function StreamingResponse({
  content,
  isStreaming,
  error,
  className,
  placeholder = "Waiting for response...",
}: StreamingResponseProps) {
  if (error) {
    return (
      <div className={cn("text-destructive", className)}>
        <p className="font-medium">Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!content && !isStreaming) {
    return null;
  }

  if (!content && isStreaming) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{placeholder}</span>
      </div>
    );
  }

  return (
    <StreamingText
      content={content}
      isStreaming={isStreaming}
      className={className}
    />
  );
}
