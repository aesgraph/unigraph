import { NodePositionData } from "../../../core/layouts/layoutHelpers";
import { Graph } from "../../../core/model/Graph";
import { SceneGraph } from "../../../core/model/SceneGraph";

/**
 * Generate a scene graph consisting of:
 * - A backbone ring of `ringSize` nodes connected in a directed cycle
 * - For each ring node, `childrenPerNode` outgoing leaf children
 *
 * Defaults are ringSize=36 and childrenPerNode=5.
 */
export function alethiometerDemoGraph(
  ringSize: number = 36,
  childrenPerNode: number = 5,
  labeledNodeLabels?: string[]
) {
  const graph = new Graph();
  const positions: NodePositionData = {};

  // Create ring nodes
  const ringNodeIds: string[] = [];
  const allChildIds: string[] = [];
  // Place ring nodes on a circle
  const RING_RADIUS = 300;
  const CENTER = { x: 0, y: 0 };
  for (let i = 0; i < ringSize; i++) {
    const id = `r${i}`;
    graph.createNode({
      id,
      type: "ring_node",
      label: `R${i}`,
    });
    ringNodeIds.push(id);
    const theta = (2 * Math.PI * i) / ringSize;
    positions[id] = {
      x: CENTER.x + RING_RADIUS * Math.cos(theta),
      y: CENTER.y + RING_RADIUS * Math.sin(theta),
      z: 0,
    };
  }

  // Connect ring in a directed cycle
  for (let i = 0; i < ringSize; i++) {
    const from = ringNodeIds[i];
    const to = ringNodeIds[(i + 1) % ringSize];
    // approximate chord length for visual consistency; helps physics but ring nodes are fixed anyway
    graph.createEdge(from, to, { type: "ring_edge", length: 60 });
  }

  // Add children for each ring node
  for (let i = 0; i < ringSize; i++) {
    const parentId = ringNodeIds[i];
    for (let j = 0; j < childrenPerNode; j++) {
      const childId = `${parentId}::c${j}`;
      graph.createNode({
        id: childId,
        type: "child_node",
        label: `C${i}-${j}`,
      });
      graph.createEdge(parentId, childId, { type: "child_edge", length: 70 });
      allChildIds.push(childId);

      // Arrange children around each parent, slightly outside the ring
      const parentPos = positions[parentId];
      const parentTheta = (2 * Math.PI * i) / ringSize;
      const CHILD_OFFSET_RADIUS = 70;
      const SPREAD_DEGREES = 40; // total angular spread around the radial direction
      const spreadRad = (SPREAD_DEGREES * Math.PI) / 180;
      const baseAngle = parentTheta; // radial outward direction
      // Distribute children evenly across [-spread/2, +spread/2]
      const t = childrenPerNode > 1 ? j / (childrenPerNode - 1) : 0.5; // center if only one
      const angleOffset = -spreadRad / 2 + t * spreadRad;
      const angle = baseAngle + angleOffset;
      positions[childId] = {
        x: parentPos.x + CHILD_OFFSET_RADIUS * Math.cos(angle),
        y: parentPos.y + CHILD_OFFSET_RADIUS * Math.sin(angle),
        z: 0,
      };
    }
  }

  // Add labeled category nodes and connect each to 2-5 random child nodes with distinct colors
  const labels = labeledNodeLabels ?? [
    "Alpha",
    "Beta",
    "Gamma",
    "Delta",
    "Epsilon",
    "Zeta",
    "Eta",
    "Theta",
  ];

  // Distinct color palette (extendable). If there are more labels than colors, cycle through.
  const palette = [
    "#e41a1c", // red
    "#377eb8", // blue
    "#4daf4a", // green
    "#984ea3", // purple
    "#ff7f00", // orange
    "#a65628", // brown
    "#f781bf", // pink
    "#999999", // gray
    "#66c2a5", // teal
    "#e6ab02", // mustard
  ];

  const randomIntInclusive = (min: number, max: number): number => {
    const a = Math.ceil(min);
    const b = Math.floor(max);
    return Math.floor(Math.random() * (b - a + 1)) + a;
  };

  const sampleWithoutReplacement = (arr: string[], k: number): string[] => {
    const copy = arr.slice();
    const result: string[] = [];
    const n = Math.min(k, copy.length);
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * copy.length);
      result.push(copy[idx]);
      copy.splice(idx, 1);
    }
    return result;
  };

  labels.forEach((label, index) => {
    const color = palette[index % palette.length];
    const id = `L${index}`;
    graph.createNode({ id, type: "label_node", label, color });

    // Connect to 2-5 random child nodes
    const numLinks = randomIntInclusive(2, 5);
    const targets = sampleWithoutReplacement(allChildIds, numLinks);
    targets.forEach((childId) => {
      // label nodes are free; length influences where they settle relative to fixed children
      graph.createEdge(id, childId, { type: "label_edge", color, length: 120 });
    });
  });

  const scene = new SceneGraph({
    graph,
    metadata: {
      name: `Ring ${ringSize} with ${childrenPerNode} children each`,
      description:
        "A directed cycle (ring) where each backbone node spawns a fixed number of leaf children.",
    },
  });
  // Fix positions for ring and children only; labeled nodes intentionally left free
  scene.setNodePositions(positions);
  return scene;
}
