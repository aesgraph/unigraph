import { Edge, EdgeId } from "../../Edge";
import { Node, NodeId } from "../../Node";
import { EntitiesContainer } from "../entitiesContainer";

describe("EntitiesContainer", () => {
  it("should deep copy nodes", () => {
    const node1 = new Node("1", { label: "Node 1", tags: ["tag1"] });
    const node2 = new Node("2", { label: "Node 2", tags: ["tag2"] });
    const container = new EntitiesContainer<NodeId, Node>([node1, node2]);

    const copy = container.deepCopy();

    // Verify the copy is independent
    expect(copy).not.toBe(container);
    expect(copy.size()).toBe(container.size());

    // Modify the copy and ensure the original is not affected
    const copiedNode1 = copy.get("1" as NodeId);
    copiedNode1.setLabel("Modified Node 1");
    copiedNode1.addTag("newTag");
    expect(container.get("1" as NodeId).getLabel()).toBe("Node 1");
    expect(container.get("1" as NodeId).getTags()).not.toContain("newTag");
    expect(copiedNode1.getLabel()).toBe("Modified Node 1");
    expect(copiedNode1.getTags()).toContain("newTag");
  });

  it("should deep copy edges", () => {
    const edge1 = new Edge("1-2", {
      source: "1",
      target: "2",
      label: "Edge 1-2",
      tags: ["tag1"],
    });
    const edge2 = new Edge("2-3", {
      source: "2",
      target: "3",
      label: "Edge 2-3",
      tags: ["tag2"],
    });
    const container = new EntitiesContainer<EdgeId, Edge>([edge1, edge2]);

    const copy = container.deepCopy();

    // Verify the copy is independent
    expect(copy).not.toBe(container);
    expect(copy.size()).toBe(container.size());

    // Modify the copy and ensure the original is not affected
    const copiedEdge1 = copy.get("1-2" as EdgeId);
    copiedEdge1.setLabel("Modified Edge 1-2");
    copiedEdge1.addTag("newTag");
    expect(container.get("1-2" as EdgeId).getLabel()).toBe("Edge 1-2");
    expect(container.get("1-2" as EdgeId).getTags()).not.toContain("newTag");
    expect(copiedEdge1.getLabel()).toBe("Modified Edge 1-2");
    expect(copiedEdge1.getTags()).toContain("newTag");
  });

  it("should deep copy nodes with nested user data", () => {
    const node1 = new Node("1", {
      label: "Node 1",
      userData: { nested: { key: "value" } },
    });
    const node2 = new Node("2", {
      label: "Node 2",
      userData: { nested: { key: "value" } },
    });
    const container = new EntitiesContainer<NodeId, Node>([node1, node2]);

    const copy = container.deepCopy();

    // Verify the copy is independent
    expect(copy).not.toBe(container);
    expect(copy.size()).toBe(container.size());

    // Modify the copy and ensure the original is not affected
    const copiedNode1 = copy.get("1" as NodeId);
    copiedNode1.setUserDataObject({ nested: { key: "newValue" } });
    expect(container.get("1" as NodeId).getUserDataObject()).toEqual({
      nested: { key: "value" },
    });
    expect(copiedNode1.getUserDataObject()).toEqual({
      nested: { key: "newValue" },
    });
  });

  it("should deep copy edges with nested user data", () => {
    const edge1 = new Edge("1-2", {
      source: "1" as NodeId,
      target: "2" as NodeId,
      label: "Edge 1-2",
      userData: { nested: { key: "value" } },
    });
    const edge2 = new Edge("2-3", {
      source: "2",
      target: "3",
      label: "Edge 2-3",
      userData: { nested: { key: "value" } },
    });
    const container = new EntitiesContainer<EdgeId, Edge>([edge1, edge2]);

    const copy = container.deepCopy();

    // Verify the copy is independent
    expect(copy).not.toBe(container);
    expect(copy.size()).toBe(container.size());

    // Modify the copy and ensure the original is not affected
    const copiedEdge1 = copy.get("1-2" as EdgeId);
    copiedEdge1.setUserDataObject({ nested: { key: "newValue" } });
    expect(container.get("1-2" as EdgeId).getUserDataObject()).toEqual({
      nested: { key: "value" },
    });
    expect(copiedEdge1.getUserDataObject()).toEqual({
      nested: { key: "newValue" },
    });
  });
});
