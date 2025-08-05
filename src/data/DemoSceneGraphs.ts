import { SceneGraph } from "../core/model/SceneGraph";
import { demo_scenegraph_ast } from "./demo-graphs/interfaceAstToSceneGraph";
import { demo_scenegraph_unigraph_overview } from "./graphs/demo_unigraph_overview";
// import { urlSceneGraph } from "../../hooks/useSvgSceneGraph";
import { mergeIntoSceneGraph } from "../core/model/mergeSceneGraphs";
import { randomBigGraph } from "./demo-graphs/random/randomBig";
import { randomBiggestGraph } from "./demo-graphs/random/randomBiggest";
import { demo_Unigraph_Applications } from "./demo-graphs/story-cards/demo_scenegraph_unigraph_applications";
import { demo_sceneGraph_academicsKG } from "./graphs/academicsKGraph";
import { blobMeshGraph } from "./graphs/blobMesh";
import { demo_scenegraph_all_writings } from "./graphs/demo_all_writings_graph";
import { demo_scenegraph_components_terms_links } from "./graphs/demo_components_terms_links";
import { demo_scenegraph_notes_axiomatic_systems_and_primitives } from "./graphs/demo_notes_axiomatic_systems_and_primitives";
import { demo_scenegraph_notes_complexity_and_primitives } from "./graphs/demo_notes_complexity_and_primitives";
import { demo_scenegraph_terms_axiomatic_links } from "./graphs/demo_terms_axiomatic_links";
import { demo_scenegraph_terms_unigraph_overview_links } from "./graphs/demo_terms_unigraph_overview_links";
import { demo_scenegraph_unigraph_components } from "./graphs/demo_unigraph_components";
import { createE8Petrie2DGraph } from "./graphs/e8Petrie2d";
import { demo_SceneGraph_ArtCollection } from "./graphs/Gallery_Demos/demo_SceneGraph_ArtCollection";
import {
  demo_SceneGraph_e8petrieProjection,
  demo_SceneGraph_e8petrieProjection_421t2b6,
} from "./graphs/Gallery_Demos/demo_SceneGraph_e8petrieProjection";
import demo_SceneGraph_FactorGraph from "./graphs/Gallery_Demos/demo_SceneGraph_FactorGraph";
import demo_SceneGraph_FactorGraph_ComplexExpansion from "./graphs/Gallery_Demos/demo_SceneGraph_FactorGraph_ComplexExpansion";
import { demo_SceneGraph_ImageGallery } from "./graphs/Gallery_Demos/demo_SceneGraph_ImageGallery";
import { demo_SceneGraph_Numbers_Story } from "./graphs/Gallery_Demos/demo_scenegraph_numbers_story";
import { demo_SceneGraph_Particulation } from "./graphs/Gallery_Demos/demo_SceneGraph_Particulation";
import { demo_SceneGraph_PhylogeneticTree } from "./graphs/Gallery_Demos/demo_SceneGraph_PhylogeneticTree";
import {
  demo_scenegraph_service_mesh_1,
  demo_scenegraph_service_mesh_2,
  demo_scenegraph_service_mesh_3,
} from "./graphs/Gallery_Demos/demo_scenegraph_service_mesh";
import { demo_SceneGraph_SolvayConference } from "./graphs/Gallery_Demos/demo_SceneGraph_SolvayConference";
import { demo_SceneGraph_StackedImageGallery } from "./graphs/Gallery_Demos/demo_SceneGraph_StackedImageGallery";
import { demo_SceneGraph_StackedGalleryTransparent } from "./graphs/Gallery_Demos/demo_SceneGraph_StackedImageGalleryTransparent";
import { demo_SceneGraph_Thinking } from "./graphs/Gallery_Demos/demo_SceneGraph_Thinking";
import { demo_SceneGraph_TreeOfLife } from "./graphs/Gallery_Demos/demo_SceneGraph_TreeOfLife";
import { demo_SceneGraph_StoryCards } from "./graphs/Gallery_Demos/demo_story_cards.tsx";
import { demo_Wikipedia_Articles } from "./graphs/Gallery_Demos/demo_wikipedia_articles";
import { graphManagementWorkflowDiagram } from "./graphs/graphManagementWorkflow";
import { graphManagementWorkflowDiagram2 } from "./graphs/graphManagementWorkflow2";
import { sphereMeshGraph } from "./graphs/sphereMesh";
import { cylindricalMeshGraph } from "./graphs/sphericalMesh";
import { thinkers1 } from "./graphs/thinkers1Graph";
import { thinkers2 } from "./graphs/thinkers2Graph";
import { thoughtDiagram } from "./graphs/thoughtDiagram";
import { unigraphGraph } from "./graphs/unigraph";
import { unigraphGraph2 } from "./graphs/unigraph2";

export interface SceneGraphCategory {
  label: string;
  graphs: {
    [key: string]:
      | SceneGraph
      | (() => SceneGraph)
      | (() => Promise<SceneGraph>);
  };
}

const writings_graphs = {
  UnigraphOverview: demo_scenegraph_unigraph_overview,
  AxiomaticSystems: demo_scenegraph_notes_axiomatic_systems_and_primitives,
  ComplexityAndPrimitives: demo_scenegraph_notes_complexity_and_primitives,
  UnigraphComponents: demo_scenegraph_unigraph_components,
  AllWritings: demo_scenegraph_all_writings,
  TermsLinks: demo_scenegraph_components_terms_links,
  AxiomLinks: demo_scenegraph_terms_axiomatic_links,
  UnigraphOverviewLinks: demo_scenegraph_terms_unigraph_overview_links,
};

