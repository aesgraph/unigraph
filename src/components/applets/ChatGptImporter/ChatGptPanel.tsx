import { FileJson, MessageSquare, Workflow } from "lucide-react";
import React, { useRef, useState } from "react";
import useAppConfigStore, {
  getCurrentSceneGraph,
} from "../../../store/appConfigStore";
import { addNotification } from "../../../store/notificationStore";
import {
  importChatGptConversation,
  importChatGptFromFile,
} from "./chatGptImportUtils";
import "./ChatGptPanel.css";
import { importConversationsWithStructure } from "./services/conversationsImporter";

interface ChatGptPanelProps {
  isDarkMode?: boolean;
}

export const ChatGptPanel: React.FC<ChatGptPanelProps> = ({
  isDarkMode = false,
}) => {
  // Tab state
  const [activeTab, setActiveTab] = useState<"chatgpt" | "conversations">(
    "chatgpt"
  );

  const [url, setUrl] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [recentImports, setRecentImports] = React.useState<string[]>([]);
  const [createMessageNodes, setCreateMessageNodes] = useState<boolean>(false);
  const [downsamplePercent, setDownsamplePercent] = useState<number>(100);
  const { currentSceneGraph } = useAppConfigStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Conversation importer options
  const [createTopicNodes, setCreateTopicNodes] = useState<boolean>(true);
  const [createKeywordNodes, setCreateKeywordNodes] = useState<boolean>(true);
  const [minKeywordOccurrences, setMinKeywordOccurrences] = useState<number>(3);
  const conversationsFileInputRef = useRef<HTMLInputElement>(null);

  // Load recent imports from localStorage on component mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("chatgpt-recent-imports");
      if (saved) {
        setRecentImports(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load recent imports:", error);
    }
  }, []);

  // Save a URL to recent imports
  const saveToRecentImports = (url: string) => {
    // Only save valid URLs
    if (!url.includes("chatgpt.com/share/")) return;

    const updated = [
      url,
      ...recentImports.filter((item) => item !== url),
    ].slice(0, 5);
    setRecentImports(updated);
    try {
      localStorage.setItem("chatgpt-recent-imports", JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save recent imports:", error);
    }
  };

  const handleImport = async () => {
    if (!url.trim()) {
      addNotification({
        message: "Please enter a valid ChatGPT share URL",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const conversationNodeId = await importChatGptConversation(
        url,
        currentSceneGraph,
        createMessageNodes
      );
      if (conversationNodeId) {
        // Save to recent imports
        saveToRecentImports(url);
        setUrl(""); // Clear input after successful import
      }
    } catch (error) {
      console.error("Error in ChatGPT import:", error);
      addNotification({
        message: "Failed to import ChatGPT conversation",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const conversationNodeId = await importChatGptFromFile(
        file,
        currentSceneGraph,
        createMessageNodes,
        downsamplePercent / 100 // Pass the conversation downsampling ratio
      );
      if (conversationNodeId) {
        getCurrentSceneGraph().refreshDisplayConfig();
        getCurrentSceneGraph().notifyGraphChanged();
        addNotification({
          message: `Successfully imported conversation from ${file.name}`,
          type: "success",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error importing file:", error);
      addNotification({
        message: "Failed to import conversation from file",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
      // Reset file input
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleConversationsMetadataImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // Create URL for the selected file
      const fileUrl = URL.createObjectURL(file);

      // Call the importConversationsWithStructure function
      const result = await importConversationsWithStructure(
        fileUrl,
        currentSceneGraph,
        createTopicNodes,
        createKeywordNodes,
        minKeywordOccurrences
      );

      // Revoke the URL to free up memory
      URL.revokeObjectURL(fileUrl);

      getCurrentSceneGraph().refreshDisplayConfig();
      getCurrentSceneGraph().notifyGraphChanged();

      // Show success notification with statistics
      addNotification({
        message: `Imported ${result.imported} conversations (${result.matched} matched with existing nodes)`,
        type: "success",
        duration: 5000,
      });

      // Show topic and keyword stats if they were created
      if (result.topics) {
        addNotification({
          message: `Created ${result.topics.topics} topic nodes with ${result.topics.connections} connections`,
          type: "info",
          duration: 5000,
        });
      }

      if (result.keywords) {
        addNotification({
          message: `Created ${result.keywords.keywords} keyword nodes with ${result.keywords.connections} connections`,
          type: "info",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error importing conversations:", error);
      addNotification({
        message: `Failed to import conversations: ${error instanceof Error ? error.message : String(error)}`,
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
      // Reset file input
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  return (
    <div className={`chatgpt-panel ${isDarkMode ? "dark" : ""}`}>
      <div className="chatgpt-panel-header">
        <MessageSquare size={18} />
        <span>Import Conversations Metadata</span>
      </div>

      <div className="chatgpt-panel-tabs">
        <button
          className={`chatgpt-panel-tab ${activeTab === "chatgpt" ? "active" : ""}`}
          onClick={() => setActiveTab("chatgpt")}
        >
          ChatGPT Import
        </button>
        <button
          className={`chatgpt-panel-tab ${activeTab === "conversations" ? "active" : ""}`}
          onClick={() => setActiveTab("conversations")}
        >
          Conversations Metadata Import
        </button>
      </div>

      <div className="chatgpt-panel-content">
        {activeTab === "chatgpt" ? (
          // ChatGPT Import Tab
          <>
            <p className="chatgpt-description">
              Import shared ChatGPT conversations to create a network of
              interconnected messages as graph nodes.
            </p>

            <div className="import-options">
              <label className="option-checkbox">
                <input
                  type="checkbox"
                  checked={createMessageNodes}
                  onChange={(e) => setCreateMessageNodes(e.target.checked)}
                />
                <span className="checkbox-label">
                  Create individual nodes for each message
                </span>
              </label>

              <div className="downsample-control">
                <label htmlFor="downsample-slider">
                  Downsample conversations: {downsamplePercent}%
                </label>
                <input
                  id="downsample-slider"
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={downsamplePercent}
                  onChange={(e) =>
                    setDownsamplePercent(parseInt(e.target.value))
                  }
                  className="downsample-slider"
                />
                <span className="downsample-hint">
                  {downsamplePercent < 100
                    ? `Import approximately ${downsamplePercent}% of conversations`
                    : "Import all conversations"}
                </span>
              </div>
            </div>

            <div className="chatgpt-url-container">
              <input
                type="text"
                className="chatgpt-url-input"
                placeholder="https://chatgpt.com/share/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button
                className="chatgpt-import-button"
                onClick={handleImport}
                disabled={isLoading || !url.trim()}
              >
                {isLoading ? "Importing..." : "Import"}
              </button>
            </div>

            <div className="chatgpt-file-import">
              <p className="chatgpt-or">Or import from file</p>
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                style={{ display: "none" }}
                ref={fileInputRef}
              />
              <button
                className="chatgpt-file-button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <FileJson size={16} />
                Select JSON File
              </button>
            </div>

            {recentImports.length > 0 && (
              <div className="chatgpt-recent">
                <h4>Recent Imports</h4>
                <ul className="chatgpt-recent-list">
                  {recentImports.map((recentUrl, index) => {
                    // Extract the ID from the URL for display
                    const urlId = recentUrl.split("/").pop();
                    return (
                      <li key={index} className="chatgpt-recent-item">
                        <button
                          className="chatgpt-recent-button"
                          onClick={() => setUrl(recentUrl)}
                          title={recentUrl}
                        >
                          <MessageSquare size={14} />
                          <span>{urlId}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        ) : (
          // Conversations Import Tab
          <>
            <p className="chatgpt-description">
              Import conversations metadata from JSON files to analyze
              relationships between topics and keywords. Creates nodes for
              conversations and links them to matching nodes in your graph.
            </p>

            <div className="import-options">
              <h4>Import Options</h4>

              <label className="option-checkbox">
                <input
                  type="checkbox"
                  checked={createTopicNodes}
                  onChange={(e) => setCreateTopicNodes(e.target.checked)}
                />
                <span className="checkbox-label">Create topic nodes</span>
              </label>

              <label className="option-checkbox">
                <input
                  type="checkbox"
                  checked={createKeywordNodes}
                  onChange={(e) => setCreateKeywordNodes(e.target.checked)}
                />
                <span className="checkbox-label">Create keyword nodes</span>
              </label>

              <div className="keyword-threshold-control">
                <label htmlFor="keyword-threshold">
                  Minimum keyword occurrences: {minKeywordOccurrences}
                </label>
                <input
                  id="keyword-threshold"
                  type="range"
                  min="1"
                  max="10"
                  value={minKeywordOccurrences}
                  onChange={(e) =>
                    setMinKeywordOccurrences(parseInt(e.target.value))
                  }
                  className="keyword-threshold-slider"
                  disabled={!createKeywordNodes}
                />
                <span className="keyword-threshold-hint">
                  Only create keyword nodes that appear in at least{" "}
                  {minKeywordOccurrences} conversations
                </span>
              </div>
            </div>

            <div className="conversations-file-import">
              <input
                type="file"
                accept=".json"
                onChange={handleConversationsMetadataImport}
                style={{ display: "none" }}
                ref={conversationsFileInputRef}
              />
              <button
                className="conversations-file-button"
                onClick={() => conversationsFileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Workflow size={16} />
                Select Conversations JSON File
              </button>

              <div className="file-format-note">
                <strong>Expected format:</strong>
                <p>
                  JSON file with conversation objects containing title,
                  metadata, topics, and keywords
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
