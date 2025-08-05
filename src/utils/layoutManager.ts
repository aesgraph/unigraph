import { LayoutState } from "../types/LayoutState";

const LAYOUT_STORAGE_KEY = "unigraph-layouts";

export class LayoutManager {
  private static instance: LayoutManager;
  private layouts: LayoutState[] = [];

  private constructor() {
    this.loadLayoutsFromStorage();
  }

  static getInstance(): LayoutManager {
    if (!LayoutManager.instance) {
      LayoutManager.instance = new LayoutManager();
    }
    return LayoutManager.instance;
  }

  private loadLayoutsFromStorage(): void {
    try {
      const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (saved) {
        this.layouts = JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load layouts from storage:", error);
      this.layouts = [];
    }
  }

  private saveLayoutsToStorage(): void {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(this.layouts));
    } catch (error) {
      console.error("Failed to save layouts to storage:", error);
    }
  }

  saveLayout(layout: LayoutState): void {
    // Check if layout with same name already exists
    const existingIndex = this.layouts.findIndex((l) => l.name === layout.name);
    if (existingIndex !== -1) {
      // Update existing layout
      this.layouts[existingIndex] = layout;
    } else {
      // Add new layout
      this.layouts.push(layout);
    }
    this.saveLayoutsToStorage();
  }

  loadLayout(id: string): LayoutState | null {
    const layout = this.layouts.find((l) => l.id === id);
    return layout || null;
  }

  deleteLayout(id: string): boolean {
    const initialLength = this.layouts.length;
    this.layouts = this.layouts.filter((l) => l.id !== id);
    const deleted = this.layouts.length < initialLength;
    if (deleted) {
      this.saveLayoutsToStorage();
    }
    return deleted;
  }

  getAllLayouts(): LayoutState[] {
    return [...this.layouts];
  }

  getCurrentLayout(): LayoutState | null {
    // This would need to be implemented based on the current workspace state
    // For now, return null
    return null;
  }

  // Helper method to get current workspace state
  getCurrentWorkspaceState(): Omit<
    LayoutState,
    "id" | "name" | "timestamp" | "description"
  > {
    // Try to get workspace state from app-shell's global functions
    const getCurrentWorkspaceState = (
      globalThis as {
        getCurrentWorkspaceState?: () => any;
      }
    ).getCurrentWorkspaceState;

    if (getCurrentWorkspaceState) {
      try {
        const workspaceState = getCurrentWorkspaceState();
        return {
          panelSizes: {
            leftWidth: workspaceState.panelSizes?.leftWidth || 20,
            rightWidth: workspaceState.panelSizes?.rightWidth || 20,
            bottomHeight: workspaceState.panelSizes?.bottomHeight || 30,
          },
          tabContainers:
            workspaceState.tabContainers?.map((container: any) => ({
              id: container.id,
              tabs: container.tabs.map((tab: any) => ({
                id: tab.id,
                title: tab.title,
                viewId: tab.content || tab.id,
                closable: tab.closable !== false,
              })),
              activeTabId: container.activeTabId,
            })) || [],
          theme: workspaceState.currentTheme || workspaceState.theme || "dark",
          workspaceState: {
            activeView: this.getCurrentActiveView(),
            activeLayout: this.getCurrentActiveLayout(),
            isDarkMode: this.getCurrentDarkMode(),
          },
        };
      } catch (error) {
        console.error("Failed to get workspace state from app-shell:", error);
      }
    }

    // Fallback to default state
    return {
      panelSizes: {
        leftWidth: 20,
        rightWidth: 20,
        bottomHeight: 30,
      },
      tabContainers: [],
      theme: "dark",
      workspaceState: {
        activeView: this.getCurrentActiveView(),
        activeLayout: this.getCurrentActiveLayout(),
        isDarkMode: this.getCurrentDarkMode(),
      },
    };
  }

  // Helper methods to get current app state
  private getCurrentActiveView(): string {
    try {
      return (globalThis as any).getActiveView?.() || "ForceGraph3d";
    } catch {
      return "ForceGraph3d";
    }
  }

  private getCurrentActiveLayout(): string {
    try {
      return (globalThis as any).getActiveLayout?.() || "force";
    } catch {
      return "force";
    }
  }

  private getCurrentDarkMode(): boolean {
    try {
      return (globalThis as any).getIsDarkMode?.() || false;
    } catch {
      return false;
    }
  }

  // Helper method to restore workspace state
  restoreWorkspaceState(layout: LayoutState): void {
    // Try to restore workspace state using app-shell's global functions
    const restoreWorkspaceState = (
      globalThis as {
        restoreWorkspaceState?: (state: any) => void;
      }
    ).restoreWorkspaceState;

    if (restoreWorkspaceState) {
      try {
        // Convert our layout state to app-shell's workspace state format
        const workspaceState = {
          id: layout.id,
          name: layout.name,
          timestamp: layout.timestamp,
          theme: layout.theme,
          panelSizes: layout.panelSizes,
          tabContainers: layout.tabContainers.map((container) => ({
            id: container.id,
            tabs: container.tabs.map((tab) => ({
              id: tab.id,
              title: tab.title,
              content: tab.viewId,
              closable: tab.closable,
            })),
            activeTabId: container.activeTabId,
          })),
          config: layout.workspaceState,
        };

        restoreWorkspaceState(workspaceState);
        console.log("Successfully restored layout:", layout.name);
      } catch (error) {
        console.error("Failed to restore workspace state:", error);
        alert("Failed to restore layout. Check console for details.");
      }
    } else {
      console.warn("Workspace restore function not available");
      alert("Workspace restore functionality not available.");
    }
  }
}

// Export singleton instance
export const layoutManager = LayoutManager.getInstance();
