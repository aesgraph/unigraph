import { Position } from "@xyflow/react";
import React, {
  JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ImageGallery from "./_experimental/lumina/galleryTestbed/ImageGallery";
import ImageBoxCreator from "./_experimental/lumina/ImageBoxCreator";
import Lumina from "./_experimental/lumina/Lumina";
import "./App.css";
import { AppConfig, DEFAULT_APP_CONFIG } from "./AppConfig";
import PathAnalysisWizard, {
  IPathArgs,
} from "./components/analysis/PathAnalysisWizard";
import ImageGalleryV2 from "./components/applets/ImageGallery/ImageGalleryV2";
import ImageGalleryV3 from "./components/applets/ImageGallery/ImageGalleryV3";
import CommandPalette from "./components/commandPalette/CommandPalette";
import ContextMenu, { ContextMenuItem } from "./components/common/ContextMenu";
import EntityDataDisplayCard from "./components/common/EntityDataDisplayCard";
import EntityJsonEditorDialog from "./components/common/EntityJsonEditorDialog";
import EntityTabDialog from "./components/common/EntityTabDialog";
import { GraphEntityType } from "./components/common/GraphSearch";
import Legend from "./components/common/Legend";
import LegendModeRadio from "./components/common/LegendModeRadio";
import FilterManager from "./components/filters/FilterManager";
import FilterWindow from "./components/filters/FilterWindow";
import { IMenuConfigCallbacks, MenuConfig } from "./components/MenuConfig";
import { useAppShell } from "@aesgraph/app-shell";
import NodeEditorWizard from "./components/NodeEditorWizard";
import WorkspaceManagerDialog from "./components/dialogs/WorkspaceManagerDialog";
import SceneGraphDetailView from "./components/sceneGraph/SceneGraphDetailView";
import SceneGraphTitle from "./components/sceneGraph/SceneGraphTitle";
import WorkspaceV2 from "./components/WorkspaceV2";
// import { Workspace as AppShellWorkspace } from "@aesgraph/app-shell";
// import AppShellView from "./components/views/AppShellView";
import ReactFlowPanel, {
  nodeTypes,
} from "./components/views/ReactFlow/ReactFlowPanel";
import { debugEnvVars } from "./utils/envUtils";

import { AppShellProvider } from "@aesgraph/app-shell";
import InitialWorkspaceLoader from "./components/InitialWorkspaceLoader";
import AudioAnnotator from "./_experimental/mp3/AudioAnnotator";
import GravitySimulation3 from "./_experimental/webgl/simulations/GravitySimulation3";
import SolarSystem from "./_experimental/webgl/simulations/solarSystemSimulation";
import ChatGptImporter from "./components/applets/ChatGptImporter/ChatGptImporter";
import LexicalEditorV2 from "./components/applets/Lexical/LexicalEditor";
import StoryCardApp from "./components/applets/StoryCards/StoryCardApp";
import WikipediaArticleViewer from "./components/applets/WikipediaViewer/WikipediaArticleViewer";
import WikipediaArticleViewer_FactorGraph from "./components/applets/WikipediaViewer/WikipediaArticleViewer_FactorGraph";
import EntitiesContainerDialog from "./components/common/EntitiesContainerDialog";
import EntityEditor from "./components/common/EntityEditor";
import EntityTableDialogV2 from "./components/common/EntityTableDialogV2";
import LoadSceneGraphDialog from "./components/common/LoadSceneGraphDialog";
import { getMultiNodeContextMenuItems } from "./components/common/multiNodeContextMenuItems";
import SaveSceneGraphDialog from "./components/common/SaveSceneGraphDialog";
import SelectionBox from "./components/common/SelectionBox";
import { getSaveAsNewFilterMenuItem } from "./components/common/sharedContextMenuItems";
import { getNodeContextMenuItems } from "./components/common/singleNodeContextMenuItems";
import { LayoutComputationDialog } from "./components/dialogs/LayoutComputationDialog";
import NodeDocumentEditor from "./components/NodeDocumentEditor";
import SaveAsNewProjectDialog from "./components/projects/SaveAsNewProjectDialog";
import { SemanticWebQueryProvider } from "./components/semantic/SemanticWebQueryContext";
import SemanticWebQueryPanel from "./components/semantic/SemanticWebQueryPanel";
import { enableZoomAndPanOnSvg } from "./components/svg/appHelpers";
import { getHotkeyConfig } from "./configs/hotkeyConfig";
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
  updateNodePositions,
  zoomToFit,
} from "./core/force-graph/createForceGraph";
import { syncMissingNodesAndEdgesInForceGraph } from "./core/force-graph/forceGraphHelpers";
import { ForceGraphManager } from "./core/force-graph/ForceGraphManager";
import { Compute_Layout } from "./core/layouts/LayoutEngine";
import {
  LayoutEngineOption,
  LayoutEngineOptionLabels,
  PresetLayoutType,
} from "./core/layouts/layoutEngineTypes";
import { NodePositionData } from "./core/layouts/layoutHelpers";
import { DisplayManager } from "./core/model/DisplayManager";
import { EdgeId } from "./core/model/Edge";
import { Entity } from "./core/model/entity/abstractEntity";
import { EntityIds } from "./core/model/entity/entityIds";
import { getGraphStatistics, GraphStastics } from "./core/model/GraphBuilder";
import { NodeDataArgs, NodeId } from "./core/model/Node";
import { SceneGraph } from "./core/model/SceneGraph";
import {
  GetCurrentDisplayConfigOf,
  loadRenderingConfigFromFile,
  SetCurrentDisplayConfigOf,
} from "./core/model/utils";
import { exportGraphDataForReactFlow } from "./core/react-flow/exportGraphDataForReactFlow";
import { deserializeSceneGraphFromJson } from "./core/serializers/toFromJson";
import { persistentStore } from "./core/storage/PersistentStoreManager";
import { flyToNode } from "./core/webgl/webglHelpers";
import {
  getAllDemoSceneGraphKeys,
  getSceneGraph,
} from "./data/DemoSceneGraphs";
import { extractPositionsFromNodes } from "./data/graphs/blobMesh";
import { useCommandPalette } from "./hooks/useCommandPalette";
import { useHotkeys } from "./hooks/useHotkeys";
import { fetchSvgSceneGraph } from "./hooks/useSvgSceneGraph";
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
  setNodeKeyVisibility,
  setNodeLegendConfig,
} from "./store/activeLegendConfigStore";
import useAppConfigStore, {
  getActiveView,
  getAutoFitView,
  getCurrentSceneGraph,
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
import {
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
import { useMouseControlsStore } from "./store/mouseControlsStore";
import { addNotification } from "./store/notificationStore";
import {
  applyActiveFilterToAppInstance,
  filterSceneGraphToOnlyVisibleNodes,
} from "./store/sceneGraphHooks";
import { useUserStore } from "./store/userStore";
import useWorkspaceConfigStore, {
  getLeftSidebarConfig,
  getRightSidebarConfig,
  setLeftActiveSection,
  setLeftSidebarConfig,
  setRightActiveSection,
  setRightSidebarConfig,
  setShowToolbar,
} from "./store/workspaceConfigStore";
import { initializeMainForceGraph } from "./utils/forceGraphInitializer";
import { CommandProcessorProvider } from "./components/commandPalette/CommandProcessor";
import { WorkspaceLayoutTool } from "./components/workspace/WorkspaceLayoutTool";
// import { ThemeWorkspaceProvider } from "./components/providers/ThemeWorkspaceProvider";
// import { Workspace as AppShellWorkspace } from "@aesgraph/app-shell";

// Debug environment variables in development
if (process.env.NODE_ENV === "development") {
  debugEnvVars();
}

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
    // storyCard: <AnimatedStoryCardDemo3 />,
    storyCard: <StoryCardApp sceneGraph={sceneGraph} />,
    wikipediaViewer: (
      <WikipediaArticleViewer
        initialArticle="Factor graph"
        highlightKeywords={["the"]}
        customTerms={{ representing: "yep" }}
        sceneGraph={sceneGraph}
      />
    ),
    factorGraph: (
      <WikipediaArticleViewer_FactorGraph
        highlightKeywords={["efficient computations"]}
      />
    ),
  };
};

