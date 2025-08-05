/* eslint-disable unused-imports/no-unused-vars */
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown";
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
  createCommand,
  EditorState,
  LexicalCommand,
  LexicalEditor,
} from "lexical";
import { debounce, throttle } from "lodash";
import React, { JSX, useEffect, useState } from "react";
// Add this import
import { getDocument, updateDocument } from "../../../api/documentsApi";

import useAppConfigStore from "../../../store/appConfigStore";
import { addNotification } from "../../../store/notificationStore";
import "./LexicalEditor.css";
import { MentionNode } from "./nodes/MentionNode";
import { EntityReferenceNode } from "./plugins/EntityReferencePlugin";
import MentionsPlugin from "./plugins/MentionsPlugin";
import { TagPlugin } from "./plugins/TagPlugin";
import { ToolbarPlugin } from "./plugins/ToolbarPlugin";

// Create a separate PlaceholderPlugin component
const PlaceholderPlugin = ({
  placeholder,
}: {
  placeholder: string;
}): JSX.Element => {
  return <div className="editor-placeholder">{placeholder}</div>;
};

// Fix the EditorStateInitializer to run only once on mount, unless forceUpdate is true
const EditorStateInitializer: React.FC<{
  savedState: string | null;
  content: string;
  forceUpdate?: boolean;
}> = ({ savedState, content, forceUpdate = false }) => {
  const [editor] = useLexicalComposerContext();
  const hasInitialized = React.useRef(false);
  const lastContent = React.useRef<string>("");

  useEffect(() => {
    // Only initialize once when component mounts, unless forceUpdate is true
    // or the content has changed when forceUpdate is enabled
    if (
      hasInitialized.current &&
      (!forceUpdate || lastContent.current === content)
    ) {
      return;
    }

    hasInitialized.current = true;
    lastContent.current = content;
    console.log(
      "EditorStateInitializer: Initializing with content length:",
      content.length,
      "forceUpdate:",
      forceUpdate
    );

    if (savedState) {
      try {
        // Try to parse and load the saved state
        const parsedState = JSON.parse(savedState);
        editor.setEditorState(editor.parseEditorState(parsedState));
      } catch (error) {
        console.error("Error restoring editor state:", error);
        // Fallback to using content if state loading fails
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          root.append($createParagraphNode().append($createTextNode(content)));
        });
      }
    } else if (content && content.trim().length > 0) {
      // If no saved state but we have content, create a simple editor state with it
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
    }
  }, [content, editor, savedState, forceUpdate]); // Include forceUpdate in dependencies

  return null;
};

// Create an OnChangePlugin replacement that doesn't cause too many re-renders
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

