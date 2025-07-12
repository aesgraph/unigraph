import React, { useEffect, useState } from "react";
import {
  listProjects,
  saveProjectToSupabase,
} from "../../api/supabaseProjects";
import { SceneGraph } from "../../core/model/SceneGraph";
import {
  deserializeSceneGraphFromJson,
  serializeSceneGraphToJson,
} from "../../core/serializers/toFromJson";
import { addNotification } from "../../store/notificationStore";
import "./SaveProjectDialog.css";

interface SaveAsNewProjectDialogProps {
  onSave: (projectId: string) => void;
  onCancel: () => void;
  isDarkMode: boolean;
  sceneGraph: SceneGraph;
}

const SaveAsNewProjectDialog: React.FC<SaveAsNewProjectDialogProps> = ({
  onSave,
  onCancel,
  isDarkMode,
  sceneGraph,
}) => {
  const [name, setName] = useState(sceneGraph.getMetadata()?.name || "");
  const [description, setDescription] = useState(
    sceneGraph.getMetadata()?.description || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [nameExists, setNameExists] = useState(false);
  const [existingProjects, setExistingProjects] = useState<string[]>([]);
  const [validationOpacity, setValidationOpacity] = useState(0);

  // Load existing project names on component mount
  useEffect(() => {
    const loadExistingProjects = async () => {
      try {
        const projects = await listProjects();
        const projectNames = projects.map((project) =>
          project.name.toLowerCase()
        );
        setExistingProjects(projectNames);
      } catch (error) {
        console.error("Error loading existing projects:", error);
      }
    };
    loadExistingProjects();
  }, []);

  // Validate name when it changes
  useEffect(() => {
    const validateName = async () => {
      if (!name.trim()) {
        setNameExists(false);
        // Fade out validation message
        setValidationOpacity(0);
        return;
      }

      setIsValidating(true);
      // Fade in validation message
      setValidationOpacity(1);

      try {
        // Check if name already exists (case-insensitive)
        const nameExists = existingProjects.includes(name.trim().toLowerCase());
        setNameExists(nameExists);

        if (!nameExists) {
          setValidationOpacity(0);
        }
      } catch (error) {
        console.error("Error validating name:", error);
        setNameExists(false);
        setValidationOpacity(0);
      } finally {
        setIsValidating(false);
      }
    };

    // Debounce validation to avoid too many checks
    const timeoutId = setTimeout(validateName, 300);
    return () => clearTimeout(timeoutId);
  }, [name, existingProjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      addNotification({
        message: "Project name is required",
        type: "error",
        duration: 3000,
      });
      return;
    }

    if (nameExists) {
      addNotification({
        message: "Project name already exists. Please choose a different name.",
        type: "error",
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
    try {
      // Create a copy of the scene graph by serializing and deserializing
      const serializedData = serializeSceneGraphToJson(sceneGraph);
      const newSceneGraph = deserializeSceneGraphFromJson(serializedData);

      // Update the metadata with new name and description
      newSceneGraph.setMetadata({
        ...newSceneGraph.getMetadata(),
        name: name.trim(),
        description: description.trim(),
      });

      // Save to Supabase
      const savedProject = await saveProjectToSupabase(newSceneGraph);

      if (savedProject) {
        addNotification({
          message: `Project "${name}" saved successfully`,
          type: "success",
          duration: 8000,
        });
        onSave(savedProject.id);
      } else {
        throw new Error("Failed to save project");
      }
    } catch (error) {
      console.error("Error saving project:", error);
      addNotification({
        message: "Failed to save project",
        type: "error",
        duration: 8000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent form submission on Enter if there are validation errors
    if (e.key === "Enter" && hasValidationErrors) {
      e.preventDefault();
      return;
    }
  };

  const hasValidationErrors = nameExists || !name.trim();

  useEffect(() => {
    // Add Escape key handler to close dialog
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onCancel]);

  return (
    <div className={`save-project-overlay ${isDarkMode ? "dark" : ""}`}>
      <div className="save-project-dialog">
        <div className="save-project-header">
          <h2>Save As New Project</h2>
          <button onClick={onCancel} className="save-project-close-button">
            ×
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="save-project-form"
          onKeyDown={handleKeyDown}
        >
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
              className={`save-project-input ${nameExists ? "error" : ""}`}
              disabled={isSaving}
            />
            <div
              className={`validation-message ${isValidating ? "validating" : ""} ${nameExists && !isValidating ? "error" : ""}`}
              style={{ opacity: validationOpacity }}
            >
              <span className="validation-text">
                {isValidating
                  ? "Checking name availability..."
                  : nameExists && !isValidating
                    ? "Project name already exists. Please choose a different name."
                    : "\u00A0"}
              </span>
            </div>
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
              disabled={isSaving}
            />
          </div>
          <div className="save-project-actions">
            <button
              type="button"
              onClick={onCancel}
              className="save-project-cancel-button"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-project-save-button"
              disabled={isSaving || hasValidationErrors}
            >
              {isSaving ? "Saving..." : "Save As New"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveAsNewProjectDialog;
