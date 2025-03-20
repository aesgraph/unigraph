import React, { useMemo } from "react";
import {
  createDefaultLeftMenus,
  leftFooterContent,
} from "../../configs/LeftSidebarConfig";
import {
  createDefaultRightMenus,
  rightFooterContent,
} from "../../configs/RightSidebarConfig";
import { LayoutEngineOption } from "../../core/layouts/LayoutEngine";
import { NodePositionData } from "../../core/layouts/layoutHelpers";
import Sidebar from "../../Sidebar";
import UniAppToolbar, { IMenuConfig } from "../UniAppToolbar";
import styles from "./Workspace.module.css";

const sidebarDisabledViews = ["Yasgui", "Gallery", "Simulation"];

interface WorkspaceProps {
  menuConfig: IMenuConfig;
  currentSceneGraph: any;
  appConfig: any;
  isDarkMode: boolean;
  selectedSimulation: string;
  simulations: any;
  children: React.ReactNode;
  onViewChange: (view: string) => void;
  onSelectResult: (nodeId: string) => void;
  onSearchResult: (nodeIds: string[]) => void;
  onHighlight: (nodeId: string) => void;
  onApplyForceGraphConfig: (config: any) => void;
  setSelectedForceGraph3dLayoutMode: (mode: any) => void;
  applyNewLayout: (layout: LayoutEngineOption) => void;
  renderLayoutModeRadio: () => React.ReactNode;
  showFilterWindow: () => void;
  showFilterManager: () => void;
  clearFilters: () => void;
  renderNodeLegend: React.ReactNode;
  renderEdgeLegend: React.ReactNode;
  showToolbar?: boolean;
  showLeftSidebar?: boolean;
  showRightSidebar?: boolean;
  showPathAnalysis: () => void;
  showLoadSceneGraphWindow: () => void;
  showSaveSceneGraphDialog: () => void; // Add the prop
  showLayoutManager: (mode: "save" | "load") => void;
  handleLoadLayout: (nodePositionData: NodePositionData) => void;
  handleFitToView: (activeView: string) => void;
  handleShowEntityTables: () => void;
}

const Workspace: React.FC<WorkspaceProps> = ({
  menuConfig,
  currentSceneGraph,
  appConfig,
  isDarkMode,
  selectedSimulation,
  simulations,
  children,
  onViewChange,
  onSelectResult,
  onSearchResult,
  onHighlight,
  onApplyForceGraphConfig,
  setSelectedForceGraph3dLayoutMode,
  applyNewLayout,
  renderLayoutModeRadio,
  showFilterWindow,
  showFilterManager,
  clearFilters,
  renderNodeLegend,
  renderEdgeLegend,
  showToolbar = true,
  showLeftSidebar = true,
  showRightSidebar = true,
  showPathAnalysis,
  showLoadSceneGraphWindow,
  showSaveSceneGraphDialog,
  showLayoutManager,
  handleLoadLayout,
  handleFitToView,
  handleShowEntityTables,
}) => {
  const renderUniappToolbar = useMemo(() => {
    if (!showToolbar) {
      return null;
    }
    return (
      <div className={styles.toolbar}>
        <UniAppToolbar
          config={menuConfig}
          sceneGraph={currentSceneGraph}
          activeView={appConfig.activeView}
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
    appConfig.activeView,
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
    if (!showLeftSidebar) {
      return null;
    }
    if (sidebarDisabledViews.includes(appConfig.activeView)) {
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
          onLayoutChange: (layout: LayoutEngineOption) =>
            applyNewLayout(layout),
          activeLayout: appConfig.activeLayout,
          physicsMode:
            appConfig.forceGraph3dOptions.layout === "Physics" &&
            appConfig.activeView === "ForceGraph3d",
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
          onShowSaveSceneGraphDialog: showSaveSceneGraphDialog, // Pass the handler
          showLayoutManager: (mode: "save" | "load") => showLayoutManager(mode),
          handleLoadLayout: handleLoadLayout,
        })}
        defaultIsOpen={true}
        isDarkMode={isDarkMode}
        footer={leftFooterContent}
      />
    );
  }, [
    showLeftSidebar,
    appConfig.activeView,
    appConfig.activeLayout,
    appConfig.forceGraph3dOptions.layout,
    isDarkMode,
    onApplyForceGraphConfig,
    currentSceneGraph,
    showFilterWindow,
    showFilterManager,
    clearFilters,
    showPathAnalysis,
    showLoadSceneGraphWindow,
    showSaveSceneGraphDialog,
    handleLoadLayout,
    applyNewLayout,
    showLayoutManager,
  ]);

  const renderRightSideBar = useMemo(() => {
    if (
      !showRightSidebar ||
      sidebarDisabledViews.includes(appConfig.activeView)
    ) {
      return null;
    }

    return (
      <Sidebar
        position="right"
        style={{
          height: "100%",
          top: 0,
        }}
        title="Controls"
        menuItems={createDefaultRightMenus(
          () => (
            <>
              {renderLayoutModeRadio()}
              {renderNodeLegend}
              {renderEdgeLegend}
            </>
          ),
          appConfig.activeView === "ForceGraph3d",
          appConfig.forceGraph3dOptions.layout,
          setSelectedForceGraph3dLayoutMode,
          isDarkMode
        )}
        defaultIsOpen={true}
        isDarkMode={isDarkMode}
        minimal={true}
        footer={(isOpen) =>
          rightFooterContent(isOpen, {
            onFitToView: () => handleFitToView(appConfig.activeView),
            onViewEntities: () => handleShowEntityTables(),
            details: {
              sceneGraphName:
                currentSceneGraph.getMetadata().name ?? "Untitled",
              activeLayout: appConfig.activeLayout,
              activeFilters: null,
            },
          })
        }
      />
    );
  }, [
    showRightSidebar,
    appConfig.activeView,
    appConfig.forceGraph3dOptions.layout,
    appConfig.activeLayout,
    setSelectedForceGraph3dLayoutMode,
    isDarkMode,
    renderLayoutModeRadio,
    renderNodeLegend,
    renderEdgeLegend,
    currentSceneGraph,
    handleFitToView,
    handleShowEntityTables,
  ]);

  return (
    <div className={styles.workspace}>
      {renderUniappToolbar}
      <div className={styles.content}>
        <div className={styles.sidebarLayer}>{renderLeftSideBar}</div>
        <main className={styles.main}>
          <div className={styles.graphContainer}>{children}</div>
        </main>
        <div className={styles.sidebarLayer}>{renderRightSideBar}</div>
      </div>
    </div>
  );
};

export default Workspace;
