import type { ThemeId, WorkspaceState } from "@aesgraph/app-shell";

export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  config: {
    description: string;
  };
  layout: {
    horizontal: number[];
    vertical: number[];
  };
  tabContainers: Array<{
    id: string;
    tabs: Array<{
      id: string;
      title: string;
      content: string;
      closable: boolean;
    }>;
    activeTabId: string | undefined;
  }>;
  theme: ThemeId;
}

export const workspaceTemplates: WorkspaceTemplate[] = [
  {
    id: "clean-workspace",
    name: "Clean Workspace",
    description:
      "Empty workspace with no pre-loaded views - start fresh and build your own layout",
    category: "basic",
    icon: "🆕",
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
    description:
      "Workspace with AI Chat in left pane and SPARQL Query in center - perfect for semantic web exploration",
    category: "ai",
    icon: "🤖",
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
    description:
      "Workspace optimized for data analysis with entity table and legends",
    category: "analysis",
    icon: "📊",
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
    description: "Workspace focused on graph visualization with ForceGraph 3D",
    category: "visualization",
    icon: "🌐",
    config: {
      description:
        "Workspace focused on graph visualization with ForceGraph 3D",
    },
    layout: {
      horizontal: [20, 80, 0], // 20% left, 80% center, 0% right
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
    id: "reactflow-workspace",
    name: "ReactFlow Center",
    description: "Workspace with ReactFlow as the main visualization tool",
    category: "visualization",
    icon: "🔄",
    config: {
      description: "Workspace with ReactFlow as the main visualization tool",
    },
    layout: {
      horizontal: [0, 100, 0], // 0% left, 100% center, 0% right
      vertical: [100, 0], // 100% top, 0% bottom
    },
    tabContainers: [
      {
        id: "left",
        tabs: [],
        activeTabId: undefined,
      },
      {
        id: "center",
        tabs: [
          {
            id: "react-flow-panel-v2",
            title: "ReactFlow Panel V2",
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
    id: "force-graph-3d-expanded",
    name: "ForceGraph3D Expanded",
    description: "Full-screen ForceGraph 3D visualization",
    category: "visualization",
    icon: "🚀",
    config: {
      description: "Full-screen ForceGraph 3D visualization",
    },
    layout: {
      horizontal: [0, 100, 0], // 0% left, 100% center, 0% right
      vertical: [100, 0], // 100% top, 0% bottom
    },
    tabContainers: [
      {
        id: "left",
        tabs: [],
        activeTabId: undefined,
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
    id: "development-workspace",
    name: "Development Tools",
    description: "Workspace for development with theme demo and tools",
    category: "development",
    icon: "🔧",
    config: {
      description: "Workspace for development with theme demo and tools",
    },
    layout: {
      horizontal: [0, 100, 0], // 0% left, 100% center, 0% right
      vertical: [100, 0], // 100% top, 0% bottom
    },
    tabContainers: [
      {
        id: "left",
        tabs: [],
        activeTabId: undefined,
      },
      {
        id: "center",
        tabs: [
          {
            id: "dev-tools",
            title: "Dev Tools",
            content: "dev-tools",
            closable: false,
          },
        ],
        activeTabId: "dev-tools",
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
    id: "research-workspace",
    name: "Research & Analysis",
    description: "Workspace for research with Wikipedia viewer and AI chat",
    category: "research",
    icon: "🔬",
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
    id: "lexical-editor-workspace",
    name: "Lexical Editor",
    description: "Workspace focused on rich text editing with Lexical",
    category: "editing",
    icon: "📝",
    config: {
      description: "Workspace focused on rich text editing with Lexical",
    },
    layout: {
      horizontal: [0, 100, 0], // 0% left, 100% center, 0% right
      vertical: [100, 0], // 100% top, 0% bottom
    },
    tabContainers: [
      {
        id: "left",
        tabs: [],
        activeTabId: undefined,
      },
      {
        id: "center",
        tabs: [
          {
            id: "lexical-editor",
            title: "Lexical Editor",
            content: "lexical-editor",
            closable: false,
          },
        ],
        activeTabId: "lexical-editor",
      },
      {
        id: "right",
        tabs: [],
        activeTabId: undefined,
      },
    ],
    theme: "dark",
  },
];

// Helper function to convert template to workspace state
export function templateToWorkspaceState(
  template: WorkspaceTemplate
): WorkspaceState {
  return {
    id: `${template.id}-${Date.now()}`, // Make unique ID
    name: template.name,
    timestamp: Date.now(),
    config: template.config,
    layout: template.layout,
    tabContainers: template.tabContainers,
    theme: template.theme,
  };
}

// Helper function to get templates by category
export function getTemplatesByCategory(category: string): WorkspaceTemplate[] {
  return workspaceTemplates.filter(
    (template) => template.category === category
  );
}

// Helper function to get all categories
export function getTemplateCategories(): string[] {
  return [...new Set(workspaceTemplates.map((template) => template.category))];
}

// Helper function to find template by ID
export function findTemplateById(id: string): WorkspaceTemplate | undefined {
  return workspaceTemplates.find((template) => template.id === id);
}

export default workspaceTemplates;
