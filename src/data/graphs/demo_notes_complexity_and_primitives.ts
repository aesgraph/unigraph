import { GraphvizLayoutType } from "../../core/layouts/GraphvizLayoutType";
import { Graph } from "../../core/model/Graph";
import { SceneGraph } from "../../core/model/SceneGraph";

const createGraph = (): Graph => {
  const tmp = new SceneGraph();
  const g = tmp.getGraph();

  // Root node
  const n_root = g.createNode({
    id: "notes_complexity_and_primitives",
    type: "notes_complexity_and_primitives",
    label: "Notes: Complexity and Primitives",
    userData: {
      description:
        "Exploring the relationship between complexity, primitives, and composition.",
    },
  });

  // Stuck/Progress statements
  const n_stuck = g.createNode({
    id: "stuck_statement",
    type: "statement",
    label: "If you're stuck on something, you got past everything before it.",
    userData: {},
  });
  g.createEdgeIfMissing(n_root.getId(), n_stuck.getId(), {
    type: "demo_notes_edge",
    label: "reflection",
  });

  const n_progress = g.createNode({
    id: "progress_statement",
    type: "statement",
    label: "You'll get through everything until you get stuck.",
    userData: {},
  });
  g.createEdgeIfMissing(n_stuck.getId(), n_progress.getId(), {
    type: "demo_notes_edge",
    label: "complements",
  });

  // Complexity management
  const n_complexity = g.createNode({
    id: "complexity_management",
    type: "concept",
    label: "Managing Complexity",
    userData: {
      description: "You can't eliminate complexity, but you can manage it.",
    },
  });
  g.createEdgeIfMissing(n_root.getId(), n_complexity.getId(), {
    type: "demo_notes_edge",
    label: "core idea",
  });

  const n_tools = g.createNode({
    id: "tools_manage_complexity",
    type: "concept",
    label: "Tools to Manage Complexity",
    userData: {
      description:
        "Tools to manage complexity open opportunities to discover new complexity.",
    },
  });
  g.createEdgeIfMissing(n_complexity.getId(), n_tools.getId(), {
    type: "demo_notes_edge",
    label: "enables",
  });

  const n_human_condition = g.createNode({
    id: "human_condition",
    type: "concept",
    label: "The Human Condition: Solving Problems",
    userData: {},
  });
  g.createEdgeIfMissing(n_tools.getId(), n_human_condition.getId(), {
    type: "demo_notes_edge",
    label: "context",
  });

  // Primitives
  const n_primitives = g.createNode({
    id: "primitives",
    type: "concept",
    label: "Primitives",
    userData: {
      description:
        "Humans often construct primitives to work within the fuzzy nature of reality.",
    },
  });
  g.createEdgeIfMissing(n_root.getId(), n_primitives.getId(), {
    type: "demo_notes_edge",
    label: "core idea",
  });

  const n_well_understood = g.createNode({
    id: "well_understood_systems",
    type: "concept",
    label: "Well-understood Systems",
    userData: {
      description:
        "Well-understood systems are built from well-composed primitives.",
    },
  });
  g.createEdgeIfMissing(n_primitives.getId(), n_well_understood.getId(), {
    type: "demo_notes_edge",
    label: "built from",
  });

  const n_powerful_systems = g.createNode({
    id: "powerful_systems",
    type: "concept",
    label: "Powerful Systems",
    userData: {
      description:
        "If the right primitives are available, powerful systems can be composed.",
    },
  });
  g.createEdgeIfMissing(n_primitives.getId(), n_powerful_systems.getId(), {
    type: "demo_notes_edge",
    label: "enables",
  });

  const n_primitive_system = g.createNode({
    id: "primitive_can_be_system",
    type: "concept",
    label: "A Primitive Can Be a System",
    userData: {
      description: "A primitive can be a system, and vice versa.",
    },
  });
  g.createEdgeIfMissing(n_primitives.getId(), n_primitive_system.getId(), {
    type: "demo_notes_edge",
    label: "duality",
  });

  // Fundamental ideas
  const n_fundamental = g.createNode({
    id: "fundamental_ideas",
    type: "concept",
    label: "Fundamental Ideas",
    userData: {
      description:
        "Complexity, primitives, and composition are fundamental ideas to the nature of existence itself.",
    },
  });
  g.createEdgeIfMissing(n_root.getId(), n_fundamental.getId(), {
    type: "demo_notes_edge",
    label: "context",
  });

  const n_coding_writing = g.createNode({
    id: "coding_writing",
    type: "context",
    label: "Coding or Writing",
    userData: {
      description: "Most top of mind when coding or writing.",
    },
  });
  g.createEdgeIfMissing(n_fundamental.getId(), n_coding_writing.getId(), {
    type: "demo_notes_edge",
    label: "personal context",
  });

  // Primitives are not absolute
  const n_not_absolute = g.createNode({
    id: "primitives_not_absolute",
    type: "concept",
    label: "Primitives Are Not Absolute",
    userData: {
      description:
        "Primitives are not absolute. They are the components within a system that are treated as indivisible for the purposes of composition—but in reality, they may themselves be composed of deeper structures.",
    },
  });
  g.createEdgeIfMissing(n_primitives.getId(), n_not_absolute.getId(), {
    type: "demo_notes_edge",
    label: "nature",
  });

  const n_relative_abstractions = g.createNode({
    id: "primitives_relative_abstractions",
    type: "concept",
    label: "Primitives Are Relative Abstractions",
    userData: {
      description:
        'In any system, what qualifies as a "primitive" depends on perspective and granularity. Thus, primitives are relative abstractions, not foundational truths. They are chosen by designers to anchor a level of reasoning.',
    },
  });
  g.createEdgeIfMissing(
    n_not_absolute.getId(),
    n_relative_abstractions.getId(),
    {
      type: "demo_notes_edge",
      label: "consequence",
    }
  );

  return g;
};

export const demo_scenegraph_notes_complexity_and_primitives = () => {
  return new SceneGraph({
    graph: createGraph(),
    metadata: {
      name: "Notes: Complexity and Primitives",
      description:
        "A graph exploring the relationship between complexity, primitives, and composition.",
    },
    defaultAppConfig: {
      activeView: "ReactFlow",
      activeLayout: GraphvizLayoutType.Graphviz_dot,
      activeSceneGraph: "Notes: Complexity and Primitives",
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
