import { SceneGraph } from "../../core/model/SceneGraph";
// import { urlSceneGraph } from "../../hooks/useSvgSceneGraph";
import { blobMeshGraph } from "./blobMesh";
import { createE8Petrie2DGraph } from "./e8Petrie2d";
import { demo_SceneGraph_ArtCollection } from "./Gallery_Demos/demo_SceneGraph_ArtCollection";
import {
  demo_SceneGraph_e8petrieProjection,
  demo_SceneGraph_e8petrieProjection_421t2b6,
} from "./Gallery_Demos/demo_SceneGraph_e8petrieProjection";
import { demo_SceneGraph_ImageGallery } from "./Gallery_Demos/demo_SceneGraph_ImageGallery";
import { demo_SceneGraph_SolvayConference } from "./Gallery_Demos/demo_SceneGraph_SolvayConference";
import { demo_SceneGraph_StackedImageGallery } from "./Gallery_Demos/demo_SceneGraph_StackedImageGallery";
import { demo_SceneGraph_StackedGalleryTransparent } from "./Gallery_Demos/demo_SceneGraph_StackedImageGalleryTransparent";
import { demo_SceneGraph_Thinking } from "./Gallery_Demos/demo_SceneGraph_Thinking";
import { graphManagementWorkflowDiagram } from "./graphManagementWorkflow";
import { graphManagementWorkflowDiagram2 } from "./graphManagementWorkflow2";
import { demo_sceneGraph_academicsKG } from "./mergeGraph";
import { randomBigGraph } from "./randomBig";
import { randomBiggestGraph } from "./randomBiggest";
import { sphereMeshGraph } from "./sphereMesh";
import { cylindricalMeshGraph } from "./sphericalMesh";
import { thinkers1 } from "./thinkers1Graph";
import { thinkers2 } from "./thinkers2Graph";
import { thoughtDiagram } from "./thoughtDiagram";
import { unigraphGraph } from "./unigraph";
import { unigraphGraph2 } from "./unigraph2";

export interface SceneGraphCategory {
  label: string;
  graphs: { [key: string]: SceneGraph | (() => SceneGraph) };
}

export const sceneGraphs: { [key: string]: SceneGraphCategory } = {
  Base: {
    label: "Base",
    graphs: {
      Empty: () => new SceneGraph({}),
    },
  },
  "Demo Graphs": {
    label: "Demo Graphs",
    graphs: {
      thoughtDiagram: () => thoughtDiagram(),
      unigraph: () => unigraphGraph(),
      unigraph2: () => unigraphGraph2(),
      graphManagementWorkflowDiagram: () => graphManagementWorkflowDiagram(),
      graphManagementWorkflowDiagram2: () => graphManagementWorkflowDiagram2(),
    },
  },
  "Math Graphs": {
    label: "Math Graphs",
    graphs: {
      "E8 Petrie 4.21": () => demo_SceneGraph_e8petrieProjection,
      "E8 4.21 T2 B6": () => demo_SceneGraph_e8petrieProjection_421t2b6,
      "E8 Copilot Attempt": () => createE8Petrie2DGraph(),
    },
  },
  "Mesh Graphs": {
    label: "Mesh Graphs",
    graphs: {
      cylindrical: () => cylindricalMeshGraph(),
      spherical: () => sphereMeshGraph(),
      blobMesh: () => blobMeshGraph(),
    },
  },
  "Test Graphs": {
    label: "Test Graphs",
    graphs: {
      big: () => randomBigGraph(),
      biggest: () => randomBiggestGraph(),
    },
  },
  "Thinker Graphs": {
    label: "Thinker Graphs",
    graphs: {
      AcademicsKG: () => demo_sceneGraph_academicsKG(),
      thinkers1: () => thinkers1(),
      thinkers2: () => thinkers2(),
    },
  },
  "Image Graphs": {
    label: "Image Graphs",
    graphs: {
      "Solvay Conference": () => demo_SceneGraph_SolvayConference(),
      "Single Image": () => demo_SceneGraph_ImageGallery(),
      "Stacked Gallery": () => demo_SceneGraph_StackedImageGallery(),
      "Transparent Stacked Gallery": () =>
        demo_SceneGraph_StackedGalleryTransparent(),
      Thinking: () => demo_SceneGraph_Thinking(),
      Art: () => demo_SceneGraph_ArtCollection(),
    },
  },
};

// Helper function to get all graphs flattened
export const getAllDemoSceneGraphKeys = (): string[] => {
  const allGraphs: string[] = [];
  Object.entries(sceneGraphs).forEach(([_, graphs]) => {
    Object.keys(graphs.graphs).forEach((key) => {
      allGraphs.push(key);
    });
  });
  return allGraphs;
};

export const getSceneGraph = (
  name: string
): SceneGraph | (() => SceneGraph) => {
  for (const [_, graphs] of Object.entries(sceneGraphs)) {
    for (const key of Object.keys(graphs.graphs)) {
      if (key === name) {
        return graphs.graphs[key];
      }
    }
  }
  throw new Error(`SceneGraph not found: ${name}`);
};
