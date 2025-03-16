import { Graph } from "../../model/Graph";
import { NodeId } from "../../model/Node";
import { computePath } from "../pathSearch";

describe("pathSearch", () => {
  let modelGraph: Graph;

  beforeEach(() => {
    modelGraph = new Graph();
  });

  test("returns empty path when no path exists", () => {
    modelGraph.createNode("A", { type: "test" });
    modelGraph.createNode("B", { type: "test" });

    const path = computePath(
      "A" as NodeId,
      "B" as NodeId,
      modelGraph.getGraphMap()
    );
    expect(path).toEqual([]);
  });

  test("returns single node path for same start and end", () => {
    modelGraph.createNode("A", { type: "test" });

    const path = computePath(
      "A" as NodeId,
      "A" as NodeId,
      modelGraph.getGraphMap()
    );
    expect(path).toEqual(["A"]);
  });

  test("finds direct path between connected nodes", () => {
    modelGraph.createNode("A", { type: "test" });
    modelGraph.createNode("B", { type: "test" });
    modelGraph.createEdge("A", "B", { type: "test" });

    const path = computePath(
      "A" as NodeId,
      "B" as NodeId,
      modelGraph.getGraphMap()
    );
    expect(path).toEqual(["A", "B"]);
  });

  test("finds shortest path in a complex graph", () => {
    // Create a diamond-shaped graph
    modelGraph.createNode("A", { type: "test" });
    modelGraph.createNode("B", { type: "test" });
    modelGraph.createNode("C", { type: "test" });
    modelGraph.createNode("D", { type: "test" });
    modelGraph.createEdge("A", "B", { type: "test" });
    modelGraph.createEdge("A", "C", { type: "test" });
    modelGraph.createEdge("B", "D", { type: "test" });
    modelGraph.createEdge("C", "D", { type: "test" });

    const path = computePath(
      "A" as NodeId,
      "D" as NodeId,
      modelGraph.getGraphMap()
    );
    expect(path.length).toBe(3); // Should find a path of length 3
    expect(path[0]).toBe("A");
    expect(path[path.length - 1]).toBe("D");
  });

  test("finds path in cyclic graph", () => {
    modelGraph.createNode("A", { type: "test" });
    modelGraph.createNode("B", { type: "test" });
    modelGraph.createNode("C", { type: "test" });
    modelGraph.createEdge("A", "B", { type: "test" });
    modelGraph.createEdge("B", "C", { type: "test" });
    modelGraph.createEdge("C", "A", { type: "test" }); // Creates cycle

    const path = computePath(
      "A" as NodeId,
      "C" as NodeId,
      modelGraph.getGraphMap()
    );
    expect(path).toEqual(["A", "B", "C"]);
  });

  test("handles large graph efficiently", () => {
    // Create a large linear graph
    const size = 1000;
    for (let i = 0; i < size; i++) {
      modelGraph.createNode(`node${i}`, { type: "test" });
      if (i > 0) {
        modelGraph.createEdge(`node${i - 1}`, `node${i}`, {
          type: "test",
        });
      }
    }

    const startTime = performance.now();
    const path = computePath(
      "node0" as NodeId,
      `node${size - 1}` as NodeId,
      modelGraph.getGraphMap()
    );
    const endTime = performance.now();

    expect(path.length).toBe(size); // Should find the full path
    expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
  });

  test("handles invalid node IDs", () => {
    modelGraph.createNode("A", { type: "test" });

    const path = computePath(
      "A" as NodeId,
      "NonExistentNode" as NodeId,
      modelGraph.getGraphMap()
    );
    expect(path).toEqual([]);
  });

  test("finds path with multiple possible routes", () => {
    // Create a graph with multiple paths from A to D
    modelGraph.createNode("A", { type: "test" });
    modelGraph.createNode("B", { type: "test" });
    modelGraph.createNode("C", { type: "test" });
    modelGraph.createNode("D", { type: "test" });
    modelGraph.createEdge("A", "B", { type: "test" });
    modelGraph.createEdge("B", "D", { type: "test" });
    modelGraph.createEdge("A", "C", { type: "test" });
    modelGraph.createEdge("C", "D", { type: "test" });

    const path = computePath(
      "A" as NodeId,
      "D" as NodeId,
      modelGraph.getGraphMap()
    );
    expect(path.length).toBe(3); // Should find a path of length 3
    expect(["B", "C"]).toContain(path[1]); // Middle node should be either B or C
  });
});
