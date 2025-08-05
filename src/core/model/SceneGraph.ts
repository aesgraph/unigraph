import { WorkspaceState } from "@aesgraph/app-shell";
import { AppConfig, DEFAULT_APP_CONFIG } from "../../AppConfig";
import {
  CLONE_RENDERING_CONFIG,
  GET_DEFAULT_RENDERING_CONFIG,
  RenderingConfig,
  RenderingManager,
} from "../../controllers/RenderingManager";
import { Filter } from "../../store/activeFilterStore";
import { Layout } from "../../store/activeLayoutStore";
import { DocumentState } from "../../store/documentStore";
import { IForceGraphRenderConfig } from "../../store/forceGraphConfigStore";
import { NodePositionData, Position } from "../layouts/layoutHelpers";
import { ObjectOf } from "./../../App";
import { Edge, EdgeId } from "./Edge";
import { IEntity } from "./entity/abstractEntity";
import { EntityCache } from "./entity/entityCache";
import { EntityIds } from "./entity/entityIds";
import { EdgesContainer, Graph, NodesContainer } from "./Graph";
import { Node, NodeId } from "./Node";
import {
  SceneGraphSerializer,
  SerializedSceneGraph,
} from "./SerializedSceneGraph";
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
  notes?: string;
}

export const DEFAULT_SCENE_GRAPH_DATA = (): SceneGraphData => {
  const graph = new Graph();
  const displayConfig = GET_DEFAULT_RENDERING_CONFIG(graph);
  return {
    graph: graph,
    displayConfig: displayConfig,
    forceGraphDisplayConfig: {
      nodeTextLabels: false,
      nodeSize: 3,
      nodeOpacity: 0.7,
      linkTextLabels: false,
      linkWidth: 2,
      linkOpacity: 0.3,
      chargeStrength: -30,
      backgroundColor: "rgb(0, 0, 0)",
      cameraPosition: { x: 0, y: 0, z: 500 },
      cameraTarget: { x: 0, y: 0, z: 0 },
      initialZoom: 1,
    },
    metadata: {},
    entityCache: new EntityCache(),
    committed_DisplayConfig: CLONE_RENDERING_CONFIG(displayConfig),
    documents: {},
    defaultAppConfig: DEFAULT_APP_CONFIG(),
  };
};

export type ISceneGraphArgs = Partial<SceneGraphData>;

