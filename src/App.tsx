import { useAppShell } from "@aesgraph/app-shell";
import { Position } from "@xyflow/react";
import { Settings2 } from "lucide-react";
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
import WorkspaceManagerDialog from "./components/dialogs/WorkspaceManagerDialog";
import FilterManager from "./components/filters/FilterManager";
import FilterWindow from "./components/filters/FilterWindow";
import { IMenuConfigCallbacks, MenuConfig } from "./components/MenuConfig";
import NodeEditorWizard from "./components/NodeEditorWizard";
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
import AudioAnnotator from "./_experimental/mp3/AudioAnnotator";
import GravitySimulation3 from "./_experimental/webgl/simulations/GravitySimulation3";
import SolarSystem from "./_experimental/webgl/simulations/solarSystemSimulation";
import ChatGptImporter from "./components/applets/ChatGptImporter/ChatGptImporter";
import LexicalEditorV2 from "./components/applets/Lexical/LexicalEditor";
import StoryCardApp from "./components/applets/StoryCards/StoryCardApp";
import WikipediaArticleViewer from "./components/applets/WikipediaViewer/WikipediaArticleViewer";
import WikipediaArticleViewer_FactorGraph from "./components/applets/WikipediaViewer/WikipediaArticleViewer_FactorGraph";
import { CommandProcessorProvider } from "./components/commandPalette/CommandProcessor";
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
import InitialWorkspaceLoader from "./components/InitialWorkspaceLoader";
import NodeDocumentEditor from "./components/NodeDocumentEditor";
import SaveAsNewProjectDialog from "./components/projects/SaveAsNewProjectDialog";
import { SemanticWebQueryProvider } from "./components/semantic/SemanticWebQueryContext";
import { enableZoomAndPanOnSvg } from "./components/svg/appHelpers";
import ForceGraphRenderConfigEditor from "./components/views/ForceGraph3d/ForceGraphRenderConfigEditor";
import { WorkspaceLayoutTool } from "./components/workspace/WorkspaceLayoutTool";
import { getHotkeyConfig } from "./configs/hotkeyConfig";
import { ApiProviderProvider } from "./context/ApiProviderContext";
import { AppProvider, useAppContext } from "./context/AppContext";
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
import { workspaceStateManager } from "./utils/workspaceStateManager";
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
  return (
    <AppProvider>
      <AppContentInner
        defaultGraph={defaultGraph}
        svgUrl={svgUrl}
        defaultActiveView={defaultActiveView}
        defaultActiveLayout={defaultActiveLayout}
        shouldShowLoadDialog={shouldShowLoadDialog}
        defaultSerializedSceneGraph={defaultSerializedSceneGraph}
      />
    </AppProvider>
  );
};

