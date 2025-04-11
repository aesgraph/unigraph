import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { FilterRuleDefinition } from "../components/filters/FilterRuleDefinition";
import {
  DisplayConfig,
  DisplayConfigData,
  RenderingManager,
  RenderingManager__DisplayMode,
} from "../controllers/RenderingManager";
import { DisplayManager } from "../core/model/DisplayManager";
import { EdgeId } from "../core/model/Edge";
import { IEntity } from "../core/model/entity/abstractEntity";
import { NodeId } from "../core/model/Node";
import { SceneGraph } from "../core/model/SceneGraph";
import { GetCurrentDisplayConfigOf } from "../core/model/utils";
import { getRandomColor } from "../utils/colorUtils";
import { getLegendMode } from "./appConfigStore";

export type ActiveLegendConfigState = {
  nodeLegendConfig: DisplayConfig;
  edgeLegendConfig: DisplayConfig;
  nodeLegendUpdateTime: number; // Used to force re-render. This should be updated on any set.
  edgeLegendUpdateTime: number;
  setNodeLegendConfig: (config: DisplayConfig) => void;
  getNodeLegendConfig: () => DisplayConfig;
  setEdgeLegendConfig: (config: DisplayConfig) => void;
  getEdgeLegendConfig: () => DisplayConfig;
  setNodeKeyOpacity: (key: NodeId, opacity: number) => void;
  getNodeKeyOpacity: (key: NodeId) => number;
  setNodeKeyVisibility: (key: NodeId, isVisible: boolean) => void;
  getNodeKeyVisibility: (key: NodeId) => boolean;
  setEdgeKeyVisibility: (key: EdgeId, isVisible: boolean) => void;
  getEdgeKeyVisibility: (key: EdgeId) => boolean;
  setNodeKeyColor: (key: NodeId, color: string) => void;
  getNodeKeyColor: (key: NodeId) => string;
  setEdgeKeyColor: (key: EdgeId, color: string) => void;
  getEdgeKeyColor: (key: EdgeId) => string;
  setNodeKeyData: (key: NodeId, data: DisplayConfigData) => void;
  setEdgeKeyData: (key: EdgeId, data: DisplayConfigData) => void;
};

const useActiveLegendConfigStore = create(
  immer<ActiveLegendConfigState>((set, get) => ({
    nodeLegendConfig: {},
    edgeLegendConfig: {},
    nodeLegendUpdateTime: Date.now(),
    edgeLegendUpdateTime: Date.now(),

    setNodeKeyData: (key, data) =>
      set((state) => {
        state.nodeLegendConfig[key] = data;
        state.nodeLegendUpdateTime = Date.now();
      }),
    setEdgeKeyData: (key, data) =>
      set((state) => {
        state.edgeLegendConfig[key] = data;
        state.edgeLegendUpdateTime = Date.now();
      }),

    setNodeLegendConfig: (config: DisplayConfig) =>
      set((state) => {
        state.nodeLegendConfig = config;
        state.nodeLegendUpdateTime = Date.now();
      }),
    setEdgeLegendConfig: (config: DisplayConfig) =>
      set((state) => {
        state.edgeLegendConfig = config;
        state.edgeLegendUpdateTime = Date.now();
      }),
    setNodeKeyOpacity: (key, opacity) =>
      set((state) => {
        if (state.nodeLegendConfig[key]?.opacity !== opacity) {
          state.nodeLegendConfig[key] = {
            ...state.nodeLegendConfig[key],
            opacity,
          };
          state.nodeLegendUpdateTime = Date.now();
        }
      }
    ),
    getNodeKeyOpacity: (key: NodeId): number => {
      return get().nodeLegendConfig[key]?.opacity ?? 1;
    },


    setNodeKeyVisibility: (key, isVisible) =>
      set((state) => {
        if (state.nodeLegendConfig[key]?.isVisible !== isVisible) {
          state.nodeLegendConfig[key] = {
            ...state.nodeLegendConfig[key],
            isVisible,
          };
          state.nodeLegendUpdateTime = Date.now();
        }
      }),
    getNodeKeyVisibility: (key: NodeId): boolean => {
      return get().nodeLegendConfig[key]?.isVisible ?? true;
    },
    setEdgeKeyVisibility: (key, isVisible) =>
      set((state) => {
        if (state.edgeLegendConfig[key]?.isVisible !== isVisible) {
          state.edgeLegendConfig[key] = {
            ...state.edgeLegendConfig[key],
            isVisible,
          };
          state.edgeLegendUpdateTime = Date.now();
        }
      }),
    getEdgeKeyVisibility: (key: EdgeId): boolean => {
      return get().edgeLegendConfig[key]?.isVisible ?? true;
    },
    setNodeKeyColor: (key, color) =>
      set((state) => {
        if (state.nodeLegendConfig[key]?.color !== color) {
          state.nodeLegendConfig[key] = {
            ...state.nodeLegendConfig[key],
            color,
          };
          state.nodeLegendUpdateTime = Date.now();
        }
      }),
    setEdgeKeyColor: (key, color) =>
      set((state) => {
        if (state.edgeLegendConfig[key]?.color !== color) {
          state.edgeLegendConfig[key] = {
            ...state.edgeLegendConfig[key],
            color,
          };
          state.edgeLegendUpdateTime = Date.now();
        }
      }),
    getNodeKeyColor: (key: NodeId): string => {
      return get().nodeLegendConfig[key]?.color ?? getRandomColor();
    },
    getEdgeKeyColor: (key: EdgeId): string => {
      return get().edgeLegendConfig[key]?.color ?? getRandomColor();
    },
    getNodeLegendConfig: (): DisplayConfig => {
      return get().nodeLegendConfig;
    },
    getEdgeLegendConfig: (): DisplayConfig => {
      return get().edgeLegendConfig;
    },
  }))
);