export type SceneGraphData = {
  graph: Graph;
  displayConfig: RenderingConfig;
  savedFilters?: ObjectOf<Filter>;
  savedLayouts?: ObjectOf<Layout>;
  displayConfigPresets?: ObjectOf<RenderingConfig>;
  forceGraphDisplayConfig: IForceGraphRenderConfig;
  metadata: ISceneGraphMetadata;
  entityCache: EntityCache; // for storing additional non-graph entities
  defaultAppConfig?: AppConfig;
  committed_DisplayConfig: RenderingConfig;
  documents: ObjectOf<DocumentState>; // for storing additional documents, by entityId for now
  // current app config
  workspaceState?: WorkspaceState;
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
  }

  refreshDisplayConfig() {
    const newRenderingConfig = GET_DEFAULT_RENDERING_CONFIG(
      this.getGraph(),
      this.getDisplayConfig()
    );
    this.data.displayConfig = newRenderingConfig;
  }

  getCommittedDisplayConfig() {
    return this.data.committed_DisplayConfig;
  }

  saveLayout(layout: Layout) {
    if (!this.data.savedLayouts) {
      this.data.savedLayouts = {};
    }
    this.data.savedLayouts[layout.name] = layout;
  }

  // Improved document handling
  setDocument(storageKey: string, document: DocumentState | null) {
    if (!storageKey) {
      console.error("Cannot set document with empty storageKey");
      return;
    }

    // Validate the document refers to an existing node if it's a NodeId
    if (document && this.data.graph.getNodes().getIds().size > 0) {
      const nodeExists = this.data.graph.getNodes().has(storageKey as NodeId);
      if (!nodeExists) {
        console.warn(
          `Setting document for non-existent node ID: ${storageKey}`
        );
      }
    }

    if (document) {
      this.data.documents[storageKey] = document;
    } else {
      delete this.data.documents[storageKey];
    }
  }

  getDocuments() {
    return this.data.documents;
  }

  getDocument(storageKey: string) {
    return this.data.documents[storageKey];
  }

  // Workspace state management
  getWorkspaceState(): WorkspaceState | undefined {
    return this.data.workspaceState;
  }

  setWorkspaceState(workspaceState: WorkspaceState) {
    this.data.workspaceState = workspaceState;
  }

  clearWorkspaceState() {
    delete this.data.workspaceState;
  }

  // clearDocuments() {
  //   this.data.documents = {};
  // }

  commitDisplayConfig() {
    this.data.committed_DisplayConfig = CLONE_RENDERING_CONFIG(
      this.data.displayConfig
    );
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
    if (!id) {
      console.warn("getNodeById called with undefined or null id");
      return null;
    }

    const node = this.data.graph.getNodes().get(id);
    if (!node) {
      console.debug(`Node with id "${id}" not found in graph`);
    }
    return node;
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

  setNodePosition(nodeId: NodeId, position: Position, notify: boolean = true) {
    if (!this.data.displayConfig.nodePositions) {
      this.data.displayConfig.nodePositions = {};
    }
    this.data.displayConfig.nodePositions[nodeId] = position;
    if (notify) {
      this.listeners?.onPositionsChanged?.(
        this.data.displayConfig.nodePositions
      );
    }
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

  getVisibleNodes(): EntityIds<NodeId> {
    const nodeIds = new EntityIds<NodeId>();
    this.data.graph.getNodes().forEach((node) => {
      if (this.getVisibility(node)) {
        nodeIds.add(node.getId());
      }
    });
    return nodeIds;
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
  getVisibility(entity: Node | Edge): boolean {
    if (!entity.isVisible()) {
      return false;
    }
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

  saveFilter(name: string, filter: Filter) {
    if (!this.data.savedFilters) {
      this.data.savedFilters = {};
    }
    this.data.savedFilters[name] = filter;
  }

  getSavedFilters() {
    return this.data.savedFilters;
  }

  clearFilters() {
    this.data.savedFilters = {};
  }

  getNodesByType(type: string) {
    const nodes = this.getGraph()
      .getNodes()
      .filter((node) => node.getType() === type);

    console.log(`Nodes of type ${type}:`, nodes);
    return nodes;
  }

  // Add validation during SceneGraph loading
  public static fromJSON(json: string): SceneGraph {
    try {
      const data = JSON.parse(json);
      console.log("Loaded SceneGraph data:", data);

      // Validate nodes and documents
      if (data.documents) {
        console.log(
          `SceneGraph has ${Object.keys(data.documents).length} documents`
        );

        // Check for document node references
        for (const docId in data.documents) {
          const nodeExists = data.graph?.nodes?.has?.(docId);
          if (!nodeExists) {
            console.warn(`Document ${docId} refers to a non-existent node`);
          }
        }
      }

      return new SceneGraph(data);
    } catch (error) {
      console.error("Error parsing SceneGraph from JSON:", error);
      return new SceneGraph(); // Return empty graph on error
    }
  }

  /**
   * Convert this SceneGraph to a serializable object suitable for workers
   */
  toSerialized(): SerializedSceneGraph {
    return {
      graph: SceneGraphSerializer.serializeGraph(this.getGraph()),
      displayConfig: this.getDisplayConfig(),
    };
  }

  /**
   * Populate this SceneGraph from serialized data
   */
  fromSerialized(serialized: SerializedSceneGraph): void {
    const graph = this.getGraph();

    // Clear existing graph
    graph.getNodes().clear();
    graph.getEdges().clear();

    // Add nodes from serialized data
    serialized.graph.nodes.forEach((nodeData) => {
      graph.createNode({
        id: nodeData.id,
        label: nodeData.label,
        type: nodeData.type,
        position: nodeData.position,
        ...nodeData.data,
      });
    });

    // Add edges from serialized data
    serialized.graph.edges.forEach((edgeData) => {
      graph.createEdge(edgeData.source, edgeData.target, {
        id: edgeData.id,
        label: edgeData.label,
        type: edgeData.type,
        ...edgeData.data,
      });
    });

    // Set display config if provided
    if (serialized.displayConfig) {
      this.setDisplayConfig(serialized.displayConfig);
    }
  }
}
