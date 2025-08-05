import {
  createImageBoxesFromSegments,
  findColorIslands,
} from "../../_experimental/lumina/imageSegmentation";
import { demo_SceneGraph_ArtCollection_Images } from "../../_experimental/lumina/images";
import { Node } from "../model/Node";
import { SceneGraph } from "../model/SceneGraph";

const processImageNodesInSceneGraph = async (
  sceneGraph: SceneGraph,
  minSegmentSize: number = 10,
  colorSensitivity: number = 10
): Promise<void> => {
  // Get all nodes that have imageUrl in their userData
  const imageNodes = sceneGraph
    .getGraph()
    .getNodes()
    .filter((node) => {
      const userData = node.getData().userData;
      return userData && userData.imageUrl;
    });

  console.log(`Found ${imageNodes.size()} nodes with image data`);

  for (const node of imageNodes) {
    const imageUrl = node.getData().userData.imageUrl;

    try {
      // Create an image element and wait for it to load
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = demo_SceneGraph_ArtCollection_Images[imageUrl];
      });

      // Create a canvas and get its context
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Could not get canvas context");
        continue;
      }

      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Find color islands in the image
      const components = findColorIslands(
        ctx,
        canvas.width,
        canvas.height,
        minSegmentSize,
        colorSensitivity
      );

      // Create image boxes from the components
      const boxes = createImageBoxesFromSegments(
        components,
        canvas.width,
        canvas.height,
        img,
        imageUrl
      );

      // Create entities for each box
      boxes.forEach((box) => {
        const entity = new Node({
          ...box,
          type: "ImageBox",
          tags: new Set(["imageBox"]),
          position: {
            x: (box.topLeft.x + box.bottomRight.x) / 2,
            y: (box.topLeft.y + box.bottomRight.y) / 2,
            z: 0,
          },
        });

        // Add the entity to the scene graph
        sceneGraph.getEntityCache().addEntity(entity);

        // Create a node in the graph for this box
        sceneGraph.getGraph().createNode({
          id: box.id,
          type: "ImageBox",
          position: {
            x: (box.topLeft.x + box.bottomRight.x) / 2,
            y: (box.topLeft.y + box.bottomRight.y) / 2,
            z: 0,
          },
          userData: {
            ...box,
            width: box.bottomRight.x - box.topLeft.x,
            height: box.bottomRight.y - box.topLeft.y,
          },
          tags: new Set(["imageBox"]),
        });
      });

      console.log(
        `Processed ${boxes.length} image boxes for node ${node.getId()}`
      );
    } catch (error) {
      console.error(`Error processing image node ${node.getId()}:`, error);
    }
  }

  // Update the scene graph's display configuration
  sceneGraph.getDisplayConfig().nodeConfig.types["ImageBox"] = {
    color: "#44ff44",
    isVisible: true,
    // scale: 1.0,
  };

  // Notify that the graph has changed
  sceneGraph.notifyGraphChanged();
};

export { processImageNodesInSceneGraph };
