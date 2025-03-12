import { ForceGraph3DInstance } from "3d-force-graph";
import { Edge } from "../../model/Edge";
import { Node } from "../../model/Node";
import { SceneGraph } from "../../model/SceneGraph";

// Get random integer from 0 to max (inclusive)
const getRandomInt = (max: number): number => {
  return Math.floor(Math.random() * (max + 1));
};

export const addCluster = (
  numNodes: number,
  connectedIds: string[],
  forceGraph3dInstance: ForceGraph3DInstance,
  sceneGraph: SceneGraph
) => {
  const centerNodes = forceGraph3dInstance.graphData().nodes.filter((node) => {
    return connectedIds.includes(node.id as any);
  });
  const avgPos = { x: 0, y: 0, z: 0 };
  centerNodes.forEach((n) => {
    avgPos.x += n.x ?? 0;
    avgPos.y += n.y ?? 0;
    avgPos.z += n.z ?? 0;
  });
  avgPos.x /= centerNodes.length;
  avgPos.y /= centerNodes.length;
  avgPos.z /= centerNodes.length;
  console.log("center pos is ", avgPos);

  const clusterId = getRandomInt(100).toString();
  const clusterNodes = Array.from({ length: numNodes }, (_, i) => ({
    id: `cluster-${i}`,
    cluster: clusterId,
    x: avgPos.x + Math.random() * 100 - 50,
    y: avgPos.y + Math.random() * 100 - 50,
    z: avgPos.z + Math.random() * 100 - 50,
  }));

  const nodes: Node[] = [];
  clusterNodes.forEach((node, i) => {
    const n = sceneGraph.getGraph().createNode(node.id, {
      type: "clusterNode",
      tags: [node.cluster],
    });
    nodes.push(n);
  });

  const edges: Edge[] = [];
  connectedIds.forEach((id) => {
    clusterNodes.forEach((node) => {
      const edge = sceneGraph.getGraph().createEdge(id, node.id, {
        type: "clusterEdge",
        tags: [clusterId],
      });
      edges.push(edge);
    });
  });

  forceGraph3dInstance.graphData({
    nodes: [...forceGraph3dInstance.graphData().nodes, ...clusterNodes],
    links: [
      ...forceGraph3dInstance.graphData().links,
      ...edges.map((edge) => ({
        id: edge.getId(),
        source: edge.getSource(),
        target: edge.getTarget(),
      })),
    ],
  });
};
