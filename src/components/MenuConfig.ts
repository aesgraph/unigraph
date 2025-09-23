import { ForceGraph3DInstance } from "3d-force-graph";
import { songAnnotation247_2_entities } from "../_experimental/force-graph-dynamics/247-2";
import { addCluster } from "../_experimental/force-graph-dynamics/addCluster";
import { addRandomEdges } from "../_experimental/force-graph-dynamics/addRandomEdges";
import { addRandomNodes } from "../_experimental/force-graph-dynamics/addRandomNodes";
import { runManagedAnimation } from "../_experimental/force-graph-dynamics/animationRunner";
import { generateConfigsFromAnnotations } from "../_experimental/force-graph-dynamics/annotationConfigGenerator";
import { createAnnotationNodeSpawner } from "../_experimental/force-graph-dynamics/annotationNodeSpawner";
import { applyRandomEffects } from "../_experimental/force-graph-dynamics/applyRandomEffects";
import { applyStaggeredEffects } from "../_experimental/force-graph-dynamics/applyStaggeredEffects";
import { compactify } from "../_experimental/force-graph-dynamics/compactify";
import {
  demoConfig,
  playConfigSequence,
} from "../_experimental/force-graph-dynamics/configSequencePlayer";
import { focusOnDegrees } from "../_experimental/force-graph-dynamics/focusOnDegrees";
import { focusWithTransparency } from "../_experimental/force-graph-dynamics/focusWithTransparency";
import { pulsateNodes } from "../_experimental/force-graph-dynamics/pulsate";
import {
  randomizeVisible,
  randomizeVisibleAndPhysics,
} from "../_experimental/force-graph-dynamics/randomizeVisible";
import { createSongVisualizationTimeline } from "../_experimental/force-graph-dynamics/songAnnotationTransitions";
import { transitionToConfig } from "../_experimental/force-graph-dynamics/transition";
import { loadAnnotationsToSceneGraph } from "../api/annotationsApi";
import {
  attachSimulation,
  updateNodePositions,
} from "../core/force-graph/createForceGraph";
import { CustomLayoutType } from "../core/layouts/CustomLayoutEngine";
import { GraphologyLayoutType } from "../core/layouts/GraphologyLayoutEngine";
import { GraphvizLayoutType } from "../core/layouts/GraphvizLayoutType";
import { Compute_Layout } from "../core/layouts/LayoutEngine";
import { DisplayManager } from "../core/model/DisplayManager";
import { SceneGraph } from "../core/model/SceneGraph";
import {
  getRandomNode,
  GetRandomNodeFromSceneGraph,
} from "../core/model/utils";
import { processImageNodesInSceneGraph } from "../core/processors/imageBoxProcessor";
import { DEMO_SCENE_GRAPHS, SceneGraphCategory } from "../data/DemoSceneGraphs";
import {
  extractPositionsFromNodes,
  extractPositionsFromUserData,
} from "../data/graphs/blobMesh";
import {
  getActiveView,
  getCurrentSceneGraph,
  getForceGraph3dInstance,
  getInteractivityFlags,
  getShowEntityDataCard,
  setShowEntityDataCard,
} from "../store/appConfigStore";

import {
  setShowCommandPalette,
  setShowLoadSceneGraphWindow,
  setShowSaveAsNewProjectDialog,
  setShowWorkspaceManager,
} from "../store/dialogStore";
import { clearDocuments, getAllDocuments } from "../store/documentStore";

