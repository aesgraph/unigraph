import { Settings } from "lucide-react";
import React, { useState } from "react";
import useWorkspaceConfigStore from "../../store/workspaceConfigStore";
import styles from "./WorkspaceSettings.module.css";

interface WorkspaceSettingsProps {
  isDarkMode?: boolean;
  style?: React.CSSProperties;
}

const WorkspaceSettings: React.FC<WorkspaceSettingsProps> = ({
  isDarkMode = false,
  style = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    showToolbar,
    leftSidebarConfig,
    rightSidebarConfig,
    setShowToolbar,
    setLeftSidebarConfig,
    setRightSidebarConfig,
  } = useWorkspaceConfigStore();

  const toggleSettings = () => {
    setIsOpen((v) => !v);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleToggleToolbar = () => {
    setShowToolbar(!showToolbar);
  };

  const handleToggleLeftSidebar = () => {
    setLeftSidebarConfig({
      isVisible: !leftSidebarConfig.isVisible,
    });
  };

  const handleToggleRightSidebar = () => {
    setRightSidebarConfig({
      isVisible: !rightSidebarConfig.isVisible,
    });
  };

  const handleHideWorkspace = () => {
    setShowToolbar(false);
    setLeftSidebarConfig({
      isVisible: false,
      mode: "collapsed",
      minimal: false,
    });
    setRightSidebarConfig({
      isVisible: false,
      mode: "collapsed",
      minimal: false,
    });
  };

  const handleShowAll = () => {
    setShowToolbar(true);
    setLeftSidebarConfig({
      isVisible: true,
      mode: "collapsed",
      minimal: false,
    });
    setRightSidebarConfig({
      isVisible: true,
      mode: "collapsed",
      minimal: false,
    });
  };

  return (
    <div className={styles.container}>
      <button
        className={`${styles.settingsButton} ${isDarkMode ? styles.dark : ""}`}
        onClick={toggleSettings}
        title="Workspace Settings"
        style={style}
      >
        <Settings size={20} style={style} />
      </button>

      {isOpen && (
        <>
          <div className={styles.settingsBackdrop} onClick={handleClose} />
          <div
            className={`${styles.settingsPanel} ${isDarkMode ? styles.dark : ""}`}
          >
            <div className={styles.settingsHeader}>
              <h3>Workspace Settings</h3>
              <button
                className={styles.closeButton}
                onClick={handleClose}
                aria-label="Close settings"
              >
                ×
              </button>
            </div>

            <div className={styles.settingsContent}>
              <div className={styles.settingItem}>
                <label className={styles.settingLabel}>
                  <input
                    type="checkbox"
                    checked={showToolbar}
                    onChange={handleToggleToolbar}
                    className={styles.checkbox}
                  />
                  Show Toolbar
                </label>
              </div>

              <div className={styles.settingItem}>
                <label className={styles.settingLabel}>
                  <input
                    type="checkbox"
                    checked={leftSidebarConfig.isVisible}
                    onChange={handleToggleLeftSidebar}
                    className={styles.checkbox}
                  />
                  Show Left Sidebar
                </label>
              </div>

              <div className={styles.settingItem}>
                <label className={styles.settingLabel}>
                  <input
                    type="checkbox"
                    checked={rightSidebarConfig.isVisible}
                    onChange={handleToggleRightSidebar}
                    className={styles.checkbox}
                  />
                  Show Right Sidebar
                </label>
              </div>

              <div className={styles.settingActions}>
                <button
                  className={`${styles.actionButton} ${styles.hideButton}`}
                  onClick={handleHideWorkspace}
                >
                  Hide All
                </button>
                <button
                  className={`${styles.actionButton} ${styles.showButton}`}
                  onClick={handleShowAll}
                >
                  Show All
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkspaceSettings;
