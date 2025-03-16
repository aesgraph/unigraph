import React, { useCallback, useMemo, useState } from "react";
import { RenderingManager } from "../../controllers/RenderingManager";
import { SceneGraph } from "../../core/model/SceneGraph";
import MultiSelectDropdown from "../common/MultiSelectDropdown";
import {
  FilterOperator,
  FilterRuleDefinition,
  FilterRuleMode,
} from "./FilterRuleDefinition";
import "./FilterWindow.css";
import SaveFilterDialog from "./SaveFilterDialog";
import SelectionList from "./SelectionList";

interface FilterWindowProps {
  sceneGraph: SceneGraph;
  onClose: () => void;
  onApplyFilter: (selectedIds: string[]) => void;
  isDarkMode?: boolean;
}

interface FilterSummary {
  rules: FilterRuleDefinition[];
  manualOverrides?: {
    included: number;
    excluded: number;
  };
}

const FilterSummaryView: React.FC<{
  summary: FilterSummary;
  isDarkMode: boolean;
}> = ({ summary, isDarkMode }) => (
  <div className={`filter-summary ${isDarkMode ? "dark" : ""}`}>
    <div className="summary-section">
      <h4>Applied Rules</h4>
      {summary.rules.map((rule) => (
        <div key={rule.id} className={`summary-rule ${rule.operator}`}>
          <span className="rule-operator">{rule.operator}:</span>
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
      {summary.rules.length === 0 && (
        <div className="no-rules">No rules applied</div>
      )}
    </div>

    {summary.manualOverrides && (
      <div className="summary-section">
        <h4>Manual Overrides</h4>
        <div className="override-stats">
          <span className="included">
            Included: {summary.manualOverrides.included}
          </span>
          <span className="excluded">
            Excluded: {summary.manualOverrides.excluded}
          </span>
        </div>
      </div>
    )}
  </div>
);

const PreviewResults: React.FC<{
  items: any[];
  filterRules: FilterRuleDefinition[];
  onClose: () => void;
  onApply: () => void;
  onSaveFilter: () => void;
  isDarkMode: boolean;
}> = ({ items, filterRules, onClose, onApply, onSaveFilter, isDarkMode }) => (
  <div className="preview-overlay">
    <div className={`preview-window ${isDarkMode ? "dark" : ""}`}>
      <div className="preview-header">
        <h3>Review Selection ({items.length} items)</h3>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      <FilterSummaryView
        summary={{
          rules: filterRules,
          manualOverrides: {
            included: items.length,
            excluded: 0, // You might want to calculate this based on your actual data
          },
        }}
        isDarkMode={isDarkMode}
      />
      <div className="preview-content">
        <SelectionList
          availableItems={[]}
          selectedItems={items}
          onChange={() => {}}
          isDarkMode={isDarkMode}
          allowSelection={false}
          allowSearch={true}
          showHeader={false}
        />
      </div>
      <div className="preview-actions">
        <button className="preview-back-button" onClick={onClose}>
          Go Back
        </button>
        <button className="preview-save-button" onClick={onSaveFilter}>
          Save Filter As...
        </button>
        <button className="preview-apply-button" onClick={onApply}>
          Apply Filter ({items.length} items)
        </button>
      </div>
    </div>
  </div>
);

const NodeSelectionPopup: React.FC<{
  onClose: () => void;
  onConfirm: (selectedNodes: string[]) => void;
  availableNodes: any[];
  isDarkMode: boolean;
}> = ({ onClose, onConfirm, availableNodes, isDarkMode }) => {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  return (
    <div className="node-selection-overlay">
      <div className={`node-selection-window ${isDarkMode ? "dark" : ""}`}>
        <div className="node-selection-header">
          <h3>Select Entities ({selectedNodes.length} selected)</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="node-selection-content">
          <SelectionList
            availableItems={availableNodes}
            selectedItems={availableNodes.filter((n) =>
              selectedNodes.includes(n.id)
            )}
            onChange={setSelectedNodes}
            isDarkMode={isDarkMode}
            allowSelection={true}
            allowSearch={true}
          />
        </div>
        <div className="node-selection-actions">
          <button
            className="node-selection-confirm"
            onClick={() => onConfirm(selectedNodes)}
            disabled={selectedNodes.length === 0}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const FilterWindow: React.FC<FilterWindowProps> = ({
  sceneGraph,
  onClose,
  onApplyFilter,
  isDarkMode = false,
}) => {
  // Separate manual selection state
  const [manualSelection, setManualSelection] = useState<{
    selectedItems: string[];
    typeFilters: string[];
    tagFilters: string[];
  }>({
    selectedItems: [],
    typeFilters: [],
    tagFilters: [],
  });

  // Rule-based selection state remains the same
  const [filterRules, setFilterRules] = useState<FilterRuleDefinition[]>([]);
  const [selectionMode, setSelectionMode] = useState<"manual" | "rules">(
    "manual"
  );
  const [newRule, setNewRule] = useState<Partial<FilterRuleDefinition>>({
    operator: "include",
    ruleMode: "typesAndTags", // Add explicit default mode
    conditions: {
      types: [],
      tags: [],
    },
  });

  const [showPreview, setShowPreview] = useState(false);
  const [showNodeSelection, setShowNodeSelection] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Get all nodes once
  const allNodes = useMemo(
    () =>
      sceneGraph
        .getGraph()
        .getNodes()
        .map((n) => ({
          id: n.getId(),
          label: n.getLabel(),
          type: n.getType(),
          tags: Array.from(n.getTags()),
        })),
    [sceneGraph]
  );

  // Get available items for manual selection
  const availableItemsForManualSelection = useMemo(() => {
    let items = allNodes;

    // Apply type filters if they exist
    if (manualSelection.typeFilters.length > 0) {
      items = items.filter((node) =>
        manualSelection.typeFilters.includes(node.type)
      );
    }

    // Apply tag filters if they exist
    if (manualSelection.tagFilters.length > 0) {
      items = items.filter((node) =>
        node.tags.some((tag) => manualSelection.tagFilters.includes(tag))
      );
    }

    // Remove already selected items
    return items.filter(
      (item) => !manualSelection.selectedItems.includes(item.id)
    );
  }, [
    allNodes,
    manualSelection.typeFilters,
    manualSelection.tagFilters,
    manualSelection.selectedItems,
  ]);

  // Updated filtering logic to handle both modes independently
  const filteredItems = useMemo(() => {
    if (selectionMode === "manual") {
      return manualSelection.selectedItems.length > 0
        ? allNodes.filter((node) =>
            manualSelection.selectedItems.includes(node.id)
          )
        : [];
    } else {
      const includeRules = filterRules.filter((r) => r.operator === "include");
      const excludeRules = filterRules.filter((r) => r.operator === "exclude");

      let includedNodes = includeRules.length === 0 ? allNodes : [];

      // Apply include rules (union)
      includeRules.forEach((rule) => {
        const matchingNodes = allNodes.filter((node) => {
          // Node must match ALL conditions
          const matchesTypes =
            !rule.conditions.types?.length ||
            rule.conditions.types.includes(node.type);
          const matchesTags =
            !rule.conditions.tags?.length ||
            node.tags.some((tag) => rule.conditions.tags?.includes(tag));
          const matchesNodes =
            !rule.conditions.nodes?.length ||
            rule.conditions.nodes.includes(node.id);
          return matchesTypes && matchesTags && matchesNodes;
        });
        includedNodes = [...includedNodes, ...matchingNodes];
      });

      // Remove duplicates
      includedNodes = Array.from(new Set(includedNodes));

      // Apply exclude rules (override includes)
      return includedNodes.filter((node) => {
        return !excludeRules.some((rule) => {
          // Node is excluded if it matches ALL conditions
          const matchesTypes =
            !rule.conditions.types?.length ||
            rule.conditions.types.includes(node.type);
          const matchesTags =
            !rule.conditions.tags?.length ||
            node.tags.some((tag) => rule.conditions.tags?.includes(tag));
          const matchesNodes =
            !rule.conditions.nodes?.length ||
            rule.conditions.nodes.includes(node.id);
          return matchesTypes && matchesTags && matchesNodes;
        });
      });
    }
  }, [selectionMode, manualSelection.selectedItems, allNodes, filterRules]);

  const handleAddRule = useCallback(() => {
    if (
      newRule.ruleMode === "everything" || // Allow everything mode without conditions
      (newRule.conditions?.types?.length || 0) +
        (newRule.conditions?.tags?.length || 0) +
        (newRule.conditions?.nodes?.length || 0) >
        0
    ) {
      setFilterRules((rules) => [
        ...rules,
        {
          id: Math.random().toString(36).substr(2, 9),
          operator: newRule.operator as FilterOperator,
          ruleMode: newRule.ruleMode as FilterRuleMode,
          conditions: {
            types: newRule.conditions?.types || [],
            tags: newRule.conditions?.tags || [],
            nodes: newRule.conditions?.nodes || [],
          },
        },
      ]);
      setNewRule({
        operator: "include",
        ruleMode: "typesAndTags", // Reset to default mode
        conditions: {
          types: [],
          tags: [],
          nodes: [],
        },
      });
    }
  }, [newRule]);

  const handleRemoveRule = useCallback((ruleId: string) => {
    setFilterRules((rules) => rules.filter((r) => r.id !== ruleId));
  }, []);

  const handleNodeSelection = useCallback((selectedNodes: string[]) => {
    setNewRule((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        nodes: selectedNodes,
      },
    }));
    setShowNodeSelection(false);
  }, []);

  const renderRuleEditor = () => (
    <div className="rule-editor">
      <div className="rule-editor-header">
        <h3>Filter Rules</h3>
        <div className="rule-creator">
          <div className="rule-header">
            <select
              value={newRule.operator}
              onChange={(e) =>
                setNewRule((prev) => ({
                  ...prev,
                  operator: e.target.value as FilterOperator,
                }))
              }
            >
              <option value="include">Include</option>
              <option value="exclude">Exclude</option>
            </select>

            <select
              value={newRule.ruleMode}
              onChange={(e) => {
                const mode = e.target.value as FilterRuleMode;
                if (mode === "entities") {
                  setShowNodeSelection(true);
                  setNewRule((prev) => ({
                    ...prev,
                    ruleMode: mode,
                    conditions: {
                      types: [],
                      tags: [],
                      nodes: prev.conditions?.nodes || [],
                    },
                  }));
                } else if (mode === "everything") {
                  setNewRule((prev) => ({
                    ...prev,
                    ruleMode: mode,
                    conditions: {
                      types: [],
                      tags: [],
                      nodes: [],
                    },
                  }));
                } else {
                  setNewRule((prev) => ({
                    ...prev,
                    ruleMode: mode,
                    conditions: {
                      ...prev.conditions,
                      nodes: [],
                    },
                  }));
                }
              }}
            >
              <option value="typesAndTags">Types & Tags</option>
              <option value="entities">Entity IDs</option>
              <option value="everything">Everything</option>
            </select>
          </div>

          <div className="rule-conditions">
            {newRule.ruleMode === "typesAndTags" ? (
              // Show Types and Tags selection
              <>
                <div className="condition-group">
                  <label>Types:</label>
                  <MultiSelectDropdown
                    options={Array.from(
                      sceneGraph.getGraph().getNodes().getTypes()
                    ).map((type) => ({
                      value: type,
                      label: type,
                      color: RenderingManager.getColorByKeySimple(
                        type,
                        sceneGraph.getDisplayConfig().nodeConfig.types
                      ),
                    }))}
                    values={
                      newRule.conditions?.types?.map((v) => ({
                        value: v,
                        label: v,
                        color: RenderingManager.getColorByKeySimple(
                          v,
                          sceneGraph.getDisplayConfig().nodeConfig.types
                        ),
                      })) || []
                    }
                    onChange={(values) =>
                      setNewRule((prev) => ({
                        ...prev,
                        conditions: {
                          ...prev.conditions,
                          types: values.map((v) => v.value),
                        },
                      }))
                    }
                    placeholder="Select types..."
                    isDarkMode={isDarkMode}
                  />
                </div>

                <div className="condition-group">
                  <label>Tags:</label>
                  <MultiSelectDropdown
                    options={Array.from(
                      sceneGraph.getGraph().getNodes().getTags()
                    ).map((tag) => ({
                      value: tag,
                      label: tag,
                      color: RenderingManager.getColorByKeySimple(
                        tag,
                        sceneGraph.getDisplayConfig().nodeConfig.tags
                      ),
                    }))}
                    values={
                      newRule.conditions?.tags?.map((v) => ({
                        value: v,
                        label: v,
                        color: RenderingManager.getColorByKeySimple(
                          v,
                          sceneGraph.getDisplayConfig().nodeConfig.tags
                        ),
                      })) || []
                    }
                    onChange={(values) =>
                      setNewRule((prev) => ({
                        ...prev,
                        conditions: {
                          ...prev.conditions,
                          tags: values.map((v) => v.value),
                        },
                      }))
                    }
                    placeholder="Select tags..."
                    isDarkMode={isDarkMode}
                  />
                </div>
              </>
            ) : newRule.ruleMode === "entities" ? (
              // Show Entity Id selection
              <div className="condition-group">
                <label>Entity Ids:</label>
                <div className="condition-content">
                  <button
                    className="condition-button"
                    onClick={() => setShowNodeSelection(true)}
                  >
                    {newRule.conditions?.nodes?.length
                      ? `${newRule.conditions.nodes.length} entities selected`
                      : "Select entities"}
                  </button>
                </div>
              </div>
            ) : newRule.ruleMode === "everything" ? (
              // Show message for "everything" mode
              <div className="condition-group">
                <div className="condition-content">
                  <span className="everything-message">
                    This rule will affect all entities
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <button
            onClick={handleAddRule}
            disabled={
              newRule.ruleMode !== "everything" &&
              !(
                (newRule.conditions?.types?.length || 0) +
                  (newRule.conditions?.tags?.length || 0) +
                  (newRule.conditions?.nodes?.length || 0) >
                0
              )
            }
          >
            Add Rule
          </button>
        </div>
      </div>

      <div className="rules-list">
        {filterRules.map((rule) => (
          <div key={rule.id} className="rule-item">
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
            <button onClick={() => handleRemoveRule(rule.id)}>×</button>
          </div>
        ))}
      </div>

      {showNodeSelection && (
        <NodeSelectionPopup
          onClose={() => setShowNodeSelection(false)}
          onConfirm={handleNodeSelection}
          availableNodes={allNodes}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );

  const handleTypeFiltersChange = useCallback((values: { value: string }[]) => {
    setManualSelection((prev) => ({
      ...prev,
      typeFilters: values.map((v) => v.value),
    }));
  }, []);

  const handleTagFiltersChange = useCallback((values: { value: string }[]) => {
    setManualSelection((prev) => ({
      ...prev,
      tagFilters: values.map((v) => v.value),
    }));
  }, []);

  const handleSelectionChange = useCallback((selection: string[]) => {
    setManualSelection((prev) => ({
      ...prev,
      selectedItems: selection,
    }));
  }, []);

  const handleReviewAndApply = useCallback(() => {
    setShowPreview(true);
  }, []);

  const handleApplyFromPreview = useCallback(() => {
    onApplyFilter(filteredItems.map((item) => item.id));
    onClose();
  }, [filteredItems, onApplyFilter, onClose]);

  const handleSaveFilter = useCallback(
    (name: string, description: string) => {
      const preset = {
        rules:
          selectionMode === "manual"
            ? [
                {
                  id: Math.random().toString(36).substr(2, 9),
                  operator: "include" as FilterOperator,
                  ruleMode: "entities" as FilterRuleMode,
                  conditions: {
                    nodes: manualSelection.selectedItems,
                  },
                },
              ]
            : filterRules,
        description: description, // Add description to preset
        name,
      };

      sceneGraph.saveFilterPreset(name, preset);
      setShowSaveDialog(false);
    },
    [selectionMode, manualSelection.selectedItems, filterRules, sceneGraph]
  );

  return (
    <div className="filter-window-overlay">
      <div className={`filter-window ${isDarkMode ? "dark" : ""}`}>
        <div className="filter-window-header">
          <h2>Filter Entities</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="filter-tabs">
          <div className="tab-buttons">
            <button
              className={selectionMode === "manual" ? "active" : ""}
              onClick={() => setSelectionMode("manual")}
            >
              Manual Selection
            </button>
            <button
              className={selectionMode === "rules" ? "active" : ""}
              onClick={() => setSelectionMode("rules")}
            >
              Rule-based
            </button>
          </div>

          <div className="tab-content">
            {selectionMode === "manual" ? (
              <>
                <div className="filter-options">
                  <div className="filter-group">
                    <label>Filter by Types:</label>
                    <MultiSelectDropdown
                      options={Array.from(
                        sceneGraph.getGraph().getNodes().getTypes()
                      ).map((type) => ({
                        value: type,
                        label: type,
                        color: RenderingManager.getColorByKeySimple(
                          type,
                          sceneGraph.getDisplayConfig().nodeConfig.types
                        ),
                      }))}
                      values={manualSelection.typeFilters.map((v) => ({
                        value: v,
                        label: v,
                        color: RenderingManager.getColorByKeySimple(
                          v,
                          sceneGraph.getDisplayConfig().nodeConfig.types
                        ),
                      }))}
                      onChange={handleTypeFiltersChange}
                      placeholder="Select types..."
                      isDarkMode={isDarkMode}
                    />
                  </div>

                  <div className="filter-group">
                    <label>Filter by Tags:</label>
                    <MultiSelectDropdown
                      options={Array.from(
                        sceneGraph.getGraph().getNodes().getTags()
                      ).map((tag) => ({
                        value: tag,
                        label: tag,
                        color: RenderingManager.getColorByKeySimple(
                          tag,
                          sceneGraph.getDisplayConfig().nodeConfig.tags
                        ),
                      }))}
                      values={manualSelection.tagFilters.map((v) => ({
                        value: v,
                        label: v,
                        color: RenderingManager.getColorByKeySimple(
                          v,
                          sceneGraph.getDisplayConfig().nodeConfig.tags
                        ),
                      }))}
                      onChange={handleTagFiltersChange}
                      placeholder="Select tags..."
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </div>
                <div className="selection-container">
                  <SelectionList
                    availableItems={availableItemsForManualSelection}
                    selectedItems={allNodes.filter((item) =>
                      manualSelection.selectedItems.includes(item.id)
                    )}
                    onChange={handleSelectionChange}
                    isDarkMode={isDarkMode}
                    allowSelection={true}
                    allowSearch={true}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="rule-based-content">{renderRuleEditor()}</div>
              </>
            )}
          </div>
        </div>

        <div className="filter-actions">
          <button
            onClick={handleReviewAndApply}
            disabled={filteredItems.length === 0}
          >
            Review and Apply ({filteredItems.length} items)
          </button>
        </div>
      </div>

      {showPreview && (
        <PreviewResults
          items={filteredItems}
          filterRules={filterRules}
          onClose={() => setShowPreview(false)}
          onApply={handleApplyFromPreview}
          onSaveFilter={() => setShowSaveDialog(true)}
          isDarkMode={isDarkMode}
        />
      )}
      {showSaveDialog && (
        <SaveFilterDialog
          onSave={handleSaveFilter}
          onClose={() => setShowSaveDialog(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default FilterWindow;
