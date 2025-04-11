import { ForceGraph3DInstance } from "3d-force-graph";
import { ReactFlowInstance } from "@xyflow/react";
import { create } from "zustand";
import { RenderingManager__DisplayMode } from "../controllers/RenderingManager";
import { LayoutEngineOption } from "../core/layouts/LayoutEngine";
import { SceneGraph } from "../core/model/SceneGraph";
import { ActiveView, AppConfig, DEFAULT_APP_CONFIG } from "./../AppConfig";
import { Filter } from "./activeFilterStore";
import {
  getLeftSidebarConfig,
  getRightSidebarConfig,
  updateSectionWidth,
} from "./workspaceConfigStore";

export type AppConfigActions = {
  setActiveView: (activeView: ActiveView) => void;
  setActiveSceneGraph: (activeSceneGraph: string) => void;
  setActiveFilter(filter: Filter | null): void;
  getActiveFilter(): Filter | null;
  setWindows: (windows: { showEntityDataCard: boolean }) => void;
  setForceGraph3dOptions: (forceGraph3dOptions: {
    layout: "Physics" | "Layout";
  }) => void;
  setForceGraph3dLayoutMode: (layout: "Physics" | "Layout") => void;
  setActiveLayout: (activeLayout: LayoutEngineOption) => void;
  setAppConfig: (appConfig: AppConfig) => void;
  setIsDarkMode: (isDarkMode: boolean) => void;
  setSelectedSimulation: (selectedSimulation: string) => void;
  getShowEntityDataCard: () => boolean;
  setShowEntityDataCard: (showEntityDataCard: boolean) => void;
  setLegendMode: (legendMode: RenderingManager__DisplayMode) => void;
  getLegendMode: () => RenderingManager__DisplayMode;
};

export type AppState = AppConfig &
  AppConfigActions & {
    isDarkMode: boolean;
    selectedSimulation: string;
    previousView: string | null;

    activeProjectId: string | null;
    getActiveProjectId: () => string | null;
    setActiveProjectId: (activeProjectId: string | null) => void;

    currentSceneGraph: SceneGraph;
    setCurrentSceneGraph: (sceneGraph: SceneGraph) => void;
    getCurrentSceneGraph: () => SceneGraph;

    forceGraphInstance: ForceGraph3DInstance | null;
    setForceGraphInstance: (
      forceGraphInstance: ForceGraph3DInstance | null
    ) => void;
    getForceGraphInstance: () => ForceGraph3DInstance | null;

    reactFlowInstance: ReactFlowInstance | null;
    setReactFlowInstance: (reactFlowInstance: ReactFlowInstance | null) => void;
    getReactFlowInstance: () => ReactFlowInstance | null;
  };

const DEFAULTS = DEFAULT_APP_CONFIG();

const useAppConfigStore = create<AppState>((set) => ({
  previousView: null,
  setPreviousView: (previousView: string | null) => set({ previousView }),
  getPreviousView: (): string | null =>
    useAppConfigStore.getState().previousView,

  reactFlowInstance: null,
  setReactFlowInstance: (reactFlowInstance: ReactFlowInstance | null) =>
    set({ reactFlowInstance }),
  getReactFlowInstance: (): ReactFlowInstance | null =>
    useAppConfigStore.getState().reactFlowInstance,

  activeFilter: null,
  setActiveFilter: (activeFilter: Filter | null) => set({ activeFilter }),
  getActiveFilter: (): Filter | null =>
    useAppConfigStore.getState().activeFilter,

  activeProjectId: "undefined",
  getActiveProjectId: (): string | null =>
    useAppConfigStore.getState().activeProjectId,
  setActiveProjectId: (activeProjectId: string | null) =>
    set({ activeProjectId }),

  currentSceneGraph: new SceneGraph({ metadata: { name: "Unnamed" } }),
  setCurrentSceneGraph: (currentSceneGraph: SceneGraph) =>
    set({ currentSceneGraph }),
  getCurrentSceneGraph: (): SceneGraph =>
    useAppConfigStore.getState().currentSceneGraph,

  forceGraphInstance: null,
  setForceGraphInstance: (forceGraphInstance: ForceGraph3DInstance | null) =>
    set({ forceGraphInstance }),
  getForceGraphInstance: (): ForceGraph3DInstance | null =>
    useAppConfigStore.getState().forceGraphInstance,

  activeView: DEFAULTS.activeView,
  activeSceneGraph: DEFAULTS.activeSceneGraph,
  windows: {
    showEntityDataCard: DEFAULTS.windows.showEntityDataCard,
  },
  forceGraph3dOptions: {
    layout: DEFAULTS.forceGraph3dOptions.layout,
  },
  activeLayout: DEFAULTS.activeLayout,
  isDarkMode: false,
  selectedSimulation: "Lumina",
  legendMode: DEFAULTS.legendMode,

  setActiveView: (activeView: ActiveView) =>
    set({ previousView: useAppConfigStore.getState().activeView, activeView }),
  setActiveSceneGraph: (activeSceneGraph: string) => set({ activeSceneGraph }),
  setWindows: (windows: { showEntityDataCard: boolean }) => set({ windows }),

  getShowEntityDataCard: (): boolean => {
    return useAppConfigStore.getState().windows.showEntityDataCard;
  },
  setShowEntityDataCard: (showEntityDataCard: boolean) =>
    set({ windows: { showEntityDataCard } }),

  setForceGraph3dOptions: (forceGraph3dOptions: {
    layout: "Physics" | "Layout";
  }) => set({ forceGraph3dOptions }),
  setForceGraph3dLayoutMode: (layout: "Physics" | "Layout") =>
    set({ forceGraph3dOptions: { layout } }),
  setActiveLayout: (activeLayout: LayoutEngineOption) =>
    set({ activeLayout, forceGraph3dOptions: { layout: "Layout" } }),
  setAppConfig: (appConfig: AppConfig) => set(appConfig),

  setIsDarkMode: (isDarkMode: boolean) => set({ isDarkMode }),
  setSelectedSimulation: (selectedSimulation: string) =>
    set({ selectedSimulation }),

  setLegendMode: (legendMode: RenderingManager__DisplayMode) =>
    set({ legendMode }),
  getLegendMode: (): RenderingManager__DisplayMode =>
    useAppConfigStore.getState().legendMode,
}));

