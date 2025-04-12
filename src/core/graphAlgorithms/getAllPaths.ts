import { EdgeId } from "../model/Edge";
import { EntityIds } from "../model/entity/entityIds";
import { NodeId } from "../model/Node";
import { SceneGraph } from "../model/SceneGraph";

/**
 * Find all downstream nodes (outputs and their outputs recursively)
 * following only forward edges from the given set of initial nodes.
 *
 * @param nodeIds Initial set of node IDs to start traversal from
 * @param sceneGraph The scene graph to traverse
 * @returns EntityIds collection containing all downstream nodes
 */
export function getDownstreamNodes(
  nodeIds: NodeId[],
  sceneGraph: SceneGraph
): EntityIds<NodeId> {
  // Create a set to track all downstream nodes (including the initial nodes)
  const downstreamNodes = new EntityIds<NodeId>(nodeIds);

  // Create a queue for breadth-first traversal
  const queue: NodeId[] = [...nodeIds];

  // Create a set to track visited nodes to avoid cycles
  const visited = new Set<NodeId>(nodeIds);

  // Get all edges from the graph
  const allEdges = sceneGraph.getGraph().getEdges();

  // Process nodes in the queue until empty
  while (queue.length > 0) {
    const currentNodeId = queue.shift()!;

    // Find only edges where current node is the source (follow outgoing edges)
    for (const edge of allEdges) {
      const sourceId = edge.getSource();
      const targetId = edge.getTarget();

      // Only follow edges where current node is the source (outgoing edges)
      if (sourceId === currentNodeId) {
        // Add the target node if not already visited
        if (!visited.has(targetId)) {
          visited.add(targetId);
          queue.push(targetId);
          downstreamNodes.add(targetId);
        }
      }
    }
  }

  return downstreamNodes;
}

/**
 * Find all upstream nodes (inputs and their inputs recursively)
 * following only backward edges from the given set of initial nodes.
 *
 * @param nodeIds Initial set of node IDs to start traversal from
 * @param sceneGraph The scene graph to traverse
 * @returns EntityIds collection containing all upstream nodes
 */
export function getUpstreamNodes(
  nodeIds: NodeId[],
  sceneGraph: SceneGraph
): EntityIds<NodeId> {
  // Create a set to track all upstream nodes (including the initial nodes)
  const upstreamNodes = new EntityIds<NodeId>(nodeIds);

  // Create a queue for breadth-first traversal
  const queue: NodeId[] = [...nodeIds];

  // Create a set to track visited nodes to avoid cycles
  const visited = new Set<NodeId>(nodeIds);

  // Get all edges from the graph
  const allEdges = sceneGraph.getGraph().getEdges();

  // Process nodes in the queue until empty
  while (queue.length > 0) {
    const currentNodeId = queue.shift()!;

    // Find only edges where current node is the target (follow incoming edges)
    for (const edge of allEdges) {
      const sourceId = edge.getSource();
      const targetId = edge.getTarget();

      // Only follow edges where current node is the target (incoming edges)
      if (targetId === currentNodeId) {
        // Add the source node if not already visited
        if (!visited.has(sourceId)) {
          visited.add(sourceId);
          queue.push(sourceId);
          upstreamNodes.add(sourceId);
        }
      }
    }
  }

  return upstreamNodes;
}

// Keep the existing getAllPaths function as an alias for getDownstreamNodes
export function getAllPaths(
  nodeIds: NodeId[],
  sceneGraph: SceneGraph
): EntityIds<NodeId> {
  const downstreamNodes = getDownstreamNodes(nodeIds, sceneGraph);
  const upstreamNodes = getUpstreamNodes(nodeIds, sceneGraph);
  return new EntityIds<NodeId>(
    downstreamNodes.toArray().concat(upstreamNodes.toArray())
  );
}

// Rename findOriginNodes to follow consistent naming
export function findOriginNodes(
  nodeIds: NodeId[],
  sceneGraph: SceneGraph
): EntityIds<NodeId> {
  return getUpstreamNodes(nodeIds, sceneGraph);
}

/**
 * Get all edges between the specified nodes
 *
 * @param nodes The nodes to get edges between
 * @param sceneGraph The scene graph
 * @returns EntityIds collection of edge IDs
 */
export function getEdgesBetweenNodes(
  nodes: EntityIds<NodeId>,
  sceneGraph: SceneGraph
): EntityIds<EdgeId> {
  const edges = new EntityIds<EdgeId>();
  const allEdges = sceneGraph.getGraph().getEdges();

  for (const edge of allEdges) {
    const sourceId = edge.getSource();
    const targetId = edge.getTarget();

    // Only include edges where both source and target are in the nodes collection
    if (nodes.has(sourceId) && nodes.has(targetId)) {
      edges.add(edge.getId());
    }
  }

  return edges;
}

/**
 * Find all nodes in the entire path (both upstream and downstream)
 * Starting from the given nodes
 *
 * @param nodeIds Starting node IDs
 * @param sceneGraph The scene graph to traverse
 * @returns Object containing nodes and edges in the path
 */
export function getEntirePath(
  nodeIds: NodeId[],
  sceneGraph: SceneGraph
): {
  nodes: EntityIds<NodeId>;
  edges: EntityIds<EdgeId>;
} {
  // Get both upstream and downstream nodes
  const upstreamNodes = getUpstreamNodes(nodeIds, sceneGraph);
  const downstreamNodes = getDownstreamNodes(nodeIds, sceneGraph);

  // Combine all nodes in the path
  const pathNodes = new EntityIds<NodeId>([
    ...upstreamNodes.toArray(),
    ...downstreamNodes.toArray(),
  ]);

  // Get all edges connecting these nodes
  const pathEdges = getEdgesBetweenNodes(pathNodes, sceneGraph);

  return {
    nodes: pathNodes,
    edges: pathEdges,
  };
}
