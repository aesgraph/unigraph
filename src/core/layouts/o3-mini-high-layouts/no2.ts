/**
 * A 3D vector class with basic arithmetic.
 */
class Vector3D {
  constructor(
    public x: number,
    public y: number,
    public z: number
  ) {}

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
    return n === 0 ? new Vector3D(0, 0, 0) : this.multiply(1 / n);
  }
}

/**
 * Graph interface: nodes are identified by strings,
 * and edges are given as pairs of node ids.
 */
interface Graph {
  nodes: string[];
  edges: Array<[string, string]>;
}

/**
 * Returns a random 3D position.
 * (Nodes are initially distributed roughly within a cube spanning -50..50.)
 */
function random3DPosition(): Vector3D {
  return new Vector3D(
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100
  );
}

/**
 * Returns a small random 3D vector. 'scale' controls the maximum magnitude.
 */
function randomSmallVector(scale: number = 1): Vector3D {
  return new Vector3D(
    (Math.random() - 0.5) * scale,
    (Math.random() - 0.5) * scale,
    (Math.random() - 0.5) * scale
  );
}

/**
 * Clusters the graph using a simple heavy–edge matching heuristic.
 * Returns a Map from a cluster id to an array of node ids.
 */
function clusterGraph(graph: Graph): Map<string, string[]> {
  const clusters = new Map<string, string[]>();
  const visited = new Set<string>();
  let clusterId = 0;

  // Build an adjacency list.
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
    let paired = false;
    const neighbors = adjacency.get(node);
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          clusters.set(`cluster_${clusterId}`, [node, neighbor]);
          visited.add(neighbor);
          paired = true;
          clusterId++;
          break;
        }
      }
    }
    if (!paired) {
      clusters.set(`cluster_${clusterId}`, [node]);
      clusterId++;
    }
  }
  return clusters;
}

/**
 * Builds a coarse graph from the original graph and its clustering.
 * Each cluster becomes a node in the coarse graph, and an edge is added
 * between clusters if any edge connects nodes in the original graph.
 */
