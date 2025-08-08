import { create } from "zustand";

interface ILayoutManagerState {
  mode: "save" | "load";
  show: boolean;
}

interface ISceneGraphDetailViewState {
  show: boolean;
  readOnly: boolean;
}

type DialogState = {
  showLoadSceneGraphWindow: boolean;
  showSaveSceneGraphDialog: boolean;
  showSaveAsNewProjectDialog: boolean;
  showPathAnalysis: boolean;
  showEntityTables: boolean;
  showEntityTablesV2: boolean;
  showLayoutManager: { mode: "save" | "load"; show: boolean };
  showSceneGraphDetailView: ISceneGraphDetailViewState;
  showFilterManager: ILayoutManagerState;
  showFilterWindow: boolean;
  isCommandPaletteOpen: boolean;
  showWorkspaceManager: boolean;

  setShowLoadSceneGraphWindow: (show: boolean) => void;
  setShowSaveSceneGraphDialog: (show: boolean) => void;
  setShowSaveAsNewProjectDialog: (show: boolean) => void;
  setShowPathAnalysis: (show: boolean) => void;
  setShowEntityTables: (show: boolean) => void;
  setShowEntityTablesV2: (show: boolean) => void;
  setShowLayoutManager: (args: ILayoutManagerState) => void;
  setShowSceneGraphDetailView: (args: ISceneGraphDetailViewState) => void;
  setShowFilterManager: (mode: "save" | "load", show: boolean) => void;
  setShowFilterWindow: (show: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setShowWorkspaceManager: (show: boolean) => void;
};

const useDialogStore = create<DialogState>((set) => ({
  showLoadSceneGraphWindow: false,
  showSaveSceneGraphDialog: false,
  showSaveAsNewProjectDialog: false,
  showPathAnalysis: false,
  showEntityTables: false,
  showEntityTablesV2: false,
  showLayoutManager: { mode: "load", show: false },
  showSceneGraphDetailView: { show: false, readOnly: true },
  showFilterManager: { mode: "load", show: false },
  showFilterWindow: false,
  isCommandPaletteOpen: false,
  showWorkspaceManager: false,

  setShowLoadSceneGraphWindow: (show) =>
    set({ showLoadSceneGraphWindow: show }),
  setShowSaveSceneGraphDialog: (show) =>
    set({ showSaveSceneGraphDialog: show }),
  setShowSaveAsNewProjectDialog: (show) =>
    set({ showSaveAsNewProjectDialog: show }),
  setShowPathAnalysis: (show) => set({ showPathAnalysis: show }),
  setShowEntityTables: (show) => set({ showEntityTables: show }),
  setShowEntityTablesV2: (show) => set({ showEntityTablesV2: show }),
  setShowLayoutManager: (args: ILayoutManagerState) =>
    set({ showLayoutManager: { mode: args.mode, show: args.show } }),
  setShowSceneGraphDetailView: (args: ISceneGraphDetailViewState) =>
    set({
      showSceneGraphDetailView: { show: args.show, readOnly: args.readOnly },
    }),
  setShowFilterManager: (mode, show) =>
    set({ showFilterManager: { mode, show } }),
  setShowFilterWindow: (show) => set({ showFilterWindow: show }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setShowWorkspaceManager: (show) => set({ showWorkspaceManager: show }),
}));

// Public methods for controlling dialogs
export function setShowLoadSceneGraphWindow(show: boolean) {
  useDialogStore.getState().setShowLoadSceneGraphWindow(show);
}

export function setShowSaveSceneGraphDialog(show: boolean) {
  useDialogStore.getState().setShowSaveSceneGraphDialog(show);
}

export function setShowSaveAsNewProjectDialog(show: boolean) {
  useDialogStore.getState().setShowSaveAsNewProjectDialog(show);
}

export function setShowPathAnalysis(show: boolean) {
  useDialogStore.getState().setShowPathAnalysis(show);
}

export function setShowEntityTables(show: boolean) {
  useDialogStore.getState().setShowEntityTables(show);
}

export function setShowEntityTablesV2(show: boolean) {
  useDialogStore.getState().setShowEntityTablesV2(show);
}

export function setShowLayoutManager(mode: "save" | "load", show: boolean) {
  useDialogStore.getState().setShowLayoutManager({ mode, show });
}

export function setShowSceneGraphDetailView(
  show: boolean,
  readOnly: boolean = true
) {
  useDialogStore.getState().setShowSceneGraphDetailView({ show, readOnly });
}

export function setShowFilterManager(mode: "save" | "load", show: boolean) {
  useDialogStore.getState().setShowFilterManager(mode, show);
}

export function setShowFilterWindow(show: boolean) {
  useDialogStore.getState().setShowFilterWindow(show);
}

// Public methods for controlling the command palette
export function setShowCommandPalette(open: boolean) {
  useDialogStore.getState().setCommandPaletteOpen(open);
}

export function setShowWorkspaceManager(show: boolean) {
  useDialogStore.getState().setShowWorkspaceManager(show);
}

export default useDialogStore;
