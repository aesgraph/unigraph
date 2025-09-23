import { Graph } from "../../../core/model/Graph";
import { SceneGraph } from "../../../core/model/SceneGraph";

export type ProbabilisticBranchingOptions = {
  seedId?: string;
  branchingFactor?: number; // maximum number of children a node can attempt to spawn (inclusive)
  terminationProbability?: number; // probability to SKIP generating a candidate child [0,1]
  maxDepth?: number; // safety bound on depth
  maxNodes?: number; // safety bound on total nodes
  startingLength?: number; // length of edges from the seed node
  lengthDecayFactor?: number; // factor by which edge length decreases with depth (0-1, smaller = faster decay)
};

/**
 * Generate a probabilistic branching scene graph starting from a single seed node.
 * For each node, we first choose a random integer K in [1, branchingFactor].
 * For each of the K candidates, we flip a biased coin: with probability
 * `terminationProbability` we SKIP creating that node; otherwise we add the node
 * and connect it to its parent. Expansion continues breadth-first until there are
 * no new nodes to add or we hit safety limits.
 */
export function probabilisticBranchingGraph(
  options?: ProbabilisticBranchingOptions
) {
  const {
    seedId = "seed",
    branchingFactor = 5,
    terminationProbability = 0.4,
    maxDepth = 20,
    maxNodes = 1000,
    startingLength = 100, // Changed from 1 to match working example
    lengthDecayFactor = 0.7, // Changed from 0 to match working example
  } = options ?? {};

  const graph = new Graph();

  // Create seed
  const seed = graph.createNode({
    id: seedId,
    type: "branch_root",
    label: "Seed",
    userData: { depth: 0 },
  });

  let totalNodesCreated = 1; // counting the seed
  let nextNodeId = 0;

  type FrontierItem = { id: string; depth: number };
  const frontier: FrontierItem[] = [{ id: seed.getId(), depth: 0 }];

  const randomIntInclusive = (min: number, max: number): number => {
    const a = Math.ceil(min);
    const b = Math.floor(max);
    return Math.floor(Math.random() * (b - a + 1)) + a;
  };

  // Edge length calculation: decreasing length with distance from seed
  // Edges closest to seed are longest, edges furthest are shortest
  const calculateEdgeLength = (parentDepth: number): number => {
    return startingLength * Math.pow(lengthDecayFactor, parentDepth);
  };

  while (frontier.length > 0) {
    const { id: parentId, depth: parentDepth } = frontier.shift()!;
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

      const childId = `${parentId}::${nextNodeId++}`;
      const childDepth = parentDepth + 1;

      const child = graph.createNode({
        id: childId,
        type: "branch_node",
        label: `n${nextNodeId}`,
        userData: { depth: childDepth },
      });

      // KEY FIX: Use parent depth for edge length calculation
      // This ensures edges emanating from the same parent have the same length
      const edgeLength = calculateEdgeLength(parentDepth);

      graph.createEdge(parentId, child.getId(), {
        type: "branch_edge",
        length: edgeLength,
      });

      totalNodesCreated++;
      frontier.push({ id: child.getId(), depth: childDepth });
    }
  }

  return new SceneGraph({
    graph,
    metadata: {
      name: "Probabilistic Branching",
      description: `Seeded branching process with branchingFactor=${branchingFactor}, terminationProbability=${terminationProbability}. Edge lengths decrease exponentially from seed: startingLength=${startingLength} * ${lengthDecayFactor}^parent_depth.`,
    },
  });
}
