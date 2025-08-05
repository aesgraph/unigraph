import React, { useEffect } from "react";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";
import { EntitiesContainer } from "../../core/model/entity/entitiesContainer";
import styles from "./EntityTableDialog.module.css";
import EntityTableV2 from "./EntityTableV2";

interface EntityTableDialogV2Props {
  container: EntitiesContainer<any, any>;
  title: string;
  onClose: () => void;
  onNodeClick?: (nodeId: NodeId) => void;
  sceneGraph: SceneGraph;
}

const EntityTableDialogV2: React.FC<EntityTableDialogV2Props> = ({
  container,
  title,
  onClose,
  onNodeClick,
  sceneGraph,
}) => {
  // Add event handler for the Escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose]);

  return (
    <div
      className={`${styles.overlay} ${styles.light}`}
      onClick={(e) => {
        // Close when clicking the overlay background
        if (e.target === e.currentTarget) {
          onClose();
        }
        e.stopPropagation();
      }}
    >
      <div className={`${styles.dialog} ${styles.light}`}>
        <div className={styles.header}>
          <h2 className={`${styles.title} ${styles.light}`}>{title}</h2>
          <button
            onClick={onClose}
            className={`${styles.closeButton} ${styles.light}`}
          >
            Close
          </button>
        </div>
        <div className={styles.content}>
          <EntityTableV2
            container={container}
            sceneGraph={sceneGraph}
            onEntityClick={
              onNodeClick && ((entity) => onNodeClick(entity.getId() as NodeId))
            }
            maxHeight="100%" // Changed from calc(90vh - 100px) to 100%
          />
        </div>
      </div>
    </div>
  );
};

export default EntityTableDialogV2;
