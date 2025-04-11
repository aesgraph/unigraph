/* eslint-disable unused-imports/no-unused-vars */
import {
  ChevronDown,
  Copy,
  Edit2,
  Grid,
  MoreVertical,
  Plus,
  RefreshCw,
  Save,
  Settings,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import "../../components/projects/ProjectManager.css";
import { LayoutEngineOptionLabels } from "../../core/layouts/LayoutEngine";
import { NodePositionData } from "../../core/layouts/layoutHelpers";
import { SceneGraph } from "../../core/model/SceneGraph";
import useActiveLayoutStore, {
  Layout,
  saveLayout,
} from "../../store/activeLayoutStore";
import useAppConfigStore, {
  getCurrentSceneGraph,
} from "../../store/appConfigStore";
import { addNotification } from "../../store/notificationStore";
import { applyLayoutAndTriggerAppUpdate } from "../../store/sceneGraphHooks";
import styles from "./LayoutManager.module.css";

interface LayoutManagerV2Props {
  onLayoutSelected: (layout: Layout) => void;
  applyPredefinedLayout: (layoutName: string) => void;
  onSaveCurrentLayout: () => void;
  onShowLayoutManager: () => void;
  onResetLayout: () => void;
  sceneGraph: SceneGraph;
  currentPositions: NodePositionData;
}

interface OptionsMenuProps {
  onClose: () => void;
  onDeleteLayout: () => void;
  buttonRect: DOMRect | null;
}

const OptionsMenu: React.FC<OptionsMenuProps> = ({
  onClose,
  onDeleteLayout,
  buttonRect,
}) => {
  useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="options-menu"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: buttonRect ? buttonRect.bottom + 4 : 0,
        left: buttonRect ? buttonRect.left : 0,
      }}
    >
      <button className="delete-option" onClick={onDeleteLayout}>
        Delete
      </button>
    </div>
  );
};

