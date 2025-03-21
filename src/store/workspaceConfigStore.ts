import { create } from "zustand";

interface ISidebarConfig {
  isVisible: boolean;
  mode: "collapsed" | "full";
  minimal: boolean;
}

type WorkspaceConfigState = {
  showToolbar: boolean;
  leftSidebarConfig: ISidebarConfig;
  rightSidebarConfig: ISidebarConfig;

  setShowToolbar: (show: boolean) => void;
  setLeftSidebarConfig: (config: ISidebarConfig) => void;
  setRightSidebarConfig: (config: ISidebarConfig) => void;
};

const useWorkspaceConfigStore = create<WorkspaceConfigState>((set) => ({
  showToolbar: true,
  leftSidebarConfig: { isVisible: true, mode: "full", minimal: false },
  rightSidebarConfig: { isVisible: true, mode: "full", minimal: false },

  setShowToolbar: (show) => set({ showToolbar: show }),
  setLeftSidebarConfig: (config) => set({ leftSidebarConfig: config }),
  setRightSidebarConfig: (config) => set({ rightSidebarConfig: config }),
}));

export const setShowToolbar = (show: boolean) => {
  useWorkspaceConfigStore.setState(() => ({
    showToolbar: show,
  }));
};

export const setLeftSidebarConfig = (config: ISidebarConfig) => {
  useWorkspaceConfigStore.setState(() => ({
    leftSidebarConfig: config,
  }));
};

export const getLeftSidebarConfig = () => {
  return useWorkspaceConfigStore.getState().leftSidebarConfig;
};

export const setRightSidebarConfig = (config: ISidebarConfig) => {
  useWorkspaceConfigStore.setState(() => ({
    rightSidebarConfig: config,
  }));
};

export const getRightSidebarConfig = () => {
  return useWorkspaceConfigStore.getState().rightSidebarConfig;
};

export default useWorkspaceConfigStore;
