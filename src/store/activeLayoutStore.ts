import { create } from "zustand";
import { ObjectOf } from "../App";
import {
  ILayoutEngineResult,
  LayoutEngineOption,
} from "../core/layouts/layoutEngineTypes";
import { NodePositionData } from "../core/layouts/layoutHelpers";
import { SceneGraph } from "../core/model/SceneGraph";
import { getActiveLayout, setActiveLayout } from "./appConfigStore";

export interface LayoutJobStatus {
  isRunning: boolean;
  startTime: number | null;
  layoutType: LayoutEngineOption | null;
  workerId: string | null;
  progress?: number;
}

export interface Layout {
  name: string;
  description?: string;
  positions: NodePositionData;
  createdAt?: number;
  updatedAt?: number;
}

interface ActiveLayoutsState {
  savedLayouts: ObjectOf<Layout>;
  jobStatus: LayoutJobStatus;
  currentLayoutResult: ILayoutEngineResult | null;

  // Layout operations
  saveLayout: (layout: Layout) => void;
  deleteLayout: (layoutName: string) => void;
  getSavedLayouts: () => ObjectOf<Layout>;
  clearLayouts: () => void;

  // Layout result operations
  setCurrentLayoutResult: (
    result: ILayoutEngineResult | null,
    forceGraph3dLayoutMode: "Physics" | "Layout"
  ) => void;
  getCurrentLayoutResult: () => ILayoutEngineResult | null;

  // Job status operations
  startLayoutJob: (layoutType: LayoutEngineOption, workerId: string) => void;
  updateLayoutJobProgress: (progress: number) => void;
  finishLayoutJob: () => void;
  cancelLayoutJob: () => void;
}

const useActiveLayoutStore = create<ActiveLayoutsState>((set, get) => ({
  savedLayouts: {},
  jobStatus: {
    isRunning: false,
    startTime: null,
    layoutType: null,
    workerId: null,
    progress: 0,
  },
  currentLayoutResult: null,

  // Layout operations
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

  // Layout result operations
  setCurrentLayoutResult: (
    result,
    forceGraph3dOptionsLayoutMode: "Physics" | "Layout" = "Layout"
  ) => {
    set({ currentLayoutResult: result });
    setActiveLayout(
      result?.layoutType ?? "error",
      forceGraph3dOptionsLayoutMode
    );
  },

  getCurrentLayoutResult: () => {
    return get().currentLayoutResult;
  },

  // Job status operations
  startLayoutJob: (layoutType, workerId) => {
    set({
      jobStatus: {
        isRunning: true,
        startTime: Date.now(),
        layoutType,
        workerId,
        progress: 0,
      },
    });
  },

  updateLayoutJobProgress: (progress) => {
    if (get().jobStatus.isRunning) {
      set((state) => ({
        jobStatus: {
          ...state.jobStatus,
          progress,
        },
      }));
    }
  },

  finishLayoutJob: () => {
    set((state) => ({
      jobStatus: {
        ...state.jobStatus,
        isRunning: false,
      },
    }));
  },

  cancelLayoutJob: () => {
    set((state) => ({
      ...state,
      jobStatus: {
        isRunning: false,
        startTime: null,
        layoutType: null,
        workerId: null,
        progress: 0,
      },
    }));
  },
}));

// Export actions for easier access
export const saveLayout = (layout: Layout) => {
  useActiveLayoutStore.getState().saveLayout(layout);
};

export const deleteLayout = (layoutName: string) => {
  useActiveLayoutStore.getState().deleteLayout(layoutName);
};

export const getSavedLayouts = () => {
  return useActiveLayoutStore.getState().getSavedLayouts();
};

// Layout result actions
export const setCurrentLayoutResult = (
  result: ILayoutEngineResult | null,
  forceGraph3dOptionsLayoutMode: "Layout" | "Physics" = "Layout"
) => {
  console.log("before", JSON.parse(JSON.stringify(result)));
  console.log("setting current layout result to", result);
  // if (result) {
  //   result.positions = JSON.parse((result as any).serialization || "{}"); // Ensure positions are parsed correctly
  // }
  useActiveLayoutStore
    .getState()
    .setCurrentLayoutResult(result, forceGraph3dOptionsLayoutMode);
};

export const getCurrentLayoutResult = (): ILayoutEngineResult | null => {
  return useActiveLayoutStore.getState().getCurrentLayoutResult();
};

// Job status actions
export const startLayoutJob = (
  layoutType: LayoutEngineOption,
  workerId: string
) => {
  console.log("Starting layout job:", layoutType, workerId);
  useActiveLayoutStore.setState((state) => ({
    ...state,
    jobStatus: {
      isRunning: true,
      startTime: Date.now(),
      layoutType,
      workerId,
      progress: 0,
    },
  }));
};

export const updateLayoutJobProgress = (progress: number) => {
  useActiveLayoutStore.setState((state) => {
    if (state.jobStatus.isRunning) {
      return {
        ...state,
        jobStatus: {
          ...state.jobStatus,
          progress,
        },
      };
    }
    return state;
  });
};

export const finishLayoutJob = () => {
  console.log("Finishing layout job");
  useActiveLayoutStore.setState((state) => ({
    ...state,
    jobStatus: {
      ...state.jobStatus,
      isRunning: false,
    },
  }));
};

export const cancelLayoutJob = () => {
  console.log("Cancelling layout job");
  useActiveLayoutStore.setState((state) => ({
    ...state,
    jobStatus: {
      isRunning: false,
      startTime: null,
      layoutType: null,
      workerId: null,
      progress: 0,
    },
  }));
};

// Selectors for job status
export const selectLayoutJobStatus = () => {
  return useActiveLayoutStore.getState().jobStatus;
};

export const selectIsLayoutJobRunning = () => {
  return useActiveLayoutStore.getState().jobStatus.isRunning;
};

export const selectLayoutJobDuration = () => {
  const { startTime, isRunning } = useActiveLayoutStore.getState().jobStatus;
  if (!isRunning || !startTime) return 0;
  return Math.floor((Date.now() - startTime) / 1000); // duration in seconds
};

// Other existing functions
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
  return getSavedLayouts()[layoutName];
};

export const saveLayoutResult = (layout: ILayoutEngineResult) => {
  const layoutName = layout.layoutType;
  const positions = layout.positions;
  saveLayout({ name: layoutName, positions });
};

export const getActiveLayoutResult = (): Layout | undefined => {
  // First check the current result which has priority
  const mostRecentLayoutResult = getCurrentLayoutResult();
  if (mostRecentLayoutResult) {
    return {
      name: mostRecentLayoutResult.layoutType,
      positions: mostRecentLayoutResult.positions,
    };
  }

  // Fall back to saved layout
  const activeLayoutName = getActiveLayout();
  return getSavedLayouts()[activeLayoutName] ?? undefined;
};

export default useActiveLayoutStore;
