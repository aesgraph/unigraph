import React, { useState } from "react";
import "./SaveProjectDialog.css";

interface SaveProjectDialogProps {
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
  isDarkMode: boolean;
  initialName?: string;
  initialDescription?: string;
}

const SaveProjectDialog: React.FC<SaveProjectDialogProps> = ({
  onSave,
  onCancel,
  isDarkMode,
  initialName = "",
  initialDescription = "",
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, description);
  };

  return (
    <div className={`save-project-overlay ${isDarkMode ? "dark" : ""}`}>
      <div className="save-project-dialog">
        <div className="save-project-header">
          <h2>Save Project</h2>
          <button onClick={onCancel} className="save-project-close-button">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="save-project-form">
          <div className="save-project-field">
            <label htmlFor="project-name">Project Name</label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
              autoFocus
              className="save-project-input"
            />
          </div>
          <div className="save-project-field">
            <label htmlFor="project-description">Description (optional)</label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              className="save-project-textarea"
              rows={4}
            />
          </div>
          <div className="save-project-actions">
            <button
              type="button"
              onClick={onCancel}
              className="save-project-cancel-button"
            >
              Cancel
            </button>
            <button type="submit" className="save-project-save-button">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveProjectDialog;
