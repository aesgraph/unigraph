import { Graphviz } from "@hpcc-js/wasm";
import { toDot } from "ts-graphviz";
import { parseGraphvizPositions } from "../../controllers/graphvisJsonParser";
import { GraphvizOutput } from "../../controllers/graphvizHelpers";
import { ConvertSceneGraphToGraphviz } from "../model/ConvertSceneGraphToGraphviz";
import { SceneGraph } from "../model/SceneGraph";
import {
  NodePositionData,
  translateToPositiveCoordinates,
} from "./layoutHelpers";

export enum GraphvizLayoutType {
  Graphviz_circo = "circo",
  Graphviz_dot = "dot",
  Graphviz_fdp = "fdp",
  Graphviz_sfdp = "sfdp",
  Graphviz_neato = "neato",
  Graphviz_osage = "osage",
  Graphviz_patchwork = "patchwork",
  Graphviz_twopi = "twopi",
  Graphviz_nop = "nop",
  Graphviz_nop2 = "nop2",
}

// export const graphvizLayoutLabels: Record<GraphvizLayoutType, string> = {
//   [GraphvizLayoutType.Graphviz_circo]: "Circo",
//   [GraphvizLayoutType.Graphviz_dot]: "Dot",
//   [GraphvizLayoutType.Graphviz_fdp]: "Fdp",
//   [GraphvizLayoutType.Graphviz_sfdp]: "Sfdp",
//   [GraphvizLayoutType.Graphviz_neato]: "Neato",
//   [GraphvizLayoutType.Graphviz_osage]: "Osage",
//   [GraphvizLayoutType.Graphviz_patchwork]: "Patchwork",
//   [GraphvizLayoutType.Graphviz_twopi]: "Twopi",
//   [GraphvizLayoutType.Graphviz_nop]: "nop",
//   [GraphvizLayoutType.Graphviz_nop2]: "nop2",
// };

export class GraphvizLayoutEngine {
  private sceneGraph: SceneGraph;

  constructor(sceneGraph: SceneGraph) {
    this.sceneGraph = sceneGraph;
  }

  async computeLayout(layoutType: GraphvizLayoutType): Promise<GraphvizOutput> {
    const dot = toDot(
      ConvertSceneGraphToGraphviz(
        this.sceneGraph.getGraph(),
        { ...this.sceneGraph.getDisplayConfig(), nodePositions: undefined },
        layoutType
      )
    );

    const graphviz = await Graphviz.load();
    const svg = await graphviz.layout(dot, "svg", layoutType);
    const jsonPositions = JSON.parse(
      await graphviz.layout(dot, "json", layoutType)
    );
    const out = parseGraphvizPositions(jsonPositions);
    let positions: NodePositionData = {};
    if (out) {
      for (const o of out) {
        positions[o.id] = { x: o.x, y: -o.y };
      }
    }
    positions = translateToPositiveCoordinates(positions);
    if (svg == "") {
      throw new Error("No SVG generated from Graphviz");
    }
    console.log("success");
    // return normalize
    return { svg, positions };

    // Write DOT file to temporary directory
    // const dotFilePath = join(tmpdir(), "graph.dot");
    // writeFileSync(dotFilePath, dot);

    // Run Graphviz layout engine
    // const outputFilePath = join(tmpdir(), "graph-pos.dot");
    // execSync(
    //   `dot -K${layoutType.toLowerCase()} -Tdot -o ${outputFilePath} ${dotFilePath}`
    // );

    // Read the output DOT file
    // const outputDot = readFileSync(outputFilePath, "utf-8");

    // Extract positions from the output DOT file
    // const positions = this.extractPositionsFromDot(outputDot);

    // return normalizePositions(positions);
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
