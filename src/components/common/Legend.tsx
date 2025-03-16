import React, { useEffect, useState } from "react";
import { DisplayConfig } from "../../controllers/RenderingManager";
import { SceneGraph } from "../../core/model/SceneGraph";
import "./Legend.css";

interface LegendProps {
  title?: string;
  displayConfig: DisplayConfig;
  onChange: (key: string, newColor: string) => void;
  onCheck: (key: string, isVisible: boolean) => void;
  onCheckBulk: (updates: { [key: string]: boolean }) => void;
  isDarkMode?: boolean;
  statistics?: { [key: string]: number };
  totalCount?: number;
  sceneGraph: SceneGraph;
  onMouseHoverItem?: (key: string) => void;
  onMouseUnhoverItem?: (key: string) => void;
}

const Legend: React.FC<LegendProps> = ({
  title,
  displayConfig,
  onChange,
  onCheck,
  onCheckBulk,
  isDarkMode = false,
  statistics = {},
  totalCount = undefined,
  sceneGraph,
  onMouseHoverItem,
  onMouseUnhoverItem,
}) => {
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(
    Object.entries(displayConfig).reduce(
      (acc, [key, config]) => ({ ...acc, [key]: config.isVisible }),
      {}
    )
  );

  const [colors, setColors] = useState<{ [key: string]: string }>(
    Object.entries(displayConfig).reduce(
      (acc, [key, config]) => ({ ...acc, [key]: config.color }),
      {}
    )
  );

  // Initialize colors as hex values
  useEffect(() => {
    const initialColors = Object.entries(displayConfig).reduce(
      (acc, [key, config]) => {
        acc[key] = colorToHex(config.color); // Convert to hex
        return acc;
      },
      {} as { [key: string]: string }
    );
    const initialChecks = Object.entries(displayConfig).reduce(
      (acc, [key, config]) => {
        acc[key] = config.isVisible; // Convert to hex
        return acc;
      },
      {} as { [key: string]: boolean }
    );

    setColors(initialColors);
    setCheckedItems(initialChecks);
  }, [displayConfig]);

  const handleCheckboxChange = (key: string) => {
    const newCheckedState = !checkedItems[key];
    setCheckedItems((prev) => ({ ...prev, [key]: newCheckedState }));
    onCheck(key, newCheckedState);
  };

  const handleColorChange = (key: string, newColor: string) => {
    setColors((prev) => ({ ...prev, [key]: newColor }));
    onChange(key, newColor);
  };

  const handleMouseEnter = (key: string) => {
    onMouseHoverItem?.(key);
  };

  const handleMouseLeave = (key: string) => {
    onMouseUnhoverItem?.(key);
  };

  const theme = isDarkMode ? "dark" : "light";

  const keys = Object.keys(displayConfig).sort((a, b) => {
    if (statistics === undefined) {
      return a.localeCompare(b);
    }
    return (statistics[b] ?? 0) - (statistics[a] ?? 0);
  });

  return (
    <div className={`legend-container ${theme}`}>
      <div className="legend-title-container">
        <h3 className={`legend-title ${theme}`}>{title ?? "Legend"}</h3>
        <span className={`legend-count ${theme}`}>{totalCount}</span>
      </div>
      <div className="legend-items">
        {keys.map((key) => (
          <label
            key={key}
            className={`legend-item ${theme}`}
            onMouseEnter={() => handleMouseEnter(key)}
            onMouseLeave={() => handleMouseLeave(key)}
          >
            <div className="legend-item-label">
              <input
                type="checkbox"
                checked={checkedItems[key]}
                onChange={() => handleCheckboxChange(key)}
                className="legend-checkbox"
              />
              <span className={`legend-text ${theme}`}>{key}</span>
            </div>
            <div className="legend-item-label">
              {statistics && statistics[key] !== undefined && (
                <span className={`legend-count ${theme}`}>
                  {statistics[key]}
                </span>
              )}
              <input
                type="color"
                value={colors[key] || "#000000"}
                onChange={(e) => handleColorChange(key, e.target.value)}
                className="legend-color-picker"
              />
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

// Utility function to convert color to hex
const colorToHex = (color: string): string => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (context) {
    context.fillStyle = color;
    return context.fillStyle; // Converts to a valid hex code
  }

  return "#000000"; // Fallback to black if conversion fails
};

export default Legend;
