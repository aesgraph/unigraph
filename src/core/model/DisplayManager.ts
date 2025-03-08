import { FilterRuleDefinition } from "../../components/filters/FilterRuleDefinition";
import { RenderingConfig } from "../../controllers/RenderingManager";
import { filterNodes } from "../filters/filterEngine";
import { NodePositionData } from "../layouts/layoutHelpers";
import { EntitiesContainer } from "./entity/entitiesContainer";
import { Graph } from "./Graph";
import { DEFAULT_DISPLAY_NODE_DATA } from "./Node";

export interface IDisplayManagerData {
  mode: "type" | "tag";
  nodeTypeColors: { [key: string]: string };
  edgeTypeColors: { [key: string]: string };
  nodeTagColors: { [key: string]: string };
  edgeTagColors: { [key: string]: string };
  nodeTypeVisibility: { [key: string]: boolean };
  edgeTypeVisibility: { [key: string]: boolean };
  nodeTagVisibility: { [key: string]: boolean };
  edgeTagVisibility: { [key: string]: boolean };
  nodePositions?: NodePositionData; // a cache of node position data from a layout computation
}

export const toDisplayManagerData = (
  config: RenderingConfig
): IDisplayManagerData => {
  return {
    mode: config.mode,
    nodeTypeColors: Object.entries(config.nodeConfig.types).reduce(
      (acc, [key, value]) => {
        acc[key] = value.color;
        return acc;
      },
      {} as { [key: string]: string }
    ),
    edgeTypeColors: Object.entries(config.edgeConfig.types).reduce(
      (acc, [key, value]) => {
        acc[key] = value.color;
        return acc;
      },
      {} as { [key: string]: string }
    ),
    nodeTagColors: Object.entries(config.nodeConfig.tags).reduce(
      (acc, [key, value]) => {
        acc[key] = value.color;
        return acc;
      },
      {} as { [key: string]: string }
    ),
    edgeTagColors: Object.entries(config.edgeConfig.tags).reduce(
      (acc, [key, value]) => {
        acc[key] = value.color;
        return acc;
      },
      {} as { [key: string]: string }
    ),
    nodeTypeVisibility: Object.entries(config.nodeConfig.types).reduce(
      (acc, [key, value]) => {
        acc[key] = value.isVisible;
        return acc;
      },
      {} as { [key: string]: boolean }
    ),
    edgeTypeVisibility: Object.entries(config.edgeConfig.types).reduce(
      (acc, [key, value]) => {
        acc[key] = value.isVisible;
        return acc;
      },
      {} as { [key: string]: boolean }
    ),
    nodeTagVisibility: Object.entries(config.nodeConfig.tags).reduce(
      (acc, [key, value]) => {
        acc[key] = value.isVisible;
        return acc;
      },
      {} as { [key: string]: boolean }
    ),
    edgeTagVisibility: Object.entries(config.edgeConfig.tags).reduce(
      (acc, [key, value]) => {
        acc[key] = value.isVisible;
        return acc;
      },
      {} as { [key: string]: boolean }
    ),
    nodePositions: config.nodePositions,
  };
};

export class DisplayManager {
  public static applyDisplayConfigToGraph = (
    graph: Graph,
    data: IDisplayManagerData
  ): void => {
    if (data.mode === "type") {
      DisplayManager.applyNodeColors(graph, data.nodeTypeColors, data.mode);
      DisplayManager.applyEdgeColors(graph, data.edgeTypeColors, data.mode);
      DisplayManager.applyNodeVisibility(
        graph,
        data.nodeTypeVisibility,
        data.mode
      );
      DisplayManager.applyEdgeVisibility(
        graph,
        data.edgeTypeVisibility,
        data.mode
      );
    } else {
      DisplayManager.applyNodeColors(graph, data.nodeTagColors, data.mode);
      DisplayManager.applyEdgeColors(graph, data.edgeTagColors, data.mode);
      DisplayManager.applyNodeVisibility(
        graph,
        data.nodeTagVisibility,
        data.mode
      );
      DisplayManager.applyEdgeVisibility(
        graph,
        data.edgeTagVisibility,
        data.mode
      );
    }

    if (data.nodePositions) {
      DisplayManager.applyNodePositions(graph, data.nodePositions);
    }
  };

  public static applyNodePositions = (graph: Graph, data: NodePositionData) => {
    graph.getNodes().forEach((node) => {
      const id = node.getId();
      if (id in data) {
        node.setPosition(data[id]);
      }
    });
  };

  public static applyRenderingConfigToGraph = (
    graph: Graph,
    config: RenderingConfig
  ): void => {
    const data = toDisplayManagerData(config);
    this.applyDisplayConfigToGraph(graph, data);
  };

  public static applyColors = (
    entities: EntitiesContainer<any, any>,
    colors: { [key: string]: string },
    mode: "type" | "tag"
  ): void => {
    entities.forEach((entity) => {
      const key =
        mode === "type" ? entity.getType() : [...entity.getTags(), ""][0];
      if (key in colors) {
        entity.setColor(colors[key]);
      } else {
        entity.setColor(DEFAULT_DISPLAY_NODE_DATA.color);
      }
    });
  };

  public static applyVisibility = (
    entities: EntitiesContainer<any, any>,
    visibility: { [key: string]: boolean },
    mode: "type" | "tag"
  ): void => {
    entities.forEach((entity) => {
      const key =
        mode === "type" ? entity.getType() : [...entity.getTags(), ""][0];
      if (key in visibility) {
        entity.setVisibility(visibility[key]);
      }
    });
  };

  static applyVisibilityFromFilterRulesToGraph(
    graph: Graph,
    filterRules: FilterRuleDefinition[]
  ) {
    const nodesThatAreVisible = filterNodes(
      graph.getNodes().toArray(),
      filterRules
    );
    const visibleNodeIds = new Set(
      nodesThatAreVisible.map((node) => node.getId())
    );

    graph.getNodes().forEach((node) => {
      node.setVisibility(visibleNodeIds.has(node.getId()));
    });
  }

  static setOnlyNodesVisible(graph: Graph, nodeIds: string[]) {
    const visibleNodeIds = new Set(nodeIds);
    graph.getNodes().forEach((node) => {
      node.setVisibility(visibleNodeIds.has(node.getId()));
    });
  }

  static setAllVisible(graph: Graph) {
    graph.getNodes().forEach((node) => {
      node.setVisibility(true);
    });
  }

  public static applyNodeColors = (
    graph: Graph,
    colors: { [key: string]: string },
    mode: "type" | "tag"
  ): void => {
    DisplayManager.applyColors(graph.getNodes(), colors, mode);
  };

  public static applyEdgeColors = (
    graph: Graph,
    colors: { [key: string]: string },
    mode: "type" | "tag"
  ): void => {
    DisplayManager.applyColors(graph.getEdges(), colors, mode);
  };

  public static applyNodeVisibility = (
    graph: Graph,
    visibility: { [key: string]: boolean },
    mode: "type" | "tag"
  ): void => {
    DisplayManager.applyVisibility(graph.getNodes(), visibility, mode);
  };

  public static applyEdgeVisibility = (
    graph: Graph,
    visibility: { [key: string]: boolean },
    mode: "type" | "tag"
  ): void => {
    DisplayManager.applyVisibility(graph.getEdges(), visibility, mode);
  };
}
