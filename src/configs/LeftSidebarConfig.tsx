import {
  Activity,
  BookOpen,
  Filter,
  FolderOpen,
  Home,
  Settings2,
  Share2,
} from "lucide-react";
import React from "react";
import ForceGraphRenderConfigEditor from "../components/force-graph/ForceGraphRenderConfigEditor";
import ProjectManager from "../components/projects/ProjectManager"; // Import the new component
import ReactFlowConfigEditor from "../components/react-flow/ReactFlowConfigEditor";
import { CustomLayoutType } from "../core/layouts/CustomLayoutEngine";
import { GraphologyLayoutType } from "../core/layouts/GraphologyLayoutEngine";
import { GraphvizLayoutType } from "../core/layouts/GraphvizLayoutEngine";
import { PresetLayoutType } from "../core/layouts/LayoutEngine";
import { SceneGraph } from "../core/model/SceneGraph";
import { extractPositionsFromNodes } from "../data/graphs/blobMesh";
import styles from "../Sidebar.module.css";
import {
  applyReactFlowConfig,
  getReactFlowConfig,
} from "../store/reactFlowConfigStore";
import { getSectionWidth } from "../store/workspaceConfigStore";

const allLayoutLabels = [
  ...Object.values(GraphvizLayoutType),
  ...Object.values(GraphologyLayoutType),
  ...Object.values(CustomLayoutType),
  ...Object.values(PresetLayoutType),
];

export interface SubMenuItem {
  label: string;
  onClick?: () => void;
  content?: React.ReactNode;
  customRender?: React.ReactNode;
}

export interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  content?: React.ReactNode;
  subMenus?: SubMenuItem[];
}

export const createDefaultLeftMenus = ({
  sceneGraph,
  onLayoutChange,
  activeLayout,
  onApplyForceGraphConfig,
  isDarkMode,
  initialForceGraphConfig,
  onShowFilter,
  onShowFilterManager,
  onClearFilters,
  onShowPathAnalysis,
  onShowLoadSceneGraphWindow,
  onShowSaveSceneGraphDialog,
  showLayoutManager,
  handleLoadLayout,
  activeView, // Important prop for determining which editor to show
  activeFilter,
  handleLoadSceneGraph,
}: any) => {
  // Add debugging to confirm the activeView value
  console.log("Current active view for display settings:", activeView);

  // Ensure case consistency by converting to lowercase for comparison
  const normalizedActiveView = activeView ? activeView.toLowerCase() : "";
  const isForceGraph3D = normalizedActiveView === "forcegraph3d";
  const isReactFlow = normalizedActiveView === "reactflow";

  return [
    // Add the Projects section at the top with its custom width
    {
      id: "projects",
      icon: <FolderOpen size={20} className={styles.menuIcon} />,
      label: "Projects",
      width: getSectionWidth("projects"), // Use width from store
      content: (
        <ProjectManager
          onProjectSelected={(loadedSceneGraph: SceneGraph) => {
            // Pass the loaded scene graph to the main app
            handleLoadSceneGraph(loadedSceneGraph);
          }}
          isDarkMode={isDarkMode}
        />
      ),
    },
    {
      id: "project",
      icon: <Home size={20} className={styles.menuIcon} />,
      label: "Project",
      width: getSectionWidth("project"), // Use width from store
      content: (
        <div style={{ padding: "8px" }}>
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <button
              className={styles.submenuButton}
              style={{ flex: 1 }}
              onClick={onShowSaveSceneGraphDialog}
            >
              Save As
            </button>
            <button className={styles.submenuButton} style={{ flex: 1 }}>
              Save
            </button>
            <button
              className={styles.submenuButton}
              style={{ flex: 1 }}
              onClick={onShowLoadSceneGraphWindow}
            >
              Load
            </button>
          </div>
          <div>
            <span>
              <strong>{sceneGraph.getMetadata().name}</strong>
            </span>
          </div>
        </div>
      ),
      subMenus: [
        { label: "Overview", onClick: () => console.log("Overview clicked") },
        {
          label: "Analytics",
          onClick: () => console.log("Analytics clicked"),
        },
        {
          label: "Statistics",
          onClick: () => console.log("Statistics clicked"),
        },
      ],
    },
    {
      id: "layouts",
      icon: <Share2 size={20} className={styles.menuIcon} />,
      label: "Layouts",
      content: (
        <div style={{ padding: "8px" }}>
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <button
              className={styles.submenuButton}
              style={{ flex: 1 }}
              onClick={() => showLayoutManager("save")}
            >
              Save
            </button>
            <button
              className={styles.submenuButton}
              style={{ flex: 1 }}
              onClick={() => showLayoutManager("load")}
            >
              Load
            </button>
            <button
              className={styles.submenuButton}
              style={{ flex: 1 }}
              onClick={() => {
                const positions = extractPositionsFromNodes(sceneGraph);
                sceneGraph.setNodePositions(positions);
                handleLoadLayout(positions);
              }}
            >
              Reset
            </button>
          </div>
          <select
            value={activeLayout}
            onChange={(e) => onLayoutChange(e.target.value)}
            className={styles.layoutSelect}
          >
            {allLayoutLabels.map((layout) => (
              <option key={layout} value={layout}>
                {layout}
              </option>
            ))}
          </select>
        </div>
      ),
    },
    {
      id: "filters",
      icon: (
        <div className={styles.menuIcon}>
          <Filter size={20} />
          {activeFilter && (
            <span className={styles.notificationBadge}>{"!"}</span>
          )}
        </div>
      ),
      label: "Filters",
      content: (
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "8px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={onShowFilter}
            className={styles.submenuButton}
            style={{ flex: "1", minWidth: "70px" }}
          >
            Create
          </button>
          <button
            onClick={onShowFilterManager}
            className={styles.submenuButton}
            style={{ flex: "1", minWidth: "70px" }}
          >
            Load
          </button>
          <button
            onClick={onClearFilters}
            className={styles.submenuButton}
            style={{ flex: "1", minWidth: "70px" }}
          >
            Clear
          </button>
        </div>
      ),
    },
    {
      id: "analysis",
      icon: <Activity size={20} />,
      label: "Analysis",
      content: (
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "8px",
            flexDirection: "column",
          }}
        >
          <button onClick={onShowPathAnalysis} className={styles.submenuButton}>
            Path Analysis
          </button>
        </div>
      ),
    },
    {
      id: "displaySettings",
      icon: <Settings2 size={20} />,
      label: "Display",
      content: (() => {
        if (isForceGraph3D) {
          return (
            <ForceGraphRenderConfigEditor
              onApply={onApplyForceGraphConfig}
              isDarkMode={isDarkMode}
              initialConfig={initialForceGraphConfig}
            />
          );
        } else if (isReactFlow) {
          return (
            <ReactFlowConfigEditor
              onApply={applyReactFlowConfig}
              isDarkMode={isDarkMode}
              initialConfig={getReactFlowConfig()}
            />
          );
        } else {
          return (
            <div
              style={{
                padding: "16px",
                color: isDarkMode ? "#e2e8f0" : "#1f2937",
              }}
            >
              <p>Display settings not available for the current view.</p>
              <p
                style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}
              >
                Current view: {activeView || "Unknown"}
              </p>
            </div>
          );
        }
      })(),
    },
  ];
};

export const leftFooterContent = (isOpen: boolean) => (
  <a
    href="https://aesgraph.github.io/unigraph/"
    target="_blank"
    rel="noopener noreferrer"
    className={styles.footerLink}
  >
    <BookOpen size={20} className={styles.footerIcon} />
    {isOpen && <span className={styles.footerText}>Documentation</span>}
  </a>
);
