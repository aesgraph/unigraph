import { X } from "lucide-react";
import React, { useEffect } from "react";
import { NodeId } from "../core/model/Node";
import useAppConfigStore from "../store/appConfigStore";
import { useDocument, useDocumentStore } from "../store/documentStore";
import "./NodeDocumentEditor.css";
import LexicalEditorV2 from "./applets/Lexical/LexicalEditor";

interface NodeDocumentEditorProps {
  nodeId: NodeId;
  onClose: () => void;
}

const NodeDocumentEditor: React.FC<NodeDocumentEditorProps> = ({
  nodeId,
  onClose,
}) => {
  const { currentSceneGraph } = useAppConfigStore();

  // Safer node lookup with validation
  const node = nodeId ? currentSceneGraph.getNodeById(nodeId) : null;

  if (!node && nodeId) {
    console.error(
      `NodeDocumentEditor: Node with ID "${nodeId}" not found in SceneGraph`
    );
    console.log(
      "Available node IDs:",
      Array.from(currentSceneGraph.getNodes().getIds())
    );
  }

  const document = useDocument(nodeId);
  const { createDocument, updateDocument } = useDocumentStore();

  // Get node details with safer fallbacks
  const nodeLabel = node?.getLabel() || `Node ${nodeId || "Unknown"}`;
  const nodeType = node?.getType() || "Unknown";
  const nodeTags = Array.from(node?.getTags() || []);

  // Initialize document if it doesn't exist
  useEffect(() => {
    if (!nodeId) {
      console.error("Cannot create document for undefined nodeId");
      return;
    }

    if (!document) {
      console.log("Creating new document for node:", nodeId);
      createDocument(nodeId);
    } else if (
      nodeTags.length > 0 &&
      (!document.tags || document.tags.length === 0)
    ) {
      // Initialize tags from node if document doesn't have any
      console.log("Initializing document tags from node:", nodeId);
      updateDocument(nodeId, document.content, document.lexicalState, nodeTags);
    }
  }, [nodeId, document, createDocument, updateDocument, nodeTags]);

  // Add error state for missing nodeId
  if (!nodeId) {
    return (
      <div className="node-document-editor">
        <div className="node-document-header">
          <div className="node-document-title">
            <h2>Error: Missing Node ID</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="node-document-loading">
          Cannot open document editor: Node ID is undefined
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="node-document-editor">
        <div className="node-document-header">
          <div className="node-document-title">
            <h2>{nodeLabel}</h2>
            <span className="node-document-type">{nodeType}</span>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="node-document-loading">Initializing document...</div>
      </div>
    );
  }

  const handleSave = (content: string, tags?: string[]) => {
    // This is called when the user explicitly clicks Save
    const mergedTags = tags?.length ? tags : nodeTags;
    updateDocument(nodeId, content, document.lexicalState, mergedTags);
  };

  return (
    <div className="node-document-editor">
      <div className="node-document-header">
        <div className="node-document-title">
          <h2>{nodeLabel}</h2>
          <span className="node-document-type">{nodeType}</span>
        </div>
        <div className="node-document-actions">
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </div>

      {nodeTags.length > 0 && (
        <div className="node-document-tags">
          {nodeTags.map((tag) => (
            <span key={tag} className="node-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="node-document-content">
        <LexicalEditorV2
          id={nodeId}
          initialContent={document.content}
          onSave={handleSave}
          autoSaveInterval={10000}
        />
      </div>
    </div>
  );
};

export default NodeDocumentEditor;
