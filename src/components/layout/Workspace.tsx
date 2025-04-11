import { Info } from "lucide-react";
import React, { useMemo } from "react";
import {
  createDefaultLeftMenus,
  leftFooterContent,
  MenuItem,
} from "../../configs/LeftSidebarConfig";
import {
  createDefaultRightMenus,
  rightFooterContent,
} from "../../configs/RightSidebarConfig";
import { findNodeInForceGraph } from "../../core/force-graph/forceGraphHelpers";
import { DisplayManager } from "../../core/model/DisplayManager";
import { SceneGraph } from "../../core/model/SceneGraph";
import { flyToNode } from "../../core/webgl/webglHelpers";
import Sidebar from "../../Sidebar";
import { Filter } from "../../store/activeFilterStore";
import { ResetNodeAndEdgeLegends } from "../../store/activeLegendConfigStore";
import useAppConfigStore from "../../store/appConfigStore";
import { getSelectedNodeId } from "../../store/graphInteractionStore";
import useWorkspaceConfigStore, {
  defaultSectionWidth,
  getSectionWidth,
  updateSectionWidth,
} from "../../store/workspaceConfigStore";
import NodeInfo from "../NodeInfo";
import NotificationManager from "../notifications/NotificationManager";
import UniAppToolbar, { IMenuConfig } from "../UniAppToolbar";
import styles from "./Workspace.module.css";

const sidebarDisabledViews = [
  "Yasgui",
  "Gallery",
  "Simulation",
  "Lexical",
  "Editor",
];

interface WorkspaceProps {
  menuConfig: IMenuConfig;
  currentSceneGraph: any;
  isDarkMode: boolean;
  selectedSimulation: string;
  simulations: any;
  children: React.ReactNode;
  onViewChange: (view: string) => void;
  onSelectResult: (nodeId: string) => void;
  onSearchResult: (nodeIds: string[]) => void;
  onHighlight: (nodeId: string) => void;
  onApplyForceGraphConfig: (config: any) => void;
  renderLayoutModeRadio: () => React.ReactNode;
  showFilterWindow: () => void;
  showFilterManager: () => void;
  renderNodeLegend: React.ReactNode;
  renderEdgeLegend: React.ReactNode;
  showPathAnalysis: () => void;
  showLoadSceneGraphWindow: () => void;
  showSaveSceneGraphDialog: () => void;
  showLayoutManager: (mode: "save" | "load") => void;
  handleFitToView: (activeView: string) => void;
  handleShowEntityTables: () => void;
  handleLoadSceneGraph: (sceneGraph: SceneGraph) => void;
  handleSetActiveFilter: (filter: Filter) => void;
}

