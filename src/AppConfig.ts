import { RenderingManager__DisplayMode } from "./controllers/RenderingManager";
import { CustomLayoutType } from "./core/layouts/CustomLayoutEngine";
import { LayoutEngineOption } from "./core/layouts/layoutEngineTypes";
import { Filter } from "./store/activeFilterStore";
import { ISidebarConfig } from "./store/workspaceConfigStore";
// import { SceneGraph } from "./core/model/SceneGraph";

export type ForceGraph3dLayoutMode = "Physics" | "Layout";
export type ActiveView = "ForceGraph3d" | "ReactFlow" | "Graphviz" | string;

export type AppConfig = {
  activeView: ActiveView;

  activeSceneGraph: string;
  windows: {
    showEntityDataCard: boolean; //dev tool
  };
  forceGraph3dOptions: {
    layout: ForceGraph3dLayoutMode;
  };
  activeLayout: LayoutEngineOption | string;
  activeFilter: Filter | null;
  legendMode: RenderingManager__DisplayMode;
  workspaceConfig?: {
    leftSidebarConfig: ISidebarConfig;
    rightSidebarConfig: ISidebarConfig;
  };
};

export const DEFAULT_APP_CONFIG = (): AppConfig => {
  return {
    activeView: "ForceGraph3d",
    activeSceneGraph: "AcademicsKG",
    windows: {
      showEntityDataCard: false,
    },
    forceGraph3dOptions: {
      layout: "Physics",
    },
    activeLayout: CustomLayoutType.Circular,
    legendMode: "type",
    activeFilter: null,
  };
};
