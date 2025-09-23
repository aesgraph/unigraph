import { getColor, useTheme } from "@aesgraph/app-shell";
import Editor from "@monaco-editor/react";
import { Box, Typography } from "@mui/material";
import { debounce } from "lodash";
import {
  Download,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  Save,
  Search,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createDocument,
  deleteDocument,
  deleteDocumentRecursive,
  getDocument,
  updateDocument,
} from "../../api/documentsApi";
import { addNotification } from "../../store/notificationStore";
import LexicalEditorV3 from "../applets/Lexical/LexicalEditorV3";
import DocumentContentSearch, {
  DocumentSearchResult,
} from "../common/DocumentContentSearch";
import FileTreeView, { FileTreeInstance } from "../common/FileTreeView";
import MarkdownViewer from "../common/MarkdownViewer";
import "../common/MarkdownViewer.css";
import ResizableSplitter from "../common/ResizableSplitter";
import "./DocumentationView.css";
import PdfJsViewer from "./PdfJsViewer";

// Add CSS animation for pulsing dot
const pulseAnimation = `
  @keyframes pulse {
    0%, 100% { 
      opacity: 1; 
      transform: scale(1); 
    }
    25%, 75% { 
      opacity: 0.7; 
      transform: scale(1.2); 
    }
    50% { 
      opacity: 1; 
      transform: scale(1); 
    }
  }
`;

// Inject the animation into the document head
if (
  typeof document !== "undefined" &&
  !document.getElementById("pulse-animation")
) {
  const style = document.createElement("style");
  style.id = "pulse-animation";
  style.textContent = pulseAnimation;
  document.head.appendChild(style);
}

interface DocumentEditorViewProps {
  initialContent?: string;
  filename?: string;
  theme?: "dark" | "light";
  height?: string | number;
  showPreview?: boolean;
  onSave?: (content: string) => void;
  onLoad?: () => string;
  userId?: string;
  projectId?: string;
  documentId?: string;
}

const defaultMarkdownContent = `# Welcome to Document Editor

This is a document editor that supports both markdown (.md) and text (.txt) files.

## Features

- **Multi-format Support**: Edit .md files (with Monaco) and .txt files (with Lexical)
- **Live Preview**: See your markdown rendered in real-time (for .md files)
- **Syntax Highlighting**: Full markdown syntax support (for .md files)
- **Rich Text Editing**: Advanced text editing features (for .txt files)
- **File Operations**: Save and load documents with proper extensions

## Getting Started

1. Start typing in the editor
2. Use markdown syntax like \`**bold**\`, \`*italic*\`, \`# headings\`
3. See the preview update in real-time
4. Toggle preview visibility with the eye icon

## Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, Markdown!");
}
\`\`\`

## Lists

- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3

## Links and Images

[Visit GitHub](https://github.com)

![Example Image](https://via.placeholder.com/300x200)

---

*Happy editing!*`;

// Helper function to determine file type based on extension
const getFileType = (filename: string): "markdown" | "text" => {
  const extension = filename.toLowerCase().split(".").pop();
  return extension === "txt" ? "text" : "markdown";
};

