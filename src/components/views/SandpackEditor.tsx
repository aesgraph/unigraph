import {
  Sandpack,
  type SandpackPredefinedTemplate,
} from "@codesandbox/sandpack-react";
import { nightOwl } from "@codesandbox/sandpack-themes";
import { Box } from "@mui/material";
import React, { useState } from "react";

interface SandpackEditorProps {
  template?: SandpackPredefinedTemplate;
  files?: Record<string, string>;
  theme?: "dark" | "light";
  showFileExplorer?: boolean;
  showCodeEditor?: boolean;
  showPreview?: boolean;
  height?: string | number;
  title?: string;
}

const defaultFiles = {
  "/App.js": `import React from 'react';

export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Welcome to Unigraph Sandpack Editor!</h1>
      <p>This is a live code editor with file tree and preview.</p>
      <p>Edit the code and see changes in real-time.</p>
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
}`,
  "/package.json": `{
  "name": "unigraph-sandpack-demo",
  "version": "1.0.0",
  "description": "A demo project in Unigraph Sandpack Editor",
  "main": "index.js",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}`,
};

export const SandpackEditor: React.FC<SandpackEditorProps> = ({
  template = "react",
  files = defaultFiles,
  // eslint-disable-next-line unused-imports/no-unused-vars
  theme = "dark",
  showFileExplorer: _showFileExplorer = true,
  showCodeEditor: _showCodeEditor = true,
  showPreview: _showPreview = true,
  height: _height = "600px",
  title: _title = "Sandpack Editor",
}) => {
  const [isRunning, _] = useState(true);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        "& .sp-wrapper": {
          height: "100% !important",
        },
        "& .sp-layout": {
          height: "100% !important",
        },
        "& .sp-stack": {
          height: "100% !important",
        },
      }}
    >
      {/* Sandpack Content */}
      <Box sx={{ flex: 1, overflow: "hidden", height: "100%" }}>
        <Sandpack
          template={template}
          files={files}
          theme={nightOwl}
          options={{
            autorun: isRunning,
            showNavigator: true,
            showTabs: true,
            showLineNumbers: true,
            showInlineErrors: true,
            wrapContent: true,
          }}
        />
      </Box>
    </Box>
  );
};

// Alternative component with all panels visible at once
export const SandpackEditorFull: React.FC<SandpackEditorProps> = ({
  template = "react",
  files = defaultFiles,
  // eslint-disable-next-line unused-imports/no-unused-vars
  theme = "dark",
  height: _height = "600px",
  title: _title = "Sandpack Editor",
}) => {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        "& .sp-wrapper": {
          height: "100% !important",
        },
        "& .sp-layout": {
          height: "100% !important",
        },
        "& .sp-stack": {
          height: "100% !important",
        },
      }}
    >
      {/* Full Sandpack Layout */}
      <Box sx={{ flex: 1, overflow: "hidden", height: "100%" }}>
        <Sandpack
          template={template}
          files={files}
          theme={nightOwl}
          options={{
            autorun: true,
            showNavigator: true,
            showTabs: true,
            showLineNumbers: true,
            showInlineErrors: true,
            wrapContent: true,
          }}
        />
      </Box>
    </Box>
  );
};

export default SandpackEditor;
