import { Graph } from "./Graph";
import { Node } from "./Node";

interface IForceConsistencyResult {
  nodesAdded: Node[];
}

export const forceConsistencyOnGraph = (
  graph: Graph
): IForceConsistencyResult => {
  console.log("Enforcing scene graph consistency...");
  const result: IForceConsistencyResult = { nodesAdded: [] };
  graph.getEdges().forEach((edge) => {
    const source = graph.maybeGetNode(edge.getSource());
    if (!source) {
      const sourceNodeAdded = graph.createNode(edge.getSource());
      result.nodesAdded.push(sourceNodeAdded);
    }
    const target = graph.maybeGetNode(edge.getTarget());
    if (!target) {
      const targetNodeAdded = graph.createNode(edge.getTarget());
      result.nodesAdded.push(targetNodeAdded);
    }
  });
  console.log("SceneGraph consistency enforced: ", result);
  return result;
};
