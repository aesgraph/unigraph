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
  onAddNewType: (type: string, color: string) => void;
  onAddNewTag: (tag: string, color: string) => void;
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
  onAddNewType,
  onAddNewTag,
}) => {
  const [activeTab, setActiveTab] = useState<"nodes" | "edges">("nodes");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemColor, setNewItemColor] = useState("#000000");

  const handleAddNew = () => {
    if (!newItemName.trim()) return;
    
    if (activeTab === "nodes") {
      // For nodes, we add both type and tag
      onAddNewType(newItemName, newItemColor);
      onAddNewTag(newItemName, newItemColor);
    } else {
      // For edges, just add type
      onAddNewType(newItemName, newItemColor);
    }
    
    setNewItemName("");
    setShowAddForm(false);
  };

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
        {activeTab === "nodes" && (
          <>
            {renderLegendItems(
              nodeLegendConfig,
              onNodeLegendChange,
              onNodeVisibilityChange,
              onNodeOpacityChange
            )}
            <button 
              className="add-new-button" 
              onClick={() => setShowAddForm(true)}
            >
              + Add New Node Type
            </button>
          </>
        )}
        {activeTab === "edges" && (
          <>
            {renderLegendItems(
              edgeLegendConfig,
              onEdgeLegendChange,
              onEdgeVisibilityChange,
              onEdgeOpacityChange
            )}
            <button 
              className="add-new-button" 
              onClick={() => setShowAddForm(true)}
            >
              + Add New Edge Type
            </button>
          </>
        )}
      </div>

      {showAddForm && (
        <div className="add-form-overlay">
          <div className={`add-form ${isDarkMode ? "dark" : "light"}`}>
            <h3>Add New {activeTab === "nodes" ? "Node" : "Edge"} Type</h3>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Enter name..."
              autoFocus
            />
            <input
              type="color"
              value={newItemColor}
              onChange={(e) => setNewItemColor(e.target.value)}
            />
            <div className="add-form-buttons">
              <button onClick={() => setShowAddForm(false)}>Cancel</button>
              <button onClick={handleAddNew}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegendManager;
