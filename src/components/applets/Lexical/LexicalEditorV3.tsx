/* eslint-disable unused-imports/no-unused-vars */
import { getColor, useTheme } from "@aesgraph/app-shell";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  EditorState,
  LexicalEditor,
} from "lexical";
import { debounce } from "lodash";
import React, { JSX, useEffect, useState } from "react";
// Import Supabase API functions
import { getDocument, updateDocument } from "../../../api/documentsApi";
import useAppConfigStore from "../../../store/appConfigStore";
import { addNotification } from "../../../store/notificationStore";
import "./LexicalEditor.css";
import { MentionNode } from "./nodes/MentionNode";
import { EntityReferenceNode } from "./plugins/EntityReferencePlugin";
import MentionsPlugin from "./plugins/MentionsPlugin";
import { ToolbarPlugin } from "./plugins/ToolbarPlugin";

// Create a separate PlaceholderPlugin component
const PlaceholderPlugin = ({
  placeholder,
}: {
  placeholder: string;
}): JSX.Element => {
  const { theme } = useTheme();
  return (
    <div
      className="editor-placeholder"
      style={{
        color: getColor(theme.colors, "textSecondary"),
      }}
    >
      {placeholder}
    </div>
  );
};

// Add new ContextMenuPlugin component
function ContextMenuPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const { currentSceneGraph } = useAppConfigStore();

  useEffect(() => {
    // Register for native DOM right-click event on the editor
    const editorElement = document.querySelector(".editor-input");
    if (!editorElement) return;

    const handleContextMenu = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      mouseEvent.preventDefault(); // Prevent browser context menu

      // Get current selection
      editor.update(() => {
        const selection = $getSelection();
        if (
          !selection ||
          !$isRangeSelection(selection) ||
          selection.isCollapsed()
        ) {
          return;
        }

        const selectedText = selection.getTextContent().trim();
        if (!selectedText) return;

        // Show our custom context menu
        setContextMenu({
          x: (e as MouseEvent).clientX,
          y: (e as MouseEvent).clientY,
          text: selectedText,
        });
      });
    };

    editorElement.addEventListener("contextmenu", handleContextMenu);

    // Click outside listener
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        setContextMenu(null);
      }
    });

    return () => {
      editorElement.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [editor, contextMenu]);

  const handleCreateNode = () => {
    if (contextMenu && currentSceneGraph) {
      const newNode = currentSceneGraph.getGraph().createNode({
        label: contextMenu.text,
        type: "Note",
      });

      // If you need to create an edge, you must provide a valid parent node id here
      // currentSceneGraph.getGraph().createEdge(parentNodeId, newNode.getId(), { ... });

      currentSceneGraph.refreshDisplayConfig();
      currentSceneGraph.notifyGraphChanged();

      // Show notification
      addNotification({
        message: `Created node "${contextMenu.text}"`,
        type: "success",
        duration: 3000,
      });

      setContextMenu(null);
    }
  };

  if (!contextMenu) return null;

  return (
    <div
      className="editor-context-menu"
      style={{
        position: "fixed",
        left: `${contextMenu.x}px`,
        top: `${contextMenu.y}px`,
        zIndex: 10000,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="context-menu-item" onClick={handleCreateNode}>
        Create Node
      </div>
    </div>
  );
}

// EditorStateInitializer for smooth content loading
const EditorStateInitializer: React.FC<{
  content: string;
  documentId: string; // Track document changes for re-initialization
}> = ({ content, documentId }) => {
  const [editor] = useLexicalComposerContext();
  const lastDocumentId = React.useRef<string>("");
  const lastContent = React.useRef<string>("");

  useEffect(() => {
    // Initialize if document ID changed or content changed significantly
    const shouldInitialize =
      lastDocumentId.current !== documentId || lastContent.current !== content;

    if (!shouldInitialize) {
      return;
    }

    lastDocumentId.current = documentId;
    lastContent.current = content;
    console.log(
      "LexicalEditorV3: EditorStateInitializer: Initializing with content length:",
      content.length,
      "documentId:",
      documentId
    );

    if (content && content.trim().length > 0) {
      // Create a simple editor state with the content
      editor.update(() => {
        const root = $getRoot();
        root.clear();

        // Split content by newlines to create paragraphs
        const paragraphs = content.split(/\r?\n\r?\n/);
        for (const paragraph of paragraphs) {
          if (paragraph.trim().length > 0) {
            const paragraphNode = $createParagraphNode();
            const lines = paragraph.split(/\r?\n/);

            for (let i = 0; i < lines.length; i++) {
              paragraphNode.append($createTextNode(lines[i]));
              if (i < lines.length - 1) {
                // Add line breaks between lines in the same paragraph
                paragraphNode.append($createLineBreakNode());
              }
            }

            root.append(paragraphNode);
          }
        }
      });
    } else {
      // Initialize with empty content
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        root.append($createParagraphNode().append($createTextNode("")));
      });
    }
  }, [content, documentId, editor]);

  return null;
};