export const setNodeLegendConfig = (config: DisplayConfig) => {
  useActiveLegendConfigStore.getState().setNodeLegendConfig(config);
};

export const setEdgeLegendConfig = (config: DisplayConfig) => {
  useActiveLegendConfigStore.getState().setEdgeLegendConfig(config);
};

export const getNodeLegendConfig = () => {
  return useActiveLegendConfigStore.getState().getNodeLegendConfig();
};

export const getEdgeLegendConfig = () => {
  return useActiveLegendConfigStore.getState().getEdgeLegendConfig();
};

export const setNodeKeyVisibility = (key: NodeId, isVisible: boolean) => {
  useActiveLegendConfigStore.getState().setNodeKeyVisibility(key, isVisible);
};

export const getNodeVisibility = (key: NodeId) => {
  return useActiveLegendConfigStore.getState().getNodeKeyVisibility(key);
};

export const setNodeKeyOpacity = (key: NodeId, opacity: number) => {
  useActiveLegendConfigStore.getState().setNodeKeyOpacity(key, opacity);
};


export const getNodeOpacity = (key: NodeId) => {
  return useActiveLegendConfigStore.getState().getNodeKeyOpacity(key);
};

export const getEdgeVisibility = (key: EdgeId) => {
  return useActiveLegendConfigStore.getState().getEdgeKeyVisibility(key);
};

export const setEdgeKeyVisibility = (key: EdgeId, isVisible: boolean) => {
  useActiveLegendConfigStore.getState().setEdgeKeyVisibility(key, isVisible);
};

export const setNodeKeyColor = (key: NodeId, color: string) => {
  useActiveLegendConfigStore.getState().setNodeKeyColor(key, color);
};

export const setEdgeKeyColor = (key: EdgeId, color: string) => {
  useActiveLegendConfigStore.getState().setEdgeKeyColor(key, color);
};

export const getNodeKeyColor = (key: NodeId) => {
  return useActiveLegendConfigStore.getState().getNodeKeyColor(key);
};

export const getEdgeKeyColor = (key: EdgeId) => {
  return useActiveLegendConfigStore.getState().getEdgeKeyColor(key);
};

export const getActiveNodeLegendConfig = () => {
  return useActiveLegendConfigStore.getState().nodeLegendConfig;
};

export const getActiveEdgeLegendConfig = () => {
  return useActiveLegendConfigStore.getState().edgeLegendConfig;
};

export const getNodeIsVisible = (node: IEntity): boolean =>
  RenderingManager.getVisibility(node, getNodeLegendConfig(), getLegendMode());

export const getNodeColor = (node: IEntity): string =>
  RenderingManager.getColor(node, getNodeLegendConfig(), getLegendMode());

export const getEdgeIsVisible = (edge: IEntity): boolean =>
  RenderingManager.getVisibility(edge, getEdgeLegendConfig(), getLegendMode());

export const getEdgeColor = (edge: IEntity): string =>
  RenderingManager.getColor(edge, getEdgeLegendConfig(), getLegendMode());

export const setNodeKeyData = (key: NodeId, data: DisplayConfigData) => {
  useActiveLegendConfigStore.getState().setNodeKeyData(key, data);
};

export const setEdgeKeyData = (key: EdgeId, data: DisplayConfigData) => {
  useActiveLegendConfigStore.getState().setEdgeKeyData(key, data);
};

export const SetNodeAndEdgeLegendsForOnlyVisibleEntities = (
  sceneGraph: SceneGraph,
  mode: RenderingManager__DisplayMode,
  filterRules?: FilterRuleDefinition[]
) => {
  console.log("enter");
  const nodeLegend = DisplayManager.getDisplayConfigForOnlyVisibleEntities(
    sceneGraph,
    "Node",
    mode,
    filterRules
  );
  setNodeLegendConfig(nodeLegend);
  const edgeLegend = DisplayManager.getDisplayConfigForOnlyVisibleEntities(
    sceneGraph,
    "Edge",
    mode,
    filterRules
  );
  setEdgeLegendConfig(edgeLegend);
};

export const ResetNodeAndEdgeLegends = (sceneGraph: SceneGraph) => {
  const nodeLegend = GetCurrentDisplayConfigOf(
    sceneGraph.getCommittedDisplayConfig(),
    "Node"
  );
  setNodeLegendConfig(nodeLegend);
  const edgeLegend = GetCurrentDisplayConfigOf(
    sceneGraph.getCommittedDisplayConfig(),
    "Edge"
  );
  setEdgeLegendConfig(edgeLegend);
};

export default useActiveLegendConfigStore;
