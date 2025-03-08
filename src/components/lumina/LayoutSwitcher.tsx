import React from "react";

interface LayoutSwitcherProps {
  currentLayout: "grid2d" | "random3d" | "stack";
  onLayoutChange: (layout: "grid2d" | "random3d" | "stack") => void;
  style?: React.CSSProperties; // Add style prop to interface
}

const LayoutSwitcher: React.FC<LayoutSwitcherProps> = ({
  currentLayout,
  onLayoutChange,
  style, // Add style to props
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        zIndex: 1000,
        display: "flex",
        gap: "10px",
        ...style, // Spread the style prop
      }}
    >
      <button
        onClick={() => onLayoutChange("grid2d")}
        style={{
          backgroundColor: currentLayout === "grid2d" ? "#4CAF50" : "#ddd",
          padding: "8px 16px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          color: currentLayout === "grid2d" ? "white" : "black",
        }}
      >
        Grid
      </button>
      <button
        onClick={() => onLayoutChange("random3d")}
        style={{
          backgroundColor: currentLayout === "random3d" ? "#4CAF50" : "#ddd",
          padding: "8px 16px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          color: currentLayout === "random3d" ? "white" : "black",
        }}
      >
        Random
      </button>
      <button
        onClick={() => onLayoutChange("stack")}
        style={{
          backgroundColor: currentLayout === "stack" ? "#4CAF50" : "#ddd",
          padding: "8px 16px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          color: currentLayout === "stack" ? "white" : "black",
        }}
      >
        Stack
      </button>
    </div>
  );
};

export default LayoutSwitcher;
