import { GraphvizLayoutType } from "../../core/layouts/GraphvizLayoutType";
import { mergeIntoSceneGraph } from "../../core/model/mergeSceneGraphs";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";
import { demo_scenegraph_unigraph_overview } from "./demo_unigraph_overview";
import { demo_scenegraph_writing_terms } from "./demo_writing_terms";

export const demo_scenegraph_terms_unigraph_overview_links = () => {
  // Merge both graphs
  const tmp = new SceneGraph();
  mergeIntoSceneGraph(tmp, demo_scenegraph_unigraph_overview());
  mergeIntoSceneGraph(tmp, demo_scenegraph_writing_terms());
  const g = tmp.getGraph();

  // Helper: get node id by label for terms
  function termId(label: string) {
    const node = g
      .getNodes()
      .toArray()
      .find((n) => n.getType() === "term" && n.getLabel() === label);
    return node ? node.getId() : ("not found" as NodeId);
  }

  // Helper: get node id by label for overview nodes
  function overviewId(label: string) {
    const node = g
      .getNodes()
      .toArray()
      .find((n) => n.getLabel() === label);
    return node ? node.getId() : ("not found" as NodeId);
  }

  // Unigraph Overview <-> Terms
  g.createEdgeIfMissing(
    overviewId("Unigraph Overview"),
    termId("semantic data"),
    { type: "overview_term_link", label: "describes" }
  );
  g.createEdgeIfMissing(
    overviewId("Unigraph Overview"),
    termId("structured knowledge"),
    { type: "overview_term_link", label: "describes" }
  );
  g.createEdgeIfMissing(
    overviewId("Unigraph Overview"),
    termId("knowledge graph"),
    { type: "overview_term_link", label: "describes" }
  );
  g.createEdgeIfMissing(
    overviewId("Unigraph Overview"),
    termId("human-centric design"),
    { type: "overview_term_link", label: "principle" }
  );
  g.createEdgeIfMissing(
    overviewId("Unigraph Overview"),
    termId("composable structure"),
    { type: "overview_term_link", label: "principle" }
  );
  g.createEdgeIfMissing(
    overviewId("Unigraph Overview"),
    termId("modular architecture"),
    { type: "overview_term_link", label: "principle" }
  );
  g.createEdgeIfMissing(
    overviewId("Unigraph Overview"),
    termId("context-aware modeling"),
    { type: "overview_term_link", label: "principle" }
  );
  g.createEdgeIfMissing(
    overviewId("Unigraph Overview"),
    termId("knowledge representation"),
    { type: "overview_term_link", label: "principle" }
  );
  g.createEdgeIfMissing(
    overviewId("Unigraph Overview"),
    termId("semantic substrate"),
    { type: "overview_term_link", label: "principle" }
  );
  g.createEdgeIfMissing(
    overviewId("Unigraph Overview"),
    termId("semantic web"),
    { type: "overview_term_link", label: "related" }
  );
  g.createEdgeIfMissing(
    overviewId("Unigraph Overview"),
    termId("semantic reasoning"),
    { type: "overview_term_link", label: "principle" }
  );
  g.createEdgeIfMissing(
    overviewId("Unigraph Overview"),
    termId("symbolic representation"),
    { type: "overview_term_link", label: "principle" }
  );
  g.createEdgeIfMissing(
    overviewId("Unigraph Overview"),
    termId("formalization"),
    { type: "overview_term_link", label: "principle" }
  );
  g.createEdgeIfMissing(
    overviewId("Unigraph Overview"),
    termId("perspective-driven modeling"),
    { type: "overview_term_link", label: "principle" }
  );
  g.createEdgeIfMissing(
    overviewId("Unigraph Overview"),
    termId("interpretable interface"),
    { type: "overview_term_link", label: "principle" }
  );
  g.createEdgeIfMissing(
    overviewId("Unigraph Overview"),
    termId("computational semantics"),
    { type: "overview_term_link", label: "principle" }
  );
  g.createEdgeIfMissing(
    overviewId("Unigraph Overview"),
    termId("expressive modeling"),
    { type: "overview_term_link", label: "principle" }
  );
  g.createEdgeIfMissing(
    overviewId("Unigraph Overview"),
    termId("cognition modeling"),
    { type: "overview_term_link", label: "principle" }
  );

  // Features
  g.createEdgeIfMissing(
    overviewId("Text and media communication"),
    termId("semantic data"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("Text and media communication"),
    termId("structured knowledge"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("Semantic knowledge modeling"),
    termId("semantic reasoning"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("Semantic knowledge modeling"),
    termId("knowledge representation"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("Semantic knowledge modeling"),
    termId("logical modeling"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("Semantic knowledge modeling"),
    termId("symbolic representation"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("Code, data science, and analytics workflows"),
    termId("computational semantics"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("Code, data science, and analytics workflows"),
    termId("data-driven design"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("Collaboration and organizational logic"),
    termId("collaborative tooling"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("Collaboration and organizational logic"),
    termId("modular app design"),
    { type: "overview_term_link", label: "feature" }
  );

  // Human-Centric Codification
  g.createEdgeIfMissing(
    overviewId("Human-Centric Codification"),
    termId("human-centric design"),
    { type: "overview_term_link", label: "principle" }
  );
  g.createEdgeIfMissing(
    overviewId("Human-Centric Codification"),
    termId("structured thought"),
    { type: "overview_term_link", label: "principle" }
  );
  g.createEdgeIfMissing(
    overviewId("Human-Centric Codification"),
    termId("interpretable interface"),
    { type: "overview_term_link", label: "principle" }
  );
  g.createEdgeIfMissing(
    overviewId("Human interpretable and interactive"),
    termId("interpretable interface"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("Human interpretable and interactive"),
    termId("interactive rendering"),
    { type: "overview_term_link", label: "feature" }
  );

  // Zettelkasten
  g.createEdgeIfMissing(
    overviewId("Zettelkasten System"),
    termId("knowledge graph"),
    { type: "overview_term_link", label: "related" }
  );
  g.createEdgeIfMissing(
    overviewId("Zettelkasten System"),
    termId("semantic graph"),
    { type: "overview_term_link", label: "related" }
  );
  g.createEdgeIfMissing(
    overviewId("Zettelkasten System"),
    termId("graph ontology"),
    { type: "overview_term_link", label: "related" }
  );
  g.createEdgeIfMissing(
    overviewId("Zettelkasten System"),
    termId("graph nodes"),
    { type: "overview_term_link", label: "related" }
  );
  g.createEdgeIfMissing(
    overviewId("Zettelkasten System"),
    termId("graph edges"),
    { type: "overview_term_link", label: "related" }
  );

  // Writing Application
  g.createEdgeIfMissing(
    overviewId("High-powered Writing Application"),
    termId("tagging system"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("High-powered Writing Application"),
    termId("entity typing"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("High-powered Writing Application"),
    termId("dynamic behavior"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("High-powered Writing Application"),
    termId("modular components"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("High-powered Writing Application"),
    termId("component composition"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("High-powered Writing Application"),
    termId("display metadata"),
    { type: "overview_term_link", label: "feature" }
  );

  // Writing App Features
  g.createEdgeIfMissing(overviewId("Tagging"), termId("tagging system"), {
    type: "overview_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(overviewId("Typing"), termId("entity typing"), {
    type: "overview_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(
    overviewId("Dynamic structures"),
    termId("dynamic behavior"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(overviewId("Codification"), termId("formalization"), {
    type: "overview_term_link",
    label: "feature",
  });

  // Entity
  g.createEdgeIfMissing(overviewId("Entity"), termId("entity"), {
    type: "overview_term_link",
    label: "core concept",
  });
  g.createEdgeIfMissing(overviewId("Entity"), termId("primitive notion"), {
    type: "overview_term_link",
    label: "core concept",
  });
  g.createEdgeIfMissing(overviewId("Entity"), termId("component"), {
    type: "overview_term_link",
    label: "core concept",
  });

  // Organization & Presentation
  g.createEdgeIfMissing(
    overviewId("Organization & Presentation"),
    termId("structured knowledge"),
    { type: "overview_term_link", label: "principle" }
  );
  g.createEdgeIfMissing(
    overviewId("Organization & Presentation"),
    termId("perspective-driven modeling"),
    { type: "overview_term_link", label: "principle" }
  );
  g.createEdgeIfMissing(
    overviewId("Organization & Presentation"),
    termId("context-aware modeling"),
    { type: "overview_term_link", label: "principle" }
  );

  // Organization features
  g.createEdgeIfMissing(
    overviewId("Infinite Depth & Dimension"),
    termId("abstraction layers"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("Navigation & Inspection"),
    termId("visual filter"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("Dynamic Materialization"),
    termId("dynamic UI"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("Codification for Linking & Accuracy"),
    termId("formalization"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(overviewId("Strong Typing"), termId("type system"), {
    type: "overview_term_link",
    label: "feature",
  });

  // Applets
  g.createEdgeIfMissing(
    overviewId("Writing documents and text"),
    termId("browser-based editor"),
    { type: "overview_term_link", label: "applet" }
  );
  g.createEdgeIfMissing(
    overviewId("Annotating images, video, and audio"),
    termId("visual annotation"),
    { type: "overview_term_link", label: "applet" }
  );
  g.createEdgeIfMissing(
    overviewId(
      "Constructing model graphs, ontologies, knowledge graphs, and visual diagrams"
    ),
    termId("diagram renderer"),
    { type: "overview_term_link", label: "applet" }
  );
  g.createEdgeIfMissing(
    overviewId(
      "Constructing model graphs, ontologies, knowledge graphs, and visual diagrams"
    ),
    termId("ontology builder"),
    { type: "overview_term_link", label: "applet" }
  );

  // Graph-based Application Library
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("graph data model"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("web-based application"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("ontology builder"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("client-side graph engine"),
    { type: "overview_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("semantic interoperability"),
    { type: "overview_term_link", label: "feature" }
  );

  // Superset of Graphviz, ReactFlow, Obsidian
  g.createEdgeIfMissing(
    overviewId("Superset of Graphviz, ReactFlow, Obsidian"),
    termId("diagram renderer"),
    { type: "overview_term_link", label: "superset" }
  );
  g.createEdgeIfMissing(
    overviewId("Superset of Graphviz, ReactFlow, Obsidian"),
    termId("graph data model"),
    { type: "overview_term_link", label: "superset" }
  );
  g.createEdgeIfMissing(
    overviewId("Superset of Graphviz, ReactFlow, Obsidian"),
    termId("web-native framework"),
    { type: "overview_term_link", label: "superset" }
  );
  g.createEdgeIfMissing(
    overviewId("Superset of Graphviz, ReactFlow, Obsidian"),
    termId("composable app"),
    { type: "overview_term_link", label: "superset" }
  );

  // Link to "React for Knowledge"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("React for Knowledge"),
    { type: "overview_term_link", label: "vision" }
  );

  // Link to "semantic app ecosystem"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("semantic app ecosystem"),
    { type: "overview_term_link", label: "ecosystem" }
  );

  // Link to "federated interfaces"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("federated interfaces"),
    { type: "overview_term_link", label: "ecosystem" }
  );

  // Link to "plug-in architecture"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("plug-in architecture"),
    { type: "overview_term_link", label: "ecosystem" }
  );

  // Link to "human-scale web apps"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("human-scale web apps"),
    { type: "overview_term_link", label: "ecosystem" }
  );

  // Link to "diagram layer"
  g.createEdgeIfMissing(
    overviewId(
      "Constructing model graphs, ontologies, knowledge graphs, and visual diagrams"
    ),
    termId("diagram layer"),
    { type: "overview_term_link", label: "applet" }
  );

  // Link to "semantic diagram"
  g.createEdgeIfMissing(
    overviewId(
      "Constructing model graphs, ontologies, knowledge graphs, and visual diagrams"
    ),
    termId("semantic diagram"),
    { type: "overview_term_link", label: "applet" }
  );

  // Link to "visual annotation"
  g.createEdgeIfMissing(
    overviewId("Annotating images, video, and audio"),
    termId("visual annotation"),
    { type: "overview_term_link", label: "applet" }
  );

  // Link to "knowledge from diagrams"
  g.createEdgeIfMissing(
    overviewId(
      "Constructing model graphs, ontologies, knowledge graphs, and visual diagrams"
    ),
    termId("knowledge from diagrams"),
    { type: "overview_term_link", label: "applet" }
  );

  // Link to "diagram UX"
  g.createEdgeIfMissing(
    overviewId(
      "Constructing model graphs, ontologies, knowledge graphs, and visual diagrams"
    ),
    termId("diagram UX"),
    { type: "overview_term_link", label: "applet" }
  );

  // Link to "semantic canvas"
  g.createEdgeIfMissing(
    overviewId(
      "Constructing model graphs, ontologies, knowledge graphs, and visual diagrams"
    ),
    termId("semantic canvas"),
    { type: "overview_term_link", label: "applet" }
  );

  // Link to "idea-to-model"
  g.createEdgeIfMissing(
    overviewId(
      "Constructing model graphs, ontologies, knowledge graphs, and visual diagrams"
    ),
    termId("idea-to-model"),
    { type: "overview_term_link", label: "applet" }
  );

  // Link to "visual thought modeling"
  g.createEdgeIfMissing(
    overviewId(
      "Constructing model graphs, ontologies, knowledge graphs, and visual diagrams"
    ),
    termId("visual thought modeling"),
    { type: "overview_term_link", label: "applet" }
  );

  // Link to "diagram generation"
  g.createEdgeIfMissing(
    overviewId(
      "Constructing model graphs, ontologies, knowledge graphs, and visual diagrams"
    ),
    termId("diagram generation"),
    { type: "overview_term_link", label: "applet" }
  );

  // Link to "graph annotation"
  g.createEdgeIfMissing(
    overviewId(
      "Constructing model graphs, ontologies, knowledge graphs, and visual diagrams"
    ),
    termId("graph annotation"),
    { type: "overview_term_link", label: "applet" }
  );

  // Link to "graph composition"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("graph composition"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "graph query"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("graph query"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "graph traversal"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("graph traversal"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "graph-aware interface"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("graph-aware interface"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "metadata enrichment"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("metadata enrichment"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "graph provenance"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("graph provenance"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "graph metrics"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("graph metrics"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "analytical graph"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("analytical graph"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "topological insight"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("topological insight"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "data interconnection"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("data interconnection"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "graph nodes"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("graph nodes"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "graph edges"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("graph edges"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "typed relationships"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("typed relationships"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "logical dependency"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("logical dependency"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "causal flow"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("causal flow"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "citation link"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("citation link"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "UI linkage"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("UI linkage"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "graph ontology"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("graph ontology"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "graph-aware interface"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("graph-aware interface"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "graph annotation"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("graph annotation"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "semantic display"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("semantic display"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "semantic canvas"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("semantic canvas"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "semantic diagram"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("semantic diagram"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "diagram generation"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("diagram generation"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "diagram UX"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("diagram UX"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "diagram layer"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("diagram layer"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "interactive shell"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("interactive shell"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "REPL environment"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("REPL environment"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "programmable interface"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("programmable interface"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "graph manipulation"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("graph manipulation"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "graph completion"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("graph completion"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "AI-assisted modeling"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("AI-assisted modeling"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "cognitive prosthetic"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("cognitive prosthetic"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "assistant tooling"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("assistant tooling"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "diagram assistant"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("diagram assistant"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "diagram recommendation"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("diagram recommendation"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "diagram completion"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("diagram generation"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "diagram annotation"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("visual annotation"),
    { type: "overview_term_link", label: "feature" }
  );

  // Link to "diagram recommendation"
  g.createEdgeIfMissing(
    overviewId("Graph-based Application Library"),
    termId("diagram recommendation"),
    { type: "overview_term_link", label: "feature" }
  );

  return new SceneGraph({
    graph: g,
    metadata: {
      name: "Terms-UnigraphOverview Links",
      description:
        "A graph linking Unigraph Overview nodes to writing terms by semantic and conceptual relationship.",
    },
    defaultAppConfig: {
      activeView: "ReactFlow",
      activeLayout: GraphvizLayoutType.Graphviz_dot,
      activeSceneGraph: "Terms-UnigraphOverview Links",
      windows: {
        showEntityDataCard: false,
      },
      forceGraph3dOptions: {
        layout: "Layout",
      },
      legendMode: "type",
      activeFilter: null,
    },
  });
};
