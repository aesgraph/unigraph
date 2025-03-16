import { Edge } from "./Edge";
import { Graph } from "./Graph";
import { Node } from "./Node";

interface IGraphDiffResult {
  additionalNodes: Node[];
  missingNodes: Node[];
  additionalEdges: Edge[];
  missingEdges: Edge[];
}

export const getDiff = (a: Graph, b: Graph): IGraphDiffResult => {
  const additionalNodes: Node[] = [];
  const missingNodes: Node[] = [];
  const additionalEdges: Edge[] = [];
  const missingEdges: Edge[] = [];

  const aNodes = a.getNodes();
  const bNodes = b.getNodes();
  const aEdges = a.getEdges();
  const bEdges = b.getEdges();

  // Find additional and missing nodes
  aNodes.forEach((node, _idx) => {
    if (!bNodes.has(node.getId())) {
      missingNodes.push(node);
    }
  });

  bNodes.forEach((node, _idx) => {
    if (!aNodes.has(node.getId())) {
      additionalNodes.push(node);
    }
  });

  // Find additional and missing edges
  aEdges.forEach((edge, _idx) => {
    if (!bEdges.has(edge.getId())) {
      missingEdges.push(edge);
    }
  });

  bEdges.forEach((edge, _idx) => {
    if (!aEdges.has(edge.getId())) {
      additionalEdges.push(edge);
    }
  });

  return {
    additionalNodes,
    missingNodes,
    additionalEdges,
    missingEdges,
  };
};
