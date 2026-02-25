"use client";

import { useState, useCallback, useRef } from "react";

export interface StreamChunk {
  content: string;
  done: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface StreamOptions {
  onChunk?: (chunk: StreamChunk) => void;
  onComplete?: (fullContent: string, metadata?: Record<string, unknown>) => void;
  onError?: (error: string) => void;
  timeout?: number;
}

export function useStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stream = useCallback(
    async (url: string, body: unknown, options: StreamOptions = {}) => {
      const { onChunk, onComplete, onError, timeout = 60000 } = options;

      // Cancel any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = AbortSignal.timeout(timeout);
      const combinedSignal = AbortSignal.any
        ? AbortSignal.any([abortControllerRef.current.signal, signal])
        : abortControllerRef.current.signal;

      setIsStreaming(true);
      setContent("");
      setError(null);

      let fullContent = "";
      let metadata: Record<string, unknown> | undefined;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify(body),
          signal: combinedSignal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE events
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6)) as StreamChunk;

                if (data.error) {
                  throw new Error(data.error);
                }

                if (data.content) {
                  fullContent += data.content;
                  setContent(fullContent);
                  onChunk?.(data);
                }

                if (data.metadata) {
                  metadata = data.metadata;
                }

                if (data.done) {
                  onComplete?.(fullContent, metadata);
                }
              } catch (e) {
                // If it's not valid JSON, treat as plain text
                if (line.slice(6).trim()) {
                  const plainContent = line.slice(6);
                  fullContent += plainContent;
                  setContent(fullContent);
                  onChunk?.({ content: plainContent, done: false });
                }
              }
            }
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Stream failed";
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }

      return fullContent;
    },
    []
  );

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  }, []);

  const reset = useCallback(() => {
    setContent("");
    setError(null);
    setIsStreaming(false);
  }, []);

  return {
    isStreaming,
    content,
    error,
    stream,
    abort,
    reset,
  };
}

// Helper function to create SSE endpoint responses
export function createSSEMessage(
  content: string,
  done: boolean = false,
  metadata?: Record<string, unknown>
): string {
  const data = JSON.stringify({ content, done, metadata });
  return `data: ${data}\n\n`;
}
