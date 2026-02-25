import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ModuleType =
  | "prompt"
  | "image"
  | "video"
  | "workflow"
  | "music"
  | "voice";

export interface MessageMetadata {
  images?: string[];
  video?: string;
  audio?: string;
  provider?: string;
  model?: string;
  tags?: string[];
  suggestions?: string[];
  notification?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

interface ChatState {
  messages: Message[];
  currentModule: ModuleType;
  isLoading: boolean;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  setMessages: (messages: Message[]) => void;
  setCurrentModule: (module: ModuleType) => void;
  setIsLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      currentModule: "prompt",
      isLoading: false,
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: crypto.randomUUID(),
              timestamp: new Date(),
            },
          ],
        })),
      setMessages: (messages) => set({ messages }),
      setCurrentModule: (currentModule) => set({ currentModule }),
      setIsLoading: (isLoading) => set({ isLoading }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        messages: state.messages.slice(-50),
        currentModule: state.currentModule,
      }),
    }
  )
);
