import React from "react";
import { RenderingManager__DisplayMode } from "../../controllers/RenderingManager";
import "./LayoutModeRadio.css";

interface LayoutModeRadioProps {
  layoutMode: RenderingManager__DisplayMode;
  onLayoutModeChange: (mode: RenderingManager__DisplayMode) => void;
  isDarkMode?: boolean;
}

const LayoutModeRadio: React.FC<LayoutModeRadioProps> = ({
  layoutMode,
  onLayoutModeChange,
  isDarkMode = true,
}) => {
  return (
    <div className={`layout-mode-radio ${isDarkMode ? "dark" : "light"}`}>
      <label
        className={`radio-label ${layoutMode === "type" ? "selected" : ""}`}
      >
        <input
          type="radio"
          value="type"
          checked={layoutMode === "type"}
          onChange={() => onLayoutModeChange("type")}
          className="radio-input"
        />
        Type
      </label>
      <label
        className={`radio-label ${layoutMode === "tag" ? "selected" : ""}`}
      >
        <input
          type="radio"
          value="tag"
          checked={layoutMode === "tag"}
          onChange={() => onLayoutModeChange("tag")}
          className="radio-input"
        />
        Tag
      </label>
    </div>
  );
};

export default LayoutModeRadio;
