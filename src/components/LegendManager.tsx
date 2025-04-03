import React, { useState } from "react";
import { DisplayConfig } from "../controllers/RenderingManager";
import { SceneGraph } from "../core/model/SceneGraph";
import "./LegendManager.css";

interface LegendManagerProps {
  sceneGraph: SceneGraph;
  nodeLegendConfig: DisplayConfig;
  edgeLegendConfig: DisplayConfig;
  onNodeLegendChange: (key: string, newColor: string) => void;
  onEdgeLegendChange: (key: string, newColor: string) => void;
  onNodeVisibilityChange: (key: string, isVisible: boolean) => void;
  onEdgeVisibilityChange: (key: string, isVisible: boolean) => void;
  onNodeOpacityChange: (key: string, opacity: number) => void;
  onEdgeOpacityChange: (key: string, opacity: number) => void;
  onClose: () => void;
  isDarkMode?: boolean;
}

const LegendManager: React.FC<LegendManagerProps> = ({
  sceneGraph,
  nodeLegendConfig,
  edgeLegendConfig,
  onNodeLegendChange,
  onEdgeLegendChange,
  onNodeVisibilityChange,
  onEdgeVisibilityChange,
  onNodeOpacityChange,
  onEdgeOpacityChange,
  onClose,
  isDarkMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<"nodes" | "edges">("nodes");

  const renderLegendItems = (
    config: DisplayConfig,
    onChange: (key: string, newColor: string) => void,
    onVisibilityChange: (key: string, isVisible: boolean) => void,
    onOpacityChange: (key: string, opacity: number) => void
  ) => {
    return Object.entries(config).map(([key, value]) => (
      <div key={key} className={`legend-item ${isDarkMode ? "dark" : "light"}`}>
        <div className="legend-item-label">
          <input
            type="checkbox"
            checked={value.isVisible}
            onChange={() => onVisibilityChange(key, !value.isVisible)}
          />
          <span>{key}</span>
        </div>
        <div className="legend-item-controls">
          <input
            type="color"
            value={value.color}
            onChange={(e) => onChange(key, e.target.value)}
          />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={value.opacity || 1}
            onChange={(e) => onOpacityChange(key, parseFloat(e.target.value))}
          />
        </div>
      </div>
    ));
  };

  return (
    <div className={`legend-manager-container ${isDarkMode ? "dark" : "light"}`}>
      <div className="legend-manager-header">
        <h2>Legend Manager</h2>
        <button onClick={onClose}>Close</button>
      </div>
      <div className="legend-manager-tabs">
        <button
          className={activeTab === "nodes" ? "active" : ""}
          onClick={() => setActiveTab("nodes")}
        >
          Nodes
        </button>
        <button
          className={activeTab === "edges" ? "active" : ""}
          onClick={() => setActiveTab("edges")}
        >
          Edges
        </button>
      </div>
      <div className="legend-manager-content">
        {activeTab === "nodes" &&
          renderLegendItems(
            nodeLegendConfig,
            onNodeLegendChange,
            onNodeVisibilityChange,
            onNodeOpacityChange
          )}
        {activeTab === "edges" &&
          renderLegendItems(
            edgeLegendConfig,
            onEdgeLegendChange,
            onEdgeVisibilityChange,
            onEdgeOpacityChange
          )}
      </div>
    </div>
  );
};

export default LegendManager;
