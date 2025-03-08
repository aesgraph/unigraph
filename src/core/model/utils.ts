import { Node } from "./Node";
import { SceneGraph } from "./SceneGraphv2";

export const GetRandomNodeFromSceneGraph = (sceneGraph: SceneGraph): Node => {
  return sceneGraph.getGraph().getNodes().getRandomEntity();
};