export const setActiveView = (activeView: ActiveView) => {
  useAppConfigStore.setState(() => ({
    activeView,
  }));
};

export const getActiveView = () => {
  return useAppConfigStore.getState().activeView;
};

export const setActiveSceneGraph = (activeSceneGraph: string) => {
  useAppConfigStore.setState(() => ({
    activeSceneGraph,
  }));
};

export const getActiveSceneGraph = () => {
  return useAppConfigStore.getState().activeSceneGraph;
};

export const setWindows = (windows: { showEntityDataCard: boolean }) => {
  useAppConfigStore.setState(() => ({
    windows,
  }));
};

export const getWindows = () => {
  return useAppConfigStore.getState().windows;
};

export const setForceGraph3dOptions = (forceGraph3dOptions: {
  layout: "Physics" | "Layout";
}) => {
  useAppConfigStore.setState(() => ({
    forceGraph3dOptions,
  }));
};

export const setForceGraph3dLayoutMode = (layout: "Physics" | "Layout") => {
  useAppConfigStore.setState(() => ({
    forceGraph3dOptions: { layout },
  }));
};

export const getForceGraph3dLayoutMode = () => {
  return useAppConfigStore.getState().forceGraph3dOptions.layout;
};

export const getForceGraph3dOptions = () => {
  return useAppConfigStore.getState().forceGraph3dOptions;
};

export const getReactFlowInstance = () => {
  return useAppConfigStore.getState().reactFlowInstance;
};

export const getForceGraph3dInstance = () => {
  return useAppConfigStore.getState().forceGraphInstance;
};

export const setActiveLayout = (activeLayout: LayoutEngineOption | string) => {
  useAppConfigStore.setState(() => ({
    activeLayout,
    forceGraph3dOptions: { layout: "Layout" },
  }));
};

export const getActiveLayout = () => {
  return useAppConfigStore.getState().activeLayout;
};

export const setAppConfig = (appConfig: AppConfig) => {
  useAppConfigStore.setState(() => appConfig);
  if (appConfig.workspaceConfig?.leftSidebarConfig.activeSectionId) {
    updateSectionWidth(
      appConfig.workspaceConfig.leftSidebarConfig.activeSectionId,
      appConfig.workspaceConfig.leftSidebarConfig.panelWidth
    );
  }
  if (appConfig.workspaceConfig?.rightSidebarConfig.activeSectionId) {
    updateSectionWidth(
      appConfig.workspaceConfig.rightSidebarConfig.activeSectionId,
      appConfig.workspaceConfig.rightSidebarConfig.panelWidth
    );
  }
};

export const getAppConfig = (): AppConfig => {
  const state = useAppConfigStore.getState();
  return {
    activeView: state.activeView,
    activeSceneGraph: state.activeSceneGraph,
    windows: state.windows,
    forceGraph3dOptions: state.forceGraph3dOptions,
    activeLayout: state.activeLayout,
    legendMode: state.legendMode,
    activeFilter: state.activeFilter,
    workspaceConfig: {
      leftSidebarConfig: getLeftSidebarConfig(),
      rightSidebarConfig: getRightSidebarConfig(),
    },
  };
};

export const setIsDarkMode = (isDarkMode: boolean) => {
  useAppConfigStore.setState(() => ({
    isDarkMode,
  }));
};

export const getShowEntityDataCard = () => {
  return useAppConfigStore.getState().windows.showEntityDataCard;
};

export const setShowEntityDataCard = (showEntityDataCard: boolean) => {
  console.log("setting to ", showEntityDataCard);
  useAppConfigStore.setState(() => ({
    windows: { showEntityDataCard },
  }));
};

export const setLegendMode = (legendMode: RenderingManager__DisplayMode) => {
  useAppConfigStore.setState(() => ({
    legendMode,
  }));
};

export const getLegendMode = () => {
  return useAppConfigStore.getState().legendMode;
};

export const getCurrentSceneGraph = () => {
  return useAppConfigStore.getState().currentSceneGraph;
};

export const setCurrentSceneGraph = (currentSceneGraph: SceneGraph) => {
  useAppConfigStore.setState(() => ({
    currentSceneGraph,
  }));
};

export const getForceGraphInstance = () => {
  return useAppConfigStore.getState().forceGraphInstance;
};

export const setForceGraphInstance = (
  forceGraphInstance: ForceGraph3DInstance
) => {
  useAppConfigStore.setState(() => ({
    forceGraphInstance,
  }));
};

export const setActiveProjectId = (activeProjectId: string | null) => {
  useAppConfigStore.setState(() => ({
    activeProjectId,
  }));
};

export const getActiveProjectId = () => {
  return useAppConfigStore.getState().activeProjectId;
};

export const setActiveFilter = (activeFilter: Filter | null) => {
  useAppConfigStore.setState(() => ({
    activeFilter,
  }));
};

export const getActiveFilter = () => {
  return useAppConfigStore.getState().activeFilter;
};

export const setPreviousView = (previousView: string | null) => {
  useAppConfigStore.setState(() => ({
    previousView,
  }));
};
export const getPreviousView = () => {
  return useAppConfigStore.getState().previousView;
};

export default useAppConfigStore;
