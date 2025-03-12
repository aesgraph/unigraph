import { ForceGraph3DInstance } from "3d-force-graph";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import { AppConfig } from "../../AppConfig";
import { NodePositionData } from "../layouts/layoutHelpers";
import { NodeId } from "../model/Node";
import { SceneGraph } from "../model/SceneGraph";
import { createForceGraph, IForceGraphRenderConfig } from "./createForceGraph";

export interface IForceGraphEventHandlers {
  onNodeHovered?: (node: NodeId | null) => void;
  onNodeClicked?: (node: NodeId | null) => void;
  onNodeRightClick?: (event: MouseEvent, nodeId: string | null) => void;
}

export interface IForceGraphInstanceController {
  //   setNodeColors: (node: Node) => string;
  //   setEdgeColors: (edge: Edge) => string;
  setBackgroundColor: (color: string) => void;
  initializeInstance: (
    dom: HTMLElement,
    appConfig?: AppConfig
  ) => ForceGraph3DInstance;
  applyFixedLayout: (positions: NodePositionData) => void;
  applyConfigToForceGraph: (config: IForceGraphRenderConfig) => void;
  bindEventsToGraphInstance(eventHandlers: IForceGraphEventHandlers): void;
}

export interface IForceGraphNode {
  id: string | NodeId;
  color: string;
  position: { x: number; y: number; z?: number };
  data: { label: string; color: string };
}

export interface IForceGraphEdge {
  id: string;
  source: string;
  target: string;
  color: string;
}

export class ForceGraphInstanceController
  implements IForceGraphInstanceController
{
  private sceneGraph: SceneGraph;
  private forceGraphInstance: ForceGraph3DInstance | null = null;

  constructor(sceneGraph: SceneGraph, dom?: HTMLElement) {
    this.sceneGraph = sceneGraph;
  }

  bindEventsToGraphInstance(eventHandlers: IForceGraphEventHandlers): void {
    const instance = this.getInstance();
    instance.onNodeHover((node) => {
      eventHandlers.onNodeHovered?.(node ? (node.id as NodeId) : null);
    });
    instance.onNodeClick((node) => {
      eventHandlers.onNodeClicked?.(node ? (node.id as NodeId) : null);
    });
    if (eventHandlers.onNodeRightClick) {
      instance.onNodeRightClick((node, event) => {
        eventHandlers.onNodeRightClick?.(
          event,
          node ? (node.id as NodeId) : null
        );
      });
    }
  }

  //   private _toForceGraphObjects(): {
  //     nodes: IForceGraphNode[];
  //     edges: IForceGraphEdge[];
  //   } {
  //     const renderingManager = this.sceneGraph.getRenderingManager();
  //     const nodes = this.sceneGraph
  //       .getGraph()
  //       .getNodes()
  //       .map((node) => ({
  //         id: node.getId(),
  //         color: renderingManager.getNodeColor(node), //@todo: check the double color assignment
  //         position: this.sceneGraph.getNodePosition(node.getId()),
  //         data: {
  //           label: node.getId(),
  //           color: renderingManager.getNodeColor(node),
  //         },
  //       }));
  //     const edges = this.sceneGraph
  //       .getGraph()
  //       .getEdges()
  //       .map((edge) => ({
  //         id: edge.getId(),
  //         source: edge.getSource(),
  //         target: edge.getTarget(),
  //         color: renderingManager.getEdgeColor(edge),
  //       }));
  //     return { nodes, edges };
  //   }

  initializeInstance(
    dom: HTMLElement,
    appConfig?: AppConfig
  ): ForceGraph3DInstance {
    this.forceGraphInstance = createForceGraph(
      this.sceneGraph,
      dom,
      this.sceneGraph.getNodePositions(),
      this.sceneGraph.getForceGraphRenderConfig(),
      appConfig?.forceGraph3dOptions.layout
    );
    return this.forceGraphInstance;
  }

  getInstance(): ForceGraph3DInstance {
    if (!this.forceGraphInstance) {
      throw new Error("ForceGraphInstanceController not initialized");
    }
    return this.forceGraphInstance;
  }

  applyFixedLayout(positions: NodePositionData): void {
    this.getInstance()
      .graphData()
      .nodes.forEach((node: any) => {
        if (positions[node.id]) {
          node.fx = positions[node.id].x;
          node.fy = positions[node.id].y;
          node.fz = positions[node.id].z ?? 0;
        }
      });
    this.getInstance().refresh();
  }

  applyConfigToForceGraph = (config: IForceGraphRenderConfig) => {
    this.getInstance().nodeRelSize(config.nodeSize);
    this.getInstance().linkWidth(config.linkWidth);
    this.getInstance().nodeOpacity(config.nodeOpacity);
    this.getInstance().linkOpacity(config.linkOpacity);
    const renderingManager = this.sceneGraph.getRenderingManager();

    // Update nodeColor configuration to respect the current rendering mode
    this.getInstance().nodeColor((node) => {
      if (this.sceneGraph.getAppState().hoveredNodes.has(node.id as string)) {
        return "rgb(242, 254, 9)";
      }
      return this.sceneGraph.getNodeColorById(node.id as NodeId);
    });

    this.getInstance().nodeThreeObject((node) => {
      const nodeEl = document.createElement("div");
      if (config.nodeTextLabels) {
        nodeEl.textContent = `${node.id}` as string;
        nodeEl.className = "node-label";
      }
      nodeEl.style.color = this.sceneGraph.getNodeColorById(node.id as NodeId);
      return new CSS2DObject(nodeEl);
    });
    this.getInstance().nodeThreeObjectExtend(true);
  };

  setBackgroundColor(color: string): void {
    this.getInstance().backgroundColor(color);
  }

  setHighlightedNodes(nodeIds: NodeId[]): void {
    const renderingManager = this.sceneGraph.getRenderingManager();
    this.getInstance().nodeColor((node) => {
      if (nodeIds.includes(node.id as NodeId)) {
        return "rgb(242, 254, 9)";
      }
      return this.sceneGraph.getNodeColorById(node.id as NodeId);
    });
  }
}
