import { GraphvizLayoutType } from "../../core/layouts/GraphvizLayoutType";
import { mergeIntoSceneGraph } from "../../core/model/mergeSceneGraphs";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";
import { demo_scenegraph_unigraph_components } from "./demo_unigraph_components";
import { demo_scenegraph_writing_terms } from "./demo_writing_terms";

export const demo_scenegraph_components_terms_links = () => {
  // Merge both graphs
  const tmp = new SceneGraph();
  mergeIntoSceneGraph(tmp, demo_scenegraph_unigraph_components());
  mergeIntoSceneGraph(tmp, demo_scenegraph_writing_terms());
  const g = tmp.getGraph();

  // Helper: get node id by label for terms
  function termId(label: string) {
    const node = g
      .getNodes()
      .toArray()
      .find((n) => n.getType() === "term" && n.getLabel() === label);
    return node ? node.getId() : ("not_found" as NodeId);
  }

  // Helper: get node id by label for components
  function compId(label: string): NodeId {
    const node = g
      .getNodes()
      .toArray()
      .find((n) => n.getLabel() === label);
    return node?.getId() ?? ("not_found" as NodeId);
  }

  // ECS
  g.createEdgeIfMissing(
    compId("Entity Component System (ECS)"),
    termId("Entity Component System"),
    { type: "component_term_link", label: "is" }
  );
  g.createEdgeIfMissing(
    compId("Entity Component System (ECS)"),
    termId("ECS architecture"),
    { type: "component_term_link", label: "architecture" }
  );
  g.createEdgeIfMissing(compId("Entities"), termId("entity"), {
    type: "component_term_link",
    label: "is",
  });
  g.createEdgeIfMissing(compId("Components"), termId("component"), {
    type: "component_term_link",
    label: "is",
  });
  g.createEdgeIfMissing(compId("Systems"), termId("system"), {
    type: "component_term_link",
    label: "is",
  });
  g.createEdgeIfMissing(compId("Components"), termId("modular components"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Components"), termId("lightweight component"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Components"), termId("decoupled logic"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Components"), termId("flexible schema"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Systems"), termId("dynamic behavior"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(
    compId("Entity Component System (ECS)"),
    termId("data-driven design"),
    { type: "component_term_link", label: "property" }
  );
  g.createEdgeIfMissing(compId("Components"), termId("tagging system"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Entities"), termId("entity typing"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Systems"), termId("rendering logic"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Components"), termId("display metadata"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Components"), termId("component composition"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Systems"), termId("reusable behavior"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(
    compId("Entity Component System (ECS)"),
    termId("extensibility"),
    { type: "component_term_link", label: "property" }
  );
  g.createEdgeIfMissing(compId("Entities"), termId("type system"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(
    compId("Entity Component System (ECS)"),
    termId("ECS-based interface"),
    { type: "component_term_link", label: "property" }
  );

  // Graph
  g.createEdgeIfMissing(compId("Graph"), termId("graph data model"), {
    type: "component_term_link",
    label: "is",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("semantic graph"), {
    type: "component_term_link",
    label: "is",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("graph ontology"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("typed relationships"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("graph nodes"), {
    type: "component_term_link",
    label: "contains",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("graph edges"), {
    type: "component_term_link",
    label: "contains",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("logical dependency"), {
    type: "component_term_link",
    label: "edge type",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("causal flow"), {
    type: "component_term_link",
    label: "edge type",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("citation link"), {
    type: "component_term_link",
    label: "edge type",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("UI linkage"), {
    type: "component_term_link",
    label: "edge type",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("graph traversal"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("graph query"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("graph-aware interface"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(
    compId("Graph Metadata"),
    termId("metadata enrichment"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(compId("Graph Metadata"), termId("graph provenance"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("graph composition"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("data interconnection"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("analytical graph"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("topological insight"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Graph Metadata"), termId("graph metrics"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("semantic substrate"), {
    type: "component_term_link",
    label: "purpose",
  });

  // SceneGraph
  g.createEdgeIfMissing(compId("SceneGraph"), termId("SceneGraph"), {
    type: "component_term_link",
    label: "is",
  });
  g.createEdgeIfMissing(compId("SceneGraph"), termId("layout context"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("SceneGraph"), termId("spatial coherence"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("SceneGraph"), termId("interactive rendering"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("SceneGraph"), termId("dynamic UI"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("SceneGraph"), termId("node styling"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("SceneGraph"), termId("metrics-based display"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("SceneGraph"), termId("visual filter"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("SceneGraph"), termId("layered view"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("SceneGraph"), termId("animated transitions"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("SceneGraph"), termId("focusable subgraph"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("SceneGraph"), termId("collapsible graph"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(
    compId("SceneGraph"),
    termId("draggable graph elements"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(compId("SceneGraph"), termId("scene layout"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("SceneGraph"), termId("live visualization"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("SceneGraph"), termId("runtime rendering"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("SceneGraph"), termId("display manager"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("SceneGraph"), termId("visual coherence"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("SceneGraph"), termId("UI composition"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("SceneGraph"), termId("semantic display"), {
    type: "component_term_link",
    label: "feature",
  });

  // Interactive Shell
  g.createEdgeIfMissing(
    compId("Interactive Shell"),
    termId("interactive shell"),
    { type: "component_term_link", label: "is" }
  );
  g.createEdgeIfMissing(
    compId("Interactive Shell"),
    termId("command grammar"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Interactive Shell"),
    termId("structured query"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(compId("Interactive Shell"), termId("semantic shell"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(
    compId("Interactive Shell"),
    termId("REPL environment"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(compId("Interactive Shell"), termId("graph commands"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(
    compId("Interactive Shell"),
    termId("natural language query"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Interactive Shell"),
    termId("programmable interface"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(compId("Interactive Shell"), termId("shell macros"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(
    compId("Interactive Shell"),
    termId("command autocompletion"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Interactive Shell"),
    termId("interactive prompt"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Interactive Shell"),
    termId("graph manipulation"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Interactive Shell"),
    termId("diagram generation"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Interactive Shell"),
    termId("shell-to-graph interface"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Interactive Shell"),
    termId("visual programming"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Interactive Shell"),
    termId("structured language"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(compId("Interactive Shell"), termId("live scripting"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(
    compId("Interactive Shell"),
    termId("perspective editing"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Interactive Shell"),
    termId("declarative commands"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Interactive Shell"),
    termId("graph automation"),
    { type: "component_term_link", label: "feature" }
  );

  // Copilot & AI
  g.createEdgeIfMissing(compId("Copilot"), termId("Unigraph Copilot"), {
    type: "component_term_link",
    label: "is",
  });
  g.createEdgeIfMissing(compId("Copilot"), termId("LLM integration"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Copilot"), termId("zero-shot mapping"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(
    compId("Copilot"),
    termId("natural language understanding"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(compId("Copilot"), termId("intent resolution"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Copilot"), termId("diagram assistant"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Copilot"), termId("multi-step reasoning"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Copilot"), termId("AI co-creation"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Copilot"), termId("language-to-graph"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Copilot"), termId("AI planning"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Copilot"), termId("cognitive prosthetic"), {
    type: "component_term_link",
    label: "role",
  });
  g.createEdgeIfMissing(compId("Copilot"), termId("co-construction"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Copilot"), termId("structure suggestion"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Copilot"), termId("graph completion"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Copilot"), termId("semantic translation"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Copilot"), termId("knowledge scaffolding"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Copilot"), termId("assistant tooling"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Copilot"), termId("inferencing assistant"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Copilot"), termId("diagram recommendation"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Copilot"), termId("AI-assisted modeling"), {
    type: "component_term_link",
    label: "feature",
  });

  // Web Ecosystem
  g.createEdgeIfMissing(
    compId("Web-based Graph-based Application Ecosystem"),
    termId("web-based application"),
    { type: "component_term_link", label: "is" }
  );
  g.createEdgeIfMissing(
    compId("Web-based Graph-based Application Ecosystem"),
    termId("TypeScript/WebGL"),
    { type: "component_term_link", label: "technology" }
  );
  g.createEdgeIfMissing(
    compId("Web-based Graph-based Application Ecosystem"),
    termId("composable app"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Web-based Graph-based Application Ecosystem"),
    termId("modular app design"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Web-based Graph-based Application Ecosystem"),
    termId("semantic interoperability"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Web-based Graph-based Application Ecosystem"),
    termId("collaborative tooling"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Web-based Graph-based Application Ecosystem"),
    termId("browser-based editor"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Web-based Graph-based Application Ecosystem"),
    termId("graph-first platform"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Web-based Graph-based Application Ecosystem"),
    termId("knowledge application"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Web-based Graph-based Application Ecosystem"),
    termId("diagram renderer"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Web-based Graph-based Application Ecosystem"),
    termId("ontology builder"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Web-based Graph-based Application Ecosystem"),
    termId("research assistant"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Web-based Graph-based Application Ecosystem"),
    termId("web-native framework"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Web-based Graph-based Application Ecosystem"),
    termId("client-side graph engine"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Web-based Graph-based Application Ecosystem"),
    termId("React for Knowledge"),
    { type: "component_term_link", label: "vision" }
  );
  g.createEdgeIfMissing(
    compId("Web-based Graph-based Application Ecosystem"),
    termId("shared graph semantics"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Web-based Graph-based Application Ecosystem"),
    termId("semantic app ecosystem"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Web-based Graph-based Application Ecosystem"),
    termId("federated interfaces"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Web-based Graph-based Application Ecosystem"),
    termId("plug-in architecture"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Web-based Graph-based Application Ecosystem"),
    termId("human-scale web apps"),
    { type: "component_term_link", label: "feature" }
  );

  // Diagram Tooling
  g.createEdgeIfMissing(compId("Diagram Tooling"), termId("semantic diagram"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(
    compId("Diagram Tooling"),
    termId("executable diagram"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(compId("Diagram Tooling"), termId("diagram layer"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(
    compId("Diagram Tooling"),
    termId("visual annotation"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Diagram Tooling"),
    termId("image-backed graph"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Diagram Tooling"),
    termId("shape-based composition"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(compId("Diagram Tooling"), termId("nested reference"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(
    compId("Diagram Tooling"),
    termId("ontology reverse engineering"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Diagram Tooling"),
    termId("spatial reasoning"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Diagram Tooling"),
    termId("whiteboard modeling"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(compId("Diagram Tooling"), termId("graph annotation"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(
    compId("Diagram Tooling"),
    termId("knowledge from diagrams"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(compId("Diagram Tooling"), termId("visual linkages"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Diagram Tooling"), termId("embedded graph"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(
    compId("Diagram Tooling"),
    termId("compositional drawing"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(
    compId("Diagram Tooling"),
    termId("interactive shape graph"),
    { type: "component_term_link", label: "feature" }
  );
  g.createEdgeIfMissing(compId("Diagram Tooling"), termId("diagram UX"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Diagram Tooling"), termId("semantic canvas"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(compId("Diagram Tooling"), termId("idea-to-model"), {
    type: "component_term_link",
    label: "feature",
  });
  g.createEdgeIfMissing(
    compId("Diagram Tooling"),
    termId("visual thought modeling"),
    { type: "component_term_link", label: "feature" }
  );

  // General semantic/knowledge terms
  g.createEdgeIfMissing(compId("Graph"), termId("semantic data"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("structured knowledge"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("knowledge graph"), {
    type: "component_term_link",
    label: "is",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("knowledge representation"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("logical modeling"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("symbolic representation"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("semantic reasoning"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("formalization"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(
    compId("Graph"),
    termId("perspective-driven modeling"),
    { type: "component_term_link", label: "property" }
  );
  g.createEdgeIfMissing(compId("Graph"), termId("structured thought"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("interpretable interface"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("computational semantics"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("expressive modeling"), {
    type: "component_term_link",
    label: "property",
  });
  g.createEdgeIfMissing(compId("Graph"), termId("cognition modeling"), {
    type: "component_term_link",
    label: "property",
  });

  // Human-centric design
  g.createEdgeIfMissing(
    compId("Unigraph Components"),
    termId("human-centric design"),
    { type: "component_term_link", label: "principle" }
  );

  // Modular architecture
  g.createEdgeIfMissing(
    compId("Unigraph Components"),
    termId("modular architecture"),
    { type: "component_term_link", label: "principle" }
  );

  // Composable structure
  g.createEdgeIfMissing(compId("Graph"), termId("composable structure"), {
    type: "component_term_link",
    label: "property",
  });

  // Context-aware modeling
  g.createEdgeIfMissing(
    compId("SceneGraph"),
    termId("context-aware modeling"),
    { type: "component_term_link", label: "property" }
  );

  // Add more as needed...

  return new SceneGraph({
    graph: g,
    metadata: {
      name: "Components-Terms Links",
      description:
        "A graph linking Unigraph components to writing terms by semantic and architectural relationship.",
    },
    defaultAppConfig: {
      activeView: "ReactFlow",
      activeLayout: GraphvizLayoutType.Graphviz_dot,
      activeSceneGraph: "Components-Terms Links",
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
