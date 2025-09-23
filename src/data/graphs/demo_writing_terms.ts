import { GraphvizLayoutType } from "../../core/layouts/GraphvizLayoutType";
import { Graph } from "../../core/model/Graph";
import { SceneGraph } from "../../core/model/SceneGraph";

const TERMS = [
  // Semantic/Knowledge
  { label: "semantic data", tags: ["terms", "semantic data"] },
  { label: "semantic web", tags: ["terms", "semantic web"] },
  { label: "semantic substrate", tags: ["terms", "semantic substrate"] },
  { label: "structured knowledge", tags: ["terms", "structured knowledge"] },
  { label: "knowledge graph", tags: ["terms", "knowledge graph"] },
  { label: "human-centric design", tags: ["terms", "human-centric design"] },
  { label: "composable structure", tags: ["terms", "composable structure"] },
  { label: "modular architecture", tags: ["terms", "modular architecture"] },
  {
    label: "context-aware modeling",
    tags: ["terms", "context-aware modeling"],
  },
  {
    label: "knowledge representation",
    tags: ["terms", "knowledge representation"],
  },
  { label: "logical modeling", tags: ["terms", "logical modeling"] },
  {
    label: "symbolic representation",
    tags: ["terms", "symbolic representation"],
  },
  { label: "semantic reasoning", tags: ["terms", "semantic reasoning"] },
  { label: "formalization", tags: ["terms", "formalization"] },
  {
    label: "perspective-driven modeling",
    tags: ["terms", "perspective-driven modeling"],
  },
  { label: "structured thought", tags: ["terms", "structured thought"] },
  {
    label: "interpretable interface",
    tags: ["terms", "interpretable interface"],
  },
  {
    label: "computational semantics",
    tags: ["terms", "computational semantics"],
  },
  { label: "expressive modeling", tags: ["terms", "expressive modeling"] },
  { label: "cognition modeling", tags: ["terms", "cognition modeling"] },

  // ECS
  { label: "Entity Component System (ECS)", tags: ["terms", "ECS"] },
  { label: "Entity Component System", tags: ["terms", "ECS"] },
  { label: "ECS architecture", tags: ["terms", "ECS"] },
  { label: "entity", tags: ["terms", "entity"] },
  { label: "component", tags: ["terms", "component"] },
  { label: "system", tags: ["terms", "system"] },
  { label: "modular components", tags: ["terms", "modular components"] },
  { label: "lightweight component", tags: ["terms", "lightweight component"] },
  { label: "decoupled logic", tags: ["terms", "decoupled logic"] },
  { label: "flexible schema", tags: ["terms", "flexible schema"] },
  { label: "dynamic behavior", tags: ["terms", "dynamic behavior"] },
  { label: "data-driven design", tags: ["terms", "data-driven design"] },
  { label: "tagging system", tags: ["terms", "tagging system"] },
  { label: "entity typing", tags: ["terms", "entity typing"] },
  { label: "rendering logic", tags: ["terms", "rendering logic"] },
  { label: "display metadata", tags: ["terms", "display metadata"] },
  { label: "component composition", tags: ["terms", "component composition"] },
  { label: "reusable behavior", tags: ["terms", "reusable behavior"] },
  { label: "extensibility", tags: ["terms", "extensibility"] },
  { label: "type system", tags: ["terms", "type system"] },
  { label: "ECS-based interface", tags: ["terms", "ECS-based interface"] },

  // Graph Model
  { label: "graph data model", tags: ["terms", "graph data model"] },
  { label: "graph edges", tags: ["terms", "graph edges"] },
  { label: "graph nodes", tags: ["terms", "graph nodes"] },
  { label: "semantic graph", tags: ["terms", "semantic graph"] },
  { label: "graph ontology", tags: ["terms", "graph ontology"] },
  { label: "typed relationships", tags: ["terms", "typed relationships"] },
  { label: "logical dependency", tags: ["terms", "logical dependency"] },
  { label: "causal flow", tags: ["terms", "causal flow"] },
  { label: "citation link", tags: ["terms", "citation link"] },
  { label: "UI linkage", tags: ["terms", "UI linkage"] },
  { label: "graph traversal", tags: ["terms", "graph traversal"] },
  { label: "graph query", tags: ["terms", "graph query"] },
  { label: "graph-aware interface", tags: ["terms", "graph-aware interface"] },
  { label: "metadata enrichment", tags: ["terms", "metadata enrichment"] },
  { label: "graph provenance", tags: ["terms", "graph provenance"] },
  { label: "graph composition", tags: ["terms", "graph composition"] },
  { label: "data interconnection", tags: ["terms", "data interconnection"] },
  { label: "analytical graph", tags: ["terms", "analytical graph"] },
  { label: "topological insight", tags: ["terms", "topological insight"] },
  { label: "graph metrics", tags: ["terms", "graph metrics"] },

  // SceneGraph & Rendering
  { label: "SceneGraph", tags: ["terms", "SceneGraph"] },
  { label: "layout context", tags: ["terms", "layout context"] },
  { label: "spatial coherence", tags: ["terms", "spatial coherence"] },
  { label: "interactive rendering", tags: ["terms", "interactive rendering"] },
  { label: "dynamic UI", tags: ["terms", "dynamic UI"] },
  { label: "node styling", tags: ["terms", "node styling"] },
  { label: "metrics-based display", tags: ["terms", "metrics-based display"] },
  { label: "visual filter", tags: ["terms", "visual filter"] },
  { label: "layered view", tags: ["terms", "layered view"] },
  { label: "animated transitions", tags: ["terms", "animated transitions"] },
  { label: "focusable subgraph", tags: ["terms", "focusable subgraph"] },
  { label: "collapsible graph", tags: ["terms", "collapsible graph"] },
  {
    label: "draggable graph elements",
    tags: ["terms", "draggable graph elements"],
  },
  { label: "scene layout", tags: ["terms", "scene layout"] },
  { label: "live visualization", tags: ["terms", "live visualization"] },
  { label: "runtime rendering", tags: ["terms", "runtime rendering"] },
  { label: "display manager", tags: ["terms", "display manager"] },
  { label: "visual coherence", tags: ["terms", "visual coherence"] },
  { label: "UI composition", tags: ["terms", "UI composition"] },
  { label: "semantic display", tags: ["terms", "semantic display"] },

  // Interactive Shell
  { label: "command grammar", tags: ["terms", "command grammar"] },
  { label: "structured query", tags: ["terms", "structured query"] },
  { label: "interactive shell", tags: ["terms", "interactive shell"] },
  { label: "semantic shell", tags: ["terms", "semantic shell"] },
  { label: "REPL environment", tags: ["terms", "REPL environment"] },
  { label: "graph commands", tags: ["terms", "graph commands"] },
  {
    label: "natural language query",
    tags: ["terms", "natural language query"],
  },
  {
    label: "programmable interface",
    tags: ["terms", "programmable interface"],
  },
  { label: "shell macros", tags: ["terms", "shell macros"] },
  {
    label: "command autocompletion",
    tags: ["terms", "command autocompletion"],
  },
  { label: "interactive prompt", tags: ["terms", "interactive prompt"] },
  { label: "graph manipulation", tags: ["terms", "graph manipulation"] },
  { label: "diagram generation", tags: ["terms", "diagram generation"] },
  {
    label: "shell-to-graph interface",
    tags: ["terms", "shell-to-graph interface"],
  },
  { label: "visual programming", tags: ["terms", "visual programming"] },
  { label: "structured language", tags: ["terms", "structured language"] },
  { label: "live scripting", tags: ["terms", "live scripting"] },
  { label: "perspective editing", tags: ["terms", "perspective editing"] },
  { label: "declarative commands", tags: ["terms", "declarative commands"] },
  { label: "graph automation", tags: ["terms", "graph automation"] },

  // Copilot & AI
  { label: "Unigraph Copilot", tags: ["terms", "Unigraph Copilot"] },
  { label: "LLM integration", tags: ["terms", "LLM integration"] },
  { label: "zero-shot mapping", tags: ["terms", "zero-shot mapping"] },
  {
    label: "natural language understanding",
    tags: ["terms", "natural language understanding"],
  },
  { label: "intent resolution", tags: ["terms", "intent resolution"] },
  { label: "diagram assistant", tags: ["terms", "diagram assistant"] },
  { label: "multi-step reasoning", tags: ["terms", "multi-step reasoning"] },
  { label: "AI co-creation", tags: ["terms", "AI co-creation"] },
  { label: "language-to-graph", tags: ["terms", "language-to-graph"] },
  { label: "AI planning", tags: ["terms", "AI planning"] },
  { label: "cognitive prosthetic", tags: ["terms", "cognitive prosthetic"] },
  { label: "co-construction", tags: ["terms", "co-construction"] },
  { label: "structure suggestion", tags: ["terms", "structure suggestion"] },
  { label: "graph completion", tags: ["terms", "graph completion"] },
  { label: "semantic translation", tags: ["terms", "semantic translation"] },
  { label: "knowledge scaffolding", tags: ["terms", "knowledge scaffolding"] },
  { label: "assistant tooling", tags: ["terms", "assistant tooling"] },
  { label: "inferencing assistant", tags: ["terms", "inferencing assistant"] },
  {
    label: "diagram recommendation",
    tags: ["terms", "diagram recommendation"],
  },
  { label: "AI-assisted modeling", tags: ["terms", "AI-assisted modeling"] },

  // Web Ecosystem
  { label: "web-based application", tags: ["terms", "web-based application"] },
  { label: "TypeScript/WebGL", tags: ["terms", "TypeScript/WebGL"] },
  { label: "composable app", tags: ["terms", "composable app"] },
  { label: "modular app design", tags: ["terms", "modular app design"] },
  {
    label: "semantic interoperability",
    tags: ["terms", "semantic interoperability"],
  },
  { label: "collaborative tooling", tags: ["terms", "collaborative tooling"] },
  { label: "browser-based editor", tags: ["terms", "browser-based editor"] },
  { label: "graph-first platform", tags: ["terms", "graph-first platform"] },
  { label: "knowledge application", tags: ["terms", "knowledge application"] },
  { label: "diagram renderer", tags: ["terms", "diagram renderer"] },
  { label: "ontology builder", tags: ["terms", "ontology builder"] },
  { label: "research assistant", tags: ["terms", "research assistant"] },
  { label: "web-native framework", tags: ["terms", "web-native framework"] },
  {
    label: "client-side graph engine",
    tags: ["terms", "client-side graph engine"],
  },
  { label: "React for Knowledge", tags: ["terms", "React for Knowledge"] },
  {
    label: "shared graph semantics",
    tags: ["terms", "shared graph semantics"],
  },
  {
    label: "semantic app ecosystem",
    tags: ["terms", "semantic app ecosystem"],
  },
  { label: "federated interfaces", tags: ["terms", "federated interfaces"] },
  { label: "plug-in architecture", tags: ["terms", "plug-in architecture"] },
  { label: "human-scale web apps", tags: ["terms", "human-scale web apps"] },

  // Diagram Tooling
  { label: "semantic diagram", tags: ["terms", "semantic diagram"] },
  { label: "executable diagram", tags: ["terms", "executable diagram"] },
  { label: "diagram layer", tags: ["terms", "diagram layer"] },
  { label: "visual annotation", tags: ["terms", "visual annotation"] },
  { label: "image-backed graph", tags: ["terms", "image-backed graph"] },
  {
    label: "shape-based composition",
    tags: ["terms", "shape-based composition"],
  },
  { label: "nested reference", tags: ["terms", "nested reference"] },
  {
    label: "ontology reverse engineering",
    tags: ["terms", "ontology reverse engineering"],
  },
  { label: "spatial reasoning", tags: ["terms", "spatial reasoning"] },
  { label: "whiteboard modeling", tags: ["terms", "whiteboard modeling"] },
  { label: "graph annotation", tags: ["terms", "graph annotation"] },
  {
    label: "knowledge from diagrams",
    tags: ["terms", "knowledge from diagrams"],
  },
  { label: "visual linkages", tags: ["terms", "visual linkages"] },
  { label: "embedded graph", tags: ["terms", "embedded graph"] },
  { label: "compositional drawing", tags: ["terms", "compositional drawing"] },
  {
    label: "interactive shape graph",
    tags: ["terms", "interactive shape graph"],
  },
  { label: "diagram UX", tags: ["terms", "diagram UX"] },
  { label: "semantic canvas", tags: ["terms", "semantic canvas"] },
  { label: "idea-to-model", tags: ["terms", "idea-to-model"] },
  {
    label: "visual thought modeling",
    tags: ["terms", "visual thought modeling"],
  },

  // Foundations of Geometry / Logic
  { label: "axiomatic system", tags: ["terms", "axiomatic system"] },
  { label: "primitive notion", tags: ["terms", "primitive notion"] },
  { label: "logical consequence", tags: ["terms", "logical consequence"] },
  { label: "formal axiom", tags: ["terms", "formal axiom"] },
  { label: "theorem", tags: ["terms", "theorem"] },
  { label: "model theory", tags: ["terms", "model theory"] },
  { label: "consistency", tags: ["terms", "consistency"] },
  { label: "completeness", tags: ["terms", "completeness"] },
  { label: "independence", tags: ["terms", "independence"] },
  { label: "categoricity", tags: ["terms", "categoricity"] },
  { label: "isomorphism", tags: ["terms", "isomorphism"] },
  { label: "postulate", tags: ["terms", "postulate"] },
  { label: "Euclidean geometry", tags: ["terms", "Euclidean geometry"] },
  {
    label: "non-Euclidean geometry",
    tags: ["terms", "non-Euclidean geometry"],
  },
  { label: "geometry foundations", tags: ["terms", "geometry foundations"] },
  { label: "formal system", tags: ["terms", "formal system"] },
  {
    label: "incidence relationship",
    tags: ["terms", "incidence relationship"],
  },
  { label: "deductive structure", tags: ["terms", "deductive structure"] },
  { label: "logical derivation", tags: ["terms", "logical derivation"] },
  { label: "axiom model", tags: ["terms", "axiom model"] },

  // Knowledge Architecture & Philosophy
  { label: "system architecture", tags: ["terms", "system architecture"] },
  { label: "compositional system", tags: ["terms", "compositional system"] },
  { label: "emergent structure", tags: ["terms", "emergent structure"] },
  { label: "interpretative model", tags: ["terms", "interpretative model"] },
  { label: "conceptual modeling", tags: ["terms", "conceptual modeling"] },
  { label: "symbolic system", tags: ["terms", "symbolic system"] },
  { label: "information substrate", tags: ["terms", "information substrate"] },
  { label: "model-based interface", tags: ["terms", "model-based interface"] },
  { label: "logic and meaning", tags: ["terms", "logic and meaning"] },
  { label: "abstraction layers", tags: ["terms", "abstraction layers"] },
  {
    label: "philosophical modeling",
    tags: ["terms", "philosophical modeling"],
  },
  { label: "grounded semantics", tags: ["terms", "grounded semantics"] },
  {
    label: "perspective-based system",
    tags: ["terms", "perspective-based system"],
  },
  { label: "design primitive", tags: ["terms", "design primitive"] },
  { label: "knowledge layering", tags: ["terms", "knowledge layering"] },
  { label: "model interpretation", tags: ["terms", "model interpretation"] },
  {
    label: "construction from primitives",
    tags: ["terms", "construction from primitives"],
  },
  {
    label: "building blocks of meaning",
    tags: ["terms", "building blocks of meaning"],
  },
  { label: "abstraction-to-form", tags: ["terms", "abstraction-to-form"] },
  { label: "meta-modeling", tags: ["terms", "meta-modeling"] },
];

const createGraph = (): Graph => {
  const tmp = new SceneGraph();
  const g = tmp.getGraph();

  const root = g.createNode({
    id: "writing_terms_root",
    type: "terms_root",
    label: "Writing Terms",
    userData: {
      description: "Glossary of terms and concepts used in Unigraph writings.",
      tags: ["terms"],
    },
  });

  TERMS.forEach((term, idx) => {
    const node = g.createNode({
      id: `term_${idx}_${term.label.replace(/\s+/g, "_")}`,
      type: "term",
      label: term.label,
      userData: {
        tags: term.tags,
      },
    });
    g.createEdgeIfMissing(root.getId(), node.getId(), {
      type: "terms_edge",
      label: "term",
    });
  });

  return g;
};

export const demo_scenegraph_writing_terms = () => {
  return new SceneGraph({
    graph: createGraph(),
    metadata: {
      name: "Writing Terms",
      description: "Glossary of terms and concepts used in Unigraph writings.",
    },
    defaultAppConfig: {
      activeView: "ReactFlow",
      activeLayout: GraphvizLayoutType.Graphviz_dot,
      activeSceneGraph: "Writing Terms",
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
