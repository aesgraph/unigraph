import { v4 as uuidv4 } from "uuid";
import { SceneGraph } from "../../core/model/SceneGraph";

type Vector8 = [number, number, number, number, number, number, number, number];

// Generate all 240 roots of E8
const generateE8Roots = (): Vector8[] => {
  const roots: Vector8[] = [];

  // Helper to check if root is already in set (up to sign)
  const hasRoot = (root: Vector8): boolean => {
    return roots.some(
      (r) =>
        JSON.stringify(r) === JSON.stringify(root) ||
        JSON.stringify(r) === JSON.stringify(root.map((x) => -x))
    );
  };

  // Generate type 1: (±1, ±1, 0⁶) and permutations
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      for (const s1 of [-1, 1]) {
        for (const s2 of [-1, 1]) {
          const root = Array(8).fill(0) as Vector8;
          root[i] = s1;
          root[j] = s2;
          if (!hasRoot(root)) roots.push(root);
        }
      }
    }
  }

  // Generate type 2: (±½⁸) with even number of minus signs
  const generateHalfPerm = (
    pos: number,
    minusCount: number,
    current: number[]
  ) => {
    if (pos === 8) {
      if (minusCount % 2 === 0) {
        const root = current.map((x) => x / 2) as Vector8;
        if (!hasRoot(root)) roots.push(root);
      }
      return;
    }
    for (const sign of [-1, 1]) {
      generateHalfPerm(pos + 1, minusCount + (sign === -1 ? 1 : 0), [
        ...current,
        sign,
      ]);
    }
  };

  generateHalfPerm(0, 0, []);
  return roots;
};

// Project 8D point to 2D using the Petrie projection
const petrieProject2D = (v: Vector8): { x: number; y: number } => {
  // The 2D Petrie projection coefficients
  const a = Math.sqrt(8);
  const b = Math.sqrt(4);

  // Project to 2D using the Petrie projection formulas
  const x = (v[0] + v[2] + v[4] + v[6]) / a;
  const y = (v[1] + v[3] + v[5] + v[7]) / b;

  return { x, y };
};

// Calculate inner product
const innerProduct = (v1: Vector8, v2: Vector8): number => {
  return v1.reduce((sum, x, i) => sum + x * v2[i], 0);
};

export const createE8Petrie2DGraph = (): SceneGraph => {
  const sceneGraph = new SceneGraph();
  const roots = generateE8Roots();
  console.log(`Generated ${roots.length} roots for 2d petrie`); // Should be 240

  const nodeMap = new Map<string, string>();
  const scale = 200; // Scale factor for better visualization

  // Create nodes
  roots.forEach((root) => {
    const nodeId = uuidv4();
    nodeMap.set(JSON.stringify(root), nodeId);

    const projected = petrieProject2D(root);
    sceneGraph.getGraph().createNode(nodeId, {
      type: "e8vertex",
      position: {
        x: projected.x * scale,
        y: projected.y * scale,
        z: 0, // 2D projection
      },
      userData: {
        originalCoordinates: root,
        norm: Math.sqrt(innerProduct(root, root)),
      },
      tags: new Set(["e8", "petrie2d"]),
    });
  });

  // Create edges - connect roots with inner product ±1
  let edgeCount = 0;
  const processedPairs = new Set<string>();

  roots.forEach((root1, i) => {
    roots.slice(i + 1).forEach((root2) => {
      const ip = innerProduct(root1, root2);
      if (Math.abs(ip) === 1) {
        const node1Id = nodeMap.get(JSON.stringify(root1));
        const node2Id = nodeMap.get(JSON.stringify(root2));

        if (node1Id && node2Id) {
          const edgeId = [node1Id, node2Id].sort().join("_");
          if (!processedPairs.has(edgeId)) {
            processedPairs.add(edgeId);
            sceneGraph.getGraph().createEdgeIfMissing(node1Id, node2Id, {
              type: "e8edge",
              tags: new Set(["e8", "petrie2d"]),
              userData: { innerProduct: ip },
            });
            edgeCount++;
          }
        }
      }
    });
  });

  console.log(`Created ${edgeCount} edges`); // Should be 6720

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
    name: "E8 Petrie 2D Projection",
    description:
      "2D Petrie projection of the E8 root system (240 vertices, 6720 edges)",
  });

  return sceneGraph;
};
