import { create } from "zustand";
import { ObjectOf } from "../App";
import { ILayoutEngineResult } from "../core/layouts/LayoutEngine";
import { NodePositionData } from "../core/layouts/layoutHelpers";
import { SceneGraph } from "../core/model/SceneGraph";
import { getActiveLayout } from "./appConfigStore";

export interface Layout {
  name: string;
  description?: string;
  positions: NodePositionData;
  createdAt?: number;
  updatedAt?: number;
}

interface ActiveLayoutsState {
  savedLayouts: ObjectOf<Layout>;
  saveLayout: (layout: Layout) => void;
  deleteLayout: (layoutName: string) => void;
  getSavedLayouts: () => ObjectOf<Layout>;
  clearLayouts: () => void;
}

const useActiveLayoutStore = create<ActiveLayoutsState>((set, get) => ({
  savedLayouts: {},
  saveLayout: (layout) => {
    const savedLayouts = { ...get().savedLayouts };
    savedLayouts[layout.name] = {
      ...layout,
      updatedAt: Date.now(),
      createdAt: layout.createdAt || Date.now(),
    };
    set({ savedLayouts });
  },
  deleteLayout: (layoutName) => {
    const savedLayouts = { ...get().savedLayouts };
    delete savedLayouts[layoutName];
    set({ savedLayouts });
  },
  getSavedLayouts: () => get().savedLayouts,
  clearLayouts: () => {
    set({ savedLayouts: {} });
  },
}));

export const saveLayout = (layout: Layout) => {
  useActiveLayoutStore.getState().saveLayout(layout);
};

export const deleteLayout = (layoutName: string) => {
  useActiveLayoutStore.getState().deleteLayout(layoutName);
};

export const getSavedLayouts = () => {
  return useActiveLayoutStore.getState().getSavedLayouts();
};

export const loadLayoutsFromSceneGraph = (sceneGraph: SceneGraph) => {
  useActiveLayoutStore.getState().clearLayouts();
  const savedLayouts = sceneGraph.getData().savedLayouts ?? {};
  for (const layoutName in savedLayouts) {
    saveLayout(savedLayouts[layoutName]);
  }
};

export const saveLayoutsToSceneGraph = (sceneGraph: SceneGraph) => {
  sceneGraph.getData().savedLayouts = {};
  const savedLayouts = getSavedLayouts();
  for (const layoutName in savedLayouts) {
    sceneGraph.saveLayout(savedLayouts[layoutName]);
  }
};

export const getLayoutByName = (layoutName: string) => {
  // if (getSavedLayouts()[layoutName] === undefined) {
  //   throw new Error(
  //     `Layout ${layoutName} not found. Available layouts: ${Object.keys(
  //       getSavedLayouts()
  //     ).join(", ")}`
  //   );
  // }
  return getSavedLayouts()[layoutName];
};

export const saveLayoutResult = (layout: ILayoutEngineResult) => {
  const layoutName = layout.layoutType;
  const positions = layout.positions;
  saveLayout({ name: layoutName, positions });
};

export const getActiveLayoutResult = (): Layout | undefined => {
  return getSavedLayouts()[getActiveLayout()];
};

export default useActiveLayoutStore;
