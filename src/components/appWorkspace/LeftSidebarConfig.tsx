/* eslint-disable unused-imports/no-unused-vars */
import {
  Activity,
  BookOpen,
  Filter,
  FolderOpen,
  Settings2,
  Share2,
} from "lucide-react";
import React from "react";
import { CustomLayoutType } from "../../core/layouts/CustomLayoutEngine";
import { GraphologyLayoutType } from "../../core/layouts/GraphologyLayoutEngine";
import { GraphvizLayoutType } from "../../core/layouts/GraphvizLayoutType";
import {
  LayoutEngineOption,
  PresetLayoutType,
} from "../../core/layouts/layoutEngineTypes";
import { SceneGraph } from "../../core/model/SceneGraph";
import { extractPositionsFromNodes } from "../../data/graphs/blobMesh";
import { Filter as FFilter } from "../../store/activeFilterStore";
import { getCurrentSceneGraph } from "../../store/appConfigStore";
import {
  applyReactFlowConfig,
  getReactFlowConfig,
} from "../../store/reactFlowConfigStore";
import {
  clearFiltersOnAppInstance,
  computeLayoutAndTriggerAppUpdate,
} from "../../store/sceneGraphHooks";
import { getSectionWidth } from "../../store/workspaceConfigStore";
import FilterManagerV2 from "../filters/FilterManagerV2";
import ForceGraphRenderConfigEditor from "../force-graph/ForceGraphRenderConfigEditor";
import LayoutManagerV2 from "../layouts/LayoutManagerV2";
import ProjectManager from "../projects/ProjectManager"; // Import the new component
import ProfileIcon from "../user/ProfileIcon";
import ReactFlowConfigEditor from "../views/ReactFlow/ReactFlowConfigEditor";
import styles from "./Sidebar.module.css";

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

export interface SidebarConfig {
  mainMenus: MenuItem[];
  bottomElements?: React.ReactNode;
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
  onShowPathAnalysis,
  showLayoutManager,
  handleLoadLayout,
  activeView, // Important prop for determining which editor to show
  activeFilter,
  handleLoadSceneGraph,
  handleSetActiveFilter,
  currentPositions, // Make sure to pass this from the parent
  includeBottomElements = true, // Flag to control if bottom elements are included
}: any): SidebarConfig => {
  // Ensure case consistency by converting to lowercase for comparison
  const normalizedActiveView = activeView ? activeView.toLowerCase() : "";
  const isForceGraph3D = normalizedActiveView === "forcegraph3d";
  const isReactFlow = normalizedActiveView === "reactflow";

  const mainMenuItems = [
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
      id: "layouts",
      icon: <Share2 size={20} className={styles.menuIcon} />,
      label: "Layouts",
      content: (
        <LayoutManagerV2
          onLayoutSelected={(layout) => {
            // For predefined layouts that don't have positions
            if (Object.keys(layout.positions).length === 0) {
              onLayoutChange(layout.name);
            } else {
              handleLoadLayout(layout);
            }
          }}
          onSaveCurrentLayout={() => {
            // This will prompt for name and save
          }}
          onShowLayoutManager={() => {}}
          onResetLayout={() => {
            const positions = extractPositionsFromNodes(sceneGraph);
            sceneGraph.setNodePositions(positions);
            handleLoadLayout({
              name: "NodePositions",
              type: "NodePositions",
              positions,
            });
          }}
          sceneGraph={sceneGraph}
          currentPositions={currentPositions || {}}
          applyPredefinedLayout={(layoutName: string) =>
            computeLayoutAndTriggerAppUpdate(
              getCurrentSceneGraph(),
              layoutName as LayoutEngineOption,
              getCurrentSceneGraph().getVisibleNodes()
            )
          }
        />
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
        <div>
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
              onClick={clearFiltersOnAppInstance}
              className={styles.submenuButton}
              style={{ flex: "1", minWidth: "70px" }}
            >
              Clear
            </button>
          </div>
          {
            <FilterManagerV2
              onFilterSelected={(filter: FFilter | null) => {
                handleSetActiveFilter(filter);
              }}
              onShowFilter={onShowFilter}
              onShowFilterManager={onShowFilterManager}
              onClearFilters={clearFiltersOnAppInstance}
            />
          }
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

  // Create bottom elements with a ProfileIcon
  const bottomElements = includeBottomElements ? (
    <div className={styles.sidebarBottomElements}>
      <div
        className={styles.bottomElement}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center", // Center horizontally
          marginTop: "auto",
          marginBottom: "16px", // Add bottom margin
          width: "100%", // Ensure full width for proper centering
        }}
      >
        <ProfileIcon
          style={{
            margin: 0,
            width: 30,
            height: 30,
            minWidth: 30,
            minHeight: 30,
            boxShadow: "none",
          }}
          size={30}
        />
      </div>
    </div>
  ) : null;

  return {
    mainMenus: mainMenuItems,
    bottomElements,
  };
};

export const leftFooterContent = (isOpen: boolean) => {
  return (
    <div className={styles.menuItem}>
      <a
        href="https://aesgraph.github.io/unigraph/"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.footerLink}
      >
        <BookOpen size={20} className={styles.footerIcon} />
        {isOpen && <span className={styles.footerText}>Documentation</span>}
      </a>
    </div>
  );
};
