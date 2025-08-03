import { getColor } from "@aesgraph/app-shell";
import {
  FileText,
  FilterX, // Add this import for the clear filter icon
  Info,
  List,
  MessageCircle,
  MessageSquare,
  Scan,
  Settings2,
  Table2,
} from "lucide-react";
import React from "react";
import {
  getCurrentSceneGraph,
  getForceGraph3dLayoutMode,
  setForceGraph3dLayoutMode,
} from "../../store/appConfigStore";
import { getSelectedNodeIds } from "../../store/graphInteractionStore";
import NodeDetailsPanel from "../NodeDetailsPanel";
import SceneGraphInfoEditor from "../sceneGraph/SceneGraphInfoEditor";
import SceneGraphTitle from "../sceneGraph/SceneGraphTitle";
import ForceGraphLayoutRadio from "../views/ForceGraph3d/ForceGraphLayoutRadio";
import styles from "./Sidebar.module.css";

// Add this import
import AIChatPanel from "../ai/AIChatPanel";
import { ChatGptPanel } from "../applets/ChatGptImporter/ChatGptPanel";

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
  isDarkMode: boolean,
  theme?: any
): MenuItem[] => {
  const baseMenuItems = [
    {
      id: "scene-info",
      icon: (
        <Info
          size={20}
          className="menu-icon"
          style={{
            color: theme ? getColor(theme.colors, "text") : undefined,
          }}
        />
      ),
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
      icon: (
        <List
          size={20}
          className={styles.menuIcon}
          style={{
            color: theme ? getColor(theme.colors, "text") : undefined,
          }}
        />
      ),
      label: "Legends",
      content: (
        <div className={styles.optionsPanelContainer}>{renderLegends()}</div>
      ),
    },
    {
      id: "settings",
      icon: (
        <Settings2
          size={20}
          className={styles.menuIcon}
          style={{
            color: theme ? getColor(theme.colors, "text") : undefined,
          }}
        />
      ),
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
      icon: (
        <FileText
          size={20}
          className={styles.menuIcon}
          style={{
            color: theme ? getColor(theme.colors, "text") : undefined,
          }}
        />
      ),
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
      icon: (
        <MessageSquare
          size={20}
          className={styles.menuIcon}
          style={{
            color: theme ? getColor(theme.colors, "text") : undefined,
          }}
        />
      ),
      label: "ChatGPT",
      content: <ChatGptPanel isDarkMode={isDarkMode} />,
    },
    {
      id: "ai-chat",
      label: "AI Chat",
      icon: (
        <MessageCircle
          size={20}
          className={styles.menuIcon}
          style={{
            color: theme ? getColor(theme.colors, "text") : undefined,
          }}
        />
      ),
      content: <AIChatPanel />,
    },
  ];

  // Add node details section if any nodes are selected
  if (getSelectedNodeIds().size > 0) {
    baseMenuItems.push({
      id: "node-details",
      icon: (
        <div className={styles.menuIcon}>
          <Info
            size={20}
            style={{
              color: theme ? getColor(theme.colors, "text") : undefined,
            }}
          />
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
  },
  theme?: any
) => {
  if (!actions) return null;

  // Check if we have active filters
  const hasActiveFilter = actions.details?.activeFilter;

  return (
    <nav className={styles.nav}>
      {/* Show Clear Filters button only when filters are active */}
      {hasActiveFilter && actions.onClearFilters && (
        <div className={styles.menuItem}>
          <button
            className={`${styles.menuButton} ${styles.filterButton}`}
            onClick={actions.onClearFilters}
            title="Clear Filters"
          >
            <FilterX
              size={20}
              className={styles.menuIcon}
              style={{
                color: theme ? getColor(theme.colors, "text") : undefined,
              }}
            />
            {isOpen && (
              <span
                className={styles.menuText}
                style={{
                  color: theme ? getColor(theme.colors, "text") : undefined,
                }}
              >
                Clear Filters
              </span>
            )}
          </button>
        </div>
      )}
      <div className={styles.menuItem}>
        <button
          className={styles.menuButton}
          onClick={actions.onViewEntities}
          title="View Entities"
        >
          <Table2
            size={20}
            className={styles.menuIcon}
            style={{
              color: theme ? getColor(theme.colors, "text") : undefined,
            }}
          />
          {isOpen && (
            <span
              className={styles.menuText}
              style={{
                color: theme ? getColor(theme.colors, "text") : undefined,
              }}
            >
              View Entities
            </span>
          )}
        </button>
      </div>
      <div className={styles.menuItem}>
        <button
          className={styles.menuButton}
          onClick={actions.onFitToView}
          title="Fit to View"
        >
          <Scan
            size={20}
            className={styles.menuIcon}
            style={{
              color: theme ? getColor(theme.colors, "text") : undefined,
            }}
          />
          {isOpen && (
            <span
              className={styles.menuText}
              style={{
                color: theme ? getColor(theme.colors, "text") : undefined,
              }}
            >
              Fit to View
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};
