import React from "react";
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
  isDarkMode?: boolean;
  sceneGraph: SceneGraph;
}

const EntityTableDialogV2: React.FC<EntityTableDialogV2Props> = ({
  container,
  title,
  onClose,
  onNodeClick,
  isDarkMode = false,
  sceneGraph,
}) => {
  return (
    <div
      className={`${styles.overlay} ${isDarkMode ? styles.dark : styles.light}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`${styles.dialog} ${isDarkMode ? styles.dark : styles.light}`}
      >
        <div className={styles.header}>
          <h2
            className={`${styles.title} ${isDarkMode ? styles.dark : styles.light}`}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`${styles.closeButton} ${isDarkMode ? styles.dark : styles.light}`}
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
            maxHeight="calc(90vh - 100px)"
          />
        </div>
      </div>
    </div>
  );
};

export default EntityTableDialogV2;
