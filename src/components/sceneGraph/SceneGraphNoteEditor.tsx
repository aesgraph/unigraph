import { Edit, Save } from "lucide-react";
import React, { useEffect, useState } from "react";
import { SceneGraph } from "../../core/model/SceneGraph";
import styles from "./SceneGraphNoteEditor.module.css";

interface SceneGraphNoteEditorProps {
  sceneGraph: SceneGraph;
  isDarkMode: boolean;
}

const SceneGraphNoteEditor: React.FC<SceneGraphNoteEditorProps> = ({
  sceneGraph,
  isDarkMode,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  // Load notes from scene graph metadata
  useEffect(() => {
    const notes = sceneGraph.getMetadata().notes || "";
    setNoteContent(notes);
  }, [sceneGraph]);

  const handleSave = () => {
    // Update the scene graph metadata with the notes
    const metadata = sceneGraph.getMetadata();
    sceneGraph.setMetadata({
      ...metadata,
      notes: noteContent,
    });

    setIsEditing(false);
  };

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.dark : ""}`}>
      <div className={styles.header}>
        <h3>Graph Notes</h3>
        {isEditing ? (
          <button
            className={styles.actionButton}
            onClick={handleSave}
            title="Save notes"
          >
            <Save size={16} />
          </button>
        ) : (
          <button
            className={styles.actionButton}
            onClick={() => setIsEditing(true)}
            title="Edit notes"
          >
            <Edit size={16} />
          </button>
        )}
      </div>

      {isEditing ? (
        <textarea
          className={styles.editor}
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Add notes about this graph..."
          autoFocus
        />
      ) : (
        <div className={styles.noteDisplay}>
          {noteContent ? (
            <div className={styles.content}>{noteContent}</div>
          ) : (
            <div className={styles.placeholder}>
              No notes yet. Click edit to add notes.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SceneGraphNoteEditor;
