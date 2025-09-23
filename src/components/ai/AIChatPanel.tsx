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
import React, { useEffect, useRef, useState } from "react";
import { useApiProvider } from "../../context/ApiProviderContext";
import { useComponentLogger } from "../../hooks/useLogger";
import useChatHistoryStore, {
  ChatImage,
  ChatMessage,
} from "../../store/chatHistoryStore";
import { useMapControlStore } from "../../store/mapControlStore";
import { addNotification } from "../../store/notificationStore";
import { useUserStore } from "../../store/userStore";
import { useCommandProcessor } from "../commandPalette/CommandProcessor";
import { useSemanticWebQuerySession } from "../semantic/SemanticWebQueryContext";
import "./AIChatPanel.css";
import { AIResponse, sendAIMessage } from "./aiQueryLogic";
import { SEMANTIC_TOOLS, parseToolCallArguments } from "./aiTools";

interface AIChatPanelProps {
  className?: string;
  sessionId?: string; // Optional session ID for semantic queries
}

// API provider types
// type ApiProvider = "openai" | "llm-studio" | "live-chat";

const AIChatPanel: React.FC<AIChatPanelProps> = ({
  sessionId = "ai-chat-panel",
}) => {
  const log = useComponentLogger("AIChatPanel");
  // Get theme from app-shell
  const appShellTheme = useTheme();
  const theme = appShellTheme.theme;
  // Use chat history from store
  const { messages, addMessage, clearHistory } = useChatHistoryStore();
  // Use user store for authentication
  const { user, isSignedIn } = useUserStore();
  // Use semantic web query session
  const { setQuery: setSemanticQuery } = useSemanticWebQuerySession(sessionId);
  // Use command processor for workspace layout commands
  const { processCommand } = useCommandProcessor();
  // Use API provider context
  const {
    apiProvider,
    apiAvailable,
    openaiApiKey,
    liveChatUrl,
    isCustomEndpoint,
    isVercelEndpoint,
    getEndpointType,
  } = useApiProvider();

  // Get map control functions
  const {
    goToLocation,
    addLocationMarker,
    setZoom,
    setMapType,
    clearMarkers,
    createPath,
  } = useMapControlStore();

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [pastedImages, setPastedImages] = useState<ChatImage[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus input field when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Re-focus input when loading state changes from true to false (message sent)
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      // Small delay to ensure DOM is fully updated
      const timeoutId = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 10);

      return () => clearTimeout(timeoutId);
    }
  }, [isLoading]);

  // Safe auto-scroll using scrollTop instead of scrollIntoView
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      // Use requestAnimationFrame to ensure DOM is ready and avoid layout issues
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  }, [messages]);

  // Process tool calls and route them appropriately
  const processToolCalls = (toolCalls: any[]) => {
    toolCalls.forEach((toolCall) => {
      if (toolCall.function.name === "semantic_query") {
        try {
          const args = parseToolCallArguments(toolCall);
          const formattedQuery = prettyPrintSparql(args.query);
          setSemanticQuery(formattedQuery);

          // Log the tool call
          log.info(`Semantic query executed: ${args.description}`, {
            sessionId,
            query: args.query,
            formattedQuery,
            toolCallId: toolCall.id,
          });
        } catch (error) {
          log.error("Failed to process semantic query tool call", {
            error,
            sessionId,
            toolCallId: toolCall.id,
          });
        }
      } else if (toolCall.function.name === "add_view_to_panel") {
        try {
          const args = parseToolCallArguments(toolCall);

          // Process the workspace layout command
          processCommand("workspace_layout_tool", {
            viewId: args.viewId,
            panelId: args.panelId,
          });

          // Log the tool call
          log.info(`Added ${args.viewId} to ${args.panelId} panel`, {
            sessionId,
            viewId: args.viewId,
            panelId: args.panelId,
            toolCallId: toolCall.id,
          });
        } catch (error) {
          log.error("Failed to process workspace layout tool call", {
            error,
            sessionId,
            toolCallId: toolCall.id,
          });
        }
      } else if (toolCall.function.name === "edit_code") {
        try {
          const args = parseToolCallArguments(toolCall);

          log.debug("AIChatPanel edit_code args", { args });

          // Process the code editing command
          processCommand("monaco_editor_code_tool", {
            code: args.code,
            language: args.language,
            description: args.description,
            replace: args.replace !== undefined ? args.replace : true, // Default to true (replace) if not specified
          });

          // Log the tool call
          log.info(
            `Edited code in Monaco Editor${args.language ? ` (${args.language})` : ""}`,
            {
              sessionId,
              language: args.language,
              description: args.description,
              replace: args.replace,
              toolCallId: toolCall.id,
            }
          );
        } catch (error) {
          log.error("Failed to process code editing tool call", {
            error,
            sessionId,
            toolCallId: toolCall.id,
          });
        }
      } else if (toolCall.function.name === "write_code") {
        try {
          const args = parseToolCallArguments(toolCall);

          // Process the code generation command
          processCommand("monaco_editor_code_tool", {
            code: args.code,
            language: args.language,
            description: args.description,
            replace: args.replace || false,
          });

          // Log the tool call
          log.info(`Generated ${args.language || "code"} in Monaco Editor`, {
            sessionId,
            language: args.language,
            description: args.description,
            replace: args.replace,
            toolCallId: toolCall.id,
          });
        } catch (error) {
          log.error("Failed to process code generation tool call", {
            error,
            sessionId,
            toolCallId: toolCall.id,
          });
        }
      } else if (toolCall.function.name === "map_control") {
        try {
          const args = parseToolCallArguments(toolCall);

          switch (args.action) {
            case "go_to":
              if (args.location) {
                goToLocation(args.location);
                log.info(`Navigated to location: ${args.location}`, {
                  sessionId,
                  location: args.location,
                  toolCallId: toolCall.id,
                });
              }
              break;
            case "add_marker":
              if (args.location) {
                addLocationMarker(args.location, args.description);
                log.info(`Added marker for location: ${args.location}`, {
                  sessionId,
                  location: args.location,
                  description: args.description,
                  toolCallId: toolCall.id,
                });
              }
              break;
            case "set_zoom":
              if (args.zoom) {
                setZoom(args.zoom);
                log.info(`Set map zoom to: ${args.zoom}`, {
                  sessionId,
                  zoom: args.zoom,
                  toolCallId: toolCall.id,
                });
              }
              break;
            case "set_map_type":
              if (args.mapType) {
                setMapType(args.mapType);
                log.info(`Set map type to: ${args.mapType}`, {
                  sessionId,
                  mapType: args.mapType,
                  toolCallId: toolCall.id,
                });
              }
              break;
            case "clear_markers":
              clearMarkers();
              log.info("Cleared all map markers", {
                sessionId,
                toolCallId: toolCall.id,
              });
              break;
            case "create_path":
              if (args.locations && Array.isArray(args.locations)) {
                createPath(args.locations, args.pathName);
                log.info(`Created path: ${args.pathName || "Unnamed path"}`, {
                  sessionId,
                  locations: args.locations,
                  pathName: args.pathName,
                  toolCallId: toolCall.id,
                });
              }
              break;
            default:
              log.warn("Unknown map action", {
                sessionId,
                action: args.action,
                toolCallId: toolCall.id,
              });
          }
        } catch (error) {
          log.error("Failed to process map control tool call", {
            error,
            sessionId,
            toolCallId: toolCall.id,
          });
        }
      }
      // Add more tool handlers here as needed
    });
  };

  // Pretty print SPARQL query for better readability
  const prettyPrintSparql = (query: string): string => {
    try {
      // Basic SPARQL formatting
      const formatted = query
        // Add line breaks after common SPARQL keywords
        .replace(
          /\b(SELECT|WHERE|OPTIONAL|FILTER|LIMIT|ORDER BY|GROUP BY|HAVING|UNION|PREFIX|ASK|CONSTRUCT|DESCRIBE)\b/gi,
          "\n$1"
        )
        // Add line breaks after opening braces
        .replace(/\{/g, " {\n  ")
        // Add line breaks before closing braces
        .replace(/\}/g, "\n}")
        // Add line breaks after semicolons
        .replace(/;/g, ";\n")
        // Add line breaks after dots (triple separators)
        .replace(/ \./g, " .\n  ")
        // Clean up multiple line breaks
        .replace(/\n\s*\n/g, "\n")
        // Add proper indentation
        .split("\n")
        .map((line, index) => {
          const trimmed = line.trim();
          if (!trimmed) return "";

          // Determine indentation level
          let indent = "";
          if (trimmed.startsWith("}")) {
            indent = "  ".repeat(Math.max(0, index > 0 ? 1 : 0));
          } else if (trimmed.startsWith("{")) {
            indent = "  ".repeat(1);
          } else if (
            trimmed.match(
              /^\b(SELECT|WHERE|OPTIONAL|FILTER|LIMIT|ORDER BY|GROUP BY|HAVING|UNION|PREFIX|ASK|CONSTRUCT|DESCRIBE)\b/i
            )
          ) {
            indent = "";
          } else {
            indent = "  ".repeat(2);
          }

          return indent + trimmed;
        })
        .filter((line) => line !== "")
        .join("\n")
        .trim();

      return formatted;
    } catch (error) {
      log.warn("Failed to pretty print SPARQL query", { error });
      return query; // Return original if formatting fails
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return; // No longer need apiAvailable === false

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
      images: pastedImages.length > 0 ? pastedImages : undefined,
    };

    // Add user message to persistent store
    addMessage(userMessage);
    setInputValue("");
    setPastedImages([]); // Clear pasted images after sending
    setIsLoading(true);

    // Log the user message
    log.info(`User message sent`, {
      sessionId,
      messageLength: userMessage.content.length,
      // apiProvider, // No longer needed
    });

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
          "You are a helpful AI assistant with access to semantic web tools. When users ask for information that could be retrieved from a knowledge graph or database, use the semantic_query tool to generate appropriate SPARQL queries. For example, if someone asks 'fetch star wars characters from dbpedia', you should use the semantic_query tool with a SPARQL query that searches for Star Wars characters in DBpedia.",
      });

      // Filter out any messages with an invalid role
      const validRoles = ["system", "user", "assistant"];
      const filteredChatMessages = chatMessages.filter((msg) =>
        validRoles.includes(msg.role)
      );

      // Log AI request
      log.info(`Sending AI request`, {
        sessionId,
        messageCount: filteredChatMessages.length,
        // apiProvider, // No longer needed
        hasTools: false, // No longer needed
      });

      // Call the generic sendAIMessage function with semantic tools
      const response: AIResponse = await sendAIMessage({
        chatMessages: filteredChatMessages,
        apiProvider,
        openaiApiKey,
        liveChatUrl,
        isCustomEndpoint,
        isSignedIn,
        user,
        temperature,
        tools: apiProvider === "openai" ? SEMANTIC_TOOLS : undefined, // Only use tools with OpenAI
      });

      // Debug logging
      log.debug("AI Response", {
        content: response.content,
        contentLength: response.content?.length,
        hasToolCalls: !!response.toolCalls,
        toolCallsCount: response.toolCalls?.length,
        toolCalls: response.toolCalls,
      });

      // Process any tool calls
      if (response.toolCalls && response.toolCalls.length > 0) {
        log.info(`Processing ${response.toolCalls.length} tool calls`, {
          sessionId,
          toolCalls: response.toolCalls.map((tc) => tc.function.name),
        });
        processToolCalls(response.toolCalls);
      }

      // Add AI response to persistent store
      let responseContent = response.content;

      // If no content, empty content, or "No response received" but we have tool calls, provide a helpful message
      if (
        (!responseContent ||
          responseContent.trim() === "" ||
          responseContent === "No response received") &&
        response.toolCalls &&
        response.toolCalls.length > 0
      ) {
        // Generate appropriate response based on the tool calls
        const toolCallNames = response.toolCalls.map((tc) => tc.function.name);

        if (toolCallNames.includes("semantic_query")) {
          responseContent = `SPARQL query generated in ${sessionId} panel`;
        } else if (toolCallNames.includes("edit_code")) {
          responseContent = "Code has been updated in the Monaco editor";
        } else if (toolCallNames.includes("add_view_to_panel")) {
          // Extract view and panel info from the tool call
          const viewToolCall = response.toolCalls.find(
            (tc) => tc.function.name === "add_view_to_panel"
          );
          if (viewToolCall) {
            try {
              const args = parseToolCallArguments(viewToolCall);
              const viewId = args.viewId;
              const panelId = args.panelId;

              // Get friendly names for the view and panel
              const viewNames: Record<string, string> = {
                "ai-chat": "AI Chat",
                "semantic-web-query": "SPARQL Query",
                "force-graph-3d-v2": "ForceGraph 3D",
                "monaco-editor": "Monaco Editor",
                "system-monitor": "System Monitor",
                "node-legend": "Node Legend",
                "edge-legend": "Edge Legend",
                "entity-table-v2": "Entity Table",
                "custom-themed-panel": "Theme Demo",
                "theme-inheritance-demo": "Theme Inheritance",
                "wikipedia-factor-graph": "Wikipedia Factor Graph",
                "gravity-simulation": "Gravity Simulation",
              };

              const panelNames: Record<string, string> = {
                left: "left panel",
                center: "center panel",
                right: "right panel",
                bottom: "bottom panel",
              };

              const viewName = viewNames[viewId] || viewId;
              const panelName = panelNames[panelId] || panelId;

              responseContent = `Opened ${viewName} in the ${panelName}`;
              // eslint-disable-next-line unused-imports/no-unused-vars
            } catch (error) {
              responseContent = "View opened successfully";
            }
          } else {
            responseContent = "View opened successfully";
          }
        } else {
          responseContent = "Action completed successfully";
        }
      } else if (!responseContent || responseContent.trim() === "") {
        responseContent = "No response received";
      }

      console.log("Final response content:", responseContent);

      addMessage({
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      });

      // Log successful AI response
      log.info(`AI response received`, {
        sessionId,
        responseLength: responseContent.length,
        hasToolCalls: !!response.toolCalls,
        toolCallsCount: response.toolCalls?.length,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Log the error
      log.error(`AI request failed`, {
        sessionId,
        error: errorMessage,
        // apiProvider, // No longer needed
      });

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

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();

        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            const newImage: ChatImage = {
              id: `img-${Date.now()}-${Math.random()}`,
              dataUrl,
              fileName: file.name,
              fileType: file.type,
              size: file.size,
            };
            setPastedImages((prev) => [...prev, newImage]);
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  const removeImage = (imageId: string) => {
    setPastedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const getProviderDisplayName = (provider: string): string => {
    switch (provider) {
      case "live-chat":
        return "Live Chat";
      case "openai":
        return "ChatGPT";
      case "llm-studio":
        return "LLM Studio";
      default:
        return "Unknown";
    }
  };

  const getProviderIcon = (provider: string) => {
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
          {isCustomEndpoint && !isVercelEndpoint && (
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
                {!isVercelEndpoint ? (
                  <>
                    <p>Using Live Chat API at:</p>
                    <code>{liveChatUrl}</code>
                    <p className="endpoint-type">
                      <strong>Endpoint Type:</strong> {getEndpointType()}
                      {isCustomEndpoint && (
                        <span className="custom-badge">Custom</span>
                      )}
                    </p>
                  </>
                ) : (
                  <p>Using Live Chat API</p>
                )}
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
      <div className="ai-chat-messages" ref={messagesContainerRef}>
        {messages.map((message) => (
          <div key={message.id} className={`ai-chat-message ${message.role}`}>
            <div className="message-content">
              {message.content.split("\n").map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < message.content.split("\n").length - 1 && <br />}
                </React.Fragment>
              ))}
              {/* Display images if present */}
              {message.images && message.images.length > 0 && (
                <div className="message-images">
                  {message.images.map((image) => (
                    <div key={image.id} className="message-image-item">
                      <img
                        src={image.dataUrl}
                        alt={image.fileName || "Message image"}
                        className="message-image"
                      />
                      {image.fileName && (
                        <div className="message-image-caption">
                          {image.fileName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
      </div>

      {/* Input area */}
      <div className="ai-chat-input-container">
        {/* Pasted images preview */}
        {pastedImages.length > 0 && (
          <div className="pasted-images-preview">
            {pastedImages.map((image) => (
              <div key={image.id} className="pasted-image-item">
                <img
                  src={image.dataUrl}
                  alt={image.fileName || "Pasted image"}
                  className="pasted-image-thumbnail"
                />
                <div className="pasted-image-info">
                  <span className="pasted-image-name">
                    {image.fileName || "Image"}
                  </span>
                  <span className="pasted-image-size">
                    {(image.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button
                  className="remove-image-button"
                  onClick={() => removeImage(image.id)}
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <textarea
          ref={inputRef}
          className="ai-chat-input"
          placeholder={
            apiAvailable === false
              ? `${getProviderDisplayName(apiProvider)} not available...`
              : "Type a message... (or paste an image)"
          }
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
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
