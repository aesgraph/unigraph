import { GraphvizLayoutType } from "../../core/layouts/GraphvizLayoutType";
import { Graph } from "../../core/model/Graph";
import { SceneGraph } from "../../core/model/SceneGraph";

const createGraph = (): Graph => {
  const tmp = new SceneGraph();
  const g = tmp.getGraph();

  // Root node
  const n_root = g.createNode({
    id: "axiomatic_systems_and_primitives",
    type: "axiomatic_systems_and_primitives",
    label: "Axiomatic Systems and Primitives",
    userData: {
      description:
        "Foundations of geometry and mathematics: axiomatic systems, primitives, and their properties.",
      source: "Adapted from Wikipedia: Foundations of Geometry (CC BY-SA).",
    },
  });

  // Foundations of geometry
  const n_foundations = g.createNode({
    id: "foundations_of_geometry",
    type: "concept",
    label: "Foundations of Geometry",
    userData: {
      description:
        "The study of geometries as axiomatic systems. Includes Euclidean and non-Euclidean geometries.",
      url: "https://en.wikipedia.org/wiki/Foundations_of_geometry",
    },
  });
  g.createEdgeIfMissing(n_root.getId(), n_foundations.getId(), {
    type: "axiomatic_edge",
    label: "context",
  });

  // Statement: Several sets of axioms give rise to Euclidean or non-Euclidean geometry
  const n_several_axioms = g.createNode({
    id: "several_axioms_euclidean_noneuclidean",
    type: "statement",
    label: "Several Sets of Axioms",
    userData: {
      description:
        "There are several sets of axioms which give rise to Euclidean geometry or to non-Euclidean geometries.",
    },
  });
  g.createEdgeIfMissing(n_foundations.getId(), n_several_axioms.getId(), {
    type: "axiomatic_edge",
    label: "fact",
  });

  // Statement: Fundamental to study and historical importance
  const n_fundamental_importance = g.createNode({
    id: "fundamental_importance",
    type: "statement",
    label: "Fundamental and Historical Importance",
    userData: {
      description:
        "These are fundamental to the study and of historical importance.",
    },
  });
  g.createEdgeIfMissing(
    n_several_axioms.getId(),
    n_fundamental_importance.getId(),
    {
      type: "axiomatic_edge",
      label: "fact",
    }
  );

  // Statement: Many modern geometries are not Euclidean
  const n_modern_geometries = g.createNode({
    id: "modern_geometries_not_euclidean",
    type: "statement",
    label: "Many Modern Geometries Are Not Euclidean",
    userData: {
      description:
        "There are a great many modern geometries that are not Euclidean which can be studied from this viewpoint.",
    },
  });
  g.createEdgeIfMissing(n_foundations.getId(), n_modern_geometries.getId(), {
    type: "axiomatic_edge",
    label: "fact",
  });

  // Statement: Axiomatic geometry term
  const n_axiomatic_geometry_term = g.createNode({
    id: "axiomatic_geometry_term",
    type: "statement",
    label: "Axiomatic Geometry Term",
    userData: {
      description:
        "The term axiomatic geometry can be applied to any geometry that is developed from an axiom system, but is often used to mean Euclidean geometry studied from this point of view.",
    },
  });
  g.createEdgeIfMissing(
    n_foundations.getId(),
    n_axiomatic_geometry_term.getId(),
    {
      type: "axiomatic_edge",
      label: "fact",
    }
  );

  // Statement: Completeness and independence are important
  const n_completeness_independence_important = g.createNode({
    id: "completeness_independence_important",
    type: "statement",
    label: "Completeness and Independence Are Important",
    userData: {
      description:
        "The completeness and independence of general axiomatic systems are important mathematical considerations.",
    },
  });
  g.createEdgeIfMissing(
    n_foundations.getId(),
    n_completeness_independence_important.getId(),
    {
      type: "axiomatic_edge",
      label: "fact",
    }
  );

  // Statement: Issues with teaching geometry
  const n_teaching_issues = g.createNode({
    id: "teaching_issues",
    type: "statement",
    label: "Issues with Teaching Geometry",
    userData: {
      description:
        "There are also issues to do with the teaching of geometry which come into play.",
    },
  });
  g.createEdgeIfMissing(n_foundations.getId(), n_teaching_issues.getId(), {
    type: "axiomatic_edge",
    label: "fact",
  });

  // Axiomatic system
  const n_axiomatic = g.createNode({
    id: "axiomatic_system",
    type: "concept",
    label: "Axiomatic System",
    userData: {
      description:
        "A formal description of a way to establish mathematical truth from a fixed set of assumptions.",
      url: "https://en.wikipedia.org/wiki/Axiomatic_system",
    },
  });
  g.createEdgeIfMissing(n_foundations.getId(), n_axiomatic.getId(), {
    type: "axiomatic_edge",
    label: "core idea",
  });

  // Statement: Based on ancient Greek methods
  const n_greek_methods = g.createNode({
    id: "greek_methods",
    type: "statement",
    label: "Based on Ancient Greek Methods",
    userData: {
      description:
        "Based on ancient Greek methods, an axiomatic system is a formal description of a way to establish the mathematical truth that flows from a fixed set of assumptions.",
    },
  });
  g.createEdgeIfMissing(n_axiomatic.getId(), n_greek_methods.getId(), {
    type: "axiomatic_edge",
    label: "origin",
  });

  // Statement: Applicable to any area of mathematics
  const n_applicable_any_math = g.createNode({
    id: "applicable_any_math",
    type: "statement",
    label: "Applicable to Any Area of Mathematics",
    userData: {
      description:
        "Although applicable to any area of mathematics, geometry is the branch of elementary mathematics in which this method has most extensively been successfully applied.",
    },
  });
  g.createEdgeIfMissing(n_axiomatic.getId(), n_applicable_any_math.getId(), {
    type: "axiomatic_edge",
    label: "scope",
  });

  // Statement: Several components of an axiomatic system
  const n_several_components = g.createNode({
    id: "several_components_axiomatic_system",
    type: "statement",
    label: "Several Components of an Axiomatic System",
    userData: {
      description: "There are several components of an axiomatic system.",
    },
  });
  g.createEdgeIfMissing(n_axiomatic.getId(), n_several_components.getId(), {
    type: "axiomatic_edge",
    label: "fact",
  });

  // Components of an axiomatic system
  const n_components = g.createNode({
    id: "axiomatic_components",
    type: "concept",
    label: "Components of an Axiomatic System",
    userData: {},
  });
  g.createEdgeIfMissing(n_several_components.getId(), n_components.getId(), {
    type: "axiomatic_edge",
    label: "has",
  });

  // Primitives
  const n_primitives = g.createNode({
    id: "axiomatic_primitives",
    type: "concept",
    label: "Primitives (Undefined Terms)",
    userData: {
      description:
        "The most basic ideas: objects and relationships. In geometry, the objects are things like points, lines and planes while a fundamental relationship is that of incidence – of one object meeting or joining with another. The terms themselves are undefined.",
      url: "https://en.wikipedia.org/wiki/Primitive_notion",
    },
  });
  g.createEdgeIfMissing(n_components.getId(), n_primitives.getId(), {
    type: "axiomatic_edge",
    label: "component",
  });

  // Statement: Hilbert's remark about primitives
  const n_hilbert_remark = g.createNode({
    id: "hilbert_remark",
    type: "statement",
    label: "Hilbert's Remark",
    userData: {
      description:
        "Hilbert once remarked that instead of points, lines and planes one might just as well talk of tables, chairs and beer mugs. His point being that the primitive terms are just empty shells, place holders if you will, and have no intrinsic properties.",
      url: "https://en.wikipedia.org/wiki/David_Hilbert",
    },
  });
  g.createEdgeIfMissing(n_primitives.getId(), n_hilbert_remark.getId(), {
    type: "axiomatic_edge",
    label: "remark",
  });

  // Axioms
  const n_axioms = g.createNode({
    id: "axiomatic_axioms",
    type: "concept",
    label: "Axioms (Postulates)",
    userData: {
      description:
        "Axioms (or postulates) are statements about primitives; for example, any two points are together incident with just one line. Axioms are assumed true, and not proven. They are the building blocks of geometric concepts, since they specify the properties that the primitives have.",
      url: "https://en.wikipedia.org/wiki/Axiom",
    },
  });
  g.createEdgeIfMissing(n_components.getId(), n_axioms.getId(), {
    type: "axiomatic_edge",
    label: "component",
  });

  // Statement: Example axiom
  const n_example_axiom = g.createNode({
    id: "example_axiom",
    type: "statement",
    label: "Example Axiom",
    userData: {
      description:
        "For example, any two points are together incident with just one line (i.e. for any two points, there is just one line which passes through both of them).",
    },
  });
  g.createEdgeIfMissing(n_axioms.getId(), n_example_axiom.getId(), {
    type: "axiomatic_edge",
    label: "example",
  });

  // Statement: Axioms are assumed true, not proven
  const n_axioms_assumed_true = g.createNode({
    id: "axioms_assumed_true",
    type: "statement",
    label: "Axioms Are Assumed True, Not Proven",
    userData: {
      description: "Axioms are assumed true, and not proven.",
    },
  });
  g.createEdgeIfMissing(n_axioms.getId(), n_axioms_assumed_true.getId(), {
    type: "axiomatic_edge",
    label: "fact",
  });

  // Statement: Axioms are building blocks
  const n_axioms_building_blocks = g.createNode({
    id: "axioms_building_blocks",
    type: "statement",
    label: "Axioms Are Building Blocks",
    userData: {
      description:
        "Axioms are the building blocks of geometric concepts, since they specify the properties that the primitives have.",
    },
  });
  g.createEdgeIfMissing(n_axioms.getId(), n_axioms_building_blocks.getId(), {
    type: "axiomatic_edge",
    label: "fact",
  });

  // Logic
  const n_logic = g.createNode({
    id: "axiomatic_logic",
    type: "concept",
    label: "Laws of Logic",
    userData: {
      description: "The laws of logic are a component of an axiomatic system.",
      url: "https://en.wikipedia.org/wiki/Logic",
    },
  });
  g.createEdgeIfMissing(n_components.getId(), n_logic.getId(), {
    type: "axiomatic_edge",
    label: "component",
  });

  // Theorems
  const n_theorems = g.createNode({
    id: "axiomatic_theorems",
    type: "concept",
    label: "Theorems",
    userData: {
      description:
        "Theorems are the logical consequences of the axioms, that is, the statements that can be obtained from the axioms by using the laws of deductive logic.",
      url: "https://en.wikipedia.org/wiki/Theorem",
    },
  });
  g.createEdgeIfMissing(n_components.getId(), n_theorems.getId(), {
    type: "axiomatic_edge",
    label: "component",
  });

  // Statement: Theorems are logical consequences
  const n_theorems_logical_consequences = g.createNode({
    id: "theorems_logical_consequences",
    type: "statement",
    label: "Theorems Are Logical Consequences",
    userData: {
      description:
        "Theorems are the logical consequences of the axioms, that is, the statements that can be obtained from the axioms by using the laws of deductive logic.",
    },
  });
  g.createEdgeIfMissing(
    n_theorems.getId(),
    n_theorems_logical_consequences.getId(),
    {
      type: "axiomatic_edge",
      label: "fact",
    }
  );

  // Interpretation and Model
  const n_interpretation = g.createNode({
    id: "axiomatic_interpretation",
    type: "concept",
    label: "Interpretation & Model",
    userData: {
      description:
        "An interpretation of an axiomatic system is some particular way of giving concrete meaning to the primitives of that system. If this association of meanings makes the axioms of the system true statements, then the interpretation is called a model of the system. In a model, all the theorems of the system are automatically true statements.",
      url: "https://en.wikipedia.org/wiki/Model_(mathematical_logic)",
    },
  });
  g.createEdgeIfMissing(n_axiomatic.getId(), n_interpretation.getId(), {
    type: "axiomatic_edge",
    label: "interpretation",
  });

  // Statement: Model definition
  const n_model_definition = g.createNode({
    id: "model_definition",
    type: "statement",
    label: "Model Definition",
    userData: {
      description:
        "If this association of meanings makes the axioms of the system true statements, then the interpretation is called a model of the system.",
    },
  });
  g.createEdgeIfMissing(n_interpretation.getId(), n_model_definition.getId(), {
    type: "axiomatic_edge",
    label: "definition",
  });

  // Statement: Theorems are true in a model
  const n_theorems_true_in_model = g.createNode({
    id: "theorems_true_in_model",
    type: "statement",
    label: "Theorems Are True in a Model",
    userData: {
      description:
        "In a model, all the theorems of the system are automatically true statements.",
    },
  });
  g.createEdgeIfMissing(
    n_interpretation.getId(),
    n_theorems_true_in_model.getId(),
    {
      type: "axiomatic_edge",
      label: "fact",
    }
  );

  // Properties of axiomatic systems
  const n_properties = g.createNode({
    id: "axiomatic_properties",
    type: "concept",
    label: "Properties of Axiomatic Systems",
    userData: {},
  });
  g.createEdgeIfMissing(n_axiomatic.getId(), n_properties.getId(), {
    type: "axiomatic_edge",
    label: "has",
  });

  // Consistency
  const n_consistency = g.createNode({
    id: "axiomatic_consistency",
    type: "property",
    label: "Consistency",
    userData: {
      description:
        "The axioms of an axiomatic system are said to be consistent if no logical contradiction can be derived from them. Except in the simplest systems, consistency is a difficult property to establish in an axiomatic system.",
      url: "https://en.wikipedia.org/wiki/Consistency",
    },
  });
  g.createEdgeIfMissing(n_properties.getId(), n_consistency.getId(), {
    type: "axiomatic_edge",
    label: "property",
  });

  // Statement: Consistency and models
  const n_consistency_model = g.createNode({
    id: "consistency_model",
    type: "statement",
    label: "Consistency and Models",
    userData: {
      description:
        "If a model exists for the axiomatic system, then any contradiction derivable in the system is also derivable in the model, and the axiomatic system is as consistent as any system in which the model belongs. This property (having a model) is referred to as relative consistency or model consistency.",
    },
  });
  g.createEdgeIfMissing(n_consistency.getId(), n_consistency_model.getId(), {
    type: "axiomatic_edge",
    label: "fact",
  });

  // Independence
  const n_independence = g.createNode({
    id: "axiomatic_independence",
    type: "property",
    label: "Independence",
    userData: {
      description:
        "An axiom is called independent if it can not be proved or disproved from the other axioms of the axiomatic system. An axiomatic system is said to be independent if each of its axioms is independent.",
      url: "https://en.wikipedia.org/wiki/Independence_(mathematical_logic)",
    },
  });
  g.createEdgeIfMissing(n_properties.getId(), n_independence.getId(), {
    type: "axiomatic_edge",
    label: "property",
  });

  // Statement: Logical consequence and independence
  const n_logical_consequence = g.createNode({
    id: "logical_consequence_independence",
    type: "statement",
    label: "Logical Consequence and Independence",
    userData: {
      description:
        "If a true statement is a logical consequence of an axiomatic system, then it will be a true statement in every model of that system.",
    },
  });
  g.createEdgeIfMissing(n_independence.getId(), n_logical_consequence.getId(), {
    type: "axiomatic_edge",
    label: "fact",
  });

  // Statement: Proving independence
  const n_proving_independence = g.createNode({
    id: "proving_independence",
    type: "statement",
    label: "Proving Independence",
    userData: {
      description:
        "To prove that an axiom is independent of the remaining axioms of the system, it is sufficient to find two models of the remaining axioms, for which the axiom is a true statement in one and a false statement in the other.",
    },
  });
  g.createEdgeIfMissing(
    n_independence.getId(),
    n_proving_independence.getId(),
    {
      type: "axiomatic_edge",
      label: "fact",
    }
  );

  // Statement: Independence not always desirable pedagogically
  const n_independence_pedagogical = g.createNode({
    id: "independence_pedagogical",
    type: "statement",
    label: "Independence Not Always Desirable Pedagogically",
    userData: {
      description:
        "Independence is not always a desirable property from a pedagogical viewpoint.",
    },
  });
  g.createEdgeIfMissing(
    n_independence.getId(),
    n_independence_pedagogical.getId(),
    {
      type: "axiomatic_edge",
      label: "fact",
    }
  );

  // Completeness
  const n_completeness = g.createNode({
    id: "axiomatic_completeness",
    type: "property",
    label: "Completeness",
    userData: {
      description:
        "An axiomatic system is called complete if every statement expressible in the terms of the system is either provable or has a provable negation. No independent statement can be added to a complete axiomatic system which is consistent with axioms of that system.",
      url: "https://en.wikipedia.org/wiki/Completeness_(logic)",
    },
  });
  g.createEdgeIfMissing(n_properties.getId(), n_completeness.getId(), {
    type: "axiomatic_edge",
    label: "property",
  });

  // Categoricity
  const n_categoricity = g.createNode({
    id: "axiomatic_categoricity",
    type: "property",
    label: "Categoricity",
    userData: {
      description:
        "An axiomatic system is categorical if any two models of the system are isomorphic (essentially, there is only one model for the system). A categorical system is necessarily complete, but completeness does not imply categoricity.",
      url: "https://en.wikipedia.org/wiki/Categorical_theory#History_and_motivation",
    },
  });
  g.createEdgeIfMissing(n_properties.getId(), n_categoricity.getId(), {
    type: "axiomatic_edge",
    label: "property",
  });

  // Statement: Categoricity not always desirable
  const n_categoricity_not_desirable = g.createNode({
    id: "categoricity_not_desirable",
    type: "statement",
    label: "Categoricity Not Always Desirable",
    userData: {
      description:
        "In some situations categoricity is not a desirable property, since categorical axiomatic systems can not be generalized.",
    },
  });
  g.createEdgeIfMissing(
    n_categoricity.getId(),
    n_categoricity_not_desirable.getId(),
    {
      type: "axiomatic_edge",
      label: "fact",
    }
  );

  // Statement: Group theory value in non-categoricity
  const n_group_theory_value = g.createNode({
    id: "group_theory_value",
    type: "statement",
    label: "Group Theory Value in Non-Categoricity",
    userData: {
      description:
        "For instance, the value of the axiomatic system for group theory is that it is not categorical, so proving a result in group theory means that the result is valid in all the different models for group theory and one doesn't have to reprove the result in each of the non-isomorphic models.",
      url: "https://en.wikipedia.org/wiki/Group_theory",
    },
  });
  g.createEdgeIfMissing(n_categoricity.getId(), n_group_theory_value.getId(), {
    type: "axiomatic_edge",
    label: "fact",
  });

  // Euclid's Postulates
  const n_euclid = g.createNode({
    id: "euclid_postulates",
    type: "example",
    label: "Euclid's Postulates",
    userData: {
      description:
        "Near the beginning of the first book of the Elements, Euclid gives five postulates (axioms) for plane geometry, stated in terms of constructions.",
      url: "https://en.wikipedia.org/wiki/Postulate",
    },
  });
  g.createEdgeIfMissing(n_foundations.getId(), n_euclid.getId(), {
    type: "axiomatic_edge",
    label: "example",
  });

  // Statement: Euclid's postulates assert existence of constructions and unique objects
  const n_euclid_existence = g.createNode({
    id: "euclid_existence_unique",
    type: "statement",
    label: "Existence and Uniqueness in Euclid's Postulates",
    userData: {
      description:
        "Although Euclid's statement of the postulates only explicitly asserts the existence of the constructions, they are also assumed to produce unique objects.",
    },
  });
  g.createEdgeIfMissing(n_euclid.getId(), n_euclid_existence.getId(), {
    type: "axiomatic_edge",
    label: "fact",
  });

  // List of Euclid's postulates as children
  const euclid_postulates = [
    {
      id: "euclid_postulate_1",
      label: "Postulate 1",
      description: "To draw a straight line from any point to any point.",
    },
    {
      id: "euclid_postulate_2",
      label: "Postulate 2",
      description:
        "To produce a finite straight line continuously in a straight line.",
    },
    {
      id: "euclid_postulate_3",
      label: "Postulate 3",
      description:
        "To describe a circle with any centre and distance (radius).",
    },
    {
      id: "euclid_postulate_4",
      label: "Postulate 4",
      description: "That all right angles are equal to one another.",
    },
    {
      id: "euclid_postulate_5",
      label: "Parallel Postulate",
      description:
        "If a straight line falling on two straight lines makes the interior angles on the same side less than two right angles, the two straight lines, if produced indefinitely, meet on that side.",
    },
  ];
  euclid_postulates.forEach((post) => {
    const n = g.createNode({
      id: post.id,
      type: "axiom",
      label: post.label,
      userData: { description: post.description },
    });
    g.createEdgeIfMissing(n_euclid.getId(), n.getId(), {
      type: "axiomatic_edge",
      label: "postulate",
    });
  });

  // Elements and legacy
  const n_elements = g.createNode({
    id: "euclid_elements",
    type: "example",
    label: "Euclid's Elements",
    userData: {
      description:
        "The success of the Elements is due primarily to its logical presentation of most of the mathematical knowledge available to Euclid. Much of the material is not original to him, although many of the proofs are supposedly his. Euclid's systematic development of his subject, from a small set of axioms to deep results, and the consistency of his approach throughout the Elements, encouraged its use as a textbook for about 2,000 years. The Elements still influences modern geometry books. Further, its logical axiomatic approach and rigorous proofs remain the cornerstone of mathematics.",
      url: "https://en.wikipedia.org/wiki/Euclid%27s_Elements",
    },
  });
  g.createEdgeIfMissing(n_euclid.getId(), n_elements.getId(), {
    type: "axiomatic_edge",
    label: "legacy",
  });

  return g;
};

export const demo_scenegraph_notes_axiomatic_systems_and_primitives = () => {
  return new SceneGraph({
    graph: createGraph(),
    metadata: {
      name: "Axiomatic Systems and Primitives",
      description:
        "A graph exploring the foundations of geometry, axiomatic systems, primitives, and their properties.",
    },
    defaultAppConfig: {
      activeView: "ReactFlow",
      activeLayout: GraphvizLayoutType.Graphviz_dot,
      activeSceneGraph: "Axiomatic Systems and Primitives",
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