// Monaco Document Editor component with smooth content switching
const MonacoDocumentEditor: React.FC<{
  filename: string;
  documentId: string | null;
  theme: string;
  onLastSavedChange: (date: Date | null) => void;
  showPreview?: boolean;
  onTogglePreview?: () => void;
}> = ({
  filename: _filename,
  documentId,
  theme,
  onLastSavedChange,
  showPreview = false,
  onTogglePreview,
}) => {
  const [content, setContent] = useState("");
  const [_isLoading, setIsLoading] = useState(false);
  const [splitterWidth, setSplitterWidth] = useState(400);

  // Use refs to avoid stale closures in debounced functions
  const contentRef = React.useRef<string>("");

  // Load content from server with smooth transitions
  useEffect(() => {
    if (!documentId) return;

    // Load from server but keep current content visible
    setIsLoading(true);
    getDocument(documentId)
      .then((document) => {
        const documentContent = document.content || "";
        console.log("MonacoEditor: Loaded content from server:", {
          documentId,
          contentLength: documentContent.length,
        });

        // Only update content once it's loaded (no flash)
        setContent(documentContent);
        contentRef.current = documentContent;
      })
      .catch((error) => {
        console.error("MonacoEditor: Error loading document:", error);
        // Don't clear content on error - keep current content visible
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [documentId]);

  // Debounced save function
  const saveToServer = React.useMemo(
    () =>
      debounce(async (contentToSave: string) => {
        if (!documentId) return;

        try {
          console.log("MonacoEditor: Saving to server:", {
            documentId,
            contentLength: contentToSave.length,
          });

          await updateDocument({
            id: documentId,
            content: contentToSave,
          });

          const now = new Date();
          onLastSavedChange(now); // Update parent component
          console.log(
            "MonacoEditor: Successfully saved to server at",
            now.toLocaleTimeString()
          );
        } catch (error) {
          console.error("MonacoEditor: Error saving to server:", error);
        }
      }, 500), // 0.5 second debounce
    [documentId, onLastSavedChange]
  );

  // Handle content changes
  const handleContentChange = React.useCallback(
    (value: string | undefined) => {
      const newContent = value || "";
      const previousContent = contentRef.current;

      setContent(newContent);
      contentRef.current = newContent;

      // Only save if content actually changed
      if (newContent !== previousContent) {
        console.log("MonacoEditor: Content changed:", {
          contentLength: newContent.length,
          preview: newContent.substring(0, 50) + "...",
        });

        // Trigger autosave
        saveToServer(newContent);
      }
    },
    [saveToServer]
  );

  // Save on unmount
  useEffect(() => {
    return () => {
      console.log("MonacoEditor: Component unmounting, forcing save");
      saveToServer.flush();
    };
  }, [saveToServer]);

  // Don't show loading state - keep previous content visible while loading new content

  // Handle save button click
  const handleSave = React.useCallback(() => {
    if (content) {
      saveToServer(content);
    }
  }, [content, saveToServer]);

  // Handle download button click
  const handleDownload = React.useCallback(() => {
    if (content) {
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Use the filename as-is, don't add .md if it already has an extension
      const downloadName =
        _filename && _filename.includes(".")
          ? _filename
          : `${_filename || "document"}.md`;

      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [content, _filename]);

  return (
    <div style={{ position: "relative", height: "100%" }}>
      {showPreview ? (
        // Side-by-side layout with splitter
        <ResizableSplitter
          leftPanel={
            <div style={{ position: "relative", height: "100%" }}>
              {/* Toolbar */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  zIndex: 10,
                  display: "flex",
                  gap: "8px",
                  padding: "8px",
                  backgroundColor: "transparent",
                  margin: "8px",
                }}
              >
                <button
                  onClick={handleSave}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px",
                    border: "none",
                    outline: "none",
                    borderRadius: "4px",
                    backgroundColor: "transparent",
                    color: "var(--color-text)",
                    cursor: "pointer",
                  }}
                  title="Save document"
                >
                  <Save size={16} />
                </button>
                <button
                  onClick={handleDownload}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px",
                    border: "none",
                    outline: "none",
                    borderRadius: "4px",
                    backgroundColor: "transparent",
                    color: "var(--color-text)",
                    cursor: "pointer",
                  }}
                  title="Download as Markdown"
                >
                  <Download size={16} />
                </button>
                {onTogglePreview && (
                  <button
                    onClick={onTogglePreview}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "8px",
                      border: "none",
                      outline: "none",
                      borderRadius: "4px",
                      backgroundColor: "transparent",
                      color: "var(--color-text)",
                      cursor: "pointer",
                    }}
                    title={showPreview ? "Hide preview" : "Show preview"}
                  >
                    {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
              <Editor
                height="100%"
                language="markdown"
                value={content}
                onChange={handleContentChange}
                theme={theme}
                options={{
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  wordWrap: "on",
                  fontSize: 14,
                  fontFamily:
                    "Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
                  padding: { top: 16, bottom: 16 },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  renderWhitespace: "selection",
                  bracketPairColorization: { enabled: true },
                  suggest: {
                    showKeywords: false,
                    showSnippets: false,
                  },
                }}
              />
            </div>
          }
          rightPanel={
            <div
              style={{
                height: "100%",
                overflow: "auto",
                padding: "16px",
              }}
              className="documentation-content"
            >
              <MarkdownViewer
                filename="preview.md"
                overrideMarkdown={content}
              />
            </div>
          }
          leftPanelWidth={splitterWidth}
          onWidthChange={setSplitterWidth}
          minLeftWidth={200}
          maxLeftWidth={800}
          splitterWidth={6}
        />
      ) : (
        // Single editor layout
        <div style={{ position: "relative", height: "100%" }}>
          {/* Toolbar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              zIndex: 10,
              display: "flex",
              gap: "8px",
              padding: "8px",
              backgroundColor: "transparent",
              margin: "8px",
            }}
          >
            <button
              onClick={handleSave}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
                border: "none",
                outline: "none",
                borderRadius: "4px",
                backgroundColor: "transparent",
                color: "var(--color-text)",
                cursor: "pointer",
              }}
              title="Save document"
            >
              <Save size={16} />
            </button>
            <button
              onClick={handleDownload}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
                border: "none",
                outline: "none",
                borderRadius: "4px",
                backgroundColor: "transparent",
                color: "var(--color-text)",
                cursor: "pointer",
              }}
              title="Download as Markdown"
            >
              <Download size={16} />
            </button>
            {onTogglePreview && (
              <button
                onClick={onTogglePreview}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                  border: "none",
                  outline: "none",
                  borderRadius: "4px",
                  backgroundColor: "transparent",
                  color: "var(--color-text)",
                  cursor: "pointer",
                }}
                title={showPreview ? "Hide preview" : "Show preview"}
              >
                {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
          </div>
          <Editor
            height="100%"
            language="markdown"
            value={content}
            onChange={handleContentChange}
            theme={theme}
            options={{
              minimap: { enabled: false },
              lineNumbers: "on",
              wordWrap: "on",
              fontSize: 14,
              fontFamily:
                "Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              renderWhitespace: "selection",
              bracketPairColorization: { enabled: true },
              suggest: {
                showKeywords: false,
                showSnippets: false,
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

const DocumentEditorContent: React.FC<{
  selectedFile: string;
  selectedFilename: string;
  documentId: string | null;
  showPreview: boolean;
  onTogglePreview: () => void;
  theme: any;
  onLastSavedChange: (date: Date | null) => void;
}> = ({
  selectedFile,
  selectedFilename,
  documentId,
  showPreview,
  onTogglePreview: _onTogglePreview,
  theme,
  onLastSavedChange,
}) => {
  // Determine Monaco theme based on app shell background color luminance
  const getMonacoTheme = () => {
    const backgroundColor = getColor(theme.colors, "background");

    // Function to calculate luminance from a color string
    const getLuminance = (color: string): number => {
      // Handle rgba/rgb color strings
      const rgbaMatch = color.match(
        /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
      );
      if (rgbaMatch) {
        const [, r, g, b] = rgbaMatch.map(Number);
        return calculateLuminance(r, g, b);
      }

      // Handle hex colors
      const hexMatch = color.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
      if (hexMatch) {
        const r = parseInt(hexMatch[1], 16);
        const g = parseInt(hexMatch[2], 16);
        const b = parseInt(hexMatch[3], 16);
        return calculateLuminance(r, g, b);
      }

      // Check for shorter hex format (#fff)
      const shortHexMatch = color.match(/^#([a-f\d])([a-f\d])([a-f\d])$/i);
      if (shortHexMatch) {
        const [, r, g, b] = shortHexMatch
          .slice(1)
          .map((hex) => parseInt(hex + hex, 16));
        return calculateLuminance(r, g, b);
      }

      // Default to dark if we can't parse the color
      return 0;
    };

    // Calculate relative luminance using the standard formula
    const calculateLuminance = (r: number, g: number, b: number): number => {
      const [rs, gs, bs] = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const luminance = getLuminance(backgroundColor);

    // Use a lower threshold (0.1) to better detect dark themes
    // Most dark themes have very low luminance (< 0.1)
    return luminance < 0.1 ? "vs-dark" : "vs";
  };

  // Determine file type and editor to use
  const filename = selectedFilename || "";
  const fileType = getFileType(filename);
  const isTextFile = fileType === "text";
  const isPdfFile = (selectedFilename || "").toLowerCase().endsWith(".pdf");

  // Debug logging
  console.log("DocumentEditorContent: File type detection:", {
    selectedFile,
    selectedFilename,
    filename,
    fileType,
    isTextFile,
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "row", height: "100%" }}>
      {/* Editor */}
      <Box
        sx={{
          flex: showPreview ? 1 : 1,
          overflow: "hidden",
          borderRight: showPreview ? 1 : 0,
          borderColor: getColor(theme.colors, "border"),
        }}
      >
        {isPdfFile ? (
          documentId ? (
            <PdfJsViewer documentId={documentId} />
          ) : (
            <div>No PDF selected</div>
          )
        ) : isTextFile ? (
          documentId ? (
            (() => {
              console.log(
                "DocumentEditorView: Rendering LexicalEditorV3 with props:",
                { documentId }
              );
              return (
                <LexicalEditorV3
                  documentId={documentId}
                  onLastSavedChange={onLastSavedChange}
                />
              );
            })()
          ) : (
            <div>No document selected</div>
          )
        ) : (
          <MonacoDocumentEditor
            filename={selectedFile}
            documentId={documentId}
            theme={getMonacoTheme()}
            onLastSavedChange={onLastSavedChange}
            showPreview={showPreview}
            onTogglePreview={_onTogglePreview}
          />
        )}
      </Box>
    </Box>
  );
};

export const DocumentEditorView: React.FC<DocumentEditorViewProps> = ({
  initialContent = defaultMarkdownContent,
  filename = "document.txt",
  theme: _theme = "dark",
  height: _height = "100%",
  showPreview: _showPreview = true,
  onSave,
  onLoad: _onLoad,
  userId,
  projectId,
  documentId: initialDocumentId,
}) => {
  const { theme } = useTheme();
  const [content, setContent] = useState<string>(initialContent);
  const [_originalContent, setOriginalContent] =
    useState<string>(initialContent);
  const [showPreview, setShowPreview] = useState<boolean>(_showPreview);
  const [_previewToggleCount, setPreviewToggleCount] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [sidebarMode, setSidebarMode] = useState<"tree" | "search">("tree");
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [_isAutoSaving, setIsAutoSaving] = useState(false);
  const [_error, _setError] = useState<string | null>(null);

  // Auto-load document if documentId is provided
  useEffect(() => {
    if (initialDocumentId) {
      setIsLoading(true);
      getDocument(initialDocumentId)
        .then((document) => {
          const fullFilename = `${document.title}.${document.extension}`;
          console.log("DocumentEditorView: Auto-loading document:", {
            documentId: initialDocumentId,
            title: document.title,
            extension: document.extension,
            fullFilename,
          });
          setSelectedFile(`/documents/${document.id}`);
          setSelectedFilename(fullFilename);
          setContent(document.content || "");
          setOriginalContent(document.content || "");
          setCurrentDocumentId(document.id);
          setHasUnsavedChanges(false);
        })
        .catch((error) => {
          console.error("Error auto-loading document:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [initialDocumentId]);

  // Create document editor file tree instance
  const documentEditorInstance: FileTreeInstance = useMemo(
    () => ({
      id: "document-editor",
      name: "Files",
      dataSource: {
        id: "supabase-documents",
        name: "Supabase Documents",
        type: "supabase",
        config: {
          userId,
          projectId,
        },
      },
      rootPath: "/documents",
      hideEmptyFolders: true,
      onFileSelect: async (
        filePath: string,
        metadata?: Record<string, any>
      ) => {
        console.log("Selected file:", filePath, "Metadata:", metadata);

        if (metadata?.documentId) {
          setIsLoading(true);
          try {
            const document = await getDocument(metadata.documentId);
            // Set selectedFile with the full filePath for proper highlighting
            const fullFilename = `${document.title}.${document.extension}`;
            console.log("DocumentEditorView: File selection debug:", {
              filePath,
              documentTitle: document.title,
              documentExtension: document.extension,
              fullFilename,
            });
            setSelectedFile(filePath);
            setSelectedFilename(fullFilename);

            // Always update content to ensure we have the latest version
            const loadedContent = document.content || "";
            console.log("DocumentEditorView: Loading server content:", {
              documentId: document.id,
              filename: filename,
              contentLength: loadedContent.length,
              contentPreview: loadedContent.substring(0, 100) + "...",
            });
            // If PDF, do not load into text editor; just set currentDocumentId and preview state
            if ((document.extension || "").toLowerCase() === "pdf") {
              setCurrentDocumentId(document.id);
              setHasUnsavedChanges(false);
              // Do not modify text content for PDFs
            } else {
              setContent(loadedContent);
              setOriginalContent(loadedContent);
              setCurrentDocumentId(document.id);
              setHasUnsavedChanges(false);
            }

            // Clear autosave timeout and reset reference when switching files
            if (autoSaveTimeoutRef.current) {
              clearTimeout(autoSaveTimeoutRef.current);
            }
            lastAutoSavedContentRef.current = loadedContent;
            console.log("Loaded document:", document);
          } catch (error) {
            console.error("Error loading document:", error);
            // Fallback to default content
            setContent(defaultMarkdownContent);
            setOriginalContent(defaultMarkdownContent);
            setCurrentDocumentId(null);
            setHasUnsavedChanges(false);
          } finally {
            setIsLoading(false);
          }
        } else {
          // No document ID, use default content
          setContent(defaultMarkdownContent);
          setOriginalContent(defaultMarkdownContent);
          setCurrentDocumentId(null);
          setHasUnsavedChanges(false);
        }
      },
      // onRenameNode handled below (single definition)
      onCreateDocument: async (
        title: string,
        parentId?: string,
        extension: string = "txt"
      ) => {
        try {
          // Set initial content based on file type
          const initialContent =
            extension === "txt"
              ? `${title}\n\nStart writing your document here...`
              : `# ${title}\n\nStart writing your document here...`;

          const newDocument = await createDocument({
            title,
            content: initialContent,
            extension,
            metadata: {},
            data: {},
            project_id: projectId,
            parent_id: parentId,
          });
          console.log("Created new document:", newDocument);
          // The tree will refresh automatically when the parent component re-renders
        } catch (error) {
          console.error("Error creating document:", error);
          throw error;
        }
      },
      onCreateFolder: async (title: string, parentId?: string) => {
        try {
          // For folders, we create a document with "folder" extension
          const newFolder = await createDocument({
            title,
            content: `# ${title}\n\nThis is a folder. Add documents here.`,
            extension: "folder",
            metadata: { isFolder: true, type: "folder" },
            data: { type: "folder" },
            project_id: projectId,
            parent_id: parentId,
          });
          console.log("Created new folder:", newFolder);
          // The tree will refresh automatically when the parent component re-renders
        } catch (error) {
          console.error("Error creating folder:", error);
          throw error;
        }
      },
      onDeleteNode: async (
        filePath: string,
        metadata?: Record<string, any>
      ) => {
        const documentId = metadata?.documentId;
        if (!documentId) {
          console.error("No document ID found in metadata");
          return;
        }

        try {
          if (metadata.isFolder) {
            await deleteDocumentRecursive(documentId);
            console.log("Folder deleted recursively:", documentId);
          } else {
            await deleteDocument(documentId);
            console.log("Document deleted:", documentId);
          }

          if (currentDocumentIdRef.current === documentId) {
            setContent(defaultMarkdownContent);
            setCurrentDocumentId(null);
            setSelectedFile(null);
          }
        } catch (error) {
          console.error("Error deleting document/folder:", error);
          throw error;
        }
      },
      onRenameNode: async (
        filePath: string,
        newTitle: string,
        metadata?: Record<string, any>
      ) => {
        console.log("DocumentEditorView onRenameNode called with:", {
          filePath,
          newTitle,
          metadata,
        });

        const documentId = metadata?.documentId;
        if (!documentId) {
          console.error("No document ID found in metadata for rename");
          throw new Error("No document ID found in metadata");
        }

        try {
          // Parse the new title to extract extension if provided
          const parseFileName = (fileName: string) => {
            const lastDotIndex = fileName.lastIndexOf(".");
            if (lastDotIndex === -1 || lastDotIndex === 0) {
              // No extension found, or starts with dot (hidden file)
              return { title: fileName, extension: null };
            }

            const title = fileName.substring(0, lastDotIndex);
            const extension = fileName.substring(lastDotIndex + 1);

            // Only consider valid extensions we support editing
            if (["md", "txt", "pdf"].includes(extension.toLowerCase())) {
              return { title, extension: extension.toLowerCase() };
            }

            // If not a valid extension, treat the whole thing as title
            return { title: fileName, extension: null };
          };

          const { title, extension } = parseFileName(newTitle);
          console.log("Parsed filename:", { title, extension });

          // Prepare update data
          const updateData: any = { id: documentId, title };

          // If user provided a valid extension, update it too
          if (extension) {
            updateData.extension = extension;
          }

          console.log("Updating document with data:", updateData);

          // Update the document in Supabase
          await updateDocument(updateData);
          console.log(
            "Document renamed successfully:",
            documentId,
            "to",
            title,
            extension ? `with extension: ${extension}` : ""
          );

          // Update currently selected filename if applicable
          if (currentDocumentIdRef.current === documentId) {
            const finalExt = extension || (metadata?.extension as string) || "";
            const newName = finalExt ? `${title}.${finalExt}` : title;
            setSelectedFilename(newName);
          }

          // Emit event so Resource Manager refreshes
          try {
            const { emitDocumentEvent } = await import(
              "../../store/documentEventsStore"
            );
            emitDocumentEvent({
              type: "document:renamed",
              id: documentId,
              title,
              extension: extension || (metadata?.extension as string),
              projectId,
              parentId: (metadata?.parentId as string) ?? null,
            });
          } catch (e) {
            console.warn("Failed to emit document event", e);
          }
        } catch (error) {
          console.error("Error renaming document:", error);
          throw error;
        }
      },
    }),
    [userId, projectId, filename] // Removed currentDocumentId to prevent unnecessary FileTreeView re-renders
  );

  // Removed Sandpack-related code

  // Cleanup autosave timeout on unmount
  useEffect(() => {
    const autoSaveTimeout = autoSaveTimeoutRef.current;
    const debounceTimeout = debounceTimeoutRef.current;
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, []);

  // Add debouncing to prevent rapid state updates when typing quickly
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add autosave functionality
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAutoSavedContentRef = useRef<string>("");

  // Use ref to access current document ID in callbacks without causing re-renders
  const currentDocumentIdRef = useRef(currentDocumentId);
  currentDocumentIdRef.current = currentDocumentId;

  const handleTogglePreview = useCallback(() => {
    setShowPreview((prev) => {
      const newValue = !prev;
      // Increment toggle count to force re-render
      setPreviewToggleCount((count) => count + 1);
      return newValue;
    });
  }, []);

  const handleSave = useCallback(
    async (isAutoSave = false) => {
      if (!hasUnsavedChanges && !onSave) return;

      if (isAutoSave) {
        setIsAutoSaving(true);
      } else {
        setIsSaving(true);
      }

      try {
        if (onSave) {
          onSave(content);
        } else if (currentDocumentId) {
          // Save to Supabase
          await updateDocument({
            id: currentDocumentId,
            content,
          });

          // Update state after successful save
          setOriginalContent(content);
          setHasUnsavedChanges(false);

          // Update lastAutoSavedContent if this was an autosave
          if (isAutoSave) {
            lastAutoSavedContentRef.current = content;
          }
          console.log("Document saved to Supabase");
        } else {
          // Default save behavior - download file
          const blob = new Blob([content], { type: "text/markdown" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error("Error saving document:", error);
        addNotification({
          message: "Failed to save document",
          type: "error",
          groupId: "save-error",
        });
      } finally {
        if (isAutoSave) {
          setIsAutoSaving(false);
        } else {
          setIsSaving(false);
        }
      }
    },
    [content, filename, onSave, currentDocumentId, hasUnsavedChanges]
  );

  const handleWidthChange = useCallback((width: number) => {
    setSidebarWidth(width);
  }, []);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        handleSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  // Handle content search result selection
  const handleContentSearchResultSelect = useCallback(
    async (result: DocumentSearchResult) => {
      console.log("Content search result selected:", result);

      // Load the document from the search result
      if (result.document.id) {
        setIsLoading(true);
        try {
          const document = await getDocument(result.document.id);
          const loadedContent = document.content || "";
          setContent(loadedContent);
          setOriginalContent(loadedContent);
          setCurrentDocumentId(document.id);
          setHasUnsavedChanges(false);
          setSelectedFile(`${document.title}.${document.extension}`);

          // Clear autosave timeout and reset reference when switching files
          if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
          }
          lastAutoSavedContentRef.current = loadedContent;
          console.log("Loaded document from content search:", document);
        } catch (error) {
          console.error("Error loading document from content search:", error);
        } finally {
          setIsLoading(false);
        }
      }
    },
    []
  );

  const leftPanel = (
    <div
      className="documentation-sidebar"
      style={
        {
          backgroundColor: getColor(theme.colors, "backgroundSecondary"),
          borderRight: `1px solid ${getColor(theme.colors, "border")}`,
          height: "100%",
          "--border-color": getColor(theme.colors, "border"),
          "--background-secondary": getColor(
            theme.colors,
            "backgroundSecondary"
          ),
          "--surface-hover": getColor(theme.colors, "backgroundTertiary"),
          "--primary-color": getColor(theme.colors, "primary"),
        } as React.CSSProperties
      }
    >
      <div className="sidebar-header">
        <div className="sidebar-tabs">
          <button
            className={`sidebar-tab ${sidebarMode === "tree" ? "active" : ""}`}
            onClick={() => setSidebarMode("tree")}
            style={{
              color:
                sidebarMode === "tree"
                  ? getColor(theme.colors, "primary")
                  : getColor(theme.colors, "text"),
            }}
          >
            <FolderOpen size={16} />
            <span>Files</span>
          </button>
          <button
            className={`sidebar-tab ${sidebarMode === "search" ? "active" : ""}`}
            onClick={() => setSidebarMode("search")}
            style={{
              color:
                sidebarMode === "search"
                  ? getColor(theme.colors, "primary")
                  : getColor(theme.colors, "text"),
            }}
          >
            <Search size={16} />
            <span>Search</span>
          </button>
        </div>
      </div>
      <div className="sidebar-content">
        {sidebarMode === "tree" ? (
          <FileTreeView
            instance={documentEditorInstance}
            onFileSelect={documentEditorInstance.onFileSelect}
            selectedFile={selectedFile || undefined}
            showSearch={true}
            showCreateButtons={true}
            hideEmptyFolders={false}
          />
        ) : (
          <div
            style={{
              padding: "16px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <DocumentContentSearch
              projectId={projectId}
              onResultSelect={handleContentSearchResultSelect}
              placeholder="Search document content..."
            />
          </div>
        )}
      </div>
    </div>
  );

  const rightPanel = (
    <Box
      sx={{
        height: _height,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        backgroundColor: getColor(theme.colors, "background"),
        color: getColor(theme.colors, "text"),
        "& .sp-wrapper": {
          height: "100% !important",
          maxHeight: "100% !important",
        },
        "& .sp-layout": {
          height: "100% !important",
          maxHeight: "100% !important",
        },
        "& .sp-stack": {
          height: "100% !important",
        },
        "& .sp-code-editor": {
          height: "100% !important",
        },
        "& .sp-preview": {
          height: "100% !important",
        },
        "& .sp-preview-container": {
          height: "100% !important",
        },
        "& .sp-preview-iframe": {
          height: "100% !important",
        },
        "& .sp-preview-error": {
          height: "100% !important",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: 1,
          borderBottom: 1,
          borderColor: getColor(theme.colors, "border"),
          backgroundColor: getColor(theme.colors, "surface"),
        }}
      >
        <FileText
          size={16}
          style={{ marginRight: 8, color: getColor(theme.colors, "text") }}
        />
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            color: getColor(theme.colors, "text"),
          }}
        >
          {selectedFile || filename}

          {isLoading && " (Loading...)"}
          {isSaving && " (Saving...)"}
        </Typography>
        {lastSaved && (
          <Typography
            variant="caption"
            sx={{
              color: getColor(theme.colors, "textSecondary"),
            }}
          >
            Last saved: {lastSaved.toLocaleTimeString()}
          </Typography>
        )}
      </Box>

      {/* Editor and Preview */}
      <Box sx={{ flex: 1, height: 0 }}>
        {currentDocumentId ? (
          <DocumentEditorContent
            selectedFile={selectedFile || filename}
            selectedFilename={selectedFilename || filename}
            documentId={currentDocumentId}
            showPreview={showPreview}
            onTogglePreview={handleTogglePreview}
            theme={theme}
            onLastSavedChange={setLastSaved}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: getColor(theme.colors, "textSecondary"),
            }}
          >
            <Typography variant="h6">No document selected</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <div
      style={{
        height: _height,
        width: "100%",
        backgroundColor: getColor(theme.colors, "background"),
      }}
    >
      <ResizableSplitter
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        leftPanelWidth={sidebarWidth}
        onWidthChange={handleWidthChange}
        minLeftWidth={200}
        maxLeftWidth={600}
        splitterWidth={6}
      />
    </div>
  );
};

export default DocumentEditorView;
