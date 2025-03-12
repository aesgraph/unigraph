import React, { useState } from "react";
import { SceneGraph } from "../../core/model/SceneGraph";
import { FilterPreset } from "./FilterRuleDefinition";
import RulesPreviewDialog from "./RulesPreviewDialog";

interface FilterManagerProps {
  sceneGraph: SceneGraph;
  onClose: () => void;
  onFilterLoad: (preset: FilterPreset) => void;
  isDarkMode?: boolean;
}

const FilterManager: React.FC<FilterManagerProps> = ({
  sceneGraph,
  onClose,
  onFilterLoad,
  isDarkMode,
}) => {
  const [previewPreset, setPreviewPreset] = useState<FilterPreset | null>(null);
  const filterPresets = sceneGraph.getFilterPresets();

  return (
    <div className="layout-manager-overlay">
      <div className={`layout-manager ${isDarkMode ? "dark" : ""}`}>
        <div className="layout-manager-header">
          <h3>Load Filter Preset</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="layout-manager-content">
          {Object.entries(filterPresets).length === 0 ? (
            <div className="no-presets">No saved filter presets</div>
          ) : (
            <div className="preset-list">
              {Object.entries(filterPresets).map(([name, preset]) => (
                <div key={name} className="preset-item">
                  <div className="preset-info">
                    <span className="preset-name">{name}</span>
                    {preset.description && (
                      <span className="preset-description">
                        {preset.description}
                      </span>
                    )}
                  </div>
                  <div className="preset-actions">
                    <button
                      className="inspect-button"
                      onClick={() => setPreviewPreset(preset)}
                    >
                      Inspect
                    </button>
                    <button onClick={() => onFilterLoad(preset)}>Apply</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {previewPreset && (
        <RulesPreviewDialog
          preset={previewPreset}
          onClose={() => setPreviewPreset(null)}
          onApply={onFilterLoad}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default FilterManager;
