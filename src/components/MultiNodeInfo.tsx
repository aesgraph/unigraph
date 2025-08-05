import { Search } from "lucide-react";
import React, { useState } from "react";
import { findNodeInForceGraph } from "../core/force-graph/forceGraphHelpers";
import { NodeId } from "../core/model/Node";
import { flyToNode } from "../core/webgl/webglHelpers";
import useAppConfigStore, {
  getCurrentSceneGraph,
} from "../store/appConfigStore";
import styles from "./MultiNodeInfo.module.css";
import NodeInfo from "./NodeInfo";

interface MultiNodeInfoProps {
  nodeIds: NodeId[];
  onFocusNode?: (nodeId: NodeId) => void;
  onZoomToNode?: (nodeId: NodeId) => void;
}

const MultiNodeInfo: React.FC<MultiNodeInfoProps> = ({
  nodeIds,
  onFocusNode,
  onZoomToNode,
}) => {
  const { forceGraphInstance, activeView, forceGraph3dOptions } =
    useAppConfigStore();
  const [searchQuery, setSearchQuery] = useState("");
  const sceneGraph = getCurrentSceneGraph();

  const handleFocusNode = (nodeId: NodeId) => {
    if (onFocusNode) {
      onFocusNode(nodeId);
      return;
    }

    // Default behavior if no custom handler provided
    if (forceGraphInstance && activeView === "ForceGraph3d") {
      const node = findNodeInForceGraph(forceGraphInstance, nodeId);
      if (node) {
        flyToNode(forceGraphInstance, node, forceGraph3dOptions.layout);
      }
    }
  };

  // Filter nodes based on search query
  const filteredNodeIds = nodeIds.filter((nodeId) => {
    if (!searchQuery.trim()) return true;

    const node = sceneGraph.getNodeById(nodeId);
    if (!node) return false;

    const nodeLabel = node.getLabel().toLowerCase();
    const nodeType = node.getType().toLowerCase();
    const tags = Array.from(node.getTags()).join(" ").toLowerCase();
    const searchLower = searchQuery.toLowerCase();

    return (
      nodeLabel.includes(searchLower) ||
      nodeType.includes(searchLower) ||
      tags.includes(searchLower)
    );
  });

  return (
    <div className={styles.multiNodeContainer}>
      <div className={styles.headerSection}>
        <span className={styles.nodeCount}>
          {nodeIds.length} node{nodeIds.length !== 1 ? "s" : ""} selected
        </span>

        <div className={styles.searchWrapper}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              className={styles.clearButton}
              onClick={() => setSearchQuery("")}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className={styles.nodeList}>
        {filteredNodeIds.length === 0 ? (
          <div className={styles.noResults}>No matching nodes</div>
        ) : (
          filteredNodeIds.map((nodeId) => (
            <div key={nodeId} className={styles.nodeInfoWrapper}>
              <NodeInfo
                nodeId={nodeId}
                onFocusNode={handleFocusNode}
                onZoomToNode={onZoomToNode}
                compact={true}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MultiNodeInfo;
