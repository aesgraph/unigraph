import { Edge, EdgeId } from "./Edge";
import { EntityDataArgs, IEntity } from "./entity/abstractEntity";
import { EntitiesContainer } from "./entity/entitiesContainer";
import { EntityIds } from "./entity/entityIds";
import { Node, NodeDataArgs, NodeId } from "./Node";

export type NodeIds = EntityIds<NodeId>;
export type EdgeIds = EntityIds<EdgeId>;
export type NodesContainer = EntitiesContainer<NodeId, Node>;
export type EdgesContainer = EntitiesContainer<EdgeId, Edge>;

export class Graph {
  private nodes: NodesContainer;
  private edges: EdgesContainer;
  private strict: boolean = false; // if true, do not implicitly create nodes when adding edges

  constructor(strict: boolean = false) {
    this.nodes = new EntitiesContainer();
    this.edges = new EntitiesContainer();
    this.strict = strict;
  }

  setStrictMode(strict: boolean): void {
    this.strict = strict;
  }

  static createNode(id: NodeId, args: NodeDataArgs): Node {
    return new Node(id, args);
  }

  static createEdge(fromNode: NodeId, toNode: NodeId): Edge {
    return new Edge(`${fromNode}:::${toNode}`, {
      source: fromNode,
      target: toNode,
    });
  }

  createNode(id: NodeId | string, args?: NodeDataArgs): Node {
    const node = new Node(id as NodeId, args);
    this.addNode(node);
    return node;
  }

  createEdge(
    fromNode: NodeId | string,
    toNode: NodeId | string,
    args?: EntityDataArgs
  ): Edge {
    if (this.strict) {
      if (
        !this.containsNode(fromNode as NodeId) ||
        !this.containsNode(toNode as NodeId)
      ) {
        throw new Error(
          `Cannot create edge between non-existent nodes in strict mode: ${fromNode} -> ${toNode}`
        );
      }
    }
    const edge = new Edge(`${fromNode}:::${toNode}`, {
      source: fromNode,
      target: toNode,
      ...args,
    });
    this.addEdge(edge);
    return edge;
  }

  createNodeIfMissing(id: NodeId | string, args?: NodeDataArgs): Node {
    if (!this.containsNode(id as NodeId)) {
      return this.createNode(id, args);
    }
    return this.getNode(id as NodeId);
  }

  createEdgeIfMissing(
    from: NodeId | string,
    to: NodeId | string,
    args?: EntityDataArgs
  ): Edge {
    const edgeId = `${from}:::${to}`;
    if (!this.containsEdge(edgeId as EdgeId)) {
      return this.createEdge(from, to, args);
    }
    return this.getEdge(edgeId as EdgeId);
  }

  addNode(node: Node): void {
    if (this.strict) {
      this.nodes.addEntity(node, true);
    } else {
      this.nodes.addEntitySafe(node); // only added if it doesnt exist
    }
  }

  getNode(id: NodeId): Node {
    if (!this.nodes.has(id)) {
      throw Error("Unable to find node with id: " + id);
      console.warn("DEBUG: creating node with id: " + id);
      console.log(this.nodes);
      return this.createNode(id, { type: "unknown" });
    } else {
      return this.nodes.get(id)!;
    }
  }

  maybeGetNode(id: NodeId): Node | undefined {
    return this.nodes.maybeGet(id);
  }

  removeNode(id: NodeId): void {
    if (this.strict && !this.nodes.has(id)) {
      throw new Error("Cannot remove non-existent node in strict mode: " + id);
    }
    this.nodes.removeEntity(id);
  }

  containsNode(nodeId: NodeId): boolean {
    return this.nodes.has(nodeId);
  }

  addEdge(edge: Edge): void {
    if (this.strict) {
      this.edges.addEntity(edge, this.strict);
    } else {
      this.edges.addEntitySafe(edge);
    }
  }

  getEdge(id: EdgeId): Edge {
    return this.edges.get(id);
  }

  removeEdge(id: EdgeId): void {
    if (this.strict && !this.edges.has(id)) {
      throw new Error("Cannot remove non-existent edge in strict mode: " + id);
    }
    this.edges.removeEntity(id);
  }

  containsEdge(edgeId: EdgeId): boolean {
    return this.edges.has(edgeId);
  }

