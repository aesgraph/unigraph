import React, { useCallback, useMemo, useState } from "react";
import "./SelectionList.css";

interface SelectionItem {
  id: string;
  label: string;
  type: string;
  tags?: string[];
}

interface SelectionListProps {
  availableItems: SelectionItem[];
  selectedItems: SelectionItem[];
  onChange: (selection: string[]) => void;
  isDarkMode?: boolean;
  allowSelection?: boolean; // Controls whether items can be selected/deselected
  allowSearch?: boolean; // Controls whether search functionality is enabled
  showHeader?: boolean;
}

const SelectionList: React.FC<SelectionListProps> = ({
  availableItems,
  selectedItems,
  onChange,
  isDarkMode = false,
  allowSelection = true,
  allowSearch = true,
  showHeader = true,
}) => {
  const [availableSearchTerm, setAvailableSearchTerm] = useState("");
  const [selectedSearchTerm, setSelectedSearchTerm] = useState("");

  // Get selected IDs for faster lookups
  const selectedIds = useMemo(
    () => new Set(selectedItems.map((item) => item.id)),
    [selectedItems]
  );

  // Filter available items based on search and selection
  const filteredAvailableItems = useMemo(() => {
    const unselectedItems = availableItems.filter(
      (item) => !selectedIds.has(item.id)
    );
    if (!availableSearchTerm || !allowSearch) return unselectedItems;

    const lowerSearchTerm = availableSearchTerm.toLowerCase();
    return unselectedItems.filter(
      (item) =>
        item.label.toLowerCase().includes(lowerSearchTerm) ||
        item.type.toLowerCase().includes(lowerSearchTerm) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(lowerSearchTerm))
    );
  }, [availableItems, selectedIds, availableSearchTerm, allowSearch]);

  // Filter selected items based on search
  const filteredSelectedItems = useMemo(() => {
    if (!selectedSearchTerm || !allowSearch) return selectedItems;

    const lowerSearchTerm = selectedSearchTerm.toLowerCase();
    return selectedItems.filter(
      (item) =>
        item.label.toLowerCase().includes(lowerSearchTerm) ||
        item.type.toLowerCase().includes(lowerSearchTerm) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(lowerSearchTerm))
    );
  }, [selectedItems, selectedSearchTerm, allowSearch]);

  const handleSelect = useCallback(
    (itemId: string) => {
      onChange([...selectedItems.map((item) => item.id), itemId]);
    },
    [selectedItems, onChange]
  );

  const handleDeselect = useCallback(
    (itemId: string) => {
      onChange(
        selectedItems.map((item) => item.id).filter((id) => id !== itemId)
      );
    },
    [selectedItems, onChange]
  );

  const handleSelectAll = useCallback(() => {
    const newSelection = [
      ...selectedItems.map((item) => item.id),
      ...filteredAvailableItems.map((item) => item.id),
    ];
    onChange(Array.from(new Set(newSelection))); // Remove duplicates
  }, [filteredAvailableItems, selectedItems, onChange]);

  const handleDeselectAll = useCallback(() => {
    onChange([]);
  }, [onChange]);

  return (
    <div className={`selection-list ${isDarkMode ? "dark" : ""}`}>
      {allowSelection && (
        <div className="selection-panel">
          <div className="panel-header">
            <h3>Available ({filteredAvailableItems.length})</h3>
            <button onClick={handleSelectAll}>Select All</button>
          </div>
          {allowSearch && (
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search available..."
                value={availableSearchTerm}
                onChange={(e) => setAvailableSearchTerm(e.target.value)}
                className={isDarkMode ? "dark" : ""}
              />
            </div>
          )}
          <div className={`items-list${!allowSearch ? " no-search" : ""}`}>
            {filteredAvailableItems.map((item) => (
              <div
                key={item.id}
                className="item"
                onClick={() => handleSelect(item.id)}
              >
                <span className="item-label">{item.label}</span>
                <span className="item-type">{item.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="selection-panel">
        {showHeader && (
          <div className="panel-header">
            <h3>Selected ({selectedItems.length})</h3>
            {allowSelection && (
              <button onClick={handleDeselectAll}>Clear All</button>
            )}
          </div>
        )}

        {allowSearch && (
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search selected..."
              value={selectedSearchTerm}
              onChange={(e) => setSelectedSearchTerm(e.target.value)}
              className={isDarkMode ? "dark" : ""}
            />
          </div>
        )}
        <div className={`items-list${!allowSearch ? " no-search" : ""}`}>
          {filteredSelectedItems.map((item) => (
            <div
              key={item.id}
              className={`item${!allowSelection ? " non-interactive" : ""}`}
              onClick={() => allowSelection && handleDeselect(item.id)}
            >
              <span className="item-label">{item.label}</span>
              <span className="item-type">{item.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectionList;
