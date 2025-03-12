import { mergeIntoSceneGraph } from "../../core/model/mergeSceneGraphs";
import { SceneGraph } from "../../core/model/SceneGraph";
import { thinkers1 } from "./thinkers1Graph";
import { thinkers2 } from "./thinkers2Graph";

const tmp = new SceneGraph();
mergeIntoSceneGraph(tmp, thinkers1);
mergeIntoSceneGraph(tmp, thinkers2);

export const demo_sceneGraph_academicsKG = new SceneGraph({ graph: tmp.getGraph(), metadata: {
    name: "AcademicsKG",
    description: "A graph of academics, their works, and relationships.",
} });
