import { Download, Edit, Save, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { SceneGraph } from "../../core/model/SceneGraph";
import useAppConfigStore from "../../store/appConfigStore";
import "./SceneGraphInfoEditor.css";

interface SceneGraphInfoEditorProps {
  sceneGraph: SceneGraph;
  isDarkMode: boolean;
}

const SceneGraphInfoEditor: React.FC<SceneGraphInfoEditorProps> = ({
  sceneGraph,
  isDarkMode,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const { activeFilter, activeLayout } = useAppConfigStore();

  // Load data from scene graph metadata
  useEffect(() => {
    setTitle(sceneGraph.getMetadata().name || "");
    setDescription(sceneGraph.getMetadata().description || "");
    setNotes(sceneGraph.getMetadata().notes || "");
  }, [sceneGraph]);

  const handleSave = () => {
    const metadata = sceneGraph.getMetadata();
    sceneGraph.setMetadata({
      ...metadata,
      name: title,
      description: description,
      notes: notes,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setTitle(sceneGraph.getMetadata().name || "");
    setDescription(sceneGraph.getMetadata().description || "");
    setNotes(sceneGraph.getMetadata().notes || "");
    setIsEditing(false);
  };

  const handleExport = () => {
    const data = JSON.stringify(sceneGraph, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${sceneGraph.getMetadata().name || "scene-graph"}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className={`scenegraph-info-editor ${isDarkMode ? "dark" : ""}`}>
      <div className="scenegraph-info-header">
        {isEditing ? (
          <div className="scenegraph-info-title-edit">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Graph Title"
              className="title-input"
              autoFocus
            />
          </div>
        ) : (
          <div className="scenegraph-info-title">
            <h2>{title || "Untitled Graph"}</h2>
          </div>
        )}

        <div className="scenegraph-info-actions">
          {isEditing ? (
            <>
              <button
                className="action-button"
                onClick={handleSave}
                title="Save changes"
              >
                <Save size={16} />
              </button>
              <button
                className="action-button"
                onClick={handleCancel}
                title="Cancel editing"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <button
              className="action-button"
              onClick={() => setIsEditing(true)}
              title="Edit graph info"
            >
              <Edit size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="scenegraph-info-content">
        {isEditing ? (
          <>
            <div className="scenegraph-info-section">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this graph..."
                className="description-input"
              />
            </div>

            <div className="scenegraph-info-section">
              <label>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this graph..."
                className="notes-input"
              />
            </div>
          </>
        ) : (
          <>
            <div className="scenegraph-info-section">
              <h3 className="section-title">Description</h3>
              {description ? (
                <div className="section-content">{description}</div>
              ) : (
                <div className="empty-placeholder">No description provided</div>
              )}
            </div>

            <div className="scenegraph-info-section">
              <h3 className="section-title">Notes</h3>
              {notes ? (
                <div className="section-content notes-content">{notes}</div>
              ) : (
                <div className="empty-placeholder">No notes added</div>
              )}
            </div>

            <div className="scenegraph-info-section">
              <h3 className="section-title">Graph Details</h3>
              <div className="info-item">
                <span className="info-label">Active Layout:</span>
                <span className="info-value">{activeLayout}</span>
              </div>
              {activeFilter && (
                <div className="info-item">
                  <span className="info-label">Active Filter:</span>
                  <span className="info-value filter-active">
                    {activeFilter.name ?? "Unnamed Filter"}
                  </span>
                </div>
              )}
              <div className="info-item">
                <span className="info-label">Node Count:</span>
                <span className="info-value">
                  {sceneGraph.getGraph().getNodes().size()}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Edge Count:</span>
                <span className="info-value">
                  {sceneGraph.getGraph().getEdges().size()}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="scenegraph-info-footer">
        <button
          className="export-button"
          onClick={handleExport}
          title="Export as JSON"
        >
          <Download size={16} />
          <span>Export Graph</span>
        </button>
      </div>
    </div>
  );
};

export default SceneGraphInfoEditor;
