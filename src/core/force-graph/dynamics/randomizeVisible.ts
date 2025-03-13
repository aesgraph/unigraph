import { ForceGraph3DInstance } from "3d-force-graph";
import { EdgeId } from "../../model/Edge";
import { EntityIds } from "../../model/entity/entityIds";
import { NodeId } from "../../model/Node";
import { SceneGraph } from "../../model/SceneGraph";

export const randomizeVisible = (
  forceGraph3dInstance: ForceGraph3DInstance,
  percentDecimalVisible: number
) => {
  forceGraph3dInstance.nodeVisibility((node) => {
    return Math.random() < percentDecimalVisible;
  });
  forceGraph3dInstance.linkVisibility((link) => {
    return Math.random() < percentDecimalVisible;
  });
};

export const randomizeVisibleAndPhysics = (
  forceGraph3dInstance: ForceGraph3DInstance,
  sceneGraph: SceneGraph,
  percentDecimalVisible: number
) => {
  const visibleNodeIds = sceneGraph
    .getGraph()
    .getNodes()
    .filter((node) => {
      return Math.random() < percentDecimalVisible;
    })
    .map((node) => node.getId());

  const visibleEdgeIds = sceneGraph
    .getGraph()
    .getAllEdgesConnectingBetween(new EntityIds(visibleNodeIds))
    .map((edge) => {
      return edge.getId();
    });

  forceGraph3dInstance.graphData({
    nodes: forceGraph3dInstance.graphData().nodes.filter((node) => {
      return visibleNodeIds.includes(node.id as NodeId);
    }),
    links: forceGraph3dInstance.graphData().links.filter((link) => {
      return visibleEdgeIds.includes((link as any).id as EdgeId);
    }),
  });
};
