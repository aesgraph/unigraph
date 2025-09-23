import React, { useState } from "react";
import { SceneGraph } from "../../core/model/SceneGraph";
import { fetchSvgSceneGraph } from "../../hooks/useSvgSceneGraph";
import "./ImportSvgFromUrlDialog.css";

interface ImportSvgFromUrlDialogProps {
  onClose: () => void;
  onLoad: (sceneGraph: SceneGraph) => void;
  isDarkMode: boolean;
}

const ImportSvgFromUrlDialog: React.FC<ImportSvgFromUrlDialogProps> = ({
  onClose,
  onLoad,
  isDarkMode,
}) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleLoad = async () => {
    setLoading(true);
    setError(null);
    try {
      const { sceneGraph, error } = await fetchSvgSceneGraph(url);
      if (error) {
        setError(error);
      } else {
        onLoad(sceneGraph);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`import-svg-dialog ${isDarkMode ? "dark-mode" : ""}`}>
      <h2>Import SVG from URL</h2>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter SVG URL"
      />
      <button onClick={handleLoad} disabled={loading}>
        {loading ? "Loading..." : "Load"}
      </button>
      {error && <div className="error">{error.message}</div>}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default ImportSvgFromUrlDialog;
