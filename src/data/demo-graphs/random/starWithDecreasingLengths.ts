import { Graph } from "../../../core/model/Graph";
import { SceneGraph } from "../../../core/model/SceneGraph";

export type StarWithDecreasingLengthsOptions = {
  stringCount?: number;
  nodesPerString?: number;
  branchingFactor?: number;
  terminationProbability?: number;
  maxDepth?: number;
  maxNodes?: number;
  startingLength?: number;
  lengthDecayFactor?: number;
  arrangeInCircle?: boolean;
};

/**
 * Generate a star topology with edges of decreasing length radiating from a central node.
 * This demonstrates how edge lengths can create visual hierarchy in a simple star pattern.
 */
export function starWithDecreasingLengthsGraph(
  options?: StarWithDecreasingLengthsOptions
) {
  const {
    stringCount = 8,
    nodesPerString = 5,
    branchingFactor = 3,
    terminationProbability = 0.6,
    maxDepth = 8,
    maxNodes = 500,
    startingLength = 100,
    lengthDecayFactor = 0.7,
    arrangeInCircle = true,
  } = options ?? {};

  const graph = new Graph();

  // Create central node
  const centerNode = graph.createNode({
    id: "center",
    type: "star_center",
    label: "Center",
    userData: { depth: 0 },
  });

  // Calculate edge length based on depth from seed (center node)
  const calculateEdgeLength = (depth: number): number => {
    return startingLength * Math.pow(lengthDecayFactor, depth);
  };

  // Helper function to generate random integer in range
  const randomIntInclusive = (min: number, max: number): number => {
    const a = Math.ceil(min);
    const b = Math.floor(max);
    return Math.floor(Math.random() * (b - a + 1)) + a;
  };

  // Create initial strings of nodes radiating from center
  const initialNodes: { node: any; depth: number; stringIndex: number }[] = [];

  for (let stringIndex = 0; stringIndex < stringCount; stringIndex++) {
    let previousNode = centerNode;

    for (let nodeIndex = 0; nodeIndex < nodesPerString; nodeIndex++) {
      const nodeId = `string_${stringIndex}_node_${nodeIndex}`;
      const currentDepth = nodeIndex + 1; // Distance from seed (center)

      const node = graph.createNode({
        id: nodeId,
        type: "string_node",
        label: `S${stringIndex + 1}N${nodeIndex + 1}`,
        userData: { depth: currentDepth, stringIndex, nodeIndex },
      });

      // Calculate edge length based on which "step" this edge represents from center
      // All edges at the same step distance should have the same length
      const edgeLength = calculateEdgeLength(nodeIndex + 1);

      // Create edge from previous node to current node
      graph.createEdge(previousNode.getId(), node.getId(), {
        type: "string_edge",
        length: edgeLength,
      });

      // Store node for branching
      initialNodes.push({ node, depth: currentDepth, stringIndex });

      previousNode = node;
    }
  }

  // Add branching from all nodes
  let totalNodesCreated = 1 + initialNodes.length; // center + initial nodes
  let nextNodeId = 0;
  const frontier = [...initialNodes];

  while (frontier.length > 0) {
    const {
      node: parentNode,
      depth: parentDepth,
      stringIndex,
    } = frontier.shift()!;
    if (parentDepth >= maxDepth) continue;

    const attempts = Math.max(
      1,
      randomIntInclusive(1, Math.max(1, branchingFactor))
    );

    for (let i = 0; i < attempts; i++) {
      // With probability terminationProbability, skip creating this child
      if (Math.random() < terminationProbability) continue;

      if (totalNodesCreated >= maxNodes) {
        frontier.length = 0; // clear frontier to break outer loop
        break;
      }

      const childDepth = parentDepth + 1; // Child's distance from seed
      const childId = `branch_${stringIndex}_${nextNodeId++}`;

      const child = graph.createNode({
        id: childId,
        type: "branch_node",
        label: `B${nextNodeId}`,
        userData: {
          depth: childDepth,
          stringIndex,
          branchIndex: nextNodeId - 1,
        },
      });

      // All edges from the same parent should have the same length
      // Use the parent's depth to determine edge length, not the child's depth
      const edgeLength = calculateEdgeLength(parentDepth);

      graph.createEdge(parentNode.getId(), child.getId(), {
        type: "branch_edge",
        length: edgeLength,
      });

      totalNodesCreated++;
      frontier.push({ node: child, depth: childDepth, stringIndex });
    }
  }

  // Set fixed position for center node
  centerNode.setPosition({ x: 0, y: 0, z: 0 });

  const sceneGraph = new SceneGraph({
    graph,
    metadata: {
      name: "Star with Decreasing Lengths",
      description: `Star topology with ${stringCount} initial strings of ${nodesPerString} nodes each, plus branching with factor ${branchingFactor} and termination probability ${terminationProbability}. Edge lengths decrease exponentially with depth from ${startingLength} with decay factor ${lengthDecayFactor}.`,
    },
  });

  // Note: We're not setting fixed positions for the branching nodes
  // as they will be positioned by the force simulation based on their edge lengths
  if (arrangeInCircle) {
    // Only set position for center node
    const positions: { [key: string]: { x: number; y: number; z: number } } = {
      center: { x: 0, y: 0, z: 0 },
    };
    sceneGraph.setNodePositions(positions);
  }

  return sceneGraph;
}
