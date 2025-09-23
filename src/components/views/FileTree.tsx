import {
  Box,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Code,
  File,
  FileEdit,
  FilePlus,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  Image,
  Settings,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  content?: string;
  language?: string;
}

interface FileTreeProps {
  files: Record<string, string>;
  onFileSelect?: (filePath: string) => void;
  onFileCreate?: (path: string, content: string) => void;
  onFileDelete?: (path: string) => void;
  onFileRename?: (oldPath: string, newPath: string) => void;
  selectedFile?: string;
  height?: string | number;
}

const getFileIcon = (fileName: string, _language?: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
      return <Code size={16} />;
    case "html":
    case "htm":
      return <FileText size={16} />;
    case "css":
    case "scss":
    case "sass":
      return <FileText size={16} />;
    case "json":
      return <Settings size={16} />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
      return <Image size={16} />;
    case "md":
    case "txt":
      return <FileText size={16} />;
    default:
      return <File size={16} />;
  }
};

const getLanguageFromExtension = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "html":
    case "htm":
      return "html";
    case "css":
      return "css";
    case "scss":
    case "sass":
      return "scss";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "txt":
      return "text";
    default:
      return "text";
  }
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
      language: getLanguageFromExtension(fileName),
    };

    if (parentNode) {
      parentNode.children!.push(fileNode);
    } else {
      tree.push(fileNode);
    }
  });

  return tree;
};

const FileTreeItem: React.FC<{
  node: FileNode;
  level: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (path: string) => void;
  onContextMenu: (event: React.MouseEvent, node: FileNode) => void;
  selectedFile?: string;
}> = ({
  node,
  level,
  expanded,
  onToggle,
  onSelect,
  onContextMenu,
  selectedFile,
}) => {
  const isExpanded = expanded.has(node.id);
  const isSelected = selectedFile === node.path;
  const hasChildren = node.children && node.children.length > 0;

  const handleClick = () => {
    if (node.type === "folder") {
      onToggle(node.id);
    } else {
      onSelect(node.path);
    }
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    onContextMenu(event, node);
  };

  return (
    <>
      <ListItem
        disablePadding
        sx={{
          pl: level * 2,
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        <ListItemButton
          selected={isSelected}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          sx={{
            minHeight: 32,
            py: 0.5,
          }}
        >
          <ListItemIcon sx={{ minWidth: 24 }}>
            {node.type === "folder" ? (
              isExpanded ? (
                <FolderOpen size={16} />
              ) : (
                <Folder size={16} />
              )
            ) : (
              getFileIcon(node.name, node.language)
            )}
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                variant="body2"
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: node.type === "folder" ? 500 : 400,
                }}
              >
                {node.name}
              </Typography>
            }
          />
        </ListItemButton>
      </ListItem>

      {node.type === "folder" && hasChildren && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {node.children!.map((child) => (
              <FileTreeItem
                key={child.id}
                node={child}
                level={level + 1}
                expanded={expanded}
                onToggle={onToggle}
                onSelect={onSelect}
                onContextMenu={onContextMenu}
                selectedFile={selectedFile}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename: _onFileRename,
  selectedFile,
  height = "100%",
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    node: FileNode | null;
  }>({
    mouseX: 0,
    mouseY: 0,
    node: null,
  });

  const fileTree = buildFileTree(files);

  const handleToggle = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const handleFileSelect = (path: string) => {
    onFileSelect?.(path);
  };

  const handleContextMenu = (event: React.MouseEvent, node: FileNode) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      node,
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu({
      mouseX: 0,
      mouseY: 0,
      node: null,
    });
  };

  const handleCreateFile = () => {
    if (contextMenu.node) {
      const parentPath =
        contextMenu.node.type === "folder"
          ? contextMenu.node.path
          : contextMenu.node.path.substring(
              0,
              contextMenu.node.path.lastIndexOf("/")
            );
      const newPath = `${parentPath}/new-file.js`;
      onFileCreate?.(newPath, "// New file\n");
    }
    handleContextMenuClose();
  };

  const handleCreateFolder = () => {
    if (contextMenu.node) {
      const parentPath =
        contextMenu.node.type === "folder"
          ? contextMenu.node.path
          : contextMenu.node.path.substring(
              0,
              contextMenu.node.path.lastIndexOf("/")
            );
      const newPath = `${parentPath}/new-folder`;
      onFileCreate?.(newPath, "");
    }
    handleContextMenuClose();
  };

  const handleDelete = () => {
    if (contextMenu.node) {
      onFileDelete?.(contextMenu.node.path);
    }
    handleContextMenuClose();
  };

  const handleRename = () => {
    // Implementation for rename functionality
    console.log("Rename functionality");
    handleContextMenuClose();
  };

  return (
    <Box sx={{ height, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 1,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Explorer
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="New File">
            <IconButton size="small">
              <FilePlus size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="New Folder">
            <IconButton size="small">
              <FolderPlus size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* File Tree */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <List dense disablePadding>
          {fileTree.map((node) => (
            <FileTreeItem
              key={node.id}
              node={node}
              level={0}
              expanded={expanded}
              onToggle={handleToggle}
              onSelect={handleFileSelect}
              onContextMenu={handleContextMenu}
              selectedFile={selectedFile}
            />
          ))}
        </List>
      </Box>

      {/* Context Menu */}
      <Menu
        open={contextMenu.node !== null}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu.node !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleCreateFile}>
          <ListItemIcon>
            <FilePlus size={16} />
          </ListItemIcon>
          New File
        </MenuItem>
        <MenuItem onClick={handleCreateFolder}>
          <ListItemIcon>
            <FolderPlus size={16} />
          </ListItemIcon>
          New Folder
        </MenuItem>
        <MenuItem onClick={handleRename}>
          <ListItemIcon>
            <FileEdit size={16} />
          </ListItemIcon>
          Rename
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <Trash2 size={16} />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default FileTree;
