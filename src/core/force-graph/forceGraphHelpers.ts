import { ForceGraph3DInstance } from "3d-force-graph";
import { ForceGraph3dLayoutMode } from "../../AppConfig";
import { NodePositionData } from "../layouts/layoutHelpers";
import { EdgeId } from "../model/Edge";
import { NodeId } from "../model/Node";
import { SceneGraph } from "../model/SceneGraph";
import { exportGraphDataForReactFlow } from "../react-flow/exportGraphDataForReactFlow";

export const extractPositionDataFromForceGraphInstance = (
  instance: ForceGraph3DInstance
): NodePositionData => {
  const nodePositions: NodePositionData = {};
  instance.graphData().nodes.forEach((node) => {
    if (node.id !== undefined && node.x !== undefined && node.y !== undefined) {
      nodePositions[node.id] = {
        x: node.fx ?? node.x,
        y: node.fy ?? node.y,
        z: node.fz ?? node.z,
      };
    }
  });
  return nodePositions;
};

export const updateVisibleEntitiesInForceGraphInstance = (
  instance: ForceGraph3DInstance,
  sceneGraph: SceneGraph,
  layoutMode: ForceGraph3dLayoutMode = "Physics"
): void => {
  const visibleNodes = sceneGraph.getNodes().filter((node) => node.isVisible());
  const visibleEdges = sceneGraph
    .getEdges()
    .filter((edge) => edge.isVisible())
    .filter((edge) => {
      const source = sceneGraph.getNodes().get(edge.getSource());
      const target = sceneGraph.getNodes().get(edge.getTarget());
      return source.isVisible() && target.isVisible();
    });

  const newNodeList = instance
    .graphData()
    .nodes.filter((node) => visibleNodes.has(node.id as NodeId));

  const existingNodes = new Set(newNodeList.map((node) => node.id));

  visibleNodes.forEach((node) => {
    if (existingNodes.has(node.getId())) {
      return;
    }
    newNodeList.push({
      id: node.getId(),
      x: layoutMode === "Layout" ? node.getPosition().x : 0,
      y: layoutMode === "Layout" ? node.getPosition().y : 0,
      z: layoutMode === "Layout" ? node.getPosition().z : 0,
    });
  });

  const newEdgeList = instance
    .graphData()
    .links.filter((link) => visibleEdges.has((link as any).id as EdgeId));

  const existingEdges = new Set(newEdgeList.map((link) => (link as any).id));
  visibleEdges.forEach((edge) => {
    if (existingEdges.has(edge.getId())) {
      return;
    }
    newEdgeList.push({
      id: edge.getId(),
      source: edge.getSource(),
      target: edge.getTarget(),
    } as any);
  });

  instance.graphData({
    nodes: newNodeList,
    links: newEdgeList,
  });
};

export const syncMissingNodesInForceGraph = (
  instance: ForceGraph3DInstance,
  sceneGraph: SceneGraph
): void => {
  // Get current ReactFlow compatible data
  const { nodes: reactFlowNodes } = exportGraphDataForReactFlow(sceneGraph);

  // Get current ForceGraph data
  const forceGraphData = instance.graphData();
  const existingNodeIds = new Set(forceGraphData.nodes.map((n) => n.id));

  // Find nodes that exist in ReactFlow but not in ForceGraph
  const missingNodes = reactFlowNodes.filter((n) => !existingNodeIds.has(n.id));

  if (missingNodes.length === 0) {
    return;
  }

  // Update ForceGraph with combined nodes
  instance.graphData({
    nodes: [...forceGraphData.nodes, ...missingNodes],
    links: forceGraphData.links,
  });

  // Refresh the visualization
  instance.refresh();
};
