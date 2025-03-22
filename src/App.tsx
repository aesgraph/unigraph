import { ForceGraph3DInstance } from "3d-force-graph";
import { Graphviz } from "@hpcc-js/wasm";
import { Position, ReactFlowInstance } from "@xyflow/react";
import React, {
  JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toDot } from "ts-graphviz";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import { AppConfig } from "./AppConfig";
import PathAnalysisWizard, {
  IPathArgs,
} from "./components/analysis/PathAnalysisWizard";
import ContextMenu, { ContextMenuItem } from "./components/common/ContextMenu";
import EntityDataDisplayCard from "./components/common/EntityDataDisplayCard";
import EntityJsonEditorDialog from "./components/common/EntityJsonEditorDialog";
import EntityTabDialog from "./components/common/EntityTabDialog";
import { GraphEntityType } from "./components/common/GraphSearch";
import LayoutManager from "./components/common/LayoutManager";
import Legend from "./components/common/Legend";
import LegendModeRadio from "./components/common/LegendModeRadio";
import FilterManager from "./components/filters/FilterManager";
import {
  FilterPreset,
  FilterRuleDefinition,
} from "./components/filters/FilterRuleDefinition";
import FilterWindow from "./components/filters/FilterWindow";
import ImageGalleryV2 from "./components/imageView/ImageGalleryV2";
import ImageGalleryV3 from "./components/imageView/ImageGalleryV3";
import Workspace from "./components/layout/Workspace";
import ImageGallery from "./components/lumina/galleryTestbed/ImageGallery";
import ImageBoxCreator from "./components/lumina/ImageBoxCreator";
import Lumina from "./components/lumina/Lumina";
import { IMenuConfigCallbacks, MenuConfig } from "./components/MenuConfig";
import NodeEditorWizard from "./components/NodeEditorWizard";
import SceneGraphDetailView from "./components/SceneGraphDetailView";
import SceneGraphTitle from "./components/SceneGraphTitle";
import GravitySimulation3 from "./components/simulations/GravitySimulation3";
import ReactFlowPanel from "./components/simulations/ReactFlowPanel";
import SolarSystem from "./components/simulations/solarSystemSimulation";
import YasguiPanel from "./components/YasguiPanel";

import LoadSceneGraphDialog from "./components/common/LoadSceneGraphDialog";
import NodeDisplayCard from "./components/common/NodeDisplayCard";
import SaveSceneGraphDialog from "./components/common/SaveSceneGraphDialog";
import { AppContextProvider } from "./context/AppContext";
import {
  MousePositionProvider,
  useMousePosition,
} from "./context/MousePositionContext";
import {
  RenderingConfig,
  RenderingManager,
  RenderingManager__DisplayMode,
} from "./controllers/RenderingManager";
import {
  attachRepulsiveForce,
  bindEventsToGraphInstance,
  createForceGraph,
  getNodeMousePosition,
  refreshForceGraphInstance,
  updateNodePositions,
  zoomToFit,
} from "./core/force-graph/createForceGraph";
import { songAnnotation247_2_entities } from "./core/force-graph/dynamics/247-2";
import { syncMissingNodesAndEdgesInForceGraph } from "./core/force-graph/forceGraphHelpers";
import { ForceGraphManager } from "./core/force-graph/ForceGraphManager";
import { enableZoomAndPanOnSvg } from "./core/graphviz/appHelpers";
import { GraphvizLayoutType } from "./core/layouts/GraphvizLayoutEngine";
import {
  Compute_Layout,
  ILayoutEngineResult,
  LayoutEngineOption,
  PresetLayoutType,
} from "./core/layouts/LayoutEngine";
import { fitToRect, NodePositionData } from "./core/layouts/layoutHelpers";
import { ConvertSceneGraphToGraphviz } from "./core/model/ConvertSceneGraphToGraphviz";
import { DisplayManager } from "./core/model/DisplayManager";
import { EdgeId } from "./core/model/Edge";
import { Entity } from "./core/model/entity/abstractEntity";
import { getGraphStatistics, GraphStastics } from "./core/model/GraphBuilder";
import { NodeDataArgs, NodeId } from "./core/model/Node";
import { SceneGraph } from "./core/model/SceneGraph";
import {
  GetCurrentDisplayConfigOf,
  loadRenderingConfigFromFile,
  SetCurrentDisplayConfigOf,
} from "./core/model/utils";
import { exportGraphDataForReactFlow } from "./core/react-flow/exportGraphDataForReactFlow";
import { IMAGE_ANNOTATION_ENTITIES } from "./core/types/ImageAnnotation";
import { flyToNode } from "./core/webgl/webglHelpers";
import {
  getAllDemoSceneGraphKeys,
  getSceneGraph,
} from "./data/DemoSceneGraphs";
import { extractPositionsFromNodes } from "./data/graphs/blobMesh";
import { bfsQuery, processYasguiResults } from "./helpers/yasguiHelpers";
import { fetchSvgSceneGraph } from "./hooks/useSvgSceneGraph";
import AudioAnnotator from "./mp3/AudioAnnotator";
import useActiveFilterStore from "./store/activeFilterStore";
import useActiveLegendConfigStore, {
  setEdgeKeyColor,
  setEdgeKeyVisibility,
  setEdgeLegendConfig,
  SetNodeAndEdgeLegendsForOnlyVisibleEntities,
  setNodeKeyColor,
  setNodeKeyVisibility,
  setNodeLegendConfig,
} from "./store/activeLegendConfigStore";
import useAppConfigStore, {
  getLegendMode,
  setActiveLayout,
  setAppConfig,
} from "./store/appConfigStore";
import useDialogStore from "./store/dialogStore";
import { IForceGraphRenderConfig } from "./store/forceGraphConfigStore";
import {
  clearSelections,
  getHoveredNodeIds,
  getSelectedNodeId,
  setHoveredEdgeIds,
  setHoveredNodeId,
  setHoveredNodeIds,
  setSelectedNodeId,
} from "./store/graphInteractionStore";
import useWorkspaceConfigStore from "./store/workspaceConfigStore";

export type ObjectOf<T> = { [key: string]: T };

const getSimulations = (
  sceneGraph: SceneGraph
): ObjectOf<React.JSX.Element> => {
  return {
    "ImageBox Creator": <ImageBoxCreator sceneGraph={sceneGraph} />,
    ImageGalleryV2: <ImageGalleryV2 />,
    // ParticleStickFigure: <ParticleStickFigure />,
    // SampleParticleEffect: <SampleParticleEffect />,
    SolarSystem: <SolarSystem />,
    // AtomicModel: <AtomicModel />,
    // GravitySimulation1: <GravitySimulation />,
    // GravitySimulation2: <GravitySimulation2 />,
    AccretionDisk: <GravitySimulation3 />,
    // WebGlWithHtml: <WebGLWithHTML />,
    // SimulationLab: <SimulationLab />,
    // StickFigure3d: <StickFigure3D />,
    ImageGallery: <ImageGallery />,
    // ImageGallery3: <ImageGallery3 />, // for navigating about procreate drawings
    // ImageGallery4: <ImageGallery4 />, // basic shape navigation test
    Lumina: <Lumina sceneGraph={sceneGraph} />,
    // Unified: <UnifiedForceGraphs />,
    // JsonEditor: <JsonEditor />,
    // JsonForms: <ConfigPanel />,
    mp3: <AudioAnnotator />,
    // imageSegmenter: <ImageSegmenter />,
    // timelineTestbed: <TimelineTestbed annotations={solvay_annotations} />,
    // canvasSelection: <CanvasSelection />,
  };
};

