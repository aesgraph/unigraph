import { FileJson, UploadCloud } from "lucide-react";
import React, { useRef, useState } from "react";
import useAppConfigStore from "../../../store/appConfigStore";
import { addNotification } from "../../../store/notificationStore";
import "./ChatGptImporter.css";
import {
  importChatGptConversation,
  importChatGptFromFile,
} from "./chatGptImportUtils";

interface ChatGptImporterProps {
  onClose: () => void;
  isDarkMode?: boolean;
}

const ChatGptImporter: React.FC<ChatGptImporterProps> = ({
  onClose,
  isDarkMode = false,
}) => {
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"url" | "file">("url");
  const { currentSceneGraph } = useAppConfigStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        currentSceneGraph
      );
      if (conversationNodeId) {
        // Success notification is already handled in the import function
        onClose();
      }
    } catch (error) {
      console.error("Error in ChatGPT import:", error);
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
        currentSceneGraph
      );
      if (conversationNodeId) {
        // Success notification is handled in the import function
        onClose();
      }
    } catch (error) {
      console.error("Error importing ChatGPT file:", error);
    } finally {
      setIsLoading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`chatgpt-importer ${isDarkMode ? "dark" : ""}`}>
      <div className="chatgpt-importer-header">
        <h2>Import ChatGPT Conversation</h2>
        <button onClick={onClose} className="close-button">
          ×
        </button>
      </div>

      <div className="chatgpt-importer-content">
        <div className="chatgpt-tabs">
          <button
            className={`chatgpt-tab ${activeTab === "url" ? "active" : ""}`}
            onClick={() => setActiveTab("url")}
          >
            Import from URL
          </button>
          <button
            className={`chatgpt-tab ${activeTab === "file" ? "active" : ""}`}
            onClick={() => setActiveTab("file")}
          >
            Import from File
          </button>
        </div>

        {activeTab === "url" ? (
          <>
            <p>
              Enter a ChatGPT share URL to import the conversation as nodes.
              Each message will be created as a separate node in the graph, and
              a formatted document containing the entire conversation will be
              attached to the parent node.
            </p>

            <div className="url-input-container">
              <input
                type="text"
                placeholder="https://chatgpt.com/share/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="url-input"
              />
            </div>

            <div className="example-text">
              Example:
              https://chatgpt.com/share/67e72a54-8c18-8011-947d-43f368e9a541
            </div>

            <div className="buttons-container">
              <button
                className="cancel-button"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="import-button"
                onClick={handleImport}
                disabled={isLoading}
              >
                {isLoading ? "Importing..." : "Import Conversation"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p>
              Select a JSON file containing ChatGPT conversation data. Supports
              OpenAIs export format or custom JSON.
              <br />
              <small>
                Note: Empty messages will be skipped. A formatted document with
                all messages will be created on the conversation parent node.
              </small>
            </p>

            <div className="file-upload-container">
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                ref={fileInputRef}
                style={{ display: "none" }}
              />
              <div className="file-upload-box" onClick={triggerFileInput}>
                <FileJson size={32} />
                <p>Click to select JSON file</p>
              </div>
              <div className="file-format-note">
                <strong>Supported formats:</strong>
                <ul>
                  <li>OpenAIs official conversation exports</li>
                  <li>JSON with messages array</li>
                </ul>
              </div>
            </div>

            <div className="buttons-container">
              <button
                className="cancel-button"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="browse-button"
                onClick={triggerFileInput}
                disabled={isLoading}
              >
                <UploadCloud size={16} />
                Browse Files
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatGptImporter;
