import { NodePositionData } from "../../core/layouts/layoutHelpers";
import { Graph } from "../../core/model/Graph";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";

interface BlobNodeMetadata {
  id: string;
  layer: number;
  angle: number;
  point: { x: number; y: number; z: number };
  isCore?: boolean;
}

function createBlobMesh(
  radius: number = 60,
  shells: number = 4,
  nodesPerShell: number = 32
): Graph {
  const graph = new Graph();
  const nodeMetadata: BlobNodeMetadata[] = [];

  // Create center node (core)
  const coreId = "core";
  nodeMetadata.push({
    id: coreId,
    layer: 0,
    angle: 0,
    point: { x: 0, y: 0, z: 0 },
    isCore: true,
  });

  graph.createNode(coreId, {
    type: "blob-node",
    tags: new Set(["core"]),
    userData: { x: 0, y: 0, z: 0, layer: 0 },
  });

  // Create shells with more structured connectivity
  for (let shell = 1; shell <= shells; shell++) {
    const shellRadius = radius * (shell / shells);
    const noise = Math.random() * 0.1; // Reduced noise for more uniform shape

    // Create nodes with fibonacci distribution for better coverage
    for (let i = 0; i < nodesPerShell; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / nodesPerShell);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      // Reduced jitter for more stable structure
      const jitter = 1 + (Math.random() - 0.5) * noise;
      const x = shellRadius * jitter * Math.sin(phi) * Math.cos(theta);
      const y = shellRadius * jitter * Math.sin(phi) * Math.sin(theta);
      const z = shellRadius * jitter * Math.cos(phi);

      const nodeId = `node_${shell}_${i}`;
      nodeMetadata.push({
        id: nodeId,
        layer: shell,
        angle: i,
        point: { x, y, z },
      });

      graph.createNode(nodeId, {
        type: "blob-node",
        tags: new Set([`shell-${shell}`]),
        userData: { x, y, z, shell },
      });
    }
  }

  // Enhanced connection logic
  nodeMetadata.forEach((node) => {
    if (node.isCore) {
      // Connect core to all first shell nodes for stability
      const firstShellNodes = nodeMetadata.filter((n) => n.layer === 1);
      firstShellNodes.forEach((target) => {
        graph.createEdge(node.id, target.id as NodeId, {
          type: "blob-edge",
          tags: new Set(["core-connection"]),
          userData: { strength: 1.5 },
        });
      });
    } else {
      // Find closest nodes in same shell and adjacent shells
      const sameShellNodes = nodeMetadata.filter(
        (other) => other.layer === node.layer && other.id !== node.id
      );

      const adjacentShellNodes = nodeMetadata.filter(
        (other) => Math.abs(other.layer - node.layer) === 1
      );

      // Function to calculate 3D distance between nodes
      const getDistance = (n1: BlobNodeMetadata, n2: BlobNodeMetadata) => {
        const dx = n1.point.x - n2.point.x;
        const dy = n1.point.y - n2.point.y;
        const dz = n1.point.z - n2.point.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
      };

      // Connect to closest nodes in same shell
      sameShellNodes
        .sort((a, b) => getDistance(node, a) - getDistance(node, b))
        .slice(0, 3) // Connect to 3 closest nodes in same shell
        .forEach((target) => {
          graph.createEdge(node.id, target.id as NodeId, {
            type: "blob-edge",
            tags: new Set(["shell-connection"]),
            userData: { strength: 1.0 },
          });
        });

      // Connect to closest nodes in adjacent shells
      adjacentShellNodes
        .sort((a, b) => getDistance(node, a) - getDistance(node, b))
        .slice(0, 4) // Connect to 4 closest nodes in adjacent shells
        .forEach((target) => {
          graph.createEdge(node.id, target.id as NodeId, {
            type: "blob-edge",
            tags: new Set(["inter-shell-connection"]),
            userData: { strength: 0.8 },
          });
        });
    }
  });

  return graph;
}

const graph = createBlobMesh();

export const blobMeshGraph = new SceneGraph({
  graph,
  metadata: {
    name: "Organic Blob",
    description: "A cohesive blob-like mesh with uniform connectivity.",
  },
  //   displayConfig: {
  //     mode: "type",
  //     forceConfig: {
  //       d3: {
  //         gravity: -15,
  //         charge: -60,
  //         linkDistance: 25,
  //         linkStrength: 1,
  //         alpha: 1,
  //         alphaDecay: 0.001,
  //         velocityDecay: 0.2,
  //         radialStrength: 0.5
  //       }
  //     }
  //   }
});
blobMeshGraph.getData().displayConfig.nodePositions = Object.fromEntries(
  graph.getNodes().map((node) => [
    node.getId(),
    {
      x: node.getData().userData.x,
      y: node.getData().userData.y,
      z: node.getData().userData.z,
    },
  ])
);

export const extractPositionsFromUserData = (sceneGraph: SceneGraph) => {
  const graph = sceneGraph.getGraph();
  const positions: NodePositionData = {};

  graph.getNodes().forEach((node) => {
    const userData = node.getData().userData;
    positions[node.getId()] = {
      x: userData.x,
      y: userData.y,
      z: userData.z,
    };
  });

  return positions;
};

export const extractPositionsFromNodes = (sceneGraph: SceneGraph) => {
  const graph = sceneGraph.getGraph();
  const positions: NodePositionData = {};

  graph.getNodes().forEach((node) => {
    const position = node.getData().position;
    positions[node.getId()] = {
      x: position.x,
      y: position.y,
      z: position.z,
    };
  });

  return positions;
};
