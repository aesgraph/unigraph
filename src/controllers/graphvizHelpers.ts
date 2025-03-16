import { RootGraphModel, SubgraphModel } from "ts-graphviz";
import { GraphvizLayoutType } from "../core/layouts/GraphvizLayoutEngine";
import { LayoutEngine, LayoutEngineOption } from "../core/layouts/LayoutEngine";
import { NodePositionData } from "../core/layouts/layoutHelpers";
import { Node } from "../core/model/Node";
import { SceneGraph } from "../core/model/SceneGraph";

export type GraphvizOutput = {
  svg?: string;
  positions: NodePositionData;
};

export type Node3DPosition = {
  x: number;
  y: number;
  z: number;
};

export type Node3DPositionData = { [key: string]: Node3DPosition };

export const compute3DCircularLayout = (
  graph: SceneGraph
): Node3DPositionData => {
  const nodes = Array.from(graph.getGraph().getNodes());
  const positions: Node3DPositionData = {};

  // Group nodes by type
  const nodesByType = new Map<string, Node[]>();
  nodes.forEach((node) => {
    const type = node.getType() || "default";
    if (!nodesByType.has(type)) {
      nodesByType.set(type, []);
    }
    nodesByType.get(type)!.push(node);
  });

  // Sort types by size (largest first)
  const sortedTypes = Array.from(nodesByType.entries()).sort(
    (a, b) => b[1].length - a[1].length
  );

  const baseSpacing = 200;
  const minRadius = baseSpacing;

  sortedTypes.forEach(([_type, groupNodes], sphereIndex) => {
    const nodesInSphere = groupNodes.length;

    // Calculate radius based on number of nodes
    const radius = Math.max(
      minRadius,
      (baseSpacing * Math.sqrt(nodesInSphere)) / (2 * Math.PI) +
        baseSpacing * sphereIndex
    );

    // Use the Fibonacci sphere algorithm for even distribution
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    groupNodes.forEach((node, i) => {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / nodesInSphere);

      positions[node.getId()] = {
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
      };
    });
  });

  return positions;
};

export const compute3DBoxLayout = (sceneGraph: SceneGraph) => {
  const nodes = Array.from(sceneGraph.getGraph().getNodes());

  // Sort nodes first by type, then by tags
  const sortedNodes = nodes.sort((a, b) => {
    // Compare types first
    const typeA = a.getType() || "";
    const typeB = b.getType() || "";
    if (typeA !== typeB) {
      return typeA.localeCompare(typeB);
    }

    // If types are equal, compare tags
    const tagsA = a.getTags() || [];
    const tagsB = b.getTags() || [];
    const tagStrA = Array.from(tagsA).sort().join(",");
    const tagStrB = Array.from(tagsB).sort().join(",");
    return tagStrA.localeCompare(tagStrB);
  });

  const nodeCount = sortedNodes.length;
  const boxSize = Math.ceil(Math.pow(nodeCount, 1 / 3)); // cube root for 3D grid
  const spacing = 100; // Space between nodes

  const positions: { [key: string]: { x: number; y: number; z: number } } = {};

  sortedNodes.forEach((node, index) => {
    const x = (index % boxSize) * spacing;
    const y = (Math.floor(index / boxSize) % boxSize) * spacing;
    const z = Math.floor(index / (boxSize * boxSize)) * spacing;

    positions[node.getId()] = {
      x: x - (boxSize * spacing) / 2,
      y: y - (boxSize * spacing) / 2,
      z: z - (boxSize * spacing) / 2,
    };
  });

  return positions;
};

export async function _computeSceneGraphLayout(
  sceneGraph: SceneGraph,
  layoutType: LayoutEngineOption = GraphvizLayoutType.Graphviz_dot
): Promise<GraphvizOutput> {
  const layoutEngine = new LayoutEngine(sceneGraph);
  return layoutEngine.computeLayout(layoutType);
}

// Function to check if a cluster exists and create it if it doesn't
export const requireCluster = (
  graph: RootGraphModel,
  clusterName: string
): SubgraphModel => {
  let cluster = graph.getSubgraph(clusterName);
  if (!cluster) {
    cluster = graph.createSubgraph(clusterName);
  }
  return cluster;
};
