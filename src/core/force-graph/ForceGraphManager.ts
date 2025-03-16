import { ForceGraph3DInstance } from "3d-force-graph";
import { Sprite, SpriteMaterial, SRGBColorSpace, TextureLoader } from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import { NodePositionData } from "../layouts/layoutHelpers";
import { NodeId } from "../model/Node";
import { SceneGraph } from "../model/SceneGraph";
import { ImageBoxData } from "../types/ImageBoxData";
import { reconstructImageSource } from "../utils/imageProcessing";
import { IForceGraphRenderConfig } from "./createForceGraph";

export class ForceGraphManager {
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

  public static applyForceGraphRenderConfig(
    instance: ForceGraph3DInstance,
    config: IForceGraphRenderConfig,
    sceneGraph: SceneGraph,
    reheatSimulation: boolean = false
  ): void {
    const renderingManager = sceneGraph.getRenderingManager();

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
      nodeEl.style.color = renderingManager.getNodeColor(n);
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
      linkEl.style.color = renderingManager.getEdgeColor(e);
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
