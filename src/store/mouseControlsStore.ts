import { create } from "zustand";
import { ForceGraphManager } from "../core/force-graph/ForceGraphManager";
import { getForceGraphInstance } from "./appConfigStore";

export type MouseControlMode = "orbital" | "multiselection";

export interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isActive: boolean;
  isAdditive: boolean; // For shift-key selection
}

interface MouseControlsState {
  isDraggingNode: boolean;
  setIsDraggingNode: (isDragging: boolean) => void;

  controlMode: MouseControlMode;
  selectionBox: SelectionBox;
  setControlMode: (mode: MouseControlMode) => void;
  toggleControlMode: () => void;
  startSelectionBox: (x: number, y: number, isAdditive?: boolean) => void;
  updateSelectionBox: (x: number, y: number) => void;
  endSelectionBox: () => void;
  clearSelectionBox: () => void;
}

const initialSelectionBox: SelectionBox = {
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  isActive: false,
  isAdditive: false,
};

export const useMouseControlsStore = create<MouseControlsState>((set) => ({
  isDraggingNode: false,
  setIsDraggingNode: (isDragging: boolean) =>
    set({ isDraggingNode: isDragging }),

  controlMode: "orbital", // default mode
  selectionBox: initialSelectionBox,
  setControlMode: (mode: MouseControlMode) => set({ controlMode: mode }),
  toggleControlMode: () =>
    set((state) => ({
      controlMode:
        state.controlMode === "orbital" ? "multiselection" : "orbital",
    })),
  startSelectionBox: (x: number, y: number, isAdditive: boolean = false) =>
    set({
      selectionBox: {
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        isActive: true,
        isAdditive,
      },
    }),
  updateSelectionBox: (x: number, y: number) =>
    set((state) => ({
      selectionBox: {
        ...state.selectionBox,
        endX: x,
        endY: y,
      },
    })),
  endSelectionBox: () =>
    set((state) => ({
      selectionBox: {
        ...state.selectionBox,
        isActive: false,
      },
    })),
  clearSelectionBox: () => set({ selectionBox: initialSelectionBox }),
}));

export const getMouseControlMode = (): MouseControlMode => {
  return useMouseControlsStore.getState().controlMode;
};

export const setMouseControlMode = (mode: MouseControlMode): void => {
  useMouseControlsStore.getState().setControlMode(mode);

  // Also update the ForceGraph3D instance if it exists
  const forceGraphInstance = getForceGraphInstance();
  if (forceGraphInstance) {
    ForceGraphManager.updateMouseControlMode(forceGraphInstance, mode);
  }
};

/**
 * Maps mouseClickMode from interactivityFlags to MouseControlMode
 * and applies it to both the store and ForceGraph3D instance
 */
export const applyMouseClickModeFromInteractivityFlags = (
  mouseClickMode?: "multiselection" | "orbital"
): void => {
  let controlMode: MouseControlMode = "multiselection"; // default

  if (mouseClickMode === "multiselection") {
    controlMode = "multiselection";
  } else if (mouseClickMode === "orbital") {
    controlMode = "orbital";
  }

  // console.log(
  //   `Applying mouse click mode: ${mouseClickMode} -> control mode: ${controlMode}`
  // );
  setMouseControlMode(controlMode);
};

export const toggleMouseControlMode = (): void => {
  useMouseControlsStore.getState().toggleControlMode();
};

export const getSelectionBox = (): SelectionBox => {
  return useMouseControlsStore.getState().selectionBox;
};

export const startSelectionBox = (
  x: number,
  y: number,
  isAdditive: boolean = false
): void => {
  useMouseControlsStore.getState().startSelectionBox(x, y, isAdditive);
};

export const updateSelectionBox = (x: number, y: number): void => {
  useMouseControlsStore.getState().updateSelectionBox(x, y);
};

export const endSelectionBox = (): void => {
  useMouseControlsStore.getState().endSelectionBox();
};

export const clearSelectionBox = (): void => {
  useMouseControlsStore.getState().clearSelectionBox();
};

export const setIsDraggingNode = (isDragging: boolean): void => {
  useMouseControlsStore.getState().setIsDraggingNode(isDragging);
};
export const getIsDraggingNode = (): boolean => {
  return useMouseControlsStore.getState().isDraggingNode;
};
