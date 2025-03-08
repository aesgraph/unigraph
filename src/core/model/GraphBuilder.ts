import { ObjectOf } from "../../App";
import { EntityDataArgs } from "./entity/abstractEntity";
import { Graph } from "./Graph";

/**
 * This is loose. We can add a strict mechanism to ensure some form of consistency checking.
 */
export class GraphBuilder {
  private _graph: Graph;

  constructor(graph: Graph) {
    this._graph = graph;
  }

  graph(): Graph {
    return this._graph;
  }

  createEdgeAndMissingNodes = (
    input: string,
    output: string,
    args: EntityDataArgs | undefined
  ) => {
    this._graph.createNodeIfMissing(input);
    this._graph.createNodeIfMissing(output);
    this._graph.createEdge(input, output, args);
  };

  addNode: (id: string, type: string) => void = (id, type) => {
    this._graph.createNodeIfMissing(id, { type });
  };

  addNodes: (nodeIds: string[], type: string) => void = (nodeIds, type) => {
    for (const nodeId of nodeIds) {
      this.addNode(nodeId, type);
    }
  };

  addEdge: (input: string, edgeType: string, output: string) => void = (
    input,
    edgeType,
    output
  ) => this.createEdgeAndMissingNodes(input, output, { type: edgeType });

  addPath = (...args: string[]) => {
    if (args.length < 3) {
      throw new Error("Insufficient arguments provided");
    } else if (args.length % 2 !== 1) {
      throw new Error("Invalid number of arguments");
    }
    for (let i = 0; i < args.length - 2; i += 3) {
      this.addEdge(args[i], args[i + 1], args[i + 2]);
    }
  };

  setTypeOnEntities = (type: string, entityIds: string[]) => {
    for (const entity of this._graph.getEntities(entityIds)) {
      entity.setType(type);
    }
  };

  addTagOnEntities = (tag: string, entityIds: string[]) => {
    for (const entity of this._graph.getEntities(entityIds)) {
      entity.addTag(tag);
    }
  };
}

export type EntitiesMetadata = {
  types: string[];
  tags: string[];
};

export const getNodeMetadata = (graph: Graph): EntitiesMetadata => {
  const nodeTypes = new Set<string>();
  const nodeTags = new Set<string>();
  for (const node of graph.getNodes()) {
    nodeTypes.add(node.getType());
    node.getTags().forEach((tag) => nodeTags.add(tag));
  }
  return { types: Array.from(nodeTypes), tags: Array.from(nodeTags) };
};

export const getEdgeMetadata = (graph: Graph): EntitiesMetadata => {
  const edgeTypes = new Set<string>();
  const edgeTags = new Set<string>();
  for (const edge of graph.getEdges()) {
    edgeTypes.add(edge.getType());
    edge.getTags().forEach((tag) => edgeTags.add(tag));
  }
  return { types: Array.from(edgeTypes), tags: Array.from(edgeTags) };
};

export type GraphMetadata = {
  nodes: EntitiesMetadata;
  edges: EntitiesMetadata;
};

export const getGraphMetadata = (graph: Graph): GraphMetadata => {
  return {
    nodes: getNodeMetadata(graph),
    edges: getEdgeMetadata(graph),
  };
};

export type GraphStastics = {
  nodeCount: number;
  edgeCount: number;
  nodeTypeToCount: ObjectOf<number>;
  edgeTypeToCount: ObjectOf<number>;
  nodeTagsToCount: ObjectOf<number>;
  edgeTagsToCount: ObjectOf<number>;
  tagsToCount: ObjectOf<number>;
};

export const getGraphStatistics = (graph: Graph): GraphStastics => {
  const nodeTypeToCount: ObjectOf<number> = {};
  const edgeTypeToCount: ObjectOf<number> = {};
  const tagsToCount: ObjectOf<number> = {};
  const nodeTagsToCount: ObjectOf<number> = {};
  const edgeTagsToCount: ObjectOf<number> = {};

  for (const node of graph.getNodes()) {
    const type = node.getType();
    if (type) {
      nodeTypeToCount[type] = (nodeTypeToCount[type] || 0) + 1;
    }
    for (const tag of node.getTags()) {
      tagsToCount[tag] = (tagsToCount[tag] || 0) + 1;
      nodeTagsToCount[tag] = (nodeTagsToCount[tag] || 0) + 1;
    }
  }

  for (const edge of graph.getEdges()) {
    const type = edge.getType();
    if (type) {
      edgeTypeToCount[type] = (edgeTypeToCount[type] || 0) + 1;
    }
    for (const tag of edge.getTags()) {
      tagsToCount[tag] = (tagsToCount[tag] || 0) + 1;
      edgeTagsToCount[tag] = (edgeTagsToCount[tag] || 0) + 1;
    }
  }

  return {
    nodeCount: graph.getNodes().size(),
    edgeCount: graph.getEdges().size(),
    nodeTypeToCount,
    edgeTypeToCount,
    nodeTagsToCount,
    edgeTagsToCount,
    tagsToCount,
  };
};
