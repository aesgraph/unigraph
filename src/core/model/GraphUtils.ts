import { Edge, EdgeDataArgs } from "./Edge";
import { Graph } from "./Graph";
import { NodeId } from "./Node";

export const createEdgesTo = (
  graph: Graph,
  origin: NodeId,
  targets: NodeId[],
  args?: Partial<EdgeDataArgs>
): Edge[] => {
  const edges: Edge[] = [];
  targets.forEach((target) => {
    if (origin !== target) {
      const edge = graph.createEdge(origin, target, args);
      edges.push(edge);
    }
  });
  return edges;
};
