import { GraphEntityType } from "../components/common/GraphSearch";
import { NodePositionData } from "../core/layouts/layoutHelpers";
import { Edge } from "../core/model/Edge";
import { IEntity } from "../core/model/entity/abstractEntity";
import { Graph } from "../core/model/Graph";
import { getGraphMetadata } from "../core/model/GraphBuilder";
import { Node } from "../core/model/Node";
import { getRandomColorFromPalette } from "../utils/colorUtils";

export type Position = {
  x: number;
  y: number;
};

type DisplayConfigData = {
  color: string;
  isVisible: boolean;
};

export type DisplayConfig = { [key: string]: DisplayConfigData };

export type EntitiesDisplayConfig = {
  types: DisplayConfig;
  tags: DisplayConfig;
};

export type RenderingConfig = {
  nodeConfig: EntitiesDisplayConfig;
  edgeConfig: EntitiesDisplayConfig;
  mode: RenderingManager__DisplayMode;
  nodePositions?: NodePositionData; // a cache of node position data from a layout computation
  svg?: string;
};

export const CLONE_RENDERING_CONFIG = (
  config: RenderingConfig
): RenderingConfig => {
  return structuredClone(config);
};

export type RenderingManager__DisplayMode = "tag" | "type";

export const GET_DEFAULT_RENDERING_CONFIG = (
  graph: Graph,
  starterConfig?: RenderingConfig
): RenderingConfig => {
  const metadata = getGraphMetadata(graph);
  const palette = "gentle";

  const nodeTypeConfig: DisplayConfig = starterConfig?.nodeConfig.types ?? {};
  const nodeTagConfig: DisplayConfig = starterConfig?.nodeConfig.tags ?? {};
  const edgeTypeConfig: DisplayConfig = starterConfig?.edgeConfig.types ?? {};
  const edgeTagConfig: DisplayConfig = starterConfig?.edgeConfig.tags ?? {};
  for (const tag of metadata.nodes.tags) {
    if (!nodeTagConfig[tag]) {
      nodeTagConfig[tag] = {
        color: getRandomColorFromPalette(palette),
        isVisible: true,
      };
    }
  }

  for (const tag of metadata.edges.tags) {
    if (!edgeTagConfig[tag]) {
      edgeTagConfig[tag] = {
        color: getRandomColorFromPalette(palette),
        isVisible: true,
      };
    }
  }

  for (const type of metadata.nodes.types) {
    if (!nodeTypeConfig[type]) {
      nodeTypeConfig[type] = {
        color: getRandomColorFromPalette(palette),
        isVisible: true,
      };
    }
  }

  for (const type of metadata.edges.types) {
    if (!edgeTypeConfig[type]) {
      edgeTypeConfig[type] = {
        color: getRandomColorFromPalette(palette),
        isVisible: true,
      };
    }
  }

  return {
    nodeConfig: { types: nodeTypeConfig, tags: nodeTagConfig },
    edgeConfig: { types: edgeTypeConfig, tags: edgeTagConfig },
    mode: "type",
  };
};

export class RenderingManager {
  private config: RenderingConfig;

  constructor(config: RenderingConfig) {
    this.config = config;
  }

  public static getColorByKeysSimple = (
    keys: string[],
    config: DisplayConfig
  ) => {
    for (const tag of keys) {
      if (tag in config) {
        return config[tag].color;
      }
    }
    if (keys.length > 0) {
      throw new Error(
        `No color found for tags :${keys}:, ${JSON.stringify(config)}`
      );
    }
    return "grey"; // Default color if no tag matches
  };

  public static getColorByKeySimple = (
    key: string,
    config: DisplayConfig,
    strict: boolean = false
  ): string => {
    if (key in config) {
      return config[key].color;
    }
    if (strict) {
      throw new Error(`No color found for tag: ${key}`);
    }
    return "grey"; // Default color if no tag matches
  };

  public static getColorByTag = (
    entity: IEntity,
    config: DisplayConfig
  ): string => {
    for (const tag of entity.getTags()) {
      if (tag in config) {
        return config[tag].color;
      }
    }
    return "grey"; // Default color if no tag matches
  };

  public static getColorByType = (
    entity: IEntity,
    config: DisplayConfig
  ): string => {
    if (entity.getType() in config) {
      return config[entity.getType()].color;
    }
    return "grey"; // Default color if no tag matches
  };

