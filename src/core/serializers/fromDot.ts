import { parse } from "@ts-graphviz/parser";
import { NodePositionData } from "../layouts/layoutHelpers";
import { forceConsistencyOnGraph } from "../model/forceConsistency";
import { Graph } from "../model/Graph";
import { SceneGraph } from "../model/SceneGraph";
import { validateSceneGraph } from "../model/validateSceneGraph";

export function deserializeDotToSceneGraph(dotContent: string): SceneGraph {
  const graph = new Graph();
  const positions: NodePositionData = {};

  const parsedGraph = parse(dotContent);

  parsedGraph.nodes.forEach((element) => {
    const id = element.id;
    const label = element.attributes.get("label")?.toString() || "";
    const pos = element.attributes.get("pos")?.toString() || "0,0";
    const [x, y] = pos.split(",").map(parseFloat);

    const node = graph.createNode(id, { label });
    positions[id] = { x, y };
  });
  parsedGraph.edges.forEach((element) => {
    console.log(element);
    const source = (element.targets[0] as any).id; //@todo: allow more targets?
    const target = (element.targets[1] as any).id;
    const label = element.attributes.get("label")?.toString() || "";
    if (source && target) {
      graph.createEdge(source, target, { label, type: label });
    }
  });

  const sceneGraph = new SceneGraph({
    graph,
    metadata: { name: "DOT Import" },
  });
  sceneGraph.getDisplayConfig().nodePositions = positions;
  forceConsistencyOnGraph(sceneGraph.getGraph());
  validateSceneGraph(sceneGraph);
  return sceneGraph;
}
