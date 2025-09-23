import { useEffect } from "react";
import { useCommandProcessor } from "../commandPalette/CommandProcessor";
import { VIEW_DEFINITIONS } from "../views/viewDefinitions";

const TOOL_ID = "workspace_layout_tool";

// Available views with descriptions - automatically generated from shared definitions
const AVAILABLE_VIEWS = Object.fromEntries(
  Object.entries(VIEW_DEFINITIONS).map(([id, view]) => [
    id,
    {
      title: view.title,
      description: view.description,
      category: view.category,
    },
  ])
);

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
export { AVAILABLE_PANELS, AVAILABLE_VIEWS };
