import React from "react";
import { FilterPreset } from "./FilterRuleDefinition";

interface RulesPreviewDialogProps {
  preset: FilterPreset;
  onClose: () => void;
  onApply: (preset: FilterPreset) => void;
  isDarkMode?: boolean;
}

const RulesPreviewDialog: React.FC<RulesPreviewDialogProps> = ({
  preset,
  onClose,
  onApply,
  isDarkMode,
}) => {
  return (
    <div className="filter-preview-overlay">
      <div className={`filter-preview-dialog ${isDarkMode ? "dark" : ""}`}>
        <div className="preview-header">
          <h3>{`${preset.name}: Filter Rules`}</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="preview-content">
          {preset.rules.map((rule, _index) => (
            <div key={rule.id} className="preview-rule-item">
              <span className={`rule-operator ${rule.operator}`}>
                {rule.operator}
              </span>
              {rule.ruleMode === "everything" ? (
                <span className="rule-condition">everything</span>
              ) : null}
              {rule.conditions.nodes?.length ? (
                <span className="rule-condition">
                  nodes: {rule.conditions.nodes.length} selected
                </span>
              ) : null}
              {rule.conditions.types?.length ? (
                <span className="rule-condition">
                  types: {rule.conditions.types.join(", ")}
                </span>
              ) : null}
              {rule.conditions.tags?.length ? (
                <span className="rule-condition">
                  tags: {rule.conditions.tags.join(", ")}
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <div className="preview-actions">
          <button className="preview-back-button" onClick={onClose}>
            Go Back
          </button>
          <button
            className="preview-apply-button"
            onClick={() => {
              onApply(preset);
              onClose();
            }}
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesPreviewDialog;
