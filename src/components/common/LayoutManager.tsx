import React, { useEffect, useState } from "react";
import { ObjectOf } from "../../App";
import {
  GET_DEFAULT_RENDERING_CONFIG,
  RenderingConfig,
} from "../../controllers/RenderingManager";
import { NodePositionData } from "../../core/layouts/layoutHelpers";
import { SceneGraph } from "../../core/model/SceneGraph";
import "./LayoutManager.css";

interface LayoutManagerProps {
  sceneGraph: SceneGraph;
  onClose: () => void;
  onLayoutLoad: (positions: NodePositionData) => void;
  isDarkMode?: boolean;
  mode: "save" | "load";
}

const LayoutManager: React.FC<LayoutManagerProps> = ({
  sceneGraph,
  onClose,
  onLayoutLoad,
  mode,
  isDarkMode = false,
}) => {
  const [newLayoutName, setNewLayoutName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentLayouts, setCurrentLayouts] = useState<
    ObjectOf<RenderingConfig>
  >(sceneGraph.getData().displayConfigPresets || {});

  useEffect(() => {
    console.log("presets are ", sceneGraph.getData());
    setCurrentLayouts(sceneGraph.getData().displayConfigPresets || {});
  }, [sceneGraph]);

  const handleSaveCurrentLayout = () => {
    if (!newLayoutName.trim()) {
      setError("Layout name cannot be empty");
      return;
    }

    const currentPositions = sceneGraph.getDisplayConfig().nodePositions;
    if (!currentPositions) {
      setError("No layout positions to save");
      return;
    }

    const presets: ObjectOf<RenderingConfig> = {
      ...sceneGraph.getData().displayConfigPresets,
      [newLayoutName]: {
        ...GET_DEFAULT_RENDERING_CONFIG(sceneGraph.getGraph()),
        nodePositions: currentPositions,
      },
    };

    sceneGraph.getData().displayConfigPresets = presets;
    setNewLayoutName("");
    setError(null);
    onClose();
  };

  const handleLoadLayout = (layoutName: string) => {
    const renderingConfig = currentLayouts[layoutName];
    if (renderingConfig) {
      onLayoutLoad(renderingConfig.nodePositions || {});
      onClose();
    }
  };

  const renderSaveLayoutSection = () => {
    return (
      <div>
        <h3>Save Current Layout</h3>
        <div className="input-group">
          <input
            type="text"
            value={newLayoutName}
            onChange={(e) => setNewLayoutName(e.target.value)}
            placeholder="Enter layout name"
          />
          <button onClick={handleSaveCurrentLayout}>Save</button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>
    );
  };

  const renderLoadLayoutSection = () => {
    return (
      <div className="saved-layouts-section">
        <h3>Saved Layouts</h3>
        <div className="layouts-list">
          {Object.keys(currentLayouts).length === 0 ? (
            <div className="no-layouts">No saved layouts</div>
          ) : (
            Object.keys(currentLayouts).map((layoutName) => (
              <div key={layoutName} className="layout-item">
                <span>{layoutName}</span>
                <button onClick={() => handleLoadLayout(layoutName)}>
                  Load
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="layout-manager-overlay">
      <div className={`layout-manager ${isDarkMode ? "dark" : ""}`}>
        <div className="layout-manager-header">
          <h2>Layout Manager</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="layout-manager-content">
          <div className="save-layout-section"></div>
          {mode === "save" ? renderSaveLayoutSection() : null}
          {mode === "load" ? renderLoadLayoutSection() : null}
        </div>
      </div>
    </div>
  );
};

export default LayoutManager;
