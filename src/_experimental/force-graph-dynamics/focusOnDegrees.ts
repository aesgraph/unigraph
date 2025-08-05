import { ForceGraph3DInstance } from "3d-force-graph";

import { RenderingManager } from "../../controllers/RenderingManager";
import { getEdgesToDegree } from "../../core/analysis/degree";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";
import { hexToRgba } from "../../utils/colorUtils";

export const focusOnDegrees = (
  nodeId: NodeId,
  sceneGraph: SceneGraph,
  forceGraph3dInstance: ForceGraph3DInstance,
  degrees: number
) => {
  const result = getEdgesToDegree(nodeId, degrees, sceneGraph);
  const renderingManager = new RenderingManager(sceneGraph.getDisplayConfig());
  const nodeDegrees: Map<NodeId, number> = new Map();

  forceGraph3dInstance.linkColor((link) => {
    const edge = sceneGraph.getGraph().getEdge((link as any).id);
    if (!edge) return "rgba(0, 0, 0, 0)";
    const edgeDegree = result.edgesToDegree.get((link as any).id) ?? 0;

    if (!nodeDegrees.has(edge.getSource())) {
      nodeDegrees.set(edge.getSource(), edgeDegree);
    } else if (nodeDegrees.get(edge.getSource())! < edgeDegree) {
      nodeDegrees.set(edge.getSource(), edgeDegree);
    }

    if (!nodeDegrees.has(edge.getTarget())) {
      nodeDegrees.set(edge.getTarget(), edgeDegree);
    } else if (nodeDegrees.get(edge.getTarget())! < edgeDegree) {
      nodeDegrees.set(edge.getTarget(), edgeDegree);
    }

    const color = renderingManager.getEdgeColor(
      sceneGraph.getGraph().getEdge((link as any).id)
    );
    // Fix: Calculate alpha as a decimal between 0 and 1
    const alpha = edgeDegree ? (degrees - edgeDegree + 1) / degrees : 0;
    return hexToRgba(color, alpha);
  });

  forceGraph3dInstance.nodeColor((node) => {
    if (node.id === nodeId) {
      return "rgb(255, 0, 0)";
    }
    const degree = nodeDegrees.get((node as any).id) ?? 0;
    if (degree === 0) return "rgba(0, 0, 0, 0)";
    const color = renderingManager.getNodeColor(
      sceneGraph.getGraph().getNode((node as any).id)
    );
    // Fix: Calculate alpha as a decimal between 0 and 1
    const alpha = degree ? (degrees - degree + 1) / degrees : 0;
    return hexToRgba(color, alpha);
  });
};
