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
import { Node, NodeId } from "../model/Node";
import { SceneGraph } from "../model/SceneGraph";
import { ImageBoxData } from "../types/ImageBoxData";
import { reconstructImageSource } from "../utils/imageProcessing";
import {
  MOUSE_HOVERED_NODE_COLOR,
  SELECTED_NODE_COLOR,
} from "./createForceGraph";
import { updateVisibleEntitiesInForceGraphInstance } from "./forceGraphHelpers";

export class ForceGraphManager {
  // Helper functions for node rendering
  private static createImageSprite(imageUrl: string): Sprite {
    const texture = new TextureLoader().load(imageUrl);
    texture.colorSpace = SRGBColorSpace;
    const material = new SpriteMaterial({ map: texture });
    const sprite = new Sprite(material);
    sprite.scale.set(30, 20, 20);
    return sprite;
  }

  private static createImageBoxElement(
    imageBoxData: ImageBoxData
  ): HTMLDivElement {
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

    return container;
  }

  private static createShapeElement(
    n: Node,
    shape: string,
    config: IForceGraphRenderConfig
  ): HTMLDivElement {
    const nodeEl = document.createElement("div");
    nodeEl.style.display = "flex";
    nodeEl.style.alignItems = "center";
    nodeEl.style.justifyContent = "center";
    nodeEl.className = "node-shape";

    // Get dimensions from node data if defined, otherwise use config-based size
    let width: string;
    let height: string;

    const dimensions = n.getDimensions();
    if (dimensions) {
      // Use dimensions from node data, scaled by node size for consistency
      width = `${dimensions.width * config.nodeSize}px`;
      height = `${dimensions.height * config.nodeSize}px`;
    } else {
      // Fall back to standard size calculation
      const shapeSize = `${config.nodeSize * 8}px`;
      width = shapeSize;
      height = shapeSize;
    }

    const nodeColor = RenderingManager.getColor(
      n,
      getNodeLegendConfig(),
      getLegendMode()
    );

    // Get border properties if they exist
    const borderWidth = n.getData().borderWidth as number | undefined;
    const borderColor = n.getData().borderColor as string | undefined;

    // Apply base styles to the node element - now using dimensions
    nodeEl.style.width = width;
    nodeEl.style.height = height;

    switch (shape.toLowerCase()) {
      case "square":
      case "rect":
      case "rectangle":
        // Apply background first
        nodeEl.style.background = nodeColor;

        // Apply border - must come AFTER setting background
        if (borderWidth) {
          nodeEl.style.border = `${borderWidth}px solid ${borderColor || "rgb(255, 197, 6)"}`;
        }
        break;

      case "circle":
        nodeEl.style.borderRadius = "50%";
        nodeEl.style.background = nodeColor;

        // Apply border - must come AFTER setting background and borderRadius
        if (borderWidth) {
          nodeEl.style.border = `${borderWidth}px solid ${borderColor || "rgb(255, 197, 6)"}`;
        }
        break;

      case "triangle": {
        // For triangle, we use a different approach with borders
        nodeEl.style.width = "0";
        nodeEl.style.height = "0";
        const borderSize = `${config.nodeSize * 5}px`;

        // For triangles, we need a different approach for the border
        if (borderWidth && borderColor) {
          // Create a triangle with the border color as background
          // and a slightly smaller triangle with the fill color inside
          nodeEl.style.position = "relative";
          nodeEl.style.borderLeft = borderSize + " solid transparent";
          nodeEl.style.borderRight = borderSize + " solid transparent";
          nodeEl.style.borderBottom = borderSize + " solid " + borderColor;

          const innerTriangle = document.createElement("div");
          const innerSize = config.nodeSize * 5 - borderWidth;
          innerTriangle.style.position = "absolute";
          innerTriangle.style.left = `${-innerSize}px`;
          innerTriangle.style.top = `${borderWidth}px`;
          innerTriangle.style.width = "0";
          innerTriangle.style.height = "0";
          innerTriangle.style.borderLeft = `${innerSize}px solid transparent`;
          innerTriangle.style.borderRight = `${innerSize}px solid transparent`;
          innerTriangle.style.borderBottom = `${innerSize}px solid ${nodeColor}`;

          nodeEl.appendChild(innerTriangle);
        } else {
          // Standard triangle without border
          nodeEl.style.borderLeft = borderSize + " solid transparent";
          nodeEl.style.borderRight = borderSize + " solid transparent";
          nodeEl.style.borderBottom = borderSize + " solid " + nodeColor;
        }
        break;
      }

      case "diamond":
        nodeEl.style.width = width;
        nodeEl.style.height = height;
        nodeEl.style.background = nodeColor;
        nodeEl.style.transform = "rotate(45deg)";
        break;

      // Add more shapes as needed
    }

    return nodeEl;
  }

