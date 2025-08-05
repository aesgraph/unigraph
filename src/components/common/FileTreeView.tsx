import { getColor, useTheme } from "@aesgraph/app-shell";
import { Tooltip } from "@mui/material";
import {
  ChevronDown,
  ChevronRight,
  FilePlus,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  Search,
  Trash,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Document,
  listDocuments,
  updateDocument,
} from "../../api/documentsApi";
import { useComponentLogger } from "../../hooks/useLogger";

import "./FileTreeView.css";

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  isExpanded?: boolean;
  title?: string;
  order?: number; // Add order metadata
  displayName: string; // Will show title if available, otherwise name
  isIndex?: boolean; // Flag to identify index files
  metadata?: Record<string, any>; // Additional metadata for different data sources
}

export interface FileTreeDataSource {
  id: string;
  name: string;
  type: "json" | "supabase" | "custom";
  config: {
    url?: string; // For JSON data sources
    table?: string; // For Supabase data sources
    query?: string; // For custom data sources
    transform?: (data: any) => FileNode[]; // Custom transform function
    userId?: string; // For Supabase queries
    projectId?: string; // For Supabase queries
  };
}

export interface FileTreeInstance {
  id: string;
  name: string;
  dataSource: FileTreeDataSource;
  rootPath?: string;
  hideEmptyFolders?: boolean;
  onFileSelect?: (filePath: string, metadata?: Record<string, any>) => void;
  onCreateDocument?: (
    title: string,
    parentId?: string,
    extension?: string
  ) => Promise<void>;
  onCreateFolder?: (title: string, parentId?: string) => Promise<void>;
  onRenameNode?: (
    filePath: string,
    newTitle: string,
    metadata?: Record<string, any>
  ) => Promise<void>;
  onDeleteNode?: (
    path: string,
    metadata?: Record<string, any>
  ) => Promise<void>;
}

export interface FileTreeViewProps {
  instance: FileTreeInstance;
  onFileSelect?: (filePath: string, metadata?: Record<string, any>) => void;
  selectedFile?: string;
  className?: string;
  showHeader?: boolean;
  headerTitle?: string;
  showSearch?: boolean;
  showCreateButtons?: boolean;
  hideEmptyFolders?: boolean;
  readOnly?: boolean;
}

