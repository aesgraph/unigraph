import React, { useState } from "react";

interface SaveFilterDialogProps {
  onSave: (name: string, description: string) => void;
  onClose: () => void;
  isDarkMode?: boolean;
}

const SaveFilterDialog: React.FC<SaveFilterDialogProps> = ({
  onSave,
  onClose,
  isDarkMode,
}) => {
  const [filterName, setFilterName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="save-filter-overlay">
      <div className={`save-filter-dialog ${isDarkMode ? "dark" : ""}`}>
        <h3>Save Filter Preset</h3>
        <div className="input-group">
          <label>Name:</label>
          <input
            type="text"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Enter filter name..."
            className={isDarkMode ? "dark" : ""}
          />
        </div>
        <div className="input-group">
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter filter description (optional)..."
            className={isDarkMode ? "dark" : ""}
            rows={3}
          />
        </div>
        <div className="dialog-actions">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={() => {
              if (filterName.trim()) {
                onSave(filterName.trim(), description.trim());
              }
            }}
            disabled={!filterName.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveFilterDialog;