  private static createLabelElement(
    n: Node,
    config: IForceGraphRenderConfig,
    isForShape: boolean = false
  ): HTMLElement {
    const element = isForShape
      ? document.createElement("span")
      : document.createElement("div");
    element.textContent = `${n.getLabel()}`;

    // Style differently based on whether this is for a shape or a standalone label
    if (isForShape) {
      element.style.position = "absolute";
      element.style.textAlign = "center";
      element.style.width = "max-content";
      element.style.top = "50%";
      element.style.left = "50%";
      element.style.transform = "translate(-50%, -50%)";
      element.style.pointerEvents = "none";
      element.style.textShadow = "1px 1px 1px rgba(0,0,0,0.5)";
      element.style.color = "#fff";
      element.style.fontWeight = "bold";
    } else {
      element.className = "node-label";
    }

    // Set font color
    if (n.getData().fontColor) {
      element.style.color = n.getData().fontColor as string;
    } else if (!isForShape) {
      element.style.color = RenderingManager.getColor(
        n,
        getNodeLegendConfig(),
        getLegendMode()
      );
    }

    // Set font size
    if (config.fontSize) {
      element.style.fontSize = `${config.fontSize}px`;
    }

    return element;
  }

  private static createNodeThreeObject(
    node: any,
    sceneGraph: SceneGraph,
    config: IForceGraphRenderConfig
  ): CSS2DObject | Sprite | null {
    const n = sceneGraph.getGraph().getNode(node.id as NodeId);

    // Handle regular images
    const imageUrl = n.maybeGetUserData("imageUrl") as string | undefined;
    if (n.getType() === "image" && imageUrl) {
      return this.createImageSprite(imageUrl);
    }

    // Handle image boxes
    const imageBoxData = n.getAllUserData() as ImageBoxData | undefined;
    if (n.getType() === "imageBox" && imageBoxData) {
      const container = this.createImageBoxElement(imageBoxData);
      return new CSS2DObject(container);
    }

    // Get the node shape if it exists
    const nodeShape = n.getData().shape as string | undefined;

    if (nodeShape) {
      // Create a shape element with the correct shape styling
      const shapeEl = this.createShapeElement(n, nodeShape, config);

      // If we have text labels, add a span for the text
      if (config.nodeTextLabels) {
        const textEl = this.createLabelElement(n, config, true);
        shapeEl.appendChild(textEl);
      }

      return new CSS2DObject(shapeEl);
    } else {
      if (config.nodeTextLabels) {
        const labelEl = this.createLabelElement(n, config, false);
        return new CSS2DObject(labelEl);
      }
    }

    return null;
  }

  private static createLinkThreeObject(
    link: any,
    sceneGraph: SceneGraph,
    config: IForceGraphRenderConfig
  ): CSS2DObject | null {
    const e = sceneGraph.getGraph().getEdge((link as any).id);
    const linkEl = document.createElement("div");

    if (config.linkTextLabels) {
      linkEl.textContent = e.getType();
      linkEl.className = "link-label";
    } else {
      return null;
    }

    linkEl.style.color = RenderingManager.getColor(
      e,
      getEdgeLegendConfig(),
      getLegendMode()
    );

    return new CSS2DObject(linkEl);
  }

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
    forceGraphInstance.showNavInfo(controlMode === "orbital");

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

    // Apply camera settings if configured
    const config = sceneGraph.getForceGraphRenderConfig();
    if (config.cameraPosition && config.cameraTarget) {
      console.log(
        "refreshing camera position",
        config.cameraPosition,
        config.cameraTarget
      );
      forceGraphInstance.cameraPosition(
        config.cameraPosition,
        config.cameraTarget,
        0 // Immediate transition for refresh
      );
    }

