import { mergeIntoSceneGraph } from "../../core/model/mergeSceneGraphs";
import { SceneGraph } from "../../core/model/SceneGraphv2";
import { thinkers1 } from "./thinkers1Graph";
import { thinkers2 } from "./thinkers2Graph";

console.log("loaded");
const tmp = new SceneGraph();
mergeIntoSceneGraph(tmp, thinkers1);
mergeIntoSceneGraph(tmp, thinkers2);

export const mergeGraph = new SceneGraph({ graph: tmp.getGraph() });