const Workspace: React.FC<WorkspaceProps> = ({
  menuConfig,
  currentSceneGraph,
  isDarkMode,
  selectedSimulation,
  simulations,
  children,
  onViewChange,
  onSelectResult,
  onSearchResult,
  onHighlight,
  onApplyForceGraphConfig,
  renderLayoutModeRadio,
  showFilterWindow,
  showFilterManager,
  renderNodeLegend,
  renderEdgeLegend,
  showPathAnalysis,
  showLoadSceneGraphWindow,
  showSaveSceneGraphDialog,
  showLayoutManager,
  handleFitToView,
  handleShowEntityTables,
  handleLoadSceneGraph,
  handleSetActiveFilter,
}) => {
  const { showToolbar, leftSidebarConfig, rightSidebarConfig } =
    useWorkspaceConfigStore();

  const { activeView, activeLayout, forceGraph3dOptions, forceGraphInstance } =
    useAppConfigStore();

  const { setActiveFilter, activeFilter } = useAppConfigStore();

  const renderUniappToolbar = useMemo(() => {
    if (!showToolbar) {
      return null;
    }
    return (
      <div className={styles.toolbar}>
        <UniAppToolbar
          config={menuConfig}
          sceneGraph={currentSceneGraph}
          activeView={activeView}
          onViewChange={onViewChange}
          simulationList={Object.keys(simulations)}
          selectedSimulation={selectedSimulation}
          isDarkMode={isDarkMode}
          onSelectResult={onSelectResult}
          onSearchResult={onSearchResult}
          onHighlight={onHighlight}
        />
      </div>
    );
  }, [
    activeView,
    currentSceneGraph,
    isDarkMode,
    menuConfig,
    onHighlight,
    onSearchResult,
    onSelectResult,
    onViewChange,
    selectedSimulation,
    showToolbar,
    simulations,
  ]);

  const clearFilters = React.useCallback(() => {
    DisplayManager.setAllVisible(currentSceneGraph.getGraph());
    console.log("calling");
    ResetNodeAndEdgeLegends(currentSceneGraph);
    setActiveFilter(null);
  }, [currentSceneGraph, setActiveFilter]);

  const renderLeftSideBar = useMemo(() => {
    if (!leftSidebarConfig.isVisible) {
      return null;
    }
    if (sidebarDisabledViews.includes(activeView)) {
      return null;
    }
    return (
      <Sidebar
        position="left"
        style={{
          height: "100%",
          top: 0,
        }}
        menuItems={createDefaultLeftMenus({
          activeLayout: activeLayout,
          physicsMode:
            forceGraph3dOptions.layout === "Physics" &&
            activeView === "ForceGraph3d",
          isDarkMode,
          onApplyForceGraphConfig: onApplyForceGraphConfig,
          initialForceGraphConfig:
            currentSceneGraph.getForceGraphRenderConfig(),
          sceneGraph: currentSceneGraph,
          onShowFilter: showFilterWindow,
          onShowFilterManager: showFilterManager,
          onClearFilters: clearFilters,
          onShowPathAnalysis: showPathAnalysis,
          onShowLoadSceneGraphWindow: showLoadSceneGraphWindow,
          onShowSaveSceneGraphDialog: showSaveSceneGraphDialog,
          showLayoutManager: (mode: "save" | "load") => showLayoutManager(mode),
          activeView: activeView, // Make sure this is correctly passed
          activeFilter: activeFilter,
          handleLoadSceneGraph: handleLoadSceneGraph,
          handleSetActiveFilter: handleSetActiveFilter,
        })}
        isDarkMode={isDarkMode}
        footer={leftFooterContent}
        minimal={leftSidebarConfig.minimal}
        mode={leftSidebarConfig.mode}
      />
    );
  }, [
    leftSidebarConfig.isVisible,
    leftSidebarConfig.minimal,
    leftSidebarConfig.mode,
    activeView,
    activeLayout,
    forceGraph3dOptions.layout,
    isDarkMode,
    onApplyForceGraphConfig,
    currentSceneGraph,
    showFilterWindow,
    showFilterManager,
    clearFilters,
    showPathAnalysis,
    showLoadSceneGraphWindow,
    showSaveSceneGraphDialog,
    activeFilter,
    handleLoadSceneGraph,
    handleSetActiveFilter,
    showLayoutManager,
  ]);

  // Monitor for selected node to show dynamic section
  const selectedNodeId = getSelectedNodeId();

  const renderRightSideBar = useMemo(() => {
    if (
      !rightSidebarConfig.isVisible ||
      sidebarDisabledViews.includes(activeView)
    ) {
      return null;
    }

    // Create base menu items with standard sections
    const menuItems = createDefaultRightMenus(
      () => (
        <>
          {renderLayoutModeRadio()}
          {renderNodeLegend}
          {renderEdgeLegend}
        </>
      ),
      activeView === "ForceGraph3d",
      isDarkMode
    );

    // Dynamically add Node Details section when a node is selected
    if (selectedNodeId) {
      // Find if node details already exists
      const nodeDetailsExists = menuItems.some(
        (item) => item.id === "node-details"
      );

      if (!nodeDetailsExists) {
        // Use push instead of unshift to add the node details at the end of the menu
        menuItems.push({
          id: "node-details",
          icon: <Info size={20} className={styles.menuIcon} />,
          label: "Node Details",
          content: (
            <NodeInfo
              onFocusNode={(nodeId) => {
                if (forceGraphInstance && activeView === "ForceGraph3d") {
                  const node = findNodeInForceGraph(
                    forceGraphInstance!,
                    nodeId
                  );
                  if (node) {
                    flyToNode(forceGraphInstance!, node);
                  }
                }
              }}
              onZoomToNode={(nodeId) => {
                if (forceGraphInstance && activeView === "ForceGraph3d") {
                  const node = findNodeInForceGraph(
                    forceGraphInstance!,
                    nodeId
                  );
                  if (node) {
                    flyToNode(forceGraphInstance!, node);
                  }
                }
              }}
            />
          ),
        });
      }
    }

    return (
      <Sidebar
        position="right"
        style={{
          height: "100%",
          top: 0,
        }}
        title="Controls"
        menuItems={menuItems}
        isDarkMode={isDarkMode}
        mode={rightSidebarConfig.mode}
        minimal={rightSidebarConfig.minimal}
        footer={(isOpen) =>
          rightFooterContent(isOpen, {
            onFitToView: () => handleFitToView(activeView),
            onViewEntities: () => handleShowEntityTables(),
          })
        }
      />
    );
  }, [
    rightSidebarConfig.isVisible,
    rightSidebarConfig.mode,
    rightSidebarConfig.minimal,
    activeView,
    isDarkMode,
    renderLayoutModeRadio,
    renderNodeLegend,
    renderEdgeLegend,
    handleFitToView,
    handleShowEntityTables,
    selectedNodeId,
    forceGraphInstance,
  ]);

  const _renderSidebarPanel = (menu: MenuItem, isActive: boolean) => {
    // Get the section width or use a default
    const panelWidth = getSectionWidth(menu.id) || defaultSectionWidth;

    return (
      <div
        className={`sidebar-panel ${isActive ? "active" : ""}`}
        style={{
          width: panelWidth,
          // ...other styles
        }}
      >
        {menu.content}
      </div>
    );
  };

  // You might also need to update the sidebar resize handling to save changes
  const _handleSidebarResize = (id: string, newWidth: number) => {
    updateSectionWidth(id, newWidth);
  };

  return (
    <div className={styles.workspace}>
      {renderUniappToolbar}
      <NotificationManager />
      <div className={styles.content}>
        <div className={styles.sidebarLayer}>{renderLeftSideBar}</div>
        <main className={styles.main}>
          {/* Remove the NodeDocumentEditor rendering logic and just show the graph */}
          <div className={styles.graphContainer}>{children}</div>
        </main>
        <div className={styles.sidebarLayer}>{renderRightSideBar}</div>
      </div>
    </div>
  );
};

export default Workspace;
