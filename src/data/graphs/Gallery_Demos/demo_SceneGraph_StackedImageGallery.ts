import { demo_SceneGraph_StackedImageGallery_images } from "../../../_experimental/lumina/images";
import { Graph } from "../../../core/model/Graph";
import { SceneGraph } from "../../../core/model/SceneGraph";
import { ImageBoxData } from "../../../core/types/ImageBoxData";

export const demo_SceneGraph_StackedImageGallery = () => {
  const graph = new Graph();

  for (const [key, value] of Object.entries(
    demo_SceneGraph_StackedImageGallery_images
  )) {
    graph.createNode({
      id: key,
      type: "image",
      userData: {
        imageUrl: value,
      },
    });
  }

  const imageBoxLists: ImageBoxData[][] = [[]];

  for (const imageBoxList of imageBoxLists) {
    for (const imageBox of imageBoxList) {
      graph.createNode({
        id: imageBox.id,
        type: "imageBox",
        userData: {
          imageUrl: imageBox.imageUrl,
          topLeft: imageBox.topLeft,
          bottomRight: imageBox.bottomRight,
          label: imageBox.label,
        },
      });
      graph.createEdge(imageBox.id, imageBox.imageUrl, {
        type: `${imageBox.imageUrl}`,
      });
    }
  }

  return new SceneGraph({
    graph,
    metadata: {
      name: "Aesgraph Diagram 1",
      description: "Illustration 1",
    },
  });
};
