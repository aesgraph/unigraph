import { Color, digraph, RootGraphModel } from "ts-graphviz";
import {
  RenderingConfig,
  RenderingManager,
} from "../../controllers/RenderingManager";
import { getNodeIsVisible } from "../../store/activeLegendConfigStore";
import { GraphvizLayoutType } from "../layouts/GraphvizLayoutType";
import { LayoutEngineOption } from "../layouts/layoutEngineTypes";
import { Graph } from "./Graph";

export const ConvertSceneGraphToGraphviz = (
  graph: Graph,
  renderConfig: RenderingConfig,
  layoutMode: LayoutEngineOption,
  getUuid: (id: string) => string = (id: string) => id
): RootGraphModel => {
  const isGraphvizLayoutType = Object.values(GraphvizLayoutType).includes(
    layoutMode as GraphvizLayoutType
  );
  const renderingManager = new RenderingManager(renderConfig);
  // if (!renderConfig.nodePositions) {
  //   throw new Error("Node positions must be provided");
  // }
  const nodePositions = renderConfig.nodePositions;
  const g = digraph("G", (g) => {
    g.set("rankdir", "LR");
    if (isGraphvizLayoutType) {
      g.set("layout", layoutMode);
    } else if (nodePositions) {
      g.set("layout", "neato");
    } else {
      g.set("layout", "dot");
    }

    for (const node of graph.getNodes()) {
      if (!getNodeIsVisible(node)) {
        continue;
      }
      // Use the provided getUuid function to remap node ids
      const nodeId = getUuid(node.getId());
      const n = g.node(nodeId, {
        label: node.getId(),
        shape: "box",
        color: renderingManager.getNodeColor(node),
      });
      if (
        !isGraphvizLayoutType &&
        nodePositions &&
        nodePositions[node.getId()]
      ) {
        n.attributes.set(
          "pos",
          `${nodePositions[node.getId()].x},${nodePositions[node.getId()].y}!`
        );
      }
    }
    for (const edge of graph.getEdges()) {
      if (!renderingManager.getEdgeIsVisible(edge, graph)) {
        continue;
      }

      const fromNodeId = getUuid(edge.getSource());
      const toNodeId = getUuid(edge.getTarget());
      g.edge([fromNodeId.replace(/:/g, "_"), toNodeId.replace(/:/g, "_")], {
        label: edge.getType(),
        color: renderingManager.getEdgeColor(edge),
        fontcolor: renderingManager.getEdgeColor(edge) as Color,
      });
    }
  });
  return g;
};
