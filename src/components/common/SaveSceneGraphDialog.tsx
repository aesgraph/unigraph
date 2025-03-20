import React, { useState } from "react";
import { SceneGraph } from "../../core/model/SceneGraph";
import { serializeSceneGraphToDot } from "../../core/serializers/toDot";
import { serializeSceneGraphToGraphml } from "../../core/serializers/toGraphml";
import styles from "./SaveSceneGraphDialog.module.css";

interface SaveSceneGraphDialogProps {
  onClose: () => void;
  sceneGraph: SceneGraph;
}

const SaveSceneGraphDialog: React.FC<SaveSceneGraphDialogProps> = ({
  onClose,
  sceneGraph,
}) => {
  const [fileName, setFileName] = useState(sceneGraph.getMetadata().name || "");
  const [fileExtension, setFileExtension] = useState(".json");

  const handleSave = () => {
    let data: string;
    switch (fileExtension) {
      case ".json":
        data = JSON.stringify(sceneGraph, null, 2);
        break;
      case ".dot":
        data = serializeSceneGraphToDot(sceneGraph);
        break;
      case ".graphml":
        data = serializeSceneGraphToGraphml(sceneGraph);
        break;
      default:
        console.error("Unsupported file extension");
        return;
    }

    const blob = new Blob([data], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName || "scene-graph"}${fileExtension}`;
    link.click();

    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2>Save Scene Graph</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.fileInputRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="fileName" className={styles.label}>
                File Name
              </label>
              <input
                id="fileName"
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label
                htmlFor="fileExtension"
                className={`${styles.label} ${styles.extensionLabel}`}
              >
                Extension
              </label>
              <select
                id="fileExtension"
                value={fileExtension}
                onChange={(e) => setFileExtension(e.target.value)}
                className={styles.select}
              >
                <option value=".json">.json</option>
                <option value=".dot">.dot</option>
                <option value=".graphml">.graphml</option>
              </select>
            </div>
          </div>
          <button onClick={handleSave} className={styles.saveButton}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveSceneGraphDialog;
