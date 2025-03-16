import {
  DisplayConfig,
  RenderingConfig,
} from "../../controllers/RenderingManager";
import { Graph } from "./Graph";
import { SceneGraph } from "./SceneGraph";

export const mergeIntoSceneGraph = (a: SceneGraph, b: SceneGraph): void => {
  mergeGraph(a.getGraph(), b.getGraph());
  mergeRenderingConfig(a.getDisplayConfig(), b.getDisplayConfig());
};

export const mergeGraph = (a: Graph, b: Graph) => {
  a.getNodes().addEntitiesSafe(b.getNodes().deepCopy());
  a.getNodes().validate();

  a.getEdges().addEntitiesSafe(b.getEdges().deepCopy());
  a.getEdges().validate();
};

export const mergeDisplayConfig = (a: DisplayConfig, b: DisplayConfig) => {
  const mergedConfig = a;

  for (const key in b) {
    if (Object.prototype.hasOwnProperty.call(b, key)) {
      if (mergedConfig[key]) {
        // Merge visibility and color if both configs have the same key
        mergedConfig[key].isVisible =
          mergedConfig[key].isVisible && b[key].isVisible;
        mergedConfig[key].color = mergedConfig[key].color || b[key].color;
      } else {
        mergedConfig[key] = b[key];
      }
    }
  }
};

export const mergeRenderingConfig = (
  a: RenderingConfig,
  b: RenderingConfig
) => {
  const mergedConfig: RenderingConfig = a;

  mergeDisplayConfig(a.nodeConfig.types, b.nodeConfig.types);
  mergeDisplayConfig(a.nodeConfig.tags, b.nodeConfig.tags);
  mergeDisplayConfig(a.edgeConfig.types, b.edgeConfig.types);
  mergeDisplayConfig(a.edgeConfig.tags, b.edgeConfig.tags);

  if (b.nodePositions) {
    mergedConfig.nodePositions = { ...a.nodePositions, ...b.nodePositions };
  }

  if (b.svg) {
    mergedConfig.svg = b.svg;
  }

  return mergedConfig;
};
