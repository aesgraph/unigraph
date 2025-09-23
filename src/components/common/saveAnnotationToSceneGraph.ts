import { Node } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";

export interface ResourceSpecifier {
  type: "wikipedia" | "markdown";
  resource_id: string;
}

export const saveAnnotationToSceneGraph = (
  text: string,
  surroundingHtml: string,
  resource: ResourceSpecifier,
  sceneGraph: SceneGraph
): Node => {
  const graph = sceneGraph.getGraph();
  const node = graph.createNode({
    id: `annotation-${Date.now()}`,
    type: "annotation",
    label: text,
    position: { x: 0, y: 0, z: 0 },
    color: "rgb(255, 255, 255)",
    dimensions: { width: 100, height: 50 },
    size: 1.5,
    fontColor: "rgb(0, 0, 0)",
    borderWidth: 2,
    borderColor: "rgb(0, 0, 0)",
    userData: {
      annotationData: {
        htmlContent: surroundingHtml,
      },
    },
  });

  return node;
};
