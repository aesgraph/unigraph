import { Graphviz } from "@hpcc-js/wasm";
import { toDot } from "ts-graphviz";
import { v4 as uuidv4 } from "uuid";
import { GraphvizOutput } from "../../controllers/graphvizHelpers";
import { parseGraphvizPositions } from "../../controllers/graphvizJsonParser";
import { ConvertSceneGraphToGraphviz } from "../model/ConvertSceneGraphToGraphviz";
import { SceneGraph } from "../model/SceneGraph";
import { GraphvizLayoutType } from "./GraphvizLayoutType";
import {
  NodePositionData,
  scalePositionsByFactor,
  translateToPositiveCoordinates,
} from "./layoutHelpers";

export class GraphvizLayoutEngine {
  public static async computeLayout(
    sceneGraph: SceneGraph,
    layoutType: GraphvizLayoutType
  ): Promise<GraphvizOutput> {
    // --- UUID remapping logic start ---
    // Map original node ids to UUIDs
    const graph = sceneGraph.getGraph();
    const nodeIdMap: Record<string, string> = {};
    graph
      .getNodes()
      .getIds()
      .forEach((nodeId: string) => {
        nodeIdMap[nodeId] = uuidv4();
      });

    // Helper to get UUID for a node id
    const getUuid = (id: string) => nodeIdMap[id] || id;

    // Convert scene graph to Graphviz DOT using UUIDs as node ids
    const dot = toDot(
      ConvertSceneGraphToGraphviz(
        graph,
        { ...sceneGraph.getDisplayConfig(), nodePositions: undefined },
        layoutType,
        getUuid // Pass a function to remap node ids to UUIDs
      )
    );

    const graphviz = await Graphviz.load();
    const svg = await graphviz.layout(dot, "svg", layoutType);
    const jsonPositions = JSON.parse(
      await graphviz.layout(dot, "json", layoutType)
    );
    const out = parseGraphvizPositions(jsonPositions);

    // Remap positions from UUIDs back to original node ids
    let positions: NodePositionData = {};
    if (out) {
      // Reverse the nodeIdMap for lookup
      const uuidToNodeId: Record<string, string> = {};
      for (const [orig, uuid] of Object.entries(nodeIdMap)) {
        uuidToNodeId[uuid] = orig;
      }
      console.log("out is ", out);
      for (const o of out) {
        const origId = uuidToNodeId[o.id] || o.id;
        // Ensure x and y are valid numbers
        const x = typeof o.x === "number" && isFinite(o.x) ? o.x : 0;
        const y = typeof o.y === "number" && isFinite(o.y) ? -o.y : 0;
        positions[origId] = { x, y };
      }
    }
    positions = translateToPositiveCoordinates(positions);
    positions = scalePositionsByFactor(positions, 1.4);

    // Sanitize all positions before returning
    for (const key in positions) {
      if (typeof positions[key].x !== "number" || !isFinite(positions[key].x)) {
        positions[key].x = 0;
      }
      if (typeof positions[key].y !== "number" || !isFinite(positions[key].y)) {
        positions[key].y = 0;
      }
    }

    if (svg == "") {
      throw new Error("No SVG generated from Graphviz");
    }
    return { svg, positions };
  }

  private convertToDot(graph: any): string {
    let dot = "digraph G {\n";
    graph.forEachNode((node: any, _attributes: any) => {
      dot += `  ${node} [label="${node}"];\n`;
    });
    graph.forEachEdge(
      (edge: any, attributes: any, source: any, target: any) => {
        dot += `  ${source} -> ${target};\n`;
      }
    );
    dot += "}";
    return dot;
  }

  private extractPositionsFromDot(dot: string): NodePositionData {
    const positions: NodePositionData = {};
    const lines = dot.split("\n");
    for (const line of lines) {
      const match = line.match(/(\w+)\s+\[.*pos="(\d+),(\d+)".*\];/);
      if (match) {
        const [, id, x, y] = match;
        positions[id] = { x: parseFloat(x), y: parseFloat(y) };
      }
    }
    return positions;
  }
}
