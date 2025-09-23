import { getColor, useTheme } from "@aesgraph/app-shell";
import Editor from "@monaco-editor/react";
import { Box, Divider, IconButton, Tooltip, Typography } from "@mui/material";
import {
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  Save,
  Search,
  Upload,
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
import LexicalEditorV2 from "../applets/Lexical/LexicalEditor";
import DocumentContentSearch, {
  DocumentSearchResult,
} from "../common/DocumentContentSearch";
import FileTreeView, { FileTreeInstance } from "../common/FileTreeView";
import MarkdownViewer from "../common/MarkdownViewer";
import "../common/MarkdownViewer.css";
import ResizableSplitter from "../common/ResizableSplitter";
import "./DocumentationView.css";

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
}

const defaultMarkdownContent = `# Welcome to Markdown Editor

This is a live markdown editor with preview capabilities.

## Features

- **Live Preview**: See your markdown rendered in real-time
- **Syntax Highlighting**: Full markdown syntax support
- **File Operations**: Save and load markdown files
- **Split View**: Edit and preview side by side

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

const DocumentEditorContent: React.FC<{
  selectedFile: string;
  content: string;
  onContentUpdate: (content: string) => void;
  showPreview: boolean;
  onTogglePreview: () => void;
  onSave: () => void;
  onLoad: () => void;
  theme: any;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
}> = ({
  selectedFile,
  content,
  onContentUpdate,
  showPreview,
  onTogglePreview,
  onSave,
  onLoad,
  theme,
  hasUnsavedChanges,
  isSaving,
  lastSaved: _lastSaved,
}) => {
  const [localContent, setLocalContent] = useState(content);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingFromUserRef = useRef(false);

  // Update local content immediately for responsive typing
  const handleChange = (value: string | undefined) => {
    const newValue = value || "";
    setLocalContent(newValue);
    isUpdatingFromUserRef.current = true;

    // Debounce the parent update to reduce expensive operations
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      onContentUpdate(newValue);
      // Reset the flag after the parent update
      setTimeout(() => {
        isUpdatingFromUserRef.current = false;
      }, 50);
    }, 300); // 300ms debounce
  };

  // Sync with parent content when it changes externally (e.g., file switching)
  // But avoid syncing when the change is from our own typing
  useEffect(() => {
    if (!isUpdatingFromUserRef.current && content !== localContent) {
      setLocalContent(content);
    }
  }, [content, localContent]);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Determine file type and editor to use
  const fileType = getFileType(selectedFile);
  const isTextFile = fileType === "text";

  return (
    <Box sx={{ display: "flex", flexDirection: "row", height: "100%" }}>
      {/* Toolbar - Hidden */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 10,
          display: "none", // Hide the toolbar
          gap: 1,
          backgroundColor: getColor(theme.colors, "surface"),
          border: `1px solid ${getColor(theme.colors, "border")}`,
          borderRadius: 1,
          padding: 0.5,
        }}
      >
        <Tooltip title="Toggle Preview">
          <IconButton
            size="small"
            onClick={onTogglePreview}
            sx={{
              color: getColor(theme.colors, "text"),
              "&:hover": {
                backgroundColor: getColor(theme.colors, "surfaceHover"),
              },
            }}
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
          </IconButton>
        </Tooltip>
        <Tooltip
          title={
            hasUnsavedChanges ? "Save Changes (Ctrl+S)" : "No Changes to Save"
          }
        >
          <IconButton
            size="small"
            onClick={onSave}
            disabled={!hasUnsavedChanges || isSaving}
            sx={{
              color: hasUnsavedChanges
                ? getColor(theme.colors, "primary")
                : getColor(theme.colors, "textSecondary"),
              "&:hover": {
                backgroundColor: getColor(theme.colors, "surfaceHover"),
              },
              "&:disabled": {
                color: getColor(theme.colors, "textSecondary"),
                opacity: 0.5,
              },
            }}
          >
            {isSaving ? (
              <Upload size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip title="Load File">
          <IconButton
            size="small"
            onClick={onLoad}
            sx={{
              color: getColor(theme.colors, "text"),
              "&:hover": {
                backgroundColor: getColor(theme.colors, "surfaceHover"),
              },
            }}
          >
            <Upload size={16} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Editor */}
      <Box
        sx={{
          flex: showPreview ? 1 : 1,
          overflow: "hidden",
          borderRight: showPreview ? 1 : 0,
          borderColor: getColor(theme.colors, "border"),
        }}
      >
        {isTextFile ? (
          // Lexical Editor for .txt files
          <LexicalEditorV2
            id={selectedFile}
            initialContent={localContent}
            onChange={(content) => {
              setLocalContent(content);
              isUpdatingFromUserRef.current = true;

              if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
              }

              debounceTimeoutRef.current = setTimeout(() => {
                onContentUpdate(content);
                setTimeout(() => {
                  isUpdatingFromUserRef.current = false;
                }, 50);
              }, 300);
            }}
          />
        ) : (
          // Monaco Editor for .md files
          <Editor
            height="100%"
            language="markdown"
            value={localContent}
            onChange={handleChange}
            theme={getMonacoTheme()}
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
        )}
      </Box>

      {/* Preview - Only for markdown files */}
      {showPreview && !isTextFile && (
        <>
          <Divider orientation="vertical" flexItem />
          <div
            className="documentation-content"
            style={{
              flex: 1,
              overflow: "auto",
              height: "100%",
            }}
          >
            <MarkdownViewer
              filename={`${selectedFile || "document"}.md`}
              overrideMarkdown={content}
              showRawToggle={false}
            />
          </div>
        </>
      )}
    </Box>
  );
};

export const DocumentEditorView: React.FC<DocumentEditorViewProps> = ({
  initialContent = defaultMarkdownContent,
  filename = "document.md",
  theme: _theme = "dark",
  height: _height = "100%",
  showPreview: _showPreview = true,
  onSave,
  onLoad,
  userId,
  projectId,
}) => {
  const { theme } = useTheme();
  const [content, setContent] = useState<string>(initialContent);
  const [originalContent, setOriginalContent] =
    useState<string>(initialContent);
  const [showPreview, setShowPreview] = useState<boolean>(_showPreview);
  const [_previewToggleCount, setPreviewToggleCount] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [sidebarMode, setSidebarMode] = useState<"tree" | "search">("tree");
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [_isAutoSaving, setIsAutoSaving] = useState(false);
  const [_error, _setError] = useState<string | null>(null);

  // Create markdown editor file tree instance
  const markdownEditorInstance: FileTreeInstance = useMemo(
    () => ({
      id: "markdown-editor",
      name: "Markdown Files",
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
        setSelectedFile(filePath);
        console.log("Selected file:", filePath, "Metadata:", metadata);

        if (metadata?.documentId) {
          setIsLoading(true);
          try {
            const document = await getDocument(metadata.documentId);
            // Always update content to ensure we have the latest version
            const loadedContent = document.content || "";
            setContent(loadedContent);
            setOriginalContent(loadedContent);
            setCurrentDocumentId(document.id);
            setHasUnsavedChanges(false);
            setLastSaved(
              document.last_updated_at
                ? new Date(document.last_updated_at)
                : null
            );

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
            setLastSaved(null);
          } finally {
            setIsLoading(false);
          }
        } else {
          // No document ID, use default content
          setContent(defaultMarkdownContent);
          setOriginalContent(defaultMarkdownContent);
          setCurrentDocumentId(null);
          setHasUnsavedChanges(false);
          setLastSaved(null);
        }
      },
      onCreateDocument: async (title: string, parentId?: string) => {
        try {
          const newDocument = await createDocument({
            title,
            content: `# ${title}\n\nStart writing your document here...`,
            extension: "md",
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
        const documentId = metadata?.documentId;
        if (!documentId) {
          console.error("No document ID found in metadata");
          return;
        }

        try {
          // Update the document title in Supabase
          await updateDocument({ id: documentId, title: newTitle });
          console.log("Document renamed:", documentId, "to", newTitle);
        } catch (error) {
          console.error("Error renaming document:", error);
          throw error;
        }
      },
    }),
    [userId, projectId] // Removed currentDocumentId to prevent unnecessary FileTreeView re-renders
  );

  // Removed Sandpack-related code

  // Cleanup autosave timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
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

  const handleContentUpdate = useCallback(
    (newContent: string) => {
      // Clear previous timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Debounce the state update to prevent infinite loops during fast typing
      debounceTimeoutRef.current = setTimeout(() => {
        setContent(newContent);
        setHasUnsavedChanges(newContent !== originalContent);

        // Set up autosave timer
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }

        // Only autosave if content has actually changed from last save
        autoSaveTimeoutRef.current = setTimeout(async () => {
          if (
            newContent !== originalContent &&
            newContent !== lastAutoSavedContentRef.current
          ) {
            // Inline autosave logic to avoid circular dependency
            setIsAutoSaving(true);
            try {
              if (currentDocumentId) {
                await updateDocument({
                  id: currentDocumentId,
                  content: newContent,
                });
                setOriginalContent(newContent);
                setHasUnsavedChanges(false);
                setLastSaved(new Date());
                lastAutoSavedContentRef.current = newContent;
                console.log("Document auto-saved to Supabase");
              }
            } catch (error) {
              console.error("Error auto-saving document:", error);
              addNotification({
                message: "Failed to auto-save document",
                type: "error",
                groupId: "autosave-error",
              });
            } finally {
              setIsAutoSaving(false);
            }
          }
        }, 500); // 0.5 seconds
      }, 100); // 100ms debounce
    },
    [originalContent, currentDocumentId]
  );

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
          setLastSaved(new Date());

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

  const handleLoad = useCallback(() => {
    if (onLoad) {
      const loadedContent = onLoad();
      setContent(loadedContent);
    } else {
      // Default load behavior - open file input
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".md,.markdown,.txt";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result as string;
            setContent(text);
          };
          reader.readAsText(file);
        }
      };
      input.click();
    }
  }, [onLoad]);

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
          setLastSaved(
            document.last_updated_at ? new Date(document.last_updated_at) : null
          );
          setSelectedFile(`/documents/${document.id}`);

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
            instance={markdownEditorInstance}
            onFileSelect={markdownEditorInstance.onFileSelect}
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
        <Typography
          variant="caption"
          sx={{
            color: getColor(theme.colors, "textSecondary"),
          }}
        >
          {lastSaved
            ? `Last saved: ${lastSaved.toLocaleTimeString()}`
            : "Markdown Editor"}
        </Typography>
      </Box>

      {/* Editor and Preview */}
      <Box sx={{ flex: 1, height: 0 }}>
        <DocumentEditorContent
          selectedFile={filename}
          content={content}
          onContentUpdate={handleContentUpdate}
          showPreview={showPreview}
          onTogglePreview={handleTogglePreview}
          onSave={handleSave}
          onLoad={handleLoad}
          theme={theme}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          lastSaved={lastSaved}
        />
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
