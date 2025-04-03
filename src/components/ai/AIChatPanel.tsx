import { AlertTriangle, Send, Settings, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  callLLMStudioAPI,
  checkLLMStudioAvailability,
} from "../../services/llmStudioService";
import useChatHistoryStore, { ChatMessage } from "../../store/chatHistoryStore";
import { addNotification } from "../../store/notificationStore";
import "./AIChatPanel.css";

interface AIChatPanelProps {
  isDarkMode?: boolean;
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({ isDarkMode = false }) => {
  // Use chat history from store
  const { messages, addMessage, clearHistory } = useChatHistoryStore();

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if LLM Studio API is available
  useEffect(() => {
    const checkApi = async () => {
      setApiAvailable(await checkLLMStudioAvailability());
    };

    checkApi();

    // Set up periodic availability check
    const checkInterval = setInterval(async () => {
      setApiAvailable(await checkLLMStudioAvailability());
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkInterval);
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      // Call LLM Studio API
      const response = await callLLMStudioAPI(chatMessages, {
        temperature,
      });

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
    <div className={`ai-chat-panel ${isDarkMode ? "dark" : ""}`}>
      {/* Header with settings button */}
      <div className="ai-chat-header">
        <div className="ai-chat-title">
          LLM Studio Chat
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
              title="Connected to LLM Studio"
            >
              •
            </span>
          )}
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
            <p>Using local LLM Studio API at:</p>
            <code>http://localhost:1234/v1/chat/completions</code>
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
      {apiAvailable === false && (
        <div className="api-unavailable-notice">
          <AlertTriangle size={20} />
          <p>
            LLM Studio API is not available. Please make sure LLM Studio is
            running at <code>http://localhost:1234</code> and try again.
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
