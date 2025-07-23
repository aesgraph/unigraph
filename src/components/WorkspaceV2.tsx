import { getActiveView, getCurrentSceneGraph } from "@/store/appConfigStore";
import React from "react";
import "../../../app-shell/dist/app-shell.css";
import Workspace from "./appWorkspace/Workspace";
import styles from "./MinimalWorkspace.module.css";
import AppShellView from "./views/AppShellView";

// Props interface that matches what Workspace needs
interface WorkspaceV2Props {
  menuConfig: any;
  currentSceneGraph: any;
  isDarkMode: boolean;
  selectedSimulation: string;
  simulations: any;
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
  handleLoadSceneGraph: (sceneGraph: any) => void;
  children?: React.ReactNode;
}

const WorkspaceV2: React.FC<WorkspaceV2Props> = ({
  menuConfig,
  currentSceneGraph,
  isDarkMode,
  selectedSimulation,
  simulations,
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
  children,
}) => {
  return (
    <div className={styles.appContainer}>
      {/* Main Content Area with Workspace */}
      <div className={styles.mainContent}>
        <Workspace
          menuConfig={menuConfig}
          currentSceneGraph={currentSceneGraph}
          isDarkMode={isDarkMode}
          selectedSimulation={selectedSimulation}
          simulations={simulations}
          onViewChange={onViewChange}
          onSelectResult={onSelectResult}
          onSearchResult={onSearchResult}
          onHighlight={onHighlight}
          onApplyForceGraphConfig={onApplyForceGraphConfig}
          renderLayoutModeRadio={renderLayoutModeRadio}
          showFilterWindow={showFilterWindow}
          showFilterManager={showFilterManager}
          renderNodeLegend={renderNodeLegend}
          renderEdgeLegend={renderEdgeLegend}
          showPathAnalysis={showPathAnalysis}
          showLoadSceneGraphWindow={showLoadSceneGraphWindow}
          showSaveSceneGraphDialog={showSaveSceneGraphDialog}
          showLayoutManager={showLayoutManager}
          handleFitToView={handleFitToView}
          handleShowEntityTables={handleShowEntityTables}
          handleLoadSceneGraph={handleLoadSceneGraph}
        >
          {children}
          {getActiveView() === "AppShell" && <AppShellView />}
        </Workspace>
      </div>

      {/* Status Bar */}
      <div className={styles.statusBar}>
        Ready • Unigraph • Scene Graph Loaded •{" "}
        {getCurrentSceneGraph() ? "Graph Active" : "No Graph"}
      </div>
    </div>
  );
};

export default WorkspaceV2;
