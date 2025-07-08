import { GraphvizLayoutType } from "../../core/layouts/GraphvizLayoutType";
import { mergeIntoSceneGraph } from "../../core/model/mergeSceneGraphs";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";
import { demo_scenegraph_notes_axiomatic_systems_and_primitives } from "./demo_notes_axiomatic_systems_and_primitives";
import { demo_scenegraph_writing_terms } from "./demo_writing_terms";

export const demo_scenegraph_terms_axiomatic_links = () => {
  // Merge both graphs
  const tmp = new SceneGraph();
  mergeIntoSceneGraph(tmp, demo_scenegraph_writing_terms());
  mergeIntoSceneGraph(
    tmp,
    demo_scenegraph_notes_axiomatic_systems_and_primitives()
  );
  const g = tmp.getGraph();

  // Helper: get node id by label for terms
  function termId(label: string) {
    const node = g
      .getNodes()
      .toArray()
      .find((n) => n.getType() === "term" && n.getLabel() === label);
    return node ? node.getId() : ("not found" as NodeId);
  }

  // Helper: get node id by label for axiomatic/notes nodes
  function notesId(label: string) {
    const node = g
      .getNodes()
      .toArray()
      .find((n) => n.getLabel() === label);
    return node ? node.getId() : ("not found" as NodeId);
  }

  // Foundations of Geometry / Logic
  g.createEdgeIfMissing(
    termId("axiomatic system"),
    notesId("Axiomatic System"),
    { type: "term_note_link", label: "explained by" }
  );
  g.createEdgeIfMissing(termId("formal system"), notesId("Axiomatic System"), {
    type: "term_note_link",
    label: "is",
  });
  g.createEdgeIfMissing(
    termId("geometry foundations"),
    notesId("Foundations of Geometry"),
    { type: "term_note_link", label: "is" }
  );
  g.createEdgeIfMissing(
    termId("Euclidean geometry"),
    notesId("Foundations of Geometry"),
    { type: "term_note_link", label: "example of" }
  );
  g.createEdgeIfMissing(
    termId("non-Euclidean geometry"),
    notesId("Foundations of Geometry"),
    { type: "term_note_link", label: "example of" }
  );
  g.createEdgeIfMissing(
    termId("axiom model"),
    notesId("Interpretation & Model"),
    { type: "term_note_link", label: "explained by" }
  );
  g.createEdgeIfMissing(
    termId("model theory"),
    notesId("Interpretation & Model"),
    { type: "term_note_link", label: "explained by" }
  );
  g.createEdgeIfMissing(
    termId("model interpretation"),
    notesId("Interpretation & Model"),
    { type: "term_note_link", label: "related concept" }
  );
  g.createEdgeIfMissing(
    termId("perspective-based system"),
    notesId("Interpretation & Model"),
    { type: "term_note_link", label: "related concept" }
  );
  g.createEdgeIfMissing(
    termId("grounded semantics"),
    notesId("Interpretation & Model"),
    { type: "term_note_link", label: "related concept" }
  );
  g.createEdgeIfMissing(
    termId("interpretative model"),
    notesId("Interpretation & Model"),
    { type: "term_note_link", label: "related concept" }
  );
  g.createEdgeIfMissing(
    termId("model-based interface"),
    notesId("Interpretation & Model"),
    { type: "term_note_link", label: "related concept" }
  );

  // Primitives and Construction
  g.createEdgeIfMissing(
    termId("primitive notion"),
    notesId("Primitives (Undefined Terms)"),
    { type: "term_note_link", label: "explained by" }
  );
  g.createEdgeIfMissing(
    termId("design primitive"),
    notesId("Primitives (Undefined Terms)"),
    { type: "term_note_link", label: "related concept" }
  );
  g.createEdgeIfMissing(
    termId("construction from primitives"),
    notesId("Primitives (Undefined Terms)"),
    { type: "term_note_link", label: "related concept" }
  );
  g.createEdgeIfMissing(
    termId("building blocks of meaning"),
    notesId("Axioms Are Building Blocks"),
    { type: "term_note_link", label: "explained by" }
  );

  // Axioms, Postulates, and Logic
  g.createEdgeIfMissing(
    termId("formal axiom"),
    notesId("Axioms (Postulates)"),
    { type: "term_note_link", label: "explained by" }
  );
  g.createEdgeIfMissing(termId("postulate"), notesId("Axioms (Postulates)"), {
    type: "term_note_link",
    label: "explained by",
  });
  g.createEdgeIfMissing(
    termId("axiomatic system"),
    notesId("Axioms (Postulates)"),
    { type: "term_note_link", label: "uses" }
  );
  g.createEdgeIfMissing(termId("consistency"), notesId("Consistency"), {
    type: "term_note_link",
    label: "explained by",
  });
  g.createEdgeIfMissing(termId("completeness"), notesId("Completeness"), {
    type: "term_note_link",
    label: "explained by",
  });
  g.createEdgeIfMissing(termId("independence"), notesId("Independence"), {
    type: "term_note_link",
    label: "explained by",
  });
  g.createEdgeIfMissing(termId("categoricity"), notesId("Categoricity"), {
    type: "term_note_link",
    label: "explained by",
  });
  g.createEdgeIfMissing(termId("isomorphism"), notesId("Categoricity"), {
    type: "term_note_link",
    label: "related concept",
  });
  g.createEdgeIfMissing(
    termId("incidence relationship"),
    notesId("Primitives (Undefined Terms)"),
    { type: "term_note_link", label: "explained by" }
  );
  g.createEdgeIfMissing(
    termId("logical consequence"),
    notesId("Theorems Are Logical Consequences"),
    { type: "term_note_link", label: "explained by" }
  );
  g.createEdgeIfMissing(termId("logical derivation"), notesId("Theorems"), {
    type: "term_note_link",
    label: "explained by",
  });
  g.createEdgeIfMissing(termId("theorem"), notesId("Theorems"), {
    type: "term_note_link",
    label: "explained by",
  });
  g.createEdgeIfMissing(
    termId("deductive structure"),
    notesId("Axiomatic System"),
    { type: "term_note_link", label: "explained by" }
  );
  g.createEdgeIfMissing(termId("logic and meaning"), notesId("Laws of Logic"), {
    type: "term_note_link",
    label: "explained by",
  });

  // Knowledge Representation, Symbolic, Conceptual
  g.createEdgeIfMissing(
    termId("knowledge representation"),
    notesId("Axiomatic System"),
    { type: "term_note_link", label: "related concept" }
  );
  g.createEdgeIfMissing(
    termId("conceptual modeling"),
    notesId("Axiomatic System"),
    { type: "term_note_link", label: "related concept" }
  );
  g.createEdgeIfMissing(
    termId("symbolic representation"),
    notesId("Axiomatic System"),
    { type: "term_note_link", label: "related concept" }
  );
  g.createEdgeIfMissing(
    termId("symbolic system"),
    notesId("Axiomatic System"),
    { type: "term_note_link", label: "related concept" }
  );

  // Abstraction, Meta, Layers
  g.createEdgeIfMissing(
    termId("abstraction layers"),
    notesId("Axiomatic System"),
    { type: "term_note_link", label: "related concept" }
  );
  g.createEdgeIfMissing(
    termId("abstraction-to-form"),
    notesId("Axiomatic System"),
    { type: "term_note_link", label: "related concept" }
  );
  g.createEdgeIfMissing(termId("meta-modeling"), notesId("Axiomatic System"), {
    type: "term_note_link",
    label: "related concept",
  });
  g.createEdgeIfMissing(
    termId("knowledge layering"),
    notesId("Axiomatic System"),
    { type: "term_note_link", label: "related concept" }
  );

  // Perspective, Information, Emergence
  g.createEdgeIfMissing(
    termId("perspective-driven modeling"),
    notesId("Interpretation & Model"),
    { type: "term_note_link", label: "related concept" }
  );
  g.createEdgeIfMissing(
    termId("information substrate"),
    notesId("Foundations of Geometry"),
    { type: "term_note_link", label: "related concept" }
  );
  g.createEdgeIfMissing(
    termId("emergent structure"),
    notesId("Foundations of Geometry"),
    { type: "term_note_link", label: "related concept" }
  );

  // Philosophy, System, Structure
  g.createEdgeIfMissing(
    termId("system architecture"),
    notesId("Axiomatic System"),
    { type: "term_note_link", label: "related concept" }
  );
  g.createEdgeIfMissing(
    termId("compositional system"),
    notesId("Axiomatic System"),
    { type: "term_note_link", label: "related concept" }
  );
  g.createEdgeIfMissing(
    termId("philosophical modeling"),
    notesId("Axiomatic System"),
    { type: "term_note_link", label: "related concept" }
  );

  // Miscellaneous
  g.createEdgeIfMissing(termId("formalization"), notesId("Axiomatic System"), {
    type: "term_note_link",
    label: "related concept",
  });
  g.createEdgeIfMissing(
    termId("structured knowledge"),
    notesId("Axiomatic System"),
    { type: "term_note_link", label: "related concept" }
  );
  g.createEdgeIfMissing(
    termId("structured thought"),
    notesId("Axiomatic System"),
    { type: "term_note_link", label: "related concept" }
  );
  g.createEdgeIfMissing(
    termId("expressive modeling"),
    notesId("Axiomatic System"),
    { type: "term_note_link", label: "related concept" }
  );

  // Connect terms to Euclid's Postulates and Elements
  g.createEdgeIfMissing(termId("postulate"), notesId("Euclid's Postulates"), {
    type: "term_note_link",
    label: "example",
  });
  g.createEdgeIfMissing(
    termId("Euclidean geometry"),
    notesId("Euclid's Postulates"),
    { type: "term_note_link", label: "example" }
  );
  g.createEdgeIfMissing(
    termId("Euclidean geometry"),
    notesId("Euclid's Elements"),
    { type: "term_note_link", label: "legacy" }
  );
  g.createEdgeIfMissing(
    termId("axiomatic system"),
    notesId("Euclid's Elements"),
    { type: "term_note_link", label: "legacy" }
  );

  // Connect terms to statements/facts
  g.createEdgeIfMissing(
    termId("axiomatic system"),
    notesId("Several Components of an Axiomatic System"),
    { type: "term_note_link", label: "explained by" }
  );
  g.createEdgeIfMissing(
    termId("axiomatic system"),
    notesId("Several Sets of Axioms"),
    { type: "term_note_link", label: "explained by" }
  );
  g.createEdgeIfMissing(
    termId("axiomatic system"),
    notesId("Based on Ancient Greek Methods"),
    { type: "term_note_link", label: "origin" }
  );
  g.createEdgeIfMissing(
    termId("axiomatic system"),
    notesId("Applicable to Any Area of Mathematics"),
    { type: "term_note_link", label: "scope" }
  );

  // Connect terms to logic
  g.createEdgeIfMissing(termId("logic and meaning"), notesId("Laws of Logic"), {
    type: "term_note_link",
    label: "explained by",
  });

  // Connect terms to "remark" and "example"
  g.createEdgeIfMissing(
    termId("primitive notion"),
    notesId("Hilbert's Remark"),
    { type: "term_note_link", label: "remark" }
  );
  g.createEdgeIfMissing(termId("axiomatic system"), notesId("Example Axiom"), {
    type: "term_note_link",
    label: "example",
  });

  // Connect terms to properties
  g.createEdgeIfMissing(
    termId("consistency"),
    notesId("Consistency and Models"),
    { type: "term_note_link", label: "fact" }
  );
  g.createEdgeIfMissing(
    termId("independence"),
    notesId("Logical Consequence and Independence"),
    { type: "term_note_link", label: "fact" }
  );
  g.createEdgeIfMissing(
    termId("independence"),
    notesId("Proving Independence"),
    { type: "term_note_link", label: "fact" }
  );
  g.createEdgeIfMissing(
    termId("independence"),
    notesId("Independence Not Always Desirable Pedagogically"),
    { type: "term_note_link", label: "fact" }
  );
  g.createEdgeIfMissing(
    termId("categoricity"),
    notesId("Categoricity Not Always Desirable"),
    { type: "term_note_link", label: "fact" }
  );
  g.createEdgeIfMissing(
    termId("categoricity"),
    notesId("Group Theory Value in Non-Categoricity"),
    { type: "term_note_link", label: "fact" }
  );

  // Connect terms to model/interpretation facts
  g.createEdgeIfMissing(termId("axiom model"), notesId("Model Definition"), {
    type: "term_note_link",
    label: "definition",
  });
  g.createEdgeIfMissing(
    termId("theorem"),
    notesId("Theorems Are True in a Model"),
    { type: "term_note_link", label: "fact" }
  );

  // Connect terms to Euclid's postulates
  g.createEdgeIfMissing(termId("postulate"), notesId("Postulate 1"), {
    type: "term_note_link",
    label: "example",
  });
  g.createEdgeIfMissing(termId("postulate"), notesId("Postulate 2"), {
    type: "term_note_link",
    label: "example",
  });
  g.createEdgeIfMissing(termId("postulate"), notesId("Postulate 3"), {
    type: "term_note_link",
    label: "example",
  });
  g.createEdgeIfMissing(termId("postulate"), notesId("Postulate 4"), {
    type: "term_note_link",
    label: "example",
  });
  g.createEdgeIfMissing(termId("postulate"), notesId("Parallel Postulate"), {
    type: "term_note_link",
    label: "example",
  });

  // Connect terms to existence/uniqueness
  g.createEdgeIfMissing(
    termId("axiomatic system"),
    notesId("Existence and Uniqueness in Euclid's Postulates"),
    { type: "term_note_link", label: "fact" }
  );

  // Connect terms to theorem facts
  g.createEdgeIfMissing(
    termId("theorem"),
    notesId("Theorems Are Logical Consequences"),
    { type: "term_note_link", label: "fact" }
  );

  // Connect terms to completeness/categoricity relationship
  g.createEdgeIfMissing(termId("completeness"), notesId("Categoricity"), {
    type: "term_note_link",
    label: "relationship",
  });

  // Connect terms to teaching/importance
  g.createEdgeIfMissing(
    termId("axiomatic system"),
    notesId("Completeness and Independence Are Important"),
    { type: "term_note_link", label: "importance" }
  );
  g.createEdgeIfMissing(
    termId("axiomatic system"),
    notesId("Issues with Teaching Geometry"),
    { type: "term_note_link", label: "teaching" }
  );

  // Connect terms to modern geometry
  g.createEdgeIfMissing(
    termId("non-Euclidean geometry"),
    notesId("Many Modern Geometries Are Not Euclidean"),
    { type: "term_note_link", label: "fact" }
  );

  // Connect terms to term/statement relationships as needed...

  return new SceneGraph({
    graph: g,
    metadata: {
      name: "Terms-Axiomatic Links",
      description:
        "A graph linking writing terms to nodes in the Axiomatic Systems and Primitives graph.",
    },
    defaultAppConfig: {
      activeView: "ReactFlow",
      activeLayout: GraphvizLayoutType.Graphviz_dot,
      activeSceneGraph: "Terms-Axiomatic Links",
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
