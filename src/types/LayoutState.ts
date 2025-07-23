export interface LayoutState {
  id: string;
  name: string;
  timestamp: number;
  description?: string;
  // Panel sizes and layout
  panelSizes: {
    leftWidth: number;
    rightWidth: number;
    bottomHeight: number;
  };
  // Tab containers and their tabs
  tabContainers: Array<{
    id: string;
    tabs: Array<{
      id: string;
      title: string;
      viewId: string; // The view ID (e.g., "entity-table-v2", "force-graph-3d")
      closable?: boolean;
    }>;
    activeTabId?: string;
  }>;
  // Theme settings
  theme: string;
  // Additional workspace state
  workspaceState: {
    activeView?: string;
    activeLayout?: string;
    isDarkMode?: boolean;
    [key: string]: any;
  };
}

export interface LayoutManagerContext {
  saveLayout: (state: LayoutState) => void;
  loadLayout: (id: string) => LayoutState | null;
  deleteLayout: (id: string) => void;
  getAllLayouts: () => LayoutState[];
  getCurrentLayout: () => LayoutState | null;
}