// Add a new AutoSavePlugin component
const AutoSavePlugin: React.FC<{
  saveContent: () => void;
  saveState: () => void;
  interval: number;
}> = ({ saveContent, saveState, interval }) => {
  useEffect(() => {
    // Set up periodic autosave
    const intervalId = setInterval(() => {
      saveContent();
      saveState();
    }, interval);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [saveContent, saveState, interval]);

  return null;
};

// Create a proper Lexical command for context menu
const CONTEXT_MENU_COMMAND: LexicalCommand<MouseEvent> = createCommand();

// Add new ContextMenuPlugin component
function ContextMenuPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const { currentSceneGraph } = useAppConfigStore();
  // activeDocument is not used anymore

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

interface LexicalEditorProps {
  id?: string; // Add an ID prop to identify this editor instance
  documentId?: string | null; // Document ID to load content from server
  initialContent?: string;
  onChange?: (markdown: string, html?: string) => void;
  showPreview?: boolean;
  onSave?: (content: string, tags?: string[]) => void;
  autoSaveInterval?: number; // Add this new prop
  ignoreCache?: boolean; // When true, ignore localStorage and use server content
}

// Create a debounced save function that we'll use later
const createSaveState = (storageKey: string, stateStorageKey: string) => {
  // Use throttle for content changes (less important)
  const saveContent = throttle((content: string) => {
    try {
      localStorage.setItem(storageKey, content);
    } catch (e) {
      console.warn("Failed to save content to localStorage:", e);
    }
  }, 1000); // Save content at most once per second

  // Use debounce for state changes (more important)
  const saveState = debounce((state: string) => {
    try {
      localStorage.setItem(stateStorageKey, state);
    } catch (e) {
      console.warn("Failed to save state to localStorage:", e);
    }
  }, 2000); // Save state at most once every 2 seconds

  return { saveContent, saveState };
};

const LexicalEditorV2: React.FC<LexicalEditorProps> = ({
  id = "default-editor", // Default ID if none provided
  documentId = null, // Document ID to load content from server
  initialContent = "",
  onChange,
  onSave,
  autoSaveInterval = 5000, // Default autosave interval of 5 seconds
  ignoreCache = false, // Default to false to maintain existing behavior
}) => {
  console.log("LexicalEditorV2: Component initialized with props:", {
    id,
    documentId,
    ignoreCache,
    initialContentLength: initialContent.length,
  });
  // Use a stable storage key based on the provided ID
  const storageKey = `lexical-editor-content-${id}`;
  const stateStorageKey = `lexical-editor-state-${id}`;

  // Simple hash function for content
  const hashContent = (content: string): string => {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  };

  // Load content with proper precedence:
  // If documentId is provided: Load from server
  // If ignoreCache is true: Use initialContent directly (for server-managed content)
  // Otherwise: 1. First try localStorage (for persistence between sessions)
  //            2. Fall back to initialContent prop
  const [serverContent, setServerContent] = useState<string | null>(null);
  const [isLoadingServer, setIsLoadingServer] = useState(false);
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [markdown, setMarkdown] = useState(initialContent);
  const [tags, setTags] = useState<string[]>([]);

  // Load content from server when documentId is provided
  useEffect(() => {
    if (documentId && ignoreCache) {
      setIsLoadingServer(true);
      getDocument(documentId)
        .then((document) => {
          console.log("LexicalEditor: Loaded content from server:", {
            documentId,
            contentLength: (document.content || "").length,
          });
          setServerContent(document.content || "");
        })
        .catch((error) => {
          console.error("LexicalEditor: Error loading document:", error);
          setServerContent("");
        })
        .finally(() => {
          setIsLoadingServer(false);
        });
    } else {
      setServerContent(null);
    }
  }, [documentId, ignoreCache]);

  const initialData = React.useMemo(() => {
    try {
      // If we have server content, use it
      if (serverContent !== null) {
        console.log(
          "Using server content for:",
          id,
          "content length:",
          serverContent.length
        );
        return { content: serverContent, state: null };
      }

      // If ignoreCache is true, prioritize initialContent
      if (ignoreCache) {
        console.log(
          "Ignoring cache, using initialContent for:",
          id,
          "content length:",
          initialContent.length
        );
        return { content: initialContent, state: null };
      }

      // First try localStorage
      const savedContent = localStorage.getItem(storageKey);
      const savedState = localStorage.getItem(stateStorageKey);

      if (savedContent && savedState) {
        console.log("Loading content from localStorage:", id);
        return { content: savedContent, state: savedState };
      }

      // Fall back to initialContent
      console.log("Using initialContent for:", id);
      return { content: initialContent, state: null };
    } catch (e) {
      console.warn("Error loading content:", e);
      return { content: initialContent, state: null };
    }
  }, [
    id,
    initialContent,
    storageKey,
    stateStorageKey,
    ignoreCache,
    serverContent,
  ]);

  // Capture the initial state value in a ref so it doesn't change
  const initialStateRef = React.useRef(initialData.state);
  const initialContentRef = React.useRef(initialData.content);

  // Load saved state
  const [savedState, setSavedState] = useState<string | null>(
    initialStateRef.current
  );

  // Move these outside of the render function to prevent recreation
  const saveContent = React.useRef(
    throttle((content: string) => {
      // Only save to localStorage if not ignoring cache
      if (!ignoreCache) {
        try {
          localStorage.setItem(storageKey, content);
        } catch (e) {
          console.warn("Failed to save content to localStorage:", e);
        }
      }
    }, 2000)
  ).current;

  const saveState = React.useRef(
    debounce((state: string) => {
      // Only save to localStorage if not ignoring cache
      if (!ignoreCache) {
        try {
          localStorage.setItem(stateStorageKey, state);
        } catch (e) {
          console.warn("Failed to save state to localStorage:", e);
        }
      }
    }, 3000)
  ).current;

  // Use refs for internal state that shouldn't trigger rerenders
  const markdownRef = React.useRef(initialData.content);
  const tagsRef = React.useRef<string[]>([]);
  const serializedEditorStateRef = React.useRef<string | null>(
    initialData.state
  );

  // Server saving function for documents
  const saveToServer = React.useMemo(
    () =>
      debounce(async (content: string) => {
        if (documentId && ignoreCache) {
          try {
            console.log("LexicalEditor: Saving to server:", {
              documentId,
              contentLength: content.length,
            });
            await updateDocument({
              id: documentId,
              content: content,
            });
            console.log("LexicalEditor: Successfully saved to server");
          } catch (error) {
            console.error("LexicalEditor: Error saving to server:", error);
          }
        }
      }, 2000), // 2 second debounce for server saves
    [documentId, ignoreCache]
  );

  // Unified save function that saves to appropriate storage locations
  const saveToAllStorages = React.useCallback(
    (content: string, serializedEditorState: string, currentTags: string[]) => {
      console.log("LexicalEditor: saveToAllStorages called:", {
        ignoreCache,
        documentId,
        contentLength: content.length,
      });

      if (ignoreCache && documentId) {
        // When ignoreCache=true, save to server instead of localStorage
        console.log("LexicalEditor: Triggering server save");
        saveToServer(content);
      } else if (documentId) {
        // Always update the server document if documentId is present
        updateDocument({
          id: documentId,
          content: content,
        });
      } else {
        // Legacy behavior: save to localStorage only
        localStorage.setItem(storageKey, content);
        localStorage.setItem(stateStorageKey, serializedEditorState);
      }

      // Update timestamp for UI
      const timestamp = new Date().toLocaleTimeString();
      setAutosaveStatus(`Last saved at ${timestamp}`);
    },
    [documentId, ignoreCache, saveToServer, storageKey, stateStorageKey]
  );

  // Optimize change handler
  const handleEditorChange = React.useCallback(
    (editorState: EditorState, editor: LexicalEditor) => {
      // Store the editor state reference
      setEditorState(editorState);

      editorState.read(() => {
        const root = $getRoot();
        const textContent = root.getTextContent();
        const serializedState = JSON.stringify(editorState.toJSON());

        // Update refs directly - no UI impact
        markdownRef.current = textContent;
        serializedEditorStateRef.current = serializedState;

        // Debug logging
        console.log("LexicalEditor: Content changed:", {
          textLength: textContent.length,
          ignoreCache,
          documentId,
          preview: textContent.substring(0, 50) + "...",
        });

        // Throttled storage updates
        // saveContent(textContent);
        // saveState(serializedState);

        // Update document store and SceneGraph with debouncing
        const debouncedSave = debounce(() => {
          console.log("LexicalEditor: Calling saveToAllStorages");
          saveToAllStorages(textContent, serializedState, tagsRef.current);
        }, 1000);
        debouncedSave();

        // Only update state (causing re-render) occasionally
        // This makes the UI much more responsive
        if (Math.random() < 0.1) {
          // Update UI roughly every 10 changes
          setMarkdown(textContent);
        }

        if (onChange) {
          onChange(textContent);
        }
      });
    },
    [documentId, ignoreCache, onChange, saveToAllStorages]
  );

  // Handle tags change
  const handleTagsChange = React.useCallback(
    (newTags: string[]) => {
      tagsRef.current = newTags;
      setTags(newTags);

      // Make sure tags are saved to all storages when they change
      if (serializedEditorStateRef.current) {
        saveToAllStorages(
          markdownRef.current,
          serializedEditorStateRef.current,
          newTags
        );
      }
    },
    [saveToAllStorages]
  );

  // Define theme inside useMemo
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
        hashtag: "editor-text-hashtag", // Add hashtag styling
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

  // Make sure the onChange handler is stable
  const initialConfig = React.useMemo(
    () => ({
      namespace: "LexicalEditor",
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
        console.error(error);
      },
    }),
    [theme]
  );

  // Handle save button click
  const handleSave = React.useCallback(() => {
    const currentContent = markdownRef.current;
    const currentTags = tagsRef.current;
    const currentState = serializedEditorStateRef.current;

    if (currentState) {
      // Save immediately to all storages
      saveToAllStorages(currentContent, currentState, currentTags);
    }

    // Call custom save handler if provided
    if (onSave) {
      onSave(currentContent, currentTags);
    }
  }, [onSave, saveToAllStorages]);

  // Create explicit save actions that we can call programmatically
  const saveDocumentToLocalStorageNow = React.useCallback(() => {
    const currentContent = markdownRef.current;
    const currentState = serializedEditorStateRef.current;

    if (currentState) {
      saveToAllStorages(currentContent, currentState, tagsRef.current);
    }
  }, [saveToAllStorages]);

  const saveStateNow = React.useCallback(() => {
    if (editorState) {
      try {
        const serializedState = JSON.stringify(editorState.toJSON());
        serializedEditorStateRef.current = serializedState;
        setSavedState(serializedState);

        // Save to all storage locations
        saveToAllStorages(
          markdownRef.current,
          serializedState,
          tagsRef.current
        );
      } catch (e) {
        console.warn("Failed to save state:", e);
      }
    }
  }, [editorState, saveToAllStorages]);

  // Add autosave status indicator
  const [autosaveStatus, setAutosaveStatus] = useState<string>("Not saved yet");

  // Save on unmount
  useEffect(() => {
    return () => {
      console.log("Editor unmounting, forcing save");
      if (serializedEditorStateRef.current) {
        saveToAllStorages(
          markdownRef.current,
          serializedEditorStateRef.current,
          tagsRef.current
        );
      }
    };
  }, [saveToAllStorages]);

  // Handle export button click
  const handleExport = () => {
    let markdownContent = markdown;

    if (editorState) {
      editorState.read(() => {
        markdownContent = $convertToMarkdownString(TRANSFORMERS);
      });
    }

    const blob = new Blob([markdownContent], {
      type: "text/markdown;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "document.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="lexical-editor-container">
      {tags.length > 0 && (
        <div className="tags-display">
          {tags.map((tag) => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="lexical-content">
        <LexicalComposer
          key={
            ignoreCache
              ? `${id}-${hashContent(serverContent || initialContent)}`
              : id
          }
          initialConfig={initialConfig}
        >
          <div className="editor-wrapper">
            <div className="toolbar-container">
              <ToolbarPlugin onSave={handleSave} onExport={handleExport} />
            </div>
            <div className="editor-inner">
              {/* Last saved indicator in top-right of editor area */}
              <div className="autosave-indicator persistent">
                {autosaveStatus}
              </div>

              <RichTextPlugin
                contentEditable={<ContentEditable className="editor-input" />}
                placeholder={
                  <PlaceholderPlugin placeholder="Enter some text... (Use #tag to create tags)" />
                }
                ErrorBoundary={({ children }) => (
                  <div className="editor-error">
                    An error occurred while rendering the editor.
                  </div>
                )}
              />

              {/* Add our EditorStateInitializer to properly set initial content */}
              <EditorStateInitializer
                savedState={ignoreCache ? null : initialStateRef.current}
                content={
                  ignoreCache
                    ? serverContent || initialContent
                    : initialContentRef.current
                }
                forceUpdate={ignoreCache}
              />
              <HistoryPlugin />
              <AutoFocusPlugin />
              <ListPlugin />
              <LinkPlugin />
              <HashtagPlugin />
              <TagPlugin onTagsChange={handleTagsChange} />
              <TablePlugin />
              <CheckListPlugin />
              <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
              <ClearEditorPlugin />

              {/* Replace OnChangePlugin with our optimized version */}
              <CustomOnChangePlugin onChange={handleEditorChange} />

              {/* Add the AutoSavePlugin - only when not ignoring cache */}
              {!ignoreCache && (
                <AutoSavePlugin
                  saveContent={saveDocumentToLocalStorageNow}
                  saveState={saveStateNow}
                  interval={autoSaveInterval}
                />
              )}

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

export default LexicalEditorV2;