import { demoSongAnnotations } from "../_experimental/mp3/data";
import { demoSongAnnotations2 } from "../_experimental/mp3/demoSongAnnotations247";
import { compressSceneGraphJsonForUrl } from "../core/serializers/toFromJson";
import {
  applyLayoutAndTriggerAppUpdate,
  computeLayoutAndTriggerUpdateForCurrentSceneGraph,
} from "../store/sceneGraphHooks";
import {
  getLeftSidebarConfig,
  getRightSidebarConfig,
  setLeftActiveSection,
  setLeftSidebarConfig,
  setRightSidebarConfig,
} from "../store/workspaceConfigStore";
import { debugForceGraph3DCamera } from "../utils/forceGraphDebugUtils";
import { supabase } from "../utils/supabaseClient";
import { runConversationsAnalysis } from "./applets/ChatGptImporter/services/runConversationsAnalysis";
import {
  IMenuConfig,
  IMenuConfig as MenuConfigType,
} from "./appWorkspace/UniAppToolbar";

// const handleExportConfig = (sceneGraph: SceneGraph) => {
//   saveRenderingConfigToFile(sceneGraph.getDisplayConfig(), "renderConfig.json");
// };

const graphVizMenuActions = (): IMenuConfig => {
  return Object.entries(GraphvizLayoutType).reduce((acc, [_key, label]) => {
    acc[label] = {
      action: () =>
        computeLayoutAndTriggerUpdateForCurrentSceneGraph(
          label,
          getCurrentSceneGraph().getVisibleNodes()
        ),
    };
    return acc;
  }, {} as IMenuConfig);
};

const graphologyMenuActions = (): IMenuConfig => {
  return Object.entries(GraphologyLayoutType).reduce((acc, [_key, label]) => {
    acc[label] = {
      action: () =>
        computeLayoutAndTriggerUpdateForCurrentSceneGraph(
          label,
          getCurrentSceneGraph().getVisibleNodes()
        ),
    };
    return acc;
  }, {} as IMenuConfig);
};

const customLayoutMenuActions = (): IMenuConfig => {
  return Object.entries(CustomLayoutType).reduce((acc, [_key, label]) => {
    acc[label] = {
      action: () =>
        computeLayoutAndTriggerUpdateForCurrentSceneGraph(
          label,
          getCurrentSceneGraph().getVisibleNodes()
        ),
    };
    return acc;
  }, {} as IMenuConfig);
};

export interface IMenuConfigCallbacks {
  handleSetSceneGraph: (
    key: string,
    clearQueryParams?: boolean,
    onLoaded?: (sceneGraph?: SceneGraph) => void
  ) => void;
  handleImportConfig: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFitToView: (activeView: string) => void;
  GraphMenuActions: () => { [key: string]: { action: () => void } };
  SimulationMenuActions: () => { [key: string]: { action: () => void } };
  setShowNodeTable: (show: boolean) => void;
  setShowEdgeTable: (show: boolean) => void;
  showLayoutManager: (mode: "save" | "load") => void;
  showFilterWindow: () => void;
  showSceneGraphDetailView: (readOnly: boolean) => void;
  showChatGptImporter: () => void;
  // Workspace management callbacks
  showWorkspaceManager?: () => void;
  loadWorkspaceConfig?: () => void;
  saveWorkspaceConfig?: () => void;
  // AppShell workspace functions
  appShellWorkspaceFunctions?: {
    saveCurrentLayout: (name: string) => Promise<any>;
    applyWorkspaceLayout: (id: string) => Promise<boolean>;
    getAllWorkspaces: () => any[];
    getCurrentWorkspace: () => any;
  };
}

export class MenuConfig {
  private callbacks: IMenuConfigCallbacks;
  private sceneGraph: SceneGraph;
  private forceGraphInstance: ForceGraph3DInstance | null;

  constructor(
    callbacks: IMenuConfigCallbacks,
    sceneGraph: SceneGraph,
    forceGraphInstance: ForceGraph3DInstance | null
  ) {
    this.callbacks = callbacks;
    this.sceneGraph = sceneGraph;
    this.forceGraphInstance = forceGraphInstance;
  }

  private createGraphSubmenu(category: SceneGraphCategory): IMenuConfig {
    const submenu: IMenuConfig = {};
    Object.keys(category.graphs).forEach((key) => {
      submenu[key] = {
        action: () => this.callbacks.GraphMenuActions()[key].action(),
      };
    });
    return submenu;
  }

