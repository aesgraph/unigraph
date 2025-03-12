import { ForceGraph3DInstance } from "3d-force-graph";

import { NodeId } from "../../model/Node";
import { SceneGraph } from "../../model/SceneGraph";

export const focusWithTransparency = (
  nodeId: NodeId,
  sceneGraph: SceneGraph,
  forceGraph3dInstance: ForceGraph3DInstance
) => {
  const node = sceneGraph.getGraph().getNode(nodeId);
  if (!node) return;

  forceGraph3dInstance.nodeColor((node) => {
    if (node.id === nodeId) {
      return "rgb(255, 0, 0)";
    }
    return "rgba(77, 193, 255, 0.1)";
  });
  forceGraph3dInstance.linkOpacity(0.2);

  console.log("called");
};
