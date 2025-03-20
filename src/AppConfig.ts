import { CustomLayoutType } from "./core/layouts/CustomLayoutEngine";
import { LayoutEngineOption } from "./core/layouts/LayoutEngine";
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
  activeLayout: LayoutEngineOption;
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
    activeLayout: CustomLayoutType.Random,
  };
};