const initialSceneGraph = new SceneGraph();

export type RenderingView =
  | "Graphviz"
  | "ForceGraph3d"
  | "ReactFlow"
  | "Gallery" // Add new view type
  | "Simulation"
  | "Yasgui"; // Add new view type

const AppContent: React.FC<{
  defaultGraph?: string;
  svgUrl?: string;
  defaultActiveView?: string;
  defaultActiveLayout?: string;
}> = ({ defaultGraph, svgUrl, defaultActiveView, defaultActiveLayout }) => {
  const {
    showPathAnalysis,
    setShowEntityTables,
    setShowLayoutManager,
    setShowSceneGraphDetailView,
    setShowPathAnalysis,
    showLoadSceneGraphWindow,
    setShowLoadSceneGraphWindow,
    showSaveSceneGraphDialog,
    setShowSaveSceneGraphDialog,
    showEntityTables,
    showLayoutManager,
    showSceneGraphDetailView,
  } = useDialogStore();

  const {
    forceGraph3dOptions,
    activeView,
    setActiveView,
    activeLayout,
    getShowEntityDataCard,
    activeSceneGraph,
    legendMode,
    setLegendMode,
    currentSceneGraph,
    setCurrentSceneGraph,
  } = useAppConfigStore();

  const { showToolbar } = useWorkspaceConfigStore();
  const {
    nodeLegendConfig,
    edgeLegendConfig,
    nodeLegendUpdateTime,
    edgeLegendUpdateTime,
  } = useActiveLegendConfigStore();

  const { activeFilter, setActiveFilter } = useActiveFilterStore();

  const graphvizRef = useRef<HTMLDivElement | null>(null);
  const forceGraphRef = useRef<HTMLDivElement | null>(null);
  const reactFlowRef = useRef<HTMLDivElement | null>(null);
  const forceGraphInstance = useRef<ForceGraph3DInstance | null>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // eslint-disable-next-line unused-imports/no-unused-vars
  const { mousePosition, setMousePosition } = useMousePosition();

  const clearUrlOfQueryParams = useCallback(() => {
    const url = new URL(window.location.href);
    // url.searchParams.delete('graph');
    // url.searchParams.delete('svgUrl');
    // url.searchParams.delete('view');
    // url.searchParams.delete('layout');
    url.searchParams.delete("showOptionsPanel");
    url.searchParams.delete("showLegendBars");
    url.searchParams.delete("showGraphLayoutToolbar");
    url.searchParams.delete("showRenderConfig");
    window.history.pushState({}, "", url.toString());
  }, []);

  const [simulations, setSimulations] = useState<{
    [key: string]: JSX.Element;
  }>({});

  const [showFilter, setShowFilter] = useState(false);
  const [showFilterManager, setShowFilterManager] = useState(false);

  const _getAppConfigWithUrlOverrides = useCallback(
    (config: AppConfig) => {
      const layoutToUse = defaultActiveLayout
        ? (defaultActiveLayout as LayoutEngineOption)
        : config.activeLayout;
      return {
        ...config,
        activeView: defaultActiveView ?? config.activeView,
        activeLayout: layoutToUse,
        forceGraph3dOptions: {
          ...config.forceGraph3dOptions,
          layout: defaultActiveLayout
            ? "Layout"
            : config.forceGraph3dOptions.layout,
        },
        windows: {
          ...config.windows,
        },
      };
    },
    [defaultActiveLayout, defaultActiveView]
  );

  const [layoutResult, setLayoutResult] =
    useState<ILayoutEngineResult | null>();

  const [selectedSimulation, setSelectedSimulation] =
    useState<string>("Lumina");

  // const [currentSceneGraph, setCurrentSceneGraph] =
  //   useState<SceneGraph>(initialSceneGraph);

  useEffect(() => {
    setCurrentSceneGraph(initialSceneGraph);
  }, [setCurrentSceneGraph]);

  const isDarkMode = useMemo(() => {
    return activeView === "ForceGraph3d" || activeView in simulations;
  }, [activeView, simulations]);

  const [graphStatistics, setGraphStatistics] = useState<
    GraphStastics | undefined
  >();

  const handleReactFlowFitView = useCallback(
    (padding: number = 0.1, duration: number = 0) => {
      if (activeView === "ReactFlow" && reactFlowInstance.current) {
        setTimeout(() => {
          reactFlowInstance.current?.fitView({ padding, duration });
        }, 0);
      }
    },
    [activeView]
  );

  useEffect(() => {
    setSimulations(getSimulations(currentSceneGraph));
  }, [currentSceneGraph]);

  useEffect(() => {
    if (svgUrl) {
      fetchSvgSceneGraph(svgUrl).then(({ sceneGraph, error }) => {
        if (error) {
          console.error("Failed to load SVG from URL:", error);
        } else {
          handleLoadSceneGraph(sceneGraph);
        }
      });
    } else if (defaultGraph) {
      handleSetSceneGraph(defaultGraph, false);
    } else {
      handleSetSceneGraph(activeSceneGraph);
    }

    if (defaultActiveView) {
      handleSetActiveView(defaultActiveView as RenderingView);
    }

    if (defaultActiveLayout) {
      handleSetActiveLayout(defaultActiveLayout as LayoutEngineOption);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultGraph, svgUrl, defaultActiveView, defaultActiveLayout]);

  useEffect(() => {
    if (activeView === "ReactFlow" && reactFlowInstance.current) {
      handleReactFlowFitView();
    }
  }, [
    nodeLegendConfig,
    edgeLegendConfig,
    activeView,
    handleReactFlowFitView,
    layoutResult,
  ]);

  const selectedGraphNode = useMemo(() => {
    if (getSelectedNodeId()) {
      return currentSceneGraph.getGraph().getNode(getSelectedNodeId()!);
    }
    return null;
  }, [currentSceneGraph]);

  const handleMouseHoverLegendItem = useCallback(
    (type: GraphEntityType) =>
      (key: string): void => {
        if (type === "Node") {
          const allNodesOfType =
            legendMode === "type"
              ? currentSceneGraph
                  .getGraph()
                  .getNodesByType(key)
                  .map((n) => n.getId())
              : currentSceneGraph
                  .getGraph()
                  .getNodesByTag(key)
                  .map((node) => node.getId());
          setHoveredNodeIds(allNodesOfType);
          if (forceGraphInstance.current) {
            forceGraphInstance.current.nodeColor(
              forceGraphInstance.current.nodeColor()
            );
          }
        } else {
          return;
        }
      },
    [currentSceneGraph, legendMode]
  );

  const handleMouseUnhoverLegendItem = useCallback(
    (_type: GraphEntityType) =>
      (_key: string): void => {
        setHoveredNodeIds([]);
        setHoveredEdgeIds([]);
      },
    []
  );

  const handleSetActiveFilterPreset = useCallback(
    (preset: string | undefined, filterRules: FilterRuleDefinition[]) => {
      DisplayManager.applyVisibilityFromFilterRulesToGraph(
        currentSceneGraph.getGraph(),
        filterRules
      );
      SetNodeAndEdgeLegendsForOnlyVisibleEntities(
        currentSceneGraph,
        legendMode,
        filterRules
      );
      setActiveFilter({ name: preset, filterRules });
    },
    [currentSceneGraph, legendMode, setActiveFilter]
  );

  const handleSetVisibleNodes = useCallback(
    (nodeIds: string[]) => {
      handleSetActiveFilterPreset("node id selection", [
        {
          id: "node id selection",
          operator: "include",
          ruleMode: "entities",
          conditions: {
            nodes: nodeIds,
          },
        },
      ]);
    },
    [handleSetActiveFilterPreset]
  );

  let isComputing = false;
  const safeComputeLayout = useCallback(
    async (sceneGraph: SceneGraph, layout: LayoutEngineOption) => {
      if (isComputing) {
        console.log("Already computing layout. Skipping.");
        return;
      }
      if (layout === PresetLayoutType.Preset) {
        console.log(
          "Skipping layout computation for preset layout. Preset must be loaded"
        );
        return null;
      } else if (layout === PresetLayoutType.NodePositions) {
        console.log("Applying positions stored in graph nodes");
        const positions = extractPositionsFromNodes(sceneGraph);
        currentSceneGraph.setNodePositions(positions);
        setLayoutResult({ positions, layoutType: layout });
        isComputing = false;
        return;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      isComputing = true;
      const output = await Compute_Layout(sceneGraph, layout);
      if (!output) {
        throw new Error(`Failed to compute layout for ${layout}`);
      }
      sceneGraph.getDisplayConfig().nodePositions = output.positions;
      if (!output.svg) {
        console.log("Generating svg from graphviz");
        const g = ConvertSceneGraphToGraphviz(
          sceneGraph.getGraph(),
          {
            ...sceneGraph.getDisplayConfig(),
            nodePositions: fitToRect(50, 50, output.positions),
          },
          layout
        );
        const dot = toDot(g);
        const graphviz = await Graphviz.load();
        const svg = await graphviz.layout(dot, "svg");
        output.svg = svg;
      }
      sceneGraph.getDisplayConfig().svg = output.svg;
      setLayoutResult(output);
      isComputing = false;
    },
    []
  );

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: NodeId | undefined;
  } | null>(null);

  const [isNodeEditorOpen, setIsNodeEditorOpen] = useState(false);

  const handleNodeRightClick = useCallback(
    (event: MouseEvent | React.MouseEvent, nodeId: string | null) => {
      event.preventDefault();
      if (nodeId) {
        setContextMenu({
          x: event.clientX,
          y: event.clientY,
          nodeId: nodeId as NodeId,
        });
      }
    },
    []
  );

  const handleBackgroundRightClick = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: undefined,
      });
    },
    []
  );

  const handleCreateNode = useCallback(() => {
    setIsNodeEditorOpen(true);
    setContextMenu(null);
  }, []);

  const handleCreateNodeSubmit = useCallback(
    (newNodeData: NodeDataArgs) => {
      const newNode = currentSceneGraph
        .getGraph()
        .createNode(uuidv4(), newNodeData);
      console.log("new node created is ", newNode);
      currentSceneGraph.notifyGraphChanged();
      setIsNodeEditorOpen(false);
    },
    [currentSceneGraph]
  );

  const handleEditNodeSubmit = useCallback(
    (nodeId: NodeId, updatedNodeData: NodeDataArgs) => {
      const node = currentSceneGraph.getGraph().getNode(nodeId);
      node.setLabel(updatedNodeData.label);
      node.setType(updatedNodeData.type);
      node.setTags(new Set(updatedNodeData.tags ?? []));
      node.setDescription(updatedNodeData.description);
      setIsNodeEditorOpen(false);
      if (forceGraphInstance.current) {
        forceGraphInstance.current.refresh();
      }
      setEditingNodeId(null);
    },
    [currentSceneGraph]
  );

  const initializeForceGraph = useCallback(() => {
    console.log(
      "Creating new force graph instance",
      forceGraphInstance.current,
      currentSceneGraph.getDisplayConfig().nodePositions,
      forceGraph3dOptions.layout
    );
    forceGraphInstance.current = createForceGraph(
      currentSceneGraph,
      forceGraphRef.current!,
      currentSceneGraph.getDisplayConfig().nodePositions,
      currentSceneGraph.getForceGraphRenderConfig(),
      forceGraph3dOptions.layout
    );
    bindEventsToGraphInstance(
      forceGraphInstance.current,
      currentSceneGraph,
      handleNodeRightClick,
      handleBackgroundRightClick
    );

    forceGraphInstance.current?.onEngineTick(() => {
      zoomToFit(forceGraphInstance.current!, 0);
    });

    setTimeout(() => {
      forceGraphInstance.current?.onEngineTick(() => {});
    }, 800);
  }, [
    currentSceneGraph,
    forceGraph3dOptions.layout,
    handleNodeRightClick,
    handleBackgroundRightClick,
  ]);

  useEffect(() => {
    if (layoutResult?.layoutType === activeLayout) {
      console.log(
        "Skipping layout computation because it has already been computed"
      );
      return;
    }
    if (
      activeView === "Graphviz" ||
      activeView === "ReactFlow" ||
      (activeView === "ForceGraph3d" &&
        forceGraph3dOptions.layout === "Layout") ||
      forceGraph3dOptions.layout in new Set(Object.values(GraphvizLayoutType))
    ) {
      safeComputeLayout(currentSceneGraph, activeLayout);
    }
  }, [
    currentSceneGraph,
    forceGraph3dOptions.layout,
    activeLayout,
    safeComputeLayout,
    activeView,
    layoutResult?.layoutType,
  ]);

  const [graphModelUpdateTime, setGraphModelUpdateTime] = useState<number>(0);

  const handleDisplayConfigChanged = useCallback(
    (displayConfig: RenderingConfig) => {
      console.log(
        "notified changed",
        currentSceneGraph.getGraph().getEdges().getTypes()
      );
      SetCurrentDisplayConfigOf(
        currentSceneGraph.getDisplayConfig(),
        "Node",
        displayConfig.nodeConfig
      );
      SetCurrentDisplayConfigOf(
        currentSceneGraph.getDisplayConfig(),
        "Edge",
        displayConfig.edgeConfig
      );
      if (displayConfig.mode === "tag") {
        setNodeLegendConfig({ ...displayConfig.nodeConfig.tags });
        setEdgeLegendConfig({ ...displayConfig.edgeConfig.tags });
      } else {
        setNodeLegendConfig({ ...displayConfig.nodeConfig.types });
        setEdgeLegendConfig({ ...displayConfig.edgeConfig.types });
      }
    },
    [currentSceneGraph]
  );

  const handleLoadSceneGraph = useCallback(
    async (graph: SceneGraph, clearQueryParams: boolean = true) => {
      const tick = Date.now();
      console.log("Loading SceneGraph", graph.getMetadata().name, "...");
      if (clearQueryParams) {
        clearUrlOfQueryParams();
      }
      clearSelections();
      safeComputeLayout(graph, activeLayout).then(() => {
        setCurrentSceneGraph(graph);
        if (graph.getData().defaultAppConfig) {
          setAppConfig(graph.getData().defaultAppConfig!);
        }
        setLegendMode(graph.getDisplayConfig().mode);
        setNodeLegendConfig(
          GetCurrentDisplayConfigOf(graph.getDisplayConfig(), "Node")
        );
        setEdgeLegendConfig(
          GetCurrentDisplayConfigOf(graph.getDisplayConfig(), "Edge")
        );
        setGraphStatistics(getGraphStatistics(graph.getGraph()));

        graph.bindListeners({
          onDisplayConfigChanged: handleDisplayConfigChanged,
          onGraphChanged: (g) => {
            setGraphStatistics(getGraphStatistics(g));
            if (forceGraphInstance.current) {
              syncMissingNodesAndEdgesInForceGraph(
                forceGraphInstance.current,
                graph
              );
            }
            handleDisplayConfigChanged(graph.getDisplayConfig());
            setGraphModelUpdateTime(Date.now());
          },
        });

        // DEV LOGIC
        graph.getEntityCache().addEntities(songAnnotation247_2_entities);
        graph.getEntityCache().addEntities(IMAGE_ANNOTATION_ENTITIES());

        const tock = Date.now();
        console.log("TOTAL TIME", tock - tick);
      });
    },
    [
      activeLayout,
      clearUrlOfQueryParams,
      handleDisplayConfigChanged,
      safeComputeLayout,
      setCurrentSceneGraph,
      setLegendMode,
    ]
  );

  const handleSetSceneGraph = useCallback(
    async (key: string, clearUrlOfQueryParams: boolean = true) => {
      const graphGenerator = getSceneGraph(key);

      if (!graphGenerator) {
        console.error(`Graph ${key} not found`);
        console.log(`Available graphs are: ${getAllDemoSceneGraphKeys()}`);
        return;
      }

      let graph: SceneGraph;
      if (typeof graphGenerator === "function") {
        graph = await graphGenerator();
      } else {
        graph = graphGenerator;
      }

      handleLoadSceneGraph(graph, clearUrlOfQueryParams);

      // Update the URL query parameter
      const url = new URL(window.location.href);
      url.searchParams.set("graph", key);
      url.searchParams.delete("svgUrl");
      window.history.pushState({}, "", url.toString());
    },
    [handleLoadSceneGraph]
  );

  useEffect(() => {
    // Hide scrollbar
    document.body.style.overflow = "hidden";
  }, []);

  const getSimulation = useCallback(
    (key: string): JSX.Element | undefined => {
      if (key in simulations) {
        return simulations[key];
      }
      return undefined;
    },
    [simulations]
  );

  const handleSetActiveLayout = useCallback((layout: LayoutEngineOption) => {
    setActiveLayout(layout);
  }, []);

  const graphvizFitToView = useCallback((element: HTMLDivElement) => {
    enableZoomAndPanOnSvg(element);
  }, []);

  const handleFitToView = useCallback(
    (activeView: string, duration: number = 0) => {
      if (activeView === "Graphviz" && graphvizRef.current) {
        graphvizFitToView(graphvizRef.current);
      } else if (activeView === "ForceGraph3d" && forceGraphInstance.current) {
        zoomToFit(forceGraphInstance.current!, duration);
      } else if (activeView === "ReactFlow" && reactFlowInstance.current) {
        console.log("fitting");
        handleReactFlowFitView(0.1, duration);
        // reactFlowInstance.current.fitView({ padding: 0.1, duration: 400 });
      }
    },
    [graphvizFitToView, handleReactFlowFitView]
  );

  const handleLegendModeChange = useCallback(
    (mode: RenderingManager__DisplayMode) => {
      currentSceneGraph.getDisplayConfig().mode = mode;
      setLegendMode(mode);
      setNodeLegendConfig(
        GetCurrentDisplayConfigOf(currentSceneGraph.getDisplayConfig(), "Node")
      );
      setEdgeLegendConfig(
        GetCurrentDisplayConfigOf(currentSceneGraph.getDisplayConfig(), "Edge")
      );
    },
    [currentSceneGraph, setLegendMode]
  );

  const handleNodeCheckBulk = useCallback(
    (updates: { [key: string]: boolean }) => {
      const newConfig = { ...nodeLegendConfig };
      Object.keys(updates).forEach((key) => {
        newConfig[key].isVisible = updates[key];
      });
      SetCurrentDisplayConfigOf(
        currentSceneGraph.getDisplayConfig(),
        "Node",
        newConfig
      );
      setNodeLegendConfig(newConfig);
    },
    [currentSceneGraph, nodeLegendConfig]
  );

  const handleEdgeCheckBulk = useCallback(
    (updates: { [key: string]: boolean }) => {
      const newConfig = { ...edgeLegendConfig };
      Object.keys(updates).forEach((key) => {
        newConfig[key].isVisible = updates[key];
      });
      SetCurrentDisplayConfigOf(
        currentSceneGraph.getDisplayConfig(),
        "Edge",
        newConfig
      );
      setEdgeLegendConfig(newConfig);
    },
    [currentSceneGraph, edgeLegendConfig]
  );

  const renderNodeLegend = useMemo(() => {
    const statistics =
      legendMode === "type"
        ? graphStatistics?.nodeTypeToCount
        : graphStatistics?.nodeTagsToCount;
    return (
      <Legend
        title="Node"
        displayConfig={{ ...nodeLegendConfig }}
        onChange={(key: string, color: string) =>
          setNodeKeyColor(key as NodeId, color)
        }
        onCheck={(key: string, isVisiblity: boolean) =>
          setNodeKeyVisibility(key as NodeId, isVisiblity)
        }
        onCheckBulk={handleNodeCheckBulk}
        isDarkMode={isDarkMode}
        totalCount={graphStatistics?.nodeCount}
        statistics={statistics}
        sceneGraph={currentSceneGraph}
        onMouseHoverItem={handleMouseHoverLegendItem("Node")}
        onMouseUnhoverItem={handleMouseUnhoverLegendItem("Node")}
      />
    );
  }, [
    legendMode,
    graphStatistics?.nodeTypeToCount,
    graphStatistics?.nodeTagsToCount,
    graphStatistics?.nodeCount,
    nodeLegendConfig,
    handleNodeCheckBulk,
    isDarkMode,
    currentSceneGraph,
    handleMouseHoverLegendItem,
    handleMouseUnhoverLegendItem,
  ]);

  const renderEdgeLegend = useMemo(() => {
    const statistics =
      legendMode === "type"
        ? graphStatistics?.edgeTypeToCount
        : graphStatistics?.edgeTagsToCount;
    return (
      <Legend
        title="Edge"
        displayConfig={edgeLegendConfig}
        onChange={(key: string, color: string) =>
          setEdgeKeyColor(key as EdgeId, color)
        }
        onCheck={(key: string, isVisiblity: boolean) =>
          setEdgeKeyVisibility(key as EdgeId, isVisiblity)
        }
        onCheckBulk={handleEdgeCheckBulk}
        isDarkMode={isDarkMode}
        totalCount={graphStatistics?.edgeCount}
        statistics={statistics}
        sceneGraph={currentSceneGraph}
      />
    );
  }, [
    legendMode,
    graphStatistics?.edgeTypeToCount,
    graphStatistics?.edgeTagsToCount,
    graphStatistics?.edgeCount,
    edgeLegendConfig,
    handleEdgeCheckBulk,
    isDarkMode,
    currentSceneGraph,
  ]);

  const handleSetActiveView = useCallback(
    (key: string) => {
      console.log("setting active view", key);
      setActiveView(key);
      handleFitToView(key);
      const url = new URL(window.location.href);
      url.searchParams.set("view", key);
      window.history.pushState({}, "", url.toString());
    },
    [handleFitToView, setActiveView]
  );

  const GraphMenuActions = useCallback(() => {
    const actions: { [key: string]: { action: () => void } } = {};
    const allGraphs = getAllDemoSceneGraphKeys();
    for (const key of allGraphs) {
      actions[key] = { action: () => handleSetSceneGraph(key) };
    }
    return actions;
  }, [handleSetSceneGraph]);

  const SimulationMenuActions = useCallback(() => {
    const actions: { [key: string]: { action: () => void } } = {};
    for (const key of Object.keys(simulations)) {
      actions[key] = {
        action: () => {
          setSelectedSimulation(key);
          handleSetActiveView(key);
        },
      };
    }
    return actions;
  }, [handleSetActiveView, simulations]);

  const handleImportConfig = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const config = await loadRenderingConfigFromFile(file);
        currentSceneGraph.setDisplayConfig(config);
        setNodeLegendConfig(
          GetCurrentDisplayConfigOf(
            currentSceneGraph.getDisplayConfig(),
            "Node"
          )
        );
        setEdgeLegendConfig(
          GetCurrentDisplayConfigOf(
            currentSceneGraph.getDisplayConfig(),
            "Edge"
          )
        );
      }
    },
    [currentSceneGraph]
  );

  const applyNewLayout = useCallback(
    (layoutType: LayoutEngineOption) => {
      handleSetActiveLayout(layoutType);
    },
    [handleSetActiveLayout]
  );

  const [pathAnalysisConfig, setPathAnalysisConfig] = useState<
    IPathArgs | undefined
  >(undefined);
  const [editingNodeId, setEditingNodeId] = useState<NodeId | null>(null);

  const handleLoadLayout = useCallback(
    (positions: NodePositionData) => {
      currentSceneGraph.getDisplayConfig().nodePositions = positions;
      DisplayManager.applyNodePositions(
        currentSceneGraph.getGraph(),
        positions
      );
      handleSetActiveLayout(PresetLayoutType.Preset);
      setLayoutResult({ positions, layoutType: PresetLayoutType.Preset });
      if (forceGraphInstance.current && activeView === "ForceGraph3d") {
        updateNodePositions(forceGraphInstance.current, positions);
      } else if (activeView === "ReactFlow") {
        setGraphModelUpdateTime(Date.now()); //hack
      }
    },
    [currentSceneGraph, handleSetActiveLayout, activeView]
  );

  const menuConfigInstance = useMemo(() => {
    const menuConfigCallbacks: IMenuConfigCallbacks = {
      handleImportConfig,
      handleFitToView,
      GraphMenuActions,
      SimulationMenuActions,
      applyNewLayout,
      setShowNodeTable: setShowEntityTables,
      setShowEdgeTable: setShowEntityTables,
      showLayoutManager: (mode: "save" | "load") =>
        setShowLayoutManager({ mode, show: true }),
      showFilterWindow: () => setShowFilter(true),
      handleLoadLayout: handleLoadLayout,
      showSceneGraphDetailView: (readOnly: boolean) => {
        setShowSceneGraphDetailView({ show: true, readOnly });
      },
    };
    return new MenuConfig(
      menuConfigCallbacks,
      currentSceneGraph,
      forceGraphInstance
    );
  }, [
    GraphMenuActions,
    SimulationMenuActions,
    applyNewLayout,
    currentSceneGraph,
    handleFitToView,
    handleImportConfig,
    handleLoadLayout,
    setShowEntityTables,
    setShowLayoutManager,
    setShowSceneGraphDetailView,
  ]);

  const menuConfig = useMemo(
    () => menuConfigInstance.getConfig(),
    [menuConfigInstance]
  );

  const _renderSceneGraphTitle = useMemo(() => {
    return (
      <SceneGraphTitle
        title={currentSceneGraph.getMetadata().name ?? ""}
        description={currentSceneGraph.getMetadata().description ?? ""}
      />
    );
  }, [currentSceneGraph]);

  const renderLayoutModeRadio = useCallback(() => {
    return <LegendModeRadio onLegendModeChange={handleLegendModeChange} />;
  }, [handleLegendModeChange]);

  useEffect(() => {
    const errorHandler = (e: any) => {
      if (
        e.message.includes(
          "ResizeObserver loop completed with undelivered notifications"
        ) ||
        e.message.includes("ResizeObserver loop limit exceeded")
      ) {
        const resizeObserverErr = document.getElementById(
          "webpack-dev-server-client-overlay"
        );
        if (resizeObserverErr) {
          resizeObserverErr.style.display = "none";
        }
      }
    };
    window.addEventListener("error", errorHandler);

    return () => {
      window.removeEventListener("error", errorHandler);
    };
  }, []);

  const maybeRenderReactFlow = useMemo(() => {
    if (activeView !== "ReactFlow") {
      return null;
    }

    if (currentSceneGraph.getDisplayConfig().nodePositions === undefined) {
      safeComputeLayout(currentSceneGraph, activeLayout);
      return;
    }

    const data = exportGraphDataForReactFlow(currentSceneGraph);
    const nodePositions = layoutResult?.positions || {};

    const nodesWithPositions = data.nodes.map((node) => ({
      ...node,
      position: nodePositions[node.id] || { x: 200, y: 200 },
      type: "resizerNode", // Use the custom node type
      data: {
        label: currentSceneGraph
          .getGraph()
          .getNode(node.id as NodeId)
          .getLabel(),
        onResizeEnd: (x: number, y: number, width: number, height: number) => {
          currentSceneGraph
            .getNode(node.id as NodeId)
            .setPosition({
              x,
              y,
              z: currentSceneGraph.getNode(node.id as NodeId).getPosition().z,
            })
            .setDimensions({ width, height });
          currentSceneGraph.getDisplayConfig().nodePositions![node.id] = {
            x,
            y,
            z: 0,
          };
          if (layoutResult) {
            layoutResult.positions[node.id] = {
              x,
              y,
              z: 0,
            };
          }
        },
        dimensions: node.data.dimensions,
      },
      style: {
        background: RenderingManager.getColor(
          currentSceneGraph.getGraph().getNode(node.id as NodeId),
          nodeLegendConfig,
          getLegendMode()
        ),
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));

    return (
      <div
        id="react-flow"
        ref={reactFlowRef}
        style={{
          position: "absolute",
          top: 0,
          width: "100%",
          height: "100%",
          zIndex: 10,
        }}
      >
        <ReactFlowPanel
          nodes={nodesWithPositions}
          edges={data.edges.map((edge) => ({
            ...edge,
            type: "default",
            style: {
              stroke: RenderingManager.getColor(
                currentSceneGraph.getGraph().getEdge(edge.id as EdgeId),
                edgeLegendConfig,
                legendMode
              ),
            },
            labelStyle: {
              fill: RenderingManager.getColor(
                currentSceneGraph.getGraph().getEdge(edge.id as EdgeId),
                edgeLegendConfig,
                legendMode
              ),
              fontWeight: 700,
            },
          }))}
          onLoad={(instance) => {
            if (reactFlowInstance.current !== instance) {
              reactFlowInstance.current = instance;
              setTimeout(() => handleReactFlowFitView(), 100);
            }
          }}
          onNodeContextMenu={(event, node) =>
            handleNodeRightClick(event, node.id)
          }
          onBackgroundContextMenu={(event) => handleBackgroundRightClick(event)}
          onNodeDragStop={(event, node, nodes) => {
            const nodesToUpdate = [...nodes, node];
            // Update the cached positions in SceneGraph
            if (!currentSceneGraph.getDisplayConfig().nodePositions) {
              currentSceneGraph.getDisplayConfig().nodePositions = {};
            }
            for (const node of nodesToUpdate) {
              currentSceneGraph.getDisplayConfig().nodePositions![node.id] = {
                x: node.position.x,
                y: node.position.y,
                z: 0,
              };
              const sceneGraphNode = currentSceneGraph.getNode(
                node.id as NodeId
              );
              sceneGraphNode.setPosition({
                x: node.position.x,
                y: node.position.y,
                z: 0,
              });
              if (layoutResult) {
                layoutResult.positions[node.id] = {
                  x: node.position.x,
                  y: node.position.y,
                  z: 0,
                };
              }
              console.log("SET!", node);
            }
          }}
        />
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeView,
    activeFilter,
    activeLayout,
    currentSceneGraph,
    layoutResult,
    nodeLegendConfig,
    edgeLegendConfig,
    nodeLegendUpdateTime,
    edgeLegendUpdateTime,
    safeComputeLayout,
    handleReactFlowFitView,
    handleNodeRightClick,
    handleBackgroundRightClick,
    graphModelUpdateTime, // @todo remove this. currently need to include this to force re-render when graph is changed outside reactflow
  ]);

  const maybeRenderGraphviz = useMemo(() => {
    if (activeView !== "Graphviz") {
      return;
    }

    return (
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "calc(100vh)",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
        ref={graphvizRef}
        id="graphviz"
      />
    );
  }, [activeView]);

  const maybeRenderForceGraph3D = useMemo(() => {
    if (activeView === "ForceGraph3d") {
      return (
        <div
          id="force-graph"
          ref={forceGraphRef}
          style={{
            position: "fixed",
            top: showToolbar ? "var(--toolbar-height, 40px)" : 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "black",
            zIndex: 1,
          }}
        />
      );
    }
    return null;
  }, [activeView, showToolbar]);

  const _handleUpdateForceGraphScene = useCallback((sceneGraph: SceneGraph) => {
    if (!forceGraphInstance.current) {
      throw new Error("ForceGraphInstance is undefined");
    }
    if (!sceneGraph.getDisplayConfig().nodePositions) {
      throw new Error("Node positions are undefined");
    }
    console.log("Updating existing force graph instance");
    updateNodePositions(
      forceGraphInstance.current,
      sceneGraph.getDisplayConfig().nodePositions!
    );
    zoomToFit(forceGraphInstance.current);
  }, []);

  useEffect(() => {
    if (activeView === "ForceGraph3d") {
      if (forceGraphInstance.current) {
        console.log(
          "refreshing on layout mode change",
          forceGraph3dOptions.layout
        );
        refreshForceGraphInstance(
          forceGraphInstance.current,
          currentSceneGraph,
          forceGraph3dOptions.layout
        );
      }
    }
  }, [
    nodeLegendUpdateTime,
    edgeLegendUpdateTime,
    activeView,
    forceGraph3dOptions.layout,
    activeFilter,
    currentSceneGraph,
  ]);

  useEffect(() => {
    if (
      layoutResult?.layoutType !== activeLayout &&
      (activeView === "Graphviz" || activeView === "ReactFlow")
    ) {
      if (currentSceneGraph.getDisplayConfig().nodePositions === undefined) {
        safeComputeLayout(currentSceneGraph, activeLayout);
      }
    } else if (activeView === "ForceGraph3d") {
      console.log("Reinitializing");
      initializeForceGraph();
    }

    return () => {
      if (forceGraphInstance.current) {
        forceGraphInstance.current._destructor();
        forceGraphInstance.current = null;
      }
    };
  }, [
    currentSceneGraph,
    activeView,
    forceGraph3dOptions.layout,
    activeLayout,
    initializeForceGraph,
    safeComputeLayout,
    layoutResult?.layoutType,
  ]);

  useEffect(() => {
    if (
      forceGraphInstance.current &&
      layoutResult &&
      forceGraph3dOptions.layout === "Layout"
    ) {
      ForceGraphManager.applyFixedNodePositions(
        forceGraphInstance.current,
        layoutResult?.positions
      );
      zoomToFit(forceGraphInstance.current);
    } else if (graphvizRef.current && layoutResult) {
      graphvizRef.current.innerHTML = layoutResult.svg ?? "";
      enableZoomAndPanOnSvg(graphvizRef.current);
      graphvizFitToView(graphvizRef.current);
    }
    // const url = new URL(window.location.href);
    // url.searchParams.set("layout", layoutResult?.layoutType as string);
    // window.history.pushState({}, "", url.toString());
  }, [
    forceGraphInstance,
    layoutResult,
    forceGraph3dOptions.layout,
    graphvizFitToView,
  ]);

  const handleSearchResult = useCallback((nodeIds: string[]) => {
    console.log("Search results:", nodeIds);
    // You can use this to update visualization state
  }, []);

  const handleHighlight = useCallback(
    (nodeId: string) => {
      // setHighlightedNode(nodeId);
      // Additional logic for highlighting in different views
      if (activeView === "ForceGraph3d" && forceGraphInstance.current) {
        forceGraphInstance.current.cameraPosition({
          x: forceGraphInstance.current.getGraphBbox().x[0],
          y: forceGraphInstance.current.getGraphBbox().y[0],
          z: 1000,
        });
        forceGraphInstance.current.nodeColor((node: any) =>
          node.id === nodeId ? "#ff0000" : node.__baseColor || "#ffffff"
        );
      }
    },
    [activeView, forceGraphInstance]
  );

  const handleSelectResult = useCallback(
    (nodeId: NodeId | string) => {
      if (!forceGraphInstance.current) {
        return;
      }
      if (activeView === "ForceGraph3d") {
        const node = forceGraphInstance.current
          .graphData()
          .nodes.find((node) => node.id === nodeId);
        if (node) {
          console.log("flying to ", node);
          flyToNode(forceGraphInstance.current, node);
          handleHighlight(nodeId);
          setSelectedNodeId(nodeId as NodeId);
        }
      }
    },
    [activeView, handleHighlight]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (activeView === "ForceGraph3d" && forceGraphInstance.current) {
        setMousePosition({ x: event.clientX, y: event.clientY });
      }
    },
    [activeView, setMousePosition]
  );

  const _handleNodeMouseEnter = useCallback(
    (event: React.MouseEvent, nodeId: string) => {
      setHoveredNodeId(nodeId as NodeId);
      setMousePosition({ x: event.clientX, y: event.clientY });
    },
    [setMousePosition]
  );

  const _handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  const handleApplyForceGraphConfig = useCallback(
    (config: IForceGraphRenderConfig) => {
      currentSceneGraph.setForceGraphRenderConfig(config);
      if (forceGraphInstance.current) {
        ForceGraphManager.applyForceGraphRenderConfig(
          forceGraphInstance.current,
          config,
          currentSceneGraph
        );
      }
    },
    [currentSceneGraph]
  );

  const _handleApplyPositionsToForceGraph = useCallback(
    (positions: NodePositionData) => {
      if (forceGraphInstance.current) {
        ForceGraphManager.applyFixedNodePositions(
          forceGraphInstance.current,
          positions
        );
      }
    },
    []
  );

  const getBackgroundRightClickContextMenuItems = useCallback(
    (): ContextMenuItem[] => [
      {
        label: "Create Node",
        action: handleCreateNode,
      },
    ],
    [handleCreateNode]
  );

  const getNodeContextMenuItems = useCallback(
    (nodeId: NodeId): ContextMenuItem[] => [
      {
        label: "Focus Node",
        action: () => {
          if (forceGraphInstance.current) {
            const node = forceGraphInstance.current
              .graphData()
              .nodes.find((n) => n.id === nodeId);
            if (node) {
              flyToNode(forceGraphInstance.current, node);
            }
          }
        },
      },
      {
        label: "Expand around Node",
        action: () => {
          if (forceGraphInstance.current) {
            attachRepulsiveForce(forceGraphInstance.current, nodeId);
          }
        },
      },
      {
        label: "Select Node",
        action: () => setSelectedNodeId(nodeId),
      },
      {
        label: "Hide Node",
        action: () => {
          // Implement hide node functionality
          console.log("Hide node:", nodeId);
        },
      },
      {
        label: "Find path",
        submenu: [
          {
            label: "to...",
            action: () => {
              setPathAnalysisConfig({
                startNode: nodeId,
                endNode: undefined,
              });
              setShowPathAnalysis(true);
            },
          },
          {
            label: "from...",
            action: () => {
              setPathAnalysisConfig({
                startNode: undefined,
                endNode: nodeId,
              });
              setShowPathAnalysis(true);
            },
          },
        ],
      },
      {
        label: "Edit",
        action: () => {
          setEditingNodeId(nodeId);
          setIsNodeEditorOpen(true);
        },
      },
      {
        label: "Edit JSON",
        action: () => {
          setJsonEditEntity(currentSceneGraph.getGraph().getNode(nodeId));
        },
      },
      {
        label: "Query dbpedia",
        action: () => {
          bfsQuery(nodeId.replace(" ", "_"), 200, 150, 500).then((results) =>
            processYasguiResults(results, currentSceneGraph)
          );
        },
      },
    ],
    [currentSceneGraph, setShowPathAnalysis]
  );

  const getContextMenuItems = useCallback(
    (nodeId: NodeId | undefined): ContextMenuItem[] => {
      if (nodeId) {
        return getNodeContextMenuItems(nodeId);
      } else {
        return getBackgroundRightClickContextMenuItems();
      }
    },
    [getNodeContextMenuItems, getBackgroundRightClickContextMenuItems]
  );

  const pathAnalysisWizard = useMemo(() => {
    {
      if (!showPathAnalysis) {
        return null;
      }
      console.log("recalling");
      return (
        <PathAnalysisWizard
          sceneGraph={currentSceneGraph}
          isDarkMode={isDarkMode}
          onClose={() => setShowPathAnalysis(false)}
          pathArgs={pathAnalysisConfig} // Pass the initial start node
        />
      );
    }
  }, [
    showPathAnalysis,
    currentSceneGraph,
    isDarkMode,
    pathAnalysisConfig,
    setShowPathAnalysis,
  ]);

  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [jsonEditEntity, setJsonEditEntity] = useState<Entity | null>(null);

  const handleJsonEditSave = (newData: any) => {
    if (jsonEditEntity) {
      // Update the entity data
      Object.assign(jsonEditEntity.getData(), newData);
      setJsonEditEntity(null);
    }
  };

  const handleLoadFilter = useCallback(
    (preset: FilterPreset) => {
      DisplayManager.applyVisibilityFromFilterRulesToGraph(
        currentSceneGraph.getGraph(),
        preset.rules
      );
      SetNodeAndEdgeLegendsForOnlyVisibleEntities(
        currentSceneGraph,
        legendMode,
        preset.rules
      );
      setShowFilterManager(false);
      setActiveFilter({ name: preset.name, filterRules: preset.rules });
    },
    [currentSceneGraph, legendMode, setActiveFilter]
  );

  const maybeRenderLoadSceneGraphWindow = useMemo(() => {
    if (showLoadSceneGraphWindow) {
      return (
        <LoadSceneGraphDialog
          onClose={() => setShowLoadSceneGraphWindow(false)}
          onSelect={handleSetSceneGraph}
          handleLoadSceneGraph={handleLoadSceneGraph}
        />
      );
    }
    return null;
  }, [
    handleLoadSceneGraph,
    handleSetSceneGraph,
    setShowLoadSceneGraphWindow,
    showLoadSceneGraphWindow,
  ]);

  const maybeRenderSaveSceneGraphWindow = useMemo(() => {
    if (showSaveSceneGraphDialog) {
      return (
        <SaveSceneGraphDialog
          sceneGraph={currentSceneGraph}
          onClose={() => setShowSaveSceneGraphDialog(false)} // Ensure this closes the dialog
        />
      );
    }
    return null;
  }, [
    currentSceneGraph,
    setShowSaveSceneGraphDialog,
    showSaveSceneGraphDialog,
  ]);

  const maybeRenderYasgui = useMemo(() => {
    if (activeView !== "Yasgui") {
      return null;
    }

    return (
      <div
        id="yasgui"
        style={{
          position: "absolute",
          top: 0,
          width: "100%",
          height: "100%",
          zIndex: 10,
        }}
      >
        <YasguiPanel sceneGraph={currentSceneGraph} />
      </div>
    );
  }, [activeView, currentSceneGraph]);

  return (
    <AppContextProvider value={{ setEditingEntity, setJsonEditEntity }}>
      <div
        className={isDarkMode ? "dark-mode" : ""}
        style={{ margin: 0, padding: 0 }}
        onMouseMove={handleMouseMove}
      >
        <Workspace
          menuConfig={menuConfig}
          currentSceneGraph={currentSceneGraph}
          isDarkMode={isDarkMode}
          selectedSimulation={selectedSimulation}
          simulations={simulations}
          onViewChange={handleSetActiveView}
          onSelectResult={handleSelectResult}
          onSearchResult={handleSearchResult}
          onHighlight={handleHighlight}
          onApplyForceGraphConfig={handleApplyForceGraphConfig}
          applyNewLayout={applyNewLayout}
          renderLayoutModeRadio={renderLayoutModeRadio}
          showFilterWindow={() => setShowFilter(true)}
          showFilterManager={() => setShowFilterManager(true)}
          showPathAnalysis={() => setShowPathAnalysis(true)}
          renderNodeLegend={renderNodeLegend}
          renderEdgeLegend={renderEdgeLegend}
          showLoadSceneGraphWindow={() => setShowLoadSceneGraphWindow(true)}
          showSaveSceneGraphDialog={() => setShowSaveSceneGraphDialog(true)} // Pass the correct handler
          showLayoutManager={(mode: "save" | "load") =>
            setShowLayoutManager({ mode, show: true })
          }
          handleLoadLayout={handleLoadLayout}
          handleFitToView={handleFitToView}
          handleShowEntityTables={() => setShowEntityTables(true)}
        >
          {/* Main content */}
          <div style={{ height: "100%", position: "relative" }}>
            {maybeRenderGraphviz}
            {maybeRenderForceGraph3D}
            {maybeRenderReactFlow}
            {maybeRenderYasgui}
            {activeView === "Gallery" && (
              <ImageGalleryV3
                sceneGraph={currentSceneGraph}
                addRandomImageBoxes={false}
                defaultLinksEnabled={false}
              />
            )}
            {activeView in simulations && getSimulation(activeView)}
          </div>
        </Workspace>
        {maybeRenderSaveSceneGraphWindow}
        {getShowEntityDataCard() && getHoveredNodeIds().size > 0 && (
          <EntityDataDisplayCard
            entityData={currentSceneGraph
              .getGraph()
              .getNode(Array.from(getHoveredNodeIds())[0] as NodeId)}
          />
        )}
        {getSelectedNodeId() && forceGraphInstance.current && (
          <NodeDisplayCard
            nodeId={getSelectedNodeId()!}
            sceneGraph={currentSceneGraph}
            position={
              getNodeMousePosition(
                selectedGraphNode,
                forceGraphInstance.current
              )!
            }
            onNodeSelect={handleSelectResult}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            items={getContextMenuItems(contextMenu.nodeId)}
            onClose={() => setContextMenu(null)}
            isDarkMode={isDarkMode}
          />
        )}
        {isNodeEditorOpen && (
          <NodeEditorWizard
            sceneGraph={currentSceneGraph}
            nodeId={editingNodeId}
            isDarkMode={isDarkMode}
            onClose={() => {
              setIsNodeEditorOpen(false);
              setEditingNodeId(null);
            }}
            onSubmit={(nodeId: NodeId | null, data: NodeDataArgs) => {
              if (nodeId) {
                handleEditNodeSubmit(nodeId, data);
              } else {
                handleCreateNodeSubmit(data);
              }
            }}
          />
        )}
        {maybeRenderLoadSceneGraphWindow}
        {pathAnalysisWizard}
        {showEntityTables && (
          <EntityTabDialog
            nodes={currentSceneGraph.getGraph().getNodes()}
            edges={currentSceneGraph.getGraph().getEdges()}
            sceneGraph={currentSceneGraph}
            entityCache={currentSceneGraph.getEntityCache()}
            onClose={() => setShowEntityTables(false)}
            onNodeClick={(nodeId) => {
              setSelectedNodeId(nodeId as NodeId);
              setShowEntityTables(false);
              if (activeView === "ForceGraph3d" && forceGraphInstance.current) {
                const node = forceGraphInstance.current
                  .graphData()
                  .nodes.find((n) => n.id === nodeId);
                if (node) {
                  flyToNode(forceGraphInstance.current, node);
                }
              }
            }}
            isDarkMode={isDarkMode}
          />
        )}
        {editingEntity && (
          <div className="overlay">
            <NodeEditorWizard
              nodeId={editingEntity.getId() as NodeId}
              sceneGraph={currentSceneGraph}
              isDarkMode={isDarkMode}
              onClose={() => setEditingEntity(null)}
              onSubmit={(nodeId: NodeId | null, data: NodeDataArgs) => {
                if (nodeId) {
                  handleEditNodeSubmit(nodeId, data);
                }
              }}
            />
          </div>
        )}
        {jsonEditEntity && (
          <div className="overlay">
            <EntityJsonEditorDialog
              entityData={jsonEditEntity.getData()}
              onSave={handleJsonEditSave}
              onClose={() => setJsonEditEntity(null)}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
        {showLayoutManager.show && (
          <LayoutManager
            sceneGraph={currentSceneGraph}
            onClose={() => setShowLayoutManager({ mode: "save", show: false })}
            onLayoutLoad={handleLoadLayout}
            isDarkMode={isDarkMode}
            mode={showLayoutManager.mode}
          />
        )}
        {showFilter && (
          <FilterWindow
            sceneGraph={currentSceneGraph}
            onClose={() => setShowFilter(false)}
            onApplyFilter={(selectedIds) => {
              handleSetVisibleNodes(selectedIds);
              setShowFilter(false);
            }}
            isDarkMode={isDarkMode}
          />
        )}
        {showFilterManager && (
          <FilterManager
            sceneGraph={currentSceneGraph}
            onClose={() => setShowFilterManager(false)}
            onFilterLoad={handleLoadFilter}
            isDarkMode={isDarkMode}
          />
        )}
        {showSceneGraphDetailView.show && (
          <SceneGraphDetailView
            sceneGraph={currentSceneGraph}
            readOnly={showSceneGraphDetailView.readOnly}
            onClose={() =>
              setShowSceneGraphDetailView({ show: false, readOnly: true })
            }
            darkMode={isDarkMode}
          />
        )}
      </div>
    </AppContextProvider>
  );
};

interface AppProps {
  defaultGraph?: string;
  svgUrl?: string;
  defaultActiveView?: string;
  defaultActiveLayout?: string;
}

const App: React.FC<AppProps> = ({
  defaultGraph,
  svgUrl,
  defaultActiveView,
  defaultActiveLayout,
}) => {
  return (
    <MousePositionProvider>
      <AppContent
        defaultGraph={defaultGraph}
        svgUrl={svgUrl}
        defaultActiveView={defaultActiveView}
        defaultActiveLayout={defaultActiveLayout}
      />
    </MousePositionProvider>
  );
};

export default App;
