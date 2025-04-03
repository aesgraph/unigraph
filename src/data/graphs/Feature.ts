import { Graph } from "../../core/model/Graph";

export type SubFeature = string;
export type Feature = string;

export type FeatureSet<E extends Record<string, SubFeature>> = {
  name: Feature;
  subFeatures: E;
};

export function createFeatureSet<E extends Record<string, SubFeature>>(
  name: Feature,
  features: E
): FeatureSet<E> {
  return {
    name,
    subFeatures: features,
  };
}

const modelling = createFeatureSet("modelling", {
  tags: "tags",
  entityEngine: "entityEngine",
  hyperEdges: "hyperEdges",
  paths: "paths",
});

const interactive = createFeatureSet("interactive", {
  filtering: "filtering",
});

const visualization = createFeatureSet("visualization", {
  "2d": "2d",
  "3d": "3d",
  "real-time": "real-time",
});

const webNative = createFeatureSet("web native", {
  typescript: "typescript",
  javascript: "javascript",
});

const standaloneApp = createFeatureSet("standalone app", {
  layouts: "layouts",
  fileImportExport: "fileImportExport",
  presets: "presets",
});

const analytics = createFeatureSet("analytics", {
  mvcModel: "MVC model",
  simulation: "simulation",
  realTime: "real-time",
});

const library = createFeatureSet("library", {
  openSource: "openSource",
});

export const GRAPH_SOFTWARE_FEATURES = {
  interactive,
  visualization,
  modelling,
  webNative,
  standaloneApp,
  analytics,
  library,
};

export const addFeatureSetsToGraph = (
  featureSet: FeatureSet<Record<string, SubFeature>>[],
  graph: Graph
): void => {
  for (const feature of featureSet) {
    graph.createNode({
      id: feature.name,
      type: "feature",
      tags: [`tag:feature:${feature.name}`],
    });
    for (const subFeature of Object.values(feature.subFeatures)) {
      graph.createNode({
        id: subFeature,
        type: "subFeature",
        tags: [`tag:subFeature:${subFeature}}`],
      });
      graph.createEdge(subFeature, feature.name, {
        type: "subfeatureOf",
        tags: [`tag:subFeatureOf:${subFeature}}`],
      });
    }
  }
};
