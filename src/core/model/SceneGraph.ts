import { GraphEntityType } from "../../components/common/GraphSearch";
import { DisplayManager } from "./DisplayManager";
import { SceneGraph } from "./SceneGraphv2";

export const GetCurrentDisplayConfigOf = (
  sceneGraph: SceneGraph,
  type: GraphEntityType
) => {
  const renderingManager = sceneGraph.getRenderingManager();
  const displayConfig = renderingManager.getDisplayConfig(
    type,
    sceneGraph.getDisplayConfig().mode
  );
  return displayConfig;
};

export const SetCurrentDisplayConfigOf = (
  sceneGraph: SceneGraph,
  type: GraphEntityType,
  config: any
) => {
  const renderingManager = sceneGraph.getRenderingManager();
  renderingManager.setDisplayConfig(
    sceneGraph.getDisplayConfig().mode,
    type,
    config
  );
  DisplayManager.applyRenderingConfigToGraph(
    sceneGraph.getGraph(),
    sceneGraph.getDisplayConfig()
  );
};
