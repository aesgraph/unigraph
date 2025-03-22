import { SceneGraph } from "../core/model/SceneGraph";
// import { urlSceneGraph } from "../../hooks/useSvgSceneGraph";
import { demo_sceneGraph_academicsKG } from "./graphs/academicsKGraph";
import { blobMeshGraph } from "./graphs/blobMesh";
import { createE8Petrie2DGraph } from "./graphs/e8Petrie2d";
import { demo_SceneGraph_ArtCollection } from "./graphs/Gallery_Demos/demo_SceneGraph_ArtCollection";
import {
  demo_SceneGraph_e8petrieProjection,
  demo_SceneGraph_e8petrieProjection_421t2b6,
} from "./graphs/Gallery_Demos/demo_SceneGraph_e8petrieProjection";
import { demo_SceneGraph_ImageGallery } from "./graphs/Gallery_Demos/demo_SceneGraph_ImageGallery";
import { demo_SceneGraph_SolvayConference } from "./graphs/Gallery_Demos/demo_SceneGraph_SolvayConference";
import { demo_SceneGraph_StackedImageGallery } from "./graphs/Gallery_Demos/demo_SceneGraph_StackedImageGallery";
import { demo_SceneGraph_StackedGalleryTransparent } from "./graphs/Gallery_Demos/demo_SceneGraph_StackedImageGalleryTransparent";
import { demo_SceneGraph_Thinking } from "./graphs/Gallery_Demos/demo_SceneGraph_Thinking";
import { graphManagementWorkflowDiagram } from "./graphs/graphManagementWorkflow";
import { graphManagementWorkflowDiagram2 } from "./graphs/graphManagementWorkflow2";
import { randomBigGraph } from "./graphs/randomBig";
import { randomBiggestGraph } from "./graphs/randomBiggest";
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

export const DEMO_SCENE_GRAPHS: { [key: string]: SceneGraphCategory } = {
  Base: {
    label: "Base",
    graphs: {
      Empty: () => new SceneGraph({}),
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
