/**
 * A simple 3D vector class with basic operations.
 */
class Vector3D {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  add(other: Vector3D): Vector3D {
    return new Vector3D(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  subtract(other: Vector3D): Vector3D {
    return new Vector3D(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  multiply(scalar: number): Vector3D {
    return new Vector3D(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  norm(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalize(): Vector3D {
    const n = this.norm();
    if (n === 0) {
      return new Vector3D(0, 0, 0);
    }
    return this.multiply(1 / n);
  }
}

/**
 * A basic graph interface.
 */
interface Graph {
  nodes: string[];
  edges: Array<[string, string]>;
}

/**
 * Returns a random 3D position vector.
 * (Here we initialize nodes in a box spanning roughly -50..50 in each axis.)
 */
function random3DPosition(): Vector3D {
  return new Vector3D(
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100
  );
}

/**
 * Returns a small random 3D vector.
 * The scale parameter controls the maximum magnitude.
 */
function randomSmallVector(scale: number = 1): Vector3D {
  return new Vector3D(
    (Math.random() - 0.5) * scale,
    (Math.random() - 0.5) * scale,
    (Math.random() - 0.5) * scale
  );
}

/**
 * A simple clustering function that groups nodes into clusters (super-nodes)
 * by pairing nodes that are connected. (This is a simple heavy-edge matching heuristic.)
 *
 * Returns a Map from cluster id (a string) to an array of original node ids.
 */
function clusterGraph(graph: Graph): Map<string, string[]> {
  const clusters = new Map<string, string[]>();
  const visited = new Set<string>();
  let clusterId = 0;

  // Build an adjacency list for the graph.
  const adjacency = new Map<string, Set<string>>();
  for (const node of graph.nodes) {
    adjacency.set(node, new Set());
  }
  for (const [u, v] of graph.edges) {
    adjacency.get(u)?.add(v);
    adjacency.get(v)?.add(u);
  }

  for (const node of graph.nodes) {
    if (visited.has(node)) continue;
    visited.add(node);
    let foundNeighbor = false;
    const neighbors = adjacency.get(node);
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          // Create a cluster with the current node and one neighbor.
          clusters.set(`cluster_${clusterId}`, [node, neighbor]);
          visited.add(neighbor);
          foundNeighbor = true;
          clusterId++;
          break;
        }
      }
    }
    if (!foundNeighbor) {
      // No available neighbor: create a singleton cluster.
      clusters.set(`cluster_${clusterId}`, [node]);
      clusterId++;
    }
  }

  return clusters;
}

/**
 * Builds a coarse graph based on the clusters.
 *
 * Each cluster becomes a node in the coarse graph.
 * For each edge in the original graph that connects nodes in different clusters,
 * an edge is added between the corresponding super-nodes.
 */
function buildCoarseGraph(
  graph: Graph,
  clusters: Map<string, string[]>
): Graph {
  const coarseNodes: string[] = Array.from(clusters.keys());
  const coarseEdgesSet = new Set<string>();
  const nodeToCluster = new Map<string, string>();

  // Map each original node to its cluster id.
  for (const [clusterId, nodes] of clusters.entries()) {
    for (const node of nodes) {
      nodeToCluster.set(node, clusterId);
    }
  }

  for (const [u, v] of graph.edges) {
    const cu = nodeToCluster.get(u);
    const cv = nodeToCluster.get(v);
    if (cu && cv && cu !== cv) {
      // Use a sorted key to avoid duplicate edges.
      const edgeKey = cu < cv ? `${cu}-${cv}` : `${cv}-${cu}`;
      coarseEdgesSet.add(edgeKey);
    }
  }

  const coarseEdges: Array<[string, string]> = [];
  for (const edgeKey of coarseEdgesSet) {
    const [cu, cv] = edgeKey.split(":::");
    coarseEdges.push([cu, cv]);
  }

  return { nodes: coarseNodes, edges: coarseEdges };
}

/**
 * Computes a simple energy function for the layout.
 *
 * For each edge we use a quadratic (spring) energy term,
 * and for each pair of nodes a repulsive term.
 */
function computeLayoutEnergy(
  graph: Graph,
  positions: Map<string, Vector3D>,
  k: number
): number {
  let energy = 0;

  // Attractive (spring) energy for each edge.
  for (const [u, v] of graph.edges) {
    const posU = positions.get(u);
    const posV = positions.get(v);
    if (posU && posV) {
      const distance = Math.max(posU.subtract(posV).norm(), 0.001);
      energy += Math.pow(distance - k, 2);
    }
  }

  // Repulsive energy for all pairs (this is an O(n^2) loop).
  const nodes = graph.nodes;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const posI = positions.get(nodes[i]);
      const posJ = positions.get(nodes[j]);
      if (posI && posJ) {
        const distance = Math.max(posI.subtract(posJ).norm(), 0.001);
        energy += (k * k) / distance;
      }
    }
  }

  return energy;
}

/**
 * The main multi-level 3D layout algorithm.
 *
 * This function implements:
 *   1. Multi-level coarsening (clustering and building a coarse graph).
 *   2. Force-directed layout on the coarse graph.
 *   3. Uncoarsening and local refinement.
 *   4. A final simulated annealing pass to escape local minima.
 *
 * @param graph                The input graph.
 * @param k                    Ideal edge length.
 * @param T_initial            Initial temperature (step size) for the algorithm.
 * @param I_max                Maximum number of iterations for force-directed and SA steps.
 * @param Coarsening_threshold The threshold number of nodes below which coarsening stops.
 *
 * @returns A Map from node id to its computed 3D position.
 */
export function multiLevel3DLayout(
  graph: Graph,
  k: number,
  T_initial: number,
  I_max: number,
  Coarsening_threshold: number
): Map<string, Vector3D> {
  // --- Step 1: Multi-Level Coarsening ---
  let hierarchy: Array<{ graph: Graph; clusters: Map<string, string[]> }> = [];
  let currentGraph = graph;

  while (currentGraph.nodes.length > Coarsening_threshold) {
    const clusters = clusterGraph(currentGraph);
    const coarseGraph = buildCoarseGraph(currentGraph, clusters);
    hierarchy.push({ graph: currentGraph, clusters: clusters });
    currentGraph = coarseGraph;
  }

  // --- Step 2: Initial Layout on the Coarse Graph ---
  let positions = new Map<string, Vector3D>();
  for (const node of currentGraph.nodes) {
    positions.set(node, random3DPosition());
  }

  // --- Step 3: Force-Directed Layout on the Coarse Graph ---
  let T = T_initial;
  for (let iter = 0; iter < I_max; iter++) {
    const forces = new Map<string, Vector3D>();
    // Initialize forces to zero for every node.
    for (const node of currentGraph.nodes) {
      forces.set(node, new Vector3D(0, 0, 0));
    }

    // Compute repulsive forces for every pair of nodes.
    for (let i = 0; i < currentGraph.nodes.length; i++) {
      const v = currentGraph.nodes[i];
      for (let j = i + 1; j < currentGraph.nodes.length; j++) {
        const u = currentGraph.nodes[j];
        const posV = positions.get(v);
        const posU = positions.get(u);
        if (posV && posU) {
          const delta = posV.subtract(posU);
          const distance = Math.max(delta.norm(), 0.001);
          const repulsiveForce = (k * k) / (distance * distance);
          const forceVector = delta.normalize().multiply(repulsiveForce);
          // Update forces on both nodes.
          forces.set(v, forces.get(v)!.add(forceVector));
          forces.set(u, forces.get(u)!.subtract(forceVector));
        }
      }
    }

    // Compute attractive forces for each edge.
    for (const [u, v] of currentGraph.edges) {
      const posU = positions.get(u);
      const posV = positions.get(v);
      if (posU && posV) {
        const delta = posU.subtract(posV);
        const distance = Math.max(delta.norm(), 0.001);
        // Hooke's law: force proportional to (distance - k)
        const attractiveForce = distance - k;
        const forceVector = delta.normalize().multiply(attractiveForce);
        forces.set(u, forces.get(u)!.subtract(forceVector));
        forces.set(v, forces.get(v)!.add(forceVector));
      }
    }

    // Optional gravitational force: pulls nodes toward the origin.
    for (const node of currentGraph.nodes) {
      const pos = positions.get(node)!;
      const gravForce = pos.multiply(-0.01); // small gravitational constant
      forces.set(node, forces.get(node)!.add(gravForce));
    }

    // Update positions.
    for (const node of currentGraph.nodes) {
      const displacement = forces.get(node)!;
      let step = displacement;
      if (displacement.norm() > T) {
        step = displacement.normalize().multiply(T);
      }
      positions.set(node, positions.get(node)!.add(step));
    }

    // Cool down.
    T = Math.max(T * 0.95, 0.001);
  }

  // --- Step 4: Uncoarsening and Local Refinement ---
  while (hierarchy.length > 0) {
    const { graph: fineGraph, clusters } = hierarchy.pop()!;
    const newPositions = new Map<string, Vector3D>();

    // For each cluster, initialize the positions of the finer nodes near the coarse node's position.
    for (const [clusterId, fineNodes] of clusters.entries()) {
      const basePos = positions.get(clusterId);
      if (!basePos) continue;
      for (const node of fineNodes) {
        // Use a small random perturbation (scale factor 5) to break symmetry.
        newPositions.set(node, basePos.add(randomSmallVector(5)));
      }
    }

    positions = newPositions;
    currentGraph = fineGraph;

    // Refine the layout for the finer graph.
    T = T_initial; // Optionally reset temperature.
    for (let iter = 0; iter < Math.floor(I_max / 2); iter++) {
      const forces = new Map<string, Vector3D>();
      for (const node of currentGraph.nodes) {
        forces.set(node, new Vector3D(0, 0, 0));
      }

      // Repulsive forces.
      for (let i = 0; i < currentGraph.nodes.length; i++) {
        const v = currentGraph.nodes[i];
        for (let j = i + 1; j < currentGraph.nodes.length; j++) {
          const u = currentGraph.nodes[j];
          const posV = positions.get(v);
          const posU = positions.get(u);
          if (posV && posU) {
            const delta = posV.subtract(posU);
            const distance = Math.max(delta.norm(), 0.001);
            const repulsiveForce = (k * k) / (distance * distance);
            const forceVector = delta.normalize().multiply(repulsiveForce);
            forces.set(v, forces.get(v)!.add(forceVector));
            forces.set(u, forces.get(u)!.subtract(forceVector));
          }
        }
      }

      // Attractive forces.
      for (const [u, v] of currentGraph.edges) {
        const posU = positions.get(u);
        const posV = positions.get(v);
        if (posU && posV) {
          const delta = posU.subtract(posV);
          const distance = Math.max(delta.norm(), 0.001);
          const attractiveForce = distance - k;
          const forceVector = delta.normalize().multiply(attractiveForce);
          forces.set(u, forces.get(u)!.subtract(forceVector));
          forces.set(v, forces.get(v)!.add(forceVector));
        }
      }

      // Gravitational force.
      for (const node of currentGraph.nodes) {
        const pos = positions.get(node)!;
        const gravForce = pos.multiply(-0.01);
        forces.set(node, forces.get(node)!.add(gravForce));
      }

      // Update positions.
      for (const node of currentGraph.nodes) {
        const displacement = forces.get(node)!;
        let step = displacement;
        if (displacement.norm() > T) {
          step = displacement.normalize().multiply(T);
        }
        positions.set(node, positions.get(node)!.add(step));
      }
      T = Math.max(T * 0.95, 0.001);
    }
  }

  // --- Step 5: Final Refinement using Simulated Annealing ---
  let T_sa = T_initial;
  let energy = computeLayoutEnergy(graph, positions, k);
  for (let iter = 0; iter < I_max; iter++) {
    // Pick a random node.
    const randomIndex = Math.floor(Math.random() * graph.nodes.length);
    const node = graph.nodes[randomIndex];
    const oldPos = positions.get(node)!;
    const newPos = oldPos.add(randomSmallVector(T_sa));

    // Try the new position.
    positions.set(node, newPos);
    const newEnergy = computeLayoutEnergy(graph, positions, k);
    const delta_E = newEnergy - energy;

    // Accept the move if it improves energy or probabilistically.
    if (delta_E < 0 || Math.random() < Math.exp(-delta_E / T_sa)) {
      energy = newEnergy; // Accept move.
    } else {
      positions.set(node, oldPos); // Reject move.
    }

    T_sa = Math.max(T_sa * 0.99, 0.001);
  }

  return positions;
}

/* =======================
     Example Usage
     ======================= */

// Define a sample graph.
const sampleGraph: Graph = {
  nodes: ["A", "B", "C", "D", "E", "F", "G"],
  edges: [
    ["A", "B"],
    ["A", "C"],
    ["B", "C"],
    ["B", "D"],
    ["C", "E"],
    ["D", "E"],
    ["D", "F"],
    ["E", "G"],
    ["F", "G"],
  ],
};

// Define algorithm parameters.
const idealEdgeLength = 30; // Adjust based on the desired spacing.
const initialTemperature = 10; // Controls maximum displacement per iteration.
const maxIterations = 100; // Number of iterations per force-directed phase.
const coarseningThreshold = 3; // Stop coarsening when graph is small.

// Compute the layout.
const layoutPositions = multiLevel3DLayout(
  sampleGraph,
  idealEdgeLength,
  initialTemperature,
  maxIterations,
  coarseningThreshold
);

// Output the positions.
console.log("Computed node positions:");
for (const [node, pos] of layoutPositions.entries()) {
  console.log(
    `${node}: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`
  );
}
