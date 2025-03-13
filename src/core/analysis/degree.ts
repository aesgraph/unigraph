import { Edge, EdgeId } from "../model/Edge";
import { NodeId } from "../model/Node";
import { SceneGraph } from "../model/SceneGraph";

export interface EdgesToDegreeResult {
  degreesToEdges: Map<number, Edge[]>;
  edgesToDegree: Map<EdgeId, number>;
}

/** Assumes the edges are undirected */
export const getEdgesToDegree = (
  nodeId: NodeId,
  maxDegree: number,
  sceneGraph: SceneGraph
): EdgesToDegreeResult => {
  const degreesToEdges = new Map<number, Edge[]>();
  const edgesToDegree = new Map<EdgeId, number>();
  const node = sceneGraph.getGraph().getNode(nodeId);
  if (!node) return { degreesToEdges, edgesToDegree };

  // Track visited edges to prevent duplicates
  const visitedEdgeIds = new Set<string>();

  for (let degree = 1; degree <= maxDegree; degree++) {
    if (degree === 1) {
      // First degree connections
      const directEdges = sceneGraph
        .getGraph()
        .getEdgesConnectedToNodes(nodeId)
        .filter((edge) => !visitedEdgeIds.has(edge.getId()));
      degreesToEdges.set(degree, directEdges);
      directEdges.forEach((edge) => {
        visitedEdgeIds.add(edge.getId());
        edgesToDegree.set(edge.getId() as EdgeId, degree);
      });
    } else {
      // Get previous degree's nodes
      const prevDegreeEdges = degreesToEdges.get(degree - 1) || [];
      const prevDegreeNodes = new Set<NodeId>();
      prevDegreeEdges.forEach((edge) => {
        prevDegreeNodes.add(edge.getSource() as NodeId);
        prevDegreeNodes.add(edge.getTarget() as NodeId);
      });

      // Find next degree's edges
      const currentDegreeEdges: Edge[] = [];
      prevDegreeNodes.forEach((nodeId) => {
        const connectedEdges = sceneGraph
          .getGraph()
          .getEdgesConnectedToNodes(nodeId)
          .filter((edge) => !visitedEdgeIds.has(edge.getId()));
        connectedEdges.forEach((edge) => {
          visitedEdgeIds.add(edge.getId());
          currentDegreeEdges.push(edge);
          edgesToDegree.set(edge.getId() as EdgeId, degree);
        });
      });

      if (currentDegreeEdges.length > 0) {
        degreesToEdges.set(degree, currentDegreeEdges);
      }
    }
  }

  return { degreesToEdges, edgesToDegree };
};
