import { Position } from "@xyflow/react";
import React, {
  JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./App.css";
import { AppConfig, DEFAULT_APP_CONFIG } from "./AppConfig";
import PathAnalysisWizard, {
  IPathArgs,
} from "./components/analysis/PathAnalysisWizard";
import ContextMenu, { ContextMenuItem } from "./components/common/ContextMenu";
import EntityDataDisplayCard from "./components/common/EntityDataDisplayCard";
import EntityJsonEditorDialog from "./components/common/EntityJsonEditorDialog";
import EntityTabDialog from "./components/common/EntityTabDialog";
import { GraphEntityType } from "./components/common/GraphSearch";
import Legend from "./components/common/Legend";
import LegendModeRadio from "./components/common/LegendModeRadio";
import FilterManager from "./components/filters/FilterManager";
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
import ChatGptImporter from "./components/tools/ChatGptImporter";
import YasguiPanel from "./components/YasguiPanel";

import LoadSceneGraphDialog from "./components/common/LoadSceneGraphDialog";
import SaveSceneGraphDialog from "./components/common/SaveSceneGraphDialog";
import LegendManager from "./components/LegendManager";
import LexicalEditorV2 from "./components/LexicalEditor";
import NodeDocumentEditor from "./components/NodeDocumentEditor";
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
  updateNodePositions,
  zoomToFit,
} from "./core/force-graph/createForceGraph";
import { syncMissingNodesAndEdgesInForceGraph } from "./core/force-graph/forceGraphHelpers";
import { ForceGraphManager } from "./core/force-graph/ForceGraphManager";
import { enableZoomAndPanOnSvg } from "./core/graphviz/appHelpers";
import {
  Compute_Layout,
  LayoutEngineOption,
  LayoutEngineOptionLabels,
  PresetLayoutType,
} from "./core/layouts/LayoutEngine";
import { NodePositionData } from "./core/layouts/layoutHelpers";
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
import { persistentStore } from "./core/storage/PersistentStoreManager";
import { flyToNode } from "./core/webgl/webglHelpers";
import {
  getAllDemoSceneGraphKeys,
  getSceneGraph,
} from "./data/DemoSceneGraphs";
import { extractPositionsFromNodes } from "./data/graphs/blobMesh";
import { bfsQuery, processYasguiResults } from "./helpers/yasguiHelpers";
import { fetchSvgSceneGraph } from "./hooks/useSvgSceneGraph";
import AudioAnnotator from "./mp3/AudioAnnotator";
import { Filter, loadFiltersFromSceneGraph } from "./store/activeFilterStore";
import useActiveLayoutStore, {
  getActiveLayoutResult,
  getLayoutByName,
  getSavedLayouts,
  loadLayoutsFromSceneGraph,
  setCurrentLayoutResult,
} from "./store/activeLayoutStore";
import useActiveLegendConfigStore, {
  setEdgeKeyColor,
  setEdgeKeyVisibility,
  setEdgeLegendConfig,
  SetNodeAndEdgeLegendsForOnlyVisibleEntities,
  setNodeKeyColor,
  setNodeKeyOpacity,
  setNodeKeyVisibility,
  setNodeLegendConfig,
} from "./store/activeLegendConfigStore";
import useAppConfigStore, {
  getActiveView,
  getForceGraphInstance,
  getLegendMode,
  getPreviousView,
  setActiveLayout,
  setActiveProjectId,
  setAppConfig,
} from "./store/appConfigStore";
import useDialogStore from "./store/dialogStore";
import {
  loadDocumentsFromSceneGraph,
  useActiveDocument,
  useDocumentStore,
} from "./store/documentStore";
import { IForceGraphRenderConfig } from "./store/forceGraphConfigStore";
import useGraphInteractionStore, {
  clearSelections,
  getHoveredNodeIds,
  getSelectedNodeId,
  selectEdgeIdsByTag,
  selectEdgeIdsByType,
  selectNodeIdsByType,
  selectNodesIdsByTag,
  setHoveredEdgeIds,
  setHoveredNodeId,
  setHoveredNodeIds,
  setSelectedNodeId,
} from "./store/graphInteractionStore";
import { addNotification } from "./store/notificationStore";
import useWorkspaceConfigStore, {
  getLeftSidebarConfig,
  getRightSidebarConfig,
  setLeftActiveSection,
  setLeftSidebarConfig,
  setRightActiveSection,
  setRightSidebarConfig,
} from "./store/workspaceConfigStore";

