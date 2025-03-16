import { mergeIntoSceneGraph } from "../../core/model/mergeSceneGraphs";
import { SceneGraph } from "../../core/model/SceneGraph";
import { thinkers1 } from "./thinkers1Graph";
import { thinkers2 } from "./thinkers2Graph";

export const demo_sceneGraph_academicsKG = () => {
  const tmp = new SceneGraph();
  mergeIntoSceneGraph(tmp, thinkers1());
  mergeIntoSceneGraph(tmp, thinkers2());

  return new SceneGraph({
    graph: tmp.getGraph(),
    metadata: {
      name: "AcademicsKG",
      description: "A graph of academics, their works, and relationships.",
    },
  });
};
