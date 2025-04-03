import { GraphEntityType } from "../components/common/GraphSearch";
import { DisplayConfigData } from "../controllers/RenderingManager";
import { SceneGraph } from "../core/model/SceneGraph";

export class DisplayConfigManager {
  //   public static getDisplayConfigOf(
  //     entityType: GraphEntityType,
  //     mode: "tag" | "type",
  //     sceneGraph: SceneGraph
  //   ): DisplayConfig {
  //     const displayConfig =
  //       entityType === "Node"
  //         ? sceneGraph.getDisplayConfig().nodeConfig
  //         : sceneGraph.getDisplayConfig().edgeConfig;
  //     return mode === "type" ? displayConfig.types : displayConfig.tags;
  //   }

  public static addKeyToDisplayConfig(
    key: string,
    config: DisplayConfigData,
    mode: "tag" | "type",
    entityType: GraphEntityType,
    sceneGraph: SceneGraph // the scenegraph displayConfig should change
  ): void {
    if (entityType === "Node") {
      if (mode === "type") {
        sceneGraph.getDisplayConfig().nodeConfig.types = {
          ...sceneGraph.getDisplayConfig().nodeConfig.types,
          [key]: config,
        };
      } else {
        sceneGraph.getDisplayConfig().nodeConfig.tags = {
          ...sceneGraph.getDisplayConfig().nodeConfig.tags,
          [key]: config,
        };
      }
    } else {
      if (mode === "type") {
        sceneGraph.getDisplayConfig().edgeConfig.types = {
          ...sceneGraph.getDisplayConfig().edgeConfig.types,
          [key]: config,
        };
      } else {
        sceneGraph.getDisplayConfig().edgeConfig.tags = {
          ...sceneGraph.getDisplayConfig().edgeConfig.tags,
          [key]: config,
        };
      }
    }
  }
}
