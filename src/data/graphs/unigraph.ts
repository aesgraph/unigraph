import { digraph, RootGraphModel } from "ts-graphviz";
import {
  GET_DEFAULT_RENDERING_CONFIG,
  RenderingConfig,
  RenderingManager,
} from "../../controllers/RenderingManager";
import { requireCluster } from "../../controllers/graphvizHelpers";
import { Graph } from "../../core/model/Graph";
import { SceneGraph } from "../../core/model/SceneGraph";
import { Tag } from "../../core/model/entity/abstractEntity";
import {
  addFeatureSetsToGraph,
  GRAPH_SOFTWARE_FEATURES,
  SubFeature,
} from "./Feature";

export const graph = new Graph();

const graph_software = "graph software" as Tag;
const software_feature = "graph software feature" as Tag;

enum ObviousFeatures {
  Extensible = "extensible",
  OpenSource = "open source",
}

enum CriticalFeaturesThatComeLater {
  HighPerformance = "high performance",
  HighScale = "high scale",
}

enum Features {
  Interactive = "interactive",
  Visualization = "visualization",
  StandaloneApp = "standalone app",
  Analytics = "analytics",
  WebNative = "web native",
  Library = "library",
}

// enum UnigraphUniqueFeatures {
//   ApplicationDevelopmentFramework = "application development framework",
//   SemanticModel = "application development framework",
// }

type GraphSoftware = {
  name: string;
  features: SubFeature[];
};

const createGraphSoftwareNode = (software: GraphSoftware) => {
  const node = graph.createNode(software.name, { type: graph_software });
  software.features.forEach((feature) => {
    graph.createNodeIfMissing(feature, {
      type: graph_software,
      tags: [software.name],
    });
    graph.createEdge(software.name, feature, { type: "hasFeature" });
  });
  return node;
};

createGraphSoftwareNode({
  name: "unigraph",
  features: [
    GRAPH_SOFTWARE_FEATURES.modelling.subFeatures.tags,
    GRAPH_SOFTWARE_FEATURES.modelling.subFeatures.entityEngine,
    GRAPH_SOFTWARE_FEATURES.interactive.subFeatures.filtering,
    GRAPH_SOFTWARE_FEATURES.webNative.subFeatures.typescript,
    Features.Interactive,
    Features.Visualization,
    Features.Analytics,
    Features.WebNative,
    Features.StandaloneApp,
    Features.Library,
  ],
});

createGraphSoftwareNode({
  name: "cytoscape",
  features: [
    GRAPH_SOFTWARE_FEATURES.modelling.subFeatures.tags,
    GRAPH_SOFTWARE_FEATURES.interactive.subFeatures.filtering,
    GRAPH_SOFTWARE_FEATURES.webNative.subFeatures.javascript,
    Features.Interactive,
    Features.Visualization,
    Features.Analytics,
    Features.WebNative,
    Features.StandaloneApp,
    Features.Library,
  ],
});

addFeatureSetsToGraph(Object.values(GRAPH_SOFTWARE_FEATURES), graph);
// createGraphSoftwareNode({
//   name: "gephi",
//   features: [
//     Features.Interactive,
//     Features.Visualization,
//     Features.Analytics,
//     Features.StandaloneApp,
//   ],
// });

// createGraphSoftwareNode({
//   name: "reactflow",
//   features: [
//     Features.Interactive,
//     Features.Visualization,
//     Features.WebNative,
//     Features.Library,
//   ],
// });

// createGraphSoftwareNode({
//   name: "graphviz",
//   features: [Features.Visualization, Features.Library],
// });

// createGraphSoftwareNode({
//   name: "mermaidjs",
//   features: [
//     Features.Visualization,
//     Features.WebNative,
//     Features.Visualization,
//   ],
// });

// createGraphSoftwareNode({
//   name: "sigma.js",
//   features: [
//     Features.Visualization,
//     Features.Interactive,
//     Features.WebNative,
//     Features.Library,
//   ],
// });

graph.createNode("lumina", { type: "sub application" });
graph.createEdge("lumina", "unigraph", { type: "subcomponent of" });

graph.createNode("reactflow", { type: "graph software" });
graph.createNode("graphiz", { type: "graph software" });
graph.createEdge("unigraph", "reactflow", { type: "adaptor for" });
graph.createEdge("unigraph", "graphiz", { type: "adaptor for" });

const buildGraph = (
  graph: Graph,
  renderConfig: RenderingConfig
): RootGraphModel => {
  const renderingManager = new RenderingManager(renderConfig);
  const g = digraph("G", (g) => {
    g.set("rankdir", "LR");
    for (const node of graph.getNodes()) {
      if (!renderingManager.getNodeIsVisible(node)) {
        continue;
      }
      const cluster = requireCluster(g, `cluster_${node.getType()}`);
      cluster.set("label", node.getType());
      cluster.node(node.getId(), {
        label: node.getId(),
        shape: "box",
        color: renderingManager.getNodeColor(node),
      });
    }
    for (const edge of graph.getEdges()) {
      if (!renderingManager.getEdgeIsVisible(edge, graph)) {
        continue;
      }
      g.edge([edge.getSource(), edge.getTarget()], {
        color: renderingManager.getEdgeColor(edge),
      });
    }
  });
  console.log("g is ", g);
  return g;
};

console.log(graph);
console.log(GET_DEFAULT_RENDERING_CONFIG(graph));

export const unigraphGraph = new SceneGraph({ graph });
