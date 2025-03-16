import React from "react";
import "./ForceGraphLayoutRadio.css";
import { ForceGraph3dLayoutMode } from "../../AppConfig";

interface ForceGraphLayoutRadioProps {
  layout: ForceGraph3dLayoutMode;
  onLayoutChange: (layout: ForceGraph3dLayoutMode) => void;
  isDarkMode: boolean;
}

const ForceGraphLayoutRadio: React.FC<ForceGraphLayoutRadioProps> = ({
  layout,
  onLayoutChange,
  isDarkMode,
}) => {
  return (
    <div
      className={`force-graph-layout-radio ${isDarkMode ? "dark" : "light"}`}
    >
      <label className="radio-label">
        <input
          type="radio"
          value="Physics"
          checked={layout === "Physics"}
          onChange={() => onLayoutChange("Physics")}
          className="radio-input"
        />
        Physics
      </label>
      <label className="radio-label">
        <input
          type="radio"
          value="Graphviz"
          checked={layout === "Layout"}
          onChange={() => onLayoutChange("Layout")}
          className="radio-input"
        />
        Layout
      </label>
    </div>
  );
};

export default ForceGraphLayoutRadio;
