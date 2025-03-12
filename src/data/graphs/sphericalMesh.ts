import { Graph } from "../../core/model/Graph";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";

function createCylindricalMesh(
  radius: number = 100,
  latitudeCount: number = 10,
  longitudeCount: number = 15
): Graph {
  const graph = new Graph();

  // Calculate points on sphere
  const nodes = [];
  for (let lat = 0; lat <= latitudeCount; lat++) {
    const phi = (Math.PI * lat) / latitudeCount;
    for (let long = 0; long < longitudeCount; long++) {
      const theta = (2 * Math.PI * long) / longitudeCount;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      const nodeId = `node_${lat}_${long}`;
      nodes.push({ id: nodeId, lat, long });

      // Add node with position data in userData
      graph.createNode(nodeId, {
        type: "sphere-node",
        tags: new Set([`latitude-${lat}`, `longitude-${long}`]),
        userData: { x, y, z },
      });
    }
  }

  // Create edges between adjacent nodes
  nodes.forEach((node) => {
    const { lat, long } = node;

    // Connect to next longitude
    const nextLong = (long + 1) % longitudeCount;
    const nextLongNode = `node_${lat}_${nextLong}` as NodeId;
    if (graph.containsNode(nextLongNode)) {
      graph.createEdge(node.id, nextLongNode, {
        type: "longitude-connection",
        tags: new Set(["sphere-edge"]),
      });
    }

    // Connect to next latitude
    const nextLat = lat + 1;
    const nextLatNode = `node_${nextLat}_${long}` as NodeId;
    if (graph.containsNode(nextLatNode)) {
      graph.createEdge(node.id, nextLatNode, {
        type: "latitude-connection",
        tags: new Set(["sphere-edge"]),
      });
    }

    // Add diagonal connections for more stability
    const nextDiagonal = `node_${nextLat}_${nextLong}` as NodeId;
    if (graph.containsNode(nextDiagonal)) {
      graph.createEdge(node.id, nextDiagonal, {
        type: "diagonal-connection",
        tags: new Set(["sphere-edge", "diagonal"]),
      });
    }
  });

  return graph;
}

const graph = createCylindricalMesh();

export const cylindricalMeshGraph = new SceneGraph({
  graph,
  metadata: {
    name: "Cylindrical Mesh",
    description:
      "A cylindrical mesh structure with latitude and longitude connections.",
  },
  //   displayConfig: {
  //     mode: "type",
  //     nodePositions: Object.fromEntries(
  //       graph.getNodes().map((node) => [
  //         node.getId(),
  //         { x: node.getData().userData.x, y: node.getData().userData.y },
  //       ])
  //     ),
  //   },
});
