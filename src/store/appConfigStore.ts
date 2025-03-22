import { create } from "zustand";
import { RenderingManager__DisplayMode } from "../controllers/RenderingManager";
import { LayoutEngineOption } from "../core/layouts/LayoutEngine";
import { SceneGraph } from "../core/model/SceneGraph";
import { ActiveView, AppConfig, DEFAULT_APP_CONFIG } from "./../AppConfig";

export type AppConfigActions = {
  setActiveView: (activeView: ActiveView) => void;
  setActiveSceneGraph: (activeSceneGraph: string) => void;
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

    currentSceneGraph: SceneGraph;
    setCurrentSceneGraph: (sceneGraph: SceneGraph) => void;
    getCurrentSceneGraph: () => SceneGraph;
  };

const DEFAULTS = DEFAULT_APP_CONFIG();

const useAppConfigStore = create<AppState>((set) => ({
  currentSceneGraph: new SceneGraph({ metadata: { name: "Empty" } }),
  setCurrentSceneGraph: (currentSceneGraph: SceneGraph) =>
    set({ currentSceneGraph }),
  getCurrentSceneGraph: (): SceneGraph =>
    useAppConfigStore.getState().currentSceneGraph,

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

  setActiveView: (activeView: ActiveView) => set({ activeView }),
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

export const setActiveLayout = (activeLayout: LayoutEngineOption) => {
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
};

export const getAppConfig = () => {
  return useAppConfigStore.getState();
};

export const setIsDarkMode = (isDarkMode: boolean) => {
  useAppConfigStore.setState(() => ({
    isDarkMode,
  }));
};

export const getShowEntityDataCard = () => {
  console.log(
    "getting as ",
    useAppConfigStore.getState().windows.showEntityDataCard
  );
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

export default useAppConfigStore;
