import { imageBoxes256 } from "../../../assets/imageBoxes/imageBoxes256";
import { demo_SceneGraph_ArtCollection_Images } from "../../../components/lumina/images";
import { GET_DEFAULT_RENDERING_CONFIG } from "../../../controllers/RenderingManager";
import { Graph } from "../../../core/model/Graph";
import { SceneGraph } from "../../../core/model/SceneGraph";
import { ImageBoxData } from "../../../core/types/ImageBoxData";

const imageGraph = new Graph();
const imageData = new Map<string, ImageBoxData>();

for (const [key, value] of Object.entries(
  demo_SceneGraph_ArtCollection_Images
)) {
  imageGraph.createNode(key, {
    type: "image",
    userData: {
      imageUrl: value,
    },
  });
}
const imageBoxesToInclude: ImageBoxData[][] = [
  imageBoxes256,
  // imageBoxes263
];
for (const imageBoxes of imageBoxesToInclude) {
  for (const imageBox of imageBoxes) {
    imageGraph.createNode(imageBox.id, {
      type: "imageBox",
      userData: {
        imageUrl: imageBox.imageUrl,
        topLeft: imageBox.topLeft,
        bottomRight: imageBox.bottomRight,
      },
    });
    imageGraph.createEdge(imageBox.id, imageBox.imageUrl, {
      type: `${imageBox.imageUrl}`,
    });
  }
}

export const demo_SceneGraph_ArtCollection = new SceneGraph({
  graph: imageGraph,
});

export const onSubmitImage = (data: ImageBoxData) => {
  const {
    id,
    type,
    description,
    tags,
    imageUrl,
    topLeft,
    bottomRight,
    label,
    imageSource,
  } = data;
  demo_SceneGraph_ArtCollection.getGraph().createNode(id, {
    type: "ImageBox",
    description,
    tags,
    userData: {
      imageBoxData: {
        id,
        type,
        label,
        description,
        tags,
        imageUrl,
        topLeft,
        bottomRight,
      },
    },
  });
  if (imageUrl) {
    demo_SceneGraph_ArtCollection
      .getGraph()
      .createNodeIfMissing(imageUrl, { type: "image" });
    demo_SceneGraph_ArtCollection.getGraph().createEdge(id, imageUrl, {
      type: "maps to",
    });
  }
  demo_SceneGraph_ArtCollection.setDisplayConfig(
    GET_DEFAULT_RENDERING_CONFIG(imageGraph)
  );
  imageData.set(data.id, data);
  console.log(demo_SceneGraph_ArtCollection);
};
