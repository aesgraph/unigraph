import { v4 as uuidv4 } from "uuid";
import { SceneGraph } from "../../core/model/SceneGraph";

type Vector8 = [number, number, number, number, number, number, number, number];

// Generate the 240 roots of E8
const generateE8Roots = (): Vector8[] => {
  const roots: Vector8[] = [];

  // Helper to check if a root is already in the set
  const hasRoot = (root: Vector8): boolean => {
    return roots.some((r) => JSON.stringify(r) === JSON.stringify(root));
  };

  // Generate type 1: (±1, ±1, 0, 0, 0, 0, 0, 0) and all permutations
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      for (const s1 of [-1, 1]) {
        for (const s2 of [-1, 1]) {
          const root = Array(8).fill(0) as Vector8;
          root[i] = s1;
          root[j] = s2;
          if (!hasRoot(root)) {
            roots.push(root);
          }
        }
      }
    }
  }

  // Generate type 2: (±1/2, ±1/2, ±1/2, ±1/2, ±1/2, ±1/2, ±1/2, ±1/2) with even number of minus signs
  const generateHalfPermutations = (
    pos: number,
    minusCount: number,
    current: number[]
  ) => {
    if (pos === 8) {
      if (minusCount % 2 === 0) {
        const root = current.map((x) => x * 0.5) as Vector8;
        if (!hasRoot(root)) {
          roots.push(root);
        }
      }
      return;
    }
    for (const sign of [-1, 1]) {
      const newCurrent = [...current];
      newCurrent[pos] = sign;
      generateHalfPermutations(
        pos + 1,
        minusCount + (sign === -1 ? 1 : 0),
        newCurrent
      );
    }
  };

  generateHalfPermutations(0, 0, Array(8).fill(0));
  return roots;
};

// Project 8D point to 2D using Petrie projection
const petrieProject = (v: Vector8): { x: number; y: number; z: number } => {
  // Petrie projection coefficients
  const c1 = Math.sqrt(2 + Math.sqrt(3));
  const c2 = Math.sqrt(2 - Math.sqrt(3));

  // Project to 3D space
  const x = (v[0] * c1 + v[4] * c2 + v[7] * c1) / Math.sqrt(3);
  const y = (v[1] * c1 + v[5] * c2 + v[6] * c1) / Math.sqrt(3);
  const z = (v[2] * c1 + v[3] * c2 + v[4] * c1) / Math.sqrt(3);

  return { x, y, z };
};

// Calculate inner product
const innerProduct = (v1: Vector8, v2: Vector8): number => {
  return v1.reduce((sum, x, i) => sum + x * v2[i], 0);
};

export const createE8PetrieGraph = (): SceneGraph => {
  const sceneGraph = new SceneGraph();
  const roots = generateE8Roots();

  console.log(`Generated ${roots.length} roots`); // Should be 240

  const nodeMap = new Map<string, string>();
  const scale = 100; // Scale factor for visualization

  // Create nodes
  roots.forEach((root) => {
    const nodeId = uuidv4();
    const key = JSON.stringify(root);
    nodeMap.set(key, nodeId);

    const projected = petrieProject(root);
    sceneGraph.getGraph().createNode(nodeId, {
      type: "e8vertex",
      position: {
        x: projected.x * scale,
        y: projected.y * scale,
        z: projected.z * scale,
      },
      userData: {
        originalCoordinates: root,
        norm: Math.sqrt(innerProduct(root, root)),
      },
      tags: new Set(["e8", "petrie"]),
    });
  });

  // FIXED edge creation - new version
  let edgeCount = 0;
  const processedPairs = new Set<string>();
  for (let i = 0; i < roots.length; i++) {
    for (let j = i + 1; j < roots.length; j++) {
      const root1 = roots[i];
      const root2 = roots[j];

      const ip = innerProduct(root1, root2);
      if (ip === 1) {
        // do not create edges for -1 because that would double count
        // E8 adjacency rule
        const node1Id = nodeMap.get(JSON.stringify(root1));
        const node2Id = nodeMap.get(JSON.stringify(root2));

        if (node1Id && node2Id) {
          // Create canonical pair ID
          const pairId = [node1Id, node2Id].sort().join("_");

          if (!processedPairs.has(pairId)) {
            processedPairs.add(pairId);
            sceneGraph.getGraph().createEdgeIfMissing(node1Id, node2Id, {
              type: "e8edge",
              tags: new Set(["e8", "petrie"]),
              userData: { innerProduct: ip },
            });
            edgeCount++;
          }
        }
      }
    }
  }

  console.log(`Created ${edgeCount} edges`); // Should now be exactly 6720

  // Configure display properties
  sceneGraph.getDisplayConfig().nodeConfig.types["e8vertex"] = {
    color: "#ffff00", // Yellow vertices
    isVisible: true,
  };

  sceneGraph.getDisplayConfig().edgeConfig.types["e8edge"] = {
    color: "#4444ff", // Blue edges
    isVisible: true,
  };

  sceneGraph.setMetadata({
    name: "E8 Petrie Projection",
    description:
      "Petrie projection of the E8 root system with correct adjacency (240 vertices, 6720 edges)",
  });

  return sceneGraph;
};