// Custom onChange Plugin that doesn't cause too many re-renders
const CustomOnChangePlugin: React.FC<{
  onChange: (editorState: EditorState, editor: LexicalEditor) => void;
}> = ({ onChange }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      onChange(editorState, editor);
    });
  }, [editor, onChange]);

  return null;
};

interface LexicalEditorV3Props {
  documentId: string; // Required: Supabase document ID
  initialContent?: string; // Fallback content if document is empty
  onChange?: (content: string) => void;
  autoSaveInterval?: number; // Auto-save interval in milliseconds
  onLastSavedChange?: (date: Date | null) => void; // Callback to update parent's last saved timestamp
}

const LexicalEditorV3: React.FC<LexicalEditorV3Props> = ({
  documentId,
  initialContent = "",
  onChange,
  autoSaveInterval = 500, // Default 0.5 seconds
  onLastSavedChange,
}) => {
  const { theme: appTheme } = useTheme();

  console.log("LexicalEditorV3: Component initialized with props:", {
    documentId,
    initialContentLength: initialContent.length,
    autoSaveInterval,
  });

  // Content state
  const [content, setContent] = useState<string>("");
  const [_isLoading, setIsLoading] = useState(true);

  // Use refs to avoid stale closures in debounced functions
  const contentRef = React.useRef<string>("");

  // Load content from Supabase for smooth switching
  useEffect(() => {
    if (!documentId) return;

    // Load from server but keep current content visible
    console.log("LexicalEditorV3: Loading document from server:", documentId);
    setIsLoading(true);

    getDocument(documentId)
      .then((document) => {
        const documentContent = document.content || initialContent;
        console.log("LexicalEditorV3: Loaded content from server:", {
          documentId,
          contentLength: documentContent.length,
          preview: documentContent.substring(0, 100) + "...",
        });

        // Only update content once it's loaded (no flash)
        setContent(documentContent);
        contentRef.current = documentContent;
      })
      .catch((error) => {
        console.error("LexicalEditorV3: Error loading document:", error);
        // Don't clear content on error - keep current content visible
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [documentId, initialContent]);

  // Debounced save function
  const saveToServer = React.useMemo(
    () =>
      debounce(async (contentToSave: string) => {
        if (!documentId) return;

        try {
          console.log("LexicalEditorV3: Saving to server:", {
            documentId,
            contentLength: contentToSave.length,
            preview: contentToSave.substring(0, 100) + "...",
          });

          await updateDocument({
            id: documentId,
            content: contentToSave,
          });

          // Update cache with new content

          const now = new Date();
          if (onLastSavedChange) {
            onLastSavedChange(now); // Update parent component
          }
          console.log(
            "LexicalEditorV3: Successfully saved to server at",
            now.toLocaleTimeString()
          );
        } catch (error) {
          console.error("LexicalEditorV3: Error saving to server:", error);
        }
      }, autoSaveInterval),
    [documentId, autoSaveInterval, onLastSavedChange]
  );

  // Handle editor content changes
  const handleEditorChange = React.useCallback(
    (editorState: EditorState, editor: LexicalEditor) => {
      editorState.read(() => {
        const root = $getRoot();
        const textContent = root.getTextContent();
        const previousContent = contentRef.current;

        // Update refs for latest content
        contentRef.current = textContent;

        // Only save if content actually changed
        if (textContent !== previousContent) {
          console.log("LexicalEditorV3: Content changed:", {
            textLength: textContent.length,
            preview: textContent.substring(0, 50) + "...",
          });

          // Trigger autosave
          saveToServer(textContent);
        }

        // Call onChange callback if provided
        if (onChange) {
          onChange(textContent);
        }
      });
    },
    [onChange, saveToServer]
  );

  // Handle manual save
  const handleSave = React.useCallback(() => {
    console.log("LexicalEditorV3: Manual save triggered");
    // Cancel pending debounced save and save immediately
    saveToServer.cancel();
    if (contentRef.current) {
      saveToServer(contentRef.current);
      saveToServer.flush(); // Execute immediately
    }
  }, [saveToServer]);

  // Handle export
  const handleExport = React.useCallback(() => {
    const contentToExport = contentRef.current || content;
    const blob = new Blob([contentToExport], {
      type: "text/plain;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "document.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, [content]);

  // Save on unmount
  useEffect(() => {
    return () => {
      console.log("LexicalEditorV3: Component unmounting, forcing save");
      saveToServer.flush();
    };
  }, [saveToServer]);

  // Define Lexical theme
  const theme = React.useMemo(
    () => ({
      ltr: "ltr",
      rtl: "rtl",
      paragraph: "editor-paragraph",
      quote: "editor-quote",
      heading: {
        h1: "editor-heading-h1",
        h2: "editor-heading-h2",
        h3: "editor-heading-h3",
        h4: "editor-heading-h4",
        h5: "editor-heading-h5",
      },
      list: {
        nested: {
          listitem: "editor-nested-listitem",
        },
        ol: "editor-list-ol",
        ul: "editor-list-ul",
        listitem: "editor-listitem",
      },
      image: "editor-image",
      link: "editor-link",
      text: {
        bold: "editor-text-bold",
        italic: "editor-text-italic",
        underline: "editor-text-underline",
        strikethrough: "editor-text-strikethrough",
        underlineStrikethrough: "editor-text-underlineStrikethrough",
        code: "editor-text-code",
        hashtag: "editor-text-hashtag",
        entityReference: "editor-text-entity-reference",
      },
      code: "editor-code",
      codeHighlight: {
        atrule: "editor-tokenAttr",
        attr: "editor-tokenAttr",
        boolean: "editor-tokenProperty",
        builtin: "editor-tokenSelector",
        cdata: "editor-tokenComment",
        char: "editor-tokenSelector",
        class: "editor-tokenFunction",
        "class-name": "editor-tokenFunction",
        comment: "editor-tokenComment",
        constant: "editor-tokenProperty",
        deleted: "editor-tokenProperty",
        doctype: "editor-tokenComment",
        entity: "editor-tokenOperator",
        function: "editor-tokenFunction",
        important: "editor-tokenVariable",
        inserted: "editor-tokenSelector",
        keyword: "editor-tokenAttr",
        namespace: "editor-tokenVariable",
        number: "editor-tokenProperty",
        operator: "editor-tokenOperator",
        prolog: "editor-tokenComment",
        property: "editor-tokenProperty",
        punctuation: "editor-tokenPunctuation",
        regex: "editor-tokenVariable",
        selector: "editor-tokenSelector",
        string: "editor-tokenSelector",
        symbol: "editor-tokenProperty",
        tag: "editor-tokenProperty",
        url: "editor-tokenOperator",
        variable: "editor-tokenVariable",
      },
      hashtag: "my-hashtag-class",
    }),
    []
  );

  // Lexical initial configuration
  const initialConfig = React.useMemo(
    () => ({
      namespace: "LexicalEditorV3",
      theme,
      nodes: [
        HeadingNode,
        ListNode,
        ListItemNode,
        QuoteNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        LinkNode,
        HashtagNode,
        EntityReferenceNode,
        MentionNode,
      ],
      onError: (error: Error) => {
        console.error("LexicalEditorV3: Lexical error:", error);
      },
    }),
    [theme]
  );

  // Don't show loading state - keep previous content visible while loading new content

  // Use a completely stable key to prevent remounting during content switches
  const stableKey = "lexical-editor-v3";

  return (
    <div
      className="lexical-editor-container"
      style={
        {
          backgroundColor: getColor(appTheme.colors, "background"),
          color: getColor(appTheme.colors, "text"),
          "--editor-text-color": (() => {
            const backgroundColor = getColor(appTheme.colors, "background");
            const getLuminance = (color: string): number => {
              const rgbaMatch = color.match(
                /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
              );
              if (rgbaMatch) {
                const [, r, g, b] = rgbaMatch.map(Number);
                return (
                  0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255)
                );
              }
              const hexMatch = color.match(
                /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
              );
              if (hexMatch) {
                const r = parseInt(hexMatch[1], 16);
                const g = parseInt(hexMatch[2], 16);
                const b = parseInt(hexMatch[3], 16);
                return (
                  0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255)
                );
              }
              return 0;
            };
            const luminance = getLuminance(backgroundColor);
            return luminance < 0.1
              ? "#ffffff"
              : getColor(appTheme.colors, "text");
          })(),
        } as React.CSSProperties
      }
    >
      <div className="lexical-content">
        <LexicalComposer key={stableKey} initialConfig={initialConfig}>
          <div className="editor-wrapper">
            <div
              className="toolbar-container"
              style={{
                backgroundColor: getColor(appTheme.colors, "surface"),
                borderBottom: `1px solid ${getColor(appTheme.colors, "border")}`,
              }}
            >
              <ToolbarPlugin onSave={handleSave} onExport={handleExport} />
            </div>
            <div
              className="editor-inner"
              style={{
                backgroundColor: getColor(appTheme.colors, "background"),
              }}
            >
              <RichTextPlugin
                contentEditable={<ContentEditable className="editor-input" />}
                placeholder={
                  <PlaceholderPlugin placeholder="Start typing your document..." />
                }
                ErrorBoundary={({ children }) => (
                  <div className="editor-error">
                    An error occurred while rendering the editor.
                  </div>
                )}
              />

              {/* Initialize editor content */}
              <EditorStateInitializer
                content={content}
                documentId={documentId}
              />

              {/* Lexical plugins */}
              <HistoryPlugin />
              <AutoFocusPlugin />
              <ListPlugin />
              <LinkPlugin />
              <HashtagPlugin />
              <TablePlugin />
              <CheckListPlugin />
              <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
              <ClearEditorPlugin />

              {/* Custom onChange handler */}
              <CustomOnChangePlugin onChange={handleEditorChange} />

              <MentionsPlugin />

              {/* Add the ContextMenuPlugin here */}
              <ContextMenuPlugin />
            </div>
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
};

export default LexicalEditorV3;
