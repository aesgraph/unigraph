import { ForceGraph3DInstance } from "3d-force-graph";
import {
  attachSimulation,
  updateNodePositions,
} from "../core/force-graph/createForceGraph";
import { songAnnotation247_2_entities } from "../core/force-graph/dynamics/247-2";
import { addCluster } from "../core/force-graph/dynamics/addCluster";
import { addRandomEdges } from "../core/force-graph/dynamics/addRandomEdges";
import { addRandomNodes } from "../core/force-graph/dynamics/addRandomNodes";
import { runManagedAnimation } from "../core/force-graph/dynamics/animationRunner";
import { generateConfigsFromAnnotations } from "../core/force-graph/dynamics/annotationConfigGenerator";
import { createAnnotationNodeSpawner } from "../core/force-graph/dynamics/annotationNodeSpawner";
import { applyRandomEffects } from "../core/force-graph/dynamics/applyRandomEffects";
import { applyStaggeredEffects } from "../core/force-graph/dynamics/applyStaggeredEffects";
import { compactify } from "../core/force-graph/dynamics/compactify";
import {
  demoConfig,
  playConfigSequence,
} from "../core/force-graph/dynamics/configSequencePlayer";
import { focusOnDegrees } from "../core/force-graph/dynamics/focusOnDegrees";
import { focusWithTransparency } from "../core/force-graph/dynamics/focusWithTransparency";
import { pulsateNodes } from "../core/force-graph/dynamics/pulsate";
import {
  randomizeVisible,
  randomizeVisibleAndPhysics,
} from "../core/force-graph/dynamics/randomizeVisible";
import { createSongVisualizationTimeline } from "../core/force-graph/dynamics/songAnnotationTransitions";
import { transitionToConfig } from "../core/force-graph/dynamics/transition";
import { CustomLayoutType } from "../core/layouts/CustomLayoutEngine";
import { GraphologyLayoutType } from "../core/layouts/GraphologyLayoutEngine";
import { GraphvizLayoutType } from "../core/layouts/GraphvizLayoutEngine";
import {
  Compute_Layout,
  LayoutEngineOption,
} from "../core/layouts/LayoutEngine";
import { NodePositionData } from "../core/layouts/layoutHelpers";
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
import { demoSongAnnotations } from "../mp3/data";
import { demoSongAnnotations2 } from "../mp3/demoSongAnnotations247";
import {
  getActiveView,
  getShowEntityDataCard,
  setShowEntityDataCard,
} from "../store/appConfigStore";
import {
  getLeftSidebarConfig,
  getRightSidebarConfig,
  setLeftSidebarConfig,
  setRightSidebarConfig,
} from "../store/workspaceConfigStore";
import { IMenuConfig, IMenuConfig as MenuConfigType } from "./UniAppToolbar";

// const handleExportConfig = (sceneGraph: SceneGraph) => {
//   saveRenderingConfigToFile(sceneGraph.getDisplayConfig(), "renderConfig.json");
// };

const graphVizMenuActions = (
  applyNewLayout: (
    layoutTyp: LayoutEngineOption,
    sceneGraph: SceneGraph
  ) => void,
  sceneGraph: SceneGraph
): IMenuConfig => {
  return Object.entries(GraphvizLayoutType).reduce((acc, [_key, label]) => {
    acc[label] = {
      action: () => applyNewLayout(label as GraphvizLayoutType, sceneGraph),
    };
    return acc;
  }, {} as IMenuConfig);
};

const graphologyMenuActions = (
  applyNewLayout: (
    layoutTyp: LayoutEngineOption,
    sceneGraph: SceneGraph
  ) => void,
  sceneGraph: SceneGraph
): IMenuConfig => {
  return Object.entries(GraphologyLayoutType).reduce((acc, [_key, label]) => {
    acc[label] = {
      action: () => applyNewLayout(label as GraphologyLayoutType, sceneGraph),
    };
    return acc;
  }, {} as IMenuConfig);
};

