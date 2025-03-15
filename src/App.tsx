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
import { FaExpand } from "react-icons/fa";
import { toDot } from "ts-graphviz";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import {
  AppConfig,
  DEFAULT_APP_CONFIG,
  ForceGraph3dLayoutMode,
} from "./AppConfig";
import PathAnalysisWizard, {
  IPathArgs,
} from "./components/analysis/PathAnalysisWizard";
import ContextMenu, { ContextMenuItem } from "./components/common/ContextMenu";
import EntityDataDisplayCard from "./components/common/EntityDataDisplayCard";
import EntityJsonEditorDialog from "./components/common/EntityJsonEditorDialog";
import EntityTabDialog from "./components/common/EntityTabDialog";
import GraphLayoutToolbar from "./components/common/GraphLayoutToolbar";
import { GraphEntityType } from "./components/common/GraphSearch";
import LayoutManager from "./components/common/LayoutManager";
import LayoutModeRadio from "./components/common/LayoutModeRadio";
import Legend from "./components/common/Legend";
import NodeDisplayCard from "./components/common/NodeDisplayCard";
import FilterManager from "./components/filters/FilterManager";
import {
  FilterPreset,
  FilterRuleDefinition,
} from "./components/filters/FilterRuleDefinition";
import FilterWindow from "./components/filters/FilterWindow";
import ForceGraphLayoutRadio from "./components/force-graph/ForceGraphLayoutRadio";
import ForceGraphRenderConfigEditor from "./components/force-graph/ForceGraphRenderConfigEditor";
import ImageGalleryV2 from "./components/imageView/ImageGalleryV2";
import ImageGalleryV3 from "./components/imageView/ImageGalleryV3";
import ImportSvgFromUrlDialog from "./components/ImportSvgFromUrlDialog";
import ImageGallery from "./components/lumina/galleryTestbed/ImageGallery";
import ImageBoxCreator from "./components/lumina/ImageBoxCreator";
import Lumina from "./components/lumina/Lumina";
import { IMenuConfigCallbacks, MenuConfig } from "./components/MenuConfig";
import NodeEditorWizard from "./components/NodeEditorWizard";
import SceneGraphDetailView from "./components/SceneGraphDetailView";
import SceneGraphTitle from "./components/SceneGraphTitle";
import GravitySimulation3 from "./components/simulations/GravitySimulation3";
import ReactFlowPanel from "./components/simulations/ReactFlowPanel";
import UniAppToolbar from "./components/UniAppToolbar";
import YasguiPanel from "./components/YasguiPanel";
import { AppContextProvider } from "./context/AppContext";
import {
  MousePositionProvider,
  useMousePosition,
} from "./context/MousePositionContext";
import {
  DisplayConfig,
  RenderingConfig,
  RenderingManager__DisplayMode,
} from "./controllers/RenderingManager";
import {
  attachRepulsiveForce,
  bindEventsToGraphInstance,
  createForceGraph,
  getNodeMousePosition,
  IForceGraphRenderConfig,
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
import { deserializeDotToSceneGraph } from "./core/serializers/fromDot";
import { deserializeGraphmlToSceneGraph } from "./core/serializers/fromGraphml";
import { deserializeSvgToSceneGraph } from "./core/serializers/fromSvg";
import { deserializeSceneGraphFromJson } from "./core/serializers/toFromJson";
import { IMAGE_ANNOTATION_ENTITIES } from "./core/types/ImageAnnotation";
import { ImageBoxData } from "./core/types/ImageBoxData";
import { flyToNode } from "./core/webgl/webglHelpers";
import { extractPositionsFromNodes } from "./data/graphs/blobMesh";
import { demo_SceneGraph_SolvayConference } from "./data/graphs/Gallery_Demos/demo_SceneGraph_SolvayConference";
import { demo_SceneGraph_StackedImageGallery } from "./data/graphs/Gallery_Demos/demo_SceneGraph_StackedImageGallery";
import { getAllGraphs, sceneGraphs } from "./data/graphs/sceneGraphLib";
import { bfsQuery, processYasguiResults } from "./helpers/yasguiHelpers";
import { fetchSvgSceneGraph } from "./hooks/useSvgSceneGraph";
import AudioAnnotator from "./mp3/AudioAnnotator";

export type ObjectOf<T> = { [key: string]: T };

const imageBox: ImageBoxData = {
  id: "q0jo1k",
  label: "q0jo1k",
  type: "ImageBox",
  description: "",
  imageUrl: "./assets/image0.png",
  topLeft: {
    x: 0.17598908594815815,
    y: 0.6219218963165092,
  },
  bottomRight: {
    x: 0.7811689972714873,
    y: 0.13603342428376686,
  },
};

const getSimulations = (
  sceneGraph: SceneGraph
): ObjectOf<React.JSX.Element> => {
  return {
    ImageGalleryV3: (
      <ImageGalleryV3
        sceneGraph={demo_SceneGraph_SolvayConference()}
        // Pass initial scene graph but allow changing via dropdown
      />
    ),
    demo3: (
      <ImageGalleryV3 sceneGraph={demo_SceneGraph_StackedImageGallery()} />
    ),
    "ImageBox Creator": <ImageBoxCreator sceneGraph={sceneGraph} />,
    ImageGalleryV2: <ImageGalleryV2 />,
    // ParticleStickFigure: <ParticleStickFigure />,
    // SampleParticleEffect: <SampleParticleEffect />,
    // SolarSystem: <SolarSystem />,
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

export type AppInteractionConfig = {
  clickedNode: NodeId | null; // For display card
  mouseHoveredNode: string | null; // For highlighting
  selectedNodes: Set<string>; // For highlighting
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
  showOptionsPanel?: string;
  showLegendBars?: string;
  showGraphLayoutToolbar?: string;
  showRenderConfigOptions?: string;
  showToolbar?: string;
}> = ({
  defaultGraph,
  svgUrl,
  defaultActiveView,
  defaultActiveLayout,
  showOptionsPanel,
  showLegendBars,
  showGraphLayoutToolbar,
  showRenderConfigOptions,
  showToolbar,
}) => {
  const graphvizRef = useRef<HTMLDivElement | null>(null);
  const forceGraphRef = useRef<HTMLDivElement | null>(null);
  const reactFlowRef = useRef<HTMLDivElement | null>(null);
  const forceGraphInstance = useRef<ForceGraph3DInstance | null>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

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

  const [activeFilterPreset, setActiveFilterPreset] = useState<{
    preset: string | null;
    filterRules: FilterRuleDefinition[];
  } | null>(null);

  const [appInteractionConfig, setAppInteractionConfig] =
    useState<AppInteractionConfig>({
      clickedNode: null,
      mouseHoveredNode: null,
      selectedNodes: new Set(),
    });

  const getAppConfigWithUrlOverrides = useCallback((config: AppConfig) => {
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
        showOptionsPanel:
          showRenderConfigOptions !== undefined
            ? showRenderConfigOptions === "true"
            : config.forceGraph3dOptions.showOptionsPanel,
      },
      windows: {
        ...config.windows,
        showLegendBars:
          showLegendBars !== undefined
            ? showLegendBars === "true"
            : config.windows.showLegendBars,
        showGraphLayoutToolbar:
          showGraphLayoutToolbar !== undefined
            ? showGraphLayoutToolbar === "true"
            : config.windows.showGraphLayoutToolbar,
        showOptionsPanel:
          showOptionsPanel !== undefined
            ? showOptionsPanel === "true"
            : config.forceGraph3dOptions.showOptionsPanel,
      },
    };
  }, []);

  const handleSetAppConfig = useCallback(
    (config: AppConfig) => {
      setAppConfig(getAppConfigWithUrlOverrides(config));
      console.log("Set app config!", getAppConfigWithUrlOverrides(config));
    },
    [getAppConfigWithUrlOverrides]
  );

  const setSelectedNode = useCallback((nodeId: NodeId | null) => {
    setAppInteractionConfig((prevConfig) => ({
      ...prevConfig,
      clickedNode: nodeId,
    }));
  }, []);

  const setHoveredNode = useCallback((nodeId: string | null) => {
    setAppInteractionConfig((prevConfig) => ({
      ...prevConfig,
      mouseHoveredNode: nodeId,
    }));
  }, []);

  const setSelectedNodes = useCallback((nodeIds: string[]) => {
    setAppInteractionConfig((prevConfig) => ({
      ...prevConfig,
      selectedNodes: new Set(nodeIds),
    }));
  }, []);

  const setSelectedForceGraph3dLayoutMode = useCallback(
    (layout: ForceGraph3dLayoutMode) => {
      setAppConfig((prevConfig) => ({
        ...prevConfig,
        forceGraph3dOptions: {
          ...prevConfig.forceGraph3dOptions,
          layout: layout,
        },
      }));
    },
    []
  );

  const selectedNode = useMemo(() => {
    return appInteractionConfig.clickedNode;
  }, [appInteractionConfig]);

  const [layoutResult, setLayoutResult] =
    useState<ILayoutEngineResult | null>();

  const [appConfig, setAppConfig] = useState<AppConfig>({
    ...DEFAULT_APP_CONFIG(),
  });

  const activeLayout = useMemo(() => {
    return appConfig.activeLayout;
  }, [appConfig]);

  const [selectedSimulation, setSelectedSimulation] =
    useState<string>("Lumina");

  const [currentSceneGraph, setCurrentSceneGraph] =
    useState<SceneGraph>(initialSceneGraph);

  const [nodeConfig, setNodeConfig] = useState<DisplayConfig>(
    GetCurrentDisplayConfigOf(currentSceneGraph, "Node")
  );
  const [edgeConfig, setEdgeConfig] = useState<DisplayConfig>(
    GetCurrentDisplayConfigOf(currentSceneGraph, "Edge")
  );
  const [layoutMode, setLayoutMode] =
    useState<RenderingManager__DisplayMode>("type");

  const isLegendVisible = useMemo(() => {
    return appConfig.windows.showLegendBars;
  }, [appConfig]);

  const isOptionsPanelVisible = useMemo(() => {
    return appConfig.windows.showOptionsPanel;
  }, [appConfig]);

  const isGraphLayoutPanelVisible = useMemo(() => {
    if (appConfig.activeView === "Yasgui") {
      return false;
    }
    return appConfig.windows.showGraphLayoutToolbar;
  }, [appConfig]);

  const isDarkMode = useMemo(() => {
    return (
      appConfig.activeView === "ForceGraph3d" ||
      appConfig.activeView in simulations
    );
  }, [appConfig.activeView]);

  const [graphStatistics, setGraphStatistics] = useState<
    GraphStastics | undefined
  >();

  const handleReactFlowFitView = useCallback(
    (padding: number = 0.1, duration: number = 0) => {
      if (appConfig.activeView === "ReactFlow" && reactFlowInstance.current) {
        setTimeout(() => {
          reactFlowInstance.current?.fitView({ padding, duration });
        }, 0);
      }
    },
    [appConfig.activeView]
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
      handleSetSceneGraph(appConfig.activeSceneGraph);
    }

    if (defaultActiveView) {
      handleSetActiveView(defaultActiveView as RenderingView);
    }

    if (defaultActiveLayout) {
      handleSetActiveLayout(defaultActiveLayout as LayoutEngineOption);
    }

    console.log(
      "here",
      showOptionsPanel,
      showLegendBars,
      showGraphLayoutToolbar,
      showRenderConfigOptions
    );

    handleSetAppConfig(appConfig);
  }, [
    defaultGraph,
    svgUrl,
    defaultActiveView,
    defaultActiveLayout,
    showOptionsPanel,
    showLegendBars,
    showGraphLayoutToolbar,
    showRenderConfigOptions,
  ]);

  useEffect(() => {
    if (
      appConfig.activeView === "ReactFlow" &&
      currentSceneGraph.getDisplayConfig().nodePositions &&
      reactFlowInstance.current
    ) {
      handleReactFlowFitView();
    }
  }, [
    nodeConfig,
    edgeConfig,
    appConfig.activeView,
    handleReactFlowFitView,
    currentSceneGraph.getDisplayConfig().nodePositions,
  ]);

  const selectedGraphNode = useMemo(() => {
    if (selectedNode) {
      return currentSceneGraph.getGraph().getNode(selectedNode);
    }
    return null;
  }, [selectedNode, currentSceneGraph.getGraph()]);

  const handleMouseHoverLegendItem = useCallback(
    (type: GraphEntityType) =>
      (key: string): void => {
        if (type === "Node") {
          const allNodesOfType =
            currentSceneGraph.getDisplayConfig().mode === "type"
              ? currentSceneGraph.getGraph().getNodesByType(key)
              : currentSceneGraph.getGraph().getNodesByTag(key);
          allNodesOfType.forEach((n) => {
            currentSceneGraph.getAppState().hoveredNodes.add(n.getId());
          });
          if (forceGraphInstance.current) {
            forceGraphInstance.current.nodeColor(
              forceGraphInstance.current.nodeColor()
            );
          }
        } else {
          return;
        }
      },
    [currentSceneGraph]
  );

  const handleMouseUnhoverLegendItem = useCallback(
    (type: GraphEntityType) =>
      (key: string): void => {
        currentSceneGraph.getAppState().hoveredNodes.clear();
      },
    [currentSceneGraph]
  );

  const handleSetActiveFilterPreset = useCallback(
    (preset: string | null, filterRules: FilterRuleDefinition[]) => {
      DisplayManager.applyVisibilityFromFilterRulesToGraph(
        currentSceneGraph.getGraph(),
        filterRules
      );
      setActiveFilterPreset({ preset, filterRules });
    },
    [currentSceneGraph]
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
    [currentSceneGraph]
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
        console.log("reach");
        const svg = await graphviz.layout(dot, "svg");
        console.log("nope");
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
      appConfig.forceGraph3dOptions.layout
    );
    forceGraphInstance.current = createForceGraph(
      currentSceneGraph,
      forceGraphRef.current!,
      currentSceneGraph.getDisplayConfig().nodePositions,
      currentSceneGraph.getForceGraphRenderConfig(),
      appConfig.forceGraph3dOptions.layout
    );
    bindEventsToGraphInstance(
      forceGraphInstance.current,
      currentSceneGraph,
      setHoveredNode,
      setSelectedNode,
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
    appConfig.forceGraph3dOptions.layout,
    handleNodeRightClick,
    handleBackgroundRightClick,
    setHoveredNode,
    setSelectedNode,
  ]);

  useEffect(() => {
    if (layoutResult?.layoutType === appConfig.activeLayout) {
      console.log(
        "Skipping layout computation because it has already been computed"
      );
      return;
    }
    if (
      appConfig.activeView === "Graphviz" ||
      appConfig.activeView === "ReactFlow" ||
      (appConfig.activeView === "ForceGraph3d" &&
        appConfig.forceGraph3dOptions.layout === "Layout") ||
      appConfig.forceGraph3dOptions.layout in
        new Set(Object.values(GraphvizLayoutType))
    ) {
      safeComputeLayout(currentSceneGraph, appConfig.activeLayout);
    }
  }, [
    currentSceneGraph,
    // nodeConfig,
    // edgeConfig,
    appConfig.forceGraph3dOptions.layout,
    appConfig.activeLayout,
    safeComputeLayout,
    appConfig.activeView,
  ]);

  const [graphModelUpdateTime, setGraphModelUpdateTime] = useState<number>(0);

  const handleLoadSceneGraph = useCallback(
    async (graph: SceneGraph, clearQueryParams: boolean = true) => {
      const tick = Date.now();
      console.log("Loading SceneGraph", graph.getMetadata().name, "...");
      if (clearQueryParams) {
        clearUrlOfQueryParams();
      }
      safeComputeLayout(graph, appConfig.activeLayout).then(() => {
        setCurrentSceneGraph(graph);
        if (graph.getData().defaultAppConfig) {
          setAppConfig(graph.getData().defaultAppConfig!);
        }
        setLayoutMode(graph.getDisplayConfig().mode);
        setGraphStatistics(getGraphStatistics(graph.getGraph()));
        setNodeConfig(GetCurrentDisplayConfigOf(graph, "Node"));
        setEdgeConfig(GetCurrentDisplayConfigOf(graph, "Edge"));

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
    [appConfig.activeLayout, safeComputeLayout]
  );

  const handleDisplayConfigChanged = useCallback(
    (displayConfig: RenderingConfig) => {
      console.log(
        "notified changed",
        currentSceneGraph.getGraph().getEdges().getTypes()
      );
      if (displayConfig.mode === "tag") {
        setNodeConfig({ ...displayConfig.nodeConfig.tags });
        setEdgeConfig({ ...displayConfig.edgeConfig.tags });
      } else {
        setNodeConfig({ ...displayConfig.nodeConfig.types });
        setEdgeConfig({ ...displayConfig.edgeConfig.types });
      }
    },
    []
  );

  const handleSetSceneGraph = useCallback(
    async (key: string, clearUrlOfQueryParams: boolean = true) => {
      // Find graph in any category
      let graph: SceneGraph | undefined;
      for (const category of Object.values(sceneGraphs)) {
        if (key in category.graphs) {
          if (typeof category.graphs[key] === "function") {
            graph = category.graphs[key]();
          } else {
            graph = category.graphs[key];
          }
          break;
        }
      }
      if (!graph) {
        console.error(`Graph ${key} not found`);
        console.log(`Available graphs are : ${Object.keys(getAllGraphs())}`);
        return;
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
    setAppConfig((prevConfig) => ({
      ...prevConfig,
      activeLayout: layout,
      forceGraph3dOptions: {
        ...prevConfig.forceGraph3dOptions,
        layout: "Layout",
      },
    }));
  }, []);

  const graphvizFitToView = useCallback(
    (element: HTMLDivElement) => {
      enableZoomAndPanOnSvg(element);
    },
    [graphvizRef]
  );

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

  const handleNodeColorChange = useCallback(
    (key: string, newColor: string) => {
      const newConfig = {
        ...nodeConfig,
        [key]: { ...nodeConfig[key], color: newColor },
      };
      SetCurrentDisplayConfigOf(currentSceneGraph, "Node", newConfig);
      setNodeConfig(newConfig);
    },
    [currentSceneGraph, nodeConfig]
  );

  const handleEdgeColorChange = useCallback(
    (key: string, newColor: string) => {
      const newConfig = {
        ...edgeConfig,
        [key]: { ...edgeConfig[key], color: newColor },
      };
      SetCurrentDisplayConfigOf(currentSceneGraph, "Edge", newConfig);
      setEdgeConfig(newConfig);
    },
    [currentSceneGraph, edgeConfig]
  );

  const handleNodeChecked = useCallback(
    (key: string, isVisible: boolean) => {
      const newConfig = {
        ...nodeConfig,
        [key]: { ...nodeConfig[key], isVisible: isVisible },
      };
      SetCurrentDisplayConfigOf(currentSceneGraph, "Node", newConfig);
      setNodeConfig(newConfig);
    },
    [currentSceneGraph, nodeConfig]
  );

  const handleEdgeChecked = useCallback(
    (key: string, isVisible: boolean) => {
      const newConfig = {
        ...edgeConfig,
        [key]: { ...edgeConfig[key], isVisible: isVisible },
      };
      SetCurrentDisplayConfigOf(currentSceneGraph, "Edge", newConfig);
      setEdgeConfig(newConfig);
    },
    [currentSceneGraph, edgeConfig]
  );

  const handleLayoutModeChange = useCallback(
    (mode: RenderingManager__DisplayMode) => {
      currentSceneGraph.getDisplayConfig().mode = mode;
      // DisplayManager.applyRenderingConfigToGraph(
      //   currentSceneGraph.getGraph(),
      //   currentSceneGraph.getDisplayConfig()
      // );
      console.log("changing layoutmode to ", mode);
      refreshForceGraphInstance(forceGraphInstance.current!, currentSceneGraph);

      setLayoutMode(mode);
      setNodeConfig(GetCurrentDisplayConfigOf(currentSceneGraph, "Node"));
      setEdgeConfig(GetCurrentDisplayConfigOf(currentSceneGraph, "Edge"));
    },
    [currentSceneGraph]
  );

  const handleNodeCheckBulk = useCallback(
    (updates: { [key: string]: boolean }) => {
      const newConfig = { ...nodeConfig };
      Object.keys(updates).forEach((key) => {
        newConfig[key].isVisible = updates[key];
      });
      SetCurrentDisplayConfigOf(currentSceneGraph, "Node", newConfig);
      setNodeConfig(newConfig);
    },
    [currentSceneGraph, nodeConfig]
  );

  const handleEdgeCheckBulk = useCallback(
    (updates: { [key: string]: boolean }) => {
      const newConfig = { ...edgeConfig };
      Object.keys(updates).forEach((key) => {
        newConfig[key].isVisible = updates[key];
      });
      SetCurrentDisplayConfigOf(currentSceneGraph, "Edge", newConfig);
      setEdgeConfig(newConfig);
    },
    [currentSceneGraph, edgeConfig]
  );

  const renderNodeLegend = useMemo(() => {
    if (!isLegendVisible) {
      return null;
    }
    const statistics =
      currentSceneGraph.getDisplayConfig().mode === "type"
        ? graphStatistics?.nodeTypeToCount
        : graphStatistics?.nodeTagsToCount;
    return (
      <Legend
        title="Node"
        displayConfig={{ ...nodeConfig }}
        onChange={handleNodeColorChange}
        onCheck={handleNodeChecked}
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
    nodeConfig,
    isLegendVisible,
    isDarkMode,
    graphStatistics,
    currentSceneGraph,
    handleNodeColorChange,
    handleNodeChecked,
    handleNodeCheckBulk,
    handleMouseHoverLegendItem,
    handleMouseUnhoverLegendItem,
  ]);

  const renderEdgeLegend = useMemo(() => {
    if (!isLegendVisible) {
      return null;
    }
    const statistics =
      currentSceneGraph.getDisplayConfig().mode === "type"
        ? graphStatistics?.edgeTypeToCount
        : graphStatistics?.edgeTagsToCount;
    return (
      <Legend
        title="Edge"
        displayConfig={edgeConfig}
        onChange={handleEdgeColorChange}
        onCheck={handleEdgeChecked}
        onCheckBulk={handleEdgeCheckBulk}
        isDarkMode={isDarkMode}
        totalCount={graphStatistics?.edgeCount}
        statistics={statistics}
        sceneGraph={currentSceneGraph}
      />
    );
  }, [
    edgeConfig,
    isLegendVisible,
    isDarkMode,
    graphStatistics,
    handleEdgeColorChange,
    handleEdgeChecked,
    handleEdgeCheckBulk,
    currentSceneGraph,
  ]);

  const handleSetActiveView = useCallback(
    (key: string) => {
      console.log("setting active view", key);
      setAppConfig((prevConfig) => ({
        ...prevConfig,
        windows: {
          ...prevConfig.windows,
          showLegendBars: !(key === "Gallery" || key in simulations), // Update condition
          showOptionsPanel: !(key === "Gallery" || key in simulations), // Update condition
          showGraphLayoutToolbar: !(key === "Gallery" || key in simulations), // Update condition
        },
        activeView: key as any,
      }));
      handleFitToView(key);
      const url = new URL(window.location.href);
      url.searchParams.set("view", key);
      window.history.pushState({}, "", url.toString());
    },
    [handleFitToView]
  );

  const GraphMenuActions = useCallback(() => {
    const actions: { [key: string]: { action: () => void } } = {};
    // Use getAllGraphs() to get flattened list of all graphs
    const allGraphs = getAllGraphs();
    for (const key of Object.keys(allGraphs)) {
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
  }, [handleSetActiveView]);

  const handleImportConfig = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const config = await loadRenderingConfigFromFile(file);
        currentSceneGraph.setDisplayConfig(config);
        setNodeConfig(GetCurrentDisplayConfigOf(currentSceneGraph, "Node"));
        setEdgeConfig(GetCurrentDisplayConfigOf(currentSceneGraph, "Edge"));
      }
    },
    [currentSceneGraph]
  );

  const handleImportDot = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const dotContent = e.target?.result as string;
          const sceneGraph = deserializeDotToSceneGraph(dotContent);
          handleLoadSceneGraph(sceneGraph);
        };
        reader.readAsText(file);
      }
    },
    []
  );

  const handleImportGraphml = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const graphmlContent = e.target?.result as string;
          const sceneGraph =
            await deserializeGraphmlToSceneGraph(graphmlContent);
          handleLoadSceneGraph(sceneGraph);
        };
        reader.readAsText(file);
      }
    },
    []
  );

  const handleImportJson = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const jsonContent = e.target?.result as string;
          const sceneGraph = deserializeSceneGraphFromJson(jsonContent);
          console.log("content", jsonContent, sceneGraph);
          handleLoadSceneGraph(sceneGraph);
        };
        reader.readAsText(file);
      }
    },
    []
  );

  const handleImportSvg = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const svgContent = e.target?.result as string;
          const sceneGraph = deserializeSvgToSceneGraph(svgContent);
          handleLoadSceneGraph(sceneGraph);
        };
        reader.readAsText(file);
      }
    },
    [handleLoadSceneGraph]
  );

  const applyNewLayout = useCallback(
    (layoutType: LayoutEngineOption, sceneGraph: SceneGraph) => {
      // safeComputeLayout(sceneGraph, layoutType).then(() =>
      handleSetActiveLayout(layoutType);
      // );
    },
    []
  );

  const [showPathAnalysis, setShowPathAnalysis] = useState(false);
  const [pathAnalysisConfig, setPathAnalysisConfig] = useState<
    IPathArgs | undefined
  >(undefined);
  const [showNodeEditor, setShowNodeEditor] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<NodeId | null>(null);
  const [showEntityTables, setShowEntityTables] = useState(false);

  const handleShowEntityTables = useCallback(() => {
    setShowEntityTables(true);
  }, []);

  const [showLayoutManager, setShowLayoutManager] = useState<{
    mode: "save" | "load";
    show: boolean;
  }>({ mode: "save", show: false });

  const handleLoadLayout = useCallback(
    (positions: NodePositionData) => {
      currentSceneGraph.getDisplayConfig().nodePositions = positions;
      DisplayManager.applyNodePositions(
        currentSceneGraph.getGraph(),
        positions
      );
      handleSetActiveLayout(PresetLayoutType.Preset);
      setLayoutResult({ positions, layoutType: PresetLayoutType.Preset });
      if (
        forceGraphInstance.current &&
        appConfig.activeView === "ForceGraph3d"
      ) {
        updateNodePositions(forceGraphInstance.current, positions);
      } else if (appConfig.activeView === "ReactFlow") {
        setGraphModelUpdateTime(Date.now()); //hack
      }
    },
    [currentSceneGraph, forceGraphInstance, appConfig.activeView]
  );

  const [showImportSvgFromUrlDialog, setShowImportSvgFromUrlDialog] =
    useState(false);

  const handleLoadSceneGraphFromUrl = useCallback(
    (sceneGraph: SceneGraph) => {
      handleLoadSceneGraph(sceneGraph);

      // Update the URL query parameter
      const url = new URL(window.location.href);
      url.searchParams.delete("graph");
      url.searchParams.set("svgUrl", sceneGraph.getMetadata().source ?? "");
      window.history.pushState({}, "", url.toString());

      setShowImportSvgFromUrlDialog(false);
    },
    [handleLoadSceneGraph]
  );

  const [showSceneGraphDetailView, setShowSceneGraphDetailView] = useState<{
    show: boolean;
    readOnly: boolean;
  }>({
    show: false,
    readOnly: true,
  });

  const menuConfigInstance = useMemo(() => {
    const menuConfigCallbacks: IMenuConfigCallbacks = {
      setShowPathAnalysis,
      handleImportConfig,
      handleImportDot,
      handleImportGraphml,
      handleImportJson,
      handleImportSvg,
      handleFitToView,
      GraphMenuActions,
      SimulationMenuActions,
      applyNewLayout,
      setAppConfig,
      setShowNodeTable: handleShowEntityTables,
      setShowEdgeTable: handleShowEntityTables,
      showLayoutManager: (mode: "save" | "load") =>
        setShowLayoutManager({ mode, show: true }),
      showFilterWindow: () => setShowFilter(true),
      showFilterManager: () => setShowFilterManager(true),
      clearFilters: () => {
        DisplayManager.setAllVisible(currentSceneGraph.getGraph());
        setActiveFilterPreset(null);
      },
      handleLoadLayout: handleLoadLayout,
      showImportSvgFromUrlDialog: () => setShowImportSvgFromUrlDialog(true),
      showSceneGraphDetailView: (readOnly: boolean) => {
        setShowSceneGraphDetailView({ show: true, readOnly });
      },
    };
    return new MenuConfig(
      menuConfigCallbacks,
      appConfig,
      currentSceneGraph,
      forceGraphInstance
    );
  }, [appConfig, currentSceneGraph, forceGraphInstance]);

  const menuConfig = useMemo(
    () => menuConfigInstance.getConfig(),
    [menuConfigInstance]
  );

  const renderSceneGraphTitle = useMemo(() => {
    return (
      <SceneGraphTitle
        title={currentSceneGraph.getMetadata().name ?? ""}
        description={currentSceneGraph.getMetadata().description ?? ""}
      />
    );
  }, [currentSceneGraph]);

  const renderLayoutModeRadio = useCallback(() => {
    if (!isOptionsPanelVisible) {
      return undefined;
    }
    return (
      <LayoutModeRadio
        layoutMode={layoutMode}
        onLayoutModeChange={handleLayoutModeChange}
        isDarkMode={isDarkMode}
      />
    );
  }, [isOptionsPanelVisible, layoutMode, handleLayoutModeChange, isDarkMode]);

  const renderOptionsPanel = useCallback(() => {
    if (!isLegendVisible && !isOptionsPanelVisible) {
      return undefined;
    }
    if (
      appConfig.activeView === "Yasgui" ||
      appConfig.activeView === "Copilot"
    ) {
      return undefined;
    }
    return (
      <div
        className="options-panel-container"
        style={{
          backgroundColor: isDarkMode ? "transparent" : "transparent",
          marginTop: "20px",
        }}
      >
        {renderLayoutModeRadio()}
        {renderNodeLegend}
        {renderEdgeLegend}

        {/* Update ForceGraph3d layout options to match dark mode */}
        {appConfig.activeView === "ForceGraph3d" && (
          <ForceGraphLayoutRadio
            layout={appConfig.forceGraph3dOptions.layout}
            onLayoutChange={setSelectedForceGraph3dLayoutMode}
            isDarkMode={isDarkMode}
          />
        )}
        {renderSceneGraphTitle}
      </div>
    );
  }, [
    appConfig,
    isLegendVisible,
    isOptionsPanelVisible,
    renderLayoutModeRadio,
    renderNodeLegend,
    renderEdgeLegend,
    renderSceneGraphTitle,
    setSelectedForceGraph3dLayoutMode,
  ]);

  const maybeRenderReactFlow = useMemo(() => {
    if (appConfig.activeView !== "ReactFlow") {
      return null;
    }

    if (currentSceneGraph.getDisplayConfig().nodePositions === undefined) {
      safeComputeLayout(currentSceneGraph, appConfig.activeLayout);
      return;
    }

    const data = exportGraphDataForReactFlow(currentSceneGraph);
    const renderingManager = currentSceneGraph.getRenderingManager();
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
        },
      },
      style: {
        background: renderingManager.getNodeColor(
          currentSceneGraph.getGraph().getNode(node.id as NodeId)
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
              stroke: renderingManager.getEdgeColor(
                currentSceneGraph.getGraph().getEdge(edge.id as EdgeId)
              ),
            },
            labelStyle: {
              fill: renderingManager.getEdgeColor(
                currentSceneGraph.getGraph().getEdge(edge.id as EdgeId)
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
  }, [
    appConfig.activeView,
    currentSceneGraph,
    appConfig.activeLayout,
    handleReactFlowFitView,
    safeComputeLayout,
    handleNodeRightClick,
    layoutResult,
    graphModelUpdateTime,
    activeFilterPreset,
  ]);

  // useEffect(() => {
  //   if (
  //     activeView === "Graphviz" ||
  //     activeView === "ReactFlow" ||
  //     (activeView === "ForceGraph3d" &&
  //       appConfig.forceGraph3dOptions.layout === "Layout") ||
  //     appConfig.forceGraph3dOptions.layout in
  //       new Set(Object.values(GraphvizLayoutType))
  //   ) {
  //     safeComputeLayout(currentSceneGraph, appConfig.activeLayout);
  //   }
  // }, [
  //   currentSceneGraph,
  //   nodeConfig,
  //   edgeConfig,
  //   appConfig.forceGraph3dOptions.layout,
  //   appConfig.activeLayout,
  //   safeComputeLayout,
  //   activeView,
  // ]);

  const maybeRenderGraphviz = useMemo(() => {
    if (appConfig.activeView !== "Graphviz") {
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
  }, [appConfig.activeView]);

  const maybeRenderForceGraph3D = useMemo(() => {
    if (appConfig.activeView === "ForceGraph3d") {
      console.log("RENDERING FORCE GRAPH");
      return (
        <div
          id="force-graph"
          ref={forceGraphRef}
          style={{
            width: "100%",
            height: "100vh",
            background: "black",
            zIndex: 5,
            position: "absolute",
            top: 0, // Changed from "50px" to 0
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      );
    }
    return null;
  }, [appConfig.activeView, forceGraphRef]);

  const handleUpdateForceGraphScene = useCallback((sceneGraph: SceneGraph) => {
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
    if (appConfig.activeView === "ForceGraph3d") {
      if (forceGraphInstance.current) {
        console.log(
          "refreshing on layout mode change",
          appConfig.forceGraph3dOptions.layout
        );
        refreshForceGraphInstance(
          forceGraphInstance.current,
          currentSceneGraph,
          appConfig.forceGraph3dOptions.layout
        );
      }
    }
  }, [
    nodeConfig,
    edgeConfig,
    appConfig.activeView,
    appConfig.forceGraph3dOptions.layout,
    activeFilterPreset,
  ]);

  useEffect(() => {
    if (
      layoutResult?.layoutType !== appConfig.activeLayout &&
      (appConfig.activeView === "Graphviz" ||
        appConfig.activeView === "ReactFlow")
    ) {
      if (currentSceneGraph.getDisplayConfig().nodePositions === undefined) {
        safeComputeLayout(currentSceneGraph, appConfig.activeLayout);
      }
    } else if (appConfig.activeView === "ForceGraph3d") {
      console.log("REinitializing");
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
    // nodeConfig,
    // edgeConfig,
    appConfig.activeView,
    appConfig.forceGraph3dOptions.layout,
    appConfig.activeLayout,
    initializeForceGraph,
    safeComputeLayout,
  ]);

  useEffect(() => {
    if (
      forceGraphInstance.current &&
      layoutResult &&
      appConfig.forceGraph3dOptions.layout === "Layout"
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
  }, [forceGraphInstance, layoutResult, appConfig.forceGraph3dOptions.layout]);

  const handleSearchResult = useCallback((nodeIds: string[]) => {
    console.log("Search results:", nodeIds);
    // You can use this to update visualization state
  }, []);

  const handleHighlight = useCallback(
    (nodeId: string) => {
      // setHighlightedNode(nodeId);
      // Additional logic for highlighting in different views
      if (
        appConfig.activeView === "ForceGraph3d" &&
        forceGraphInstance.current
      ) {
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
    [appConfig.activeView, forceGraphInstance]
  );

  const handleSelectResult = useCallback(
    (nodeId: NodeId | string) => {
      if (!forceGraphInstance.current) {
        return;
      }
      if (appConfig.activeView === "ForceGraph3d") {
        const node = forceGraphInstance.current
          .graphData()
          .nodes.find((node) => node.id === nodeId);
        if (node) {
          console.log("flying to ", node);
          flyToNode(forceGraphInstance.current, node);
          handleHighlight(nodeId);
          setSelectedNode(nodeId as NodeId);
        }
      }
    },
    [appConfig.activeView, handleHighlight, setSelectedNode]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (
        appConfig.activeView === "ForceGraph3d" &&
        forceGraphInstance.current
      ) {
        setMousePosition({ x: event.clientX, y: event.clientY });
      }
    },
    [appConfig.activeView, setMousePosition]
  );

  const renderUniappToolbar = React.useMemo(() => {
    if (showToolbar === "false") {
      return null;
    }
    return (
      <UniAppToolbar
        config={menuConfig}
        sceneGraph={currentSceneGraph}
        activeView={appConfig.activeView}
        onViewChange={handleSetActiveView}
        simulationList={Object.keys(simulations)}
        selectedSimulation={selectedSimulation}
        isDarkMode={isDarkMode}
        onSelectResult={handleSelectResult}
        onSearchResult={handleSearchResult}
        onHighlight={handleHighlight}
      />
    );
  }, [
    menuConfig,
    currentSceneGraph,
    appConfig.activeView,
    selectedSimulation,
    isDarkMode,
    handleSetActiveView,
    handleSelectResult,
    handleSearchResult,
    handleHighlight,
  ]);

  const handleNodeMouseEnter = useCallback(
    (event: React.MouseEvent, nodeId: string) => {
      setHoveredNode(nodeId);
      setMousePosition({ x: event.clientX, y: event.clientY });
    },
    [setHoveredNode, setMousePosition]
  );

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, [setHoveredNode]);

  const handleApplyForceGraphConfig = useCallback(
    (config: IForceGraphRenderConfig) => {
      // currentSceneGraph.setForceGraphRenderConfig(config);
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

  const handleApplyPositionsToForceGraph = useCallback(
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

  const renderForceGraphRenderConfigEditor = useCallback(() => {
    if (appConfig.activeView !== "ForceGraph3d") {
      return null;
    }
    if (!appConfig.forceGraph3dOptions.showOptionsPanel) {
      return null;
    }
    return (
      <ForceGraphRenderConfigEditor
        onApply={handleApplyForceGraphConfig}
        isDarkMode={isDarkMode}
        initialConfig={currentSceneGraph.getForceGraphRenderConfig()}
      />
    );
  }, [
    handleApplyForceGraphConfig,
    isDarkMode,
    currentSceneGraph,
    appConfig.activeView,
    appConfig.forceGraph3dOptions.showOptionsPanel,
  ]);

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
        action: () => setSelectedNode(nodeId),
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
          console.log("WHAT ABOUT HERE", currentSceneGraph);
          const node = currentSceneGraph.getGraph().getNode(nodeId);
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
    [currentSceneGraph, setSelectedNode]
  );

  const getContextMenuItems = useCallback(
    (nodeId: NodeId | undefined): ContextMenuItem[] => {
      if (nodeId) {
        return getNodeContextMenuItems(nodeId);
      } else {
        return getBackgroundRightClickContextMenuItems();
      }
    },
    [
      currentSceneGraph,
      getNodeContextMenuItems,
      getBackgroundRightClickContextMenuItems,
    ]
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
  }, [showPathAnalysis, pathAnalysisConfig, currentSceneGraph, isDarkMode]);

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
      setShowFilterManager(false);
      setActiveFilterPreset({ preset: null, filterRules: preset.rules });
    },
    [currentSceneGraph]
  );

  const maybeRenderYasgui = useMemo(() => {
    if (appConfig.activeView !== "Yasgui") {
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
  }, [appConfig.activeView, currentSceneGraph]);

  return (
    <AppContextProvider value={{ setEditingEntity, setJsonEditEntity }}>
      <div
        className={isDarkMode ? "dark-mode" : ""}
        style={{ margin: 0, padding: 0 }}
        onMouseMove={handleMouseMove}
      >
        {renderUniappToolbar}
        <input
          type="file"
          id="import-config-input"
          style={{ display: "none" }}
          onChange={handleImportConfig}
        />
        <input
          type="file"
          id="import-dot-input"
          style={{ display: "none" }}
          onChange={handleImportDot}
        />
        <input
          type="file"
          id="import-graphml-input"
          style={{ display: "none" }}
          accept=".graphml"
          onChange={handleImportGraphml}
        />
        <input
          type="file"
          id="import-json-input"
          style={{ display: "none" }}
          accept=".json"
          onChange={handleImportJson}
        />
        <input
          type="file"
          id="import-svg-input"
          style={{ display: "none" }}
          accept=".svg"
          onChange={handleImportSvg}
        />
        <div
          style={{
            position: "fixed",
            bottom: "1rem",
            right: "1rem",
            zIndex: 1000,
          }}
        >
          <button
            onClick={() => handleFitToView(appConfig.activeView)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <FaExpand size={"3rem"} color={isDarkMode ? "white" : "black"} />
          </button>
        </div>
        <div>
          <div
            style={{
              position: "fixed",
              right: "0px",
              zIndex: 1000,
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            {renderOptionsPanel()}
          </div>
          <div
            style={{
              position: "relative",
              width: "100vw", // Changed from 100% to 100vw
              height: "100vh",
              margin: 0,
              padding: 0,
            }}
          >
            {maybeRenderGraphviz}
            {maybeRenderForceGraph3D}
            {maybeRenderReactFlow}
            {maybeRenderYasgui}
            {appConfig.activeView === "Gallery" && (
              <ImageGalleryV3
                sceneGraph={currentSceneGraph}
                addRandomImageBoxes={false}
                defaultLinksEnabled={false}
              />
            )}
            {appConfig.activeView in simulations &&
              getSimulation(appConfig.activeView)}
          </div>
        </div>
        {isGraphLayoutPanelVisible &&
          !(appConfig.activeView in simulations) && (
            <GraphLayoutToolbar
              activeLayout={activeLayout}
              onLayoutChange={(layoutType: LayoutEngineOption) =>
                applyNewLayout(layoutType, currentSceneGraph)
              }
              isDarkMode={isDarkMode}
              physicsMode={
                appConfig.forceGraph3dOptions.layout === "Physics" &&
                appConfig.activeView === "ForceGraph3d"
              }
            />
          )}
        {appConfig.forceGraph3dOptions.showOptionsPanel && (
          <div
            style={{
              zIndex: "3000",
              position: "absolute",
              top: "5rem",
              left: "1rem",
            }}
          >
            {renderForceGraphRenderConfigEditor()}
          </div>
        )}
        {appConfig.windows.showEntityDataCard &&
          currentSceneGraph.getAppState().hoveredNodes.size > 0 && (
            <EntityDataDisplayCard
              entityData={currentSceneGraph
                .getGraph()
                .getNode(
                  Array.from(
                    currentSceneGraph.getAppState().hoveredNodes
                  )[0] as NodeId
                )}
            />
          )}
        {selectedNode && forceGraphInstance.current && (
          <NodeDisplayCard
            nodeId={selectedNode}
            sceneGraph={currentSceneGraph}
            position={
              getNodeMousePosition(
                selectedGraphNode,
                forceGraphInstance.current
              )!
            }
            onNodeSelect={handleSelectResult}
            onClose={() => setSelectedNode(null)}
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
        {pathAnalysisWizard}
        {showEntityTables && (
          <EntityTabDialog
            nodes={currentSceneGraph.getGraph().getNodes()}
            edges={currentSceneGraph.getGraph().getEdges()}
            sceneGraph={currentSceneGraph}
            entityCache={currentSceneGraph.getEntityCache()}
            onClose={() => setShowEntityTables(false)}
            onNodeClick={(nodeId) => {
              setSelectedNode(nodeId as NodeId);
              setShowEntityTables(false);
              if (
                appConfig.activeView === "ForceGraph3d" &&
                forceGraphInstance.current
              ) {
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
        {showImportSvgFromUrlDialog && (
          <ImportSvgFromUrlDialog
            onClose={() => setShowImportSvgFromUrlDialog(false)}
            onLoad={handleLoadSceneGraphFromUrl}
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
  showOptionsPanel?: string;
  showLegendBars?: string;
  showGraphLayoutToolbar?: string;
  showRenderConfigOptions?: string;
  showToolbar?: string;
}

const App: React.FC<AppProps> = ({
  defaultGraph,
  svgUrl,
  defaultActiveView,
  defaultActiveLayout,
  showOptionsPanel,
  showLegendBars,
  showGraphLayoutToolbar,
  showRenderConfigOptions,
  showToolbar,
}) => {
  return (
    <MousePositionProvider>
      <AppContent
        defaultGraph={defaultGraph}
        svgUrl={svgUrl}
        defaultActiveView={defaultActiveView}
        defaultActiveLayout={defaultActiveLayout}
        showOptionsPanel={showOptionsPanel}
        showLegendBars={showLegendBars}
        showGraphLayoutToolbar={showGraphLayoutToolbar}
        showRenderConfigOptions={showRenderConfigOptions}
        showToolbar={showToolbar}
      />
    </MousePositionProvider>
  );
};

export default App;
