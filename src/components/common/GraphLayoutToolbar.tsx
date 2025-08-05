import { getColor, useTheme } from "@aesgraph/app-shell";
import { ChevronDown, Layout } from "lucide-react";
import React, { useState } from "react";
import { CustomLayoutType } from "../../core/layouts/CustomLayoutEngine";
import { GraphologyLayoutType } from "../../core/layouts/GraphologyLayoutEngine";
import { GraphvizLayoutType } from "../../core/layouts/GraphvizLayoutType";
import {
  LayoutEngineOption,
  PresetLayoutType,
} from "../../core/layouts/layoutEngineTypes";

interface GraphLayoutToolbarProps {
  activeLayout: LayoutEngineOption;
  onLayoutChange: (layout: LayoutEngineOption) => void;
  physicsMode: boolean;
  isDarkMode?: boolean;
}

const GraphLayoutToolbar: React.FC<GraphLayoutToolbarProps> = ({
  activeLayout,
  onLayoutChange,
  physicsMode,
  isDarkMode = false,
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const allLayoutLabels = [
    ...Object.values(GraphvizLayoutType),
    ...Object.values(GraphologyLayoutType),
    ...Object.values(CustomLayoutType),
    ...Object.values(PresetLayoutType),
  ];

  const containerStyle: React.CSSProperties = {
    position: "absolute",
    top: "1rem",
    left: "1rem",
    zIndex: 1000,
  };

  const dropdownButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 0.75rem",
    background: getColor(theme.colors, "surface"),
    border: `1px solid ${getColor(theme.colors, "border")}`,
    borderRadius: "0.5rem",
    color: getColor(theme.colors, "text"),
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 500,
    transition: "all 0.2s",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  };

  const dropdownMenuStyle: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: "0.25rem",
    background: getColor(theme.colors, "surface"),
    border: `1px solid ${getColor(theme.colors, "border")}`,
    borderRadius: "0.5rem",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    maxHeight: "300px",
    overflowY: "auto",
    zIndex: 1001,
  };

  const dropdownItemStyle = (isActive: boolean): React.CSSProperties => ({
    padding: "0.5rem 0.75rem",
    border: "none",
    background: "transparent",
    color: isActive
      ? getColor(theme.colors, "primary")
      : getColor(theme.colors, "text"),
    cursor: "pointer",
    fontSize: "0.875rem",
    textAlign: "left",
    width: "100%",
    transition: "all 0.2s",
    fontWeight: isActive ? 600 : 400,
  });

  const chevronStyle: React.CSSProperties = {
    transition: "transform 0.2s",
    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleLayoutSelect = (layout: LayoutEngineOption) => {
    onLayoutChange(layout);
    setIsOpen(false);
  };

  return (
    <div style={containerStyle}>
      <button style={dropdownButtonStyle} onClick={handleToggle}>
        <Layout size={16} />
        <span>{!physicsMode ? activeLayout : "Physics Mode"}</span>
        <ChevronDown size={16} style={chevronStyle} />
      </button>

      {isOpen && (
        <div style={dropdownMenuStyle}>
          {allLayoutLabels.map((layout) => {
            const isActive = !physicsMode && activeLayout === layout;
            return (
              <button
                key={layout}
                style={dropdownItemStyle(isActive)}
                onClick={() => handleLayoutSelect(layout)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = getColor(
                      theme.colors,
                      "backgroundSecondary"
                    );
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {layout}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GraphLayoutToolbar;
