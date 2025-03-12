import { demo_SceneGraph_SolvayConference_ImageBoxes } from "../../../assets/imageBoxes/demo_SceneGraph_SolvayConference_ImageBoxes";
import { demo1_images } from "../../../components/lumina/images";
import { Graph } from "../../../core/model/Graph";
import { SceneGraph } from "../../../core/model/SceneGraph";

const graph = new Graph();

for (const [key, value] of Object.entries(demo1_images)) {
  graph.createNode(key, {
    type: "image",
    userData: {
      imageUrl: value,
    },
  });
}

const imageBoxLists = [demo_SceneGraph_SolvayConference_ImageBoxes];

for (const imageBoxList of imageBoxLists) {
  for (const imageBox of imageBoxList) {
    graph.createNode(imageBox.id, {
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

export const demo_SceneGraph_SolvayConference = new SceneGraph({
  graph,
  metadata: {
    name: "Solvay Conference",
    description: "A meeting of great physicists",
  },
});