  getNodesByTag(tag: string): Node[] {
    return this.nodes.filterByTag(tag).toArray();
  }

  getEdgesByTag(tag: string): Edge[] {
    return this.edges.filterByTag(tag).toArray();
  }

  getNodes(): NodesContainer {
    return this.nodes;
  }

  getEdges(): EdgesContainer {
    return this.edges;
  }

  getEdgesOf(node: Node): Edge[] {
    return this.edges
      .filter(
        (edge) =>
          edge.getSource() === node.getId() || edge.getTarget() === node.getId()
      )
      .toArray();
  }

  getNodesOf(edge: Edge): [Node, Node] {
    return [this.getNode(edge.getSource()), this.getNode(edge.getTarget())];
  }

  getIslands(): Node[][] {
    const visited = new Set<string>();
    const islands: Node[][] = [];

    const dfs = (node: Node, island: Node[]) => {
      visited.add(node.getId());
      island.push(node);
      for (const edge of this.getEdgesOf(node)) {
        const [_source, target] = this.getNodesOf(edge);
        if (!visited.has(target.getId())) {
          dfs(target, island);
        }
      }
    };

    for (const node of this.getNodes()) {
      if (!visited.has(node.getId())) {
        const island: Node[] = [];
        dfs(node, island);
        islands.push(island);
      }
    }

    return islands;
  }

  requireEntity(entityId: string): IEntity {
    return (
      this.maybeGetNode(entityId as NodeId) ?? this.getEdge(entityId as EdgeId)
    );
  }

  requireEntities(entityIds: string[]): IEntity[] {
    return entityIds.map((entityId) => this.requireEntity(entityId));
  }

  getEntity(entityId: string): IEntity | undefined {
    return (
      this.nodes.maybeGet(entityId as NodeId) ??
      this.edges.maybeGet(entityId as EdgeId)
    );
  }

  getEntities(entityIds: string[]): IEntity[] {
    return entityIds
      .map((entityId) => this.getEntity(entityId))
      .filter((entityId) => entityId !== undefined);
  }

  maybeGetEntities(entityIds: string[]): IEntity[] {
    return entityIds
      .map((entityId) => this.getEntity(entityId))
      .filter((entityId) => entityId !== undefined) as IEntity[];
  }

  getNodesByType(type: string): NodesContainer {
    return this.nodes.filterByType(type);
  }

  getEdgesTo(nodeId: string): Edge[] {
    return this.edges.filter((edge) => edge.getTarget() === nodeId).toArray();
  }

  getEdgesFrom(nodeId: string): Edge[] {
    return this.edges
      .filter((edge) => {
        return edge.getSource() === nodeId;
      })
      .toArray();
  }

  getGraphMap(): Map<NodeId, NodeId[]> {
    const graph = new Map<NodeId, NodeId[]>();
    for (const node of this.getNodes()) {
      graph.set(node.getId(), []);
    }
    for (const edge of this.getEdges()) {
      graph.get(edge.getSource())?.push(edge.getTarget());
    }
    return graph;
  }

  // Returns all edges that connect between any of the given node ids.
  getAllEdgesConnectingBetween(nodeIds: NodeIds): Edge[] {
    return this.edges
      .filter((edge) => {
        return nodeIds.has(edge.getSource()) && nodeIds.has(edge.getTarget());
      })
      .toArray();
  }

  getEdgesConnectedToNodes(
    nodeIds: NodeIds | NodeId,
    mode: "both" | "from" | "to" = "both"
  ): Edge[] {
    if (typeof nodeIds === "string") {
      nodeIds = new EntityIds([nodeIds]);
    }
    return this.edges
      .filter((edge) => {
        const isSource = nodeIds.has(edge.getSource());
        const isTarget = nodeIds.has(edge.getTarget());
        if (mode === "both") {
          return isSource && isTarget;
        } else if (mode === "from") {
          return isSource;
        } else {
          return isTarget;
        }
      })
      .toArray();
  }

  setNodes = (nodes: NodesContainer): void => {
    this.nodes = nodes;
  };

  setEdges = (edges: EdgesContainer): void => {
    this.edges = edges;
  };

  // util

  validateGraph(): void {
    this.nodes.validate();
    this.edges.validate();
  }
}
