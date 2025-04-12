import React from "react";
import { CustomLayoutType } from "../../core/layouts/CustomLayoutEngine";
import { GraphologyLayoutType } from "../../core/layouts/GraphologyLayoutEngine";
import { GraphvizLayoutType } from "../../core/layouts/GraphvizLayoutEngine";
import {
  LayoutEngineOption,
  PresetLayoutType,
} from "../../core/layouts/layoutEngineTypes";
import "./GraphLayoutToolbar.css";

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
  const allLayoutLabels = [
    ...Object.values(GraphvizLayoutType),
    ...Object.values(GraphologyLayoutType),
    ...Object.values(CustomLayoutType),
    ...Object.values(PresetLayoutType),
  ];
  return (
    <div className={`graph-layout-toolbar ${isDarkMode ? "dark" : ""}`}>
      <div className="toolbar-title">Layouts</div>
      <div className="layout-options">
        {allLayoutLabels.map((layout) => (
          <button
            key={layout}
            className={`layout-button ${!physicsMode && activeLayout === layout ? "active" : ""}`}
            onClick={() => onLayoutChange(layout)}
          >
            {layout}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GraphLayoutToolbar;
