import { WorkspaceState } from "@aesgraph/app-shell";
import { SceneGraph } from "../core/model/SceneGraph";

export class WorkspaceStateManager {
  private static instance: WorkspaceStateManager;
  private currentSceneGraph: SceneGraph | null = null;

  private constructor() {}

  static getInstance(): WorkspaceStateManager {
    if (!WorkspaceStateManager.instance) {
      WorkspaceStateManager.instance = new WorkspaceStateManager();
    }
    return WorkspaceStateManager.instance;
  }

  setCurrentSceneGraph(sceneGraph: SceneGraph | null) {
    this.currentSceneGraph = sceneGraph;
  }

  getCurrentSceneGraph(): SceneGraph | null {
    return this.currentSceneGraph;
  }

  // Save current workspace state to the current scenegraph
  saveCurrentWorkspaceState(workspaceState: WorkspaceState): void {
    if (!this.currentSceneGraph) {
      console.warn("No current scenegraph available to save workspace state");
      return;
    }

    try {
      this.currentSceneGraph.setWorkspaceState(workspaceState);
      console.log("Workspace state saved to scenegraph:", workspaceState.id);
    } catch (error) {
      console.error("Failed to save workspace state to scenegraph:", error);
    }
  }

  // Load workspace state from the current scenegraph
  loadWorkspaceState(): WorkspaceState | null {
    if (!this.currentSceneGraph) {
      console.warn("No current scenegraph available to load workspace state");
      return null;
    }

    try {
      const workspaceState = this.currentSceneGraph.getWorkspaceState();
      if (workspaceState) {
        console.log(
          "Workspace state loaded from scenegraph:",
          workspaceState.id
        );
        return workspaceState;
      }
    } catch (error) {
      console.error("Failed to load workspace state from scenegraph:", error);
    }

    return null;
  }

  // Clear workspace state from the current scenegraph
  clearWorkspaceState(): void {
    if (!this.currentSceneGraph) {
      console.warn("No current scenegraph available to clear workspace state");
      return;
    }

    try {
      this.currentSceneGraph.clearWorkspaceState();
      console.log("Workspace state cleared from scenegraph");
    } catch (error) {
      console.error("Failed to clear workspace state from scenegraph:", error);
    }
  }

  // Get current workspace state from app-shell and save it to scenegraph
  async captureAndSaveCurrentState(): Promise<WorkspaceState | null> {
    // Try to get current workspace state from app-shell
    const getCurrentWorkspaceState = (
      globalThis as {
        captureCurrentState?: () => Promise<Omit<
          WorkspaceState,
          "id" | "name" | "timestamp"
        > | null>;
      }
    ).captureCurrentState;

    if (getCurrentWorkspaceState) {
      try {
        const state = await getCurrentWorkspaceState();
        if (state && this.currentSceneGraph) {
          // Add required fields for WorkspaceState
          const workspaceState: WorkspaceState = {
            id: `scenegraph-${this.currentSceneGraph.getMetadata().name || "unnamed"}`,
            name: `Workspace for ${this.currentSceneGraph.getMetadata().name || "unnamed"}`,
            timestamp: Date.now(),
            ...state,
          };

          this.saveCurrentWorkspaceState(workspaceState);
          return workspaceState;
        }
        return null;
      } catch (error) {
        console.error("Failed to capture current workspace state:", error);
      }
    }

    return null;
  }

  // Restore workspace state from scenegraph to app-shell
  restoreWorkspaceState(): boolean {
    const workspaceState = this.loadWorkspaceState();
    if (!workspaceState) {
      console.warn("No workspace state available to restore");
      return false;
    }

    // Try to restore workspace state using app-shell's global functions
    const restoreWorkspaceState = (
      globalThis as {
        restoreWorkspaceState?: (state: WorkspaceState) => void;
      }
    ).restoreWorkspaceState;

    if (restoreWorkspaceState) {
      try {
        restoreWorkspaceState(workspaceState);
        console.log(
          "Successfully restored workspace state from scenegraph:",
          workspaceState.id
        );
        return true;
      } catch (error) {
        console.error("Failed to restore workspace state:", error);
        return false;
      }
    } else {
      console.warn("Workspace restore function not available");
      return false;
    }
  }
}

// Export singleton instance
export const workspaceStateManager = WorkspaceStateManager.getInstance();
