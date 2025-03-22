import React from "react";
import { RenderingManager__DisplayMode } from "../../controllers/RenderingManager";
import useAppConfigStore from "../../store/appConfigStore";
import "./LegendModeRadio.css";

interface LegendModeRadioProps {
  onLegendModeChange: (mode: RenderingManager__DisplayMode) => void;
  isDarkMode?: boolean;
}

const LegendModeRadio: React.FC<LegendModeRadioProps> = ({
  onLegendModeChange,
  isDarkMode = true,
}) => {
  const { legendMode } = useAppConfigStore();

  return (
    <div className={`legend-mode-radio ${isDarkMode ? "dark" : "light"}`}>
      <label
        className={`radio-label ${legendMode === "type" ? "selected" : ""}`}
      >
        <input
          type="radio"
          value="type"
          checked={legendMode === "type"}
          onChange={() => onLegendModeChange("type")}
          className="radio-input"
        />
        Type
      </label>
      <label
        className={`radio-label ${legendMode === "tag" ? "selected" : ""}`}
      >
        <input
          type="radio"
          value="tag"
          checked={legendMode === "tag"}
          onChange={() => onLegendModeChange("tag")}
          className="radio-input"
        />
        Tag
      </label>
    </div>
  );
};

export default LegendModeRadio;
