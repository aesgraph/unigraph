import { Graph } from "../../core/model/Graph";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";

interface SphereNodeMetadata {
  id: string;
  phi?: number;
  theta?: number;
  point: { x: number; y: number; z: number };
  isPole?: boolean;
  poleType?: "north" | "south";
}

function createSphereMesh(radius: number = 100, segments: number = 12): Graph {
  const graph = new Graph();
  const nodeMetadata: SphereNodeMetadata[] = [];

  function getSpherePoint(theta: number, phi: number) {
    return {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.sin(phi) * Math.sin(theta),
      z: radius * Math.cos(phi),
    };
  }

  // Create north pole
  const northPoleId = "node_north";
  nodeMetadata.push({
    id: northPoleId,
    point: getSpherePoint(0, 0),
    isPole: true,
    poleType: "north",
  });
  graph.createNode(northPoleId, {
    type: "sphere-node",
    tags: new Set(["pole", "north"]),
    userData: getSpherePoint(0, 0),
  });

  // Create middle rings
  for (let phi = 1; phi < segments; phi++) {
    const phiAngle = (Math.PI * phi) / segments;
    for (let theta = 0; theta < segments; theta++) {
      const thetaAngle = (2 * Math.PI * theta) / segments;
      const nodeId = `node_${phi}_${theta}`;
      const point = getSpherePoint(thetaAngle, phiAngle);

      nodeMetadata.push({
        id: nodeId,
        phi,
        theta,
        point,
      });

      graph.createNode(nodeId, {
        type: "sphere-node",
        tags: new Set([`ring-${phi}`]),
        userData: point,
      });
    }
  }

  // Create south pole
  const southPoleId = "node_south";
  nodeMetadata.push({
    id: southPoleId,
    point: getSpherePoint(0, Math.PI),
    isPole: true,
    poleType: "south",
  });
  graph.createNode(southPoleId, {
    type: "sphere-node",
    tags: new Set(["pole", "south"]),
    userData: getSpherePoint(0, Math.PI),
  });

  // Create edges using metadata
  nodeMetadata.forEach((node) => {
    if (node.isPole) {
      if (node.poleType === "north") {
        // Connect north pole to first ring
        for (let theta = 0; theta < segments; theta++) {
          graph.createEdge(node.id, `node_1_${theta}` as NodeId, {
            type: "sphere-edge",
            tags: new Set(["pole-connection"]),
          });
        }
      } else {
        // Connect south pole to last ring
        for (let theta = 0; theta < segments; theta++) {
          graph.createEdge(node.id, `node_${segments - 1}_${theta}` as NodeId, {
            type: "sphere-edge",
            tags: new Set(["pole-connection"]),
          });
        }
      }
    } else if (node.phi !== undefined && node.theta !== undefined) {
      // Connect to next node in same ring
      const nextTheta = (node.theta + 1) % segments;
      graph.createEdge(node.id, `node_${node.phi}_${nextTheta}` as NodeId, {
        type: "sphere-edge",
        tags: new Set(["ring-connection"]),
      });

      // Connect to next ring (if not last ring)
      if (node.phi < segments - 1) {
        graph.createEdge(
          node.id,
          `node_${node.phi + 1}_${node.theta}` as NodeId,
          {
            type: "sphere-edge",
            tags: new Set(["vertical-connection"]),
          }
        );
        // Add diagonal connection for stability
        graph.createEdge(
          node.id,
          `node_${node.phi + 1}_${nextTheta}` as NodeId,
          {
            type: "sphere-edge",
            tags: new Set(["diagonal-connection"]),
          }
        );
      }
    }
  });

  return graph;
}



export const sphereMeshGraph = () => { 
  const graph = createSphereMesh();
  return new SceneGraph({
  graph,
  metadata: {
    name: "Sphere Mesh",
    description: "A true spherical mesh with poles and no holes.",
  },
  //   displayConfig: {
  // mode: "type",
  // nodePositions: Object.fromEntries(
  //   graph.getNodes().map((node) => [node.getId(), node.getData().userData])
  // ),
  //   },
});
}
