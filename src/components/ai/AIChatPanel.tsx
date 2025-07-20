import { getColor, useTheme } from "@aesgraph/app-shell";
import {
  AlertTriangle,
  Cloud,
  Database,
  Globe,
  Send,
  Settings,
  Trash2,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useChatHistoryStore, { ChatMessage } from "../../store/chatHistoryStore";
import { addNotification } from "../../store/notificationStore";
import { useUserStore } from "../../store/userStore";
import {
  callLLMStudioAPI,
  checkLLMStudioAvailability,
} from "../applets/ChatGptImporter/services/llmStudioService";
import "./AIChatPanel.css";

interface AIChatPanelProps {
  [key: string]: any; // Accept any props for flexibility
}

// API provider types
type ApiProvider = "openai" | "llm-studio" | "live-chat";

const AIChatPanel: React.FC<AIChatPanelProps> = () => {
  // Get theme from app-shell
  const appShellTheme = useTheme();
  const theme = appShellTheme.theme;
  // Use chat history from store
  const { messages, addMessage, clearHistory } = useChatHistoryStore();
  // Use user store for authentication
  const { user, isSignedIn } = useUserStore();

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const [apiProvider, setApiProvider] = useState<ApiProvider>("llm-studio");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get OpenAI API key from environment (optional)
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || "";
  // Get live chat endpoint URL from environment
  const liveChatUrl =
    import.meta.env.VITE_LIVE_CHAT_URL || import.meta.env.VITE_DEFAULT_CHAT_URL;

  // Determine if this is a custom endpoint or production
  const isCustomEndpoint = useCallback(() => {
    const defaultUrl = import.meta.env.VITE_DEFAULT_CHAT_URL;
    return liveChatUrl !== defaultUrl;
  }, [liveChatUrl]);

  const getEndpointType = () => {
    if (isCustomEndpoint()) {
      return "Custom";
    }
    return "Server";
  };

  // Check API availability and determine provider
  useEffect(() => {
    const checkApi = async () => {
      if (openaiApiKey) {
        // If we have an OpenAI API key, use that first
        setApiProvider("openai");
        setApiAvailable(true);
      } else if (liveChatUrl) {
        // If using a custom endpoint (like localhost), use live chat without auth requirement
        setApiProvider("live-chat");
        setApiAvailable(true);
      } else if (isSignedIn && user) {
        // If no OpenAI key but user is signed in, use live chat endpoint
        setApiProvider("live-chat");
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
      if (apiProvider === "llm-studio" && !openaiApiKey && !isSignedIn) {
        setApiAvailable(await checkLLMStudioAvailability());
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkInterval);
  }, [
    openaiApiKey,
    isSignedIn,
    user,
    apiProvider,
    isCustomEndpoint,
    liveChatUrl,
  ]);

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

  // Call Live Chat API
  const callLiveChatAPI = async (
    chatMessages: ChatMessage[]
  ): Promise<string> => {
    // For custom endpoints (like localhost), don't require authentication
    const isCustom = isCustomEndpoint();

    if (!isCustom && (!isSignedIn || !user)) {
      throw new Error("User not authenticated");
    }

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Try to get session token for both custom and production endpoints
    try {
      const {
        data: { session },
      } = await import("../../utils/supabaseClient").then((m) =>
        m.supabase.auth.getSession()
      );

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      } else if (!isCustom) {
        // Only require auth for production endpoints
        throw new Error("No access token available");
      }
    } catch (error) {
      if (!isCustom) {
        throw error; // Re-throw for production endpoints
      }
      // For custom endpoints, continue without auth
    }

    const response = await fetch(liveChatUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: chatMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: temperature,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle CORS errors specifically, or not being on user whitelist
      if (response.status === 0 || response.statusText === "") {
        if (
          errorData &&
          typeof errorData.error === "string" &&
          errorData.error.includes("User is not authorized")
        ) {
          throw new Error("User is not authorized");
        }
        throw new Error(`Please log in to use chat`);
      }

      // Handle access denied error specifically
      if (
        response.status === 403 &&
        errorData.error &&
        errorData.error.includes("aesgraph@gmail.com")
      ) {
        throw new Error(`🔒 Access Denied: ${errorData.error}`);
      }

      throw new Error(
        `Live Chat API error: ${response.status} ${response.statusText} - ${errorData.error || "Unknown error"}`
      );
    }

    const data = await response.json();
    return data.message || "No response received";
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

      // Filter out any messages with an invalid role
      const validRoles = ["system", "user", "assistant"];
      const filteredChatMessages = chatMessages.filter((msg) =>
        validRoles.includes(msg.role)
      );

      // Call appropriate API based on provider
      let response: string;
      if (apiProvider === "openai") {
        response = await callOpenAIAPI(filteredChatMessages);
      } else if (apiProvider === "live-chat") {
        response = await callLiveChatAPI(filteredChatMessages);
      } else {
        response = await callLLMStudioAPI(filteredChatMessages, {
          temperature,
        });
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
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Handle different types of errors with user-friendly messages
      let userFriendlyMessage = "";
      let isAccessDenied = false;

      if (
        errorMessage.includes("User is not authorized") ||
        (errorMessage.includes("401 Unauthorized") && isSignedIn)
      ) {
        userFriendlyMessage =
          "Please contact aesgraph@gmail.com for authorization to use chat";
      } else if (
        errorMessage.includes("401 Unauthorized") ||
        errorMessage.includes("User not authenticated") ||
        errorMessage.includes("Authorization header required")
      ) {
        userFriendlyMessage = "Please log in to use chat";
      } else if (
        errorMessage.includes("Access Denied") ||
        errorMessage.includes("aesgraph@gmail.com")
      ) {
        userFriendlyMessage = `🔒 ${errorMessage}`;
        isAccessDenied = true;
      } else {
        userFriendlyMessage = `Sorry, I encountered an error: ${errorMessage}`;
      }

      addNotification({
        message: userFriendlyMessage,
        type: "error",
        duration: isAccessDenied ? 15000 : 5000,
      });

      // Add error message to persistent store
      addMessage({
        id: `error-${Date.now()}`,
        role: "error",
        content: userFriendlyMessage,
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

  const getProviderDisplayName = (provider: ApiProvider): string => {
    switch (provider) {
      case "live-chat":
        return "Live Chat";
      case "openai":
        return "OpenAI";
      case "llm-studio":
        return "LLM Studio";
      default:
        return "Unknown";
    }
  };

  const getProviderIcon = (provider: ApiProvider) => {
    switch (provider) {
      case "live-chat":
        return <Globe size={16} />;
      case "openai":
        return <Cloud size={16} />;
      case "llm-studio":
        return <Database size={16} />;
      default:
        return <Database size={16} />;
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
          {getProviderDisplayName(apiProvider)}
          {apiAvailable === false && (
            <span
              className="api-status error"
              title={`${getProviderDisplayName(apiProvider)} not available`}
            >
              <AlertTriangle size={16} />
            </span>
          )}
          {apiAvailable === true && (
            <span
              className="api-status connected"
              title={`Connected to ${getProviderDisplayName(apiProvider)}`}
            >
              •
            </span>
          )}
          <span
            className="api-provider-icon"
            title={`Using ${getProviderDisplayName(apiProvider)}`}
          >
            {getProviderIcon(apiProvider)}
          </span>
          {apiProvider === "live-chat" && isCustomEndpoint() && (
            <span className="endpoint-indicator custom" title="Custom endpoint">
              Custom
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
            {apiProvider === "openai" ? (
              <p>Using OpenAI API with environment variable API key</p>
            ) : apiProvider === "live-chat" ? (
              <div>
                <p>Using Live Chat API at:</p>
                <code>{liveChatUrl}</code>
                <p className="endpoint-type">
                  <strong>Endpoint Type:</strong> {getEndpointType()}
                  {isCustomEndpoint() && (
                    <span className="custom-badge">Custom</span>
                  )}
                </p>
                {isSignedIn ? (
                  <p className="auth-status connected">
                    ✅ Authenticated as {user?.email}
                  </p>
                ) : (
                  <p className="auth-status error">❌ Not authenticated</p>
                )}
              </div>
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
      {apiAvailable === false && (
        <div className="api-unavailable-notice">
          <AlertTriangle size={20} />
          <p>
            {apiProvider === "live-chat"
              ? "Live Chat API is not available. Please sign in to use the live chat endpoint."
              : apiProvider === "llm-studio"
                ? "LLM Studio API is not available. Please make sure LLM Studio is running at http://localhost:1234."
                : "API is not available. Please check your configuration."}
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
              ? `${getProviderDisplayName(apiProvider)} not available...`
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
