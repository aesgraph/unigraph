import { toDot } from "ts-graphviz";
import { GraphvizLayoutType } from "../layouts/GraphvizLayoutType";
import { ConvertSceneGraphToGraphviz } from "../model/ConvertSceneGraphToGraphviz";
import { SceneGraph } from "../model/SceneGraph";

export function serializeSceneGraphToDot(sceneGraph: SceneGraph): string {
  return toDot(
    ConvertSceneGraphToGraphviz(
      sceneGraph.getGraph(),
      sceneGraph.getDisplayConfig(),
      GraphvizLayoutType.Graphviz_dot
    )
  );
}
