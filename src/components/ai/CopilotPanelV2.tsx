import { Send } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import useChatHistoryStore, { ChatMessage } from "../../store/chatHistoryStore";
import { addNotification } from "../../store/notificationStore";
import {
  callLLMStudioAPI,
  checkLLMStudioAvailability,
} from "../applets/ChatGptImporter/services/llmStudioService";

interface CopilotPanelV2Props {
  className?: string;
  isDarkMode?: boolean;
}

const CopilotPanelV2: React.FC<CopilotPanelV2Props> = ({ className }) => {
  // Chat functionality
  const { messages, addMessage, clearHistory } = useChatHistoryStore();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Check API availability
  useEffect(() => {
    const checkApi = async () => {
      try {
        const available = await checkLLMStudioAvailability();
        setApiAvailable(available);
      } catch (error) {
        console.error("LLM Studio not available:", error);
        setApiAvailable(false);
      }
    };
    checkApi();
  }, []);

  // Safe auto-scroll using scrollTop instead of scrollIntoView
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      // Use scrollTop instead of scrollIntoView to avoid layout issues
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 0);
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    // Add user message immediately
    addMessage(userMessage);
    setInputValue("");
    setIsLoading(true);

    try {
      const chatMessages = [...messages, userMessage];
      const response = await callLLMStudioAPI(chatMessages, {
        temperature: 0.7,
      });

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      addMessage(assistantMessage);
    } catch (error) {
      console.error("Chat error:", error);
      addNotification({
        type: "error",
        message: `Chat Error: ${error instanceof Error ? error.message : "Failed to send message"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Very basic layout - NO CSS at all to test
  return (
    <div className={className}>
      <div>
        <h3>Copilot Chat</h3>
        <button onClick={clearHistory}>Clear</button>
      </div>

      <div
        ref={messagesContainerRef}
        style={{
          height: "300px",
          overflow: "auto",
          border: "1px solid #ccc",
          padding: "10px",
        }}
      >
        {messages.length === 0 ? (
          <p>Start a conversation!</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} style={{ marginBottom: "10px" }}>
              <strong>{message.role === "user" ? "You" : "Copilot"}:</strong>
              <p>{message.content}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask Copilot anything..."
          disabled={isLoading || !apiAvailable}
          style={{ width: "70%", padding: "8px" }}
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim() || !apiAvailable}
          style={{ padding: "8px 16px", marginLeft: "10px" }}
        >
          <Send size={14} />
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>

      {!apiAvailable && <p style={{ color: "red" }}>API not available</p>}
    </div>
  );
};

export default CopilotPanelV2;
