import { create } from "zustand";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatHistoryState {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearHistory: () => void;
}

// Create a non-persisted store for chat history
const useChatHistoryStore = create<ChatHistoryState>((set) => ({
  messages: [
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! How can I help you today?",
      timestamp: new Date(),
    },
  ],
  addMessage: (message: ChatMessage) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setMessages: (messages: ChatMessage[]) => set({ messages }),
  clearHistory: () =>
    set({
      messages: [
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! How can I help you today?",
          timestamp: new Date(),
        },
      ],
    }),
}));

export default useChatHistoryStore;
