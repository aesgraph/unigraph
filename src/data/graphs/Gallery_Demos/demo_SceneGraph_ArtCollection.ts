import { demo_SceneGraph_ArtCollection_Images } from "../../../_experimental/lumina/images";
import { imageBoxes256 } from "../../../assets/imageBoxes/imageBoxes256";
import { GET_DEFAULT_RENDERING_CONFIG } from "../../../controllers/RenderingManager";
import { Graph } from "../../../core/model/Graph";
import { SceneGraph } from "../../../core/model/SceneGraph";
import { ImageBoxData } from "../../../core/types/ImageBoxData";

export const demo_SceneGraph_ArtCollection = () => {
  const imageGraph = new Graph();

  for (const [key, value] of Object.entries(
    demo_SceneGraph_ArtCollection_Images
  )) {
    imageGraph.createNode({
      id: key,
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
      imageGraph.createNode({
        id: imageBox.id,
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

  return new SceneGraph({
    graph: imageGraph,
  });
};

export const onSubmitImage = (sceneGraph: SceneGraph, data: ImageBoxData) => {
  const {
    id,
    type,
    description,
    tags,
    imageUrl,
    topLeft,
    bottomRight,
    label,
    // eslint-disable-next-line unused-imports/no-unused-vars
    imageSource,
  } = data;
  sceneGraph.getGraph().createNode({
    id,
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
    sceneGraph.getGraph().createNodeIfMissing(imageUrl, { type: "image" });
    sceneGraph.getGraph().createEdge(id, imageUrl, {
      type: "maps to",
    });
  }
  sceneGraph.setDisplayConfig(
    GET_DEFAULT_RENDERING_CONFIG(sceneGraph.getGraph())
  );
};
