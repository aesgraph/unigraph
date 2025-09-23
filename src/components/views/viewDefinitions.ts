// Shared view definitions for AppShell and WorkspaceLayoutTool
// This ensures consistency between registered views and available views for AI tools

export interface ViewDefinition {
  id: string;
  title: string;
  icon: string;
  category: string;
  description: string;
}

export const VIEW_DEFINITIONS: Record<string, ViewDefinition> = {
  "ai-chat": {
    id: "ai-chat",
    title: "AI Chat",
    icon: "💬",
    category: "communication",
    description:
      "Interactive AI chat interface with support for semantic web queries and tool calls",
  },
  "semantic-web-query": {
    id: "semantic-web-query",
    title: "SPARQL Querier",
    icon: "🔍",
    category: "data",
    description: "SPARQL querier for fetching data from the Semantic Web",
  },
  "force-graph-3d": {
    id: "force-graph-3d",
    title: "ForceGraph 3D",
    icon: "🌐",
    category: "visualization",
    description:
      "Interactive 3D force-directed graph visualization with physics simulation",
  },
  "force-graph-3d-v2": {
    id: "force-graph-3d-v2",
    title: "ForceGraph 3D V2",
    icon: "🚀",
    category: "visualization",
    description:
      "Interactive 3D force-directed graph visualization with physics simulation (V2)",
  },
  "monaco-editor": {
    id: "monaco-editor",
    title: "Monaco Editor",
    icon: "💻",
    category: "development",
    description:
      "Full-featured code editor with syntax highlighting, IntelliSense, and debugging support",
  },
  "system-monitor": {
    id: "system-monitor",
    title: "System Monitor",
    icon: "📊",
    category: "tools",
    description: "Real-time system monitoring and performance metrics display",
  },
  "node-legend": {
    id: "node-legend",
    title: "Node Legend",
    icon: "🔵",
    category: "data",
    description:
      "Legend showing node types and their visual representations in the graph",
  },
  "edge-legend": {
    id: "edge-legend",
    title: "Edge Legend",
    icon: "🔗",
    category: "data",
    description:
      "Legend showing edge types and their visual representations in the graph",
  },
  "entity-table-v2": {
    id: "entity-table-v2",
    title: "Entity Table",
    icon: "📋",
    category: "data",
    description:
      "Tabular view of all entities (nodes) in the current graph with filtering and sorting",
  },
  "custom-themed-panel": {
    id: "custom-themed-panel",
    title: "Theme Demo",
    icon: "🎨",
    category: "development",
    description: "Demonstration of theme inheritance and styling capabilities",
  },
  "theme-inheritance-demo": {
    id: "theme-inheritance-demo",
    title: "Theme Inheritance",
    icon: "🎭",
    category: "development",
    description:
      "Interactive demo showing how components inherit theme styles from the workspace",
  },
  "wikipedia-factor-graph": {
    id: "wikipedia-factor-graph",
    title: "Wikipedia Factor Graph",
    icon: "📚",
    category: "tools",
    description:
      "Interactive Wikipedia article viewer with factor graph visualization",
  },
  "gravity-simulation": {
    id: "gravity-simulation",
    title: "Gravity Simulation",
    icon: "🌌",
    category: "simulation",
    description:
      "WebGL-based gravity simulation with interactive particle physics",
  },
  "react-flow-panel-v2": {
    id: "react-flow-panel-v2",
    title: "ReactFlow Panel V2",
    icon: "🔄",
    category: "visualization",
    description:
      "Interactive ReactFlow diagram editor for workflow and process visualization",
  },
  "dev-tools": {
    id: "dev-tools",
    title: "Dev Tools",
    icon: "🔧",
    category: "development",
    description: "Development tools and utilities for debugging and testing",
  },
  "sandpack-editor": {
    id: "sandpack-editor",
    title: "Sandpack Editor",
    icon: "🖥️",
    category: "development",
    description:
      "Live code editor with file tree and instant preview powered by CodeSandbox",
  },
  "markdown-viewer": {
    id: "markdown-viewer",
    title: "Markdown Viewer",
    icon: "📄",
    category: "content",
    description: "Clean, modern markdown viewer with GitHub-inspired styling",
  },
  documentation: {
    id: "documentation",
    title: "Documentation",
    icon: "📚",
    category: "content",
    description: "Browse and view documentation with file tree navigation",
  },
  "unigraph-iframe": {
    id: "unigraph-iframe",
    title: "Unigraph Iframe",
    icon: "🖼️",
    category: "development",
    description:
      "Interactive iframe component for embedding external content with controls and customization",
  },
  "log-viewer": {
    id: "log-viewer",
    title: "Log Viewer",
    icon: "📋",
    category: "development",
    description:
      "Real-time application log viewer with filtering, search, and export capabilities",
  },
  "document-editor": {
    id: "document-editor",
    title: "Document Editor",
    icon: "📝",
    category: "editing",
    description:
      "Document editor supporting .md files (with Monaco) and .txt files (with Lexical), featuring real-time preview and syntax highlighting",
  },
  "map-2d": {
    id: "map-2d",
    title: "2D Map",
    icon: "🗺️",
    category: "visualization",
    description:
      "Interactive 2D map view with custom markers, popups, and multiple map types using OpenStreetMap data",
  },
  "resource-manager": {
    id: "resource-manager",
    title: "Resource Manager",
    icon: "📊",
    category: "data",
    description:
      "Tabbed interface for managing and viewing different types of entities: nodes, edges, web resources, and annotations",
  },
  "html-page-viewer": {
    id: "html-page-viewer",
    title: "HTML Page Viewer",
    icon: "🌐",
    category: "content",
    description: "View web pages within the application",
  },
  "pdf-viewer": {
    id: "pdf-viewer",
    title: "PDF Viewer",
    icon: "📄",
    category: "content",
    description:
      "View and interact with PDF documents with zoom, navigation, and search capabilities",
  },
};

// Helper function to get all available view IDs
export const getAvailableViewIds = (): string[] => {
  return Object.keys(VIEW_DEFINITIONS);
};

// Helper function to get view definition by ID
export const getViewDefinition = (
  viewId: string
): ViewDefinition | undefined => {
  return VIEW_DEFINITIONS[viewId];
};

// Helper function to get all view definitions
export const getAllViewDefinitions = (): ViewDefinition[] => {
  return Object.values(VIEW_DEFINITIONS);
};
