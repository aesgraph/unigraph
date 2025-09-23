import { getColor, useTheme } from "@aesgraph/app-shell";
import Editor from "@monaco-editor/react";
import { Edit3, Save, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { updateDocument } from "../../api/documentsApi";
import { checkFileWritable, saveMarkdownFile } from "../../api/filesApi";
import { SceneGraph } from "../../core/model/SceneGraph";
import "./EditableMarkdownViewer.css";
import MarkdownViewer from "./MarkdownViewer";

interface EditableMarkdownViewerProps {
  filename: string;
  documentId?: string; // Document ID for saving
  initialContent?: string;
  overrideMarkdown?: string;
  imageStyle?: React.CSSProperties;
  sceneGraph?: SceneGraph;
  onAnnotate?: (selectedText: string) => void;
  showRawToggle?: boolean;
  readOnly?: boolean;
}

export default function EditableMarkdownViewer({
  filename,
  documentId,
  initialContent = "",
  overrideMarkdown,
  imageStyle,
  sceneGraph,
  onAnnotate,
  showRawToggle = false,
  readOnly = false,
}: EditableMarkdownViewerProps) {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [originalContent, setOriginalContent] = useState(initialContent);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFileWritable, setIsFileWritable] = useState(false);

  // Update content when initial content changes
  useEffect(() => {
    setContent(initialContent);
    setOriginalContent(initialContent);
    setHasUnsavedChanges(false);
  }, [initialContent]);

  // Check if file is writable when filename changes
  useEffect(() => {
    if (filename && !documentId) {
      checkFileWritable(filename).then(setIsFileWritable);
    } else {
      setIsFileWritable(!!documentId); // If we have documentId, we can save via database
    }
  }, [filename, documentId]);

  // Fetch content from file if no initial content provided
  useEffect(() => {
    if (!initialContent && !overrideMarkdown && filename) {
      fetch(filename)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load ${filename}`);
          }
          return response.text();
        })
        .then((text) => {
          setContent(text);
          setOriginalContent(text);
          setHasUnsavedChanges(false);
        })
        .catch((err) => {
          console.error("Error loading file:", err);
          setError(`Failed to load ${filename}`);
        });
    }
  }, [filename, initialContent, overrideMarkdown]);

  // Handle content changes in editor - simplified approach
  const handleContentChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        setContent(value);
        setHasUnsavedChanges(value !== originalContent);
        setError(null);
      }
    },
    [originalContent]
  );

  // Handle save
  const handleSave = useCallback(async () => {
    if (!hasUnsavedChanges) return;

    // Check if we can save (either have documentId or writable file)
    if (!documentId && !isFileWritable) {
      setError("File is not writable or no document ID provided.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (documentId) {
        // Save to database
        await updateDocument({
          id: documentId,
          content: content,
        });
        console.log(`Saved document ${documentId}`);
      } else if (filename) {
        // Save to filesystem
        const result = await saveMarkdownFile({
          filePath: filename,
          content: content,
        });

        if (!result.success) {
          throw new Error(result.message);
        }
        console.log(`Saved file ${filename}`);
      } else {
        throw new Error("No document ID or filename provided for saving.");
      }

      setOriginalContent(content);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (err) {
      console.error("Error saving:", err);
      setError(
        `Failed to save. ${err instanceof Error ? err.message : "Please try again."}`
      );
    } finally {
      setIsSaving(false);
    }
  }, [documentId, filename, isFileWritable, content, hasUnsavedChanges]);

  // Handle enter edit mode
  const handleStartEdit = useCallback(() => {
    if (!readOnly && (documentId || isFileWritable)) {
      setIsEditing(true);
    }
  }, [readOnly, documentId, isFileWritable]);

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmDiscard = window.confirm(
        "You have unsaved changes. Are you sure you want to discard them?"
      );
      if (!confirmDiscard) return;
    }

    setContent(originalContent);
    setHasUnsavedChanges(false);
    setIsEditing(false);
    setError(null);
  }, [hasUnsavedChanges, originalContent]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditing && (event.metaKey || event.ctrlKey)) {
        if (event.key === "s") {
          event.preventDefault();
          handleSave();
        } else if (event.key === "Escape") {
          event.preventDefault();
          handleCancelEdit();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, handleSave, handleCancelEdit]);

  // Get the title from filename
  const getTitle = () => {
    const cleanFilename = filename
      .replace(/^\/markdowns\//, "")
      .replace(/\.md$/, "");
    return cleanFilename.split("/").pop() || "Document";
  };

  if (isEditing) {
    return (
      <div className="editable-markdown-container">
        {/* Header with title and controls */}
        <div
          className="editable-markdown-header"
          style={{
            backgroundColor: getColor(theme.colors, "backgroundSecondary"),
            borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
          }}
        >
          <div className="editable-markdown-title">
            <h2 style={{ color: getColor(theme.colors, "text") }}>
              {getTitle()}
              {hasUnsavedChanges && (
                <span
                  className="unsaved-indicator"
                  style={{
                    color: getColor(theme.colors, "error"),
                    fontSize: "24px",
                    fontWeight: "900",
                    marginLeft: "8px",
                    textShadow: "0 0 4px rgba(255, 0, 0, 0.5)",
                  }}
                  title="Unsaved changes"
                >
                  ●
                </span>
              )}
            </h2>
            {lastSaved && (
              <span
                className="last-saved"
                style={{ color: getColor(theme.colors, "textSecondary") }}
              >
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="editable-markdown-actions">
            <button
              onClick={handleSave}
              disabled={
                !hasUnsavedChanges ||
                isSaving ||
                (!documentId && !isFileWritable)
              }
              className="save-button"
              style={{
                backgroundColor: hasUnsavedChanges
                  ? getColor(theme.colors, "primary")
                  : getColor(theme.colors, "surface"),
                color: hasUnsavedChanges
                  ? getColor(theme.colors, "textInverse")
                  : getColor(theme.colors, "textSecondary"),
                border: `1px solid ${getColor(theme.colors, "border")}`,
              }}
              title="Save (Ctrl+S)"
            >
              <Save size={16} />
              {isSaving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={handleCancelEdit}
              className="cancel-button"
              style={{
                backgroundColor: getColor(theme.colors, "surface"),
                color: getColor(theme.colors, "text"),
                border: `1px solid ${getColor(theme.colors, "border")}`,
              }}
              title="Cancel (Esc)"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="editable-markdown-error"
            style={{
              backgroundColor: getColor(theme.colors, "surface"),
              color: getColor(theme.colors, "error"),
              borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
            }}
          >
            {error}
          </div>
        )}

        {/* Monaco Editor */}
        <div className="editable-markdown-editor">
          <Editor
            key={`editor-${filename}-${isEditing}`}
            height="100%"
            language="markdown"
            theme="vs-dark"
            value={content}
            onChange={handleContentChange}
            loading={null}
            options={{
              wordWrap: "on",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              fontSize: 14,
              lineNumbers: "on",
              folding: true,
              renderWhitespace: "selection",
              // Performance optimizations to prevent flickering
              quickSuggestions: false,
              suggestOnTriggerCharacters: false,
              acceptSuggestionOnEnter: "off",
              tabCompletion: "off",
              wordBasedSuggestions: "off",
              // Disable features that can cause re-renders
              hover: { enabled: false },
              selectionHighlight: false,
              // Smoother editing experience
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "off",
            }}
          />
        </div>
      </div>
    );
  }

  // Preview mode - use existing MarkdownViewer
  return (
    <div className="editable-markdown-container">
      {/* Header with title and edit button */}
      {!readOnly && (documentId || isFileWritable) && (
        <div
          className="editable-markdown-header preview"
          style={{
            backgroundColor: getColor(theme.colors, "backgroundSecondary"),
            borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
          }}
        >
          <div className="editable-markdown-title">
            <h2 style={{ color: getColor(theme.colors, "text") }}>
              {getTitle()}
            </h2>
          </div>

          <div className="editable-markdown-actions">
            <button
              onClick={handleStartEdit}
              className="edit-button"
              style={{
                backgroundColor: getColor(theme.colors, "surface"),
                color: getColor(theme.colors, "text"),
                border: `1px solid ${getColor(theme.colors, "border")}`,
              }}
              title="Edit document"
            >
              <Edit3 size={16} />
              Edit
            </button>
          </div>
        </div>
      )}

      {/* MarkdownViewer for preview */}
      <div className="editable-markdown-preview">
        <MarkdownViewer
          filename={filename}
          overrideMarkdown={overrideMarkdown || content}
          imageStyle={imageStyle}
          sceneGraph={sceneGraph}
          onAnnotate={onAnnotate}
          showRawToggle={showRawToggle}
        />
      </div>
    </div>
  );
}
