import {
  demo_SceneGraph_StackedImageGalleryTransparent_ImageBoxes_1,
  demo_SceneGraph_StackedImageGalleryTransparent_ImageBoxes_2,
  demo_SceneGraph_StackedImageGalleryTransparent_ImageBoxes_3,
} from '../../../assets/imageBoxes/demo_SceneGraph_StackedImageGalleryTransparent_ImageBoxes';
import { demo_SceneGraph_StackedImageGalleryTransparent_images } from '../../../components/lumina/images';
import { Graph } from '../../../core/model/Graph';
import { SceneGraph } from '../../../core/model/SceneGraph';
import { ImageBoxData } from '../../../core/types/ImageBoxData';
import { generateRandomEdges } from '../../../utils/graphUtils';

export const demo_SceneGraph_StackedGalleryTransparent = () => {
  const graph = new Graph();

  for (const [key, value] of Object.entries(
    demo_SceneGraph_StackedImageGalleryTransparent_images
  )) {
    graph.createNode(key, {
      type: 'image',
      userData: {
        imageUrl: value,
      },
    });
  }

  const imageBoxLists: ImageBoxData[][] = [
    demo_SceneGraph_StackedImageGalleryTransparent_ImageBoxes_1,
    demo_SceneGraph_StackedImageGalleryTransparent_ImageBoxes_2,
    demo_SceneGraph_StackedImageGalleryTransparent_ImageBoxes_3,
  ];

  for (const imageBoxList of imageBoxLists) {
    for (const imageBox of imageBoxList) {
      graph.createNode(imageBox.id, {
        type: 'imageBox',
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

    generateRandomEdges(
      graph,
      graph.getNodesByType('imageBox').getIds().toArray()
    );
  }

  return new SceneGraph({
    graph,
    metadata: {
      name: 'Transparent Stacked Gallery',
      description: 'The transparent stacked gallery demo.',
    },
  });
};
