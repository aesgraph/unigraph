import { Graph } from "./Graph";
import { Node } from "./Node";

export const getRandomNode = (graph: Graph): Node => {
  const nodes = Array.from(graph.getNodes());
  const randomIndex = Math.floor(Math.random() * nodes.length);
  return nodes[randomIndex];
};
