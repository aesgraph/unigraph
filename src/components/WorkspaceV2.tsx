import { SceneGraph } from "@/core/model/SceneGraph";
import { getActiveView, getCurrentSceneGraph } from "@/store/appConfigStore";
import useGraphInteractionStore, {
  getSelectedNodeId,
} from "@/store/graphInteractionStore";
import useWorkspaceConfigStore from "@/store/workspaceConfigStore";
import { getColor, useTheme, useWorkspace } from "@aesgraph/app-shell";
import "@aesgraph/app-shell/app-shell.css";
import React, { useState } from "react";
import useDialogStore from "../store/dialogStore";
import { useUserStore } from "../store/userStore";
import Workspace from "./appWorkspace/Workspace";
import LoadSceneGraphDialog from "./common/LoadSceneGraphDialog";
import styles from "./MinimalWorkspace.module.css";
import AppShellView from "./views/AppShellView";

// Props interface that matches what Workspace needs
interface WorkspaceV2Props {
  menuConfig: any;
  currentSceneGraph: SceneGraph;
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
  const { currentWorkspace, savedWorkspaces, applyWorkspaceLayout } =
    useWorkspace();
  // Filter out autosave workspaces
  const visibleWorkspaces = savedWorkspaces.filter(
    (w) => w.name !== "Autosaved"
  );
  const { setRightActiveSection: _setRightActiveSection } =
    useWorkspaceConfigStore();
  const { selectedNodeIds } = useGraphInteractionStore();
  const { theme } = useTheme();
  const { isSignedIn, user } = useUserStore();

  const currentGraphName =
    currentSceneGraph?.getMetadata()?.name || "No Project Loaded";

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
      <div
        className={styles.statusBar}
        style={{
          backgroundColor: getColor(theme.colors, "workspaceTitleBackground"),
          color: getColor(theme.colors, "workspaceTitleText"),
          borderTop: `1px solid ${getColor(theme.colors, "border")}`,
        }}
      >
        <div className={styles.statusBarLeft}>
          {/* Authentication status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: "12px",
              padding: "4px 8px",
              backgroundColor: getColor(theme.colors, "surface"),
              color: getColor(theme.colors, "text"),
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onClick={() => {
              if (isSignedIn) {
                // Open profile popup for signed-in users
                const profileButton = document.querySelector(
                  '[title="Profile"]'
                ) as HTMLButtonElement;
                if (profileButton) {
                  profileButton.click();
                }
              } else {
                // Open sign-in popup for signed-out users
                const width = 800;
                const height = 600;
                const left = (window.screen.width - width) / 2;
                const top = (window.screen.height - height) / 2;

                const popup = window.open(
                  "/signin",
                  "signin",
                  `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no`
                );

                if (popup) {
                  // Listen for messages from popup
                  const handleMessage = (event: MessageEvent) => {
                    if (event.origin !== window.location.origin) return;

                    if (event.data.type === "SIGNED_IN") {
                      console.log("User signed in via popup:", event.data.user);
                      window.removeEventListener("message", handleMessage);
                    } else if (event.data.type === "SIGNIN_CANCELLED") {
                      console.log("Sign-in was cancelled");
                      window.removeEventListener("message", handleMessage);
                    }
                  };

                  window.addEventListener("message", handleMessage);
                } else {
                  // Popup was blocked, fallback to redirect
                  window.location.href = "/signin";
                }
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = getColor(
                theme.colors,
                "accent"
              );
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = getColor(
                theme.colors,
                "surface"
              );
              e.currentTarget.style.transform = "scale(1)";
            }}
            title={
              isSignedIn ? "Click to open profile menu" : "Click to sign in"
            }
          >
            {isSignedIn && user
              ? `Logged in: ${user.user_metadata?.name || user.email || "User"}`
              : "Sign in"}
          </div>

          <div
            className={styles.activeGraphButton}
            onClick={() => setShowLoadSceneGraphWindow(true)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            title="Click to load a different project"
            style={{
              backgroundColor: getColor(theme.colors, "backgroundSecondary"),
              color: getColor(theme.colors, "text"),
            }}
          >
            <span
              className={styles.activeGraphLabel}
              style={{
                color: getColor(theme.colors, "textSecondary"),
              }}
            >
              Current Project:
            </span>
            <span
              className={styles.activeGraphName}
              style={{
                color: getColor(theme.colors, "text"),
              }}
            >
              {currentGraphName}
            </span>
          </div>

          <div
            className={styles.workspaceButton}
            onMouseEnter={handleWorkspaceMouseEnter}
            onMouseLeave={handleWorkspaceMouseLeave}
            title="Select workspace"
            style={{
              backgroundColor: getColor(theme.colors, "backgroundSecondary"),
              color: getColor(theme.colors, "text"),
            }}
          >
            <span
              className={styles.workspaceLabel}
              style={{
                color: getColor(theme.colors, "textSecondary"),
              }}
            >
              Workspace:
            </span>
            <span
              className={styles.workspaceName}
              style={{
                color: getColor(theme.colors, "text"),
              }}
            >
              {currentWorkspace?.name || "Default"}
            </span>
          </div>

          {/* Selection Status */}
          <div
            className={styles.selectionButton}
            style={{
              backgroundColor: getColor(theme.colors, "backgroundSecondary"),
              color: getColor(theme.colors, "text"),
            }}
          >
            <span
              className={styles.selectionLabel}
              style={{
                color: getColor(theme.colors, "textSecondary"),
              }}
            >
              Selection:
            </span>
            <span
              className={styles.selectionName}
              style={{
                color: getColor(theme.colors, "text"),
              }}
            >
              {(() => {
                const selectedNodeId = getSelectedNodeId();

                if (selectedNodeIds.size === 0) {
                  return "None";
                } else if (selectedNodeIds.size === 1) {
                  // Show the node name if available, otherwise the ID
                  const nodeId =
                    selectedNodeId || Array.from(selectedNodeIds)[0];
                  const node = currentSceneGraph?.getGraph()?.getNode(nodeId);
                  return node?.getLabel() || nodeId;
                } else {
                  // Show count for multiple selections
                  return `${selectedNodeIds.size} nodes`;
                }
              })()}
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
                  {visibleWorkspaces.map((workspace) => (
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
        <div
          className={styles.statusBarRight}
          style={{
            color: getColor(theme.colors, "text"),
          }}
        >
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
