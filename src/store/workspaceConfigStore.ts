import { create } from "zustand";

export interface ISidebarConfig {
  isVisible: boolean;
  mode: "collapsed" | "full";
  minimal: boolean;
  activeSectionId: string | null;
  panelWidth: number;
}

// Add section width configuration
export interface SectionWidthConfig {
  [sectionId: string]: number;
}

// Default widths for specific sections
const defaultSectionWidths: SectionWidthConfig = {
  projects: 300, // Wider default for Projects section
  layouts: 250,
  filters: 250,
  analysis: 250,
  displaySettings: 250,
  "chatgpt-import": 400,
  // Add other sections as needed
};

// Default width for sections not explicitly configured
export const defaultSectionWidth = 300;

export const DEFAULT_SIDEBAR_CONFIG = (): ISidebarConfig => {
  return {
    isVisible: true,
    mode: "collapsed",
    minimal: false,
    activeSectionId: null,
    panelWidth: 300,
  };
};

type WorkspaceConfigState = {
  showToolbar: boolean;
  leftSidebarConfig: ISidebarConfig;
  rightSidebarConfig: ISidebarConfig;
  sectionWidths: SectionWidthConfig;

  setShowToolbar: (show: boolean) => void;
  setLeftSidebarConfig: (config: Partial<ISidebarConfig>) => void;
  setRightSidebarConfig: (config: Partial<ISidebarConfig>) => void;
  setLeftActiveSection: (sectionId: string | null) => void;
  setRightActiveSection: (sectionId: string | null) => void;
  setLeftPanelWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
  getActiveSection: (sidebar: "left" | "right") => string | null;
};

const useWorkspaceConfigStore = create<WorkspaceConfigState>((set) => ({
  showToolbar: true,
  leftSidebarConfig: DEFAULT_SIDEBAR_CONFIG(),
  rightSidebarConfig: DEFAULT_SIDEBAR_CONFIG(),
  sectionWidths: defaultSectionWidths,

  getActiveSection: (sidebar): string | null => {
    return sidebar === "left"
      ? useWorkspaceConfigStore.getState().leftSidebarConfig.activeSectionId
      : useWorkspaceConfigStore.getState().rightSidebarConfig.activeSectionId;
  },

  setShowToolbar: (show) => set({ showToolbar: show }),
  setLeftSidebarConfig: (config) =>
    set((state) => ({
      leftSidebarConfig: { ...state.leftSidebarConfig, ...config },
    })),
  setRightSidebarConfig: (config) =>
    set((state) => ({
      rightSidebarConfig: { ...state.rightSidebarConfig, ...config },
    })),
  setLeftActiveSection: (sectionId) =>
    set((state) => ({
      leftSidebarConfig: {
        ...state.leftSidebarConfig,
        activeSectionId: sectionId,
      },
    })),
  setRightActiveSection: (sectionId) =>
    set((state) => ({
      rightSidebarConfig: {
        ...state.rightSidebarConfig,
        activeSectionId: sectionId,
      },
    })),
  setLeftPanelWidth: (width) =>
    set((state) => ({
      leftSidebarConfig: { ...state.leftSidebarConfig, panelWidth: width },
    })),
  setRightPanelWidth: (width) =>
    set((state) => ({
      rightSidebarConfig: { ...state.rightSidebarConfig, panelWidth: width },
    })),
}));

// Debug helper
const logWidthChange = (position: string, width: number) => {
  console.log(`Setting ${position} panel width to ${width}px`);
};

export const setShowToolbar = (show: boolean) => {
  useWorkspaceConfigStore.getState().setShowToolbar(show);
};

export const setLeftSidebarConfig = (config: Partial<ISidebarConfig>) => {
  useWorkspaceConfigStore.getState().setLeftSidebarConfig(config);
};

export const getLeftSidebarConfig = () => {
  return useWorkspaceConfigStore.getState().leftSidebarConfig;
};

export const setRightSidebarConfig = (config: Partial<ISidebarConfig>) => {
  useWorkspaceConfigStore.getState().setRightSidebarConfig(config);
};

export const getRightSidebarConfig = () => {
  return useWorkspaceConfigStore.getState().rightSidebarConfig;
};

export const setLeftActiveSection = (sectionId: string | null) => {
  useWorkspaceConfigStore.getState().setLeftActiveSection(sectionId);
};

export const setRightActiveSection = (sectionId: string | null) => {
  useWorkspaceConfigStore.getState().setRightActiveSection(sectionId);
};

export const setLeftPanelWidth = (width: number) => {
  logWidthChange("left", width);
  useWorkspaceConfigStore.getState().setLeftPanelWidth(width);
};

export const setRightPanelWidth = (width: number) => {
  logWidthChange("right", width);
  useWorkspaceConfigStore.getState().setRightPanelWidth(width);
};

export const getActiveSection = (sidebar: "left" | "right") => {
  return sidebar === "left"
    ? useWorkspaceConfigStore.getState().leftSidebarConfig.activeSectionId
    : useWorkspaceConfigStore.getState().rightSidebarConfig.activeSectionId;
};

// Add action to update section width
export const updateSectionWidth = (id: string, width: number) => {
  const state = useWorkspaceConfigStore.getState();
  useWorkspaceConfigStore.setState({
    sectionWidths: {
      ...state.sectionWidths,
      [id]: width,
    },
  });
};

// Add helper to get section width
export const getSectionWidth = (id: string) => {
  const { sectionWidths } = useWorkspaceConfigStore.getState();
  return sectionWidths[id] || defaultSectionWidth;
};

export const setLeftSidebarIsCollapsed = (isCollapsed: boolean) => {
  useWorkspaceConfigStore.setState((state) => ({
    leftSidebarConfig: {
      ...state.leftSidebarConfig,
      mode: isCollapsed ? "collapsed" : "full",
    },
  }));
};
export const setRightSidebarIsCollapsed = (isCollapsed: boolean) => {
  useWorkspaceConfigStore.setState((state) => ({
    rightSidebarConfig: {
      ...state.rightSidebarConfig,
      mode: isCollapsed ? "collapsed" : "full",
    },
  }));
};

export default useWorkspaceConfigStore;
