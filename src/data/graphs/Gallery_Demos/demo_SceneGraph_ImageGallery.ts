import { demo_SceneGraph_ImageGallery_images } from "../../../_experimental/lumina/images";
import { demo_SceneGraph_ImageGallery_ImageBoxes } from "../../../assets/imageBoxes/demo_SceneGraph_ImageGallery_ImageBoxes";
import { Graph } from "../../../core/model/Graph";
import { SceneGraph } from "../../../core/model/SceneGraph";
import { ImageBoxData } from "../../../core/types/ImageBoxData";

export const demo_SceneGraph_ImageGallery = () => {
  const graph = new Graph();

  for (const [key, value] of Object.entries(
    demo_SceneGraph_ImageGallery_images
  )) {
    graph.createNode({
      id: key,
      type: "image",
      userData: {
        imageUrl: value,
      },
    });
  }

  const imageBoxLists: ImageBoxData[][] = [
    demo_SceneGraph_ImageGallery_ImageBoxes,
  ];

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
      name: "Image Gallery Demo 1",
      description:
        "A simple demo of a simple single image with some image boxes.",
    },
  });
};
