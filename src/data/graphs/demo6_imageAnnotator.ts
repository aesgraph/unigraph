// import { demo6_imageBoxes } from "../../assets/demo-6/demo6_imageBoxes";
// import { demo6_images } from "../../components/lumina/images";
// import { Graph } from "../../core/model/Graph";
// import { SceneGraph } from "../../core/model/SceneGraphv2";
// import { ImageBoxData } from "../../core/types/ImageBoxData";

// const graph = new Graph();

// for (const [key, value] of Object.entries(demo6_images)) {
//   graph.createNode(key, {
//     type: "image",
//     userData: {
//       imageUrl: value,
//     },
//   });
// }

// const imageBoxLists: ImageBoxData[][] = [demo6_imageBoxes];

// for (const imageBoxList of imageBoxLists) {
//   for (const imageBox of imageBoxList) {
//     graph.createNode(imageBox.id, {
//       type: "imageBox",
//       userData: {
//         imageUrl: imageBox.imageUrl,
//         topLeft: imageBox.topLeft,
//         bottomRight: imageBox.bottomRight,
//         label: imageBox.label,
//       },
//     });
//     graph.createEdge(imageBox.id, imageBox.imageUrl, {
//       type: `${imageBox.imageUrl}`,
//     });
//   }
// }

// export const demo6_aesgraph = new SceneGraph({
//   graph,
//   metadata: {
//     name: "ImageBox Creator",
//     description: "A demo scene showing the image box creator",
//   },
// });
// console.log(demo6_aesgraph);