const AppContentInner = ({
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

  // Get entity editing methods from AppContext
  const { editingEntity, jsonEditEntity, setEditingEntity, setJsonEditEntity } =
    useAppContext();

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
      if (activeView === "ReactFlow" && getAutoFitView()) {
        // Use the global function from ReactFlowPanelV2
        if ((window as any).reactFlowFitView) {
          (window as any).reactFlowFitView();
        }
      }
    },
    [activeView]
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

  const [isNodeEditorOpen, setIsNodeEditorOpen] = useState(false);

  // Get context menu and handlers from AppContext
  const {
    contextMenu,
    setContextMenu,
    handleNodesRightClick,
    handleBackgroundRightClick,
  } = useAppContext();

  const handleCreateNode = useCallback(() => {
    setIsNodeEditorOpen(true);
    setContextMenu(null);
  }, [setContextMenu]);

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

  const {
    saveCurrentLayout,
    applyWorkspaceLayout,
    getAllWorkspaces,
    getCurrentWorkspace,
  } = useAppShell();

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
      // but preserve URL parameters if they were set
      if (graph.getData().defaultAppConfig) {
        console.log(
          "Applying scene graph app config:",
          graph.getData().defaultAppConfig
        );

        // Create a merged config that preserves URL parameters
        const defaultConfig = graph.getData().defaultAppConfig!;
        const mergedConfig = {
          ...defaultConfig,
          // Preserve URL parameters if they were set
          activeView: defaultActiveView ?? defaultConfig.activeView,
          activeLayout: defaultActiveLayout ?? defaultConfig.activeLayout,
        };

        setAppConfig(mergedConfig);
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

      // Check if we should set the scene graph immediately (for Physics mode)
      const isPhysicsMode =
        graph.getData().defaultAppConfig?.forceGraph3dOptions?.layout ===
          "Physics" &&
        graph.getData().defaultAppConfig?.activeView === "ForceGraph3d";

      // Helper function to set up scene graph and configuration
      const setupSceneGraph = () => {
        setCurrentSceneGraph(graph);
        workspaceStateManager.setCurrentSceneGraph(graph);

        console.log(
          isPhysicsMode
            ? "Physics mode - immediate setup"
            : "Layout mode - setup after layout"
        );

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

        setActiveFilter(graph.getData().defaultAppConfig?.activeFilter ?? null);

        // Handle workspace config
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

        // Apply appShellLayout if specified
        const appShellLayout =
          graph.getData()?.defaultAppConfig?.appShellLayout;
        if (appShellLayout && applyWorkspaceLayout) {
          console.log(`Applying workspace layout: ${appShellLayout}`);
          applyWorkspaceLayout(appShellLayout).catch((error) => {
            console.warn(
              `Failed to apply workspace layout ${appShellLayout}:`,
              error
            );
          });
        } else {
          const restored = workspaceStateManager.restoreWorkspaceState();
          if (restored) {
            console.log("Restored workspace state from scenegraph");
          }
        }
      };

      if (isPhysicsMode) {
        console.log("Physics mode detected - setting scene graph immediately");
        setupSceneGraph();

        // Run layout computation in background for Physics mode
        safeComputeLayout(
          graph,
          layoutToLoad,
          graph.getData().defaultAppConfig?.forceGraph3dOptions?.layout
        )
          .then(() => {
            console.log(
              "Background layout computation completed for Physics mode"
            );
          })
          .catch((error) => {
            console.warn("Background layout computation failed:", error);
          });
      } else {
        // For non-Physics modes, wait for layout computation
        safeComputeLayout(
          graph,
          layoutToLoad,
          graph.getData().defaultAppConfig?.forceGraph3dOptions?.layout
        ).then(() => {
          console.log("loaded layout", layoutToLoad);
          setupSceneGraph();
        });
      }

      const tock = Date.now();
      console.log("TOTAL TIME", tock - tick);
      onLoaded?.(graph);
      addNotification({
        message: `Loaded SceneGraph: ${graph.getMetadata().name}`,
        type: "success",
        groupId: "load-scene-graph",
      });
    },
    [
      applyWorkspaceLayout,
      clearGraphFromUrl,
      clearUrlOfQueryParams,
      defaultActiveLayout,
      defaultActiveView,
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
      } else if (activeView === "ReactFlow") {
        // Use the global function from ReactFlowPanelV2
        if ((window as any).reactFlowFitView) {
          (window as any).reactFlowFitView();
        }
      }
    },
    [forceGraphInstance, graphvizFitToView, handleReactFlowFitView]
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

  // Auto-save workspace state to scenegraph when it changes
  useEffect(() => {
    const autoSaveWorkspaceState = async () => {
      if (
        currentSceneGraph &&
        currentSceneGraph.getMetadata().name !== "Empty"
      ) {
        try {
          await workspaceStateManager.captureAndSaveCurrentState();
        } catch (error) {
          console.warn("Failed to auto-save workspace state:", error);
        }
      }
    };

    // Set up auto-save interval (every 30 seconds)
    const interval = setInterval(autoSaveWorkspaceState, 30000);

    return () => clearInterval(interval);
  }, [currentSceneGraph]);

  // Add state to track the last saved workspace layout
  const [lastWorkspaceLayout, setLastWorkspaceLayout] = useState<string | null>(
    null
  );

  // Manual save workspace state to scenegraph
  const _saveWorkspaceStateToSceneGraph = useCallback(async () => {
    if (currentSceneGraph && currentSceneGraph.getMetadata().name !== "Empty") {
      try {
        const savedState =
          await workspaceStateManager.captureAndSaveCurrentState();
        if (savedState) {
          console.log(
            "Manually saved workspace state to scenegraph:",
            savedState.id
          );
          addNotification({
            message: "Workspace state saved to scenegraph",
            type: "success",
            groupId: "workspace-save",
          });
        }
      } catch (error) {
        console.error("Failed to save workspace state to scenegraph:", error);
        addNotification({
          message: "Failed to save workspace state",
          type: "error",
          groupId: "workspace-save",
        });
      }
    }
  }, [currentSceneGraph]);

  // Initialize lastWorkspaceLayout from localStorage on mount
  useEffect(() => {
    const savedLayoutId = localStorage.getItem(
      "unigraph-last-workspace-layout"
    );
    if (savedLayoutId) {
      console.log(
        "Restored workspace layout ID from localStorage:",
        savedLayoutId
      );
      setLastWorkspaceLayout(savedLayoutId);
    }
  }, []);

  // Save workspace layout ID to localStorage whenever it changes
  useEffect(() => {
    if (lastWorkspaceLayout) {
      localStorage.setItem(
        "unigraph-last-workspace-layout",
        lastWorkspaceLayout
      );
      console.log(
        "Saved workspace layout ID to localStorage:",
        lastWorkspaceLayout
      );
    } else {
      localStorage.removeItem("unigraph-last-workspace-layout");
      console.log("Removed workspace layout ID from localStorage");
    }
  }, [lastWorkspaceLayout]);

  // Clean up old auto-saved layouts on component mount
  useEffect(() => {
    const cleanupOldAutoSaves = async () => {
      try {
        const workspaces = getAllWorkspaces();
        const autoSaveWorkspaces = workspaces.filter(
          (w) => w.name === "Autosaved"
        );

        // Since we now use a fixed name "Autosaved", we don't need to clean up multiple versions
        // The workspace will simply be overwritten when a new autosave is created
        console.log(
          "Found autosaved workspace:",
          autoSaveWorkspaces.length > 0 ? "yes" : "no"
        );
      } catch (error) {
        console.error("Error checking autosaved workspace:", error);
      }
    };

    cleanupOldAutoSaves();
  }, [getAllWorkspaces]);

  const handleSetActiveView = useCallback(
    (key: string, fitToView: boolean = false) => {
      console.log("Setting active view", key);
      const currentView = getActiveView();

      // If we're currently in AppShell view and switching to a different view,
      // save the current workspace layout
      if (currentView === "AppShell" && key !== "AppShell") {
        const workspaceName = `Autosaved`;
        console.log("Saving workspace layout with name:", workspaceName);
        saveCurrentLayout(workspaceName)
          .then((result) => {
            console.log("Save result:", result);
            // Store the workspace ID if available, otherwise use the name
            const workspaceId = result?.id || workspaceName;
            setLastWorkspaceLayout(workspaceId);
            console.log(
              "Saved workspace layout before switching to:",
              key,
              "ID:",
              workspaceId
            );
            addNotification({
              message: "Workspace layout saved",
              type: "info",
              duration: 2000,
            });
          })
          .catch((error) => {
            console.error("Failed to save workspace layout:", error);
            addNotification({
              message: "Failed to save workspace layout",
              type: "error",
              duration: 3000,
            });
          });
      }

      // If we're switching to AppShell view and we have a saved layout, restore it
      if (key === "AppShell" && lastWorkspaceLayout) {
        console.log(
          "Attempting to restore workspace layout:",
          lastWorkspaceLayout
        );

        // First, let's check if the workspace exists
        const workspaces = getAllWorkspaces();
        console.log("Available workspaces:", workspaces);

        const targetWorkspace = workspaces.find(
          (w) => w.id === lastWorkspaceLayout || w.name === lastWorkspaceLayout
        );

        if (!targetWorkspace) {
          console.warn("Target workspace not found:", lastWorkspaceLayout);
          addNotification({
            message: "Workspace layout not found",
            type: "warning",
            duration: 3000,
          });
          // Clear the invalid layout reference
          setLastWorkspaceLayout(null);
          return;
        }

        console.log("Found target workspace:", targetWorkspace);

        // Small delay to ensure the AppShell view is mounted
        setTimeout(() => {
          applyWorkspaceLayout(targetWorkspace.id)
            .then((success) => {
              if (success) {
                console.log("Restored workspace layout:", targetWorkspace.name);
                addNotification({
                  message: "Workspace layout restored",
                  type: "success",
                  duration: 2000,
                });
              } else {
                console.warn(
                  "Failed to restore workspace layout:",
                  targetWorkspace.name
                );
                addNotification({
                  message: "Failed to restore workspace layout",
                  type: "warning",
                  duration: 3000,
                });

                // Try to load a default workspace as fallback
                console.log("Attempting to load default workspace as fallback");
                applyWorkspaceLayout("clean-workspace")
                  .then((fallbackSuccess) => {
                    if (fallbackSuccess) {
                      console.log("Loaded default workspace as fallback");
                      addNotification({
                        message: "Loaded default workspace layout",
                        type: "info",
                        duration: 2000,
                      });
                    } else {
                      console.warn(
                        "Failed to load default workspace as fallback"
                      );
                    }
                  })
                  .catch((fallbackError) => {
                    console.error(
                      "Error loading default workspace:",
                      fallbackError
                    );
                  });
              }
            })
            .catch((error) => {
              console.error("Error restoring workspace layout:", error);
              addNotification({
                message: `Error restoring workspace layout: ${error.message || "Unknown error"}`,
                type: "error",
                duration: 3000,
              });

              // Try to load a default workspace as fallback
              console.log(
                "Attempting to load default workspace as fallback after error"
              );
              applyWorkspaceLayout("clean-workspace")
                .then((fallbackSuccess) => {
                  if (fallbackSuccess) {
                    console.log(
                      "Loaded default workspace as fallback after error"
                    );
                    addNotification({
                      message: "Loaded default workspace layout",
                      type: "info",
                      duration: 2000,
                    });
                  } else {
                    console.warn(
                      "Failed to load default workspace as fallback after error"
                    );
                  }
                })
                .catch((fallbackError) => {
                  console.error(
                    "Error loading default workspace after error:",
                    fallbackError
                  );
                });
            });
        }, 100);
      }

      setActiveView(key);
      if (fitToView) {
        handleFitToView(key);
      }
      const url = new URL(window.location.href);
      url.searchParams.set("view", key);
      window.history.pushState({}, "", url.toString());
    },
    [
      lastWorkspaceLayout,
      setActiveView,
      saveCurrentLayout,
      getAllWorkspaces,
      applyWorkspaceLayout,
      handleFitToView,
    ]
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
  const [showDisplayConfig, setShowDisplayConfig] = useState(false);
  const displayConfigEditorRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close display config editor
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showDisplayConfig &&
        displayConfigEditorRef.current &&
        !displayConfigEditorRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(
          'button[title="Display Configuration"]'
        )
      ) {
        setShowDisplayConfig(false);
      }
    };

    if (showDisplayConfig) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDisplayConfig]);

  // Handle ForceGraph display config changes
  const handleApplyForceGraphConfig = useCallback(
    (config: IForceGraphRenderConfig) => {
      console.log("Applying ForceGraph config:", config);
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
        getCurrentWorkspace,
      },
    };
    return new MenuConfig(
      menuConfigCallbacks,
      currentSceneGraph,
      forceGraphInstance
    );
  }, [
    handleSetSceneGraph,
    handleImportConfig,
    handleFitToView,
    GraphMenuActions,
    SimulationMenuActions,
    setShowEntityTables,
    saveCurrentLayout,
    applyWorkspaceLayout,
    getAllWorkspaces,
    getCurrentWorkspace,
    currentSceneGraph,
    forceGraphInstance,
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
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }}
        >
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
              borderRadius: "8px", // Match the mainContent border radius
              visibility: activeView === "Editor" ? "hidden" : "visible", // Hide but keep in DOM when in Editor view
            }}
          />

          {/* Display Config Button/Panel - transforms from button to panel */}
          {activeView === "ForceGraph3d" && (
            <div
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                zIndex: 999999999,
                transition: "all 0.3s ease",
                transform: showDisplayConfig ? "scale(1)" : "scale(1)",
              }}
            >
              {!showDisplayConfig ? (
                // Button state
                <button
                  onClick={() => setShowDisplayConfig(true)}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)",
                    color: isDarkMode ? "#e2e8f0" : "#1f2937",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                    backdropFilter: "blur(10px)",
                  }}
                  title="Display Configuration"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(0, 0, 0, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <Settings2 size={20} />
                </button>
              ) : (
                // Panel state
                <div
                  ref={displayConfigEditorRef}
                  style={{
                    width: "320px",
                    maxWidth: "calc(100vw - 40px)",
                    maxHeight: "calc(100vh - 40px)",
                    backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                    border: `1px solid ${isDarkMode ? "#374151" : "#d1d5db"}`,
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderBottom: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
                      backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        fontWeight: "600",
                        color: isDarkMode ? "#e2e8f0" : "#1f2937",
                      }}
                    >
                      Display Configuration
                    </h3>
                    <button
                      onClick={() => setShowDisplayConfig(false)}
                      style={{
                        background: "none",
                        border: "none",
                        color: isDarkMode ? "#9ca3af" : "#6b7280",
                        cursor: "pointer",
                        padding: "4px",
                        borderRadius: "4px",
                        fontSize: "16px",
                        lineHeight: "1",
                        transition: "color 0.2s ease",
                      }}
                      title="Close"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = isDarkMode
                          ? "#e2e8f0"
                          : "#1f2937";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = isDarkMode
                          ? "#9ca3af"
                          : "#6b7280";
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <div
                    style={{
                      maxHeight: "calc(100vh - 100px)",
                      overflowY: "auto",
                      padding: "16px",
                    }}
                  >
                    <ForceGraphRenderConfigEditor
                      onApply={handleApplyForceGraphConfig}
                      isDarkMode={isDarkMode}
                      initialConfig={
                        currentSceneGraph?.getForceGraphRenderConfig() || {
                          nodeTextLabels: false,
                          linkWidth: 2,
                          nodeSize: 6,
                          linkTextLabels: true,
                          nodeOpacity: 1,
                          linkOpacity: 1,
                          backgroundColor: "#1a1a1a",
                          fontSize: 12,
                        }
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  }, [
    activeView,
    showDisplayConfig,
    isDarkMode,
    handleApplyForceGraphConfig,
    currentSceneGraph,
  ]);

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
      // Skip refreshing ForceGraph3D if in Physics mode to prevent unnecessary reinitialization
      if (forceGraph3dOptions.layout === "Physics") {
        console.log("Skipping ForceGraph3D refresh for Physics mode");
        return;
      }

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
    // Skip currentLayoutResult dependency for Physics mode to prevent reinitialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...(forceGraph3dOptions.layout !== "Physics" ? [currentLayoutResult] : []),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    forceGraphInstance,
    // Skip currentLayoutResult dependency for Physics mode to prevent applying fixed positions
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...(forceGraph3dOptions.layout !== "Physics" ? [currentLayoutResult] : []),
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
      setJsonEditEntity,
      setShowPathAnalysis,
      setContextMenu,
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
    [currentSceneGraph, handleShowDeleteDialog, setContextMenu]
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

  const handleJsonEditSave = (newData: any) => {
    // This will be handled by the AppContext now
    console.log("JSON edit save:", newData);
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
                flyToNode(forceGraphInstance, node, forceGraph3dOptions.layout);
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
                flyToNode(forceGraphInstance, node, forceGraph3dOptions.layout);
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
        <ApiProviderProvider>
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
        </ApiProviderProvider>
      </CommandProcessorProvider>
      <LayoutComputationDialog />
    </MousePositionProvider>
  );
};

export default App;