const LayoutManagerV2: React.FC<LayoutManagerV2Props> = ({
  applyPredefinedLayout,
  onSaveCurrentLayout,
  onShowLayoutManager,
  onResetLayout,
  sceneGraph,
  currentPositions,
}) => {
  const { savedLayouts, deleteLayout } = useActiveLayoutStore();
  const [editingLayoutId, setEditingLayoutId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [optionsMenu, setOptionsMenu] = useState<{
    id: string;
    buttonRect: DOMRect | null;
  } | null>(null);
  const { currentLayoutResult } = useActiveLayoutStore();

  // Add state for active tab
  const [activeTab, setActiveTab] = useState<
    "savedLayouts" | "predefinedLayouts"
  >("savedLayouts");

  // Add state for selected predefined layout
  const [selectedPredefinedLayout, setSelectedPredefinedLayout] =
    useState<string>(LayoutEngineOptionLabels[0]);

  const isDarkMode = useAppConfigStore(
    (state) => state.activeView === "ForceGraph3d"
  );

  useEffect(() => {
    setSelectedPredefinedLayout(currentLayoutResult?.layoutType || "Custom");
  }, [currentLayoutResult]);

  // Convert savedLayouts object to array for rendering
  const layoutsList = Object.values(savedLayouts).sort(
    (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)
  );

  // Handle predefined layout selection
  const handleSelectPredefinedLayout = (layoutName: string) => {
    setSelectedPredefinedLayout(layoutName);
    applyPredefinedLayout(layoutName);
    // addNotification({
    //   message: `Layout "${layoutName}" applied`,
    //   type: "success",
    //   duration: 3000,
    // });
  };

  const handleStartEdit = (e: React.MouseEvent, layout: Layout) => {
    e.stopPropagation();
    setEditingLayoutId(layout.name);
    setEditingName(layout.name);
  };

  const handleSaveEdit = (e: React.MouseEvent, layoutId: string) => {
    e.stopPropagation();
    try {
      // Find the layout
      const layout = Object.values(savedLayouts).find(
        (l) => l.name === layoutId
      );
      if (!layout) return;

      // Update the layout name
      deleteLayout(layout.name);
      layout.name = editingName;
      saveLayout(layout);

      setEditingLayoutId(null);
      addNotification({
        message: `Renamed layout to "${editingName}"`,
        type: "success",
        duration: 3000,
      });
    } catch (err) {
      console.error("Error updating layout name:", err);
      addNotification({
        message: "Failed to rename layout",
        type: "error",
        duration: 3000,
      });
    }
  };

  const handleCopy = (e: React.MouseEvent, layout: Layout) => {
    e.stopPropagation();
    try {
      // Create a copy with a new name
      const newLayout: Layout = {
        ...structuredClone(layout),
        name: `Copy of ${layout.name}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      saveLayout(newLayout);

      addNotification({
        message: `Created copy of "${layout.name}"`,
        type: "success",
        duration: 3000,
      });
    } catch (err) {
      console.error("Error copying layout:", err);
      addNotification({
        message: "Failed to copy layout",
        type: "error",
        duration: 3000,
      });
    }
  };

  const handleSaveCurrent = () => {
    try {
      if (!getCurrentSceneGraph().getDisplayConfig().nodePositions) {
        throw new Error("No active layout to save");
      }
      // Show save dialog or use a prompt for simplicity
      const name = prompt("Enter a name for this layout:", "My Layout");
      if (!name) return;

      const layout: Layout = {
        name,
        positions: structuredClone(
          getCurrentSceneGraph().getDisplayConfig().nodePositions ?? {}
        ),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      saveLayout(layout);
      addNotification({
        message: `Layout "${name}" saved`,
        type: "success",
        duration: 3000,
      });
    } catch (err) {
      console.error("Error saving current layout:", err);
      addNotification({
        message: "Failed to save layout",
        type: "error",
        duration: 3000,
      });
    }
  };

  const handleOptionsClick = (e: React.MouseEvent, layoutId: string) => {
    e.stopPropagation();
    const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setOptionsMenu({ id: layoutId, buttonRect });
  };

  const handleDeleteLayout = (layoutId: string) => {
    if (window.confirm("Are you sure you want to delete this layout?")) {
      try {
        const layout = Object.values(savedLayouts).find(
          (l) => l.name === layoutId
        );
        deleteLayout(layoutId);

        addNotification({
          message: `Layout "${layout?.name || layoutId}" deleted`,
          type: "info",
          duration: 3000,
        });
      } catch (err) {
        console.error("Error deleting layout:", err);
        addNotification({
          message: "Failed to delete layout",
          type: "error",
          duration: 3000,
        });
      }
    }
  };

  const getNodeCount = (positions: NodePositionData) => {
    return Object.keys(positions).length;
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp).toLocaleString();
  };

  // Function to get configuration options based on selected layout
  const renderLayoutConfig = () => {
    // For now, return a placeholder. In the future, this could render different
    // configuration options based on the selected layout type
    return (
      <div className={styles.layoutConfig}>
        <h4>Layout Options</h4>
        <div className={styles.layoutConfigOption}>
          <label>
            No additional options available for {selectedPredefinedLayout}
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className={`project-manager ${isDarkMode ? "dark" : ""}`}>
      <div className="project-manager-header">
        <h3>Layouts</h3>
        <div className="project-manager-actions">
          <button
            title="Save Current"
            onClick={handleSaveCurrent}
            className="action-button"
          >
            <Save size={16} />
          </button>
          <button
            title="Reset Layout"
            onClick={onResetLayout}
            className="action-button"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="project-tabs">
        <button
          className={`tab-button ${activeTab === "savedLayouts" ? "active" : ""}`}
          onClick={() => setActiveTab("savedLayouts")}
        >
          Saved Layouts
        </button>
        <button
          className={`tab-button ${activeTab === "predefinedLayouts" ? "active" : ""}`}
          onClick={() => setActiveTab("predefinedLayouts")}
        >
          Predefined
        </button>
      </div>

      <div className="tab-content">
        {/* Saved Layouts Tab */}
        {activeTab === "savedLayouts" && (
          <div
            className="projects-list"
            style={{
              minHeight: 0,
              flexGrow: 1,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {layoutsList.length === 0 ? (
              <div className="projects-empty">
                <p>No saved layouts</p>
                <button
                  className="new-project-button"
                  onClick={handleSaveCurrent}
                >
                  <Plus size={16} /> Save Current Layout
                </button>
              </div>
            ) : (
              layoutsList.map((layout) => (
                <div
                  key={layout.name}
                  className={`project-item ${currentLayoutResult?.layoutType === layout.name ? "selected" : ""}`}
                  onClick={() => applyLayoutAndTriggerAppUpdate(layout)}
                >
                  <div className="project-icon">
                    <Grid size={18} />
                  </div>
                  <div className="project-details">
                    <div className="project-name">
                      {editingLayoutId === layout.name ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveEdit(e as any, layout.name);
                            } else if (e.key === "Escape") {
                              setEditingLayoutId(null);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="project-name-input"
                          autoFocus
                        />
                      ) : (
                        layout.name
                      )}
                    </div>
                    <div className="project-dates">
                      <span>{getNodeCount(layout.positions)} nodes</span>
                      <span className={styles.layoutDate}>
                        {formatDate(layout.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="project-actions">
                    <button
                      title="Edit Name"
                      onClick={(e) =>
                        editingLayoutId === layout.name
                          ? handleSaveEdit(e, layout.name)
                          : handleStartEdit(e, layout)
                      }
                      className="project-action-button"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      title="Copy"
                      onClick={(e) => handleCopy(e, layout)}
                      className="project-action-button"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      title="Options"
                      onClick={(e) => handleOptionsClick(e, layout.name)}
                      className="project-action-button"
                    >
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Predefined Layouts Tab - now with dropdown instead of list */}
        {activeTab === "predefinedLayouts" && (
          <div className={styles.predefinedLayoutsContainer}>
            <div className={styles.layoutSelectorContainer}>
              <div className={styles.layoutSelectorLabel}>
                <Settings size={16} />
                <span>Select Layout Algorithm:</span>
              </div>
              <div className={styles.layoutDropdownContainer}>
                <select
                  className={styles.layoutDropdown}
                  value={selectedPredefinedLayout}
                  onChange={(e) => handleSelectPredefinedLayout(e.target.value)}
                >
                  {LayoutEngineOptionLabels.map((layout) => (
                    <option key={layout} value={layout}>
                      {layout}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className={styles.dropdownIcon} />
              </div>
            </div>

            {/* Layout configuration options section */}
            <div className={styles.layoutConfigSection}>
              {renderLayoutConfig()}
            </div>

            {/* Apply button */}
            <button
              className={styles.applyLayoutButton}
              onClick={() =>
                handleSelectPredefinedLayout(selectedPredefinedLayout)
              }
            >
              Apply Layout
            </button>
          </div>
        )}
      </div>

      {optionsMenu && (
        <OptionsMenu
          buttonRect={optionsMenu.buttonRect}
          onClose={() => setOptionsMenu(null)}
          onDeleteLayout={() => {
            handleDeleteLayout(optionsMenu.id);
            setOptionsMenu(null);
          }}
        />
      )}
    </div>
  );
};

export default LayoutManagerV2;
