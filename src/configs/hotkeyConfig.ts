import { cmdOrCtrl, HotkeyAction } from "../hooks/useHotkeys";
import {
  setShowCommandPalette,
  setShowEntityTables,
  setShowEntityTablesV2,
  setShowFilterManager,
  setShowFilterWindow,
  setShowLoadSceneGraphWindow,
  setShowSceneGraphDetailView,
} from "../store/dialogStore";

export const getHotkeyConfig = (
  handleSetSceneGraph?: (key: string, clearQueryParams?: boolean) => void
): HotkeyAction[] => [
  // Command Palette
  cmdOrCtrl(() => setShowCommandPalette(true), "p", {
    shiftKey: true,
    description: "Open Command Palette",
  }),

  // Project actions
  //   cmdOrCtrl(() => setShowSaveSceneGraphDialog(true), "s", {
  //     description: "Save Project",
  //   }),

  //   cmdOrCtrl(() => setShowSaveAsNewProjectDialog(true), "s", {
  //     shiftKey: true,
  //     description: "Save Project As",
  //   }),

  cmdOrCtrl(() => setShowLoadSceneGraphWindow(true), "o", {
    description: "Open Project",
  }),

  // View actions
  cmdOrCtrl(() => setShowEntityTables(true), "e", {
    description: "Show Entity Tables",
  }),

  cmdOrCtrl(() => setShowEntityTablesV2(true), "e", {
    shiftKey: true,
    description: "Show Entity Tables V2",
  }),

  //   cmdOrCtrl(() => setShowPathAnalysis(true), "p", {
  //     description: "Show Path Analysis",
  //   }),

  cmdOrCtrl(() => setShowFilterWindow(true), "f", {
    description: "Show Filter Window",
  }),

  cmdOrCtrl(() => setShowFilterManager("load", true), "f", {
    shiftKey: true,
    description: "Show Filter Manager",
  }),

  cmdOrCtrl(() => setShowSceneGraphDetailView(true), "d", {
    description: "Show Scene Graph Details",
  }),

  cmdOrCtrl(
    () => {
      if (handleSetSceneGraph) {
        console.log("Creating new project");
        handleSetSceneGraph("Empty", true);
      }
    },
    "n",
    {
      shiftKey: true,
      description: "Create new project",
    }
  ),

  // Additional hotkeys can be added here
  // Example:
  // cmdOrCtrl(
  //   () => someAction(),
  //   'g',
  //   { description: 'Some Action' }
  // ),
];
