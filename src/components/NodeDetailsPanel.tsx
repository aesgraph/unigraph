import React from "react";
import { findNodeInForceGraph } from "../core/force-graph/forceGraphHelpers";
import { NodeId } from "../core/model/Node";
import { flyToNode } from "../core/webgl/webglHelpers";
import useAppConfigStore from "../store/appConfigStore";
import useGraphInteractionStore from "../store/graphInteractionStore";
import MultiNodeInfo from "./MultiNodeInfo";
import NodeInfo from "./NodeInfo";

/**
 * Smart component that renders either NodeInfo or MultiNodeInfo
 * depending on whether one or multiple nodes are selected
 */
const NodeDetailsPanel: React.FC = () => {
  const { forceGraphInstance, activeView, forceGraph3dOptions } =
    useAppConfigStore();
  const { selectedNodeIds } = useGraphInteractionStore();

  // Handler for focusing on a node
  const handleFocusNode = (nodeId: NodeId) => {
    if (forceGraphInstance && activeView === "ForceGraph3d") {
      const node = findNodeInForceGraph(forceGraphInstance, nodeId);
      if (node) {
        flyToNode(forceGraphInstance, node, forceGraph3dOptions.layout);
      }
    }
  };

  // Get the array of selected node IDs
  const selectedNodeIdsArray = Array.from(selectedNodeIds);

  // If no nodes are selected, show an empty state
  if (selectedNodeIdsArray.length === 0) {
    return (
      <div style={{ padding: "16px", color: "#94a3b8", textAlign: "center" }}>
        <p>No nodes selected</p>
        <p style={{ fontSize: "12px", marginTop: "8px" }}>
          Select nodes in the graph to view details
        </p>
      </div>
    );
  }

  // Show NodeInfo for single selection, MultiNodeInfo for multiple
  return selectedNodeIdsArray.length === 1 ? (
    <NodeInfo
      nodeId={selectedNodeIdsArray[0]}
      onFocusNode={handleFocusNode}
      onZoomToNode={handleFocusNode}
    />
  ) : (
    <MultiNodeInfo
      nodeIds={selectedNodeIdsArray}
      onFocusNode={handleFocusNode}
      onZoomToNode={handleFocusNode}
    />
  );
};

export default NodeDetailsPanel;