const customLayoutMenuActions = (
  applyNewLayout: (
    layoutTyp: LayoutEngineOption,
    sceneGraph: SceneGraph
  ) => void,
  sceneGraph: SceneGraph
): IMenuConfig => {
  return Object.entries(CustomLayoutType).reduce((acc, [_key, label]) => {
    acc[label] = {
      action: () => applyNewLayout(label as CustomLayoutType, sceneGraph),
    };
    return acc;
  }, {} as IMenuConfig);
};

export interface IMenuConfigCallbacks {
  handleImportConfig: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFitToView: (activeView: string) => void;
  GraphMenuActions: () => { [key: string]: { action: () => void } };
  SimulationMenuActions: () => { [key: string]: { action: () => void } };
  applyNewLayout: (
    layoutType: LayoutEngineOption,
    sceneGraph: SceneGraph
  ) => void;
  setShowNodeTable: (show: boolean) => void;
  setShowEdgeTable: (show: boolean) => void;
  showLayoutManager: (mode: "save" | "load") => void;
  showFilterWindow: () => void;
  handleLoadLayout: (positions: NodePositionData) => void;
  showSceneGraphDetailView: (readOnly: boolean) => void;
}

export class MenuConfig {
  private callbacks: IMenuConfigCallbacks;
  private sceneGraph: SceneGraph;
  private forceGraphInstance: React.RefObject<ForceGraph3DInstance | null>;

