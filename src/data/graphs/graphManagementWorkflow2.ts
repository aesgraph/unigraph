import { CustomLayoutType } from "../../core/layouts/CustomLayoutEngine";
import { Graph } from "../../core/model/Graph";
import { mergeIntoSceneGraph } from "../../core/model/mergeSceneGraphs";
import { SceneGraph } from "../../core/model/SceneGraph";
import { unigraphArchitectureDiagram } from "./graphmanagementworkflow3";
import { semanticWebTechnologiesDiagram } from "./semanticWebDiagram";
import { unigraphGraph } from "./unigraph";

export const graphManagementWorkflowDiagram2 = () => {
  const graph = new Graph();

  // Core Concept Nodes
  graph.createNode("TextDefinedGraph", {
    type: "concept pillar",
    tags: ["graph source", "story entrypoint"],
  });

  graph.createNode("Graphviz", {
    type: "graph software",
    tags: ["graph software", "story entrypoint"],
  });

  graph.createNode("MermaidJS", {
    type: "graph software",
    tags: ["graph software", "story entrypoint"],
  });

  graph.createNode("SVG", {
    type: "output format",
    tags: ["visualization"],
  });

  graph.createNode("Unigraph", {
    type: "concept pillar",
    tags: ["unigraph", "story entrypoint", "graph software"],
  });

  graph.createNode("UnigraphModelGraph", {
    type: "concept pillar",
    tags: ["graph model"],
  });

  // Graph Operations
  graph.createNode("UpdatePositions", {
    type: "operation",
    tags: ["graph operation"],
  });

  graph.createNode("UpdateOpacity", {
    type: "operation",
    tags: ["graph operation"],
  });

  graph.createNode("UpdateSizes", {
    type: "operation",
    tags: ["graph operation"],
  });

  graph.createNode("UpdateColors", {
    type: "operation",
    tags: ["graph operation"],
  });

  graph.createNode("Export", {
    type: "operation",
    tags: ["graph operation"],
  });

  // New Nodes (Expanding Unigraph's Capabilities)
  graph.createNode("EntityComponentSystem", {
    type: "core framework",
    tags: ["data management", "graph architecture"],
  });

  graph.createNode("OntologyGenerator", {
    type: "concept pillar",
    tags: ["AI integration", "knowledge representation"],
  });

  graph.createNode("MultiLayerDiagrams", {
    type: "feature",
    tags: ["visualization", "diagramming"],
  });

  graph.createNode("AIAnalysis", {
    type: "feature",
    tags: ["AI integration", "data processing"],
  });

  graph.createNode("TypeSystem", {
    type: "feature",
    tags: ["dataset classification", "ontology"],
  });

  graph.createNode("ImageAnnotations", {
    type: "feature",
    tags: ["diagram enhancement", "linked metadata"],
  });

  graph.createNode("DataChaining", {
    type: "feature",
    tags: ["data synthesis", "workflow automation"],
  });

  graph.createNode("GraphBasedUI", {
    type: "interface",
    tags: ["user experience", "data interaction"],
  });

  graph.createNode("MedicalTypeSystem", {
    type: "specialized application",
    tags: ["healthcare", "structured knowledge"],
  });

  graph.createNode("ZeroKnowledgeProofs", {
    type: "security feature",
    tags: ["privacy", "AI validation"],
  });

  // Connections
  graph.createEdge("TextDefinedGraph", "Graphviz", { type: "converts to" });
  graph.createEdge("Graphviz", "SVG", { type: "outputs" });
  graph.createEdge("TextDefinedGraph", "MermaidJS", { type: "converts to" });
  graph.createEdge("MermaidJS", "SVG", { type: "outputs" });
  graph.createEdge("SVG", "Unigraph", { type: "imports into" });
  graph.createEdge("TextDefinedGraph", "Unigraph", { type: "inputs to" });
  graph.createEdge("Unigraph", "UpdatePositions", { type: "enables" });
  graph.createEdge("Unigraph", "UpdateOpacity", { type: "enables" });
  graph.createEdge("Unigraph", "UpdateSizes", { type: "enables" });
  graph.createEdge("Unigraph", "UpdateColors", { type: "enables" });
  graph.createEdge("UpdateOpacity", "UnigraphModelGraph", { type: "modifies" });
  graph.createEdge("UpdateSizes", "UnigraphModelGraph", { type: "modifies" });
  graph.createEdge("UpdatePositions", "UnigraphModelGraph", {
    type: "modifies",
  });
  graph.createEdge("UpdateColors", "UnigraphModelGraph", { type: "modifies" });
  graph.createEdge("UnigraphModelGraph", "Export", { type: "outputs to" });
  graph.createEdge("Export", "TextDefinedGraph", { type: "creates" });

  // New Connections (Enhancing Unigraph's Graph)
  graph.createEdge("Unigraph", "EntityComponentSystem", { type: "built on" });
  graph.createEdge("EntityComponentSystem", "OntologyGenerator", {
    type: "enables",
  });
  graph.createEdge("Unigraph", "MultiLayerDiagrams", { type: "supports" });
  graph.createEdge("MultiLayerDiagrams", "ImageAnnotations", {
    type: "enhances",
  });
  graph.createEdge("Unigraph", "AIAnalysis", { type: "integrates" });
  graph.createEdge("AIAnalysis", "DataChaining", { type: "optimizes" });
  graph.createEdge("Unigraph", "TypeSystem", { type: "incorporates" });
  graph.createEdge("TypeSystem", "MedicalTypeSystem", {
    type: "specializes into",
  });
  graph.createEdge("Unigraph", "GraphBasedUI", { type: "provides" });
  graph.createEdge("Unigraph", "ZeroKnowledgeProofs", {
    type: "enables security for",
  });

  const main = new SceneGraph({
    graph,
    defaultAppConfig: {
      activeView: "ForceGraph3d",
      activeSceneGraph: "graphManagementWorkflow2",
      windows: {
        showLegendBars: true,
        showOptionsPanel: true,
        showGraphLayoutToolbar: true,
        showEntityDataCard: false,
      },
      forceGraph3dOptions: {
        layout: "Physics",
        showOptionsPanel: true,
      },
      activeLayout: CustomLayoutType.Random,
    },
  });

  const tmp = new SceneGraph();
  mergeIntoSceneGraph(tmp, main);
  mergeIntoSceneGraph(tmp, unigraphGraph());
  mergeIntoSceneGraph(tmp, unigraphArchitectureDiagram());
  mergeIntoSceneGraph(tmp, semanticWebTechnologiesDiagram());

  return new SceneGraph({
    graph: tmp.getGraph(),
    metadata: {
      name: "Unigraph",
      description: "A basic graph of Unigraph concepts",
    },
  });
};
