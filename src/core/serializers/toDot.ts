import { toDot } from "ts-graphviz";
import { GraphvizLayoutType } from "../layouts/GraphvizLayoutEngine";
import { ConvertSceneGraphToGraphviz } from "../model/ConvertSceneGraphToGraphviz";
import { SceneGraph } from "../model/SceneGraphv2";

export function serializeSceneGraphToDot(sceneGraph: SceneGraph): string {
  return toDot(
    ConvertSceneGraphToGraphviz(
      sceneGraph.getGraph(),
      sceneGraph.getDisplayConfig(),
      GraphvizLayoutType.Graphviz_dot
    )
  );
}
