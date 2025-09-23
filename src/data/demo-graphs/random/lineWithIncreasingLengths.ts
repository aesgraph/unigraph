import { Graph } from "../../../core/model/Graph";
import { SceneGraph } from "../../../core/model/SceneGraph";

export type LineWithIncreasingLengthsOptions = {
  nodeCount?: number;
  baseLength?: number;
  lengthIncrement?: number;
};

/**
 * Generate a simple line of connected nodes with increasing edge lengths.
 * This is useful for testing edge length behavior in ForceGraph3D.
 */
export function lineWithIncreasingLengthsGraph(
  options?: LineWithIncreasingLengthsOptions
) {
  const {
    nodeCount = 10,
    baseLength = 10,
    lengthIncrement = 10,
  } = options ?? {};

  const graph = new Graph();

  // Create the first node
  const firstNode = graph.createNode({
    id: "start",
    type: "line_node",
    label: "Start",
    userData: { position: 0 },
  });

  let previousNode = firstNode;

  // Create the remaining nodes in a line
  for (let i = 1; i < nodeCount; i++) {
    const nodeId = `node_${i}`;
    const node = graph.createNode({
      id: nodeId,
      type: "line_node",
      label: `Node ${i}`,
      userData: { position: i },
    });

    // Create edge with increasing length
    const edgeLength = baseLength + (i - 1) * lengthIncrement * 2;
    graph.createEdge(previousNode.getId(), node.getId(), {
      type: "line_edge",
      length: edgeLength,
    });

    previousNode = node;
  }

  return new SceneGraph({
    graph,
    metadata: {
      name: "Line with Increasing Lengths",
      description: `A simple line of ${nodeCount} nodes with edge lengths increasing from ${baseLength} by ${lengthIncrement} each step.`,
    },
  });
}
