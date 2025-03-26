import {
  getEdgeLegendConfig,
  getNodeLegendConfig,
} from "../../store/activeLegendConfigStore";
import { getAppConfig, getLegendMode } from "../../store/appConfigStore";
import { SceneGraph } from "../model/SceneGraph";

export const saveAppConfigToSceneGraph = (sceneGraph: SceneGraph) => {
  if (getLegendMode() === "type") {
    sceneGraph.getDisplayConfig().nodeConfig.types = getNodeLegendConfig();
    sceneGraph.getDisplayConfig().edgeConfig.types = getEdgeLegendConfig();
  } else {
    sceneGraph.getDisplayConfig().nodeConfig.tags = getNodeLegendConfig();
    sceneGraph.getDisplayConfig().edgeConfig.tags = getEdgeLegendConfig();
  }
  sceneGraph.getData().displayConfig.mode = getLegendMode();
  sceneGraph.commitDisplayConfig();
  sceneGraph.getData().defaultAppConfig = getAppConfig();
  return sceneGraph;
};
