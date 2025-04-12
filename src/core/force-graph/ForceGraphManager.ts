import { ForceGraph3DInstance } from "3d-force-graph";
import { Sprite, SpriteMaterial, SRGBColorSpace, TextureLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import { ForceGraph3dLayoutMode } from "../../AppConfig";
import { RenderingManager } from "../../controllers/RenderingManager";
import {
  getEdgeLegendConfig,
  getNodeLegendConfig,
} from "../../store/activeLegendConfigStore";
import { getLegendMode } from "../../store/appConfigStore";
import { IForceGraphRenderConfig } from "../../store/forceGraphConfigStore";
import {
  getHoveredEdgeIds,
  getHoveredNodeIds,
  getSelectedNodeId,
  getSelectedNodeIds,
} from "../../store/graphInteractionStore";
import { getMouseControlMode } from "../../store/mouseControlsStore";
import { NodePositionData } from "../layouts/layoutHelpers";
import { EntityIds } from "../model/entity/entityIds";
import { NodeId } from "../model/Node";
import { SceneGraph } from "../model/SceneGraph";
import { ImageBoxData } from "../types/ImageBoxData";
import { reconstructImageSource } from "../utils/imageProcessing";
import {
  MOUSE_HOVERED_NODE_COLOR,
  SELECTED_NODE_COLOR,
} from "./createForceGraph";
import { updateVisibleEntitiesInForceGraphInstance } from "./forceGraphHelpers";

export class ForceGraphManager {
  public static getNodes = (
    nodeIds: EntityIds<NodeId>,
    forceGraphInstance: ForceGraph3DInstance
  ) => {
    const nodes: any = [];
    forceGraphInstance.graphData().nodes.forEach((node: any) => {
      if (nodeIds.has(node.id)) {
        nodes.push(node);
      }
    });
    return nodes;
  };

  // This function should NOT trigger a simulation restart. Avoid this
  public static refreshForceGraphInstance = (
    forceGraphInstance: ForceGraph3DInstance,
    sceneGraph: SceneGraph,
    layout: ForceGraph3dLayoutMode = "Physics",
    layoutPositions?: NodePositionData
  ) => {
    console.log("Refreshing existing force graph instance...");

    // Update visible nodes and edges (with smart position handling)
    updateVisibleEntitiesInForceGraphInstance(
      forceGraphInstance,
      sceneGraph,
      layout,
      layoutPositions
    );

    // Apply current mouse control mode
    const controlMode = getMouseControlMode();
    ForceGraphManager.updateMouseControlMode(forceGraphInstance, controlMode);

    forceGraphInstance.nodeColor((node) => {
      if (getHoveredNodeIds().has(node.id as NodeId)) {
        return MOUSE_HOVERED_NODE_COLOR;
      }
      if (
        getSelectedNodeId() === node.id ||
        getSelectedNodeIds().has(node.id as NodeId)
      ) {
        return SELECTED_NODE_COLOR;
      }
      return RenderingManager.getColor(
        sceneGraph.getGraph().getNode(node.id as NodeId),
        getNodeLegendConfig(),
        getLegendMode()
      );
    });

    forceGraphInstance.linkColor((link) => {
      if (
        getHoveredNodeIds().has((link.source as any).id) ||
        getHoveredNodeIds().has((link.target as any).id)
      ) {
        return "yellow";
      }
      if (getHoveredEdgeIds().has((link as any).id)) {
        return "white";
      }
      return RenderingManager.getColor(
        sceneGraph.getGraph().getEdge((link as any).id),
        getEdgeLegendConfig(),
        getLegendMode()
      );
    });

    ForceGraphManager.applyForceGraphRenderConfig(
      forceGraphInstance,
      sceneGraph.getForceGraphRenderConfig(),
      sceneGraph
    );

    if (layout === "Layout" && sceneGraph.getDisplayConfig().nodePositions) {
      ForceGraphManager.applyFixedNodePositions(
        forceGraphInstance,
        sceneGraph.getDisplayConfig().nodePositions!
      );
    }
  };

  // Add a method to update mouse control mode
  public static updateMouseControlMode = (
    forceGraphInstance: ForceGraph3DInstance,
    mode: "orbital" | "multiselection"
  ) => {
    if (forceGraphInstance) {
      // Enable/disable node dragging based on mode
      // forceGraphInstance.enableNodeDrag(mode === "orbital");

      const controls = forceGraphInstance.controls() as OrbitControls;
      if (controls) {
        if (mode === "multiselection") {
          controls.enableRotate = false;
          controls.rotateSpeed = 0;
        } else {
          controls.enableRotate = true;
          controls.rotateSpeed = 1;
        }

        controls.update();
      }
    }
  };

  /** Assign fx, fy, fz from a layout result */
  public static applyFixedNodePositions = (
    forceGraph3dInstance: ForceGraph3DInstance,
    positions: NodePositionData
  ) => {
    const nodes = forceGraph3dInstance.graphData().nodes;
    nodes.forEach((node: any) => {
      if (positions[node.id]) {
        node.fx = positions[node.id].x;
        node.fy = -positions[node.id].y;
        node.fz = positions[node.id].z ?? 0;
      }
    });
  };

  public static updateNodePositions = (
    forceGraph3dInstance: ForceGraph3DInstance,
    positions: NodePositionData
  ) => {
    const nodes = forceGraph3dInstance.graphData().nodes;
    nodes.forEach((node: any) => {
      if (positions[node.id]) {
        node.x = positions[node.id].x;
        node.y = positions[node.id].y;
        node.z = positions[node.id].z ?? 0;
        node.fx = node.x;
        node.fy = node.y;
        node.fz = node.z;
      }
    });

    forceGraph3dInstance.refresh();
  };

  public static applyForceGraphRenderConfig(
    instance: ForceGraph3DInstance,
    config: IForceGraphRenderConfig,
    sceneGraph: SceneGraph,
    reheatSimulation: boolean = false
  ): void {
    instance.nodeRelSize(config.nodeSize);
    instance.linkWidth(config.linkWidth);
    instance.nodeOpacity(config.nodeOpacity);
    instance.linkOpacity(config.linkOpacity);

    instance.nodeThreeObject((node) => {
      const n = sceneGraph.getGraph().getNode(node.id as NodeId);

      // Handle regular images
      const imageUrl = n.maybeGetUserData("imageUrl") as string | undefined;
      if (n.getType() === "image" && imageUrl) {
        const texture = new TextureLoader().load(imageUrl);
        texture.colorSpace = SRGBColorSpace;
        const material = new SpriteMaterial({ map: texture });
        const sprite = new Sprite(material);
        sprite.scale.set(30, 20, 20);
        return sprite;
      }

      // Handle image boxes
      const imageBoxData = n.getAllUserData() as ImageBoxData | undefined;
      if (n.getType() === "imageBox" && imageBoxData) {
        const container = document.createElement("div");
        container.className = "node-label";
        container.style.width = "120px";
        container.style.background = "white";
        container.style.padding = "8px";
        container.style.borderRadius = "4px";

        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        canvas.style.marginBottom = "8px";
        canvas.width = 120; // Set initial size
        canvas.height = 90; // Maintain 4:3 ratio

        // Create and append title
        const title = document.createElement("div");
        title.textContent = imageBoxData.label;
        title.style.fontWeight = "bold";
        title.style.marginBottom = "4px";

        container.appendChild(title);
        container.appendChild(canvas);

        // Load and draw the image
        reconstructImageSource(imageBoxData.imageUrl, imageBoxData).then(
          (imageSource) => {
            if (!imageSource) return;

            // Calculate aspect ratio
            const aspectRatio = imageSource.width / imageSource.height;
            const displayWidth = 120;
            const displayHeight = displayWidth / aspectRatio;

            // Update canvas size
            canvas.width = imageSource.width;
            canvas.height = imageSource.height;
            canvas.style.width = `${displayWidth}px`;
            canvas.style.height = `${displayHeight}px`;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.putImageData(imageSource, 0, 0);
          }
        );

        return new CSS2DObject(container);
      }

      // Default node rendering
      const nodeEl = document.createElement("div");
      if (config.nodeTextLabels) {
        nodeEl.textContent = `${n.getLabel()}` as string;
        nodeEl.className = "node-label";
      }
      nodeEl.style.color = RenderingManager.getColor(
        n,
        getNodeLegendConfig(),
        getLegendMode()
      );
      return new CSS2DObject(nodeEl);
    });
    instance.nodeThreeObjectExtend(true);

    instance.linkThreeObject((link) => {
      const e = sceneGraph.getGraph().getEdge((link as any).id);
      const linkEl = document.createElement("div");
      if (config.linkTextLabels) {
        linkEl.textContent = e.getType();
        linkEl.className = "link-label";
      }
      linkEl.style.color = RenderingManager.getColor(
        e,
        getEdgeLegendConfig(),
        getLegendMode()
      );
      return new CSS2DObject(linkEl);
    });
    instance.linkPositionUpdate((sprite, { start, end }) => {
      if (!sprite) {
        return;
      }
      const middlePos = {
        x: start.x + (end.x - start.x) / 2,
        y: start.y + (end.y - start.y) / 2,
        z: start.z + (end.z - start.z) / 2,
      };
      // Position sprite
      Object.assign(sprite.position, middlePos);
    });
    instance.linkThreeObjectExtend(true);

    if (
      reheatSimulation &&
      sceneGraph.getForceGraphRenderConfig().chargeStrength !==
        config.chargeStrength
    ) {
      instance.d3Force("charge")?.strength(config.chargeStrength);
      instance.d3ReheatSimulation();
    }

    sceneGraph.setForceGraphRenderConfig(config);
  }
}
