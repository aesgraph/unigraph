import { Edge, Node } from "@xyflow/react";
import {
  getEdgeColor,
  getEdgeIsVisible,
  getNodeColor,
  getNodeIsVisible,
} from "../../store/activeLegendConfigStore";
import { NodePositionData } from "../layouts/layoutHelpers";
import { SceneGraph } from "../model/SceneGraph";
import { EntityIds } from "../model/entity/entityIds";

// Helper function to safely convert any value to a string
const safeToString = (value: any): string => {
  if (typeof value === "string") {
    return value;
  } else if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  } else if (value && typeof value === "object") {
    return JSON.stringify(value);
  } else {
    return String(value || "");
  }
};

export const exportGraphDataForReactFlow = (
  sceneGraph: SceneGraph,
  positionsOverride: NodePositionData | undefined = undefined,
  filterNonvisibleNodes = true
): { nodes: Node[]; edges: Edge[] } => {
  const positions: NodePositionData | undefined =
    positionsOverride ?? sceneGraph.getDisplayConfig().nodePositions;

  const nodes = Array.from(sceneGraph.getGraph().getNodes())
    .filter((node) => {
      if (!filterNonvisibleNodes) {
        return true;
      }
      if (node.isVisible() && getNodeIsVisible(node)) {
        return true;
      }
      return false;
    })
    .map((node) => {
      const nodeType = node.getType();
      const userData = node.getAllUserData();

      // Prepare data based on node type
      const nodeData: any = {
        label: node.getId(),
        color: getNodeColor(node),
        dimensions: node.getDimensions(),
        userData: userData,
      };

      // Add type-specific data
      if (nodeType === "annotation" && userData) {
        nodeData.annotation = userData;
      } else if (nodeType === "webpage" && userData) {
        nodeData.webpage = userData;
      } else if (nodeType === "definition" && userData) {
        nodeData.definition = userData;
      } else if (nodeType === "class" && userData) {
        nodeData.classData = userData;
      }

      return {
        id: node.getId(),
        color: getNodeColor(node),
        position: positions
          ? node.getId() in positions
            ? positions[node.getId()]
            : { x: 0, y: 0 }
          : { x: 0, y: 0 },
        data: nodeData,
        style: { border: `2px solid ${getNodeColor(node)}` },
        label: safeToString(node.getLabel()),
        type: nodeType,
      };
    });

  const initialVisibleEdges = sceneGraph
    .getGraph()
    .getEdgesConnectedToNodes(new EntityIds(nodes.map((node) => node.id)));

  const edges = Array.from(initialVisibleEdges)
    .filter((edge) => getEdgeIsVisible(edge))
    .map((edge) => ({
      id: edge.getId(),
      source: edge.getSource(),
      target: edge.getTarget(),
      color: getEdgeColor(edge),
    }));
  return {
    nodes,
    edges,
  };
};
