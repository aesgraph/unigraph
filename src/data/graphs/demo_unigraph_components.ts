import { GraphvizLayoutType } from "../../core/layouts/GraphvizLayoutType";
import { Graph } from "../../core/model/Graph";
import { SceneGraph } from "../../core/model/SceneGraph";

const createGraph = (): Graph => {
  const tmp = new SceneGraph();
  const g = tmp.getGraph();

  // Root node
  const n_root = g.createNode({
    id: "unigraph_components",
    type: "unigraph_components",
    label: "Unigraph Components",
    userData: {
      description: "Key architectural and conceptual components of Unigraph.",
    },
  });

  // Entity Component System (ECS)
  const n_ecs = g.createNode({
    id: "entity_component_system",
    type: "architecture",
    label: "Entity Component System (ECS)",
    userData: {
      description:
        "Unigraph employs an ECS architecture to manage and render semantic data in a flexible and modular way.",
    },
  });
  g.createEdgeIfMissing(n_root.getId(), n_ecs.getId(), {
    type: "component_edge",
    label: "architecture",
  });

  // ECS: Entities
  const n_entities = g.createNode({
    id: "ecs_entities",
    type: "ecs_concept",
    label: "Entities",
    userData: {
      description:
        "Fundamental units of data, representing any concept—abstract or concrete.",
      examples: ["theorem", "tag", "note", "person"],
    },
  });
  g.createEdgeIfMissing(n_ecs.getId(), n_entities.getId(), {
    type: "component_edge",
    label: "part",
  });

  // ECS: Components
  const n_components = g.createNode({
    id: "ecs_components",
    type: "ecs_concept",
    label: "Components",
    userData: {
      description:
        "Modular pieces of information that attach to entities, such as type, tag, display, metrics, or layout. Lightweight and decoupled.",
    },
  });
  g.createEdgeIfMissing(n_ecs.getId(), n_components.getId(), {
    type: "component_edge",
    label: "part",
  });

  // ECS: Systems
  const n_systems = g.createNode({
    id: "ecs_systems",
    type: "ecs_concept",
    label: "Systems",
    userData: {
      description:
        "Process sets of entities and components to produce behavior, such as rendering, tagging, querying, or layout computation.",
    },
  });
  g.createEdgeIfMissing(n_ecs.getId(), n_systems.getId(), {
    type: "component_edge",
    label: "part",
  });

  // ECS: Benefits
  const n_ecs_benefits = g.createNode({
    id: "ecs_benefits",
    type: "ecs_concept",
    label: "ECS Benefits",
    userData: {
      description:
        "Highly extensible, decouples data logic from rendering logic, enables advanced reasoning and visualization pipelines.",
    },
  });
  g.createEdgeIfMissing(n_ecs.getId(), n_ecs_benefits.getId(), {
    type: "component_edge",
    label: "benefit",
  });

  // Graph
  const n_graph = g.createNode({
    id: "unigraph_graph",
    type: "architecture",
    label: "Graph",
    userData: {
      description:
        "Unified graph data model abstracting ontology, data, and relationships into a composable and explorable structure.",
    },
  });
  g.createEdgeIfMissing(n_root.getId(), n_graph.getId(), {
    type: "component_edge",
    label: "core",
  });

  // Graph: Nodes and Edges
  const n_graph_nodes_edges = g.createNode({
    id: "graph_nodes_edges",
    type: "graph_concept",
    label: "Nodes and Edges",
    userData: {
      description:
        "All nodes (entities) and edges (relationships) are semantically meaningful and typed.",
    },
  });
  g.createEdgeIfMissing(n_graph.getId(), n_graph_nodes_edges.getId(), {
    type: "component_edge",
    label: "structure",
  });

  // Graph: Edge Semantics
  const n_graph_edge_semantics = g.createNode({
    id: "graph_edge_semantics",
    type: "graph_concept",
    label: "Edge Semantics",
    userData: {
      description:
        "Edges may represent logical dependencies, causal flows, citations, UI linkages, or hierarchies.",
    },
  });
  g.createEdgeIfMissing(n_graph.getId(), n_graph_edge_semantics.getId(), {
    type: "component_edge",
    label: "semantics",
  });

  // Graph: Metadata
  const n_graph_metadata = g.createNode({
    id: "graph_metadata",
    type: "graph_concept",
    label: "Graph Metadata",
    userData: {
      description:
        "Graph is enriched with metadata: centrality metrics, timestamps, perspectives, provenance, enabling deep analytical queries.",
    },
  });
  g.createEdgeIfMissing(n_graph.getId(), n_graph_metadata.getId(), {
    type: "component_edge",
    label: "metadata",
  });

  // Graph: Multimodal composition
  const n_graph_multimodal = g.createNode({
    id: "graph_multimodal",
    type: "graph_concept",
    label: "Multimodal Composition",
    userData: {
      description:
        "Supports diagrams, text, code, and data coexisting and interconnecting meaningfully.",
    },
  });
  g.createEdgeIfMissing(n_graph.getId(), n_graph_multimodal.getId(), {
    type: "component_edge",
    label: "feature",
  });

  // Graph: Semantic substrate
  const n_graph_semantic_substrate = g.createNode({
    id: "graph_semantic_substrate",
    type: "graph_concept",
    label: "Semantic Substrate",
    userData: {
      description:
        "The graph is not merely a database—it’s a semantic substrate for constructing interfaces, documentation, and tools that map to human reasoning.",
    },
  });
  g.createEdgeIfMissing(n_graph.getId(), n_graph_semantic_substrate.getId(), {
    type: "component_edge",
    label: "purpose",
  });

  // SceneGraph
  const n_scenegraph = g.createNode({
    id: "scenegraph",
    type: "architecture",
    label: "SceneGraph",
    userData: {
      description:
        "Visual and logical runtime representation of a subset of the graph, rendered interactively within a UI scene.",
    },
  });
  g.createEdgeIfMissing(n_root.getId(), n_scenegraph.getId(), {
    type: "component_edge",
    label: "visualization",
  });

  // SceneGraph: Perspective/Filter/Layout
  const n_scenegraph_context = g.createNode({
    id: "scenegraph_context",
    type: "scenegraph_concept",
    label: "Perspective, Filter, Layout",
    userData: {
      description:
        "Reflects the current perspective, filter, or layout context of a user.",
    },
  });
  g.createEdgeIfMissing(n_scenegraph.getId(), n_scenegraph_context.getId(), {
    type: "component_edge",
    label: "context",
  });

  // SceneGraph: Spatial coherence
  const n_scenegraph_spatial = g.createNode({
    id: "scenegraph_spatial",
    type: "scenegraph_concept",
    label: "Spatial Coherence & Styling",
    userData: {
      description:
        "Maintains spatial coherence, handles dynamic layout updates, and renders nodes/edges with user-configurable styling.",
    },
  });
  g.createEdgeIfMissing(n_scenegraph.getId(), n_scenegraph_spatial.getId(), {
    type: "component_edge",
    label: "responsibility",
  });

  // SceneGraph: Layered views
  const n_scenegraph_layers = g.createNode({
    id: "scenegraph_layers",
    type: "scenegraph_concept",
    label: "Layered Views & UI Composition",
    userData: {
      description:
        "Allows layered views, animations, transitions, and graph-aware UI composition (draggable, focusable, collapsible subgraphs).",
    },
  });
  g.createEdgeIfMissing(n_scenegraph.getId(), n_scenegraph_layers.getId(), {
    type: "component_edge",
    label: "feature",
  });

  // SceneGraph: Decoupling
  const n_scenegraph_decoupling = g.createNode({
    id: "scenegraph_decoupling",
    type: "scenegraph_concept",
    label: "Data/Rendering Decoupling",
    userData: {
      description:
        "Decouples data from rendering via the DisplayManager and is optimized for human-scale interaction.",
    },
  });
  g.createEdgeIfMissing(n_scenegraph.getId(), n_scenegraph_decoupling.getId(), {
    type: "component_edge",
    label: "architecture",
  });

  // SceneGraph: Live interface
  const n_scenegraph_live = g.createNode({
    id: "scenegraph_live",
    type: "scenegraph_concept",
    label: "Live Interactive Interface",
    userData: {
      description:
        "Enables a live, interactive interface for exploring structured thought or system architecture in a user-driven way.",
    },
  });
  g.createEdgeIfMissing(n_scenegraph.getId(), n_scenegraph_live.getId(), {
    type: "component_edge",
    label: "feature",
  });

  // Interactive Shell
  const n_shell = g.createNode({
    id: "interactive_shell",
    type: "architecture",
    label: "Interactive Shell",
    userData: {
      description:
        "Command-and-control interface for querying and manipulating the graph using structured commands or natural language.",
    },
  });
  g.createEdgeIfMissing(n_root.getId(), n_shell.getId(), {
    type: "component_edge",
    label: "interface",
  });

  // Shell: Query/manipulate
  const n_shell_query = g.createNode({
    id: "shell_query",
    type: "shell_concept",
    label: "Query & Manipulate",
    userData: {
      description:
        "Query and manipulate the graph using structured commands or natural language.",
    },
  });
  g.createEdgeIfMissing(n_shell.getId(), n_shell_query.getId(), {
    type: "component_edge",
    label: "feature",
  });

  // Shell: Create/modify/link
  const n_shell_create = g.createNode({
    id: "shell_create_modify",
    type: "shell_concept",
    label: "Create, Modify, Link Entities",
    userData: {
      description:
        'Create, modify, and link entities using commands like: `add node "Concept" tagged "Philosophy" link "Knowledge" -> "Inference" as "depends_on" display view as radial using centrality`',
    },
  });
  g.createEdgeIfMissing(n_shell.getId(), n_shell_create.getId(), {
    type: "component_edge",
    label: "feature",
  });

  // Shell: Scriptable REPL
  const n_shell_repl = g.createNode({
    id: "shell_repl",
    type: "shell_concept",
    label: "Scriptable REPL",
    userData: {
      description:
        "Scriptable REPL environment supporting context-sensitive autocompletion, macros, and programmatic workflows.",
    },
  });
  g.createEdgeIfMissing(n_shell.getId(), n_shell_repl.getId(), {
    type: "component_edge",
    label: "feature",
  });

  // Shell: Programmable interface
  const n_shell_programmable = g.createNode({
    id: "shell_programmable",
    type: "shell_concept",
    label: "Programmable Interface",
    userData: {
      description:
        "Programmable interface for generating diagrams, filtering views, managing perspectives, or launching custom tooling pipelines.",
    },
  });
  g.createEdgeIfMissing(n_shell.getId(), n_shell_programmable.getId(), {
    type: "component_edge",
    label: "feature",
  });

  // Shell: Developer tool & assistant
  const n_shell_devtool = g.createNode({
    id: "shell_devtool",
    type: "shell_concept",
    label: "Developer Tool & Semantic Thinking Assistant",
    userData: {
      description:
        "Acts as both a developer tool and a semantic thinking assistant, bridging structured language and visual interaction.",
    },
  });
  g.createEdgeIfMissing(n_shell.getId(), n_shell_devtool.getId(), {
    type: "component_edge",
    label: "role",
  });

  // Copilot
  const n_copilot = g.createNode({
    id: "unigraph_copilot",
    type: "architecture",
    label: "Copilot",
    userData: {
      description:
        "Intelligent assistant layer powered by LLMs. Interprets user intent and maps it to graph operations, diagram generation, or knowledge structuring.",
    },
  });
  g.createEdgeIfMissing(n_root.getId(), n_copilot.getId(), {
    type: "component_edge",
    label: "assistant",
  });

  // Copilot: Zero-shot translator
  const n_copilot_zero_shot = g.createNode({
    id: "copilot_zero_shot",
    type: "copilot_concept",
    label: "Zero-shot Translator",
    userData: {
      description:
        "Acts as a zero-shot translator from natural language to the internal command grammar of the Interactive Shell or SceneGraph operations.",
    },
  });
  g.createEdgeIfMissing(n_copilot.getId(), n_copilot_zero_shot.getId(), {
    type: "component_edge",
    label: "feature",
  });

  // Copilot: Multi-step planning
  const n_copilot_multistep = g.createNode({
    id: "copilot_multistep",
    type: "copilot_concept",
    label: "Multi-step Planning",
    userData: {
      description:
        "Capable of multi-step planning: scaffolding documentation, building knowledge structures, answering questions, or suggesting optimizations.",
    },
  });
  g.createEdgeIfMissing(n_copilot.getId(), n_copilot_multistep.getId(), {
    type: "component_edge",
    label: "feature",
  });

  // Copilot: Collaborative AI workflows
  const n_copilot_collab = g.createNode({
    id: "copilot_collab",
    type: "copilot_concept",
    label: "Collaborative AI Workflows",
    userData: {
      description:
        "Enables collaborative AI workflows, where user and Copilot co-construct knowledge graphs, diagrams, or systems.",
    },
  });
  g.createEdgeIfMissing(n_copilot.getId(), n_copilot_collab.getId(), {
    type: "component_edge",
    label: "feature",
  });

  // Copilot: Cognitive prosthetic
  const n_copilot_prosthetic = g.createNode({
    id: "copilot_prosthetic",
    type: "copilot_concept",
    label: "Cognitive Prosthetic",
    userData: {
      description:
        "Makes Unigraph not only a tool for experts but also a cognitive prosthetic for students, researchers, and technologists.",
    },
  });
  g.createEdgeIfMissing(n_copilot.getId(), n_copilot_prosthetic.getId(), {
    type: "component_edge",
    label: "role",
  });

  // Web-based Application Ecosystem
  const n_ecosystem = g.createNode({
    id: "unigraph_ecosystem",
    type: "architecture",
    label: "Web-based Graph-based Application Ecosystem",
    userData: {
      description:
        "Unigraph is the foundation of a web-based application ecosystem grounded in graph-based semantics.",
    },
  });
  g.createEdgeIfMissing(n_root.getId(), n_ecosystem.getId(), {
    type: "component_edge",
    label: "ecosystem",
  });

  // Ecosystem: Interoperability
  const n_ecosystem_interop = g.createNode({
    id: "ecosystem_interop",
    type: "ecosystem_concept",
    label: "Interoperability",
    userData: {
      description:
        "Any tool built on Unigraph is fundamentally interoperable with others via shared graph semantics.",
    },
  });
  g.createEdgeIfMissing(n_ecosystem.getId(), n_ecosystem_interop.getId(), {
    type: "component_edge",
    label: "feature",
  });

  // Ecosystem: Composable apps
  const n_ecosystem_composable = g.createNode({
    id: "ecosystem_composable",
    type: "ecosystem_concept",
    label: "Composable Apps",
    userData: {
      description:
        "Apps are composable, allowing features like commenting, tagging, referencing, and layout to be shared across tools.",
    },
  });
  g.createEdgeIfMissing(n_ecosystem.getId(), n_ecosystem_composable.getId(), {
    type: "component_edge",
    label: "feature",
  });

  // Ecosystem: Web standards
  const n_ecosystem_web = g.createNode({
    id: "ecosystem_web",
    type: "ecosystem_concept",
    label: "Web Standards",
    userData: {
      description:
        "Built on web standards (TypeScript/WebGL), designed to run in the browser or on the server, supporting collaborative knowledge management and visualization.",
    },
  });
  g.createEdgeIfMissing(n_ecosystem.getId(), n_ecosystem_web.getId(), {
    type: "component_edge",
    label: "feature",
  });

  // Ecosystem: React for Knowledge
  const n_ecosystem_react = g.createNode({
    id: "ecosystem_react",
    type: "ecosystem_concept",
    label: "React for Knowledge",
    userData: {
      description:
        'Positions Unigraph as the "React for Knowledge"—a modular framework for building and sharing smart, human-centric interfaces for graph-structured data.',
    },
  });
  g.createEdgeIfMissing(n_ecosystem.getId(), n_ecosystem_react.getId(), {
    type: "component_edge",
    label: "vision",
  });

  // Ecosystem: Bridges communities
  const n_ecosystem_bridge = g.createNode({
    id: "ecosystem_bridge",
    type: "ecosystem_concept",
    label: "Bridges Communities",
    userData: {
      description:
        "Bridges knowledge workers, developers, scientists, and creatives in a shared semantic medium.",
    },
  });
  g.createEdgeIfMissing(n_ecosystem.getId(), n_ecosystem_bridge.getId(), {
    type: "component_edge",
    label: "impact",
  });

  // Diagram Tooling
  const n_diagram = g.createNode({
    id: "diagram_tooling",
    type: "architecture",
    label: "Diagram Tooling",
    userData: {
      description:
        "First-class support for diagramming as a primary mode of knowledge expression.",
    },
  });
  g.createEdgeIfMissing(n_root.getId(), n_diagram.getId(), {
    type: "component_edge",
    label: "diagram",
  });

  // Diagram: Semantic linking
  const n_diagram_semantic = g.createNode({
    id: "diagram_semantic_linking",
    type: "diagram_concept",
    label: "Semantic Linking",
    userData: {
      description:
        "Diagrams are semantically linked to the broader knowledge graph.",
    },
  });
  g.createEdgeIfMissing(n_diagram.getId(), n_diagram_semantic.getId(), {
    type: "component_edge",
    label: "feature",
  });

  // Diagram: Layers
  const n_diagram_layers = g.createNode({
    id: "diagram_layers",
    type: "diagram_concept",
    label: "Diagram Layers",
    userData: {
      description:
        "Layers can include freeform shapes, imported images, interactive nodes, edges, and nested references.",
    },
  });
  g.createEdgeIfMissing(n_diagram.getId(), n_diagram_layers.getId(), {
    type: "component_edge",
    label: "feature",
  });

  // Diagram: Reverse ontology construction
  const n_diagram_reverse_ontology = g.createNode({
    id: "diagram_reverse_ontology",
    type: "diagram_concept",
    label: "Reverse Ontology Construction",
    userData: {
      description:
        "Allows diagrams to evolve from intuition or user perspectives into more formal knowledge representations.",
    },
  });
  g.createEdgeIfMissing(n_diagram.getId(), n_diagram_reverse_ontology.getId(), {
    type: "component_edge",
    label: "feature",
  });

  // Diagram: Spatial reasoning
  const n_diagram_spatial = g.createNode({
    id: "diagram_spatial_reasoning",
    type: "diagram_concept",
    label: "Spatial Reasoning & Semantic Linking",
    userData: {
      description:
        "Combines spatial reasoning and semantic linking, making diagrams executable, shareable, and computationally analyzable.",
    },
  });
  g.createEdgeIfMissing(n_diagram.getId(), n_diagram_spatial.getId(), {
    type: "component_edge",
    label: "feature",
  });

  // Diagram: Bridging ideation and engineering
  const n_diagram_bridge = g.createNode({
    id: "diagram_bridge",
    type: "diagram_concept",
    label: "Bridging Ideation and Engineering",
    userData: {
      description:
        "Diagram tooling bridges the gap between freeform visual ideation and structured knowledge engineering.",
    },
  });
  g.createEdgeIfMissing(n_diagram.getId(), n_diagram_bridge.getId(), {
    type: "component_edge",
    label: "impact",
  });

  return g;
};

export const demo_scenegraph_unigraph_components = () => {
  return new SceneGraph({
    graph: createGraph(),
    metadata: {
      name: "Unigraph Components",
      description:
        "A graph of the key architectural and conceptual components of Unigraph.",
    },
    defaultAppConfig: {
      activeView: "ReactFlow",
      activeLayout: GraphvizLayoutType.Graphviz_dot,
      activeSceneGraph: "Unigraph Components",
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
