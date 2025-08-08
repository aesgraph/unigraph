import { CommandTool } from "../commandPalette/CommandProcessor";

export interface WorkspaceLayoutPayload {
  viewId: string;
  panelId: string;
  action?: "add" | "remove" | "focus";
}

export interface WorkspaceLayoutToolState {
  addViewToPanel: (viewId: string, panelId: string) => void;
  removeViewFromPanel: (viewId: string, panelId: string) => void;
  focusView: (viewId: string) => void;
  getAvailableViews: () => string[];
  getAvailablePanels: () => string[];
}

export class WorkspaceLayoutTool implements CommandTool {
  tool_id = "workspace_layout_tool";
  private state: WorkspaceLayoutToolState | null = null;

  constructor(state: WorkspaceLayoutToolState) {
    this.state = state;
  }

  onCommand(payload: WorkspaceLayoutPayload): void {
    if (!this.state) {
      console.error("WorkspaceLayoutTool state not initialized");
      return;
    }

    try {
      const { viewId, panelId, action = "add" } = payload;

      // Validate viewId
      const availableViews = this.state.getAvailableViews();
      if (!availableViews.includes(viewId)) {
        console.warn(
          `View ID "${viewId}" not found. Available views:`,
          availableViews
        );
        return;
      }

      // Validate panelId
      const availablePanels = this.state.getAvailablePanels();
      if (!availablePanels.includes(panelId)) {
        console.warn(
          `Panel ID "${panelId}" not found. Available panels:`,
          availablePanels
        );
        return;
      }

      // Execute the requested action
      switch (action) {
        case "add":
          this.state.addViewToPanel(viewId, panelId);
          console.log(`Added view "${viewId}" to panel "${panelId}"`);
          break;
        case "remove":
          this.state.removeViewFromPanel(viewId, panelId);
          console.log(`Removed view "${viewId}" from panel "${panelId}"`);
          break;
        case "focus":
          this.state.focusView(viewId);
          console.log(`Focused view "${viewId}"`);
          break;
        default:
          console.warn(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error("Error in WorkspaceLayoutTool:", error);
    }
  }

  // Method to update the state reference (useful for React components)
  updateState(newState: WorkspaceLayoutToolState): void {
    this.state = newState;
  }
}

// Helper function to create the tool
export function createWorkspaceLayoutTool(
  state: WorkspaceLayoutToolState
): WorkspaceLayoutTool {
  return new WorkspaceLayoutTool(state);
}
