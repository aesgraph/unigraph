import { List, Settings2 } from "lucide-react";
import React from "react";
import { ForceGraph3dLayoutMode } from "../AppConfig";
import ForceGraphLayoutRadio from "../components/force-graph/ForceGraphLayoutRadio";
import styles from "../Sidebar.module.css";

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
  forceGraphLayout: string,
  onForceGraphLayoutChange: (layout: string) => void,
  isDarkMode: boolean
) => [
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
    hideHeader: true, // Add this flag to hide the header
    icon: <Settings2 size={20} className={styles.menuIcon} />,
    label: "Settings",
    alwaysExpanded: true, // Add this flag to keep it expanded
    content: (
      <div className={styles.optionsPanelContainer}>
        {isForceGraph3dActive && (
          <ForceGraphLayoutRadio
            layout={forceGraphLayout as ForceGraph3dLayoutMode}
            onLayoutChange={onForceGraphLayoutChange}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    ),
  },
];

export const rightFooterContent = (
  isOpen: boolean,
  actions?: {
    onFitToView: () => void;
    onViewEntities?: () => void;
    details?: {
      sceneGraphName: string;
      activeLayout: string;
      activeFilters?: string | null;
    };
  }
) => {
  if (!actions) return null;

  return (
    <div className={`${styles.footerButtonGroup} ${styles.footerButtonColumn}`}>
      {actions.details && (
        <div className={styles.footerDetailsCard}>
          <div className={styles.footerDetailsRow}>
            <span className={styles.footerDetailsLabel}>SceneGraph:</span>
            <span className={styles.footerDetailsValue}>
              {actions.details.sceneGraphName}
            </span>
          </div>
          <div className={styles.footerDetailsRow}>
            <span className={styles.footerDetailsLabel}>Active Layout:</span>
            <span className={styles.footerDetailsValue}>
              {actions.details.activeLayout}
            </span>
          </div>
          {actions.details.activeFilters && (
            <div className={styles.footerDetailsRow}>
              <span className={styles.footerDetailsLabel}>Active Filters:</span>
              <span className={styles.footerDetailsValue}>
                {actions.details.activeFilters}
              </span>
            </div>
          )}
        </div>
      )}
      <button className={styles.footerButton} onClick={actions.onViewEntities}>
        View Entities
      </button>
      <button className={styles.footerButton} onClick={actions.onFitToView}>
        Fit to View
      </button>
    </div>
  );
};
