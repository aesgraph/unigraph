import { NodeId } from "./Node";
import { SceneGraph } from "./SceneGraph";

interface ISceneGraphValidationResult {
  missingNodes: NodeId[];
}

// Ensure that all edges in graph have node entities.
export const validateSceneGraph = (
  sceneGraph: SceneGraph,
  throwError: boolean = true
): void => {
  const result: ISceneGraphValidationResult = { missingNodes: [] };
  sceneGraph.getEdges().forEach((edge) => {
    const source = sceneGraph.getGraph().maybeGetNode(edge.getSource());
    if (!source) {
      result.missingNodes.push(edge.getSource());
    }
    const target = sceneGraph.getGraph().maybeGetNode(edge.getTarget());
    if (!target) {
      result.missingNodes.push(edge.getTarget());
    }
  });
  if (result.missingNodes.length > 0) {
    const message = `SceneGraph validation failed: missing nodes: ${result.missingNodes.join(", ")}`;
    if (throwError) {
      throw new Error(message);
    } else {
      console.error(message);
    }
  }
};
