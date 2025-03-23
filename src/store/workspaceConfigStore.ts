import { create } from "zustand";

export interface ISidebarConfig {
  isVisible: boolean;
  mode: "collapsed" | "full";
  minimal: boolean;
  activeSectionId: string | null;
  panelWidth: number;
}

export const DEFAULT_SIDEBAR_CONFIG = (): ISidebarConfig => {
  return {
    isVisible: true,
    mode: "collapsed",
    minimal: false,
    activeSectionId: null,
    panelWidth: 240, // Reduce from 260px to 240px
  };
};

type WorkspaceConfigState = {
  showToolbar: boolean;
  leftSidebarConfig: ISidebarConfig;
  rightSidebarConfig: ISidebarConfig;

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

export default useWorkspaceConfigStore;
