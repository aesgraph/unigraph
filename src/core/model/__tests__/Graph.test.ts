import { EdgeId } from "../Edge";
import { Graph } from "../Graph";
import { NodeId } from "../Node";

describe("Graph", () => {
  let graph: Graph;

  beforeEach(() => {
    graph = new Graph();
  });

  it("should create a new node", () => {
    const node = graph.createNode({ id: "TestNode" });
    expect(node.getId()).toBe("TestNode");
    expect(Array.from(graph.getNodes()).length).toBe(1);
  });

  it("should create a new edge", () => {
    const _source = graph.createNode({ id: "SourceNode" });
    const _target = graph.createNode({ id: "TargetNode" });
    const edge = graph.createEdge("SourceNode", "TargetNode");
    expect(edge.getSource()).toBe("SourceNode");
    expect(edge.getTarget()).toBe("TargetNode");
    expect(Array.from(graph.getEdges()).length).toBe(1);
  });

  it("should create an edge with length", () => {
    const _source = graph.createNode({ id: "SourceNode" });
    const _target = graph.createNode({ id: "TargetNode" });
    const edge = graph.createEdge("SourceNode", "TargetNode", { length: 150 });
    expect(edge.getSource()).toBe("SourceNode");
    expect(edge.getTarget()).toBe("TargetNode");
    expect(edge.getLength()).toBe(150);
    expect(Array.from(graph.getEdges()).length).toBe(1);
  });

  it("should add and remove tags from nodes", () => {
    const node = graph.createNode({ id: "TestNode" });
    node.addTag("testTag");
    expect(node.getTags().has("testTag")).toBe(true);
    node.removeTag("testTag");
    expect(node.getTags().has("testTag")).toBe(false);
  });

  it("should add and remove tags from edges", () => {
    const _source = graph.createNode({ id: "SourceNode" });
    const _target = graph.createNode({ id: "TargetNode" });
    const edge = graph.createEdge("SourceNode", "TargetNode");
    edge.addTag("testTag");
    expect(edge.getTags().has("testTag")).toBe(true);
    edge.removeTag("testTag");
    expect(edge.getTags().has("testTag")).toBe(false);
  });

  it("should get nodes by tag", () => {
    const _node1 = graph.createNode({ id: "Node1", tags: ["tag1"] });
    const _node2 = graph.createNode({ id: "Node2", tags: ["tag2"] });
    const nodesWithTag1 = graph.getNodesByTag("tag1");
    expect(nodesWithTag1.length).toBe(1);
    expect(nodesWithTag1[0].getId()).toBe("Node1");
  });

  it("should get edges by tag", () => {
    const _source = graph.createNode({ id: "SourceNode" });
    const _target = graph.createNode({ id: "TargetNode" });
    const _edge = graph.createEdge("SourceNode", "TargetNode", {
      tags: ["tag1"],
    });
    const edgesWithTag1 = graph.getEdgesByTag("tag1");
    expect(edgesWithTag1.length).toBe(1);
    expect(edgesWithTag1[0].getSource()).toBe("SourceNode");
    expect(edgesWithTag1[0].getTarget()).toBe("TargetNode");
  });

  it("should throw an error if node is not found", () => {
    expect(() => graph.getNode("NonExistentNode" as NodeId)).toThrow(
      "Unable to find node with id: NonExistentNode"
    );
  });

  it("should throw an error if edge is not found", () => {
    expect(() => graph.getEdge("NonExistentEdge" as EdgeId)).toThrow(
      "Unable to find edge with id: NonExistentEdge"
    );
  });
});
