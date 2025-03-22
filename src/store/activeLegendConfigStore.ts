import { create } from "zustand";
import {
  DisplayConfig,
  RenderingManager,
} from "../controllers/RenderingManager";
import { EdgeId } from "../core/model/Edge";
import { IEntity } from "../core/model/entity/abstractEntity";
import { NodeId } from "../core/model/Node";
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
  setNodeKeyVisibility: (key: NodeId, isVisible: boolean) => void;
  getNodeKeyVisibility: (key: NodeId) => boolean;
  setEdgeKeyVisibility: (key: EdgeId, isVisible: boolean) => void;
  getEdgeKeyVisibility: (key: EdgeId) => boolean;
  setNodeKeyColor: (key: NodeId, color: string) => void;
  getNodeKeyColor: (key: NodeId) => string;
  setEdgeKeyColor: (key: EdgeId, color: string) => void;
  getEdgeKeyColor: (key: EdgeId) => string;
};

const useActiveLegendConfigStore = create<ActiveLegendConfigState>((set) => ({
  nodeLegendConfig: {},
  edgeLegendConfig: {},

  nodeLegendUpdateTime: Date.now(),
  edgeLegendUpdateTime: Date.now(),
  _setNodeLegendUpdateTime: () => set({ nodeLegendUpdateTime: Date.now() }),
  _setEdgeLegendUpdateTime: () => set({ edgeLegendUpdateTime: Date.now() }),

  setNodeLegendConfig: (config: DisplayConfig) =>
    set({ nodeLegendConfig: config, nodeLegendUpdateTime: Date.now() }),
  setEdgeLegendConfig: (config: DisplayConfig) =>
    set({ edgeLegendConfig: config, edgeLegendUpdateTime: Date.now() }),
  setNodeKeyVisibility: (key, isVisible) =>
    set((state) => {
      if (state.nodeLegendConfig[key]?.isVisible === isVisible) {
        return state; // No change needed
      }
      return {
        nodeLegendConfig: {
          ...state.nodeLegendConfig,
          [key]: {
            ...state.nodeLegendConfig[key],
            isVisible,
          },
        },
        nodeLegendUpdateTime: Date.now(),
      };
    }),
  getNodeKeyVisibility: (key: NodeId): boolean => {
    return (
      useActiveLegendConfigStore.getState().nodeLegendConfig[key]?.isVisible ??
      true
    );
  },
  getEdgeKeyVisibility: (key: EdgeId): boolean => {
    return (
      useActiveLegendConfigStore.getState().edgeLegendConfig[key]?.isVisible ??
      true
    );
  },
  getEdgeLegendConfig: (): DisplayConfig => {
    return useActiveLegendConfigStore.getState().edgeLegendConfig;
  },
  getNodeLegendConfig: (): DisplayConfig => {
    return useActiveLegendConfigStore.getState().nodeLegendConfig;
  },
  setEdgeKeyVisibility: (key, isVisible) =>
    set((state) => {
      if (state.edgeLegendConfig[key]?.isVisible === isVisible) {
        return state; // No change needed
      }
      return {
        edgeLegendConfig: {
          ...state.edgeLegendConfig,
          [key]: {
            ...state.edgeLegendConfig[key],
            isVisible,
          },
        },
        edgeLegendUpdateTime: Date.now(),
      };
    }),
  setNodeKeyColor: (key, color) =>
    set((state) => {
      if (state.nodeLegendConfig[key]?.color === color) {
        return state; // No change needed
      }
      return {
        nodeLegendConfig: {
          ...state.nodeLegendConfig,
          [key]: {
            ...state.nodeLegendConfig[key],
            color,
          },
        },
        nodeLegendUpdateTime: Date.now(),
      };
    }),
  setEdgeKeyColor: (key, color) =>
    set((state) => {
      if (state.edgeLegendConfig[key]?.color === color) {
        return state; // No change needed
      }
      return {
        edgeLegendConfig: {
          ...state.edgeLegendConfig,
          [key]: {
            ...state.edgeLegendConfig[key],
            color,
          },
        },
        edgeLegendUpdateTime: Date.now(),
      };
    }),
  getNodeKeyColor: (key: NodeId): string => {
    return (
      useActiveLegendConfigStore.getState().nodeLegendConfig[key]?.color ??
      getRandomColor()
    );
  },
  getEdgeKeyColor: (key: EdgeId): string => {
    return (
      useActiveLegendConfigStore.getState().edgeLegendConfig[key]?.color ??
      getRandomColor()
    );
  },
}));

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

export const getNodeIsVisible = (node: IEntity): boolean =>
  RenderingManager.getVisibility(node, getNodeLegendConfig(), getLegendMode());

export const getNodeColor = (node: IEntity): string =>
  RenderingManager.getColor(node, getNodeLegendConfig(), getLegendMode());

export const getEdgeIsVisible = (edge: IEntity): boolean =>
  RenderingManager.getVisibility(edge, getEdgeLegendConfig(), getLegendMode());

export const getEdgeColor = (edge: IEntity): string =>
  RenderingManager.getColor(edge, getEdgeLegendConfig(), getLegendMode());

export default useActiveLegendConfigStore;
