import { ObjectOf } from "../../App";
import { AppConfig } from "../../AppConfig";
import { FilterPreset } from "../../components/filters/FilterRuleDefinition";
import {
  CLONE_RENDERING_CONFIG,
  GET_DEFAULT_RENDERING_CONFIG,
  RenderingConfig,
  RenderingManager,
} from "../../controllers/RenderingManager";
import { IForceGraphRenderConfig } from "../../store/forceGraphConfigStore";
import { NodePositionData, Position } from "../layouts/layoutHelpers";
import { EdgeId } from "./Edge";
import { IEntity } from "./entity/abstractEntity";
import { EntityCache } from "./entity/entityCache";
import { EdgesContainer, Graph, NodesContainer } from "./Graph";
import { NodeId } from "./Node";
import { validateSceneGraph } from "./validateSceneGraph";

export interface ISceneGraph {
  getGraph(): Graph;
  getDisplayConfig(): RenderingConfig;
  getColor(entity: IEntity): string;
  getVisibility(entity: IEntity): boolean;
}

export interface ISceneGraphListeners {
  onPositionsChanged?: (positions: NodePositionData) => void;
  onDisplayConfigChanged: (config: RenderingConfig) => void;
  onGraphChanged?: (graph: Graph) => void;
}

export interface ISceneGraphMetadata {
  name?: string;
  description?: string;
  source?: string;
}

export const DEFAULT_SCENE_GRAPH_DATA = (): SceneGraphData => {
  const displayConfig = GET_DEFAULT_RENDERING_CONFIG(new Graph());
  return {
    graph: new Graph(),
    displayConfig: displayConfig,
    forceGraphDisplayConfig: {
      nodeTextLabels: false,
      nodeSize: 3,
      nodeOpacity: 0.7,
      linkTextLabels: false,
      linkWidth: 2,
      linkOpacity: 0.3,
      chargeStrength: -30,
    },
    metadata: {},
    entityCache: new EntityCache(),
    committed_DisplayConfig: CLONE_RENDERING_CONFIG(displayConfig),
  };
};

export type ISceneGraphArgs = Partial<SceneGraphData>;

export type SceneGraphData = {
  graph: Graph;
  displayConfig: RenderingConfig;
  filterPresets?: ObjectOf<FilterPreset>;
  displayConfigPresets?: ObjectOf<RenderingConfig>;
  forceGraphDisplayConfig: IForceGraphRenderConfig;
  metadata: ISceneGraphMetadata;
  entityCache: EntityCache; // for storing additional non-graph entities
  defaultAppConfig?: AppConfig;
  committed_DisplayConfig: RenderingConfig;
};

export class SceneGraph {
  private data: SceneGraphData;
  private listeners: ISceneGraphListeners | undefined;
  constructor(data?: ISceneGraphArgs, listeners?: ISceneGraphListeners) {
    this.data = { ...DEFAULT_SCENE_GRAPH_DATA(), ...data };
    if (data) {
      if (data.displayConfig) {
        this.data.displayConfig = data.displayConfig;
      } else {
        this.data.displayConfig = GET_DEFAULT_RENDERING_CONFIG(this.data.graph);
        this.data.committed_DisplayConfig = CLONE_RENDERING_CONFIG(
          this.data.displayConfig
        );
      }
    }
    validateSceneGraph(this);
    this.getNodes().validate();
    this.getEdges().validate();
    this.listeners = listeners;

    const isEmpty =
      this.getNodes().isEmpty() &&
      this.getEdges().isEmpty() &&
      data?.metadata?.name === undefined;
    if (!isEmpty) {
      console.log("Constructed SceneGraph", data?.metadata);
    }
  }

  getCommittedDisplayConfig() {
    return this.data.committed_DisplayConfig;
  }

  commitDisplayConfig() {
    this.data.committed_DisplayConfig = this.data.displayConfig;
  }

  bindListeners(listeners: ISceneGraphListeners) {
    this.listeners = listeners;
  }

  notifyDisplayConfigChanged() {
    this.listeners?.onDisplayConfigChanged(this.data.displayConfig);
  }

  notifyGraphChanged() {
    this.listeners?.onGraphChanged?.(this.data.graph);
  }

  getData() {
    return this.data;
  }

  getEntityCache() {
    return this.data.entityCache;
  }

  getMetadata(): ISceneGraphMetadata {
    return this.data.metadata;
  }