// Import the persistent store

// main();

// initialize shared llm client
// getSharedLLMClient(); // brittle because of cache.add() failing

export type ObjectOf<T> = { [key: string]: T };

const getSimulations = (
  sceneGraph: SceneGraph
): ObjectOf<React.JSX.Element> => {
  return {
    Lexical: <LexicalEditorV2 />,
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
  | "Yasgui" // Add new view type
  | "Editor"; // Add new view type

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
    // showLayoutManager,
    showSceneGraphDetailView,
  } = useDialogStore();

  const {
    forceGraph3dOptions,
    activeView,
    setActiveView,
    getShowEntityDataCard,
    activeSceneGraph,
    legendMode,
    setLegendMode,
    currentSceneGraph,
    setCurrentSceneGraph,
    forceGraphInstance,
    setForceGraphInstance,
    reactFlowInstance,
    setReactFlowInstance,
  } = useAppConfigStore();

  const { showToolbar } = useWorkspaceConfigStore();
  const {
    nodeLegendConfig,
    edgeLegendConfig,
    nodeLegendUpdateTime,
    edgeLegendUpdateTime,
  } = useActiveLegendConfigStore();

  const { selectedNodeIds, selectedEdgeIds } = useGraphInteractionStore();

  const { activeFilter, setActiveFilter } = useAppConfigStore();

  const { currentLayoutResult } = useActiveLayoutStore();

  const graphvizRef = useRef<HTMLDivElement | null>(null);
  const forceGraphRef = useRef<HTMLDivElement | null>(null);
  const reactFlowRef = useRef<HTMLDivElement | null>(null);
  // const forceGraphInstance = useRef<ForceGraph3DInstance | null>(null);
  // const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // eslint-disable-next-line unused-imports/no-unused-vars
  const { mousePosition, setMousePosition } = useMousePosition();

  const activeDocument = useActiveDocument();
  const { setActiveDocument } = useDocumentStore();

  const clearUrlOfQueryParams = useCallback(() => {
    const url = new URL(window.location.href);
    window.history.pushState({}, "", url.toString());
  }, []);

  const clearGraphFromUrl = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("graph");
    window.history.pushState({}, "", url.toString());
  }, []);

  const [simulations, setSimulations] = useState<{
    [key: string]: JSX.Element;
  }>({});

  const [showFilter, setShowFilter] = useState(false);
  const [showFilterManager, setShowFilterManager] = useState(false);

  const [showChatGptImporter, setShowChatGptImporter] = useState(false);

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

  const [selectedSimulation, setSelectedSimulation] =
    useState<string>("Lumina");

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
      if (activeView === "ReactFlow" && reactFlowInstance) {
        setTimeout(() => {
          reactFlowInstance.fitView({ padding, duration });
        }, 0);
      }
    },
    [activeView, reactFlowInstance]
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
      setActiveLayout(defaultActiveLayout as LayoutEngineOption);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultGraph, svgUrl, defaultActiveView, defaultActiveLayout]);

  useEffect(() => {
    if (activeView === "ReactFlow" && reactFlowInstance) {
      if (getPreviousView() !== "Editor") {
        handleReactFlowFitView();
      }
    }
  }, [
    nodeLegendConfig,
    edgeLegendConfig,
    activeView,
    handleReactFlowFitView,
    reactFlowInstance,
  ]);

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
          if (forceGraphInstance) {
            forceGraphInstance.nodeColor(forceGraphInstance.nodeColor());
          }
        } else {
          return;
        }
      },
    [currentSceneGraph, forceGraphInstance, legendMode]
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
    (filter: Filter) => {
      DisplayManager.applyVisibilityFromFilterRulesToGraph(
        currentSceneGraph.getGraph(),
        filter.filterRules
      );
      SetNodeAndEdgeLegendsForOnlyVisibleEntities(
        currentSceneGraph,
        legendMode,
        filter.filterRules
      );
      setActiveFilter(filter);
    },
    [currentSceneGraph, legendMode, setActiveFilter]
  );

  const handleSetVisibleNodes = useCallback(
    (nodeIds: string[]) => {
      handleSetActiveFilterPreset({
        name: "node id selection",
        filterRules: [
          {
            id: "node id selection",
            operator: "include",
            ruleMode: "entities",
            conditions: {
              nodes: nodeIds,
            },
          },
        ],
      });
    },
    [handleSetActiveFilterPreset]
  );

  let isComputing = false;
  const safeComputeLayout = useCallback(
    async (
      sceneGraph: SceneGraph,
      layout: LayoutEngineOption | string | null
    ) => {
      // Get layout result directly from store when needed
      if (Object.keys(getSavedLayouts()).includes(layout as string)) {
        console.log("Skipping layout computation for saved layout", layout);
        currentSceneGraph.setNodePositions(
          getLayoutByName(layout as string).positions
        );
        setCurrentLayoutResult({
          layoutType: layout!,
          positions: getLayoutByName(layout as string).positions,
        });
        return;
      }
      if (
        layout != null &&
        !LayoutEngineOptionLabels.includes(layout as LayoutEngineOption)
      ) {
        console.error("Invalid layout option", layout);
      }

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
        setCurrentLayoutResult({ positions, layoutType: layout });
        isComputing = false;
        return;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      isComputing = true;
      const output = await Compute_Layout(
        sceneGraph,
        (layout ?? DEFAULT_APP_CONFIG().activeLayout) as LayoutEngineOption
      );
      if (!output) {
        isComputing = false;
        addNotification({
          message: "Layout computation cancelled",
          type: "error",
          duration: 3000,
        });
        return;
        // throw new Error(`Failed to compute layout for ${layout}`);
      }
      sceneGraph.getDisplayConfig().nodePositions = output.positions;
      // Turn off svg generation for now
      // if (!output.svg) {
      //   console.log("Generating svg from graphviz");
      //   const g = ConvertSceneGraphToGraphviz(
      //     sceneGraph.getGraph(),
      //     {
      //       ...sceneGraph.getDisplayConfig(),
      //       nodePositions: fitToRect(50, 50, output.positions),
      //     },
      //     (layout ?? DEFAULT_APP_CONFIG().activeLayout) as LayoutEngineOption
      //   );
      //   const dot = toDot(g);
      //   const graphviz = await Graphviz.load();
      //   const svg = await graphviz.layout(dot, "svg");
      //   output.svg = svg;
      // }
      sceneGraph.getDisplayConfig().svg = output.svg;
      setCurrentLayoutResult(output);
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
      const newNode = currentSceneGraph.getGraph().createNode(newNodeData);
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
      if (forceGraphInstance) {
        forceGraphInstance.refresh();
      }
      setEditingNodeId(null);
      currentSceneGraph.notifyGraphChanged();
    },
    [currentSceneGraph, forceGraphInstance]
  );

  const initializeForceGraph = useCallback(() => {
    console.log(
      "Creating new force graph instance...",
      currentSceneGraph.getDisplayConfig().nodePositions ??
        getActiveLayoutResult()?.positions,
      forceGraph3dOptions.layout
    );
    const newInstance = createForceGraph(
      currentSceneGraph,
      forceGraphRef.current!,
      currentSceneGraph.getDisplayConfig().nodePositions,
      currentSceneGraph.getForceGraphRenderConfig(),
      forceGraph3dOptions.layout
    );
    setForceGraphInstance(newInstance);
    bindEventsToGraphInstance(
      newInstance,
      currentSceneGraph,
      handleNodeRightClick,
      handleBackgroundRightClick
    );

    newInstance?.onEngineTick(() => {
      zoomToFit(newInstance!, 0);
    });

    setTimeout(() => {
      newInstance?.onEngineTick(() => {});
    }, 800);
  }, [
    currentSceneGraph,
    forceGraph3dOptions.layout,
    setForceGraphInstance,
    handleNodeRightClick,
    handleBackgroundRightClick,
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
      loadDocumentsFromSceneGraph(graph); // clears existing store, and loads in new documents
      loadFiltersFromSceneGraph(graph);
      loadLayoutsFromSceneGraph(graph);
      if (clearQueryParams) {
        clearUrlOfQueryParams();
        clearGraphFromUrl();
      }
      clearSelections();
      safeComputeLayout(
        graph,
        graph.getData().defaultAppConfig?.activeLayout ?? null
      ).then(() => {
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
            if (forceGraphInstance) {
              syncMissingNodesAndEdgesInForceGraph(forceGraphInstance, graph);
            }
            handleDisplayConfigChanged(graph.getDisplayConfig());
            setGraphModelUpdateTime(Date.now());
          },
        });

        // DEV LOGIC
        // graph.getEntityCache().addEntities(songAnnotation247_2_entities);
        // graph.getEntityCache().addEntities(IMAGE_ANNOTATION_ENTITIES());

        setActiveFilter(graph.getData().defaultAppConfig?.activeFilter ?? null);

        if (graph.getData()?.defaultAppConfig?.workspaceConfig) {
          setLeftSidebarConfig(
            graph.getData()!.defaultAppConfig!.workspaceConfig!
              .leftSidebarConfig
          );
          setLeftActiveSection(getLeftSidebarConfig().activeSectionId);
          setRightSidebarConfig(
            graph.getData()!.defaultAppConfig!.workspaceConfig!
              .rightSidebarConfig
          );
          setRightActiveSection(getRightSidebarConfig().activeSectionId);
        }

        const tock = Date.now();
        console.log("TOTAL TIME", tock - tick);
        addNotification({
          message: `Loaded SceneGraph: ${graph.getMetadata().name}`,
          type: "success",
          groupId: "load-scene-graph",
        });
      });
    },
    [
      clearGraphFromUrl,
      clearUrlOfQueryParams,
      forceGraphInstance,
      handleDisplayConfigChanged,
      safeComputeLayout,
      setActiveFilter,
      setCurrentSceneGraph,
      setLegendMode,
    ]
  );

  const handleSetSceneGraph = useCallback(
    async (key: string, clearUrlOfQueryParams: boolean = true) => {
      // First try to load from persistent store
      try {
        const persistedGraph = await persistentStore.loadSceneGraph(key);
        if (persistedGraph) {
          handleLoadSceneGraph(persistedGraph, clearUrlOfQueryParams);
          setActiveProjectId(key); // Set the active project ID

          // Update the URL query parameter
          const url = new URL(window.location.href);
          url.searchParams.set("graph", key);
          url.searchParams.delete("svgUrl");
          window.history.pushState({}, "", url.toString());
          return;
        }
      } catch (err) {
        console.log(
          `Key not found in persistent store, checking demo graphs ${err}`
        );
      }

      // Fall back to demo graphs if not in persistent store
      try {
        const graphGenerator = getSceneGraph(key);
        let graph: SceneGraph;
        if (typeof graphGenerator === "function") {
          graph = await graphGenerator();
        } else {
          graph = graphGenerator;
        }

        handleLoadSceneGraph(graph, clearUrlOfQueryParams);
        setActiveProjectId(null); // Clear project ID since this is a demo graph

        // Update the URL query parameter
        const url = new URL(window.location.href);
        url.searchParams.set("graph", key);
        url.searchParams.delete("svgUrl");
        window.history.pushState({}, "", url.toString());
        // eslint-disable-next-line unused-imports/no-unused-vars
      } catch (err) {
        console.error(`Graph ${key} not found`);
        console.log(`Available graphs are: ${getAllDemoSceneGraphKeys()}`);
        handleLoadSceneGraph(new SceneGraph(), true);
        return;
      }
    },
    [handleLoadSceneGraph]
  );

  // useEffect(() => {
  //   // Hide scrollbar
  //   document.body.style.overflow = "hidden";
  // }, []);

  const getSimulation = useCallback(
    (key: string): JSX.Element | undefined => {
      if (key in simulations) {
        return simulations[key];
      }
      return undefined;
    },
    [simulations]
  );

  const graphvizFitToView = useCallback((element: HTMLDivElement) => {
    enableZoomAndPanOnSvg(element);
  }, []);

  const handleFitToView = useCallback(
    (activeView: string, duration: number = 0) => {
      if (activeView === "Graphviz" && graphvizRef.current) {
        graphvizFitToView(graphvizRef.current);
      } else if (activeView === "ForceGraph3d" && forceGraphInstance) {
        zoomToFit(forceGraphInstance!, duration);
      } else if (activeView === "ReactFlow" && reactFlowInstance) {
        handleReactFlowFitView(0.1, duration);
        // reactFlowInstance.current.fitView({ padding: 0.1, duration: 400 });
      }
    },
    [
      forceGraphInstance,
      graphvizFitToView,
      handleReactFlowFitView,
      reactFlowInstance,
    ]
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

    const onLegendLabelSelected =
      legendMode === "type" ? selectNodeIdsByType : selectNodesIdsByTag;

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
        onLabelSelected={onLegendLabelSelected}
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

    const onLegendLabelSelected =
      legendMode === "type" ? selectEdgeIdsByType : selectEdgeIdsByTag;

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
        onLabelSelected={onLegendLabelSelected}
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
      console.log("Setting active view", key);
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

  const [pathAnalysisConfig, setPathAnalysisConfig] = useState<
    IPathArgs | undefined
  >(undefined);
  const [editingNodeId, setEditingNodeId] = useState<NodeId | null>(null);

  // const handleLoadLayout = useCallback(
  //   (layout: Layout) => {
  //     // Add safety check to ensure positions exist
  //     if (!layout || !layout.positions) {
  //       console.warn("Cannot load layout: missing position data");
  //       addNotification({
  //         message: "Failed to apply layout: missing position data",
  //         type: "error",
  //         duration: 3000,
  //       });
  //       return;
  //     }

  //     currentSceneGraph.setNodePositions(layout.positions);
  //     DisplayManager.applyNodePositions(
  //       currentSceneGraph.getGraph(),
  //       layout.positions
  //     );
  //     setCurrentLayoutResult({
  //       positions: layout.positions,
  //       layoutType: layout.name,
  //     });
  //     if (forceGraphInstance && activeView === "ForceGraph3d") {
  //       updateNodePositions(forceGraphInstance, layout.positions);
  //     } else if (activeView === "ReactFlow") {
  //       setGraphModelUpdateTime(Date.now()); //hack
  //     }
  //   },
  //   [currentSceneGraph, forceGraphInstance, activeView]
  // );

  const [showLegendManager, setShowLegendManager] = useState(false); // State for LegendManager

  const menuConfigInstance = useMemo(() => {
    const menuConfigCallbacks: IMenuConfigCallbacks = {
      GraphMenuActions,
      SimulationMenuActions,
      setShowNodeTable: setShowEntityTables,
      setShowEdgeTable: setShowEntityTables,
      showLayoutManager: (mode: "save" | "load") =>
        setShowLayoutManager({ mode, show: true }),
      showFilterWindow: () => setShowFilter(true),
      showSceneGraphDetailView: (readOnly: boolean) => {
        setShowSceneGraphDetailView({ show: true, readOnly });
      },
      showChatGptImporter: () => setShowChatGptImporter(true),
      handleImportConfig,
      handleFitToView,
      showLegendManager: () => setShowLegendManager(true), // Add callback
    };
    return new MenuConfig(
      menuConfigCallbacks,
      currentSceneGraph,
      forceGraphInstance
    );
  }, [
    GraphMenuActions,
    SimulationMenuActions,
    currentSceneGraph,
    forceGraphInstance,
    handleFitToView,
    handleImportConfig,
    setShowEntityTables,
    setShowLayoutManager,
    setShowSceneGraphDetailView,
    setShowLegendManager,
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
    if (!(activeView === "ReactFlow" || activeView === "Editor")) {
      return null;
    }

    if (currentSceneGraph.getDisplayConfig().nodePositions === undefined) {
      console.log("Cannot render nodes without positions");
      return;
    }

    const data = exportGraphDataForReactFlow(currentSceneGraph);
    const activeLayoutResult = getActiveLayoutResult();
    const nodePositions = activeLayoutResult?.positions || {};

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
          if (activeLayoutResult) {
            activeLayoutResult.positions[node.id] = {
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
            if (reactFlowInstance !== instance) {
              setReactFlowInstance(instance);
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
              if (activeLayoutResult) {
                activeLayoutResult.positions[node.id] = {
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
    currentSceneGraph,
    currentLayoutResult,
    nodeLegendConfig,
    edgeLegendConfig,
    legendMode,
    reactFlowInstance,
    setReactFlowInstance,
    handleReactFlowFitView,
    handleNodeRightClick,
    handleBackgroundRightClick,
    graphModelUpdateTime,
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
    if (activeView === "ForceGraph3d" || activeView === "Editor") {
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
            visibility: activeView === "Editor" ? "hidden" : "visible", // Hide but keep in DOM when in Editor view
          }}
        />
      );
    }
    return null;
  }, [activeView, showToolbar]);

  const _handleUpdateForceGraphScene = useCallback(
    (sceneGraph: SceneGraph) => {
      if (!forceGraphInstance) {
        throw new Error("ForceGraphInstance is undefined");
      }
      if (!sceneGraph.getDisplayConfig().nodePositions) {
        throw new Error("Node positions are undefined");
      }
      console.log("Updating existing force graph instance");
      updateNodePositions(
        forceGraphInstance,
        sceneGraph.getDisplayConfig().nodePositions!
      );
      zoomToFit(forceGraphInstance);
    },
    [forceGraphInstance]
  );

  useEffect(() => {
    if (activeView === "ForceGraph3d" && forceGraphInstance) {
      ForceGraphManager.refreshForceGraphInstance(
        forceGraphInstance,
        currentSceneGraph,
        forceGraph3dOptions.layout
      );
    }
  }, [
    nodeLegendUpdateTime,
    edgeLegendUpdateTime,
    activeView,
    forceGraph3dOptions.layout,
    activeFilter,
    currentSceneGraph,
    forceGraphInstance,
    selectedNodeIds,
    selectedEdgeIds,
  ]);

  useEffect(() => {
    if (activeView === "Editor") {
      return;
    }
    if (getPreviousView() !== "Editor" && activeView === "ForceGraph3d") {
      console.log("previous view was ", getPreviousView());
      console.log("active view history Reinitializing");
      initializeForceGraph();
    }

    return () => {
      if (
        getActiveView() !== "Editor" &&
        getForceGraphInstance() &&
        getActiveView() !== "ForceGraph3d"
      ) {
        console.log("destructor called");
        getForceGraphInstance()?._destructor();
        setForceGraphInstance(null);
      }
    };
  }, [
    activeView,
    currentLayoutResult,
    initializeForceGraph,
    setForceGraphInstance,
  ]);

  useEffect(() => {
    if (
      forceGraphInstance &&
      currentLayoutResult &&
      Object.keys(currentLayoutResult.positions).length > 0 &&
      forceGraph3dOptions.layout === "Layout"
    ) {
      ForceGraphManager.applyFixedNodePositions(
        forceGraphInstance,
        currentLayoutResult.positions
      );
      zoomToFit(forceGraphInstance);
      console.log(
        "triggered",
        currentLayoutResult.layoutType,
        currentLayoutResult
      );
    } else if (graphvizRef.current && currentLayoutResult) {
      graphvizRef.current.innerHTML = currentLayoutResult.svg ?? "";
      enableZoomAndPanOnSvg(graphvizRef.current);
      graphvizFitToView(graphvizRef.current);
    }
    // const url = new URL(window.location.href);
    // url.searchParams.set("layout", layoutResult?.layoutType as string);
    // window.history.pushState({}, "", url.toString());
  }, [
    forceGraphInstance,
    currentLayoutResult, // Use this to trigger the effect when the layout result changes
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
      if (activeView === "ForceGraph3d" && forceGraphInstance) {
        forceGraphInstance.cameraPosition({
          x: forceGraphInstance.getGraphBbox().x[0],
          y: forceGraphInstance.getGraphBbox().y[0],
          z: 1000,
        });
        forceGraphInstance.nodeColor((node: any) =>
          node.id === nodeId ? "#ff0000" : node.__baseColor || "#ffffff"
        );
      }
    },
    [activeView, forceGraphInstance]
  );

  const zoomToNode = useCallback(
    (nodeId: string) => {
      if (reactFlowInstance) {
        const node = reactFlowInstance.getNode(nodeId);
        if (node) {
          reactFlowInstance.fitView({
            nodes: [{ id: nodeId }],
            duration: 800,
            padding: 4,
          });
          setSelectedNodeId(nodeId as NodeId);
        }
      }
    },
    [reactFlowInstance]
  );

  const handleSelectResult = useCallback(
    (nodeId: NodeId | string) => {
      if (activeView === "ReactFlow") {
        zoomToNode(nodeId); // Call zoomToNode for ReactFlow
      } else if (activeView === "ForceGraph3d" && forceGraphInstance) {
        const node = forceGraphInstance
          .graphData()
          .nodes.find((node) => node.id === nodeId);
        if (node) {
          flyToNode(forceGraphInstance, node);
          handleHighlight(nodeId);
          setSelectedNodeId(nodeId as NodeId);
          // setRightActiveSection("node-details");
        }
      }
    },
    [activeView, forceGraphInstance, handleHighlight, zoomToNode]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (activeView === "ForceGraph3d" && forceGraphInstance) {
        setMousePosition({ x: event.clientX, y: event.clientY });
      }
    },
    [activeView, forceGraphInstance, setMousePosition]
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
      if (forceGraphInstance) {
        ForceGraphManager.applyForceGraphRenderConfig(
          forceGraphInstance,
          config,
          currentSceneGraph
        );
      }
    },
    [currentSceneGraph, forceGraphInstance]
  );

  const _handleApplyPositionsToForceGraph = useCallback(
    (positions: NodePositionData) => {
      if (forceGraphInstance) {
        ForceGraphManager.applyFixedNodePositions(
          forceGraphInstance,
          positions
        );
      }
    },
    [forceGraphInstance]
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
          if (forceGraphInstance) {
            const node = forceGraphInstance
              .graphData()
              .nodes.find((n) => n.id === nodeId);
            if (node) {
              flyToNode(forceGraphInstance, node);
            }
          }
        },
      },
      {
        label: "Expand around Node",
        action: () => {
          if (forceGraphInstance) {
            attachRepulsiveForce(forceGraphInstance, nodeId);
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
    [currentSceneGraph, forceGraphInstance, setShowPathAnalysis]
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
    (preset: Filter) => {
      DisplayManager.applyVisibilityFromFilterRulesToGraph(
        currentSceneGraph.getGraph(),
        preset.filterRules
      );
      SetNodeAndEdgeLegendsForOnlyVisibleEntities(
        currentSceneGraph,
        legendMode,
        preset.filterRules
      );
      setShowFilterManager(false);
      setActiveFilter({ name: preset.name, filterRules: preset.filterRules });
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

  const maybeRenderNodeDocumentEditor = () => {
    // Return nothing if not in Editor view or no active document
    if (!getSelectedNodeId()) {
      return null;
    }
    if (activeView !== "Editor" || !activeDocument) {
      return null;
    }

    const previousView = useDocumentStore.getState().previousView;

    return (
      <div className="document-editor-overlay">
        <NodeDocumentEditor
          nodeId={getSelectedNodeId()!}
          onClose={() => {
            // Return to the previously stored view
            setActiveView(previousView || "ForceGraph3d");
            setActiveDocument(null);
          }}
        />
      </div>
    );
  };

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
          handleFitToView={handleFitToView}
          handleShowEntityTables={() => setShowEntityTables(true)}
          handleLoadSceneGraph={handleLoadSceneGraph}
          handleSetActiveFilter={handleSetActiveFilterPreset}
        >
          {/* Main content */}
          <div style={{ height: "100%", position: "relative" }}>
            {maybeRenderGraphviz}
            {maybeRenderForceGraph3D}
            {maybeRenderReactFlow}
            {maybeRenderYasgui}
            {maybeRenderNodeDocumentEditor()}
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
        {showLegendManager && (
          <LegendManager
            sceneGraph={currentSceneGraph}
            nodeLegendConfig={nodeLegendConfig}
            edgeLegendConfig={edgeLegendConfig}
            onNodeLegendChange={(key, color) => setNodeKeyColor(key as NodeId, color)}
            onEdgeLegendChange={(key, color) => setEdgeKeyColor(key as EdgeId, color)}
            onNodeVisibilityChange={(key, isVisible) =>
              setNodeKeyVisibility(key as NodeId, isVisible)
            }
            onEdgeVisibilityChange={(key, isVisible) =>
              setEdgeKeyVisibility(key as EdgeId, isVisible)
            }
            onNodeOpacityChange={(key, opacity) => {
              setNodeKeyOpacity(key as NodeId, opacity);
            }}
            onEdgeOpacityChange={(key, opacity) => {
              const newConfig = { ...edgeLegendConfig };
              newConfig[key].opacity = opacity;
              setEdgeLegendConfig(newConfig);
            }}
            onClose={() => setShowLegendManager(false)}
            isDarkMode={isDarkMode}
            onAddNewType={(type, color) => {
              const newConfig = { ...nodeLegendConfig };
              newConfig[type] = { 
                color, 
                isVisible: true,
                opacity: 1 
              };
              setNodeLegendConfig(newConfig);
              
              // Update display config
              const displayConfig = currentSceneGraph.getDisplayConfig();
              displayConfig.nodeConfig.types[type] = { 
                color, 
                isVisible: true,
                opacity: 1 
              };
              currentSceneGraph.setDisplayConfig(displayConfig);
            }}
            onAddNewTag={(tag, color) => {
              const newConfig = { ...nodeLegendConfig };
              newConfig[tag] = { 
                color, 
                isVisible: true,
                opacity: 1 
              };
              setNodeLegendConfig(newConfig);
              
              // Update display config
              const displayConfig = currentSceneGraph.getDisplayConfig();
              displayConfig.nodeConfig.tags[tag] = { 
                color, 
                isVisible: true,
                opacity: 1 
              };
              currentSceneGraph.setDisplayConfig(displayConfig);
            }}
          />
        )}
        {showSaveSceneGraphDialog && (
          <SaveSceneGraphDialog
            sceneGraph={currentSceneGraph}
            onClose={() => setShowSaveSceneGraphDialog(false)}
          />
        )}
        {getShowEntityDataCard() && getHoveredNodeIds().size > 0 && (
          <EntityDataDisplayCard
            entityData={currentSceneGraph
              .getGraph()
              .getNode(Array.from(getHoveredNodeIds())[0] as NodeId)}
          />
        )}
        {/* {getSelectedNodeId() && forceGraphInstance && (
          <NodeDisplayCard
            nodeId={getSelectedNodeId()!}
            sceneGraph={currentSceneGraph}
            position={
              getNodeMousePosition(
                selectedGraphNode,
                forceGraphInstance
              )!
            }
            onNodeSelect={handleSelectResult}
            onClose={() => setSelectedNodeId(null)}
          />
        )} */}
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
              // setRightActiveSection("node-details");
              setShowEntityTables(false);
              if (activeView === "ForceGraph3d" && forceGraphInstance) {
                const node = forceGraphInstance
                  .graphData()
                  .nodes.find((n) => n.id === nodeId);
                if (node) {
                  flyToNode(forceGraphInstance, node);
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
        {/* {showLayoutManager.show && (
          <LayoutManager
            sceneGraph={currentSceneGraph}
            onClose={() => setShowLayoutManager({ mode: "save", show: false })}
            onLayoutLoad={handleLoadLayout}
            isDarkMode={isDarkMode}
            mode={showLayoutManager.mode}
          />
        )} */}
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
        {showChatGptImporter && (
          <div className="overlay">
            <ChatGptImporter
              onClose={() => setShowChatGptImporter(false)}
              isDarkMode={isDarkMode}
            />
          </div>
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

import { LayoutComputationDialog } from "./components/dialogs/LayoutComputationDialog";

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
      <LayoutComputationDialog />
    </MousePositionProvider>
  );
};

export default App;
