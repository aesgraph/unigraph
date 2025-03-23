import { ForceGraph3DInstance } from "3d-force-graph";
import { ForceGraph3dLayoutMode } from "../../AppConfig";
import {
  getEdgeIsVisible,
  getNodeIsVisible,
} from "../../store/activeLegendConfigStore";
import { NodePositionData } from "../layouts/layoutHelpers";
import { EdgeId } from "../model/Edge";
import { EntityIds } from "../model/entity/entityIds";
import { NodeId } from "../model/Node";
import { SceneGraph } from "../model/SceneGraph";
import { exportGraphDataForReactFlow } from "../react-flow/exportGraphDataForReactFlow";

/**
 * Find a node in the ForceGraph instance by its ID
 */
export function findNodeInForceGraph(
  forceGraphInstance: ForceGraph3DInstance,
  nodeId: NodeId
): any | null {
  const graphData = forceGraphInstance.graphData();
  return graphData.nodes.find((node: any) => node.id === nodeId) || null;
}

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
  const currentVisibleNodesInForceGraph = instance
    .graphData()
    .nodes.map((node) => node.id as NodeId);
  const currentVisibleEdgesInForceGraph = instance
    .graphData()
    .links.map((link) => (link as any).id as EdgeId);

  const visibleNodes = sceneGraph
    .getNodes()
    .filter((node) => node.isVisible() && getNodeIsVisible(node));

  const visibleEdges = sceneGraph
    .getGraph()
    .getEdgesConnectedToNodes(
      new EntityIds(visibleNodes.map((node) => node.getId()))
    )
    .filter((edge) => edge.isVisible() && getEdgeIsVisible(edge));

  const nodesChanged = !visibleNodes
    .getIds()
    .isEqualTo(new EntityIds(currentVisibleNodesInForceGraph));
  const edgesChanged = !visibleEdges
    .getIds()
    .isEqualTo(new EntityIds(currentVisibleEdgesInForceGraph));

  if (!nodesChanged && !edgesChanged) {
    return;
  }

  // incomplete list, need to add any additionals in visibleNodes
  const newNodeList = instance
    .graphData()
    .nodes.filter((node) => visibleNodes.has(node.id as NodeId));

  const existingNodes = new EntityIds(
    newNodeList.map((node) => node.id as NodeId)
  );

  // incomplete list, need to add any additions in visibleEdges
  const newEdgeList = instance
    .graphData()
    .links.filter((link) => visibleEdges.has((link as any).id as EdgeId));

  const existingEdges = new EntityIds(
    newEdgeList.map((link) => (link as any).id)
  );

  visibleNodes.forEach((node) => {
    if (existingNodes.has(node.getId())) {
      return;
    }
    newNodeList.push({
      id: node.getId(),
      x: layoutMode === "Layout" ? node.getPosition().x : Math.random() * 5,
      y: layoutMode === "Layout" ? node.getPosition().y : Math.random() * 5,
      z: layoutMode === "Layout" ? node.getPosition().z : Math.random() * 5,
    });
  });

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

export const syncMissingNodesAndEdgesInForceGraph = (
  instance: ForceGraph3DInstance,
  sceneGraph: SceneGraph
): void => {
  // Get current ReactFlow compatible data
  const { nodes: reactFlowNodes, edges } =
    exportGraphDataForReactFlow(sceneGraph);

  // Get current ForceGraph data
  const forceGraphData = instance.graphData();
  const existingNodeIds = new Set(forceGraphData.nodes.map((n) => n.id));
  const existingEdgeIds = new Set(
    forceGraphData.links.map((l) => (l as any).id)
  );

  // Find nodes that exist in ReactFlow but not in ForceGraph
  const missingNodes = reactFlowNodes.filter((n) => !existingNodeIds.has(n.id));
  const missingEdges = edges.filter((e) => !existingEdgeIds.has(e.id));

  if (missingNodes.length === 0 && missingEdges.length === 0) {
    return;
  }

  // Update ForceGraph with combined nodes
  instance.graphData({
    nodes: [...forceGraphData.nodes, ...missingNodes],
    links: [...forceGraphData.links, ...missingEdges],
  });

  // Refresh the visualization
  instance.refresh();
};