    // Apply initial zoom if configured
    if (config.initialZoom && config.initialZoom !== 1) {
      console.log("refreshing initial zoom", config.initialZoom);
      const controls = forceGraphInstance.controls() as any;
      if (controls && controls.object) {
        controls.object.zoom = config.initialZoom;
        controls.update();
      }
    }

    // Configure directional arrows for edges with drawType: 'arrow'
    forceGraphInstance.linkDirectionalArrowLength((link) => {
      const edge = sceneGraph.getGraph().getEdge((link as any).id);
      if (!edge) return 0;

      const drawType = edge.getData().drawType;
      if (drawType === "arrow") {
        // Use custom arrow length if specified, otherwise default to a larger size for better visibility
        const arrowLength = (edge.getData() as any).arrowLength as number;
        console.log("drawing arrow with length", arrowLength);
        return arrowLength || 12; // Doubled from 6 to 12 for more pronounced arrows
      }
      return 0;
    });

    forceGraphInstance.linkDirectionalArrowRelPos((link) => {
      const edge = sceneGraph.getGraph().getEdge((link as any).id);
      if (!edge) return 0.5;

      const drawType = edge.getData().drawType;
      if (drawType === "arrow") {
        // Use custom arrow position if specified, otherwise default to 0.95
        const arrowPos = (edge.getData() as any).arrowPosition as number;
        return arrowPos !== undefined ? arrowPos : 0.95;
      }
      return 0.5;
    });

    // Configure arrow color to match link color
    forceGraphInstance.linkDirectionalArrowColor((link) => {
      const edge = sceneGraph.getGraph().getEdge((link as any).id);
      if (!edge || edge.getData().drawType !== "arrow") return "transparent";

      // Use custom arrow color if specified, otherwise inherit from link
      const arrowColor = (edge.getData() as any).arrowColor as string;
      if (arrowColor) return arrowColor;

      // Apply the same color logic as the link
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
        edge,
        getEdgeLegendConfig(),
        getLegendMode()
      );
    });

    // Configure arrow resolution for thicker, more pronounced arrows
    forceGraphInstance.linkDirectionalArrowResolution(16); // Higher resolution for thicker arrows

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
    instance.backgroundColor(config.backgroundColor || "#1a1a1a");

    // Use the helper methods for node and link rendering
    instance.nodeThreeObject((node) => {
      return (
        this.createNodeThreeObject(node, sceneGraph, config) ||
        new CSS2DObject(document.createElement("div"))
      );
    });
    instance.nodeThreeObjectExtend(true);

    instance.linkThreeObject((link) => {
      return (
        this.createLinkThreeObject(link, sceneGraph, config) ||
        new CSS2DObject(document.createElement("div"))
      );
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

    // Apply camera settings if configured
    if (config.cameraPosition && config.cameraTarget) {
      console.log(
        "applying camera position from config",
        config.cameraPosition,
        config.cameraTarget
      );
      console.log("Camera target Z value:", config.cameraTarget.z);

      instance.cameraPosition(
        config.cameraPosition,
        config.cameraTarget,
        0 // Immediate transition for config application
      );

      // Debug: Check what the camera target actually is after setting
      const controls = instance.controls() as any;
      if (controls && controls.target) {
        console.log("Camera target after setting:", controls.target);

        // Manually set the controls target to ensure Z coordinate is applied
        if (controls.target.set) {
          controls.target.set(
            config.cameraTarget.x,
            config.cameraTarget.y,
            config.cameraTarget.z
          );
          controls.update();
          console.log("Manually set camera target to:", controls.target);
        }
      }
    }

    // Apply initial zoom if configured
    if (config.initialZoom && config.initialZoom !== 1) {
      console.log("applying initial zoom from config", config.initialZoom);
      const controls = instance.controls() as any;
      if (controls && controls.object) {
        controls.object.zoom = config.initialZoom;
        controls.update();
      }
    }

    sceneGraph.setForceGraphRenderConfig(config);
  }
}