  constructor(
    callbacks: IMenuConfigCallbacks,
    sceneGraph: SceneGraph,
    forceGraphInstance: React.RefObject<ForceGraph3DInstance | null>
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
              updateNodePositions(this.forceGraphInstance.current!, positions);
            },
          },
          reloadNodePositions: {
            action: () => {
              const positions = extractPositionsFromNodes(this.sceneGraph);
              this.sceneGraph.setNodePositions(positions);
              this.callbacks.handleLoadLayout(positions);
            },
          },
          Graphviz: {
            submenu: graphVizMenuActions(
              this.callbacks.applyNewLayout,
              this.sceneGraph
            ),
          },
          Graphology: {
            submenu: graphologyMenuActions(
              this.callbacks.applyNewLayout,
              this.sceneGraph
            ),
          },
          Custom: {
            submenu: customLayoutMenuActions(
              this.callbacks.applyNewLayout,
              this.sceneGraph
            ),
          },
        },
      },
      Graphs: { submenu: this.buildGraphMenu() },
      Simulations: { submenu: this.callbacks.SimulationMenuActions() },
      Dev: {
        submenu: {
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
                minimal: true,
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
              if (this.forceGraphInstance.current) {
                Compute_Layout(
                  this.sceneGraph,
                  GraphvizLayoutType.Graphviz_dot
                ).then((result) => {
                  if (!result) {
                    return;
                  }
                  attachSimulation(this.forceGraphInstance.current!, result);
                });
                this.forceGraphInstance.current.resumeAnimation();
              }
            },
          },
          "Add cluster": {
            action: () => {
              if (this.forceGraphInstance.current) {
                addCluster(
                  10,
                  [getRandomNode(this.sceneGraph.getGraph()).getId()],
                  this.forceGraphInstance.current,
                  this.sceneGraph
                );
              }
            },
          },
          "Randomize visible": {
            action: () => {
              if (this.forceGraphInstance.current) {
                randomizeVisible(this.forceGraphInstance.current, 0.2);
              }
            },
          },
          "Randomize visible and physics": {
            action: () => {
              if (this.forceGraphInstance.current) {
                randomizeVisibleAndPhysics(
                  this.forceGraphInstance.current,
                  this.sceneGraph,
                  0.8
                );
              }
            },
          },
          Compactify: {
            action: () => {
              if (this.forceGraphInstance.current) {
                compactify(this.forceGraphInstance.current);
              }
            },
          },
          "Focus with transparency": {
            action: () => {
              if (this.forceGraphInstance.current) {
                focusWithTransparency(
                  GetRandomNodeFromSceneGraph(this.sceneGraph).getId(),
                  this.sceneGraph,
                  this.forceGraphInstance.current
                );
              }
            },
          },
          "Focus on degrees": {
            action: () => {
              if (this.forceGraphInstance.current) {
                focusOnDegrees(
                  GetRandomNodeFromSceneGraph(this.sceneGraph).getId(),
                  this.sceneGraph,
                  this.forceGraphInstance.current,
                  5
                );
              }
            },
          },
          Pulsate: {
            action: () => {
              if (this.forceGraphInstance.current) {
                pulsateNodes(this.forceGraphInstance.current, this.sceneGraph);
              }
            },
          },
          Transition: {
            action: () => {
              if (this.forceGraphInstance.current) {
                // eslint-disable-next-line unused-imports/no-unused-vars
                const cleanup = transitionToConfig(
                  this.forceGraphInstance.current,
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
              if (this.forceGraphInstance.current) {
                const timeline = createSongVisualizationTimeline(
                  this.forceGraphInstance.current,
                  demoSongAnnotations.toArray()
                );
                timeline.start();
              }
            },
          },
          "Random effects": {
            action: () => {
              if (this.forceGraphInstance.current) {
                applyRandomEffects(
                  this.forceGraphInstance.current,
                  demoSongAnnotations.toArray()
                );
              }
            },
          },
          "Staggered effects": {
            action: () => {
              if (this.forceGraphInstance.current) {
                applyStaggeredEffects(
                  this.forceGraphInstance.current,
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
              if (this.forceGraphInstance.current) {
                applyStaggeredEffects(
                  this.forceGraphInstance.current,
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
              if (this.forceGraphInstance.current) {
                const spawner = createAnnotationNodeSpawner(
                  this.forceGraphInstance.current,
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
              if (!this.forceGraphInstance.current) return;

              // eslint-disable-next-line unused-imports/no-unused-vars
              const cleanup = runManagedAnimation(
                this.forceGraphInstance.current,
                () => {
                  addRandomEdges(
                    this.sceneGraph,
                    this.forceGraphInstance.current!
                  );
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
              if (!this.forceGraphInstance.current) return;

              // eslint-disable-next-line unused-imports/no-unused-vars
              const cleanup = runManagedAnimation(
                this.forceGraphInstance.current,
                () => {
                  addRandomEdges(
                    this.sceneGraph,
                    this.forceGraphInstance.current!
                  );
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
              if (!this.forceGraphInstance.current) return;

              // eslint-disable-next-line unused-imports/no-unused-vars
              const cleanup = runManagedAnimation(
                this.forceGraphInstance.current,
                () => {
                  addRandomNodes(
                    this.sceneGraph,
                    this.forceGraphInstance.current!
                  );
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
                  if (!this.forceGraphInstance.current) {
                    return;
                  }
                  // eslint-disable-next-line unused-imports/no-unused-vars
                  const cleanup = runManagedAnimation(
                    this.forceGraphInstance.current,
                    (elapsedTime, frame) => {
                      // Do something with the graph
                      this.forceGraphInstance.current?.nodeOpacity(
                        Math.random() * 2
                      );
                      this.forceGraphInstance.current
                        ?.d3Force("charge")
                        ?.strength(Math.random() * 200 - 100);
                      this.forceGraphInstance.current?.d3ReheatSimulation();
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
                  if (!this.forceGraphInstance.current) {
                    return;
                  }
                  playConfigSequence(
                    this.forceGraphInstance.current,
                    demoConfig
                  );
                },
              },
              FromAnnotations: {
                action: () => {
                  if (!this.forceGraphInstance.current) {
                    return;
                  }
                  const configs = generateConfigsFromAnnotations(
                    songAnnotation247_2_entities.getDatas()
                  );
                  playConfigSequence(this.forceGraphInstance.current, configs);
                },
              },
            },
          },
        },
      },
      Funcs: {
        submenu: {
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
    };
  }
}
