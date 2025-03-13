import { demo_SceneGraph_Thinking_ImageBoxes } from '../../../assets/imageBoxes/demo_SceneGraph_Thinking_ImageBoxes';
import { demo_SceneGraph_Thinking_images } from '../../../components/lumina/images';
import { Graph } from '../../../core/model/Graph';
import { SceneGraph } from '../../../core/model/SceneGraph';
import { ImageBoxData } from '../../../core/types/ImageBoxData';

export const demo_SceneGraph_Thinking = () => {
  const graph = new Graph();

  for (const [key, value] of Object.entries(demo_SceneGraph_Thinking_images)) {
    graph.createNode(key, {
      type: 'image',
      userData: {
        imageUrl: value,
      },
    });
  }

  const imageBoxLists: ImageBoxData[][] = [demo_SceneGraph_Thinking_ImageBoxes];

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
  }

  return new SceneGraph({
    graph,
    metadata: {
      name: 'ImageBox Creator',
      description: 'A single image, of thinking.',
    },
  });
};
