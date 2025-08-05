import { getColor, useTheme } from "@aesgraph/app-shell";
import { Info } from "lucide-react";
import React, { useMemo } from "react";
import { findNodeInForceGraph } from "../../core/force-graph/forceGraphHelpers";
import { SceneGraph } from "../../core/model/SceneGraph";
import { flyToNode } from "../../core/webgl/webglHelpers";
import useAppConfigStore from "../../store/appConfigStore";
import { getSelectedNodeId } from "../../store/graphInteractionStore";
import { useMouseControlsStore } from "../../store/mouseControlsStore";
import {
  applyActiveFilterToAppInstance,
  clearFiltersOnAppInstance,
} from "../../store/sceneGraphHooks";
import useWorkspaceConfigStore, {
  defaultSectionWidth,
  getSectionWidth,
  updateSectionWidth,
} from "../../store/workspaceConfigStore";
import NodeInfo from "../NodeInfo";
import NotificationManager from "../notifications/NotificationManager";
import {
  createDefaultLeftMenus,
  leftFooterContent,
  MenuItem,
} from "./LeftSidebarConfig";
import {
  createDefaultRightMenus,
  rightFooterContent,
} from "./RightSidebarConfig";
import Sidebar from "./Sidebar";
import UniAppToolbar, { IMenuConfig } from "./UniAppToolbar";
import styles from "./Workspace.module.css";

const sidebarDisabledViews = ["Gallery", "Simulation", "Lexical", "Editor"];

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
}) => {
  const { theme } = useTheme();

  const { showToolbar, leftSidebarConfig, rightSidebarConfig } =
    useWorkspaceConfigStore();

  const { activeView, activeLayout, forceGraph3dOptions, forceGraphInstance } =
    useAppConfigStore();

  const { controlMode } = useMouseControlsStore();

  const { activeFilter } = useAppConfigStore();

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

  const renderLeftSideBar = useMemo(() => {
    if (!leftSidebarConfig.isVisible) {
      return null;
    }
    if (sidebarDisabledViews.includes(activeView)) {
      return null;
    }

    const config = createDefaultLeftMenus({
      activeLayout: activeLayout,
      physicsMode:
        forceGraph3dOptions.layout === "Physics" &&
        activeView === "ForceGraph3d",
      isDarkMode,
      onApplyForceGraphConfig: onApplyForceGraphConfig,
      initialForceGraphConfig: currentSceneGraph.getForceGraphRenderConfig(),
      sceneGraph: currentSceneGraph,
      onShowFilter: showFilterWindow,
      onShowFilterManager: showFilterManager,
      onShowPathAnalysis: showPathAnalysis,
      onShowLoadSceneGraphWindow: showLoadSceneGraphWindow,
      onShowSaveSceneGraphDialog: showSaveSceneGraphDialog,
      showLayoutManager: (mode: "save" | "load") => showLayoutManager(mode),
      activeView: activeView, // Make sure this is correctly passed
      activeFilter: activeFilter,
      handleLoadSceneGraph: handleLoadSceneGraph,
      handleSetActiveFilter: applyActiveFilterToAppInstance,
      theme,
    });

    return (
      <Sidebar
        position="left"
        style={{
          height: "100%",
          top: 0,
          backgroundColor: getColor(theme.colors, "workspacePanel"),
        }}
        menuItems={config.mainMenus}
        bottomElements={config.bottomElements}
        isDarkMode={isDarkMode}
        footer={(isOpen: boolean) => leftFooterContent(isOpen, theme)}
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
    showPathAnalysis,
    showLoadSceneGraphWindow,
    showSaveSceneGraphDialog,
    activeFilter,
    handleLoadSceneGraph,
    theme,
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
      isDarkMode,
      theme
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
          icon: (
            <Info
              size={20}
              className={styles.menuIcon}
              style={{
                color: getColor(theme.colors, "text"),
              }}
            />
          ),
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
                    flyToNode(
                      forceGraphInstance!,
                      node,
                      forceGraph3dOptions.layout
                    );
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
                    flyToNode(
                      forceGraphInstance!,
                      node,
                      forceGraph3dOptions.layout
                    );
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
          backgroundColor: getColor(theme.colors, "workspacePanel"),
        }}
        title="Controls"
        menuItems={menuItems}
        isDarkMode={isDarkMode}
        mode={rightSidebarConfig.mode}
        minimal={rightSidebarConfig.minimal}
        footer={(isOpen) =>
          rightFooterContent(
            isOpen,
            {
              onFitToView: () => handleFitToView(activeView),
              onViewEntities: () => handleShowEntityTables(),
              onClearFilters: () => clearFiltersOnAppInstance(),
              details: {
                sceneGraphName: currentSceneGraph.name,
                activeLayout: activeLayout,
                activeFilter: activeFilter?.name,
                activeView: activeView,
                mouseControls: controlMode,
              },
            },
            theme
          )
        }
      />
    );
  }, [
    rightSidebarConfig.isVisible,
    rightSidebarConfig.mode,
    rightSidebarConfig.minimal,
    activeView,
    isDarkMode,
    theme,
    selectedNodeId,
    renderLayoutModeRadio,
    renderNodeLegend,
    renderEdgeLegend,
    forceGraphInstance,
    forceGraph3dOptions.layout,
    currentSceneGraph.name,
    activeLayout,
    activeFilter?.name,
    controlMode,
    handleFitToView,
    handleShowEntityTables,
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
    <div
      className={styles.workspace}
      style={{
        backgroundColor: getColor(theme.colors, "workspaceBackground"),
      }}
    >
      {renderUniappToolbar}
      <NotificationManager />
      <div
        className={styles.content}
        style={{
          backgroundColor: getColor(theme.colors, "workspaceBackground"),
        }}
      >
        <div className={styles.sidebarLayer}>{renderLeftSideBar}</div>
        <div
          className={styles.mainContent}
          style={{
            margin: theme.sizes.spacing.sm, // Add small margin using theme spacing
            backgroundColor: getColor(theme.colors, "workspacePanel"), // Use workspace panel color for the main content area
          }}
        >
          {children}
        </div>
        <div className={styles.sidebarLayer}>{renderRightSideBar}</div>
      </div>
    </div>
  );
};

export default Workspace;
