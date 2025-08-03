import {
  SandpackCodeEditor,
  SandpackPreview,
  SandpackProvider,
  useActiveCode,
  useSandpack,
  type SandpackPredefinedTemplate,
} from "@codesandbox/sandpack-react";
import { nightOwl } from "@codesandbox/sandpack-themes";
import { Box, Divider } from "@mui/material";
import React, { useEffect, useState } from "react";
import ArboristFileTree from "./ArboristFileTree";

interface SandpackEditorWithFileTreeProps {
  template?: SandpackPredefinedTemplate;
  files?: Record<string, string>;
  theme?: "dark" | "light";
  height?: string | number;
  title?: string;
  showFileTree?: boolean;
  fileTreeWidth?: number;
}

const defaultFiles = {
  "/App.js": `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Welcome to Unigraph Sandpack Editor!</h1>
      <p>This is a live code editor with custom file tree and preview.</p>
      <p>Count: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Increment
      </button>
    </div>
  );
}`,
  "/styles.css": `body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

div {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #333;
  margin-bottom: 16px;
}

p {
  color: #666;
  line-height: 1.6;
}

button:hover {
  background-color: #0056b3 !important;
}`,
  "/components/Header.js": `import React from 'react';

export const Header = ({ title }) => {
  return (
    <header style={{
      backgroundColor: '#333',
      color: 'white',
      padding: '1rem',
      textAlign: 'center'
    }}>
      <h1>{title}</h1>
    </header>
  );
};`,
  "/utils/helpers.js": `// Utility functions
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};`,
  "/package.json": `{
  "name": "unigraph-sandpack-demo",
  "version": "1.0.0",
  "description": "A demo project in Unigraph Sandpack Editor",
  "main": "index.js",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}`,
  "/README.md": `# Unigraph Sandpack Demo

This is a demo project showcasing the Unigraph Sandpack Editor with custom file tree.

## Features

- Custom file tree with folder expansion
- File icons based on file type
- Context menu for file operations
- Live preview of code changes
- Syntax highlighting

## Getting Started

1. Open any file in the file tree
2. Edit the code in the editor
3. See live changes in the preview panel

## File Structure

- \`/App.js\` - Main React component
- \`/styles.css\` - Global styles
- \`/components/\` - React components
- \`/utils/\` - Utility functions
`,
};

// Component that handles the active file switching
const SandpackEditorContent: React.FC<{
  selectedFile: string;
  files: Record<string, string>;
  onFileUpdate: (path: string, content: string) => void;
}> = ({ selectedFile, files, onFileUpdate }) => {
  const { sandpack } = useSandpack();
  const { code } = useActiveCode();

  // Sync file content changes back to our file system
  useEffect(() => {
    if (selectedFile && code !== files[selectedFile]) {
      console.log("Code changed for file:", selectedFile);
      console.log("New code:", code);
      onFileUpdate(selectedFile, code);
    }
  }, [code, selectedFile, files, onFileUpdate]);

  // Debug: Log current active file
  useEffect(() => {
    console.log("Active file in sandpack:", sandpack.activeFile);
    console.log("Selected file:", selectedFile);
  }, [sandpack.activeFile, selectedFile]);

  return (
    <Box
      sx={{ flex: 1, display: "flex", flexDirection: "row", height: "100%" }}
    >
      {/* Code Editor */}
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          borderRight: 1,
          borderColor: "divider",
        }}
      >
        <SandpackCodeEditor showLineNumbers showInlineErrors wrapContent />
      </Box>

      {/* Preview */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <SandpackPreview />
      </Box>
    </Box>
  );
};

export const SandpackEditorWithFileTree: React.FC<
  SandpackEditorWithFileTreeProps
> = ({
  template = "react",
  files = defaultFiles,
  theme: _theme = "dark",
  height: _height = "100%",
  title: _title = "Sandpack Editor with File Tree",
  showFileTree = true,
  fileTreeWidth = 250,
}) => {
  // Single source of truth for all files
  const [currentFiles, setCurrentFiles] =
    useState<Record<string, string>>(files);
  const [selectedFile, setSelectedFile] = useState<string>("/App.js");

  // Update currentFiles when external files prop changes
  useEffect(() => {
    setCurrentFiles(files);
  }, [files]);

  const handleFileSelect = (filePath: string) => {
    console.log("File selected:", filePath);
    setSelectedFile(filePath);
  };

  const handleFileCreate = (path: string, content: string) => {
    setCurrentFiles((prev) => ({
      ...prev,
      [path]: content,
    }));
  };

  const handleFileDelete = (path: string) => {
    setCurrentFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[path];
      return newFiles;
    });

    // If the deleted file was selected, select the first available file
    if (selectedFile === path) {
      const remainingFiles = Object.keys(currentFiles).filter(
        (p) => p !== path
      );
      if (remainingFiles.length > 0) {
        setSelectedFile(remainingFiles[0]);
      }
    }
  };

  const handleFileRename = (oldPath: string, newPath: string) => {
    setCurrentFiles((prev) => {
      const newFiles = { ...prev };
      const content = newFiles[oldPath];
      delete newFiles[oldPath];
      newFiles[newPath] = content;
      return newFiles;
    });

    if (selectedFile === oldPath) {
      setSelectedFile(newPath);
    }
  };

  const handleFileUpdate = (path: string, content: string) => {
    setCurrentFiles((prev) => ({
      ...prev,
      [path]: content,
    }));
  };

  return (
    <Box
      sx={{
        height: _height,
        display: "flex",
        flexDirection: "row",
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
      {/* Custom File Tree */}
      {showFileTree && (
        <>
          <Box sx={{ width: fileTreeWidth, flexShrink: 0 }}>
            <ArboristFileTree
              files={currentFiles}
              onFileSelect={handleFileSelect}
              onFileCreate={handleFileCreate}
              onFileDelete={handleFileDelete}
              onFileRename={handleFileRename}
              selectedFile={selectedFile}
              height="100%"
            />
          </Box>
          <Divider orientation="vertical" flexItem />
        </>
      )}

      {/* Sandpack Editor and Preview */}
      <Box sx={{ flex: 1, height: "100%" }}>
        <SandpackProvider
          key={`sandpack-${selectedFile}-${Object.keys(currentFiles).length}`}
          template={template}
          files={currentFiles}
          theme={nightOwl}
          options={{
            autorun: true,
            activeFile: selectedFile,
          }}
        >
          <SandpackEditorContent
            selectedFile={selectedFile}
            files={currentFiles}
            onFileUpdate={handleFileUpdate}
          />
        </SandpackProvider>
      </Box>
    </Box>
  );
};

export default SandpackEditorWithFileTree;
