import { compressSceneGraphJsonForUrl } from "../core/serializers/toFromJson";
import { cmdOrCtrl, HotkeyAction } from "../hooks/useHotkeys";
import {
  getCurrentSceneGraph,
  getInteractivityFlags,
} from "../store/appConfigStore";
import {
  setShowCommandPalette,
  setShowEntityTables,
  setShowEntityTablesV2,
  setShowFilterManager,
  setShowFilterWindow,
  setShowLoadSceneGraphWindow,
  setShowSceneGraphDetailView,
} from "../store/dialogStore";
import { addNotification } from "../store/notificationStore";

export const getHotkeyConfig = (
  handleSetSceneGraph?: (key: string, clearQueryParams?: boolean) => void
): HotkeyAction[] => [
  // Command Palette
  cmdOrCtrl(
    () => {
      // Check if command palette is disabled via interactivityFlags
      const interactivityFlags = getInteractivityFlags();
      if (interactivityFlags?.commandPalette === false) {
        console.log("Command palette is disabled via interactivityFlags");
        return;
      }
      setShowCommandPalette(true);
    },
    "p",
    {
      shiftKey: true,
      description: "Open Command Palette",
    }
  ),

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

  cmdOrCtrl(
    () => {
      const sceneGraph = getCurrentSceneGraph();
      const compressed = compressSceneGraphJsonForUrl(sceneGraph);
      const url = `${window.location.origin}${window.location.pathname}#scenegraph=${compressed}`;
      navigator.clipboard.writeText(url);
      console.log("Compressed SceneGraph URL copied to clipboard:", url);
      addNotification({
        message: "SceneGraph URL copied to clipboard",
        type: "success",
      });
    },
    "c",
    {
      shiftKey: true,
      description: "Copy SceneGraph URL",
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
