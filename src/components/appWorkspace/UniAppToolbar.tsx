import { getColor, useTheme } from "@aesgraph/app-shell";
import React, { useCallback, useEffect, useState } from "react";
import { SceneGraph } from "../../core/model/SceneGraph";
import GraphSearch from "../common/GraphSearch";
import GraphViewTabs from "./GraphViewTabs";
import "./UniAppToolbar.css";

// Keyboard shortcut icons component
const KeyboardShortcut: React.FC<{
  shortcut: string;
  useFragment?: boolean;
}> = ({ shortcut, useFragment = false }) => {
  const isMac = navigator.platform.toLowerCase().includes("mac");

  const renderKey = (key: string) => {
    const keyMap: { [key: string]: string } = {
      cmd: isMac ? "⌘" : "Ctrl",
      ctrl: "Ctrl",
      shift: "⇧",
      alt: "⌥",
      p: "P",
      s: "S",
      o: "O",
      n: "N",
      f: "F",
      e: "E",
      r: "R",
      t: "T",
      w: "W",
      h: "H",
      j: "J",
      k: "K",
      l: "L",
      z: "Z",
      x: "X",
      c: "C",
      v: "V",
      b: "B",
      m: "M",
      a: "A",
      d: "D",
      g: "G",
      i: "I",
      u: "U",
      y: "Y",
      q: "Q",
      "1": "1",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5",
      "6": "6",
      "7": "7",
      "8": "8",
      "9": "9",
      "0": "0",
    };

    return keyMap[key.toLowerCase()] || key.toUpperCase();
  };

  const keys = shortcut.split("+").map((key) => key.trim());

  if (!useFragment) {
    // Compact Mac-style rendering - just a simple string
    const shortcutText = keys.map((key) => renderKey(key)).join(" ");
    return <span className="keyboard-shortcut-compact">{shortcutText}</span>;
  }

  // Full styling with individual key boxes
  return (
    <span className="keyboard-shortcut">
      {keys.map((key, index) => {
        const KeyComponent = React.Fragment;
        const SeparatorComponent = React.Fragment;

        return (
          <KeyComponent key={index}>
            <span className="key">{renderKey(key)}</span>
            {index < keys.length - 1 && (
              <SeparatorComponent>
                <span className="separator">+</span>
              </SeparatorComponent>
            )}
          </KeyComponent>
        );
      })}
    </span>
  );
};

export interface MenuItem {
  action?: () => void;
  checked?: boolean;
  onChange?: () => void;
  submenu?: IMenuConfig;
  tooltip?: string; // Add tooltip property
  useFragment?: boolean; // Toggle for React.Fragment usage
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
  onViewChange: (view: string, fitToView: boolean) => void;
  selectedSimulation: string;
  simulationList: string[];
  style?: React.CSSProperties;
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
  style,
}) => {
  const { theme } = useTheme();
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
            style={{
              color: getColor(theme.colors, "text"),
            }}
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
                <span
                  className="menu-item-text"
                  style={{
                    color: getColor(theme.colors, "text"),
                  }}
                >
                  {key}
                  {item.tooltip && (
                    <KeyboardShortcut
                      shortcut={item.tooltip}
                      useFragment={item.useFragment}
                    />
                  )}
                </span>
              </label>
            ) : item.action ? (
              <button
                onClick={(e) => handleMenuItemClick(e, item)}
                style={{
                  color: getColor(theme.colors, "text"),
                }}
              >
                <span
                  className="menu-item-text"
                  style={{
                    color: getColor(theme.colors, "text"),
                  }}
                >
                  {key}
                  {item.tooltip && (
                    <KeyboardShortcut
                      shortcut={item.tooltip}
                      useFragment={item.useFragment}
                    />
                  )}
                </span>
              </button>
            ) : (
              <span
                onClick={(e) => handleMenuItemClick(e, item)}
                style={{
                  color: getColor(theme.colors, "text"),
                }}
              >
                <span
                  className="menu-item-text"
                  style={{
                    color: getColor(theme.colors, "text"),
                  }}
                >
                  {key}
                  {item.tooltip && (
                    <KeyboardShortcut
                      shortcut={item.tooltip}
                      useFragment={item.useFragment}
                    />
                  )}
                </span>
              </span>
            )}
            {item.submenu && renderMenu(item.submenu)}
          </li>
        ))}
      </ul>
    );
  };

  const renderGraphViewButtons = () => {
    return (
      <GraphViewTabs
        activeView={activeView}
        onViewChange={onViewChange}
        simulationList={simulationList}
        selectedSimulation={selectedSimulation}
      />
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

  // Debug theme colors
  console.log("Theme colors:", {
    workspacePanel: getColor(theme.colors, "workspacePanel"),
    border: getColor(theme.colors, "border"),
    text: getColor(theme.colors, "text"),
    textSecondary: getColor(theme.colors, "textSecondary"),
  });

  return (
    <nav
      className="uni-app-toolbar"
      style={{
        backgroundColor: getColor(theme.colors, "workspaceTitleBackground"),
        color: getColor(theme.colors, "text"),
        borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
        ["--submenu-bg" as any]: getColor(theme.colors, "workspaceBackground"),
        ["--submenu-border" as any]: getColor(theme.colors, "border"),
        ["--toolbar-text" as any]: getColor(theme.colors, "text"),
        ["--shortcut-text" as any]: getColor(theme.colors, "textSecondary"),
        ...style,
      }}
    >
      <div className="menu-left">{renderMenu(config)}</div>
      <div className="search-center">{renderGraphSearch()}</div>
      <div className="menu-right">{renderGraphViewButtons()}</div>
    </nav>
  );
};

export default UniAppToolbar;
