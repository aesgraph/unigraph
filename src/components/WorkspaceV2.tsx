import { getActiveView, getCurrentSceneGraph } from "@/store/appConfigStore";
import { useWorkspace } from "@aesgraph/app-shell";
import "@aesgraph/app-shell/app-shell.css";
import React, { useState } from "react";
import useDialogStore from "../store/dialogStore";
import Workspace from "./appWorkspace/Workspace";
import LoadSceneGraphDialog from "./common/LoadSceneGraphDialog";
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
  showSaveSceneGraphDialog,
  showLayoutManager,
  handleFitToView,
  handleShowEntityTables,
  handleLoadSceneGraph,
  children,
}) => {
  // Get dialog store for LoadSceneGraphDialog
  const {
    showLoadSceneGraphWindow: showLoadDialog,
    setShowLoadSceneGraphWindow,
  } = useDialogStore();

  // Get workspace context
  const { savedWorkspaces, currentWorkspace, applyWorkspaceLayout } =
    useWorkspace();

  // Get current scene graph name
  const currentGraphName =
    getCurrentSceneGraph()?.getMetadata()?.name || "No Graph";

  // State for hover panel
  const [showHoverPanel, setShowHoverPanel] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isHoveringPanel, setIsHoveringPanel] = useState(false);

  // State for workspace panel
  const [showWorkspacePanel, setShowWorkspacePanel] = useState(false);
  const [workspaceHoverTimeout, setWorkspaceHoverTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [isHoveringWorkspacePanel, setIsHoveringWorkspacePanel] =
    useState(false);

  // Get detailed scene graph info
  const sceneGraph = getCurrentSceneGraph();
  const metadata = sceneGraph?.getMetadata();
  const graph = sceneGraph?.getGraph();
  const nodeCount = graph?.getNodes().size() || 0;
  const edgeCount = graph?.getEdges().size() || 0;

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    const timeout = setTimeout(() => {
      setShowHoverPanel(true);
    }, 300); // 300ms delay before showing panel
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    const timeout = setTimeout(() => {
      if (!isHoveringPanel) {
        setShowHoverPanel(false);
      }
    }, 200); // 200ms delay before hiding panel
    setHoverTimeout(timeout);
  };

  const handlePanelMouseEnter = () => {
    setIsHoveringPanel(true);
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
  };

  const handlePanelMouseLeave = () => {
    setIsHoveringPanel(false);
    const timeout = setTimeout(() => {
      setShowHoverPanel(false);
    }, 200);
    setHoverTimeout(timeout);
  };

  // Workspace panel handlers
  const handleWorkspaceMouseEnter = () => {
    if (workspaceHoverTimeout) {
      clearTimeout(workspaceHoverTimeout);
    }
    const timeout = setTimeout(() => {
      setShowWorkspacePanel(true);
    }, 300);
    setWorkspaceHoverTimeout(timeout);
  };

  const handleWorkspaceMouseLeave = () => {
    if (workspaceHoverTimeout) {
      clearTimeout(workspaceHoverTimeout);
    }
    const timeout = setTimeout(() => {
      if (!isHoveringWorkspacePanel) {
        setShowWorkspacePanel(false);
      }
    }, 200);
    setWorkspaceHoverTimeout(timeout);
  };

  const handleWorkspacePanelMouseEnter = () => {
    setIsHoveringWorkspacePanel(true);
    if (workspaceHoverTimeout) {
      clearTimeout(workspaceHoverTimeout);
    }
  };

  const handleWorkspacePanelMouseLeave = () => {
    setIsHoveringWorkspacePanel(false);
    const timeout = setTimeout(() => {
      setShowWorkspacePanel(false);
    }, 200);
    setWorkspaceHoverTimeout(timeout);
  };

  const handleWorkspaceSelect = async (workspaceId: string) => {
    try {
      const success = await applyWorkspaceLayout(workspaceId);
      if (success) {
        console.log("Successfully loaded workspace:", workspaceId);
        setShowWorkspacePanel(false);
      } else {
        console.error("Failed to load workspace:", workspaceId);
      }
    } catch (error) {
      console.error("Error loading workspace:", error);
    }
  };

  const handleEditProject = () => {
    // TODO: Implement edit functionality
    console.log("Edit project clicked");
  };

  const handleCopyProject = () => {
    if (sceneGraph) {
      try {
        const projectData = JSON.stringify(sceneGraph, null, 2);
        navigator.clipboard.writeText(projectData).then(() => {
          // Could add a notification here
          console.log("Project copied to clipboard");
        });
      } catch (error) {
        console.error("Failed to copy project:", error);
      }
    }
  };

  const handleSaveProject = () => {
    // TODO: Implement save functionality
    console.log("Save project clicked");
  };

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
          showLoadSceneGraphWindow={() => setShowLoadSceneGraphWindow(true)}
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
        <div className={styles.statusBarLeft}>
          <div
            className={styles.activeGraphButton}
            onClick={() => setShowLoadSceneGraphWindow(true)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            title="Click to load a different project"
          >
            <span className={styles.activeGraphLabel}>Current Project:</span>
            <span className={styles.activeGraphName}>{currentGraphName}</span>
          </div>

          <div
            className={styles.workspaceButton}
            onMouseEnter={handleWorkspaceMouseEnter}
            onMouseLeave={handleWorkspaceMouseLeave}
            title="Select workspace"
          >
            <span className={styles.workspaceLabel}>Workspace:</span>
            <span className={styles.workspaceName}>
              {currentWorkspace?.name || "Default"}
            </span>
          </div>

          {/* Hover Panel */}
          {showHoverPanel && sceneGraph && (
            <div
              className={styles.hoverPanel}
              onMouseEnter={handlePanelMouseEnter}
              onMouseLeave={handlePanelMouseLeave}
            >
              <div className={styles.hoverPanelHeader}>
                <h4>{metadata?.name || "Unnamed Project"}</h4>
              </div>
              <div className={styles.hoverPanelContent}>
                {metadata?.description && (
                  <div className={styles.hoverPanelItem}>
                    <span className={styles.hoverPanelLabel}>Description:</span>
                    <span className={styles.hoverPanelValue}>
                      {metadata.description}
                    </span>
                  </div>
                )}
                <div className={styles.hoverPanelItem}>
                  <span className={styles.hoverPanelLabel}>Nodes:</span>
                  <span className={styles.hoverPanelValue}>{nodeCount}</span>
                </div>
                <div className={styles.hoverPanelItem}>
                  <span className={styles.hoverPanelLabel}>Edges:</span>
                  <span className={styles.hoverPanelValue}>{edgeCount}</span>
                </div>
                {metadata?.source && (
                  <div className={styles.hoverPanelItem}>
                    <span className={styles.hoverPanelLabel}>Source:</span>
                    <span className={styles.hoverPanelValue}>
                      {metadata.source}
                    </span>
                  </div>
                )}
                {metadata?.notes && (
                  <div className={styles.hoverPanelItem}>
                    <span className={styles.hoverPanelLabel}>Notes:</span>
                    <span className={styles.hoverPanelValue}>
                      {metadata.notes}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className={styles.hoverPanelActions}>
                <button
                  className={styles.hoverPanelButton}
                  onClick={handleEditProject}
                  title="Edit project details"
                >
                  Edit
                </button>
                <button
                  className={styles.hoverPanelButton}
                  onClick={handleCopyProject}
                  title="Copy project to clipboard"
                >
                  Copy
                </button>
                <button
                  className={styles.hoverPanelButton}
                  onClick={handleSaveProject}
                  title="Save project"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Workspace Selection Panel */}
          {showWorkspacePanel && (
            <div
              className={styles.workspacePanel}
              onMouseEnter={handleWorkspacePanelMouseEnter}
              onMouseLeave={handleWorkspacePanelMouseLeave}
            >
              <div className={styles.workspacePanelHeader}>
                <h4>Select Workspace</h4>
              </div>
              <div className={styles.workspacePanelContent}>
                <div className={styles.workspaceGrid}>
                  {savedWorkspaces.map((workspace) => (
                    <div
                      key={workspace.id}
                      className={styles.workspaceOption}
                      onClick={() => handleWorkspaceSelect(workspace.id)}
                      title={workspace.name}
                    >
                      {workspace.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className={styles.statusBarRight}>
          Ready • Unigraph • Scene Graph Loaded •{" "}
          {getCurrentSceneGraph().getMetadata().name
            ? "Graph Active"
            : "No Graph"}
        </div>
      </div>

      {/* Load Scene Graph Dialog */}
      {showLoadDialog && (
        <LoadSceneGraphDialog
          onClose={() => setShowLoadSceneGraphWindow(false)}
          onSelect={() => {
            // This will be handled by the parent component
            setShowLoadSceneGraphWindow(false);
          }}
          handleLoadSceneGraph={handleLoadSceneGraph}
        />
      )}
    </div>
  );
};

export default WorkspaceV2;
