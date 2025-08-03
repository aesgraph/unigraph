import { DEFAULT_APP_CONFIG } from "../../AppConfig";
import { mergeIntoSceneGraph } from "../../core/model/mergeSceneGraphs";
import { SceneGraph } from "../../core/model/SceneGraph";
import { thinkers1 } from "./thinkers1Graph";
import { thinkers2 } from "./thinkers2Graph";

export const demo_sceneGraph_academicsKG = () => {
  console.log("Building AcademicsKG graph...");
  const tmp = new SceneGraph();
  mergeIntoSceneGraph(tmp, thinkers1());
  mergeIntoSceneGraph(tmp, thinkers2());
  console.log("AcademicsKG graph built.");

  return new SceneGraph({
    graph: tmp.getGraph(),
    metadata: {
      name: "AcademicsKG",
      description: "A graph of academics, their works, and relationships.",
    },
    defaultAppConfig: {
      ...DEFAULT_APP_CONFIG(),
      activeView: "ForceGraph3d",
      forceGraph3dOptions: {
        layout: "Physics",
      },
      appShellLayout: "clean-workspace",
    },
  });
};
