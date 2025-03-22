import {
  Activity,
  BookOpen,
  Filter,
  Home,
  Settings2,
  Share2,
} from "lucide-react";
import React from "react";
import ForceGraphRenderConfigEditor from "../components/force-graph/ForceGraphRenderConfigEditor";
import { CustomLayoutType } from "../core/layouts/CustomLayoutEngine";
import { GraphologyLayoutType } from "../core/layouts/GraphologyLayoutEngine";
import { GraphvizLayoutType } from "../core/layouts/GraphvizLayoutEngine";
import { PresetLayoutType } from "../core/layouts/LayoutEngine";
import { extractPositionsFromNodes } from "../data/graphs/blobMesh";
import styles from "../Sidebar.module.css";

const allLayoutLabels = [
  ...Object.values(GraphvizLayoutType),
  ...Object.values(GraphologyLayoutType),
  ...Object.values(CustomLayoutType),
  ...Object.values(PresetLayoutType),
];

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
}: any) => [
  {
    id: "project",
    icon: <Home size={20} className={styles.menuIcon} />,
    label: "Project",
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
    icon: <Filter size={20} />,
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
    id: "forceGraphSettings",
    icon: <Settings2 size={20} />,
    label: "Display",
    content: (
      <ForceGraphRenderConfigEditor
        onApply={onApplyForceGraphConfig}
        isDarkMode={isDarkMode}
        initialConfig={initialForceGraphConfig}
      />
    ),
  },
];

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
