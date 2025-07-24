import { useEffect } from "react";
import { useCommandProcessor } from "../commandPalette/CommandProcessor";

const TOOL_ID = "workspace_layout_tool";

// Available views with descriptions
const AVAILABLE_VIEWS = {
  "ai-chat": {
    title: "AI Chat",
    description:
      "Interactive AI chat interface with support for semantic web queries and tool calls",
    category: "communication",
  },
  "semantic-web-query": {
    title: "SPARQL Query",
    description:
      "SPARQL query editor for semantic web data exploration and querying",
    category: "data",
  },
  "force-graph-3d-v2": {
    title: "ForceGraph 3D",
    description:
      "Interactive 3D force-directed graph visualization with physics simulation",
    category: "visualization",
  },
  "system-monitor": {
    title: "System Monitor",
    description: "Real-time system monitoring and performance metrics display",
    category: "tools",
  },
  "node-legend": {
    title: "Node Legend",
    description:
      "Legend showing node types and their visual representations in the graph",
    category: "data",
  },
  "edge-legend": {
    title: "Edge Legend",
    description:
      "Legend showing edge types and their visual representations in the graph",
    category: "data",
  },
  "entity-table-v2": {
    title: "Entity Table",
    description:
      "Tabular view of all entities (nodes) in the current graph with filtering and sorting",
    category: "data",
  },
  "custom-themed-panel": {
    title: "Theme Demo",
    description: "Demonstration of theme inheritance and styling capabilities",
    category: "development",
  },
  "theme-inheritance-demo": {
    title: "Theme Inheritance",
    description:
      "Interactive demo showing how components inherit theme styles from the workspace",
    category: "development",
  },
  "wikipedia-factor-graph": {
    title: "Wikipedia Factor Graph",
    description:
      "Interactive Wikipedia article viewer with factor graph visualization",
    category: "tools",
  },
  "gravity-simulation": {
    title: "Gravity Simulation",
    description:
      "WebGL-based gravity simulation with interactive particle physics",
    category: "simulation",
  },
};

// Available panels
const AVAILABLE_PANELS = {
  left: "Left panel - typically used for navigation, tools, or secondary content",
  center: "Center panel - main content area, usually the largest panel",
  right:
    "Right panel - typically used for details, properties, or additional tools",
  bottom:
    "Bottom panel - usually used for logs, terminals, or status information",
};

export const WorkspaceLayoutTool: React.FC = () => {
  const { registerTool } = useCommandProcessor();

  useEffect(() => {
    // Register the tool
    registerTool({
      tool_id: TOOL_ID,
      onCommand: (payload: any) => {
        // Expecting payload: { viewId: string, panelId: string }
        const { viewId, panelId } = payload;

        if (!viewId || !panelId) {
          console.warn(
            "WorkspaceLayoutTool: Invalid payload - missing viewId or panelId",
            payload
          );
          return;
        }

        // Validate viewId
        if (!AVAILABLE_VIEWS[viewId as keyof typeof AVAILABLE_VIEWS]) {
          console.warn(
            `WorkspaceLayoutTool: Unknown viewId "${viewId}"`,
            payload
          );
          return;
        }

        // Validate panelId
        if (!AVAILABLE_PANELS[panelId as keyof typeof AVAILABLE_PANELS]) {
          console.warn(
            `WorkspaceLayoutTool: Unknown panelId "${panelId}"`,
            payload
          );
          return;
        }

        // Dispatch the add-tab event to the AppShell
        const event = new CustomEvent("add-tab", {
          detail: {
            viewId,
            panelId,
          },
        });

        console.log(
          `WorkspaceLayoutTool: Adding view "${viewId}" to panel "${panelId}"`
        );
        document.dispatchEvent(event);
      },
    });
  }, [registerTool]);

  return null; // No UI
};

// Export the available views and panels for AI to use
export { AVAILABLE_VIEWS, AVAILABLE_PANELS };
