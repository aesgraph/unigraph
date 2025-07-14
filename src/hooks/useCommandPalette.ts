import React, { useCallback, useEffect, useState } from "react";
import { CustomLayoutType } from "../core/layouts/CustomLayoutEngine";
import { GraphologyLayoutType } from "../core/layouts/GraphologyLayoutEngine";
import { GraphvizLayoutType } from "../core/layouts/GraphvizLayoutType";
import { SceneGraph } from "../core/model/SceneGraph";
import { getAllDemoSceneGraphKeys } from "../data/DemoSceneGraphs";
import useAppConfigStore, {
  getCurrentSceneGraph,
  getInteractivityFlags,
} from "../store/appConfigStore";
import useDialogStore from "../store/dialogStore";
import { computeLayoutAndTriggerUpdateForCurrentSceneGraph } from "../store/sceneGraphHooks";
import useWorkspaceConfigStore from "../store/workspaceConfigStore";

export interface Command {
  id: string;
  title: string;
  description?: string;
  execute: () => void;
  children?: Command[];
}

export const useCommandPalette = (
  handleSetSceneGraph?: (
    key: string,
    clearQueryParams?: boolean,
    onLoaded?: (sceneGraph?: SceneGraph) => void
  ) => void
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [commands, setCommands] = useState<Command[]>([]);
  const [demoStep, setDemoStep] = useState(false); // Track if in demo selection step
  const [demoFilter, setDemoFilter] = useState(""); // For filtering demo list
  const { setActiveView, currentSceneGraph } = useAppConfigStore();
  const {
    setShowLoadSceneGraphWindow,
    setShowSaveSceneGraphDialog,
    setShowSaveAsNewProjectDialog,
    setShowEntityTables,
    setShowEntityTablesV2,
    setShowPathAnalysis,
    setShowFilterWindow,
    setShowFilterManager,
    setShowSceneGraphDetailView,
    setCommandPaletteOpen,
  } = useDialogStore();

  // Memoize demo graph keys for filtering
  const demoGraphKeys = React.useMemo(() => getAllDemoSceneGraphKeys(), []);

  // Register default commands
  useEffect(() => {
    // Always set commands based on demoStep
    if (demoStep) {
      // Show filtered demo graph selection
      const filteredKeys = demoGraphKeys.filter((key) =>
        key.toLowerCase().includes(demoFilter.toLowerCase())
      );
      setCommands(
        filteredKeys.map((key) => ({
          id: `demo-graph-${key}`,
          title: key,
          description: `Load the ${key} demo graph`,
          execute: () => {
            if (handleSetSceneGraph) {
              handleSetSceneGraph(key, true);
            } else {
              // Fallback to URL-based loading
              const url = new URL(window.location.href);
              url.searchParams.set("graph", key);
              window.history.pushState({}, "", url.toString());
              window.location.reload();
            }
            setDemoStep(false);
            setDemoFilter("");
          },
        }))
      );
    } else {
      // Main command palette

      // Layout children commands
      const layoutChildren: Command[] = [
        // Graphviz layouts
        ...Object.entries(GraphvizLayoutType).map(([_key, label]) => ({
          id: `layout-graphviz-${label}`,
          title: `Graphviz: ${label}`,
          description: `Apply Graphviz ${label} layout to the graph`,
          execute: () =>
            computeLayoutAndTriggerUpdateForCurrentSceneGraph(
              label,
              getCurrentSceneGraph().getVisibleNodes()
            ),
        })),
        // Graphology layouts
        ...Object.entries(GraphologyLayoutType).map(([_key, label]) => ({
          id: `layout-graphology-${label}`,
          title: `Graphology: ${label}`,
          description: `Apply Graphology ${label} layout to the graph`,
          execute: () =>
            computeLayoutAndTriggerUpdateForCurrentSceneGraph(
              label,
              getCurrentSceneGraph().getVisibleNodes()
            ),
        })),
        // Custom layouts
        ...Object.entries(CustomLayoutType).map(([_key, label]) => ({
          id: `layout-custom-${label}`,
          title: `Custom: ${label}`,
          description: `Apply custom ${label} layout to the graph`,
          execute: () =>
            computeLayoutAndTriggerUpdateForCurrentSceneGraph(
              label,
              getCurrentSceneGraph().getVisibleNodes()
            ),
        })),
      ];

      const demoChildren = demoGraphKeys.map((key) => ({
        id: `demo-graph-${key}`,
        title: key,
        description: `Load the ${key} demo graph`,
        execute: () => {
          if (handleSetSceneGraph) {
            handleSetSceneGraph(key, true);
          } else {
            // Fallback to URL-based loading
            const url = new URL(window.location.href);
            url.searchParams.set("graph", key);
            window.history.pushState({}, "", url.toString());
            window.location.reload();
          }
        },
      }));

      const defaultCommands: Command[] = [
        {
          id: "new-project",
          title: "Project: New",
          description: "Create a new project",
          execute: () => {
            if (handleSetSceneGraph) {
              handleSetSceneGraph("Empty", true, () => {
                setShowSaveAsNewProjectDialog(true);
              });
            } else {
              // Fallback to URL-based loading
              const url = new URL(window.location.href);
              url.searchParams.set("graph", "Empty");
              window.history.pushState({}, "", url.toString());
              window.location.reload();
            }
          },
        },
        {
          id: "open-project",
          title: "Project: Open",
          description: "Open a saved project",
          execute: () => setShowLoadSceneGraphWindow(true),
        },
        {
          id: "save-as-new-project",
          title: "Project: Save as new",
          description: "Save current project as a new project",
          execute: () => setShowSaveAsNewProjectDialog(true),
        },
        {
          id: "save-project",
          title: "Project: Save",
          description: "Save current project",
          execute: () => {
            throw new Error("Save project command not implemented yet");
            // setShowSaveSceneGraphDialog(true);
          },
        },
        {
          id: "export-project",
          title: "Project: Export",
          description: "Export current project as JSON file",
          execute: () => {
            try {
              const sceneGraph = currentSceneGraph;
              const metadata = sceneGraph.getMetadata();
              const fileName = metadata?.name || "scene-graph";

              // Serialize the scene graph to JSON
              const jsonData = JSON.stringify(sceneGraph, null, 2);
              const blob = new Blob([jsonData], { type: "application/json" });
              const url = URL.createObjectURL(blob);

              // Create download link and trigger download
              const link = document.createElement("a");
              link.href = url;
              link.download = `${fileName}.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              // Clean up the URL object
              URL.revokeObjectURL(url);
            } catch (error) {
              console.error("Error exporting project:", error);
            }
          },
        },
        {
          id: "demos",
          title: "Demos",
          description: "Browse and open demo graphs",
          execute: () => {},
          children: demoChildren,
        },
        {
          id: "layout",
          title: "Layout",
          description: "Choose a layout for the graph",
          execute: () => {},
          children: layoutChildren,
        },
        {
          id: "view-forcegraph3d",
          title: "View: ForceGraph3d",
          description: "Change view to Force Graph 3D",
          execute: () => setActiveView("ForceGraph3d"),
        },
        {
          id: "view-reactflow",
          title: "View: ReactFlow",
          description: "Change view to React Flow",
          execute: () => setActiveView("ReactFlow"),
        },
        {
          id: "view-graphviz",
          title: "View: Graphviz",
          description: "Change view to Graphviz",
          execute: () => setActiveView("Graphviz"),
        },
        {
          id: "view-gallery",
          title: "View: Gallery",
          description: "Change view to Image Gallery",
          execute: () => setActiveView("Gallery"),
        },
        {
          id: "show-node-table",
          title: "Show Node Table",
          description: "Display the table of all nodes",
          execute: () => setShowEntityTables(true),
        },
        {
          id: "show-node-table-v2",
          title: "Show Node Table V2",
          description: "Display the enhanced table of all nodes using AG Grid",
          execute: () => setShowEntityTablesV2(true),
        },
        {
          id: "path-analysis",
          title: "Show Path Analysis",
          description: "Open path analysis tool",
          execute: () => setShowPathAnalysis(true),
        },
        {
          id: "filter-window",
          title: "Show Filter Window",
          description: "Open node filtering window",
          execute: () => setShowFilterWindow(true),
        },
        {
          id: "filter-manager",
          title: "Show Filter Manager",
          description: "Open saved filters manager",
          execute: () => setShowFilterManager("load", true),
        },
        {
          id: "scene-graph-details",
          title: "Scene Graph Details",
          description: "Show details of the current scene graph",
          execute: () =>
            setShowSceneGraphDetailView({ show: true, readOnly: true }),
        },
        {
          id: "workspace-toggle-visibility",
          title: "Workspace: Toggle Visibility",
          description: "Toggle toolbar and sidebar visibility",
          execute: () => {
            const {
              showToolbar,
              leftSidebarConfig,
              rightSidebarConfig,
              setShowToolbar,
              setLeftSidebarConfig,
              setRightSidebarConfig,
            } = useWorkspaceConfigStore.getState();

            // Toggle all workspace elements
            setShowToolbar(!showToolbar);
            setLeftSidebarConfig({
              isVisible: !leftSidebarConfig.isVisible,
            });
            setRightSidebarConfig({
              isVisible: !rightSidebarConfig.isVisible,
            });
          },
        },
      ];
      setCommands(defaultCommands);
    }
  }, [
    setActiveView,
    setShowLoadSceneGraphWindow,
    setShowSaveSceneGraphDialog,
    setShowSaveAsNewProjectDialog,
    setShowEntityTables,
    setShowEntityTablesV2,
    setShowPathAnalysis,
    setShowFilterWindow,
    setShowFilterManager,
    setShowSceneGraphDetailView,
    currentSceneGraph,
    demoStep,
    demoFilter,
    demoGraphKeys,
    handleSetSceneGraph,
  ]);

  // Register keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      if (
        (isMac && e.metaKey && e.shiftKey && e.key.toLowerCase() === "p") ||
        (!isMac && e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p")
      ) {
        e.preventDefault();

        // Check if command palette is disabled via interactivityFlags
        const interactivityFlags = getInteractivityFlags();
        if (interactivityFlags?.commandPalette === false) {
          console.log("Command palette is disabled via interactivityFlags");
          return;
        }

        setCommandPaletteOpen(true); // <-- open the app's command palette
        setIsOpen(true); // keep for legacy, but not used for actual open state
        setDemoStep(false);
        setDemoFilter("");
      }
      // VSCode style: allow typing to filter demo list in demo step
      if (isOpen && demoStep) {
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          setDemoFilter((prev) => prev + e.key);
        } else if (e.key === "Backspace") {
          setDemoFilter((prev) => {
            if (prev.length > 0) return prev.slice(0, -1);
            setDemoStep(false);
            return "";
          });
        } else if (e.key === "Escape") {
          setDemoStep(false);
          setDemoFilter("");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, demoStep, setCommandPaletteOpen]);

  const executeCommand = useCallback((command: Command) => {
    // If the command has children, push them as a new stack (handled by CommandPalette UI)
    if (command.children && command.children.length > 0) {
      // Do not close palette, let UI handle showing children
      return;
    }
    command.execute();
    setIsOpen(false);
    setDemoStep(false);
    setDemoFilter("");
  }, []);

  return {
    isOpen,
    setIsOpen,
    commands,
    executeCommand,
    demoStep,
    demoFilter,
    setDemoFilter,
    setDemoStep,
  };
};
