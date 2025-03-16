import Graph from "graphology";
import forceLayout from "graphology-layout-force";
import forceAtlas2 from "graphology-layout-forceatlas2";
import noverlap from "graphology-layout-noverlap";
import random from "graphology-layout/random";
import { SceneGraph } from "../model/SceneGraph";
import {
  createGraphologyGraph,
  NodePositionData,
  normalizePositions,
} from "./layoutHelpers";

export enum GraphologyLayoutType {
  Graphology_force = "force",
  Graphology_forceatlas2 = "forceatlas2",
  Graphology_nooverlap = "nooverlap",
  // Graphology_circular = "circular",
  Graphology_grid = "grid",
}

export class GraphologyLayoutEngine {
  private sceneGraph: SceneGraph;

  constructor(sceneGraph: SceneGraph) {
    this.sceneGraph = sceneGraph;
  }

  async computeLayout(
    layoutType: GraphologyLayoutType
  ): Promise<NodePositionData> {
    const graph = createGraphologyGraph(this.sceneGraph);

    switch (layoutType) {
      case GraphologyLayoutType.Graphology_force:
        // Apply force-directed layout
        random.assign(graph);
        forceLayout.assign(graph, {
          maxIterations: 500,
          settings: {
            gravity: 0.1,
            attraction: 0.5,
            repulsion: 5,
          },
        });
        break;

      case GraphologyLayoutType.Graphology_forceatlas2:
        // Apply ForceAtlas2 layout
        random.assign(graph);
        forceAtlas2.assign(graph, {
          iterations: 50,
          settings: {
            gravity: 1,
            scalingRatio: 5,
            strongGravityMode: true,
            slowDown: 1,
          },
        });
        break;

      case GraphologyLayoutType.Graphology_nooverlap:
        // Apply no overlap layout
        random.assign(graph);
        noverlap.assign(graph, {
          maxIterations: 50,
          settings: {
            ratio: 2,
          },
        });
        break;

      // case GraphologyLayoutType.Graphology_circular:
      //   // Apply circular layout
      //   circular.assign(graph);
      //   break;

      case GraphologyLayoutType.Graphology_grid: {
        // Start with random layout then normalize to grid
        random.assign(graph);
        const positions = extractPositions(graph);
        const sortedNodes = Object.keys(positions).sort();
        const gridSize = Math.ceil(Math.sqrt(sortedNodes.length));

        sortedNodes.forEach((node, index) => {
          const row = Math.floor(index / gridSize);
          const col = index % gridSize;
          graph.setNodeAttribute(node, "x", col * 100);
          graph.setNodeAttribute(node, "y", row * 100);
        });
        break;
      }

      default:
        // Default to random layout
        random.assign(graph);
    }

    // Extract and normalize positions
    const positions = extractPositions(graph);
    // return positions;
    return normalizePositions(positions);
  }
}

export function extractPositions(graph: Graph): NodePositionData {
  const positions: NodePositionData = {};

  graph.forEachNode((node, attributes) => {
    positions[node] = {
      x: attributes.x || 0,
      y: attributes.y || 0,
    };
  });

  console.log("POSITIONS ARE", positions);

  return positions;
}
