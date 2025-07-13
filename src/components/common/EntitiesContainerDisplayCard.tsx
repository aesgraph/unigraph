import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Info,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { Entity } from "../../core/model/entity/abstractEntity";
import { EntityIds } from "../../core/model/entity/entityIds";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";
import styles from "./EntitiesContainerDisplayCard.module.css";

export interface EntitiesContainerDisplayCardProps {
  title: string;
  description?: string;
  entities: Entity[];
  entityIds?: EntityIds<NodeId>;
  sceneGraph?: SceneGraph;
  type: "info" | "warning" | "danger";
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  showConfirmation?: boolean;
}

const EntitiesContainerDisplayCard: React.FC<
  EntitiesContainerDisplayCardProps
> = ({
  title,
  description,
  entities,
  entityIds,
  sceneGraph,
  type = "info",
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  showConfirmation = false,
}) => {
  // State for tracking which entities are expanded
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(
    new Set()
  );

  const toggleEntityExpansion = (entityId: string) => {
    const newExpanded = new Set(expandedEntities);
    if (newExpanded.has(entityId)) {
      newExpanded.delete(entityId);
    } else {
      newExpanded.add(entityId);
    }
    setExpandedEntities(newExpanded);
  };

  // Get entities from either the entities array or entityIds + sceneGraph
  const displayEntities =
    entities.length > 0
      ? entities
      : entityIds && sceneGraph
        ? entityIds.toArray().map((id) => sceneGraph.getGraph().getNode(id))
        : [];

  const getTypeIcon = () => {
    switch (type) {
      case "warning":
        return <AlertTriangle size={20} className={styles.warningIcon} />;
      case "danger":
        return <Trash2 size={20} className={styles.dangerIcon} />;
      default:
        return <Info size={20} className={styles.infoIcon} />;
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case "warning":
        return styles.warning;
      case "danger":
        return styles.danger;
      default:
        return styles.info;
    }
  };

  const formatEntityData = (entity: Entity) => {
    const data = entity.getData();
    const formattedData: { [key: string]: any } = {};

    // Format common fields
    if (data.label) formattedData.label = data.label;
    if (data.type) formattedData.type = data.type;
    if (data.description) formattedData.description = data.description;
    if (data.tags && data.tags.size > 0) {
      formattedData.tags = Array.from(data.tags);
    }

    // Add any other fields that aren't empty
    Object.entries(data).forEach(([key, value]) => {
      if (
        !formattedData[key] &&
        value !== null &&
        value !== undefined &&
        value !== ""
      ) {
        if (typeof value === "object" && Object.keys(value).length > 0) {
          formattedData[key] = value;
        } else if (typeof value !== "object") {
          formattedData[key] = value;
        }
      }
    });

    return formattedData;
  };

  // Calculate metadata for the entities
  const calculateMetadata = () => {
    if (displayEntities.length === 0) return null;

    const typeCounts: { [key: string]: number } = {};
    const tagCounts: { [key: string]: number } = {};
    const totalTags = new Set<string>();

    displayEntities.forEach((entity) => {
      const data = entity.getData();

      // Count types
      if (data.type) {
        typeCounts[data.type] = (typeCounts[data.type] || 0) + 1;
      }

      // Count tags
      if (data.tags && data.tags.size > 0) {
        data.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          totalTags.add(tag);
        });
      }
    });

    return {
      totalEntities: displayEntities.length,
      typeCounts,
      tagCounts,
      totalUniqueTags: totalTags.size,
      entitiesWithTags: displayEntities.filter(
        (e) => e.getData().tags && e.getData().tags.size > 0
      ).length,
      entitiesWithTypes: displayEntities.filter((e) => e.getData().type).length,
    };
  };

  const renderEntityInfo = (entity: Entity) => {
    const formattedData = formatEntityData(entity);
    const entityId = entity.getId();
    const isExpanded = expandedEntities.has(entityId);

    return (
      <div key={entity.getId()} className={styles.entityItem}>
        {/* Compact Header */}
        <div className={styles.entityCompactHeader}>
          <button
            className={styles.expandButton}
            onClick={() => toggleEntityExpansion(entityId)}
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
          >
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>

          <div className={styles.entityCompactInfo}>
            {formattedData.label && (
              <span className={styles.entityCompactLabel}>
                {formattedData.label}
              </span>
            )}
            {formattedData.type && (
              <span className={styles.entityCompactType}>
                {formattedData.type}
              </span>
            )}
            <span className={styles.entityCompactId}>{entityId}</span>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className={styles.entityExpandedDetails}>
            {formattedData.description && (
              <div className={styles.entityDescription}>
                {formattedData.description}
              </div>
            )}

            {formattedData.tags && formattedData.tags.length > 0 && (
              <div className={styles.entityTags}>
                {formattedData.tags.map((tag: string, index: number) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Show other data fields */}
            {Object.entries(formattedData).map(([key, value]) => {
              if (!["label", "type", "description", "tags"].includes(key)) {
                return (
                  <div key={key} className={styles.entityField}>
                    <span className={styles.fieldName}>{key}:</span>
                    <span className={styles.fieldValue}>
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)}
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${styles.container} ${getTypeClass()}`}>
      <div className={styles.header}>
        {getTypeIcon()}
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{title}</h3>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </div>

      <div className={styles.content}>
        {/* Metadata Section */}
        {(() => {
          const metadata = calculateMetadata();
          if (!metadata) return null;

          return (
            <div className={styles.metadataSection}>
              <div className={styles.metadataGrid}>
                <div className={styles.metadataItem}>
                  <span className={styles.metadataLabel}>Total Entities:</span>
                  <span className={styles.metadataValue}>
                    {metadata.totalEntities}
                  </span>
                </div>

                {metadata.entitiesWithTypes > 0 && (
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>With Types:</span>
                    <span className={styles.metadataValue}>
                      {metadata.entitiesWithTypes}
                    </span>
                  </div>
                )}

                {metadata.entitiesWithTags > 0 && (
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>With Tags:</span>
                    <span className={styles.metadataValue}>
                      {metadata.entitiesWithTags}
                    </span>
                  </div>
                )}

                {metadata.totalUniqueTags > 0 && (
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Unique Tags:</span>
                    <span className={styles.metadataValue}>
                      {metadata.totalUniqueTags}
                    </span>
                  </div>
                )}
              </div>

              {/* Type Distribution */}
              {Object.keys(metadata.typeCounts).length > 0 && (
                <div className={styles.metadataSection}>
                  <h4 className={styles.metadataTitle}>Type Distribution</h4>
                  <div className={styles.metadataTags}>
                    {Object.entries(metadata.typeCounts)
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, count]) => (
                        <span key={type} className={styles.metadataTag}>
                          {type}: {count}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Tag Distribution */}
              {Object.keys(metadata.tagCounts).length > 0 && (
                <div className={styles.metadataSection}>
                  <h4 className={styles.metadataTitle}>Tag Distribution</h4>
                  <div className={styles.metadataTags}>
                    {Object.entries(metadata.tagCounts)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 10) // Show top 10 tags
                      .map(([tag, count]) => (
                        <span key={tag} className={styles.metadataTag}>
                          {tag}: {count}
                        </span>
                      ))}
                    {Object.keys(metadata.tagCounts).length > 10 && (
                      <span className={styles.metadataTag}>
                        +{Object.keys(metadata.tagCounts).length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        <div className={styles.entitiesList}>
          {displayEntities.length === 0 ? (
            <div className={styles.noEntities}>No entities to display</div>
          ) : (
            displayEntities.map(renderEntityInfo)
          )}
        </div>

        {showConfirmation && (
          <div className={styles.confirmationSection}>
            <p className={styles.confirmationText}>
              Are you sure you want to proceed with this action?
            </p>
            <div className={styles.actions}>
              <button
                className={`${styles.button} ${styles.cancelButton}`}
                onClick={onCancel}
              >
                {cancelLabel}
              </button>
              <button
                className={`${styles.button} ${styles.confirmButton} ${getTypeClass()}`}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntitiesContainerDisplayCard;
