import { CustomLayoutType } from "./core/layouts/CustomLayoutEngine";
import { LayoutEngineOption } from "./core/layouts/LayoutEngine";
// import { SceneGraph } from "./core/model/SceneGraph";

export type ForceGraph3dLayoutMode = "Physics" | "Layout";
export type ActiveView = "ForceGraph3d" | "ReactFlow" | "Graphviz" | string;

export type AppConfig = {
  activeView: ActiveView;

  activeSceneGraph: string;
  windows: {
    showLegendBars: boolean;
    showOptionsPanel: boolean;
    showGraphLayoutToolbar: boolean;
    showEntityDataCard: boolean; //dev tool
  };
  forceGraph3dOptions: {
    layout: ForceGraph3dLayoutMode;
    showOptionsPanel: boolean;
  };
  activeLayout: LayoutEngineOption;
};

export const DEFAULT_APP_CONFIG = (): AppConfig => {
  return {
    activeView: "ForceGraph3d",
    activeSceneGraph: "AcademicsKG",
    windows: {
      showLegendBars: true,
      showOptionsPanel: true,
      showGraphLayoutToolbar: true,
      showEntityDataCard: false,
    },
    forceGraph3dOptions: {
      layout: "Physics",
      showOptionsPanel: true,
    },
    activeLayout: CustomLayoutType.Random,
  };
};
