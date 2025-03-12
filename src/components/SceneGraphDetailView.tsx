import React, { useEffect, useState } from "react";
import { ISceneGraphMetadata, SceneGraph } from "../core/model/SceneGraph";
import "./SceneGraphDetailView.css"; // Import the CSS file

interface SceneGraphDetailViewProps {
  sceneGraph: SceneGraph;
  readOnly: boolean;
  darkMode: boolean;
  onClose: () => void;
}

const SceneGraphDetailView: React.FC<SceneGraphDetailViewProps> = ({
  sceneGraph,
  readOnly,
  darkMode,
  onClose,
}) => {
  const [metadata, setMetadata] = useState<ISceneGraphMetadata>(
    sceneGraph.getMetadata()
  );

  useEffect(() => {
    setMetadata(sceneGraph.getMetadata());
  }, [sceneGraph]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    sceneGraph.setMetadata(metadata);
    onClose();
  };

  return (
    <div className="scene-graph-detail-view-overlay">
      <div className={`scene-graph-detail-view ${darkMode ? "dark-mode" : ""}`}>
        <h2>Scene Graph Details</h2>
        <div>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={metadata.name || ""}
              onChange={handleChange}
              readOnly={readOnly}
            />
          </label>
        </div>
        <div>
          <label>
            Description:
            <textarea
              name="description"
              value={metadata.description || ""}
              onChange={handleChange}
              readOnly={readOnly}
            />
          </label>
        </div>
        <div>
          <label>
            Source:
            <input
              type="text"
              name="source"
              value={metadata.source || ""}
              onChange={handleChange}
              readOnly={readOnly}
            />
          </label>
        </div>
        {!readOnly && <button onClick={handleSave}>Save</button>}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default SceneGraphDetailView;
