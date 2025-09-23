import { GraphvizLayoutType } from "../../core/layouts/GraphvizLayoutType";
import { Graph } from "../../core/model/Graph";
import { SceneGraph } from "../../core/model/SceneGraph";

const createGraph = (): Graph => {
  const tmp = new SceneGraph();
  const g = tmp.getGraph();

  // Root node
  const n1 = g.createNode({
    id: "unigraph_overview",
    type: "unigraph_overview",
    label: "Unigraph Overview",
    userData: {
      description: "An overview of Unigraph's capabilities and features.",
    },
  });

  // Definition node
  const n_definition = g.createNode({
    id: "unigraph_overview_definition",
    type: "unigraph_overview_definition",
    label: "What is Unigraph?",
    userData: {
      description:
        "Unigraph is a next-generation platform for thinking, communicating, and organizing knowledge.",
    },
  });
  g.createEdgeIfMissing(n1.getId(), n_definition.getId(), {
    label: "definition",
    type: "unigraph_overview_edge",
  });

  // Supports node
  const n_supports = g.createNode({
    id: "unigraph_overview_supports",
    type: "unigraph_overview_supports",
    label: "Supports",
    userData: {
      description: "Core capabilities supported by Unigraph.",
    },
  });
  g.createEdgeIfMissing(n1.getId(), n_supports.getId(), {
    label: "supports",
    type: "unigraph_overview_edge",
  });

  // Supported features
  const n_text_media = g.createNode({
    id: "unigraph_overview_supports_text_media",
    type: "unigraph_overview_feature",
    label: "Text and media communication",
    userData: {
      description: "Communicate using text and media.",
    },
  });
  const n_semantic = g.createNode({
    id: "unigraph_overview_supports_semantic",
    type: "unigraph_overview_feature",
    label: "Semantic knowledge modeling",
    userData: {
      description: "Model knowledge semantically.",
    },
  });
  const n_code_data = g.createNode({
    id: "unigraph_overview_supports_code_data",
    type: "unigraph_overview_feature",
    label: "Code, data science, and analytics workflows",
    userData: {
      description: "Integrate code, data science, and analytics.",
    },
  });
  const n_collab = g.createNode({
    id: "unigraph_overview_supports_collab",
    type: "unigraph_overview_feature",
    label: "Collaboration and organizational logic",
    userData: {
      description: "Support collaboration and organizational logic.",
    },
  });

  // Link features to supports
  g.createEdgeIfMissing(n_supports.getId(), n_text_media.getId(), {
    type: "unigraph_overview_edge",
  });
  g.createEdgeIfMissing(n_supports.getId(), n_semantic.getId(), {
    type: "unigraph_overview_edge",
  });
  g.createEdgeIfMissing(n_supports.getId(), n_code_data.getId(), {
    type: "unigraph_overview_edge",
  });
  g.createEdgeIfMissing(n_supports.getId(), n_collab.getId(), {
    type: "unigraph_overview_edge",
  });

  // Vision node
  const n_vision = g.createNode({
    id: "unigraph_overview_vision",
    type: "unigraph_overview_vision",
    label: "Vision",
    userData: {
      description: "The future impact of Unigraph.",
    },
  });
  g.createEdgeIfMissing(n1.getId(), n_vision.getId(), {
    label: "vision",
    type: "unigraph_overview_edge",
  });

  // Web 3.0 statement
  const n_web3 = g.createNode({
    id: "unigraph_overview_vision_web3",
    type: "unigraph_overview_vision_statement",
    label: "Web 3.0",
    userData: {
      description: "If successful, Unigraph would become the face of Web 3.0.",
    },
  });
  g.createEdgeIfMissing(n_vision.getId(), n_web3.getId(), {
    type: "unigraph_overview_edge",
  });

  // --- Human-Centric Codification Subgraph ---

  // Root node for this subgraph
  const n_codification_root = g.createNode({
    id: "unigraph_codification_root",
    type: "unigraph_codification_root",
    label: "Human-Centric Codification",
    userData: {
      description:
        "Unigraph aims to enable codification of systems and knowledge in a way that is human-centric.",
    },
  });

  // Link to Vision node
  g.createEdgeIfMissing(
    "unigraph_overview_vision",
    n_codification_root.getId(),
    {
      type: "unigraph_overview_edge",
      label: "enables",
    }
  );

  // Human interpretable and interactive node
  const n_codification_human = g.createNode({
    id: "unigraph_codification_human",
    type: "unigraph_codification_human",
    label: "Human interpretable and interactive",
    userData: {
      description:
        "Codification should be understandable and interactive for humans.",
    },
  });
  g.createEdgeIfMissing(
    n_codification_root.getId(),
    n_codification_human.getId(),
    {
      type: "unigraph_overview_edge",
    }
  );

  // --- Zettelkasten system node ---
  const n_zettelkasten = g.createNode({
    id: "zettelkasten_system",
    type: "zettelkasten_system",
    label: "Zettelkasten System",
    userData: {
      description:
        'Zettelkasten systems are a note-taking methodology where each note is stored as a discrete "slip", typically representing a single thought. These slips are densely interlinked to reflect how ideas relate, evolve, and give rise to new understanding.',
      url: "https://en.wikipedia.org/wiki/Zettelkasten",
    },
  });
  g.createEdgeIfMissing(n_codification_root.getId(), n_zettelkasten.getId(), {
    type: "unigraph_overview_edge",
    label: "embraces",
  });

  // Unigraph embraces this philosophy node
  const n_unigraph_embraces = g.createNode({
    id: "unigraph_embraces_zettelkasten",
    type: "unigraph_embraces_zettelkasten",
    label: "Unigraph Embraces This Philosophy",
    userData: {
      description: "Unigraph embraces this philosophy at a deeper level.",
    },
  });
  g.createEdgeIfMissing(n_zettelkasten.getId(), n_unigraph_embraces.getId(), {
    type: "unigraph_overview_edge",
  });

  // Bullet points for what an entity can be, all link to Entity
  const entity_examples = [
    {
      id: "entity_note",
      label: "A note",
      description: "An entity can be a note.",
    },
    {
      id: "entity_subgraph",
      label: "A subgraph of ideas",
      description: "An entity can be a subgraph of ideas.",
    },
    {
      id: "entity_tagged_image",
      label: "A tagged image annotation",
      description: "An entity can be a tagged image annotation.",
    },
    {
      id: "entity_live_query",
      label: "A live database query",
      description: "An entity can be a live database query.",
    },
    {
      id: "entity_code_snippet",
      label: "A code snippet with strongly typed inputs/outputs",
      description:
        "An entity can be a code snippet with strongly typed inputs/outputs.",
    },
    {
      id: "entity_comment",
      label: "A comment on another entity",
      description: "An entity can be a comment on another entity.",
    },
  ];
  entity_examples.forEach((ex) => {
    const n = g.createNode({
      id: ex.id,
      type: "unigraph_entity_example",
      label: ex.label,
      userData: {
        description: ex.description,
      },
    });
    g.createEdgeIfMissing(n_unigraph_embraces.getId(), n.getId(), {
      type: "unigraph_overview_edge",
    });
    // Link each example to the Entity node
    g.createEdgeIfMissing(n.getId(), "unigraph_entity_core", {
      type: "unigraph_overview_edge",
      label: "is a kind of",
    });
  });

  // Generalization node
  const n_generalization = g.createNode({
    id: "unigraph_zettelkasten_generalization",
    type: "unigraph_zettelkasten_generalization",
    label: "Generalization",
    userData: {
      description:
        "What Zettelkasten systems offer as note-linking, Unigraph generalizes into a full ontology of linked, typed, and interactive knowledge.",
    },
  });
  g.createEdgeIfMissing(n_unigraph_embraces.getId(), n_generalization.getId(), {
    type: "unigraph_overview_edge",
  });

  // --- Writing Application Subgraph ---

  // Writing application node
  const n_writing_app = g.createNode({
    id: "unigraph_writing_app",
    type: "unigraph_writing_app",
    label: "High-powered Writing Application",
    userData: {
      description: "Unigraph offers a high-powered writing application.",
    },
  });
  g.createEdgeIfMissing(n_codification_root.getId(), n_writing_app.getId(), {
    type: "unigraph_overview_edge",
  });

  // Writing app features
  const writing_features = [
    { id: "tagging", label: "Tagging" },
    { id: "linking", label: "Linking" },
    { id: "typing", label: "Typing" },
    { id: "data_access_controls", label: "Data access controls" },
    { id: "dynamic_structures", label: "Dynamic structures" },
    { id: "spatial_navigation", label: "Spatial navigation and interaction" },
    { id: "codification", label: "Codification" },
  ];
  writing_features.forEach((feature) => {
    const n = g.createNode({
      id: `unigraph_writing_app_${feature.id}`,
      type: "unigraph_writing_app_feature",
      label: feature.label,
      userData: {},
    });
    g.createEdgeIfMissing(n_writing_app.getId(), n.getId(), {
      type: "unigraph_overview_edge",
    });
  });

  // Entity concept node
  const n_entity_core = g.createNode({
    id: "unigraph_entity_core",
    type: "unigraph_entity_core",
    label: "Entity",
    userData: {
      description:
        "At its core, every object in Unigraph is an Entity. An entity is a single unit of data. It can be a sentence, an image, an annotation on an image, a document, a comment on the document, a link between entities, etc.",
    },
  });
  g.createEdgeIfMissing(n_codification_root.getId(), n_entity_core.getId(), {
    type: "unigraph_overview_edge",
    label: "core concept",
  });

  // Features node (legacy, for compatibility)
  const n2 = g.createNode({
    id: "unigraph_overview_features",
    type: "unigraph_overview_features",
    label: "Features",
    userData: {
      description: "Key features of Unigraph.",
    },
  });
  g.createEdgeIfMissing(n1.getId(), n2.getId(), {
    type: "unigraph_overview_edge",
  });

  // --- Organization & Presentation Philosophy ---

  const n_org_philosophy = g.createNode({
    id: "unigraph_org_philosophy",
    type: "unigraph_org_philosophy",
    label: "Organization & Presentation",
    userData: {
      description:
        "It's often easy to jot down the core ideas to a document, and the time consuming aspect is moreso organizing and presenting to various audiences, or keeping the information accuracy.",
    },
  });
  // Link to Human-Centric Codification
  g.createEdgeIfMissing(n_codification_root.getId(), n_org_philosophy.getId(), {
    type: "unigraph_overview_edge",
    label: "addresses",
  });

  // Organization features
  const org_features = [
    {
      id: "org_refine_depth",
      label: "Infinite Depth & Dimension",
      description:
        "Ideas can be refined to infinite levels of depth and dimension.",
    },
    {
      id: "org_navigation",
      label: "Navigation & Inspection",
      description:
        "Clear navigation and inspection of high dimensional information.",
    },
    {
      id: "org_dynamic_materialization",
      label: "Dynamic Materialization",
      description:
        "Dynamic materializations of information for different audiences.",
    },
    {
      id: "org_codification",
      label: "Codification for Linking & Accuracy",
      description: "Codification for linking and accuracy maintenance.",
    },
    {
      id: "org_strong_typing",
      label: "Strong Typing",
      description: "Strong typing for distributed discovery and collaboration.",
    },
  ];
  org_features.forEach((feature) => {
    const n = g.createNode({
      id: feature.id,
      type: "unigraph_org_feature",
      label: feature.label,
      userData: { description: feature.description },
    });
    g.createEdgeIfMissing(n_org_philosophy.getId(), n.getId(), {
      type: "unigraph_overview_edge",
    });
  });

  // --- Interactive Application Applets ---

  const n_applets = g.createNode({
    id: "unigraph_applets",
    type: "unigraph_applets",
    label: "Interactive Application Applets",
    userData: {
      description:
        "Unigraph is an interactive application with applets for various knowledge tasks.",
    },
  });
  // Link to Human-Centric Codification
  g.createEdgeIfMissing(n_codification_root.getId(), n_applets.getId(), {
    type: "unigraph_overview_edge",
    label: "provides",
  });

  const applets = [
    {
      id: "applet_writing",
      label: "Writing documents and text",
      description: "Applets for writing documents and text.",
    },
    {
      id: "applet_annotation",
      label: "Annotating images, video, and audio",
      description: "Applets for annotating images, video, and audio.",
    },
    {
      id: "applet_graphs",
      label:
        "Constructing model graphs, ontologies, knowledge graphs, and visual diagrams",
      description:
        "Applets for constructing model graphs, ontologies, knowledge graphs, and visual diagrams.",
    },
  ];
  applets.forEach((applet) => {
    const n = g.createNode({
      id: applet.id,
      type: "unigraph_applet",
      label: applet.label,
      userData: { description: applet.description },
    });
    g.createEdgeIfMissing(n_applets.getId(), n.getId(), {
      type: "unigraph_overview_edge",
    });
  });

  // --- First-class Graph-based Application Library ---

  const n_graph_library = g.createNode({
    id: "unigraph_graph_library",
    type: "unigraph_graph_library",
    label: "Graph-based Application Library",
    userData: {
      description:
        "Unigraph also aims to offer a first-class graph-based application library.",
    },
  });
  // Link to Human-Centric Codification
  g.createEdgeIfMissing(n_codification_root.getId(), n_graph_library.getId(), {
    type: "unigraph_overview_edge",
    label: "aims for",
  });

  // Superset of other tools
  const n_superset = g.createNode({
    id: "unigraph_superset",
    type: "unigraph_superset",
    label: "Superset of Graphviz, ReactFlow, Obsidian",
    userData: {
      description:
        "It aims to be a superset of Graphviz, ReactFlow, and Obsidian.",
      links: [
        { label: "Graphviz", url: "https://graphviz.org/" },
        { label: "ReactFlow", url: "https://reactflow.dev/" },
        { label: "Obsidian", url: "https://obsidian.md/" },
      ],
    },
  });
  g.createEdgeIfMissing(n_graph_library.getId(), n_superset.getId(), {
    type: "unigraph_overview_edge",
  });

  return g;
};

export const demo_scenegraph_unigraph_overview = () => {
  console.log("Building UnigraphOverview graph...");
  console.log("UnigraphOverview graph built.");

  return new SceneGraph({
    graph: createGraph(),
    metadata: {
      name: "UnigraphOverview",
      description:
        "A graph of the overview of Unigraph's capabilities and features.",
    },
    defaultAppConfig: {
      activeView: "ReactFlow",
      activeLayout: GraphvizLayoutType.Graphviz_dot,
      activeSceneGraph: "UnigraphOverview",
      windows: {
        showEntityDataCard: false, // dev tool
      },
      forceGraph3dOptions: {
        layout: "Layout",
      },
      legendMode: "type",
      activeFilter: null,
    },
  });
};
