import type { WorkspaceState } from "@aesgraph/app-shell";

export const initialWorkspaces: WorkspaceState[] = [
  {
    id: "clean-workspace",
    name: "Clean Workspace",
    timestamp: Date.now(),
    config: {
      description:
        "Empty workspace with no pre-loaded views - start fresh and build your own layout",
    },
    layout: {
      horizontal: [33, 34, 33], // Equal distribution across all panels
      vertical: [66, 34], // 100% top, 0% bottom
    },
    tabContainers: [
      {
        id: "left",
        tabs: [],
        activeTabId: undefined,
      },
      {
        id: "center",
        tabs: [],
        activeTabId: undefined,
      },
      {
        id: "right",
        tabs: [],
        activeTabId: undefined,
      },
    ],
    theme: "dark",
  },
  {
    id: "ai-chat-workspace",
    name: "AI Chat & SPARQL Query",
    timestamp: Date.now(),
    config: {
      description:
        "Workspace with AI Chat in left pane and SPARQL Query in center - perfect for semantic web exploration",
    },
    layout: {
      horizontal: [30, 70, 0], // 30% left, 70% center, 0% right
      vertical: [100, 0], // 100% top, 0% bottom
    },
    tabContainers: [
      {
        id: "left",
        tabs: [
          {
            id: "ai-chat",
            title: "AI Chat",
            content: "ai-chat",
            closable: false,
          },
        ],
        activeTabId: "ai-chat",
      },
      {
        id: "center",
        tabs: [
          {
            id: "semantic-web-query",
            title: "SPARQL Querier",
            content: "semantic-web-query",
            closable: false,
          },
        ],
        activeTabId: "semantic-web-query",
      },
      {
        id: "right",
        tabs: [],
        activeTabId: undefined,
      },
    ],
    theme: "dark",
  },
  {
    id: "data-analysis-workspace",
    name: "Data Analysis",
    timestamp: Date.now(),
    config: {
      description:
        "Workspace optimized for data analysis with entity table and legends",
    },
    layout: {
      horizontal: [25, 50, 25], // 25% left, 50% center, 25% right
      vertical: [100, 0], // 100% top, 0% bottom
    },
    tabContainers: [
      {
        id: "left",
        tabs: [
          {
            id: "node-legend",
            title: "Node Legend",
            content: "node-legend",
            closable: false,
          },
        ],
        activeTabId: "node-legend",
      },
      {
        id: "center",
        tabs: [
          {
            id: "entity-table-v2",
            title: "Entity Table",
            content: "entity-table-v2",
            closable: false,
          },
        ],
        activeTabId: "entity-table-v2",
      },
      {
        id: "right",
        tabs: [
          {
            id: "edge-legend",
            title: "Edge Legend",
            content: "edge-legend",
            closable: false,
          },
        ],
        activeTabId: "edge-legend",
      },
    ],
    theme: "dark",
  },
  {
    id: "visualization-workspace",
    name: "Graph Visualization",
    timestamp: Date.now(),
    config: {
      description:
        "Workspace focused on graph visualization with ForceGraph 3D",
    },
    layout: {
      horizontal: [0, 50, 50], // 20% left, 80% center, 0% right
      vertical: [100, 0], // 100% top, 0% bottom
    },
    tabContainers: [
      {
        id: "left",
        tabs: [
          {
            id: "system-monitor",
            title: "System Monitor",
            content: "system-monitor",
            closable: false,
          },
        ],
        activeTabId: "system-monitor",
      },
      {
        id: "center",
        tabs: [
          {
            id: "force-graph-3d-v2",
            title: "ForceGraph 3D",
            content: "force-graph-3d-v2",
            closable: false,
          },
        ],
        activeTabId: "force-graph-3d-v2",
      },
      {
        id: "right",
        tabs: [
          {
            id: "react-flow-panel-v2",
            title: "React Flow",
            content: "react-flow-panel-v2",
            closable: false,
          },
        ],
        activeTabId: "react-flow-panel-v2",
      },
      {
        id: "bottom",
        tabs: [
          {
            id: "entity-table-v2",
            title: "Entity Table",
            content: "entity-table-v2",
            closable: false,
          },
        ],
        activeTabId: "entity-table-v2",
      },
    ],
    theme: "dracula",
  },
  {
    id: "force-graph-3d-expanded",
    name: "ForceGraph3d View",
    timestamp: Date.now(),
    config: {
      description:
        "Workspace focused on graph visualization with ForceGraph 3D",
    },
    layout: {
      horizontal: [0, 100, 0], // 20% left, 80% center, 0% right
      vertical: [100, 0], // 100% top, 0% bottom
    },
    tabContainers: [
      {
        id: "left",
        tabs: [
          {
            id: "system-monitor",
            title: "System Monitor",
            content: "system-monitor",
            closable: false,
          },
        ],
        activeTabId: "system-monitor",
      },
      {
        id: "center",
        tabs: [
          {
            id: "force-graph-3d-v2",
            title: "ForceGraph 3D",
            content: "force-graph-3d-v2",
            closable: false,
          },
        ],
        activeTabId: "force-graph-3d-v2",
      },
      {
        id: "right",
        tabs: [],
        activeTabId: undefined,
      },
    ],
    theme: "dark",
  },
  {
    id: "react-flow-expanded",
    name: "ReactFlow View",
    timestamp: Date.now(),
    config: {
      description: "Workspace focused on graph visualization with ReactFlow",
    },
    layout: {
      horizontal: [0, 100, 0], // 20% left, 80% center, 0% right
      vertical: [100, 0], // 100% top, 0% bottom
    },
    tabContainers: [
      {
        id: "left",
        tabs: [
          {
            id: "system-monitor",
            title: "System Monitor",
            content: "system-monitor",
            closable: false,
          },
        ],
        activeTabId: "system-monitor",
      },
      {
        id: "center",
        tabs: [
          {
            id: "react-flow-panel-v2",
            title: "React Flow",
            content: "react-flow-panel-v2",
            closable: false,
          },
        ],
        activeTabId: "react-flow-panel-v2",
      },
      {
        id: "right",
        tabs: [],
        activeTabId: undefined,
      },
    ],
    theme: "dark",
  },
  {
    id: "development-workspace",
    name: "Development Tools",
    timestamp: Date.now(),
    config: {
      description: "Workspace for development with theme demo and tools",
    },
    layout: {
      horizontal: [0, 100, 0], // 50% left, 0% center, 50% right
      vertical: [100, 0], // 100% top, 0% bottom
    },
    tabContainers: [
      {
        id: "left",
        tabs: [
          {
            id: "custom-themed-panel",
            title: "Theme Demo",
            content: "custom-themed-panel",
            closable: false,
          },
        ],
        activeTabId: "custom-themed-panel",
      },
      {
        id: "center",
        tabs: [],
        activeTabId: undefined,
      },
      {
        id: "right",
        tabs: [
          {
            id: "theme-inheritance-demo",
            title: "Theme Inheritance",
            content: "theme-inheritance-demo",
            closable: false,
          },
        ],
        activeTabId: "theme-inheritance-demo",
      },
    ],
    theme: "dark",
  },
  {
    id: "research-workspace",
    name: "Research & Analysis",
    timestamp: Date.now(),
    config: {
      description: "Workspace for research with Wikipedia viewer and AI chat",
    },
    layout: {
      horizontal: [40, 0, 60], // 40% left, 0% center, 60% right
      vertical: [100, 0], // 100% top, 0% bottom
    },
    tabContainers: [
      {
        id: "left",
        tabs: [
          {
            id: "wikipedia-factor-graph",
            title: "Wikipedia Factor Graph",
            content: "wikipedia-factor-graph",
            closable: false,
          },
        ],
        activeTabId: "wikipedia-factor-graph",
      },
      {
        id: "center",
        tabs: [],
        activeTabId: undefined,
      },
      {
        id: "right",
        tabs: [
          {
            id: "ai-chat",
            title: "AI Chat",
            content: "ai-chat",
            closable: false,
          },
        ],
        activeTabId: "ai-chat",
      },
    ],
    theme: "dark",
  },
  {
    id: "code-editor-workspace",
    name: "Code Editor",
    timestamp: Date.now(),
    config: {
      description: "Workspace for writing code with monaco and ai chat",
    },
    layout: {
      horizontal: [20, 0, 80], // 40% left, 0% center, 60% right
      vertical: [100, 0], // 100% top, 0% bottom
    },
    tabContainers: [
      {
        id: "left",
        tabs: [
          {
            id: "ai-chat",
            title: "AI Chat",
            content: "ai-chat",
            closable: false,
          },
        ],
        activeTabId: "ai-chat",
      },
      {
        id: "center",
        tabs: [],
        activeTabId: undefined,
      },
      {
        id: "right",
        tabs: [
          {
            id: "monaco-editor",
            title: "Monaco Editor",
            content: "monaco-editor",
            closable: false,
          },
          {
            id: "sandpack-editor",
            title: "Sandpack Editor",
            content: "sandpack-editor",
            closable: false,
          },
        ],
        activeTabId: "sandpack-editor",
      },
    ],
    theme: "dark",
  },
  {
    id: "documentation",
    name: "Documentation",
    timestamp: Date.now(),
    config: {
      description: "A workspace for learning about unigraph",
    },
    layout: {
      horizontal: [0, 20, 80], // 40% left, 0% center, 60% right
      vertical: [100, 0], // 100% top, 0% bottom
    },
    tabContainers: [
      {
        id: "center",
        tabs: [
          {
            id: "ai-chat",
            title: "AI Chat",
            content: "ai-chat",
            closable: false,
          },
        ],
        activeTabId: "ai-chat",
      },
      {
        id: "left",
        tabs: [],
        activeTabId: undefined,
      },
      {
        id: "right",
        tabs: [
          {
            id: "documentation",
            title: "Documentation",
            content: "documentation",
            closable: true,
          },
          {
            id: "resource-manager",
            title: "Resource Manager",
            content: "resource-manager",
            closable: true,
          },
        ],
        activeTabId: "documentation",
      },
    ],
    theme: "dark",
  },
];

export default initialWorkspaces;
