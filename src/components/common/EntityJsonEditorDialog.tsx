import React, { useState, useEffect } from "react";
import MonacoEditor, { monaco } from "react-monaco-editor";
import styles from "./EntityJsonEditorDialog.module.css";

interface EntityJsonEditorDialogProps {
  entityData: any;
  onSave: (newData: any) => void;
  onClose: () => void;
  isDarkMode?: boolean;
}

const EntityJsonEditorDialog: React.FC<EntityJsonEditorDialogProps> = ({
  entityData,
  onSave,
  onClose,
  isDarkMode = false,
}) => {
  const [jsonText, setJsonText] = useState(JSON.stringify(entityData, null, 2));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    monaco.editor.defineTheme("myCustomTheme", {
      base: isDarkMode ? "vs-dark" : "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": isDarkMode ? "#1e1e1e" : "#ffffff",
      },
    });
  }, [isDarkMode]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      onSave(parsed);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  return (
    <div
      className={`${styles.overlay} ${isDarkMode ? styles.dark : styles.light}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`${styles.dialog} ${isDarkMode ? styles.dark : styles.light}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div>{entityData.name}</div>
          <div>
            <button className={styles.saveButton} onClick={handleSave}>
              Save
            </button>
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
        <div className={styles.editorContainer}>
          <MonacoEditor
            language="json"
            theme={isDarkMode ? "vs-dark" : "vs-light"}
            value={jsonText}
            onChange={setJsonText}
            options={{
              selectOnLineNumbers: true,
              automaticLayout: true,
              formatOnType: true,
              formatOnPaste: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              readOnly: false,
            }}
          />
        </div>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
};

export default EntityJsonEditorDialog;