function buildCoarseGraph(
  graph: Graph,
  clusters: Map<string, string[]>
): Graph {
  const coarseNodes: string[] = Array.from(clusters.keys());
  const coarseEdgesSet = new Set<string>();
  const nodeToCluster = new Map<string, string>();

  for (const [clusterId, nodeList] of clusters.entries()) {
    for (const node of nodeList) {
      nodeToCluster.set(node, clusterId);
    }
  }

  for (const [u, v] of graph.edges) {
    const cu = nodeToCluster.get(u);
    const cv = nodeToCluster.get(v);
    if (cu && cv && cu !== cv) {
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

/* ============================================================
     Barnes–Hut Octree Implementation for Repulsive Force Computation
     ============================================================ */

/**
 * Represents an octree node for 3D space.
 * Each node covers a cube defined by its center and half–dimension.
 */
class Octree {
  // For a leaf node, 'point' holds the inserted point.
  point: { id: string; pos: Vector3D } | null = null;
  // If subdivided, children will have 8 Octree nodes.
  children: Octree[] = [];
  // Mass (number of points) and center of mass for all points in this cell.
  mass: number = 0;
  centerOfMass: Vector3D = new Vector3D(0, 0, 0);

  constructor(
    public center: Vector3D,
    public halfDimension: number
  ) {}

  /**
   * Checks if a point lies within this node's cube.
   */
  containsPoint(pos: Vector3D): boolean {
    return (
      pos.x >= this.center.x - this.halfDimension &&
      pos.x <= this.center.x + this.halfDimension &&
      pos.y >= this.center.y - this.halfDimension &&
      pos.y <= this.center.y + this.halfDimension &&
      pos.z >= this.center.z - this.halfDimension &&
      pos.z <= this.center.z + this.halfDimension
    );
  }

  /**
   * Subdivides this node into 8 children.
   */
  subdivide(): void {
    const quarter = this.halfDimension / 2;
    const centers = [
      new Vector3D(
        this.center.x - quarter,
        this.center.y - quarter,
        this.center.z - quarter
      ),
      new Vector3D(
        this.center.x + quarter,
        this.center.y - quarter,
        this.center.z - quarter
      ),
      new Vector3D(
        this.center.x - quarter,
        this.center.y + quarter,
        this.center.z - quarter
      ),
      new Vector3D(
        this.center.x + quarter,
        this.center.y + quarter,
        this.center.z - quarter
      ),
      new Vector3D(
        this.center.x - quarter,
        this.center.y - quarter,
        this.center.z + quarter
      ),
      new Vector3D(
        this.center.x + quarter,
        this.center.y - quarter,
        this.center.z + quarter
      ),
      new Vector3D(
        this.center.x - quarter,
        this.center.y + quarter,
        this.center.z + quarter
      ),
      new Vector3D(
        this.center.x + quarter,
        this.center.y + quarter,
        this.center.z + quarter
      ),
    ];
    for (const c of centers) {
      this.children.push(new Octree(c, quarter));
    }
  }

  /**
   * Inserts a point (with id) into the octree.
   */
  insert(id: string, pos: Vector3D): boolean {
    // Ignore points outside the boundary.
    if (!this.containsPoint(pos)) return false;

    // Update mass and center of mass.
    if (this.mass === 0) {
      this.centerOfMass = pos;
      this.mass = 1;
    } else {
      // New center = (old_mass * old_center + pos) / (old_mass + 1)
      this.centerOfMass = this.centerOfMass
        .multiply(this.mass)
        .add(pos)
        .multiply(1 / (this.mass + 1));
      this.mass++;
    }

    // If this is a leaf and empty, store the point here.
    if (this.children.length === 0 && this.point === null) {
      this.point = { id, pos };
      return true;
    }

    // If this node is a leaf but already has a point, subdivide.
    if (this.children.length === 0) {
      this.subdivide();
      if (this.point) {
        // Reinsert the existing point into a child.
        for (const child of this.children) {
          if (child.insert(this.point.id, this.point.pos)) break;
        }
        this.point = null;
      }
    }

    // Insert the new point into one of the children.
    for (const child of this.children) {
      if (child.insert(id, pos)) {
        return true;
      }
    }
    return false;
  }
}

/**
 * Builds an octree for the current positions.
 * It computes a bounding cube that contains all nodes.
 */
function buildOctree(positions: Map<string, Vector3D>): Octree {
  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;

  for (const pos of positions.values()) {
    if (pos.x < minX) minX = pos.x;
    if (pos.y < minY) minY = pos.y;
    if (pos.z < minZ) minZ = pos.z;
    if (pos.x > maxX) maxX = pos.x;
    if (pos.y > maxY) maxY = pos.y;
    if (pos.z > maxZ) maxZ = pos.z;
  }

  // Compute center and halfDimension with some margin.
  const center = new Vector3D(
    (minX + maxX) / 2,
    (minY + maxY) / 2,
    (minZ + maxZ) / 2
  );
  const halfDimension = Math.max(maxX - minX, maxY - minY, maxZ - minZ) / 2 + 1;
  const tree = new Octree(center, halfDimension);

  for (const [id, pos] of positions.entries()) {
    tree.insert(id, pos);
  }

  return tree;
}

/**
 * Recursively computes the repulsive force on a target node using the Barnes–Hut approximation.
 *
 * @param tree   The current octree node.
 * @param targetId The id of the node for which we compute the force.
 * @param targetPos The position of the target node.
 * @param theta Threshold parameter; if (s/d) < theta, use approximation.
 * @param k     The ideal edge length (used in force magnitude).
 *
 * @returns A Vector3D representing the repulsive force.
 */
function computeRepulsiveForceForPoint(
  tree: Octree,
  targetId: string,
  targetPos: Vector3D,
  theta: number,
  k: number
): Vector3D {
  let force = new Vector3D(0, 0, 0);
  // If no mass in this cell, return zero force.
  if (tree.mass === 0) return force;

  // Compute distance from target to this cell's center of mass.
  let dx = targetPos.x - tree.centerOfMass.x;
  let dy = targetPos.y - tree.centerOfMass.y;
  let dz = targetPos.z - tree.centerOfMass.z;
  let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (dist < 0.001) dist = 0.001; // Avoid singularity.

  // If this is a leaf (no children), treat it as a single point.
  if (tree.children.length === 0) {
    // Do not compute force from the target itself.
    if (tree.point && tree.point.id === targetId) return force;
    const magnitude = (tree.mass * k * k) / (dist * dist);
    const unit = new Vector3D(dx / dist, dy / dist, dz / dist);
    return unit.multiply(magnitude);
  } else {
    // s is the width of the cell.
    const s = tree.halfDimension * 2;
    if (s / dist < theta) {
      // Use aggregated cell.
      const magnitude = (tree.mass * k * k) / (dist * dist);
      const unit = new Vector3D(dx / dist, dy / dist, dz / dist);
      return unit.multiply(magnitude);
    } else {
      // Otherwise, recurse over children.
      for (const child of tree.children) {
        if (child.mass > 0) {
          const f = computeRepulsiveForceForPoint(
            child,
            targetId,
            targetPos,
            theta,
            k
          );
          force = force.add(f);
        }
      }
      return force;
    }
  }
}

/* ============================================================
     Optimized Multi-Level 3D Layout Algorithm with Barnes–Hut
     ============================================================ */

/**
 * The main multi–level layout algorithm.
 *
 * It performs:
 *   1. Multi-level coarsening,
 *   2. Force-directed layout (using Barnes–Hut for repulsion),
 *   3. Uncoarsening and local refinement,
 *   4. A final simulated annealing stage.
 *
 * @param graph                The input graph.
 * @param k                    The ideal edge length.
 * @param T_initial            The initial temperature (step size).
 * @param I_max                Maximum iterations per phase.
 * @param coarseningThreshold  When graph size falls below this, stop coarsening.
 * @param theta                Barnes–Hut threshold parameter (e.g., 0.5).
 *
 * @returns A Map from node ids to their computed 3D positions.
 */
export function multiLevel3DLayout_2(
  graph: Graph,
  k: number,
  T_initial: number,
  I_max: number,
  coarseningThreshold: number,
  theta: number = 0.5
): Map<string, Vector3D> {
  // --- Step 1: Multi-Level Coarsening ---
  const hierarchy: Array<{ graph: Graph; clusters: Map<string, string[]> }> =
    [];
  let currentGraph = graph;
  while (currentGraph.nodes.length > coarseningThreshold) {
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

  /**
   * Computes the net force on each node for a given graph using:
   *   - Barnes–Hut repulsive forces,
   *   - Attractive (spring) forces from edges,
   *   - A weak gravitational force toward the origin.
   */
  function computeForces(
    graph: Graph,
    positions: Map<string, Vector3D>,
    k: number,
    theta: number
  ): Map<string, Vector3D> {
    const forces = new Map<string, Vector3D>();

    // Build the octree for repulsive forces.
    const octree = buildOctree(positions);

    // Compute repulsive force for each node.
    for (const node of graph.nodes) {
      const pos = positions.get(node)!;
      const repForce = computeRepulsiveForceForPoint(
        octree,
        node,
        pos,
        theta,
        k
      );
      forces.set(node, repForce);
    }

    // Compute attractive forces for each edge.
    for (const [u, v] of graph.edges) {
      const posU = positions.get(u)!;
      const posV = positions.get(v)!;
      const delta = posU.subtract(posV);
      const distance = Math.max(delta.norm(), 0.001);
      // Hooke's law–like attractive force.
      const attractiveForce = distance - k;
      const forceVec = delta.normalize().multiply(attractiveForce);
      forces.set(u, forces.get(u)!.subtract(forceVec));
      forces.set(v, forces.get(v)!.add(forceVec));
    }

    // Add a weak gravitational force to keep nodes from drifting away.
    for (const node of graph.nodes) {
      const pos = positions.get(node)!;
      const gravForce = pos.multiply(-0.01);
      forces.set(node, forces.get(node)!.add(gravForce));
    }

    return forces;
  }

  // --- Step 3: Force-Directed Layout on the Coarse Graph ---
  let T = T_initial;
  for (let iter = 0; iter < I_max; iter++) {
    const forces = computeForces(currentGraph, positions, k, theta);

    // Update positions using the computed forces.
    for (const node of currentGraph.nodes) {
      let displacement = forces.get(node)!;
      if (displacement.norm() > T) {
        displacement = displacement.normalize().multiply(T);
      }
      positions.set(node, positions.get(node)!.add(displacement));
    }
    T = Math.max(T * 0.95, 0.001);
  }

  // --- Step 4: Uncoarsening and Local Refinement ---
  while (hierarchy.length > 0) {
    const { graph: fineGraph, clusters } = hierarchy.pop()!;
    const newPositions = new Map<string, Vector3D>();

    // Assign positions for fine nodes near the coarse node’s position.
    for (const [clusterId, fineNodes] of clusters.entries()) {
      const basePos = positions.get(clusterId);
      if (!basePos) continue;
      for (const node of fineNodes) {
        newPositions.set(node, basePos.add(randomSmallVector(5)));
      }
    }
    positions = newPositions;
    currentGraph = fineGraph;

    T = T_initial;
    for (let iter = 0; iter < Math.floor(I_max / 2); iter++) {
      const forces = computeForces(currentGraph, positions, k, theta);
      for (const node of currentGraph.nodes) {
        let displacement = forces.get(node)!;
        if (displacement.norm() > T) {
          displacement = displacement.normalize().multiply(T);
        }
        positions.set(node, positions.get(node)!.add(displacement));
      }
      T = Math.max(T * 0.95, 0.001);
    }
  }

  // --- Step 5: Final Refinement with Simulated Annealing ---
  let T_sa = T_initial;
  let energy = computeLayoutEnergy(graph, positions, k);
  for (let iter = 0; iter < I_max; iter++) {
    const randomIndex = Math.floor(Math.random() * graph.nodes.length);
    const node = graph.nodes[randomIndex];
    const oldPos = positions.get(node)!;
    const newPos = oldPos.add(randomSmallVector(T_sa));

    positions.set(node, newPos);
    const newEnergy = computeLayoutEnergy(graph, positions, k);
    const deltaE = newEnergy - energy;

    if (deltaE < 0 || Math.random() < Math.exp(-deltaE / T_sa)) {
      energy = newEnergy;
    } else {
      positions.set(node, oldPos);
    }
    T_sa = Math.max(T_sa * 0.99, 0.001);
  }

  return positions;
}

/**
 * Computes a simple energy function for the layout.
 * For every edge, adds a spring (attractive) energy, and
 * for every pair of nodes a repulsive energy term.
 */
function computeLayoutEnergy(
  graph: Graph,
  positions: Map<string, Vector3D>,
  k: number
): number {
  let energy = 0;
  // Attractive energy.
  for (const [u, v] of graph.edges) {
    const posU = positions.get(u);
    const posV = positions.get(v);
    if (posU && posV) {
      const distance = Math.max(posU.subtract(posV).norm(), 0.001);
      energy += Math.pow(distance - k, 2);
    }
  }
  // Repulsive energy (O(n²) but acceptable for final refinement).
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

/* ===============================
     Example Usage of the Optimized Algorithm
     =============================== */

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

// Algorithm parameters.
const idealEdgeLength = 30; // Desired spacing.
const initialTemperature = 10; // Initial step size.
const maxIterations = 100; // Iterations per phase.
const coarseningThreshold = 3; // Stop coarsening below this node count.
const theta = 0.5; // Barnes–Hut threshold.

// Compute the layout.
const layoutPositions = multiLevel3DLayout_2(
  sampleGraph,
  idealEdgeLength,
  initialTemperature,
  maxIterations,
  coarseningThreshold,
  theta
);

// Output the computed positions.
console.log("Final 3D positions:");
for (const [node, pos] of layoutPositions.entries()) {
  console.log(
    `${node}: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`
  );
}
