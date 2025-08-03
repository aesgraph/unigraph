import { RenderingManager__DisplayMode } from "./controllers/RenderingManager";
import { GraphvizLayoutType } from "./core/layouts/GraphvizLayoutType";
import { LayoutEngineOption } from "./core/layouts/layoutEngineTypes";
import { Filter } from "./store/activeFilterStore";
import { MouseControlMode } from "./store/mouseControlsStore";
import { ISidebarConfig } from "./store/workspaceConfigStore";
// import { SceneGraph } from "./core/model/SceneGraph";

export type ForceGraph3dLayoutMode = "Physics" | "Layout";
export type ActiveView = "ForceGraph3d" | "ReactFlow" | "Graphviz" | string;

export type WorkspaceConfig = {
  hideAll?: boolean;
  showToolbar?: boolean;
  leftSidebarConfig?: ISidebarConfig;
  rightSidebarConfig?: ISidebarConfig;
};

export const DEFAULT_WORKSPACE_CONFIG = (): WorkspaceConfig => {
  return {
    hideAll: false,
    showToolbar: true,
    leftSidebarConfig: {
      isVisible: true,
      mode: "collapsed",
      minimal: false,
      activeSectionId: null,
      panelWidth: 300,
    },
    rightSidebarConfig: {
      isVisible: true,
      mode: "collapsed",
      minimal: false,
      activeSectionId: null,
      panelWidth: 300,
    },
  };
};

export type InteractivityFlags = {
  commandPalette?: boolean;
  cameraControls?: boolean;
  mouseClickMode?: MouseControlMode;
};

export const DEFAULT_INTERACTIVITY_FLAGS: InteractivityFlags = {
  commandPalette: true,
  cameraControls: true,
  mouseClickMode: "orbital",
};

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
  workspaceConfig?: WorkspaceConfig;
  appShellLayout?: string;
  interactivityFlags?: InteractivityFlags;
};

export const DEFAULT_APP_CONFIG = (): AppConfig => {
  return {
    activeView: "AppShell",
    activeSceneGraph: "Empty",
    windows: {
      showEntityDataCard: false,
    },
    forceGraph3dOptions: {
      layout: "Physics",
    },
    activeLayout: GraphvizLayoutType.Graphviz_dot,
    legendMode: "type",
    activeFilter: null,
    interactivityFlags: DEFAULT_INTERACTIVITY_FLAGS,
    appShellLayout: "documentation",
  };
};
