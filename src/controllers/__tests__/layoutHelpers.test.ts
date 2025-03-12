import Graph from "graphology";
import { extractPositions } from "../../core/layouts/GraphologyLayoutEngine";
import {
  centerPositions,
  createGraphologyGraph,
  scalePositions,
} from "../../core/layouts/layoutHelpers";
import { Graph as ModelGraph } from "../../core/model/Graph";
import { SceneGraph } from "../../core/model/SceneGraph";

// Mock ModelGraph and SceneGraph
const graph = new ModelGraph();
graph.createNode("1", { type: "type1" });
graph.createNode("2", { type: "type2" });
graph.createNode("3", { type: "type1" });
graph.createEdge("1", "2", { type: "edge1" });
graph.createEdge("2", "3", { type: "edge2" });

const mockSceneGraph = new SceneGraph({ graph });

describe("layoutHelpers", () => {
  describe("createGraphologyGraph", () => {
    it("should create a graphology graph from scene graph", () => {
      const graph = createGraphologyGraph(mockSceneGraph);

      expect(graph.order).toBe(3); // Number of nodes
      expect(graph.size).toBe(2); // Number of edges

      // Verify nodes
      expect(graph.hasNode("1")).toBeTruthy();
      expect(graph.hasNode("2")).toBeTruthy();
      expect(graph.hasNode("3")).toBeTruthy();

      // Verify edges
      expect(graph.hasEdge("1", "2")).toBeTruthy();
      expect(graph.hasEdge("2", "3")).toBeTruthy();
    });
  });

  describe("extractPositions", () => {
    it("should extract positions from a graph", () => {
      const graph = new Graph();
      graph.addNode("1", { x: 100, y: 200 });
      graph.addNode("2", { x: 300, y: 400 });

      const positions = extractPositions(graph);

      expect(positions).toEqual({
        "1": { x: 100, y: 200 },
        "2": { x: 300, y: 400 },
      });
    });

    it("should default to (0,0) for nodes without positions", () => {
      const graph = new Graph();
      graph.addNode("1");

      const positions = extractPositions(graph);

      expect(positions).toEqual({
        "1": { x: 0, y: 0 },
      });
    });
  });

  // describe("normalizePositions", () => {
  //   it("should normalize positions to fit within bounds", () => {
  //     const positions = {
  //       "1": { x: 0, y: 0 },
  //       "2": { x: 1000, y: 800 },
  //     };

  //     const normalized = normalizePositions(positions);

  //     expect(normalized["1"].x).toBe(0);
  //     expect(normalized["1"].y).toBe(0);
  //     expect(normalized["2"].x).toBe(1000);
  //     expect(normalized["2"].y).toBe(800);
  //   });

  //   it("should maintain aspect ratio when normalizing", () => {
  //     const positions = {
  //       "1": { x: 0, y: 0 },
  //       "2": { x: 2000, y: 800 },
  //     };

  //     const normalized = normalizePositions(positions);

  //     // Should scale down by factor of 2 to fit within 1000x800
  //     expect(normalized["2"].x).toBe(1000);
  //     expect(normalized["2"].y).toBe(400);
  //   });
  // });

  describe("scalePositions", () => {
    it("should scale positions to target dimensions", () => {
      const positions = {
        "1": { x: 0, y: 0 },
        "2": { x: 1000, y: 800 },
      };

      const scaled = scalePositions(positions, 2000, 1600);

      expect(scaled["2"].x).toBe(2000);
      expect(scaled["2"].y).toBe(1600);
    });
  });

  describe("centerPositions", () => {
    it("should center positions around origin", () => {
      const positions = {
        "1": { x: 0, y: 0 },
        "2": { x: 100, y: 100 },
      };

      const centered = centerPositions(positions);

      // Center should be at (50, 50), so positions should be offset by that
      expect(centered["1"].x).toBe(-50);
      expect(centered["1"].y).toBe(-50);
      expect(centered["2"].x).toBe(50);
      expect(centered["2"].y).toBe(50);
    });
  });
});