export default React.memo(
  function FileTreeView({
    instance,
    onFileSelect,
    selectedFile,
    className = "",
    showHeader = true,
    headerTitle,
    showSearch = true,
    showCreateButtons = false,
    hideEmptyFolders = true,
    readOnly = false,
  }: FileTreeViewProps) {
    console.log("FileTreeView props:", {
      onFileSelect: !!onFileSelect,
      selectedFile,
    });
    const { theme } = useTheme();
    const log = useComponentLogger(`FileTreeView-${instance.id}`);
    const [fileTree, setFileTree] = useState<FileNode[]>([]);
    const [filteredTree, setFilteredTree] = useState<FileNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [contextMenu, setContextMenu] = useState<{
      visible: boolean;
      x: number;
      y: number;
      node: FileNode | null;
    }>({
      visible: false,
      x: 0,
      y: 0,
      node: null,
    });

    // State for drag and drop
    const [dragState, setDragState] = useState<{
      isDragging: boolean;
      draggedNode: FileNode | null;
      dropTarget: FileNode | null;
      dropPosition: "before" | "after" | "inside" | null;
    }>({
      isDragging: false,
      draggedNode: null,
      dropTarget: null,
      dropPosition: null,
    });

    // State for inline editing
    const [editingNode, setEditingNode] = useState<{
      node: FileNode;
      originalName: string;
    } | null>(null);
    const [editValue, setEditValue] = useState("");

    // Handle starting inline edit
    const startEdit = (node: FileNode) => {
      setEditingNode({ node, originalName: node.displayName });
      setEditValue(node.displayName);
      setContextMenu({ visible: false, x: 0, y: 0, node: null });
    };

    // Handle keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "F2" && selectedFile && !readOnly) {
          // Find the selected node and start editing
          const findNode = (nodes: FileNode[]): FileNode | null => {
            for (const node of nodes) {
              if (node.path === selectedFile) {
                return node;
              }
              if (node.children) {
                const found = findNode(node.children);
                if (found) return found;
              }
            }
            return null;
          };

          const selectedNode = findNode(fileTree);
          if (selectedNode) {
            event.preventDefault();
            startEdit(selectedNode);
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [selectedFile, fileTree, readOnly]);

    // Handle saving inline edit
    const saveEdit = async () => {
      if (!editingNode || !editValue.trim()) {
        setEditingNode(null);
        setEditValue("");
        return;
      }

      try {
        if (instance.onRenameNode) {
          await instance.onRenameNode(
            editingNode.node.path,
            editValue.trim(),
            editingNode.node.metadata
          );
          console.log(
            `Renamed node: ${editingNode.node.path} to "${editValue.trim()}"`
          );

          // Refresh the tree to show the updated name
          const refreshAfterRename = async () => {
            try {
              const documents = await listDocuments({
                userId: instance.dataSource.config.userId,
                projectId: instance.dataSource.config.projectId,
              });

              console.log("Fetched documents after rename:", documents.length);
              const treeData =
                await convertSupabaseDocumentsToFileNodes(documents);
              setFileTree(treeData);
            } catch (error) {
              console.error("Error refreshing tree after rename:", error);
            }
          };

          refreshAfterRename();
        }
      } catch (error) {
        console.error("Error renaming document:", error);
      } finally {
        setEditingNode(null);
        setEditValue("");
      }
    };

    // Handle canceling inline edit
    const cancelEdit = () => {
      setEditingNode(null);
      setEditValue("");
    };

    // Handle creating new document
    const handleCreateDocument = async () => {
      if (!instance.onCreateDocument) return;

      const filename = prompt(
        "Enter filename (with extension, e.g., 'document.md' or 'notes.txt'):"
      );
      if (!filename) return;

      // Extract title and extension from filename
      const lastDotIndex = filename.lastIndexOf(".");
      let title = filename;
      let extension = "txt"; // default to text

      if (lastDotIndex > 0) {
        title = filename.substring(0, lastDotIndex);
        extension = filename.substring(lastDotIndex + 1).toLowerCase();

        // Validate extension
        if (!["md", "txt"].includes(extension)) {
          alert("Please use either .md (markdown) or .txt (text) extension");
          return;
        }
      } else {
        // No extension provided, default to .txt
        extension = "txt";
        title = filename; // use the whole input as title
      }

      setIsCreating(true);
      try {
        await instance.onCreateDocument(title, undefined, extension);

        // Fallback refresh after create operation
        console.log("Refreshing tree after document creation (header button)");
        const refreshAfterCreate = async () => {
          try {
            const documents = await listDocuments({
              userId: instance.dataSource.config.userId,
              projectId: instance.dataSource.config.projectId,
            });

            console.log(
              "Fetched documents after create (header):",
              documents.length
            );
            const treeData =
              await convertSupabaseDocumentsToFileNodes(documents);
            setFileTree(treeData);
          } catch (error) {
            console.error(
              "Error refreshing tree after create (header):",
              error
            );
          }
        };

        refreshAfterCreate();
      } catch (error) {
        console.error("Error creating document:", error);
      } finally {
        setIsCreating(false);
      }
    };

    // Handle creating new folder
    const handleCreateFolder = async () => {
      if (!instance.onCreateFolder) return;

      const title = prompt("Enter folder name:");
      if (!title) return;

      setIsCreating(true);
      try {
        await instance.onCreateFolder(title);

        // Fallback refresh after create operation
        console.log("Refreshing tree after folder creation (header button)");
        const refreshAfterCreate = async () => {
          try {
            const documents = await listDocuments({
              userId: instance.dataSource.config.userId,
              projectId: instance.dataSource.config.projectId,
            });

            console.log(
              "Fetched documents after create (header):",
              documents.length
            );
            const treeData =
              await convertSupabaseDocumentsToFileNodes(documents);
            setFileTree(treeData);
          } catch (error) {
            console.error(
              "Error refreshing tree after create (header):",
              error
            );
          }
        };

        refreshAfterCreate();
      } catch (error) {
        console.error("Error creating folder:", error);
      } finally {
        setIsCreating(false);
      }
    };

    // Handle context menu
    const handleContextMenu = (event: React.MouseEvent, node: FileNode) => {
      event.preventDefault();

      // Don't show context menu in read-only mode
      if (readOnly) {
        return;
      }

      // Show context menu for all nodes (files and folders)
      setContextMenu({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        node,
      });
    };

    // Handle drag start
    const handleDragStart = (event: React.DragEvent, node: FileNode) => {
      if (readOnly) {
        event.preventDefault();
        return;
      }

      setDragState({
        isDragging: true,
        draggedNode: node,
        dropTarget: null,
        dropPosition: null,
      });

      // Set drag data
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", node.path);
    };

    // Handle drag over
    const handleDragOver = (event: React.DragEvent, node: FileNode) => {
      if (readOnly || !dragState.isDragging || !dragState.draggedNode) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = "move";

      // Don't allow dropping on itself or its children
      if (
        dragState.draggedNode.path === node.path ||
        node.path.startsWith(dragState.draggedNode.path + "/")
      ) {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const y = event.clientY - rect.top;
      const height = rect.height;

      let dropPosition: "before" | "after" | "inside" = "inside";

      if (node.type === "directory") {
        // For directories, allow dropping inside, before, or after
        if (y < height * 0.25) {
          dropPosition = "before";
        } else if (y > height * 0.75) {
          dropPosition = "after";
        } else {
          dropPosition = "inside";
        }
      } else {
        // For files, only allow before or after
        if (y < height * 0.5) {
          dropPosition = "before";
        } else {
          dropPosition = "after";
        }
      }

      setDragState((prev) => ({
        ...prev,
        dropTarget: node,
        dropPosition,
      }));
    };

    // Handle drag leave
    const handleDragLeave = (event: React.DragEvent) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node)) {
        setDragState((prev) => ({
          ...prev,
          dropTarget: null,
          dropPosition: null,
        }));
      }
    };

    // Handle drop
    const handleDrop = async (event: React.DragEvent, targetNode: FileNode) => {
      event.preventDefault();

      if (readOnly || !dragState.isDragging || !dragState.draggedNode) {
        return;
      }

      const { draggedNode, dropPosition } = dragState;

      // Reset drag state
      setDragState({
        isDragging: false,
        draggedNode: null,
        dropTarget: null,
        dropPosition: null,
      });

      // Don't allow dropping on itself or its children
      if (
        draggedNode.path === targetNode.path ||
        targetNode.path.startsWith(draggedNode.path + "/")
      ) {
        return;
      }

      try {
        let newParentId: string | undefined;

        if (dropPosition === "inside" && targetNode.type === "directory") {
          // Drop inside directory
          newParentId = targetNode.metadata?.documentId;
        } else {
          // Drop before/after - use the target's parent
          newParentId = targetNode.metadata?.parentId;
        }

        // For Supabase data sources, call the API directly to update the parent_id
        if (
          instance.dataSource.type === "supabase" &&
          draggedNode.metadata?.documentId
        ) {
          await updateDocument({
            id: draggedNode.metadata.documentId,
            parent_id: newParentId || undefined,
          });

          console.log(
            `Moved document ${draggedNode.metadata.documentId} to new parent: ${newParentId}`
          );

          // Refresh the tree by re-fetching documents
          const documents = await listDocuments({
            userId: instance.dataSource.config.userId,
            projectId: instance.dataSource.config.projectId,
          });

          console.log("Fetched documents after move:", documents.length);
          const treeData = await convertSupabaseDocumentsToFileNodes(documents);
          setFileTree(treeData);
        } else if (instance.onRenameNode) {
          // Fallback to the rename function for other data sources
          await instance.onRenameNode(
            draggedNode.path,
            draggedNode.displayName,
            { ...draggedNode.metadata, parentId: newParentId }
          );

          console.log(
            `Moved ${draggedNode.path} to new parent: ${newParentId}`
          );
        }
      } catch (error) {
        console.error("Error moving file/folder:", error);
      }
    };

    // Handle drag end
    const handleDragEnd = () => {
      setDragState({
        isDragging: false,
        draggedNode: null,
        dropTarget: null,
        dropPosition: null,
      });
    };

    // Handle context menu item click
    const handleContextMenuAction = async (
      action: "document" | "folder" | "delete" | "rename"
    ) => {
      if (!contextMenu.node) return;

      const parentId = contextMenu.node.metadata?.documentId;
      let title: string | null = null;
      let extension: string = "txt"; // default extension

      if (action === "delete") {
        const nodeName = contextMenu.node.displayName;
        const nodeType =
          contextMenu.node.type === "directory" ? "folder" : "file";
        const confirmMessage = `Are you sure you want to delete the ${nodeType} "${nodeName}"? This action cannot be undone.`;

        if (!confirm(confirmMessage)) {
          setContextMenu({ visible: false, x: 0, y: 0, node: null });
          return;
        }

        // Optimistic update: remove the node from the tree immediately
        const removeNodeFromTree = (
          nodes: FileNode[],
          targetPath: string
        ): FileNode[] => {
          return nodes
            .filter((node) => node.path !== targetPath)
            .map((node) => ({
              ...node,
              children: node.children
                ? removeNodeFromTree(node.children, targetPath)
                : undefined,
            }));
        };

        // Immediately update the UI
        setFileTree((prevTree) =>
          removeNodeFromTree(prevTree, contextMenu.node!.path)
        );
        setFilteredTree((prevTree) =>
          removeNodeFromTree(prevTree, contextMenu.node!.path)
        );

        // Close context menu immediately
        setContextMenu({ visible: false, x: 0, y: 0, node: null });
      } else {
        if (action === "document") {
          const filename = prompt(
            "Enter filename (with extension, e.g., 'document.md' or 'notes.txt'):"
          );
          if (!filename) return;

          // Extract title and extension from filename
          const lastDotIndex = filename.lastIndexOf(".");

          if (lastDotIndex > 0) {
            title = filename.substring(0, lastDotIndex);
            extension = filename.substring(lastDotIndex + 1).toLowerCase();

            // Validate extension
            if (!["md", "txt"].includes(extension)) {
              alert(
                "Please use either .md (markdown) or .txt (text) extension"
              );
              return;
            }
          } else {
            // No extension provided, default to .txt
            extension = "txt";
            title = filename; // use the whole input as title
          }
        } else {
          title = prompt(`Enter ${action} name:`);
          if (!title) return;
        }
      }

      setIsCreating(true);
      try {
        if (action === "document" && instance.onCreateDocument) {
          await instance.onCreateDocument(title!, parentId, extension);

          // Fallback refresh after create operation
          console.log("Refreshing tree after document creation");
          const refreshAfterCreate = async () => {
            try {
              const documents = await listDocuments({
                userId: instance.dataSource.config.userId,
                projectId: instance.dataSource.config.projectId,
              });

              console.log("Fetched documents after create:", documents.length);
              const treeData =
                await convertSupabaseDocumentsToFileNodes(documents);
              setFileTree(treeData);
            } catch (error) {
              console.error("Error refreshing tree after create:", error);
            }
          };

          refreshAfterCreate();
        } else if (action === "folder" && instance.onCreateFolder) {
          await instance.onCreateFolder(title!, parentId);

          // Fallback refresh after create operation
          console.log("Refreshing tree after folder creation");
          const refreshAfterCreate = async () => {
            try {
              const documents = await listDocuments({
                userId: instance.dataSource.config.userId,
                projectId: instance.dataSource.config.projectId,
              });

              console.log("Fetched documents after create:", documents.length);
              const treeData =
                await convertSupabaseDocumentsToFileNodes(documents);
              setFileTree(treeData);
            } catch (error) {
              console.error("Error refreshing tree after create:", error);
            }
          };

          refreshAfterCreate();
        } else if (action === "rename") {
          // Start inline editing for the selected node
          startEdit(contextMenu.node);
        } else if (action === "delete" && instance.onDeleteNode) {
          await instance.onDeleteNode(
            contextMenu.node.path,
            contextMenu.node.metadata
          );
        }
      } catch (error) {
        console.error(
          `Error ${action === "delete" ? "deleting" : "creating"} ${action}:`,
          error
        );

        // If delete failed, revert the optimistic update by refreshing the tree
        if (action === "delete") {
          // Trigger a re-fetch of the tree data
          const currentInstance = instance;

          const fetchFileTree = async () => {
            try {
              setLoading(true);
              setError(null);

              let treeData: FileNode[] = [];

              switch (currentInstance.dataSource.type) {
                case "supabase":
                  try {
                    const documents = await listDocuments({
                      userId: currentInstance.dataSource.config.userId,
                      projectId: currentInstance.dataSource.config.projectId,
                    });

                    // Re-use the existing conversion logic

                    treeData =
                      await convertSupabaseDocumentsToFileNodes(documents);
                  } catch (err) {
                    log.error("Error loading documents from Supabase:", err);
                    setError("Failed to load documents from database");
                    setLoading(false);
                    return;
                  }
                  break;
              }

              setFileTree(treeData);
              setLoading(false);
            } catch (error) {
              console.error(
                "Error refreshing tree after failed delete:",
                error
              );
              setLoading(false);
            }
          };
          fetchFileTree();
        }
      } finally {
        setIsCreating(false);
        if (action !== "delete") {
          setContextMenu({ visible: false, x: 0, y: 0, node: null });
        }
      }
    };

    // Close context menu when clicking outside
    const _handleClickOutside = () => {
      setContextMenu({ visible: false, x: 0, y: 0, node: null });
    };

    // Add click outside handler
    useEffect(() => {
      if (contextMenu.visible) {
        const handleClick = () => {
          setContextMenu({ visible: false, x: 0, y: 0, node: null });
        };
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
      }
    }, [contextMenu.visible]);

    // Remove the 5-second delayed refresh as it's causing performance issues
    // The immediate refreshes after create/rename/delete operations are sufficient

    // Helper function to convert Supabase documents to FileNode format
    const convertSupabaseDocumentsToFileNodes = React.useCallback(
      async (documents: Document[]): Promise<FileNode[]> => {
        const convertDocumentToNode = (doc: Document): FileNode => {
          const isFolder = doc.extension === "folder" || doc.metadata?.isFolder;

          // Only log in development
          if (process.env.NODE_ENV === "development") {
            console.log(
              `Converting document: ${doc.title}, extension: ${doc.extension}, isFolder: ${isFolder}`
            );
          }

          // Helper function to generate displayName without duplicate extensions
          const getDisplayName = (title: string, extension: string): string => {
            if (isFolder) return title;

            // Check if title already ends with the extension
            const expectedExtension = `.${extension}`;
            if (title.toLowerCase().endsWith(expectedExtension.toLowerCase())) {
              return title; // Already has extension, don't add it again
            }

            return `${title}${expectedExtension}`;
          };

          return {
            name: doc.title,
            path: `/documents/${doc.id}`,
            type: isFolder ? "directory" : "file",
            displayName: getDisplayName(doc.title, doc.extension || ""),
            isExpanded: isFolder, // Folders start expanded
            metadata: {
              documentId: doc.id,
              content: doc.content,
              extension: doc.extension,
              projectId: doc.project_id,
              parentId: doc.parent_id,
              createdAt: doc.created_at,
              lastUpdatedAt: doc.last_updated_at,
              isFolder,
            },
          };
        };

        // Build tree structure from flat documents
        const buildTree = (parentId: string | null = null): FileNode[] => {
          const children = documents.filter(
            (doc) => doc.parent_id === parentId
          );

          // Only log in development
          if (process.env.NODE_ENV === "development") {
            console.log(
              `Building tree for parentId: ${parentId}, found ${children.length} children`
            );
          }

          const nodes = children
            .map((doc) => {
              // Only log in development
              if (process.env.NODE_ENV === "development") {
                console.log(
                  `Processing document: ${doc.title}, extension: ${doc.extension}, parentId: ${doc.parent_id}`
                );
              }

              const node = convertDocumentToNode(doc);
              const childNodes = buildTree(doc.id);

              // Only log in development
              if (process.env.NODE_ENV === "development") {
                console.log(
                  `Document ${doc.title} has ${childNodes.length} children:`,
                  childNodes.map((child) => child.name)
                );
              }

              // If it has children, add them
              if (childNodes.length > 0) {
                node.children = childNodes;
                node.type = "directory";
                node.isExpanded = true;
                // Only log in development
                if (process.env.NODE_ENV === "development") {
                  console.log(
                    `Document ${doc.title} has ${childNodes.length} children, set as directory`
                  );
                }
              }

              // If it's a folder document (extension === "folder"), always treat as directory
              if (doc.extension === "folder" || doc.metadata?.isFolder) {
                node.type = "directory";
                node.isExpanded = true;
                // Only log in development
                if (process.env.NODE_ENV === "development") {
                  console.log(
                    `Document ${doc.title} is a folder document, set as directory`
                  );
                }
              }

              // Skip empty folders if hideEmptyFolders is true, but only if it's not a folder document
              if (
                hideEmptyFolders &&
                node.type === "directory" &&
                doc.extension !== "folder" &&
                !doc.metadata?.isFolder
              ) {
                if (!node.children || node.children.length === 0) {
                  // Only log in development
                  if (process.env.NODE_ENV === "development") {
                    console.log(`Skipping empty folder: ${doc.title}`);
                  }
                  return null;
                }
              }

              // Only log in development
              if (process.env.NODE_ENV === "development") {
                console.log(
                  `Final node for ${doc.title}: type=${node.type}, isExpanded=${node.isExpanded}, children=${node.children?.length || 0}`
                );
              }
              return node;
            })
            .filter(Boolean) as FileNode[];

          // Sort nodes: folders first, then files, both alphabetically
          return nodes.sort((a: FileNode, b: FileNode) => {
            // First, sort by type: directories first, then files
            if (a.type === "directory" && b.type === "file") {
              return -1;
            }
            if (a.type === "file" && b.type === "directory") {
              return 1;
            }
            // If both are the same type, sort alphabetically by displayName
            return a.displayName.localeCompare(b.displayName);
          });
        };

        return buildTree();
      },
      [hideEmptyFolders]
    );

    // Fetch the file tree structure based on data source
    useEffect(() => {
      const fetchFileTree = async () => {
        try {
          setLoading(true);
          setError(null);

          let treeData: FileNode[] = [];

          switch (instance.dataSource.type) {
            case "json":
              if (instance.dataSource.config.url) {
                const response = await fetch(instance.dataSource.config.url);
                if (response.ok) {
                  const data = await response.json();
                  console.log("JSON data loaded:", data);
                  treeData = await convertStructureToFileNodes(
                    data,
                    "" // No basePath needed since we use paths directly
                  );
                  console.log("Converted tree data:", treeData);
                } else {
                  log.warn(
                    `Could not load JSON structure from ${instance.dataSource.config.url}`,
                    {
                      status: response.status,
                    }
                  );
                }
              }
              break;

            case "supabase":
              try {
                // Get all documents for the user/project
                const documents = await listDocuments({
                  userId: instance.dataSource.config.userId,
                  projectId: instance.dataSource.config.projectId,
                });

                console.log(
                  "Fetched documents from Supabase:",
                  documents.length
                );

                // Only log relationships in development
                if (process.env.NODE_ENV === "development") {
                  console.log(
                    "Fetched documents from Supabase:",
                    documents.map((doc) => ({
                      id: doc.id,
                      title: doc.title,
                      extension: doc.extension,
                      parent_id: doc.parent_id,
                      metadata: doc.metadata,
                    }))
                  );

                  // Log parent-child relationships
                  console.log("Parent-child relationships:");
                  documents.forEach((doc) => {
                    const children = documents.filter(
                      (child) => child.parent_id === doc.id
                    );
                    if (children.length > 0) {
                      console.log(
                        `${doc.title} (${doc.id}) has children:`,
                        children.map((child) => `${child.title} (${child.id})`)
                      );
                    }
                  });
                }

                treeData = await convertSupabaseDocumentsToFileNodes(documents);
              } catch (err) {
                log.error("Error loading documents from Supabase:", err);
                setError("Failed to load documents from database");
                setLoading(false);
                return;
              }
              break;

            case "custom":
              if (instance.dataSource.config.transform) {
                // For custom data sources, we expect the data to be provided externally
                // This would typically be handled by a parent component
                log.info("Custom data source - expecting external data");
              }
              break;

            default:
              log.error(
                `Unknown data source type: ${instance.dataSource.type}`
              );
              setError(`Unknown data source type: ${instance.dataSource.type}`);
              setLoading(false);
              return;
          }

          // Process folder ordering on the tree
          const processedTree = await processFolderOrdering(treeData);

          // Debug: Log the final tree structure
          log.debug(
            "Final processed tree structure",
            processedTree.map((node) => ({
              name: node.name,
              displayName: node.displayName,
              type: node.type,
              order: node.order,
            }))
          );

          if (processedTree.length === 0) {
            // Don't treat empty results as an error - show a helpful message instead
            setFileTree([]);
            setFilteredTree([]);
            setError(null); // Clear any previous errors
          } else {
            setFileTree(processedTree);
            setFilteredTree(processedTree);
          }
          setLoading(false);
        } catch (err) {
          console.error("Error fetching file tree:", err);
          setError("Failed to load file tree");
          setLoading(false);
        }
      };

      // Helper function to convert structure to FileNode format
      const convertStructureToFileNodes = async (
        structure: any,
        _basePath: string
      ): Promise<FileNode[]> => {
        if (!structure.children) return [];

        const nodes = await Promise.all(
          structure.children.map(async (child: any) => {
            const name = child.name || child.path.split("/").pop() || "Unknown";
            let title: string | undefined;
            let displayName = name;
            let orderValue: number | undefined;
            const isIndexFile = name.toLowerCase() === "index.md";

            console.log(
              `Processing child: ${child.path}, name: ${name}, isIndex: ${isIndexFile}`
            );

            // For markdown files, use metadata from structure file
            if (child.type === "file" && child.path.endsWith(".md")) {
              // Use metadata from structure file if available
              if (child.title) {
                title = child.title;
                // Add extension to display name for clarity
                const extension = name.split(".").pop() || "txt";
                displayName = `${title}.${extension}`;
              } else {
                // Fallback to filename (keep extension)
                displayName = name;
              }

              // Use order from structure file if available
              if (child.order !== undefined) {
                orderValue = child.order;
              }

              // Debug logging for index files
              if (isIndexFile) {
                console.log(
                  `Index file ${child.path}: title="${title}", displayName="${displayName}", order="${orderValue}"`
                );
              }
            }

            const node: FileNode = {
              name,
              path: `/markdowns/${child.path}`, // Prefix with /markdowns/ to access files via web server
              type: child.type,
              isExpanded: child.type === "directory", // Start directories as expanded
              title,
              displayName,
              order: orderValue,
              isIndex: isIndexFile,
              metadata: child.metadata || {},
            };

            if (child.children && child.children.length > 0) {
              node.children = await convertStructureToFileNodes(
                child,
                "" // No basePath needed since we use paths directly
              );
            }

            return node;
          })
        );

        // Sort nodes by order before returning
        return sortNodesByOrder(nodes);
      };

      // Helper function to sort nodes by order and handle folder ordering
      const sortNodesByOrder = (nodes: FileNode[]): FileNode[] => {
        return nodes.sort((a, b) => {
          // If both have order, sort by order
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          // If only one has order, prioritize the one with order
          if (a.order !== undefined) return -1;
          if (b.order !== undefined) return 1;
          // If neither has order, sort folders first, then files, both alphabetically
          if (a.type === "directory" && b.type === "file") {
            return -1;
          }
          if (a.type === "file" && b.type === "directory") {
            return 1;
          }
          // If both are the same type, sort alphabetically by displayName
          return a.displayName.localeCompare(b.displayName);
        });
      };

      // Helper function to process folder ordering based on index files
      const processFolderOrdering = async (
        nodes: FileNode[]
      ): Promise<FileNode[]> => {
        const processedNodes = await Promise.all(
          nodes.map(async (node) => {
            if (node.type === "directory" && node.children) {
              // Process children recursively first
              node.children = await processFolderOrdering(node.children);

              // Find index file in the directory
              const indexFile = node.children.find((child) => child.isIndex);
              if (indexFile) {
                console.log(
                  `Processing folder ${node.name}: indexFile.title="${indexFile.title}", indexFile.displayName="${indexFile.displayName}"`
                );
                // Apply the index file's order to the directory
                if (indexFile.order !== undefined) {
                  node.order = indexFile.order;
                  console.log(`Set folder ${node.name} order to ${node.order}`);
                }
                // Use the index file's title for the folder name if available
                if (indexFile.title) {
                  const oldDisplayName = node.displayName;
                  node.displayName = indexFile.title;
                  console.log(
                    `Updated folder ${node.name} displayName from "${oldDisplayName}" to "${node.displayName}"`
                  );
                } else {
                  console.log(
                    `No title found in index file for folder ${node.name}`
                  );
                }
              } else {
                console.log(`No index file found for folder ${node.name}`);
              }
              // Remove index files from children display
              node.children = node.children.filter((child) => !child.isIndex);
              // Sort the remaining children
              node.children = sortNodesByOrder(node.children);
            }
            return node;
          })
        );

        return sortNodesByOrder(processedNodes);
      };

      fetchFileTree();
    }, [instance, log, hideEmptyFolders, convertSupabaseDocumentsToFileNodes]);

    // Filter tree based on search term and empty folder preference
    useEffect(() => {
      if (!searchTerm.trim() && !hideEmptyFolders) {
        setFilteredTree(fileTree);
        return;
      }

      const filterTree = (nodes: FileNode[]): FileNode[] => {
        return nodes
          .map((node) => {
            const matchesSearch =
              !searchTerm.trim() ||
              node.displayName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              node.path.toLowerCase().includes(searchTerm.toLowerCase());

            if (node.type === "file") {
              return matchesSearch ? node : null;
            } else {
              // For directories, check if any children match
              const filteredChildren = node.children
                ? filterTree(node.children)
                : [];

              const _hasFiles = filteredChildren.some(
                (child) => child.type === "file" || child.type === "directory"
              );

              // Show directory if it matches search OR if it has matching children
              if (matchesSearch || filteredChildren.length > 0) {
                return {
                  ...node,
                  children: filteredChildren,
                  isExpanded: true, // Expand directories that match search
                };
              }
              return null;
            }
          })
          .filter((node): node is FileNode => node !== null);
      };

      setFilteredTree(filterTree(fileTree));
    }, [searchTerm, hideEmptyFolders, fileTree]);

    const toggleNode = (node: FileNode) => {
      if (node.type === "directory") {
        setFilteredTree((prevTree) => {
          const updateNode = (nodes: FileNode[]): FileNode[] => {
            return nodes.map((n) => {
              if (n.path === node.path) {
                return { ...n, isExpanded: !n.isExpanded };
              }
              if (n.children) {
                return { ...n, children: updateNode(n.children) };
              }
              return n;
            });
          };
          return updateNode(prevTree);
        });
      } else if (onFileSelect) {
        onFileSelect(node.path, node.metadata);
      }
    };

    const renderNode = (node: FileNode, depth: number = 0): React.ReactNode => {
      const isSelected = selectedFile === node.path;
      const isExpanded =
        node.isExpanded !== undefined ? node.isExpanded : depth === 0; // Root nodes start expanded but can be collapsed
      const isContextMenuTarget =
        contextMenu.visible && contextMenu.node?.path === node.path;

      if (editingNode?.node.path === node.path) {
        return (
          <div
            key={node.path}
            className={`file-tree-node ${isSelected ? "selected" : ""} ${isContextMenuTarget ? "context-menu-target" : ""}`}
            style={{
              paddingLeft: `${depth * 20}px`,
              color: isSelected
                ? getColor(theme.colors, "textInverse")
                : getColor(theme.colors, "text"),
            }}
            onClick={(e) => {
              e.stopPropagation();
              saveEdit();
            }}
            onMouseUp={(e) => {
              // Only stop propagation if the click is on the input or its container
              if (
                e.target === e.currentTarget ||
                e.target instanceof HTMLInputElement
              ) {
                e.stopPropagation();
              }
            }}
            onContextMenu={(event) => handleContextMenu(event, node)}
          >
            <div className="file-tree-node-content">
              {node.type === "directory" ? (
                <>
                  {isExpanded ? (
                    <ChevronDown
                      className="file-tree-icon"
                      size={16}
                      style={{
                        color: isSelected
                          ? getColor(theme.colors, "textInverse")
                          : getColor(theme.colors, "textSecondary"),
                      }}
                    />
                  ) : (
                    <ChevronRight
                      className="file-tree-icon"
                      size={16}
                      style={{
                        color: isSelected
                          ? getColor(theme.colors, "textInverse")
                          : getColor(theme.colors, "textSecondary"),
                      }}
                    />
                  )}
                  {isExpanded ? (
                    <FolderOpen
                      className="file-tree-icon"
                      size={16}
                      style={{
                        color: isSelected
                          ? getColor(theme.colors, "textInverse")
                          : getColor(theme.colors, "textSecondary"),
                      }}
                    />
                  ) : (
                    <Folder
                      className="file-tree-icon"
                      size={16}
                      style={{
                        color: isSelected
                          ? getColor(theme.colors, "textInverse")
                          : getColor(theme.colors, "textSecondary"),
                      }}
                    />
                  )}
                </>
              ) : (
                <>
                  <div className="file-tree-icon-placeholder" />
                  <FileText
                    className="file-tree-icon"
                    size={16}
                    style={{
                      color: isSelected
                        ? getColor(theme.colors, "textInverse")
                        : getColor(theme.colors, "textSecondary"),
                    }}
                  />
                </>
              )}
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveEdit();
                  } else if (e.key === "Escape") {
                    cancelEdit();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                autoFocus
                style={{
                  flex: 1,
                  padding: "2px 4px",
                  border: `1px solid ${getColor(theme.colors, "primary")}`,
                  borderRadius: "2px",
                  background: getColor(theme.colors, "background"),
                  color: getColor(theme.colors, "text"),
                  fontSize: "13px",
                  fontWeight: "600",
                  outline: "none",
                  boxSizing: "border-box",
                  minWidth: "100px",
                }}
              />
            </div>
          </div>
        );
      }

      return (
        <div key={node.path}>
          <div
            className={`file-tree-node ${isSelected ? "selected" : ""} ${isContextMenuTarget ? "context-menu-target" : ""} ${
              dragState.dropTarget?.path === node.path
                ? `drop-target drop-${dragState.dropPosition}`
                : ""
            } ${dragState.draggedNode?.path === node.path ? "dragging" : ""}`}
            style={{
              paddingLeft: `${depth * 20}px`,
              color: isSelected
                ? getColor(theme.colors, "textInverse")
                : getColor(theme.colors, "text"),
            }}
            draggable={!readOnly}
            onDragStart={(event) => handleDragStart(event, node)}
            onDragOver={(event) => handleDragOver(event, node)}
            onDragLeave={handleDragLeave}
            onDrop={(event) => handleDrop(event, node)}
            onDragEnd={handleDragEnd}
            onClick={() => {
              console.log("File tree node clicked:", node);
              console.log("onFileSelect available:", !!onFileSelect);
              if (node.type === "directory") {
                console.log("Node is directory, toggling");
                toggleNode(node);
              } else if (onFileSelect) {
                console.log(
                  "Calling onFileSelect with:",
                  node.path,
                  node.metadata
                );
                onFileSelect(node.path, node.metadata);
              } else {
                console.log("No onFileSelect callback available");
              }
            }}
            onDoubleClick={() => !readOnly && startEdit(node)}
            onContextMenu={(event) => handleContextMenu(event, node)}
          >
            <div className="file-tree-node-content">
              {node.type === "directory" ? (
                <>
                  {isExpanded ? (
                    <ChevronDown
                      className="file-tree-icon"
                      size={16}
                      style={{
                        color: isSelected
                          ? getColor(theme.colors, "textInverse")
                          : getColor(theme.colors, "textSecondary"),
                      }}
                    />
                  ) : (
                    <ChevronRight
                      className="file-tree-icon"
                      size={16}
                      style={{
                        color: isSelected
                          ? getColor(theme.colors, "textInverse")
                          : getColor(theme.colors, "textSecondary"),
                      }}
                    />
                  )}
                  {isExpanded ? (
                    <FolderOpen
                      className="file-tree-icon"
                      size={16}
                      style={{
                        color: isSelected
                          ? getColor(theme.colors, "textInverse")
                          : getColor(theme.colors, "textSecondary"),
                      }}
                    />
                  ) : (
                    <Folder
                      className="file-tree-icon"
                      size={16}
                      style={{
                        color: isSelected
                          ? getColor(theme.colors, "textInverse")
                          : getColor(theme.colors, "textSecondary"),
                      }}
                    />
                  )}
                </>
              ) : (
                <>
                  <div className="file-tree-icon-placeholder" />
                  <FileText
                    className="file-tree-icon"
                    size={16}
                    style={{
                      color: isSelected
                        ? getColor(theme.colors, "textInverse")
                        : getColor(theme.colors, "textSecondary"),
                    }}
                  />
                </>
              )}
              <span
                className="file-tree-name"
                style={{
                  color: isSelected
                    ? getColor(theme.colors, "textInverse")
                    : getColor(theme.colors, "text"),
                }}
              >
                {node.displayName}
              </span>
            </div>
          </div>
          {node.type === "directory" && isExpanded && node.children && (
            <div className="file-tree-children">
              {node.children.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    };

    if (loading) {
      return (
        <div
          className={`file-tree-container ${className}`}
          style={{
            backgroundColor: getColor(theme.colors, "background"),
            color: getColor(theme.colors, "text"),
          }}
        >
          <div
            className="file-tree-loading"
            style={{
              color: getColor(theme.colors, "textSecondary"),
            }}
          >
            Loading file tree...
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div
          className={`file-tree-container ${className}`}
          style={{
            backgroundColor: getColor(theme.colors, "background"),
            color: getColor(theme.colors, "text"),
          }}
        >
          <div
            className="file-tree-error"
            style={{
              color: getColor(theme.colors, "error"),
            }}
          >
            <h3
              style={{
                color: getColor(theme.colors, "error"),
              }}
            >
              Error Loading File Tree
            </h3>
            <p>{error}</p>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`file-tree-container ${className}`}
        style={
          {
            backgroundColor: getColor(theme.colors, "background"),
            color: getColor(theme.colors, "text"),
            borderRight: `1px solid ${getColor(theme.colors, "border")}`,
            "--primary-selection-bg": `${getColor(theme.colors, "primary")}15`,
            "--primary-selection-bg-strong": `${getColor(theme.colors, "primary")}25`,
            "--primary-selection-bg-dark": `${getColor(theme.colors, "primary")}20`,
            "--primary-selection-bg-strong-dark": `${getColor(theme.colors, "primary")}35`,
            "--primary-selection-text": getColor(theme.colors, "primary"),
            "--primary-selection-text-dark": getColor(theme.colors, "primary"),
          } as React.CSSProperties
        }
      >
        {showHeader && (
          <div
            className="file-tree-header"
            style={{
              backgroundColor: getColor(theme.colors, "backgroundSecondary"),
              borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h3
                style={{
                  color: getColor(theme.colors, "text"),
                  margin: "0",
                  fontSize: "14px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {headerTitle || instance.name}
              </h3>

              {showCreateButtons && (
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <Tooltip title="New Document">
                    <button
                      onClick={handleCreateDocument}
                      disabled={isCreating}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "6px",
                        fontSize: "12px",
                        backgroundColor: getColor(theme.colors, "surface"),
                        color: getColor(theme.colors, "text"),
                        border: "none",
                        borderRadius: "4px",
                        cursor: isCreating ? "not-allowed" : "pointer",
                        opacity: isCreating ? 0.6 : 1,
                        transition: "opacity 0.2s",
                        minWidth: "32px",
                        minHeight: "32px",
                      }}
                    >
                      <FilePlus size={16} />
                    </button>
                  </Tooltip>

                  <Tooltip title="New Folder">
                    <button
                      onClick={handleCreateFolder}
                      disabled={isCreating}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "6px",
                        fontSize: "12px",
                        backgroundColor: getColor(theme.colors, "surface"),
                        color: getColor(theme.colors, "text"),
                        border: "none",
                        borderRadius: "4px",
                        cursor: isCreating ? "not-allowed" : "pointer",
                        opacity: isCreating ? 0.6 : 1,
                        transition: "opacity 0.2s",
                        minWidth: "32px",
                        minHeight: "32px",
                      }}
                    >
                      <FolderPlus size={16} />
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>

            {showSearch && (
              <div className="file-tree-search">
                <div className="file-tree-search-input-wrapper">
                  <Search
                    size={16}
                    style={{
                      color: getColor(theme.colors, "textSecondary"),
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search files and folders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="file-tree-search-input"
                    style={{
                      padding: "8px 12px 8px 36px",
                      border: `1px solid ${getColor(theme.colors, "border")}`,
                      borderRadius: "6px",
                      fontSize: "13px",
                      backgroundColor: getColor(theme.colors, "background"),
                      color: getColor(theme.colors, "text"),
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        <div className="file-tree-content">
          {filteredTree.length === 0 && searchTerm ? (
            <div
              className="file-tree-no-results"
              style={{
                padding: "20px",
                textAlign: "center",
                color: getColor(theme.colors, "textSecondary"),
                fontSize: "13px",
              }}
            >
              No files or folders match &quot;{searchTerm}&quot;
            </div>
          ) : filteredTree.length === 0 ? (
            <div
              className="file-tree-empty"
              style={{
                padding: "20px",
                textAlign: "center",
                color: getColor(theme.colors, "textSecondary"),
                fontSize: "13px",
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                <FileText size={24} style={{ opacity: 0.5 }} />
              </div>
              <div style={{ marginBottom: "8px", fontWeight: "500" }}>
                No documents found
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                {instance.dataSource.type === "supabase"
                  ? "Create your first document to get started"
                  : "No files available in this directory"}
              </div>
            </div>
          ) : (
            filteredTree.map((node) => renderNode(node))
          )}
        </div>
        {contextMenu.visible && (
          <div
            className="context-menu"
            style={{
              position: "fixed",
              left: contextMenu.x,
              top: contextMenu.y,
              backgroundColor: getColor(theme.colors, "background"),
              border: `1px solid ${getColor(theme.colors, "border")}`,
              borderRadius: "4px",
              padding: "4px 0",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              zIndex: 1000,
              minWidth: "120px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="context-menu-item"
              onClick={() => handleContextMenuAction("document")}
              style={{
                display: "block",
                width: "100%",
                padding: "8px 12px",
                border: "none",
                background: "none",
                color: getColor(theme.colors, "text"),
                cursor: "pointer",
                textAlign: "left",
                fontSize: "14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = getColor(
                  theme.colors,
                  "backgroundSecondary"
                );
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <FilePlus size={16} style={{ marginRight: "8px" }} />
              New Document
            </button>
            <button
              className="context-menu-item"
              onClick={() => handleContextMenuAction("folder")}
              style={{
                display: "block",
                width: "100%",
                padding: "8px 12px",
                border: "none",
                background: "none",
                color: getColor(theme.colors, "text"),
                cursor: "pointer",
                textAlign: "left",
                fontSize: "14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = getColor(
                  theme.colors,
                  "backgroundSecondary"
                );
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <FolderPlus size={16} style={{ marginRight: "8px" }} />
              New Folder
            </button>
            <button
              className="context-menu-item"
              onClick={() => handleContextMenuAction("rename")}
              style={{
                display: "block",
                width: "100%",
                padding: "8px 12px",
                border: "none",
                background: "none",
                color: getColor(theme.colors, "text"),
                cursor: "pointer",
                textAlign: "left",
                fontSize: "14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = getColor(
                  theme.colors,
                  "backgroundSecondary"
                );
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <FileText size={16} style={{ marginRight: "8px" }} />
              Rename
            </button>
            <button
              className="context-menu-item"
              onClick={() => handleContextMenuAction("delete")}
              style={{
                display: "block",
                width: "100%",
                padding: "8px 12px",
                border: "none",
                background: "none",
                color: getColor(theme.colors, "text"),
                cursor: "pointer",
                textAlign: "left",
                fontSize: "14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = getColor(
                  theme.colors,
                  "backgroundSecondary"
                );
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Trash size={16} style={{ marginRight: "8px" }} />
              Delete
            </button>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if these props change
    return (
      prevProps.selectedFile === nextProps.selectedFile &&
      prevProps.className === nextProps.className &&
      prevProps.showHeader === nextProps.showHeader &&
      prevProps.headerTitle === nextProps.headerTitle &&
      prevProps.showSearch === nextProps.showSearch &&
      prevProps.showCreateButtons === nextProps.showCreateButtons &&
      prevProps.hideEmptyFolders === nextProps.hideEmptyFolders &&
      prevProps.instance.id === nextProps.instance.id
    );
  }
);
