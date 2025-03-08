import { NodeId } from "../model/Node";

export const computePath = (
  startNode: NodeId,
  endNode: NodeId,
  graph: Map<NodeId, NodeId[]>
): NodeId[] => {
  // Early return for same node
  if (startNode === endNode) {
    return [startNode];
  }

  // Initialize BFS data structures
  const queue = [[startNode]];
  const visited = new Set<NodeId>();

  while (queue.length > 0) {
    const path = queue.shift()!;
    const currentNode = path[path.length - 1];

    if (currentNode === endNode) {
      return path;
    }

    // Get neighbors of current node
    const neighbors = graph.get(currentNode) || [];

    for (const neighbor of neighbors) {
      // Only add path if we haven't visited this node in THIS path
      if (!path.includes(neighbor)) {
        // Changed from using visited Set
        const newPath = [...path, neighbor];
        queue.push(newPath);
      }
    }

    visited.add(currentNode);
  }

  return [];
};