const initialSceneGraph = new SceneGraph();

export type RenderingView =
  | "Graphviz"
  | "ForceGraph3d"
  | "ReactFlow"
  | "Gallery" // Add new view type
  | "AppShell" // Add new view type
  | "Simulation"
  | "Yasgui" // Add new view type
  | "Editor"; // Add new view type

const AppContent = ({
  defaultGraph,
  svgUrl,
  defaultActiveView,
  defaultActiveLayout,
  shouldShowLoadDialog = false,
  defaultSerializedSceneGraph,
}: {
  defaultGraph?: string;
  svgUrl?: string;
  defaultActiveView?: string;
  defaultActiveLayout?: string;
  shouldShowLoadDialog?: boolean;
  defaultSerializedSceneGraph?: any;
}) => {
  const { initializeAuth } = useUserStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const {
    showPathAnalysis,
    setShowEntityTables,
    setShowEntityTablesV2,
    setShowLayoutManager,
    setShowSceneGraphDetailView,
    setShowPathAnalysis,
    showLoadSceneGraphWindow,
    setShowLoadSceneGraphWindow,
    showSaveSceneGraphDialog,
    setShowSaveSceneGraphDialog,
    showSaveAsNewProjectDialog,
    setShowSaveAsNewProjectDialog,
    showEntityTables,
    showEntityTablesV2,
    // showLayoutManager,
    showSceneGraphDetailView,
    showWorkspaceManager,
  } = useDialogStore();

  const {
    forceGraph3dOptions,
    activeView,
    setActiveView,
    getShowEntityDataCard,
    legendMode,
    setLegendMode,
    currentSceneGraph,
    setCurrentSceneGraph,
    forceGraphInstance,
    setForceGraphInstance,
    reactFlowInstance,
    setReactFlowInstance,
  } = useAppConfigStore();

  // eslint-disable-next-line unused-imports/no-unused-vars
  const { showToolbar } = useWorkspaceConfigStore();
  const {
    nodeLegendConfig,
    edgeLegendConfig,
    nodeLegendUpdateTime,
    edgeLegendUpdateTime,
  } = useActiveLegendConfigStore();

  // const { selectedNodeIds, selectedEdgeIds } = useGraphInteractionStore();

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

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteDialogData, setDeleteDialogData] = useState<{
    nodeIds: NodeId[];
    isSingleNode: boolean;
  } | null>(null);

  // EntityEditor state
  const [entityEditorData, setEntityEditorData] = useState<{
    entity: Entity | null;
    isOpen: boolean;
  } | null>(null);

  // Delete dialog handlers
  const handleShowDeleteDialog = useCallback((nodeIds: NodeId[]) => {
    setDeleteDialogData({
      nodeIds,
      isSingleNode: nodeIds.length === 1,
    });
    setShowDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteDialogData) {
      if (deleteDialogData.isSingleNode) {
        currentSceneGraph.getGraph().deleteNode(deleteDialogData.nodeIds[0]);
      } else {
        currentSceneGraph.getGraph().deleteNodes(deleteDialogData.nodeIds);
      }
      currentSceneGraph.notifyGraphChanged();
      setShowDeleteDialog(false);
      setDeleteDialogData(null);
    }
  }, [deleteDialogData, currentSceneGraph]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteDialog(false);
    setDeleteDialogData(null);
  }, []);

  // EntityEditor handlers
  const handleEntityEditorSave = useCallback(
    (entityId: NodeId, updatedData: any) => {
      const entity = currentSceneGraph.getGraph().getNode(entityId);
      if (entity) {
        // Update the entity data
        Object.assign(entity.getData(), updatedData);
        currentSceneGraph.notifyGraphChanged();
        addNotification({
          message: "Entity updated successfully",
          type: "success",
          duration: 3000,
        });
      }
    },
    [currentSceneGraph]
  );

  const handleEntityEditorClose = useCallback(() => {
    setEntityEditorData(null);
  }, []);

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
      if (activeView === "ReactFlow" && reactFlowInstance && getAutoFitView()) {
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
    if (defaultSerializedSceneGraph) {
      // Load from serialized scenegraph param
      console.log("Loading serialized scenegraph", defaultSerializedSceneGraph);
      const sg = deserializeSceneGraphFromJson(
        JSON.stringify(defaultSerializedSceneGraph)
      );
      console.log("Loaded serialized scenegraph", sg);
      handleLoadSceneGraph(sg, false);
      return;
    }
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
      // Load empty scenegraph when no graph is provided
      handleLoadSceneGraph(
        new SceneGraph({ metadata: { name: "Empty Graph" } })
      );
    }

    if (defaultActiveView) {
      handleSetActiveView(defaultActiveView as RenderingView);
    }

    if (defaultActiveLayout) {
      setActiveLayout(defaultActiveLayout as LayoutEngineOption);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    defaultSerializedSceneGraph,
    defaultGraph,
    svgUrl,
    defaultActiveView,
    defaultActiveLayout,
  ]);

  // Auto-open LoadSceneGraphDialog when shouldShowLoadDialog is true
  useEffect(() => {
    if (shouldShowLoadDialog) {
      setShowLoadSceneGraphWindow(true);
    }
  }, [shouldShowLoadDialog, setShowLoadSceneGraphWindow]);

  // useEffect(() => {
  //   if (activeView === "ReactFlow" && reactFlowInstance) {
  //     if (getPreviousView() !== "Editor") {
  //       handleReactFlowFitView();
  //     }
  //   }
  // }, [
  //   nodeLegendConfig,
  //   edgeLegendConfig,
  //   activeView,
  //   handleReactFlowFitView,
  //   reactFlowInstance,
  // ]);

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

  let isComputing = false;
  const safeComputeLayout = useCallback(
    async (
      sceneGraph: SceneGraph,
      layout: LayoutEngineOption | string | null,
      forceGraph3dOptionsLayoutModeToSet: "Layout" | "Physics" = "Layout"
    ) => {
      console.log(
        "Computing layout for",
        layout,
        "with layout mode:",
        forceGraph3dOptionsLayoutModeToSet
      );

      // Skip layout computation if we're in Physics mode for ForceGraph3D
      if (
        activeView === "ForceGraph3d" &&
        forceGraph3dOptionsLayoutModeToSet === "Physics"
      ) {
        console.log("Skipping layout computation for Physics mode");
        return;
      }

      // Get layout result directly from store when needed
      if (Object.keys(getSavedLayouts()).includes(layout as string)) {
        console.log("Skipping layout computation for saved layout", layout);
        currentSceneGraph.setNodePositions(
          getLayoutByName(layout as string).positions
        );
        setCurrentLayoutResult(
          {
            layoutType: layout!,
            positions: getLayoutByName(layout as string).positions,
          },
          forceGraph3dOptionsLayoutModeToSet
        );
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
        setCurrentLayoutResult(
          { positions, layoutType: layout },
          forceGraph3dOptionsLayoutModeToSet
        );
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
      console.log("setting current layout result", output);
      setCurrentLayoutResult(output, forceGraph3dOptionsLayoutModeToSet);
      isComputing = false;
    },
    [activeView, forceGraph3dOptions.layout]
  );

  // Update the context menu state to use a unified approach with nodeIds array
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeIds?: NodeId[];
  } | null>(null);

  const [isNodeEditorOpen, setIsNodeEditorOpen] = useState(false);

  // Unified handler for right-clicks on nodes (single or multiple)
  const handleNodesRightClick = useCallback(
    (event: MouseEvent | React.MouseEvent, nodeIds: EntityIds<NodeId>) => {
      event.preventDefault();
      event.stopPropagation();

      if (nodeIds.size === 0) return;

      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeIds: nodeIds.toArray(),
      });
    },
    []
  );

  const handleBackgroundRightClick = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
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
    if (!forceGraphRef.current) return;

    const newInstance = initializeMainForceGraph(
      forceGraphRef.current,
      handleNodesRightClick,
      handleBackgroundRightClick,
      forceGraph3dOptions.layout
    );

    // The instance is already set as the main instance by initializeMainForceGraph
    // but we need to return it for any additional setup if needed
    return newInstance;
  }, [
    forceGraph3dOptions.layout,
    handleNodesRightClick,
    handleBackgroundRightClick,
  ]);

  const [graphModelUpdateTime, setGraphModelUpdateTime] = useState<number>(0);

  const handleDisplayConfigChanged = useCallback(
    (displayConfig: RenderingConfig) => {
      console.log(
        "notified changed",
        currentSceneGraph,
        currentSceneGraph.getGraph().getNodes(),
        currentSceneGraph.getGraph().getEdges()
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
    async (
      graph: SceneGraph,
      clearQueryParams: boolean = true,
      onLoaded?: (sceneGraph?: SceneGraph) => void
    ) => {
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

      // Apply scene graph's default app config immediately BEFORE layout computation
      if (graph.getData().defaultAppConfig) {
        console.log(
          "Applying scene graph app config:",
          graph.getData().defaultAppConfig
        );
        setAppConfig(graph.getData().defaultAppConfig!);
      }

      const layoutToLoad =
        graph.getData().defaultAppConfig?.activeLayout ??
        defaultActiveLayout ??
        null;

      console.log(
        graph.getMetadata().name,
        "default app config is ",
        graph.getData().defaultAppConfig
      );

      safeComputeLayout(
        graph,
        layoutToLoad,
        graph.getData().defaultAppConfig?.forceGraph3dOptions?.layout
      ).then(() => {
        setCurrentSceneGraph(graph);

        console.log("loaded layout", layoutToLoad);

        setLegendMode(graph.getDisplayConfig().mode);
        setNodeLegendConfig(
          GetCurrentDisplayConfigOf(graph.getDisplayConfig(), "Node")
        );
        setEdgeLegendConfig(
          GetCurrentDisplayConfigOf(graph.getDisplayConfig(), "Edge")
        );
        setGraphStatistics(getGraphStatistics(graph.getGraph()));
        console.log("binding listeners to new graph", graph);
        graph.bindListeners({
          onDisplayConfigChanged: handleDisplayConfigChanged,
          onGraphChanged: (g) => {
            console.log("graph changed", g);
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

        const workspaceConfig =
          graph.getData()?.defaultAppConfig?.workspaceConfig;
        if (workspaceConfig) {
          const leftToSet = workspaceConfig?.leftSidebarConfig;
          if (leftToSet !== undefined) {
            setLeftSidebarConfig(leftToSet);
            setLeftActiveSection(leftToSet.activeSectionId ?? "default");
          }
          const rightToSet = workspaceConfig?.rightSidebarConfig;
          if (rightToSet !== undefined) {
            setRightSidebarConfig(rightToSet);
            setRightActiveSection(rightToSet.activeSectionId ?? "default");
          }

          setShowToolbar(workspaceConfig?.showToolbar ?? true);
          if (workspaceConfig?.hideAll) {
            setShowToolbar(false);
            setLeftSidebarConfig({
              ...getLeftSidebarConfig(),
              ...leftToSet,
              isVisible: false,
            });
            setRightSidebarConfig({
              ...getRightSidebarConfig(),
              ...rightToSet,
              isVisible: false,
            });
          }
        }

        const tock = Date.now();
        console.log("TOTAL TIME", tock - tick);
        onLoaded?.(graph);
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
      defaultActiveLayout,
      forceGraphInstance,
      handleDisplayConfigChanged,
      safeComputeLayout,
      setActiveFilter,
      setCurrentSceneGraph,
      setLegendMode,
    ]
  );

  const handleSetSceneGraph = useCallback(
    async (
      key: string,
      clearUrlOfQueryParams: boolean = true,
      onLoaded?: (sceneGraph?: SceneGraph) => void
    ) => {
      // First try to load from persistent store
      try {
        const persistedGraph = await persistentStore.loadSceneGraph(key);
        if (persistedGraph) {
          handleLoadSceneGraph(persistedGraph, clearUrlOfQueryParams, onLoaded);
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
        handleLoadSceneGraph(graph, clearUrlOfQueryParams, onLoaded);
        setActiveProjectId(null); // Clear project ID since this is a demo graph
        // Update the URL query parameter
        const url = new URL(window.location.href);
        url.searchParams.set("graph", key);
        url.searchParams.delete("svgUrl");
        window.history.pushState({}, "", url.toString());
      } catch (err) {
        console.error(`Graph ${key} not found: ${err}`);
        console.log(`Available graphs are: ${getAllDemoSceneGraphKeys()}`);
        handleLoadSceneGraph(new SceneGraph(), true, onLoaded);
        return;
      }
    },
    [handleLoadSceneGraph]
  );

  // Initialize command palette after handleSetSceneGraph is defined
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useDialogStore();
  const { commands, executeCommand } = useCommandPalette(handleSetSceneGraph);

  // Initialize hotkeys after handleSetSceneGraph is defined
  const hotkeys = getHotkeyConfig(handleSetSceneGraph);
  useHotkeys(hotkeys);

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
      console.log("Fitting to view for", activeView);
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
    (key: string, fitToView: boolean = false) => {
      console.log("Setting active view", key);
      setActiveView(key);
      if (fitToView) {
        handleFitToView(key);
      }
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
          handleSetActiveView(key, true);
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

  const { saveCurrentLayout, applyWorkspaceLayout, getAllWorkspaces } =
    useAppShell();

  const menuConfigInstance = useMemo(() => {
    const menuConfigCallbacks: IMenuConfigCallbacks = {
      handleSetSceneGraph,
      handleImportConfig,
      handleFitToView,
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
      appShellWorkspaceFunctions: {
        saveCurrentLayout,
        applyWorkspaceLayout,
        getAllWorkspaces,
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
    currentSceneGraph,
    forceGraphInstance,
    handleFitToView,
    handleImportConfig,
    handleSetSceneGraph,
    setShowEntityTables,
    setShowLayoutManager,
    setShowSceneGraphDetailView,
    saveCurrentLayout,
    applyWorkspaceLayout,
    getAllWorkspaces,
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
      console.log("Extracting from node data...");
      const nodePositions = extractPositionsFromNodes(currentSceneGraph);
      currentSceneGraph.setNodePositions(nodePositions);
    }

    const data = exportGraphDataForReactFlow(currentSceneGraph);
    const activeLayoutResult = getActiveLayoutResult();
    const nodePositions = activeLayoutResult?.positions || {};

    const nodesWithPositions = data.nodes.map((node) => ({
      ...node,
      position: nodePositions[node.id] || { x: 200, y: 200 },
      type: (node?.type ?? "") in nodeTypes ? node.type : "resizerNode",
      data: {
        description: currentSceneGraph
          .getGraph()
          .getNode(node.id as NodeId)
          .getDescription(),
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
        annotation: node.type == "annotation" ? node.data.userData : undefined,
        webpage: node.type == "webpage" ? node.data.userData : undefined,
        definition:
          node.type === "definition"
            ? (node.data.userData as any).definition
            : undefined,
        classData:
          node.type === "class"
            ? (node.data.userData as any).classData
            : undefined,
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
              console.log("React Flow instance set", instance);
              if (getAutoFitView()) {
                setTimeout(() => handleReactFlowFitView(), 100);
              }
            }
          }}
          onNodesContextMenu={(event, nodeIds) =>
            handleNodesRightClick(event, nodeIds)
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
    handleNodesRightClick,
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
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
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
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "black",
            zIndex: 1,
            borderRadius: "8px", // Match the mainContent border radius
            visibility: activeView === "Editor" ? "hidden" : "visible", // Hide but keep in DOM when in Editor view
          }}
        />
      );
    }
    return null;
  }, [activeView]);

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

      // Only zoom to fit if no custom camera settings are configured
      const config = sceneGraph.getForceGraphRenderConfig();
      if (!config.cameraPosition || !config.cameraTarget) {
        zoomToFit(forceGraphInstance);
      }
    },
    [forceGraphInstance]
  );

  const { controlMode } = useMouseControlsStore();

  useEffect(() => {
    if (activeView === "ForceGraph3d" && forceGraphInstance) {
      ForceGraphManager.refreshForceGraphInstance(
        forceGraphInstance,
        currentSceneGraph,
        forceGraph3dOptions.layout,
        currentLayoutResult?.positions
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
    currentLayoutResult,
    graphModelUpdateTime,
    // selectedNodeIds, //not sure why I had these here to begin with. can prob remove now
    // selectedEdgeIds,
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
    currentSceneGraph, // Add dependency on currentSceneGraph to trigger initialization when scene graph changes
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

      // Only zoom to fit if no custom camera settings are configured
      const config = currentSceneGraph.getForceGraphRenderConfig();
      if (!config.cameraPosition || !config.cameraTarget) {
        zoomToFit(forceGraphInstance);
      }

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
    currentSceneGraph, // Add dependency to access scene graph config
  ]);

  // Add window resize handler for ForceGraph3D
  useEffect(() => {
    const handleWindowResize = () => {
      if (
        forceGraphInstance &&
        activeView === "ForceGraph3d" &&
        forceGraphRef.current
      ) {
        const container = forceGraphRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;
        forceGraphInstance.width(width).height(height);
      }
    };

    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [forceGraphInstance, activeView]);

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
          flyToNode(forceGraphInstance, node, forceGraph3dOptions.layout);
          handleHighlight(nodeId);
          setSelectedNodeId(nodeId as NodeId);
          // setRightActiveSection("node-details");
        }
      }
    },
    [
      activeView,
      forceGraph3dOptions.layout,
      forceGraphInstance,
      handleHighlight,
      zoomToNode,
    ]
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
      getSaveAsNewFilterMenuItem(
        getCurrentSceneGraph().getVisibleNodes(),
        "Save Visible as New Filter"
      ),
    ],
    [handleCreateNode]
  );

  // Wrapper for the imported node context menu items function with App-specific context
  const getNodeContextMenuItemsWithAppContext = useCallback(
    (nodeId: NodeId): ContextMenuItem[] => {
      return getNodeContextMenuItems(
        nodeId,
        currentSceneGraph,
        forceGraphInstance,
        setEntityEditorData,
        setJsonEditEntity,
        setSelectedNodeId,
        (config) =>
          setPathAnalysisConfig({
            startNode: config.startNode!,
            endNode: config.endNode,
          }),
        setShowPathAnalysis,
        applyActiveFilterToAppInstance,
        () => setContextMenu(null),
        (nodeId: NodeId) => handleShowDeleteDialog([nodeId])
      );
    },
    [
      currentSceneGraph,
      forceGraphInstance,
      setShowPathAnalysis,
      handleShowDeleteDialog,
    ]
  );

  // Add multi-node operations to create a subgraph, hide multiple nodes, etc.
  const getMultiNodeContextMenuItemsWithAppContext = useCallback(
    (nodeIds: NodeId[]): ContextMenuItem[] => {
      return getMultiNodeContextMenuItems(
        nodeIds,
        currentSceneGraph,
        applyActiveFilterToAppInstance,
        () => setContextMenu(null),
        handleShowDeleteDialog
      );
    },
    [currentSceneGraph, handleShowDeleteDialog]
  );

  // Update the existing getContextMenuItems function to handle multi-node selection
  const getContextMenuItems = useCallback(
    (nodeIds?: NodeId[]): ContextMenuItem[] => {
      if (!nodeIds || nodeIds.length === 0) {
        return getBackgroundRightClickContextMenuItems();
      } else if (nodeIds.length === 1) {
        return getNodeContextMenuItemsWithAppContext(nodeIds[0]);
      } else {
        return getMultiNodeContextMenuItemsWithAppContext(nodeIds);
      }
    },
    [
      getBackgroundRightClickContextMenuItems,
      getNodeContextMenuItemsWithAppContext,
      getMultiNodeContextMenuItemsWithAppContext,
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
  }, [
    showPathAnalysis,
    currentSceneGraph,
    isDarkMode,
    pathAnalysisConfig,
    setShowPathAnalysis,
  ]);

  // Hide/show ForceGraph3D help text based on cameraControls flag
  useEffect(() => {
    if (forceGraphInstance) {
      setTimeout(() => {
        forceGraphInstance.showNavInfo(controlMode === "orbital");
        window.dispatchEvent(new Event("resize"));
      }, 100);
    }
  }, [forceGraphInstance, controlMode]);

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

  const maybeRenderSaveAsNewProjectDialog = useMemo(() => {
    if (showSaveAsNewProjectDialog) {
      return (
        <SaveAsNewProjectDialog
          sceneGraph={currentSceneGraph}
          onSave={(projectId: string) => {
            setShowSaveAsNewProjectDialog(false);
            setActiveProjectId(projectId);
          }}
          onCancel={() => setShowSaveAsNewProjectDialog(false)}
          isDarkMode={isDarkMode}
        />
      );
    }
    return null;
  }, [
    currentSceneGraph,
    setShowSaveAsNewProjectDialog,
    showSaveAsNewProjectDialog,
    isDarkMode,
  ]);

  const maybeRenderYasgui = useMemo(() => {
    if (activeView !== "Yasgui") {
      return null;
    }

    return <SemanticWebQueryPanel sessionId="yasgui-panel" />;

    // return (
    //   <div
    //     id="yasgui"
    //     style={{
    //       position: "absolute",
    //       top: 0,
    //       width: "100%",
    //       height: "100%",
    //       zIndex: 10,
    //     }}
    //   >
    //     <YasguiPanel sceneGraph={currentSceneGraph} />
    //   </div>
    // );
  }, [activeView]);

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
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          commands={commands}
          onClose={() => setCommandPaletteOpen(false)}
          onExecuteCommand={executeCommand}
        />
        <WorkspaceV2
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
          renderNodeLegend={renderNodeLegend}
          renderEdgeLegend={renderEdgeLegend}
          showPathAnalysis={() => setShowPathAnalysis(true)}
          showLoadSceneGraphWindow={() => setShowLoadSceneGraphWindow(true)}
          showSaveSceneGraphDialog={() => setShowSaveSceneGraphDialog(true)}
          showLayoutManager={(mode: "save" | "load") =>
            setShowLayoutManager({ mode, show: true })
          }
          handleFitToView={handleFitToView}
          handleShowEntityTables={() => setShowEntityTables(true)}
          handleLoadSceneGraph={handleLoadSceneGraph}
        >
          {maybeRenderGraphviz}
          {maybeRenderForceGraph3D}
          {maybeRenderReactFlow}
          {maybeRenderYasgui}
          {maybeRenderNodeDocumentEditor()}
          {activeView === "Gallery" && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              <ImageGalleryV3
                sceneGraph={currentSceneGraph}
                addRandomImageBoxes={false}
                defaultLinksEnabled={false}
              />
            </div>
          )}
          {activeView in simulations && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              {getSimulation(activeView)}
            </div>
          )}
        </WorkspaceV2>
        {maybeRenderSaveSceneGraphWindow}
        {maybeRenderSaveAsNewProjectDialog}
        {showWorkspaceManager && (
          <WorkspaceManagerDialog isOpen={showWorkspaceManager} />
        )}
        {getShowEntityDataCard() && getHoveredNodeIds().size > 0 && (
          <EntityDataDisplayCard
            entityData={currentSceneGraph
              .getGraph()
              .getNode(Array.from(getHoveredNodeIds())[0] as NodeId)}
          />
        )}

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            items={getContextMenuItems(contextMenu.nodeIds)}
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
                  flyToNode(
                    forceGraphInstance,
                    node,
                    forceGraph3dOptions.layout
                  );
                }
              }
            }}
            isDarkMode={isDarkMode}
          />
        )}
        {showEntityTablesV2 && (
          <EntityTableDialogV2
            container={currentSceneGraph.getGraph().getNodes()}
            title="Entity Table V2"
            onClose={() => setShowEntityTablesV2(false)}
            onNodeClick={(nodeId: NodeId) => {
              setSelectedNodeId(nodeId as NodeId);
              setShowEntityTablesV2(false);
              if (activeView === "ForceGraph3d" && forceGraphInstance) {
                const node = forceGraphInstance
                  .graphData()
                  .nodes.find((n) => n.id === nodeId);
                if (node) {
                  flyToNode(
                    forceGraphInstance,
                    node,
                    forceGraph3dOptions.layout
                  );
                }
              }
            }}
            sceneGraph={currentSceneGraph}
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
        {showDeleteDialog && (
          <EntitiesContainerDialog
            isOpen={showDeleteDialog}
            onClose={handleDeleteCancel}
            title={
              deleteDialogData?.isSingleNode ? "Delete Node" : "Delete Nodes"
            }
            description={`This action cannot be undone. The following ${deleteDialogData?.isSingleNode ? "node will" : "nodes will"} be permanently deleted:`}
            entities={
              deleteDialogData
                ? deleteDialogData.nodeIds.map((id) =>
                    currentSceneGraph.getGraph().getNode(id)
                  )
                : []
            }
            type="danger"
            showConfirmation={true}
            confirmLabel={
              deleteDialogData?.isSingleNode ? "Delete Node" : "Delete Nodes"
            }
            cancelLabel="Cancel"
            onConfirm={handleDeleteConfirm}
          />
        )}
        {entityEditorData && (
          <EntityEditor
            entity={entityEditorData.entity!}
            sceneGraph={currentSceneGraph}
            isOpen={entityEditorData.isOpen}
            onClose={handleEntityEditorClose}
            onSave={handleEntityEditorSave}
            isDarkMode={isDarkMode}
          />
        )}
        {showFilter && (
          <FilterWindow
            sceneGraph={currentSceneGraph}
            onClose={() => setShowFilter(false)}
            onApplyFilter={(selectedIds) => {
              filterSceneGraphToOnlyVisibleNodes(
                new EntityIds<NodeId>(selectedIds as NodeId[])
              );
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
        {activeView === "ForceGraph3d" && controlMode === "multiselection" && (
          <SelectionBox />
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
  shouldShowLoadDialog?: boolean;
  defaultSerializedSceneGraph?: any;
}

const App: React.FC<AppProps> = ({
  defaultGraph,
  svgUrl,
  defaultActiveView,
  defaultActiveLayout,
  shouldShowLoadDialog = false,
  defaultSerializedSceneGraph,
}) => {
  return (
    <MousePositionProvider>
      <CommandProcessorProvider>
        <WorkspaceLayoutTool />
        <AppShellProvider>
          <InitialWorkspaceLoader>
            <SemanticWebQueryProvider>
              <AppContent
                defaultGraph={defaultGraph}
                svgUrl={svgUrl}
                defaultActiveView={defaultActiveView}
                defaultActiveLayout={defaultActiveLayout}
                shouldShowLoadDialog={shouldShowLoadDialog}
                defaultSerializedSceneGraph={defaultSerializedSceneGraph}
              />
            </SemanticWebQueryProvider>
          </InitialWorkspaceLoader>
        </AppShellProvider>
      </CommandProcessorProvider>
      <LayoutComputationDialog />
    </MousePositionProvider>
  );
};

export default App;
