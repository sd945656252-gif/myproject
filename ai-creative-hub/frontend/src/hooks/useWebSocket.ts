"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useChatStore, useUserStore } from "@/stores";

type WebSocketMessage = {
  type: string;
  payload: Record<string, unknown>;
  timestamp?: string;
};

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export function useWebSocket() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useUserStore();

  const connect = useCallback(() => {
    if (!user?.id) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000"}/ws/${user.id}`;

    try {
      setStatus("connecting");
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setStatus("connected");
        console.log("WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        setStatus("disconnected");
        console.log("WebSocket disconnected");

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (error) => {
        setStatus("error");
        console.error("WebSocket error:", error);
      };

      wsRef.current = ws;
    } catch (error) {
      setStatus("error");
      console.error("Failed to connect WebSocket:", error);
    }
  }, [user?.id]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  const send = useCallback((type: string, payload: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
      return true;
    }
    return false;
  }, []);

  const generate = useCallback(
    (taskType: string, params: Record<string, unknown>, requestId?: string) => {
      return send("generate", {
        task_type: taskType,
        params,
        request_id: requestId || crypto.randomUUID(),
      });
    },
    [send]
  );

  const cancel = useCallback(
    (requestId: string) => {
      return send("cancel", { request_id: requestId });
    },
    [send]
  );

  const ping = useCallback(() => {
    return send("ping", {});
  }, []);

  useEffect(() => {
    if (user?.id) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user?.id, connect, disconnect]);

  // Keep connection alive
  useEffect(() => {
    if (status === "connected") {
      const interval = setInterval(ping, 30000);
      return () => clearInterval(interval);
    }
  }, [status, ping]);

  return {
    status,
    lastMessage,
    connect,
    disconnect,
    send,
    generate,
    cancel,
    ping,
  };
}
