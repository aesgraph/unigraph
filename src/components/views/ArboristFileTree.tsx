import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import {
  ChevronDown,
  ChevronRight,
  Code,
  File,
  FilePlus,
  FileText,
  Folder,
  FolderPlus,
  Image,
  Settings,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { Tree } from "react-arborist";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  content?: string;
  language?: string;
}

interface ArboristFileTreeProps {
  files: Record<string, string>;
  onFileSelect?: (filePath: string) => void;
  onFileCreate?: (path: string, content: string) => void;
  onFileDelete?: (path: string) => void;
  onFileRename?: (oldPath: string, newPath: string) => void;
  selectedFile?: string;
  height?: string | number;
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
      return <Code size={16} />;
    case "html":
    case "htm":
    case "css":
    case "scss":
    case "sass":
    case "md":
    case "txt":
      return <FileText size={16} />;
    case "json":
      return <Settings size={16} />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
      return <Image size={16} />;
    default:
      return <File size={16} />;
  }
};

const getFolderIcon = (isOpen: boolean) => {
  return isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />;
};

const buildFileTree = (files: Record<string, string>): FileNode[] => {
  const tree: FileNode[] = [];
  const fileMap = new Map<string, FileNode>();

  // Sort files by path
  const sortedFiles = Object.keys(files).sort();

  sortedFiles.forEach((filePath) => {
    const pathParts = filePath.split("/").filter((part) => part !== "");
    let currentPath = "";
    let parentNode: FileNode | null = null;

    // Create folder structure
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      currentPath += (currentPath ? "/" : "") + part;

      if (!fileMap.has(currentPath)) {
        const folderNode: FileNode = {
          id: currentPath,
          name: part,
          type: "folder",
          path: currentPath,
          children: [],
        };
        fileMap.set(currentPath, folderNode);

        if (parentNode) {
          parentNode.children!.push(folderNode);
        } else {
          tree.push(folderNode);
        }
      }
      parentNode = fileMap.get(currentPath)!;
    }

    // Create file node
    const fileName = pathParts[pathParts.length - 1];
    const fileNode: FileNode = {
      id: filePath,
      name: fileName,
      type: "file",
      path: filePath,
      content: files[filePath],
    };

    if (parentNode) {
      parentNode.children!.push(fileNode);
    } else {
      tree.push(fileNode);
    }
  });

  return tree;
};