const total_writing_graph = () => {
  const tmp = new SceneGraph();
  for (const sg of Object.values(writings_graphs)) {
    mergeIntoSceneGraph(tmp, sg());
  }
  return new SceneGraph({
    graph: tmp.getGraph(),
    metadata: {
      name: "All Writings",
      description:
        "A merged graph of all Unigraph writings and conceptual demos.",
    },
  });
};

export const DEMO_SCENE_GRAPHS: { [key: string]: SceneGraphCategory } = {
  Test: {
    label: "Test",
    graphs: {
      "Demo Story Cards": () => demo_SceneGraph_StoryCards(),
      numbers: () => demo_SceneGraph_Numbers_Story(),
      unigraphApplications: () => demo_Unigraph_Applications(),
      wikipediaDemo: () => demo_Wikipedia_Articles(),
      factorGraph: () => demo_SceneGraph_FactorGraph(),
      complexFactorGraph: () => demo_SceneGraph_FactorGraph_ComplexExpansion(),
      phylogeneticTree: () => demo_SceneGraph_PhylogeneticTree(),
      treeOfLife: () => demo_SceneGraph_TreeOfLife(),
      ast: () => demo_scenegraph_ast(),
    },
  },
  Base: {
    label: "Base",
    graphs: {
      Empty: () => new SceneGraph({ metadata: { name: "New SceneGraph" } }),
    },
  },
  ServiceMesh: {
    label: "Service Topologies",
    graphs: {
      "Service Mesh 1": () => demo_scenegraph_service_mesh_1(),
      "Service Mesh 2": () => demo_scenegraph_service_mesh_2(),
      "Service Mesh 3": () => demo_scenegraph_service_mesh_3(), // <-- add new demo
    },
  },
  Writings: {
    label: "Writings",
    graphs: {
      ...total_writing_graph,
      all_writings: total_writing_graph,
    },
  },
  "Demo Graphs": {
    label: "Demo Graphs",
    graphs: {
      thoughtDiagram: thoughtDiagram,
      unigraph: unigraphGraph,
      unigraph2: unigraphGraph2,
      graphManagementWorkflowDiagram: graphManagementWorkflowDiagram,
      graphManagementWorkflowDiagram2: graphManagementWorkflowDiagram2,
    },
  },
  "Math Graphs": {
    label: "Math Graphs",
    graphs: {
      "E8 Petrie 4.21": demo_SceneGraph_e8petrieProjection,
      "E8 4.21 T2 B6": demo_SceneGraph_e8petrieProjection_421t2b6,
      "E8 Copilot Attempt": createE8Petrie2DGraph,
    },
  },
  "Mesh Graphs": {
    label: "Mesh Graphs",
    graphs: {
      cylindrical: cylindricalMeshGraph,
      spherical: sphereMeshGraph,
      blobMesh: blobMeshGraph,
    },
  },
  "Test Graphs": {
    label: "Test Graphs",
    graphs: {
      big: randomBigGraph,
      biggest: randomBiggestGraph,
    },
  },
  "Thinker Graphs": {
    label: "Thinker Graphs",
    graphs: {
      AcademicsKG: demo_sceneGraph_academicsKG,
      thinkers1: thinkers1,
      thinkers2: thinkers2,
    },
  },
  "Image Graphs": {
    label: "Image Graphs",
    graphs: {
      "Solvay Conference": demo_SceneGraph_SolvayConference,
      "Single Image": demo_SceneGraph_ImageGallery,
      "Stacked Gallery": demo_SceneGraph_StackedImageGallery,
      "Transparent Stacked Gallery": () =>
        demo_SceneGraph_StackedGalleryTransparent(),
      Thinking: demo_SceneGraph_Thinking,
      Art: demo_SceneGraph_ArtCollection,
      "Particulation Experiment": demo_SceneGraph_Particulation,
    },
  },
};

// Helper function to get all graphs flattened
export const getAllDemoSceneGraphKeys = (): string[] => {
  const allGraphs: string[] = [];
  Object.entries(DEMO_SCENE_GRAPHS).forEach(([_, graphs]) => {
    Object.keys(graphs.graphs).forEach((key) => {
      allGraphs.push(key);
    });
  });
  return allGraphs;
};

export const getSceneGraph = (
  name: string
): SceneGraph | (() => SceneGraph) | (() => Promise<SceneGraph>) => {
  for (const [_, graphs] of Object.entries(DEMO_SCENE_GRAPHS)) {
    for (const key of Object.keys(graphs.graphs)) {
      if (key === name) {
        return graphs.graphs[key];
      }
    }
  }
  throw new Error(`SceneGraph not found: ${name}`);
};

// Add tree structure helpers for ProjectManager component
export interface DemoSceneGraphTree {
  [category: string]: string[];
}

export function getAllDemoSceneGraphCategories(): string[] {
  // Group the demo scene graphs by category
  const categories = new Set<string>();

  getAllDemoSceneGraphKeys().forEach((key) => {
    const parts = key.split("/");
    if (parts.length > 1) {
      categories.add(parts[0]);
    } else {
      categories.add("Uncategorized");
    }
  });

  return Array.from(categories);
}

export function getDemoSceneGraphTree(): DemoSceneGraphTree {
  const tree: DemoSceneGraphTree = {};

  getAllDemoSceneGraphKeys().forEach((key) => {
    const parts = key.split("/");
    let category = "Uncategorized";

    if (parts.length > 1) {
      category = parts[0];
    }

    if (!tree[category]) {
      tree[category] = [];
    }

    tree[category].push(key);
  });

  return tree;
}
