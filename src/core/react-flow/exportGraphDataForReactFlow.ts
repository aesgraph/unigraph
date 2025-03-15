import { Edge, Node } from "@xyflow/react";
import { NodePositionData } from "../layouts/layoutHelpers";
import { SceneGraph } from "../model/SceneGraph";
import { EntityIds } from "../model/entity/entityIds";

export const exportGraphDataForReactFlow = (
  sceneGraph: SceneGraph,
  positionsOverride: NodePositionData | undefined = undefined,
  filterNonvisibleNodes = true
): { nodes: Node[]; edges: Edge[] } => {
  const positions: NodePositionData | undefined =
    positionsOverride ?? sceneGraph.getDisplayConfig().nodePositions;
  const renderingManager = sceneGraph.getRenderingManager();
  const nodes = Array.from(sceneGraph.getGraph().getNodes())
    .filter((node) => {
      if (!filterNonvisibleNodes) {
        return true;
      }
      if (node.isVisible() && renderingManager.getNodeIsVisible(node)) {
        return true;
      }
      return false;
    })
    .map((node) => ({
      id: node.getId(),
      color: renderingManager.getNodeColor(node),
      position: positions
        ? node.getId() in positions
          ? positions[node.getId()]
          : { x: 0, y: 0 }
        : { x: 0, y: 0 },
      data: { label: node.getId(), color: renderingManager.getNodeColor(node) },
      style: { border: `2px solid ${renderingManager.getNodeColor(node)}` },
      label: node.getLabel(),
      type: "customNode",
    }));

  const initialVisibleEdges = sceneGraph
    .getGraph()
    .getEdgesConnectedToNodes(new EntityIds(nodes.map((node) => node.id)));

  const edges = Array.from(initialVisibleEdges)
    .filter((edge) =>
      renderingManager.getEdgeIsVisible(edge, sceneGraph.getGraph())
    )
    .map((edge) => ({
      id: edge.getId(),
      source: edge.getSource(),
      target: edge.getTarget(),
      color: renderingManager.getEdgeColor(edge),
    }));
  return {
    nodes,
    edges,
  };
};
