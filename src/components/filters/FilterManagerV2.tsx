/* eslint-disable unused-imports/no-unused-vars */
import {
  Copy,
  Edit2,
  Filter as FilterIcon,
  MoreVertical,
  Plus,
  RefreshCw,
  Save,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import useActiveFilterStore, {
  Filter,
  saveFilter,
} from "../../store/activeFilterStore";
import useAppConfigStore from "../../store/appConfigStore";
import { addNotification } from "../../store/notificationStore"; // Add import for notifications
import "../projects/ProjectManager.css"; // Import ProjectManager styles
import "./FilterManagerV2.css";

interface FilterManagerV2Props {
  onFilterSelected: (filter: Filter | null) => void;
  onShowFilter: () => void;
  onShowFilterManager: () => void;
  onClearFilters: () => void;
}

interface OptionsMenuProps {
  onClose: () => void;
  onDeleteFilter: () => void;
  buttonRect: DOMRect | null; // Add this prop
}

const OptionsMenu: React.FC<OptionsMenuProps> = ({
  onClose,
  onDeleteFilter,
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
      <button className="delete-option" onClick={onDeleteFilter}>
        Delete
      </button>
    </div>
  );
};

const FilterManagerV2: React.FC<FilterManagerV2Props> = ({
  onFilterSelected,
  onShowFilter,
  onShowFilterManager,
  onClearFilters,
}) => {
  const { savedFilters, deleteFilter } = useActiveFilterStore();
  const { activeFilter } = useAppConfigStore();
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [optionsMenu, setOptionsMenu] = useState<{
    id: string;
    buttonRect: DOMRect | null;
  } | null>(null);
  const { currentSceneGraph } = useAppConfigStore();
  const isDarkMode = useAppConfigStore(
    (state) => state.activeView === "ForceGraph3d"
  );

  // Convert savedFilters object to array for rendering
  const filtersList = Object.values(savedFilters);

  // Handle filter selection
  const handleSelectFilter = (filter: Filter) => {
    onFilterSelected(filter);
    addNotification({
      message: `Filter "${filter.name}" applied`,
      type: "success",
      duration: 3000,
    });
  };

  const handleStartEdit = (e: React.MouseEvent, filter: Filter) => {
    e.stopPropagation();
    setEditingFilterId(filter.name);
    setEditingName(filter.name);
  };

  const handleSaveEdit = (e: React.MouseEvent, filterId: string) => {
    e.stopPropagation();
    try {
      // Find the filter
      const filter = Object.values(savedFilters).find(
        (f) => f.name === filterId
      );
      if (!filter) return;

      // Update the filter name
      deleteFilter(filter.name);
      filter.name = editingName;
      saveFilter(filter);

      setEditingFilterId(null);
      addNotification({
        message: `Renamed filter to "${editingName}"`,
        type: "success",
        duration: 3000,
      });
    } catch (err) {
      console.error("Error updating filter name:", err);
      addNotification({
        message: "Failed to rename filter",
        type: "error",
        duration: 3000,
      });
    }
  };

  const handleCopy = (e: React.MouseEvent, filter: Filter) => {
    e.stopPropagation();
    try {
      // Create a copy with a new ID
      const newFilter: Filter = {
        ...filter,
        name: `${filter.name}-copy-${Date.now()}`,
      };

      useActiveFilterStore.getState().saveFilter(newFilter);

      addNotification({
        message: `Created copy of "${filter.name}"`,
        type: "success",
        duration: 3000,
      });
    } catch (err) {
      console.error("Error copying filter:", err);
      addNotification({
        message: "Failed to copy filter",
        type: "error",
        duration: 3000,
      });
    }
  };

  const handleSaveCurrent = () => {
    if (!activeFilter) {
      addNotification({
        message: "No active filter to save",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    // Show save dialog or use a prompt for simplicity
    const name = prompt(
      "Enter a name for this filter:",
      activeFilter.name || "My Filter"
    );
    if (!name) return;

    const filter: Filter = {
      ...activeFilter,
      name: `filter-${Date.now()}`,
    };

    useActiveFilterStore.getState().saveFilter(filter);
    addNotification({
      message: `Filter "${name}" saved`,
      type: "success",
      duration: 3000,
    });
  };

  const handleOptionsClick = (e: React.MouseEvent, filterId: string) => {
    e.stopPropagation();
    const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setOptionsMenu({ id: filterId, buttonRect });
  };

  const handleDeleteFilter = (filterId: string) => {
    if (window.confirm("Are you sure you want to delete this filter?")) {
      try {
        const filter = Object.values(savedFilters).find(
          (f) => f.name === filterId
        );
        deleteFilter(filterId);

        // If the deleted filter was active, clear it
        if (activeFilter?.name === filterId) {
          onFilterSelected(null);
        }

        addNotification({
          message: `Filter "${filter?.name || filterId}" deleted`,
          type: "info",
          duration: 3000,
        });
      } catch (err) {
        console.error("Error deleting filter:", err);
        addNotification({
          message: "Failed to delete filter",
          type: "error",
          duration: 3000,
        });
      }
    }
  };

  return (
    <div className={`project-manager ${isDarkMode ? "dark" : ""}`}>
      <div className="project-manager-header">
        <h3>Saved Filters</h3>
        <div className="project-manager-actions">
          <button
            title="Create New"
            onClick={onShowFilter}
            className="action-button"
          >
            <Plus size={16} />
          </button>
          <button
            title="Save Current"
            onClick={handleSaveCurrent}
            className="action-button"
          >
            <Save size={16} />
          </button>
          <button
            title="Clear All"
            onClick={onClearFilters}
            className="action-button"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="tab-content">
        <div
          className="projects-list"
          style={{
            minHeight: 0, // Critical for nested flex containers
            flexGrow: 1, // Take remaining space
            overflowY: "auto", // Enable vertical scrolling
            overflowX: "hidden", // Prevent horizontal scrolling
          }}
        >
          {filtersList.length === 0 ? (
            <div className="projects-empty">
              <p>No saved filters</p>
              <button className="new-project-button" onClick={onShowFilter}>
                <Plus size={16} /> Create New Filter
              </button>
            </div>
          ) : (
            filtersList.map((filter) => (
              <div
                key={filter.name}
                className={`project-item ${activeFilter?.name === filter.name ? "selected" : ""}`}
                onClick={() => handleSelectFilter(filter)}
              >
                <div className="project-icon">
                  <FilterIcon size={18} />
                </div>
                <div className="project-details">
                  <div className="project-name">
                    {editingFilterId === filter.name ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveEdit(e as any, filter.name);
                          } else if (e.key === "Escape") {
                            setEditingFilterId(null);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="project-name-input"
                        autoFocus
                      />
                    ) : (
                      filter.name
                    )}
                  </div>
                  <div className="project-dates">
                    {filter.filterRules.length === 1 ? (
                      <span>{filter.filterRules.length} rule</span>
                    ) : (
                      <span>{filter.filterRules.length} rules</span>
                    )}
                  </div>
                </div>
                <div className="project-actions">
                  <button
                    title="Edit Name"
                    onClick={(e) =>
                      editingFilterId === filter.name
                        ? handleSaveEdit(e, filter.name)
                        : handleStartEdit(e, filter)
                    }
                    className="project-action-button"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    title="Copy"
                    onClick={(e) => handleCopy(e, filter)}
                    className="project-action-button"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    title="Options"
                    onClick={(e) => handleOptionsClick(e, filter.name)}
                    className="project-action-button"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {optionsMenu && (
        <OptionsMenu
          buttonRect={optionsMenu.buttonRect}
          onClose={() => setOptionsMenu(null)}
          onDeleteFilter={() => {
            handleDeleteFilter(optionsMenu.id);
            setOptionsMenu(null);
          }}
        />
      )}
    </div>
  );
};

export default FilterManagerV2;