export const ArboristFileTree: React.FC<ArboristFileTreeProps> = ({
  files,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
  selectedFile,
  height = "100%",
}) => {
  const fileTree = useMemo(() => buildFileTree(files), [files]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameInput, setRenameInput] = useState("");

  const handleCreateFile = () => {
    const newPath = "/new-file.js";
    onFileCreate?.(newPath, "// New file\n");
  };

  const handleCreateFolder = () => {
    const newPath = `/new-folder-${Date.now()}`;
    onFileCreate?.(newPath, "");
  };

  const handleRename = (node: any) => {
    setIsRenaming(true);
    setRenameInput(node.data.name);
  };

  const handleRenameSubmit = (node: any) => {
    if (renameInput.trim() && renameInput !== node.data.name) {
      const oldPath = node.data.path;
      const newPath = oldPath.replace(node.data.name, renameInput.trim());
      onFileRename?.(oldPath, newPath);
    }
    setIsRenaming(false);
    setRenameInput("");
  };

  const handleRenameCancel = () => {
    setIsRenaming(false);
    setRenameInput("");
  };

  const handleDelete = (node: any) => {
    onFileDelete?.(node.data.path);
  };

  return (
    <Box
      sx={{
        height,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#1f2937",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 1,
          borderBottom: 1,
          borderColor: "#374151",
          bgcolor: "#111827",
          color: "white",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: "white" }}
        >
          Explorer
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="New File">
            <IconButton
              size="small"
              onClick={handleCreateFile}
              sx={{
                color: "#9ca3af",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                },
              }}
            >
              <FilePlus size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="New Folder">
            <IconButton
              size="small"
              onClick={handleCreateFolder}
              sx={{
                color: "#9ca3af",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                },
              }}
            >
              <FolderPlus size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* React Arborist Tree */}
      <Box sx={{ flex: 1, overflow: "hidden", bgcolor: "#1f2937" }}>
        <Tree
          data={fileTree}
          indent={24}
          rowHeight={28}
          overscanCount={1}
          paddingTop={0}
          paddingBottom={0}
          className="file-tree"
          onMove={({ dragIds, parentId, index }) => {
            // Handle drag and drop
            console.log("Move:", { dragIds, parentId, index });

            if (dragIds.length === 0) return;

            const draggedNodeId = dragIds[0];
            const draggedNode = fileTree.find(
              (node) => node.id === draggedNodeId
            );

            if (!draggedNode) return;

            // Find the new parent path
            let newParentPath = "/";
            if (parentId && parentId !== "root") {
              const parentNode = fileTree.find((node) => node.id === parentId);
              if (parentNode) {
                newParentPath = parentNode.path;
              }
            }

            // Calculate new path
            const oldPath = draggedNode.path;
            const fileName = draggedNode.name;
            const newPath =
              newParentPath === "/"
                ? `/${fileName}`
                : `${newParentPath}/${fileName}`;

            console.log(`Moving ${oldPath} to ${newPath}`);

            // Simple approach: just rename the node path
            // The tree will rebuild automatically based on the new file structure
            if (draggedNode.type === "folder") {
              // For folders, we need to update all child file paths
              Object.keys(files).forEach((filePath) => {
                if (filePath.startsWith(oldPath + "/")) {
                  const relativePath = filePath.substring(oldPath.length);
                  const newFilePath = newPath + relativePath;
                  console.log(`Moving file: ${filePath} -> ${newFilePath}`);
                  onFileRename?.(filePath, newFilePath);
                }
              });
            } else {
              // For files, just move the single file
              onFileRename?.(oldPath, newPath);
            }
          }}
        >
          {({ node, style, dragHandle }) => {
            const isSelected = selectedFile === node.data.path;
            const isFile = node.data.type === "file";
            const isFolder = node.data.type === "folder";
            const hasChildren =
              node.data.children && node.data.children.length > 0;
            const isEditing = isRenaming && node.data.name === renameInput;

            return (
              <div
                ref={dragHandle}
                style={{
                  ...style,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 8,
                  paddingRight: 8,
                  paddingTop: 4,
                  paddingBottom: 4,
                  backgroundColor: isSelected
                    ? "rgba(96, 165, 250, 0.3)"
                    : "transparent",
                  borderLeft: isSelected
                    ? "3px solid #60a5fa"
                    : "3px solid transparent",
                  cursor: "pointer",
                  userSelect: "none",
                  color: isSelected ? "#60a5fa" : "#d1d5db",
                }}
                onClick={() => {
                  if (isEditing) return;
                  if (isFile) {
                    onFileSelect?.(node.data.path);
                  } else if (isFolder) {
                    node.toggle();
                  }
                }}
                onDoubleClick={() => {
                  if (!isEditing) {
                    handleRename(node);
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  // Simple context menu - could be enhanced with a proper menu component
                  const action = prompt(
                    `Actions for "${node.data.name}":\n1. Rename\n2. Delete\n3. Cancel`,
                    "1"
                  );
                  if (action === "1") {
                    handleRename(node);
                  } else if (action === "2") {
                    handleDelete(node);
                  }
                }}
                onMouseEnter={(e) => {
                  if (!isSelected && !isEditing) {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 255, 255, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected && !isEditing) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {/* Expand/Collapse icon for folders */}
                  {isFolder && hasChildren && (
                    <Box
                      sx={{
                        color: isSelected ? "#60a5fa" : "#9ca3af",
                        display: "flex",
                        alignItems: "center",
                        width: "16px",
                        height: "16px",
                        flexShrink: 0,
                      }}
                    >
                      {getFolderIcon(node.isOpen)}
                    </Box>
                  )}

                  {/* Spacer for files or empty folders */}
                  {(!isFolder || !hasChildren) && (
                    <Box
                      sx={{ width: "16px", height: "16px", flexShrink: 0 }}
                    />
                  )}

                  {/* File/Folder icon */}
                  <Box
                    sx={{
                      color: isSelected ? "#60a5fa" : "#9ca3af",
                      flexShrink: 0,
                    }}
                  >
                    {isFolder ? (
                      <Folder size={16} />
                    ) : (
                      getFileIcon(node.data.name)
                    )}
                  </Box>

                  {/* Name display or edit input */}
                  {isEditing ? (
                    <Box sx={{ flex: 1, minWidth: 0, position: "relative" }}>
                      <input
                        value={renameInput}
                        onChange={(e) => setRenameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleRenameSubmit(node);
                          } else if (e.key === "Escape") {
                            handleRenameCancel();
                          }
                        }}
                        onBlur={() => handleRenameSubmit(node)}
                        style={{
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          color: "#60a5fa",
                          fontSize: "0.875rem",
                          fontWeight: isFile ? 400 : 500,
                          width: "100%",
                          padding: 0,
                          margin: 0,
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: 0,
                          bottom: 0,
                          fontFamily: "inherit",
                          lineHeight: "inherit",
                          overflow: "visible",
                          textOverflow: "clip",
                          whiteSpace: "nowrap",
                        }}
                        autoFocus
                      />
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: isFile ? 400 : 500,
                        color: isSelected ? "#60a5fa" : "#d1d5db",
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {node.data.name}
                    </Typography>
                  )}
                </Box>
              </div>
            );
          }}
        </Tree>
      </Box>
    </Box>
  );
};

export default ArboristFileTree;