  setMetadata(data: ISceneGraphMetadata) {
    this.data.metadata = data;
  }

  getForceGraphRenderConfig() {
    return this.data.forceGraphDisplayConfig;
  }

  setForceGraphRenderConfig(config: IForceGraphRenderConfig) {
    this.data.forceGraphDisplayConfig = config;
  }

  getGraph(): Graph {
    return this.data.graph;
  }

  getNodes(): NodesContainer {
    return this.data.graph.getNodes();
  }

  getEdges(): EdgesContainer {
    return this.data.graph.getEdges();
  }

  getNodeById(id: NodeId) {
    return this.data.graph.getNodes().get(id);
  }

  getEdgeById(id: EdgeId) {
    return this.data.graph.getEdges().get(id);
  }

  getEdgeByNodes(source: NodeId, target: NodeId) {
    return this.data.graph.getEdges().get(`${source}:::${target}` as EdgeId);
  }

  getDisplayConfig(): RenderingConfig {
    return this.data.displayConfig;
  }

  setDisplayConfig(config: RenderingConfig) {
    this.data.displayConfig = config;
  }

  getNodePositions() {
    return this.data.displayConfig.nodePositions;
  }

  setNodePositions(positions: NodePositionData) {
    this.data.displayConfig.nodePositions = positions;
    this.listeners?.onPositionsChanged?.(positions);
  }

  getNode(nodeId: NodeId) {
    return this.data.graph.getNode(nodeId);
  }

  getEdgeByNodeIds(sourceId: NodeId, targetId: NodeId) {
    return this.data.graph.getEdge(`${sourceId}-${targetId}` as EdgeId);
  }

  getNodePosition(nodeId: NodeId): Position | undefined {
    return this.data.displayConfig?.nodePositions?.[nodeId];
  }

  // Todo: precache this, make it afap.
  getColor(entity: IEntity): string {
    if (entity.getEntityType() === "node") {
      if (this.data.displayConfig.mode === "type") {
        return RenderingManager.getColorByType(
          entity,
          this.data.displayConfig.nodeConfig.types
        );
      } else if (this.data.displayConfig.mode === "tag") {
        return RenderingManager.getColorByTag(
          entity,
          this.data.displayConfig.nodeConfig.tags
        );
      }
    } else if (entity.getEntityType() === "edge") {
      if (this.data.displayConfig.mode === "type") {
        return RenderingManager.getColorByType(
          entity,
          this.data.displayConfig.edgeConfig.types
        );
      } else if (this.data.displayConfig.mode === "tag") {
        return RenderingManager.getColorByTag(
          entity,
          this.data.displayConfig.edgeConfig.tags
        );
      }
    }
    throw new Error(
      "Invalid arguments provided: " +
        entity.getEntityType() +
        ", " +
        this.data.displayConfig.mode
    );
  }

  // Cursed bulk of code
  getVisibility(entity: IEntity): boolean {
    if (entity.getEntityType() === "node") {
      if (this.data.displayConfig.mode === "type") {
        return RenderingManager.getVisibilityByType(
          entity,
          this.data.displayConfig.nodeConfig.types
        );
      } else if (this.data.displayConfig.mode === "tag") {
        return RenderingManager.getVisibilityByTag(
          entity,
          this.data.displayConfig.nodeConfig.tags
        );
      }
    } else if (entity.getEntityType() === "edge") {
      if (this.data.displayConfig.mode === "type") {
        return RenderingManager.getVisibilityByType(
          entity,
          this.data.displayConfig.edgeConfig.types
        );
      } else if (this.data.displayConfig.mode === "tag") {
        return RenderingManager.getVisibilityByTag(
          entity,
          this.data.displayConfig.edgeConfig.tags
        );
      }
    }
    throw new Error(
      "Invalid arguments provided: " +
        entity.getEntityType() +
        ", " +
        this.data.displayConfig.mode
    );
  }

  saveFilterPreset(name: string, preset: FilterPreset) {
    if (!this.data.filterPresets) {
      this.data.filterPresets = {};
    }
    this.data.filterPresets[name] = preset;
  }

  getFilterPresets() {
    return this.data.filterPresets || {};
  }

  public static fromJSON(json: string): SceneGraph {
    const data = JSON.parse(json);
    console.log(data);
    return new SceneGraph(data);
  }
}
