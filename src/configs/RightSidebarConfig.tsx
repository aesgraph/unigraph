import {
  FileText,
  FilterX, // Add this import for the clear filter icon
  Info,
  List,
  MessageCircle,
  MessageSquare,
  MoveIcon,
  Scan,
  Settings2,
  SquareDashedMousePointerIcon,
  Table2,
} from "lucide-react";
import React from "react";
import ForceGraphLayoutRadio from "../components/force-graph/ForceGraphLayoutRadio";
import NodeDetailsPanel from "../components/NodeDetailsPanel";
import SceneGraphInfoEditor from "../components/SceneGraphInfoEditor";
import SceneGraphTitle from "../components/SceneGraphTitle";
import styles from "../Sidebar.module.css";
import {
  getCurrentSceneGraph,
  getForceGraph3dLayoutMode,
  setForceGraph3dLayoutMode,
} from "../store/appConfigStore";
import { getSelectedNodeIds } from "../store/graphInteractionStore";

// Add this import
import AIChatPanel from "../components/ai/AIChatPanel";
import ChatGptPanel from "../components/tools/ChatGptPanel";
import { toggleForceGraphMouseControls } from "../store/sceneGraphHooks";

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

export const createDefaultRightMenus = (
  renderLegends: () => React.ReactNode,
  isForceGraph3dActive: boolean,
  isDarkMode: boolean
): MenuItem[] => {
  const baseMenuItems = [
    {
      id: "scene-info",
      icon: <Info size={20} className="menu-icon" />,
      label: "Scene Info",
      content: (
        <div className="sidebar-section">
          <SceneGraphTitle
            title={getCurrentSceneGraph().getMetadata().name ?? ""}
            description={getCurrentSceneGraph().getMetadata().description ?? ""}
            // canEdit={true}
          />
        </div>
      ),
    },
    {
      id: "legends",
      icon: <List size={20} className={styles.menuIcon} />,
      label: "Legends",
      content: (
        <div className={styles.optionsPanelContainer}>{renderLegends()}</div>
      ),
    },
    {
      id: "settings",
      icon: <Settings2 size={20} className={styles.menuIcon} />,
      label: "Settings",
      content: (
        <div className={styles.optionsPanelContainer}>
          {isForceGraph3dActive && (
            <ForceGraphLayoutRadio
              layout={getForceGraph3dLayoutMode()}
              onLayoutChange={setForceGraph3dLayoutMode}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      ),
    },
    {
      id: "sceneGraphInfo",
      icon: <FileText size={20} className={styles.menuIcon} />,
      label: "SceneGraph Info",
      content: (
        <SceneGraphInfoEditor
          sceneGraph={getCurrentSceneGraph()}
          isDarkMode={isDarkMode}
        />
      ),
    },
    // Add ChatGPT import section
    {
      id: "chatgpt-import",
      icon: <MessageSquare size={20} className={styles.menuIcon} />,
      label: "ChatGPT",
      content: <ChatGptPanel isDarkMode={isDarkMode} />,
    },
    {
      id: "ai-chat",
      label: "AI Chat",
      icon: <MessageCircle size={20} className={styles.menuIcon} />,
      content: <AIChatPanel isDarkMode={isDarkMode} />,
    },
  ];

  // Add node details section if any nodes are selected
  if (getSelectedNodeIds().size > 0) {
    baseMenuItems.push({
      id: "node-details",
      icon: (
        <div className={styles.menuIcon}>
          <Info size={20} />
          {getSelectedNodeIds().size > 0 && (
            <span className={styles.notificationBadge}>
              {getSelectedNodeIds().size}
            </span>
          )}
        </div>
      ),
      label:
        getSelectedNodeIds().size > 1
          ? `Nodes (${getSelectedNodeIds().size})`
          : "Node Details",
      content: <NodeDetailsPanel />,
    });
  }

  return baseMenuItems;
};

// Info panel component for SceneGraph details
const _SceneGraphInfoPanel = ({
  sceneGraphName,
  activeLayout,
  activeFilter,
}: {
  sceneGraphName: string;
  activeLayout: string;
  activeFilter?: string | null;
}) => (
  <div className={styles.infoPanel}>
    <div className={styles.infoSection}>
      <h4 className={styles.infoSectionTitle}>SceneGraph</h4>
      <div className={styles.infoSectionValue}>
        {sceneGraphName || "Untitled"}
      </div>
    </div>
    <div className={styles.infoSection}>
      <h4 className={styles.infoSectionTitle}>Active Layout</h4>
      <div className={styles.infoSectionValue}>{activeLayout}</div>
    </div>
    {activeFilter && (
      <div className={styles.infoSection}>
        <h4 className={styles.infoSectionTitle}>Active Filter</h4>
        <div className={styles.infoSectionValue} style={{ color: "orange" }}>
          {activeFilter}
        </div>
      </div>
    )}
  </div>
);

export const rightFooterContent = (
  isOpen: boolean,
  actions?: {
    onFitToView: () => void;
    onViewEntities?: () => void;
    onClearFilters?: () => void; // Add clear filters action
    details?: {
      sceneGraphName: string;
      activeLayout: string;
      activeFilter?: string | null;
      activeView?: string | null;
      mouseControls?: string | null;
    };
  }
) => {
  if (!actions) return null;

  // Check if we have active filters
  const hasActiveFilter = actions.details?.activeFilter;

  return (
    <nav className={styles.nav}>
      {actions?.details?.activeView === "ForceGraph3d" && (
        <div className={styles.menuItem}>
          <button
            className={`${styles.menuButton} ${styles.filterButton}`}
            onClick={toggleForceGraphMouseControls}
            title="Controls Mode"
          >
            {actions.details?.mouseControls === "orbital" ? (
              <MoveIcon size={20} className={styles.menuIcon} />
            ) : (
              <SquareDashedMousePointerIcon
                size={20}
                className={styles.menuIcon}
              />
            )}

            {isOpen && (
              <span className={styles.menuText}>Toggle Mouse Controls</span>
            )}
          </button>
        </div>
      )}
      {/* Show Clear Filters button only when filters are active */}
      {hasActiveFilter && actions.onClearFilters && (
        <div className={styles.menuItem}>
          <button
            className={`${styles.menuButton} ${styles.filterButton}`}
            onClick={actions.onClearFilters}
            title="Clear Filters"
          >
            <FilterX size={20} className={styles.menuIcon} />
            {isOpen && <span className={styles.menuText}>Clear Filters</span>}
          </button>
        </div>
      )}
      <div className={styles.menuItem}>
        <button
          className={styles.menuButton}
          onClick={actions.onViewEntities}
          title="View Entities"
        >
          <Table2 size={20} className={styles.menuIcon} />
          {isOpen && <span className={styles.menuText}>View Entities</span>}
        </button>
      </div>
      <div className={styles.menuItem}>
        <button
          className={styles.menuButton}
          onClick={actions.onFitToView}
          title="Fit to View"
        >
          <Scan size={20} className={styles.menuIcon} />
          {isOpen && <span className={styles.menuText}>Fit to View</span>}
        </button>
      </div>
    </nav>
  );
};
