import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
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

  const graph = new Graph();

  type NodeDataArgsAndId = NodeDataArgs & { id: string };
  type EdgeDataArgsAndId = EdgeDataArgs & { id: string };

  malformedSceneGraphData.data.graph.nodes.forEach(
    (node: NodeDataArgsAndId) => {
      graph.createNode(node);
    }
  );

  malformedSceneGraphData.data.graph.edges.forEach(
    (edge: EdgeDataArgsAndId) => {
      graph.createEdge(edge.source, edge.target, edge);
    }
  );

  delete malformedSceneGraphData.data.entityCache; //@todo fix this hack. entitycache entities need to be loaded into properly
  delete malformedSceneGraphData.data.appState; //@todo fix this hack. appState entities need to be loaded into properly

  console.log(malformedSceneGraphData.data.displayConfig);

  return new SceneGraph({
    ...malformedSceneGraphData.data,
    graph,
  });
}

/**
 * Compress a SceneGraph to a URL-safe string using lz-string.
 * @param sceneGraph The SceneGraph to serialize and compress
 * @returns Compressed, URL-safe string
 */
export function compressSceneGraphJsonForUrl(sceneGraph: SceneGraph): string {
  const json = serializeSceneGraphToJson(sceneGraph);
  return compressToEncodedURIComponent(json);
}

/**
 * Decompress a URL-safe string to SceneGraph JSON and deserialize it.
 * @param compressed Compressed, URL-safe string
 * @returns SceneGraph instance
 */
export function decompressSceneGraphJsonFromUrl(
  compressed: string
): SceneGraph {
  const json = decompressFromEncodedURIComponent(compressed);
  if (!json) throw new Error("Failed to decompress scenegraph string");
  return deserializeSceneGraphFromJson(json);
}

export const compareEquality = (a: SceneGraph, b: SceneGraph) => {
  return JSON.stringify(a) === JSON.stringify(b);
};
