import { JSONString } from "../model/entity/entitiesContainer";
import { Graph } from "../model/Graph";
import { NodeDataArgs } from "../model/Node";
import { SceneGraph } from "../model/SceneGraph";
import { EdgeDataArgs } from "./../model/Edge";

export function serializeSceneGraphToJson(sceneGraph: SceneGraph): string {
  return JSON.stringify(sceneGraph);
}

export function deserializeSceneGraphFromJson(json: JSONString): SceneGraph {
  const malformedSceneGraphData = JSON.parse(json);
  console.log("MALFORMED", malformedSceneGraphData);
  const graph = new Graph();

  type NodeDataArgsAndId = NodeDataArgs & { id: string };
  type EdgeDataArgsAndId = EdgeDataArgs & { id: string };

  malformedSceneGraphData.data.graph.nodes.forEach(
    (node: NodeDataArgsAndId) => {
      graph.createNode(node.id, node);
    }
  );

  console.log("sceneGraphData is ", malformedSceneGraphData);
  console.log("sceneGraphData is ", malformedSceneGraphData.data);

  malformedSceneGraphData.data.graph.edges.forEach(
    (edge: EdgeDataArgsAndId) => {
      graph.createEdge(edge.source, edge.target, edge);
    }
  );

  delete malformedSceneGraphData.data.entityCache; //@todo fix this hack. entitycache entities need to be loaded into properly
  delete malformedSceneGraphData.data.appState; //@todo fix this hack. appState entities need to be loaded into properly

  return new SceneGraph({
    ...malformedSceneGraphData.data,
    graph,
  });
}
