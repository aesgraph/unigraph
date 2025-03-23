import { ArrowUpRight, ExternalLink, MapPin, Zap } from "lucide-react";
import React from "react";
import { NodeId } from "../core/model/Node";
import { getCurrentSceneGraph } from "../store/appConfigStore";
import { getSelectedNodeId } from "../store/graphInteractionStore";
import { Badge } from "./Badge";
import styles from "./NodeInfo.module.css";

interface NodeInfoProps {
  nodeId?: NodeId;
  onFocusNode?: (nodeId: NodeId) => void;
  onExpandNeighborhood?: (nodeId: NodeId) => void;
  onZoomToNode?: (nodeId: NodeId) => void;
  compact?: boolean; // Add compact mode for the multi-node display
}

const NodeInfo: React.FC<NodeInfoProps> = ({
  nodeId,
  onFocusNode,
  // eslint-disable-next-line unused-imports/no-unused-vars
  onExpandNeighborhood,
  onZoomToNode,
  compact = false,
}) => {
  // Use provided nodeId, or fallback to selected node id from global state
  const activeNodeId = nodeId || getSelectedNodeId();
  const sceneGraph = getCurrentSceneGraph();

  if (!activeNodeId) {
    return (
      <div className={styles.emptyState}>
        <p>No node selected</p>
        <p className={styles.hint}>Select a node to view its details</p>
      </div>
    );
  }

  const node = sceneGraph.getNodeById(activeNodeId);
  if (!node) {
    return (
      <div className={styles.emptyState}>
        <p>Node not found</p>
        <p className={styles.hint}>The selected node no longer exists</p>
      </div>
    );
  }

  const position = node.getPosition();

  // Get connected edges and nodes
  const connectedEdges = sceneGraph
    .getGraph()
    .getEdgesConnectedToNodes(node.getId());
  const neighbors = Array.from(connectedEdges).map((edge) => {
    const isOutgoing = edge.getSource() === node.getId();
    const neighborId = isOutgoing ? edge.getTarget() : edge.getSource();
    const neighbor = sceneGraph.getNodeById(neighborId);

    return {
      id: neighborId,
      label: neighbor?.getLabel() || "Unknown",
      type: neighbor?.getType() || "Unknown",
      edgeType: edge.getType(),
      isOutgoing,
    };
  });

  const handleFocus = () => {
    onFocusNode?.(node.getId());
  };

  const handleZoom = () => {
    onZoomToNode?.(node.getId());
  };

  // Different layout for compact mode
  if (compact) {
    return (
      <div className={`${styles.nodeInfoCard} ${styles.compact}`}>
        <div className={styles.header}>
          <h3 className={styles.title}>{node.getLabel()}</h3>
          <div className={styles.actions}>
            <button
              className={styles.actionButton}
              onClick={handleFocus}
              title="Focus on this node"
            >
              <MapPin size={16} />
            </button>
            <button
              className={styles.actionButton}
              onClick={handleZoom}
              title="Zoom to this node"
            >
              <Zap size={16} />
            </button>
          </div>
        </div>
        <div className={styles.compactContent}>
          <div className={styles.typeLabel}>
            <Badge text={node.getType()} color="#4ade80" small />
          </div>

          {node.getTags().size > 0 && (
            <div className={styles.tagsList}>
              {Array.from(node.getTags()).map((tag) => (
                <Badge key={tag} text={tag} color="#60a5fa" small />
              ))}
            </div>
          )}

          {neighbors.length > 0 && (
            <div className={styles.connectionCount}>
              {neighbors.length} connection{neighbors.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular full view
  return (
    <div className={styles.nodeInfoCard}>
      <div className={styles.header}>
        <h3 className={styles.title}>{node.getLabel()}</h3>
        <div className={styles.actions}>
          <button
            className={styles.actionButton}
            onClick={handleFocus}
            title="Focus on this node"
          >
            <MapPin size={18} />
          </button>
          <button
            className={styles.actionButton}
            onClick={handleZoom}
            title="Zoom to this node"
          >
            <Zap size={18} />
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.typeLabel}>
            <Badge text={node.getType()} color="#4ade80" />
          </div>

          {node.getDescription() && (
            <p className={styles.description}>{node.getDescription()}</p>
          )}
        </div>

        {node.getTags().size > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Tags</div>
            <div className={styles.tagsList}>
              {Array.from(node.getTags()).map((tag) => (
                <Badge key={tag} text={tag} color="#60a5fa" />
              ))}
            </div>
          </div>
        )}

        {position && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Position</div>
            <div className={styles.coordinates}>
              <span>X: {position.x.toFixed(2)}</span>
              <span>Y: {position.y.toFixed(2)}</span>
              {position.z !== undefined && (
                <span>Z: {position.z.toFixed(2)}</span>
              )}
            </div>
          </div>
        )}

        {neighbors.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>
              Connections ({neighbors.length})
            </div>
            <div className={styles.neighborsList}>
              {neighbors.map((neighbor) => (
                <div
                  key={neighbor.id}
                  className={styles.neighborItem}
                  onClick={() => onFocusNode?.(neighbor.id)}
                >
                  <div
                    className={`${styles.neighborDirection} ${
                      neighbor.isOutgoing ? styles.outgoing : styles.incoming
                    }`}
                  >
                    <ArrowUpRight size={14} />
                  </div>
                  <div className={styles.neighborInfo}>
                    <div className={styles.neighborLabel}>{neighbor.label}</div>
                    <div className={styles.neighborType}>
                      {neighbor.edgeType} → {neighbor.type}
                    </div>
                  </div>
                  <button
                    className={styles.actionButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFocusNode?.(neighbor.id);
                    }}
                    title="Focus on this node"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeInfo;