  private buildGraphMenu(): IMenuConfig {
    const graphMenu: IMenuConfig = {};
    Object.entries(DEMO_SCENE_GRAPHS).forEach(([_categoryKey, category]) => {
      graphMenu[category.label] = {
        submenu: this.createGraphSubmenu(category),
      };
    });
    return graphMenu;
  }

  getConfig(): MenuConfigType {
    return {
      Project: {
        submenu: {
          New: {
            action: () => {
              this.callbacks.handleSetSceneGraph("Empty", true, () => {
                setShowSaveAsNewProjectDialog(true);
              });
            },
            tooltip: "cmd+shift+n",
          },
          Save: {
            action: () => {
              // TODO: Implement Save project
              console.log("Save project");
            },
            tooltip: "cmd+s",
          },
          "Save as new": {
            action: () => {
              setShowSaveAsNewProjectDialog(true);
            },
            tooltip: "cmd+shift+s",
          },
          Load: {
            action: () => {
              setShowLoadSceneGraphWindow(true);
            },
            tooltip: "cmd+o",
          },
          "Open manager": {
            action: () => {
              // TODO: Implement Open project manager
              console.log("Open project manager");
            },
          },
        },
      },
      Workspace: {
        submenu: {
          Load: {
            submenu: (() => {
              // Use AppShell workspace state actions to get available workspaces
              const { applyWorkspaceLayout, getAllWorkspaces } =
                this.callbacks.appShellWorkspaceFunctions || {};

              if (!applyWorkspaceLayout || !getAllWorkspaces) {
                return {
                  "No workspaces available": {
                    action: () => {
                      console.log("Workspace state functions not available");
                    },
                  },
                };
              }

              const workspaces = getAllWorkspaces();
              if (workspaces.length === 0) {
                return {
                  "No saved workspaces": {
                    action: () => {
                      console.log("No saved workspaces available");
                    },
                  },
                };
              }

              // Create a menu item for each available workspace
              const workspaceMenuItems: {
                [key: string]: { action: () => void };
              } = {};

              workspaces.forEach((workspace) => {
                workspaceMenuItems[workspace.name] = {
                  action: () => {
                    applyWorkspaceLayout(workspace.id);
                  },
                };
              });

              return workspaceMenuItems;
            })(),
          },
          "Save as": {
            action: () => {
              // Use AppShell workspace state actions
              const { saveCurrentLayout } =
                this.callbacks.appShellWorkspaceFunctions || {};
              if (saveCurrentLayout) {
                const workspaceName = prompt("Enter workspace name:");
                if (workspaceName) {
                  saveCurrentLayout(workspaceName);
                }
              } else {
                console.log("Workspace state functions not available");
              }
            },
          },
          "Open Manager": {
            action: () => {
              setShowWorkspaceManager(true);
            },
          },
          "Reset to Empty": {
            action: () => {
              // Use AppShell workspace state actions to load the clean workspace
              const { applyWorkspaceLayout } =
                this.callbacks.appShellWorkspaceFunctions || {};
              if (applyWorkspaceLayout) {
                // Load the clean workspace by its ID
                applyWorkspaceLayout("clean-workspace");
              } else {
                console.log("Workspace state functions not available");
              }
            },
          },
        },
      },
      Window: {
        submenu: {
          "Project Detail View": {
            action: () => {
              // TODO: Implement Project Detail View window
              console.log("Open Project Detail View");
            },
          },
          "Entity Manager": {
            action: () => {
              // TODO: Implement Entity Manager window
              console.log("Open Entity Manager");
            },
          },
          "Display Manager": {
            action: () => {
              // TODO: Implement Display Manager window
              console.log("Open Display Manager");
            },
          },
          "Command Palette": {
            action: () => {
              // Check if command palette is disabled via interactivityFlags
              const interactivityFlags = getInteractivityFlags();
              if (interactivityFlags?.commandPalette === false) {
                console.log(
                  "Command palette is disabled via interactivityFlags"
                );
                return;
              }
              setShowCommandPalette(true);
            },
            tooltip: "cmd+shift+p",
          },
        },
      },
      View: {
        submenu: {
          "Fit to View": {
            action: () => this.callbacks.handleFitToView(getActiveView()),
          },
          Entities: {
            action: () => this.callbacks.setShowNodeTable(true),
          },
          "SceneGraph Details": {
            action: () => this.callbacks.showSceneGraphDetailView(false),
          },
        },
      },
      Layout: {
        submenu: {
          "Save Current Layout": {
            action: () => {
              this.callbacks.showLayoutManager("save");
            },
          },
          "Load Layout": {
            action: () => {
              this.callbacks.showLayoutManager("load");
              // Finish Implementation
            },
          },
          applyLayoutFromSave: {
            action: () => {
              const positions = extractPositionsFromUserData(this.sceneGraph);
              this.sceneGraph.setNodePositions(positions);
              console.log(positions);
              updateNodePositions(this.forceGraphInstance!, positions);
            },
          },
          reloadNodePositions: {
            action: () => {
              const positions = extractPositionsFromNodes(this.sceneGraph);
              this.sceneGraph.setNodePositions(positions);
              applyLayoutAndTriggerAppUpdate({
                name: "reloadedPositions",
                positions,
              });
            },
          },
          Graphviz: {
            submenu: graphVizMenuActions(),
          },
          Graphology: {
            submenu: graphologyMenuActions(),
          },
          Custom: {
            submenu: customLayoutMenuActions(),
          },
        },
      },
      Graphs: { submenu: this.buildGraphMenu() },
      Simulations: { submenu: this.callbacks.SimulationMenuActions() },
      Dev: {
        submenu: {
          "Debug ForceGraph3D Camera": {
            action: () => {
              debugForceGraph3DCamera(getForceGraph3dInstance());
            },
          },
          "Print AppShell Workspace Layout": {
            action: async () => {
              const { getAllWorkspaces } =
                this.callbacks.appShellWorkspaceFunctions || {};
              if (getAllWorkspaces) {
                const workspaces = getAllWorkspaces();
                console.log("=== AppShell Workspace Layout Configuration ===");
                console.log("Available workspaces:", workspaces);
                console.log("Current workspace config:", {
                  leftSidebar: getLeftSidebarConfig(),
                  rightSidebar: getRightSidebarConfig(),
                });

                // Get the current workspace layout configuration
                try {
                  // Try to get the current workspace data from the app shell
                  const { getAllWorkspaces, getCurrentWorkspace } =
                    this.callbacks.appShellWorkspaceFunctions || {};
                  if (getAllWorkspaces) {
                    const workspaces = getAllWorkspaces();
                    console.log("=== Available Workspaces ===");
                    console.log("Workspaces:", workspaces);
                    console.log("=== End Available Workspaces ===");

                    // Save current workspace layout to a temporary workspace and print it
                    console.log("=== Saving Current Workspace Layout ===");
                    const tempWorkspaceName = `temp-workspace-${Date.now()}`;
                    console.log("Saving current layout as:", tempWorkspaceName);

                    try {
                      const savedWorkspace = getCurrentWorkspace?.();
                      console.log(
                        "=== Current Workspace Layout Data Structure ==="
                      );
                      console.log("Current workspace:", savedWorkspace);
                      console.log(
                        "=== End Current Workspace Layout Data Structure ==="
                      );

                      // Clean up the temporary workspace
                      console.log("Cleaning up temporary workspace...");
                      // Note: We could add a deleteWorkspace function if needed
                    } catch (saveError) {
                      console.log(
                        "Error saving current workspace layout:",
                        saveError
                      );
                    }
                  } else {
                    console.log("Workspace functions not available");
                  }
                } catch (error) {
                  console.log("Error accessing workspace layout data:", error);
                }

                console.log(
                  "=== End AppShell Workspace Layout Configuration ==="
                );
              } else {
                console.log("AppShell workspace functions not available");
              }
            },
          },
          "Copy SceneGraph as URL": {
            action: () => {
              const sceneGraph = getCurrentSceneGraph();
              const compressed = compressSceneGraphJsonForUrl(sceneGraph);
              const url = `${window.location.origin}${window.location.pathname}#scenegraph=${compressed}`;
              navigator.clipboard.writeText(url);
              console.log(
                "Compressed SceneGraph URL copied to clipboard:",
                url
              );
            },
          },
          "Load annotations": {
            action: () => {
              supabase.auth
                .getUser()
                .then(
                  ({
                    data,
                    error,
                  }: {
                    data: { user?: { id: string } } | null;
                    error: any;
                  }) => {
                    if (error || !data?.user) {
                      // Handle error or not signed in
                      return;
                    }
                    console.log("Loading annotations for user:", data.user.id);
                    loadAnnotationsToSceneGraph(data.user.id, this.sceneGraph);
                    console.log("Annotations loaded", this.sceneGraph);
                  }
                );
            },
          },
          "TEST: Conversation Analysis": {
            action: () => {
              // Get the current SceneGraph
              const sceneGraph = getCurrentSceneGraph();

              // Run analysis
              runConversationsAnalysis(sceneGraph, true, true, (progress) => {
                console.log(
                  `Processed ${progress.processed} of ${progress.total} documents`
                );
              });
            },
          },
          "TEST: Save documents to scenegraph": {
            action: () => {
              const documents = getAllDocuments();
              for (const [key, doc] of Object.entries(documents)) {
                this.sceneGraph.setDocument(key, doc);
              }
            },
          },
          "TEXT: Print documentStore": {
            action: () => {
              console.log(getAllDocuments());
            },
          },
          "TEST: Clear documentStore": {
            action: () => {
              clearDocuments();
            },
          },
          "TEST: Set Left Sidebar to Layouts": {
            action: () => {
              setLeftActiveSection("layouts");
              console.log("Left sidebar section set to 'layouts'");
            },
          },
          "Print SceneGraph": {
            action: () => {
              console.log(this.sceneGraph);
            },
          },
          "Toggle sidebar expansion": {
            action: () => {
              const leftConfig = getLeftSidebarConfig();
              setLeftSidebarConfig({
                mode: leftConfig.mode === "collapsed" ? "full" : "collapsed",
                isVisible: true,
                minimal: false,
              });
              const rightConfig = getRightSidebarConfig();
              setRightSidebarConfig({
                mode: rightConfig.mode === "collapsed" ? "full" : "collapsed",
                isVisible: true,
                minimal: false,
              });
            },
          },
          "Show Entity Data Card": {
            checked: getShowEntityDataCard(),
            onChange: () => {
              setShowEntityDataCard(!getShowEntityDataCard());
            },
          },
          "Run animation": {
            action: () => {
              if (this.forceGraphInstance) {
                Compute_Layout(
                  this.sceneGraph,
                  GraphvizLayoutType.Graphviz_dot
                ).then((result) => {
                  if (!result) {
                    return;
                  }
                  attachSimulation(this.forceGraphInstance!, result);
                });
                this.forceGraphInstance.resumeAnimation();
              }
            },
          },
          "Add cluster": {
            action: () => {
              if (this.forceGraphInstance) {
                addCluster(
                  10,
                  [getRandomNode(this.sceneGraph.getGraph()).getId()],
                  this.forceGraphInstance,
                  this.sceneGraph
                );
              }
            },
          },
          "Randomize visible": {
            action: () => {
              if (this.forceGraphInstance) {
                randomizeVisible(this.forceGraphInstance, 0.2);
              }
            },
          },
          "Randomize visible and physics": {
            action: () => {
              if (this.forceGraphInstance) {
                randomizeVisibleAndPhysics(
                  this.forceGraphInstance,
                  this.sceneGraph,
                  0.8
                );
              }
            },
          },
          Compactify: {
            action: () => {
              if (this.forceGraphInstance) {
                compactify(this.forceGraphInstance);
              }
            },
          },
          "Focus with transparency": {
            action: () => {
              if (this.forceGraphInstance) {
                focusWithTransparency(
                  GetRandomNodeFromSceneGraph(this.sceneGraph).getId(),
                  this.sceneGraph,
                  this.forceGraphInstance
                );
              }
            },
          },
          "Focus on degrees": {
            action: () => {
              if (this.forceGraphInstance) {
                focusOnDegrees(
                  GetRandomNodeFromSceneGraph(this.sceneGraph).getId(),
                  this.sceneGraph,
                  this.forceGraphInstance,
                  5
                );
              }
            },
          },
          Pulsate: {
            action: () => {
              if (this.forceGraphInstance) {
                pulsateNodes(this.forceGraphInstance, this.sceneGraph);
              }
            },
          },
          Transition: {
            action: () => {
              if (this.forceGraphInstance) {
                // eslint-disable-next-line unused-imports/no-unused-vars
                const cleanup = transitionToConfig(
                  this.forceGraphInstance,
                  {
                    nodeOpacity: 0.1,
                    linkOpacity: 0.2,
                    nodeSize: 1,
                    linkWidth: 4,
                    nodeTextLabels: false,
                    linkTextLabels: false,
                    chargeStrength: -30,
                  },
                  {
                    duration: 1000,
                    onComplete: () => console.log("Transition complete"),
                  }
                );
              }
            },
          },
          "Song Timeline": {
            action: () => {
              if (this.forceGraphInstance) {
                const timeline = createSongVisualizationTimeline(
                  this.forceGraphInstance,
                  demoSongAnnotations.toArray()
                );
                timeline.start();
              }
            },
          },
          "Random effects": {
            action: () => {
              if (this.forceGraphInstance) {
                applyRandomEffects(
                  this.forceGraphInstance,
                  demoSongAnnotations.toArray()
                );
              }
            },
          },
          "Staggered effects": {
            action: () => {
              if (this.forceGraphInstance) {
                applyStaggeredEffects(
                  this.forceGraphInstance,
                  demoSongAnnotations.toArray(),
                  {
                    minNodeSize: 2,
                    maxNodeSize: 15,
                    minLinkWidth: 1,
                    maxLinkWidth: 10,
                    minOpacity: 0.2,
                    maxOpacity: 1,
                    nodeSizeTransitionDuration: 10,
                    linkWidthTransitionDuration: 20,
                    nodeOpacityTransitionDuration: 24,
                    linkOpacityTransitionDuration: 36,
                  }
                );
              }
            },
          },
          "Demo 2": {
            action: () => {
              if (this.forceGraphInstance) {
                applyStaggeredEffects(
                  this.forceGraphInstance,
                  demoSongAnnotations2.toArray(),
                  {
                    minNodeSize: 2,
                    maxNodeSize: 15,
                    minLinkWidth: 1,
                    maxLinkWidth: 10,
                    minOpacity: 0.2,
                    maxOpacity: 1,
                    nodeSizeTransitionDuration: 10,
                    linkWidthTransitionDuration: 20,
                    nodeOpacityTransitionDuration: 24,
                    linkOpacityTransitionDuration: 36,
                  }
                );
              }
            },
          },
          Spawner: {
            action: () => {
              if (this.forceGraphInstance) {
                const spawner = createAnnotationNodeSpawner(
                  this.forceGraphInstance,
                  demoSongAnnotations2.getDatas(),
                  {
                    maxNodes: 5,
                    spawnRadius: 50,
                    nodeColor: "#ff88cc",
                    nodeSize: 8,
                    fadeOutDuration: 3000,
                    linkColor: "#ff88cc44",
                  },
                  this.sceneGraph
                );

                // Start spawning
                console.log("starting spawner");
                spawner.start();
              }
            },
          },
          "Random Edge Spawner": {
            action: () => {
              if (!this.forceGraphInstance) return;

              // eslint-disable-next-line unused-imports/no-unused-vars
              const cleanup = runManagedAnimation(
                this.forceGraphInstance,
                () => {
                  addRandomEdges(this.sceneGraph, this.forceGraphInstance!);
                },
                {
                  duration: 30000, // 30 seconds
                  interval: 1000, // Add edge every second
                  onComplete: () => console.log("Finished adding random edges"),
                  onError: (error) => console.error("Animation failed:", error),
                }
              );
            },
          },
          "Random Edge Spawner Burst": {
            action: () => {
              if (!this.forceGraphInstance) return;

              // eslint-disable-next-line unused-imports/no-unused-vars
              const cleanup = runManagedAnimation(
                this.forceGraphInstance,
                () => {
                  addRandomEdges(this.sceneGraph, this.forceGraphInstance!);
                },
                {
                  duration: 30000, // 30 seconds
                  interval: 100, // Add edge every 100 milliseconds
                  onComplete: () => console.log("Finished adding random edges"),
                  onError: (error) => console.error("Animation failed:", error),
                }
              );
            },
          },
          "Random Node Spawner Burst": {
            action: () => {
              if (!this.forceGraphInstance) return;

              // eslint-disable-next-line unused-imports/no-unused-vars
              const cleanup = runManagedAnimation(
                this.forceGraphInstance,
                () => {
                  addRandomNodes(this.sceneGraph, this.forceGraphInstance!);
                },
                {
                  duration: 10000, // 30 seconds
                  interval: 100, // Add node every 100 milliseconds
                  onComplete: () => {
                    this.sceneGraph.notifyGraphChanged();
                    console.log("Finished adding random nodes");
                  },
                  onError: (error) => console.error("Animation failed:", error),
                }
              );
            },
          },
          Animations: {
            submenu: {
              Basic: {
                action: () => {
                  if (!this.forceGraphInstance) {
                    return;
                  }
                  // eslint-disable-next-line unused-imports/no-unused-vars
                  const cleanup = runManagedAnimation(
                    this.forceGraphInstance,
                    (elapsedTime, frame) => {
                      // Do something with the graph
                      this.forceGraphInstance?.nodeOpacity(Math.random() * 2);
                      this.forceGraphInstance
                        ?.d3Force("charge")
                        ?.strength(Math.random() * 200 - 100);
                      this.forceGraphInstance?.d3ReheatSimulation();
                      console.log(`Frame ${frame}: ${elapsedTime}ms elapsed`);
                    },
                    {
                      duration: 5000,
                      interval: 50,
                      onComplete: () => console.log("Animation complete"),
                      onError: (error) =>
                        console.error("Animation failed:", error),
                    }
                  );
                },
              },
              ConfigTransition: {
                action: () => {
                  if (!this.forceGraphInstance) {
                    return;
                  }
                  playConfigSequence(this.forceGraphInstance, demoConfig);
                },
              },
              FromAnnotations: {
                action: () => {
                  if (!this.forceGraphInstance) {
                    return;
                  }
                  const configs = generateConfigsFromAnnotations(
                    songAnnotation247_2_entities.getDatas()
                  );
                  playConfigSequence(this.forceGraphInstance, configs);
                },
              },
              "Update scenegraph entities display": {
                action: () => {
                  DisplayManager.applyRenderingConfigToGraph(
                    this.sceneGraph.getGraph(),
                    this.sceneGraph.getDisplayConfig()
                  );
                },
              },
              "Load image annotations": {
                action: () => {
                  processImageNodesInSceneGraph(this.sceneGraph);
                },
              },
            },
          },
        },
      },
    };
  }
}