  public static getColor(
    entity: IEntity,
    config: DisplayConfig,
    mode: "tag" | "type" = "type"
  ): string {
    if (mode === "type") {
      return this.getColorByType(entity, config);
    } else {
      return this.getColorByTag(entity, config);
    }
  }

  public static getVisibilityByTag = (
    entity: IEntity,
    config: DisplayConfig
  ): boolean => {
    for (const tag of entity.getTags()) {
      if (tag in config) {
        return config[tag].isVisible;
      }
    }
    if (entity.getTags().size > 0) {
      return false;
    }
    return true; // Default color if no tag matches
  };

  public static getVisibilityByType = (
    entity: IEntity,
    config: DisplayConfig
  ): boolean => {
    if (entity.getType() in config) {
      return config[entity.getType()].isVisible;
    }
    return true;
  };

  public static getVisibility(
    entity: IEntity,
    config: DisplayConfig,
    mode: RenderingManager__DisplayMode = "type"
  ): boolean {
    if (mode === "type") {
      return this.getVisibilityByType(entity, config);
    } else {
      return this.getVisibilityByTag(entity, config);
    }
  }

  getDisplayConfig(
    entityType: GraphEntityType,
    mode?: RenderingManager__DisplayMode
  ): DisplayConfig {
    const retMode = mode ?? this.config.mode;
    if (entityType === "Node") {
      return retMode === "type"
        ? this.config.nodeConfig.types
        : this.config.nodeConfig.tags;
    } else {
      return retMode === "type"
        ? this.config.edgeConfig.types
        : this.config.edgeConfig.tags;
    }
  }

  setDisplayConfig(
    mode: RenderingManager__DisplayMode,
    entityType: GraphEntityType,
    config: DisplayConfig
  ): void {
    if (entityType === "Node") {
      if (mode === "type") {
        this.config.nodeConfig.types = config;
      } else {
        this.config.nodeConfig.tags = config;
      }
    } else {
      if (mode === "type") {
        this.config.edgeConfig.types = config;
      } else {
        this.config.edgeConfig.tags = config;
      }
    }
  }

  getNodeColor(node: Node): string {
    return RenderingManager.getColor(
      node,
      this.getDisplayConfig("Node", this.config.mode),
      this.config.mode
    );
  }

  getEdgeColor(edge: Edge): string {
    return RenderingManager.getColor(
      edge,
      this.getDisplayConfig("Edge", this.config.mode),
      this.config.mode
    );
  }

  getNodeIsVisible(node: Node): boolean {
    return RenderingManager.getVisibility(
      node,
      this.getDisplayConfig("Node", this.config.mode),
      this.config.mode
    );
  }

  getEdgeIsVisibleByTag(edge: Edge, graph: Graph): boolean {
    if (
      !this.getNodeIsVisible(graph.getNode(edge.getSource())) ||
      !this.getNodeIsVisible(graph.getNode(edge.getTarget()))
    ) {
      return false;
    }
    const displayConfig = this.getDisplayConfig("Edge", "tag");
    if (Object.keys(displayConfig).length === 0) {
      return true;
    }
    for (const tag of edge.getTags()) {
      if (tag in displayConfig) {
        return displayConfig[tag].isVisible;
      }
    }
    if (edge.getTags().size > 0) {
      return false;
    }
    return true;
  }

  getEdgeIsVisibleByType(edge: Edge, graph: Graph): boolean {
    if (this.config.edgeConfig.types[edge.getType()]) {
      if (!this.config.edgeConfig.types[edge.getType()].isVisible) {
        return false;
      }
      return (
        this.getNodeIsVisible(graph.getNode(edge.getSource())) &&
        this.getNodeIsVisible(graph.getNode(edge.getTarget()))
      );
    }
    const displayConfig = this.getDisplayConfig("Edge", "type");
    if (Object.keys(displayConfig).length === 0) {
      return true;
    }
    return false;
  }

  getEdgeIsVisible(edge: Edge, graph: Graph): boolean {
    if (this.config.mode === "tag") {
      return this.getEdgeIsVisibleByTag(edge, graph);
    } else {
      return this.getEdgeIsVisibleByType(edge, graph);
    }
  }

  getConfig(): RenderingConfig {
    return this.config;
  }
}
