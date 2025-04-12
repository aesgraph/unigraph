import { Edge, EdgeId } from "./Edge";
import { Graph } from "./Graph";
import { Node, NodeId } from "./Node";

describe("Graph", () => {
  let graph: Graph;

  beforeEach(() => {
    graph = new Graph();
  });

  it("should create a node", () => {
    const node = graph.createNode({ id: "node1", label: "Node 1" });
    expect(graph.getNode("node1" as NodeId)).toBe(node);
  });

  it("should create an edge", () => {
    graph.createNode({ id: "node1", label: "Node 1" });
    graph.createNode({ id: "node2", label: "Node 2" });
    const edge = graph.createEdge("node1", "node2", { label: "Edge 1-2" });
    expect(graph.getEdge("node1:::node2" as EdgeId)).toBe(edge);
  });

  it("should not create an edge between non-existent nodes in strict mode", () => {
    graph = new Graph({ strict: true });
    expect(() => graph.createEdge("node1", "node2")).toThrow(
      "Cannot create edge between non-existent nodes in strict mode: node1 -> node2"
    );
  });

  it("should add a node", () => {
    const node = new Node({ id: "node1", label: "Node 1" });
    graph.addNode(node);
    expect(graph.getNode("node1" as NodeId)).toBe(node);
  });

  it("should not add an existing node in strict mode", () => {
    graph = new Graph({ strict: true });
    const node = new Node({ id: "node1", label: "Node 1" });
    graph.addNode(node);
    expect(() => graph.addNode(node)).toThrow(
      "Cannot add existing node in strict mode: node1"
    );
  });

  it("should remove a node", () => {
    graph.createNode({ id: "node1", label: "Node 1" });
    graph.removeNode("node1" as NodeId);
    expect(() => graph.getNode("node1" as NodeId)).toThrow(
      "Unable to find node with id: node1"
    );
  });

  it("should not remove a non-existent node in strict mode", () => {
    graph = new Graph({ strict: true });
    expect(() => graph.removeNode("node1" as NodeId)).toThrow(
      "Cannot remove non-existent node in strict mode: node1"
    );
  });

  it("should add an edge", () => {
    const edge = new Edge({
      source: "node1" as NodeId,
      target: "node2" as NodeId,
      label: "Edge 1-2",
    });
    graph.addEdge(edge);
    expect(graph.getEdge("node1:::node2" as EdgeId)).toBe(edge);
  });

  it("should not add an existing edge in strict mode", () => {
    graph = new Graph({ strict: true });
    const edge = new Edge({
      source: "node1" as NodeId,
      target: "node2" as NodeId,
      label: "Edge 1-2",
    });
    graph.addEdge(edge);
    expect(() => graph.addEdge(edge)).toThrow(
      "Cannot add existing edge in strict mode: node1-node2"
    );
  });

  it("should remove an edge", () => {
    graph.createNode({ id: "node1", label: "Node 1" });
    graph.createNode({ id: "node2", label: "Node 2" });
    graph.createEdge("node1", "node2", { label: "Edge 1-2" });
    graph.removeEdge("node1:::node2" as EdgeId);
    expect(() => graph.getEdge("node1:::node2" as EdgeId)).toThrow(
      "Unable to find edge with id: node1-node2"
    );
  });

  it("should not remove a non-existent edge in strict mode", () => {
    graph = new Graph({ strict: true });
    expect(() => graph.removeEdge("node1:::node2" as EdgeId)).toThrow(
      "Cannot remove non-existent edge in strict mode: node1-node2"
    );
  });

  it("should get nodes by tag", () => {
    const node1 = graph.createNode({
      id: "node1",
      label: "Node 1",
      tags: ["tag1"],
    });
    const node2 = graph.createNode({
      id: "node2",
      label: "Node 2",
      tags: ["tag1"],
    });
    const nodes = graph.getNodesByTag("tag1");
    expect(nodes).toEqual([node1, node2]);
  });

  it("should get edges by tag", () => {
    graph.createNode({ id: "node1", label: "Node 1" });
    graph.createNode({ id: "node2", label: "Node 2" });
    const edge = graph.createEdge("node1", "node2", {
      label: "Edge 1-2",
      tags: ["tag1"],
    });
    const edges = graph.getEdgesByTag("tag1");
    expect(edges).toEqual([edge]);
  });

  it("should get all nodes", () => {
    const node1 = graph.createNode({ id: "node1", label: "Node 1" });
    const node2 = graph.createNode({ id: "node2", label: "Node 2" });
    const nodes = graph.getNodes();
    expect(nodes).toEqual([node1, node2]);
  });

  it("should get all edges", () => {
    graph.createNode({ id: "node1", label: "Node 1" });
    graph.createNode({ id: "node2", label: "Node 2" });
    const edge = graph.createEdge("node1", "node2", { label: "Edge 1-2" });
    const edges = graph.getEdges();
    expect(edges).toEqual([edge]);
  });
});
