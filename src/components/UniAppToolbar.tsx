import React, { useCallback, useEffect, useState } from "react";
import { SceneGraph } from "../core/model/SceneGraph";
import GraphSearch from "./common/GraphSearch";
import "./UniAppToolbar.css";

export interface MenuItem {
  action?: () => void;
  checked?: boolean;
  onChange?: () => void;
  submenu?: IMenuConfig;
}

export interface IMenuConfig {
  [key: string]: MenuItem;
}

interface UniAppToolbarProps {
  config: IMenuConfig;
  sceneGraph: SceneGraph; // Add SceneGraph type here
  onSearchResult?: (nodeIds: string[]) => void;
  onSelectResult?: (nodeId: string) => void;
  isDarkMode?: boolean;
  onHighlight?: (nodeId: string) => void;
  activeView: string;
  onViewChange: (view: string) => void;
  selectedSimulation: string;
  simulationList: string[];
}

const UniAppToolbar: React.FC<UniAppToolbarProps> = ({
  config,
  sceneGraph,
  onSearchResult,
  onSelectResult,
  isDarkMode,
  onHighlight,
  activeView,
  onViewChange,
  selectedSimulation,
  simulationList,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleMenuMouseEnter = (menuName: string) => {
    if (activeMenu !== null) {
      // Only auto-switch if a menu is already open
      setActiveMenu(menuName);
    }
  };

  const handleMenuItemClick = (event: React.MouseEvent, item: MenuItem) => {
    event.stopPropagation(); // Prevent event bubbling

    if (item.onChange) {
      item.onChange();
      return;
    }
    if (item.action) {
      item.action();
      if (!item.submenu) {
        // Only close if there's no submenu
        setActiveMenu(null);
      }
    }
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(".toolbar")) {
      setActiveMenu(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [handleClickOutside]);

  const renderMenu = (menuConfig: IMenuConfig) => {
    return (
      <ul className="menu">
        {Object.entries(menuConfig).map(([key, item]) => (
          <li
            key={key}
            className="menu-item"
            onMouseEnter={() => handleMenuMouseEnter(key)}
          >
            {item.checked !== undefined ? (
              <label className="menu-item-label">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => {
                    e.stopPropagation();
                    item.onChange?.();
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                {key}
              </label>
            ) : item.action ? (
              <button onClick={(e) => handleMenuItemClick(e, item)}>
                {key}
              </button>
            ) : (
              <span onClick={(e) => handleMenuItemClick(e, item)}>{key}</span>
            )}
            {item.submenu && renderMenu(item.submenu)}
          </li>
        ))}
      </ul>
    );
  };

  const renderGraphViewButtons = () => {
    const isSimulation = simulationList.includes(activeView);
    return (
      <div className="tab-container">
        <button
          className={`tab ${activeView === "Gallery" ? "active" : ""}`}
          style={{ maxWidth: "10px" }}
          onClick={() => onViewChange("Gallery")}
        >
          Gallery
        </button>
        <button
          className={`tab ${activeView === "Graphviz" ? "active" : ""}`}
          style={{ maxWidth: "10px" }}
          onClick={() => onViewChange("Graphviz")}
        >
          Graphviz
        </button>
        <button
          className={`tab ${activeView === "ForceGraph3d" ? "active" : ""}`}
          onClick={() => onViewChange("ForceGraph3d")}
        >
          3D
        </button>
        <button
          className={`tab ${activeView === "ReactFlow" ? "active" : ""}`}
          onClick={() => onViewChange("ReactFlow")}
        >
          Flow
        </button>
        <button
          className={`tab ${isSimulation ? "active" : ""}`}
          onClick={() => onViewChange(selectedSimulation)}
        >
          Sim
        </button>
      </div>
    );
  };

  const renderGraphSearch = () => {
    return (
      <GraphSearch
        sceneGraph={sceneGraph}
        onSearchResult={onSearchResult}
        onSelectResult={onSelectResult}
        isDarkMode={isDarkMode}
        onHighlight={onHighlight}
      />
    );
  };

  return (
    <nav className="uni-app-toolbar">
      <div className="menu-left">{renderMenu(config)}</div>
      <div className="search-center">{renderGraphSearch()}</div>
      <div className="menu-right">{renderGraphViewButtons()}</div>
    </nav>
  );
};

export default UniAppToolbar;
