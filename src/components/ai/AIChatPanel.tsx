import {
  AlertTriangle,
  Cloud,
  Database,
  Send,
  Settings,
  Trash2,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useTheme, getColor } from "@aesgraph/app-shell";
import useChatHistoryStore, { ChatMessage } from "../../store/chatHistoryStore";
import { addNotification } from "../../store/notificationStore";
import {
  callLLMStudioAPI,
  checkLLMStudioAvailability,
} from "../applets/ChatGptImporter/services/llmStudioService";
import "./AIChatPanel.css";

interface AIChatPanelProps {
  [key: string]: any; // Accept any props for flexibility
}

// API provider types
type ApiProvider = "openai" | "llm-studio";

const AIChatPanel: React.FC<AIChatPanelProps> = () => {
  // Get theme from app-shell
  const appShellTheme = useTheme();
  const theme = appShellTheme.theme;
  // Use chat history from store
  const { messages, addMessage, clearHistory } = useChatHistoryStore();

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const [apiProvider, setApiProvider] = useState<ApiProvider>("llm-studio");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get OpenAI API key from environment
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || "";

  // Check API availability and determine provider
  useEffect(() => {
    const checkApi = async () => {
      if (openaiApiKey) {
        // If we have an OpenAI API key, use that
        setApiProvider("openai");
        setApiAvailable(true);
      } else {
        // Otherwise check if LLM Studio is available
        setApiProvider("llm-studio");
        setApiAvailable(await checkLLMStudioAvailability());
      }
    };

    checkApi();

    // Set up periodic availability check for LLM Studio (only if we're using it)
    const checkInterval = setInterval(async () => {
      if (!openaiApiKey) {
        setApiAvailable(await checkLLMStudioAvailability());
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkInterval);
  }, [openaiApiKey]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Call OpenAI API
  const callOpenAIAPI = async (
    chatMessages: ChatMessage[]
  ): Promise<string> => {
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not found");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: chatMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: temperature,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No response received";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || apiAvailable === false) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    // Add user message to persistent store
    addMessage(userMessage);
    setInputValue("");
    setIsLoading(true);

    try {
      // Convert to messages format for API
      const chatMessages: ChatMessage[] = messages
        .concat(userMessage) // Add the new user message
        .filter((msg) => msg.id !== "welcome" || messages.length <= 1) // Remove welcome message unless it's the only one
        .map(({ role, content }) => ({
          id: `${role}-${Date.now()}`,
          role,
          content,
          timestamp: new Date(),
        }));

      // Add a system message for context
      chatMessages.unshift({
        id: "system",
        timestamp: new Date(),
        role: "system",
        content:
          "You are a helpful AI assistant. Provide concise, accurate answers.",
      });

      // Call appropriate API based on provider
      let response: string;
      if (apiProvider === "openai") {
        response = await callOpenAIAPI(chatMessages);
      } else {
        response = await callLLMStudioAPI(chatMessages, { temperature });
      }

      // Add AI response to persistent store
      addMessage({
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error generating response:", error);
      addNotification({
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        type: "error",
        duration: 5000,
      });

      // Add error message to persistent store
      addMessage({
        id: `error-${Date.now()}`,
        role: "system",
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className="ai-chat-panel"
      style={
        {
          "--workspace-background": getColor(
            theme.colors,
            "workspaceBackground"
          ),
          "--workspace-panel": getColor(theme.colors, "workspacePanel"),
          "--workspace-text": getColor(theme.colors, "text"),
          "--workspace-text-secondary": getColor(theme.colors, "textSecondary"),
          "--workspace-text-muted": getColor(theme.colors, "textMuted"),
          "--workspace-border": getColor(theme.colors, "border"),
          "--workspace-border-hover": getColor(theme.colors, "borderHover"),
          "--workspace-surface": getColor(theme.colors, "surface"),
          "--workspace-surface-hover": getColor(theme.colors, "surfaceHover"),
          "--workspace-primary": getColor(theme.colors, "primary"),
          "--workspace-accent": getColor(theme.colors, "accent"),
          "--workspace-error": getColor(theme.colors, "error"),
          "--workspace-success": getColor(theme.colors, "success"),
          "--workspace-warning": getColor(theme.colors, "warning"),
        } as React.CSSProperties
      }
    >
      {/* Header with settings button */}
      <div className="ai-chat-header">
        <div className="ai-chat-title">
          {apiProvider === "openai" ? "OpenAI Chat" : "LLM Studio Chat"}
          {apiAvailable === false && (
            <span
              className="api-status error"
              title="LLM Studio server not available"
            >
              <AlertTriangle size={16} />
            </span>
          )}
          {apiAvailable === true && (
            <span
              className="api-status connected"
              title={`Connected to ${apiProvider === "openai" ? "OpenAI API" : "LLM Studio"}`}
            >
              •
            </span>
          )}
          <span
            className="api-provider-icon"
            title={`Using ${apiProvider === "openai" ? "OpenAI API" : "Local LLM Studio"}`}
          >
            {apiProvider === "openai" ? (
              <Cloud size={16} />
            ) : (
              <Database size={16} />
            )}
          </span>
        </div>
        <div className="ai-chat-actions">
          <button
            className="ai-chat-settings-button"
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="ai-chat-settings">
          <div className="settings-group">
            <label htmlFor="temperature-slider">
              Temperature: {temperature.toFixed(1)}
            </label>
            <input
              id="temperature-slider"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
            />
          </div>
          <div className="settings-api-info">
            {apiProvider === "openai" ? (
              <p>Using OpenAI API with environment variable API key</p>
            ) : (
              <>
                <p>Using local LLM Studio API at:</p>
                <code>http://localhost:1234/v1/chat/completions</code>
              </>
            )}
          </div>
          <div className="settings-actions">
            <button
              className="clear-history-button"
              onClick={clearHistory}
              title="Clear chat history"
            >
              <Trash2 size={16} /> Clear History
            </button>
          </div>
        </div>
      )}

      {/* API not available message */}
      {apiAvailable === false && apiProvider === "llm-studio" && (
        <div className="api-unavailable-notice">
          <AlertTriangle size={20} />
          <p>
            LLM Studio API is not available. Please make sure LLM Studio is
            running at <code>http://localhost:1234</code> or add OpenAI API key
            to your environment variables.
          </p>
        </div>
      )}

      {/* Message history */}
      <div className="ai-chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`ai-chat-message ${message.role}`}>
            <div className="message-content">
              {message.content.split("\n").map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < message.content.split("\n").length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
            <div className="message-timestamp">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="ai-chat-message assistant loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="ai-chat-input-container">
        <textarea
          className="ai-chat-input"
          placeholder={
            apiAvailable === false
              ? "LLM Studio server not available..."
              : "Type a message..."
          }
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || apiAvailable === false}
        />
        <button
          className="ai-chat-send-button"
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading || apiAvailable === false}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default AIChatPanel;
