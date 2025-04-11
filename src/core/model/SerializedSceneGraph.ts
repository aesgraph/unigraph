import { RenderingConfig } from "../../controllers/RenderingManager";
import { Graph } from "./Graph";

/**
 * Interface for a serialized version of SceneGraph
 * Contains only the data needed for layout computation
 */
export interface SerializedSceneGraph {
  graph: {
    nodes: Array<{
      id: string;
      label?: string;
      type?: string;
      position?: { x: number; y: number };
      data?: Record<string, any>;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      label?: string;
      type?: string;
      data?: Record<string, any>;
    }>;
  };
  displayConfig?: RenderingConfig;
}

/**
 * Helper methods for SceneGraph serialization
 */
export const SceneGraphSerializer = {
  /**
   * Serialize a Graph to a simple object format for passing to workers
   */
  serializeGraph(graph: Graph): SerializedSceneGraph["graph"] {
    const nodes = graph.getNodes().map((node) => ({
      id: node.getId(),
      label: node.getLabel(),
      type: node.getType(),
      position: node.getPosition(),
      data: node.getData(),
    }));

    const edges = graph.getEdges().map((edge) => ({
      id: edge.getId(),
      source: edge.getSource(),
      target: edge.getTarget(),
      label: edge.getLabel(),
      type: edge.getType(),
      data: edge.getData(),
    }));

    return { nodes, edges };
  },
};

// Add serialization methods to SceneGraph class
declare module "./SceneGraph" {
  interface SceneGraph {
    toSerialized(): SerializedSceneGraph;
    fromSerialized(serialized: SerializedSceneGraph): void;
  }
}
