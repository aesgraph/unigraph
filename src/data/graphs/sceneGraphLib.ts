import { SceneGraph } from "../../core/model/SceneGraph";
import { urlSceneGraph } from "../../hooks/useSvgSceneGraph";
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
import { journalSceneGraph } from "./journal";
import { demo_sceneGraph_academicsKG } from "./mergeGraph";
import { randomBigGraph } from "./randomBig";
import { randomBiggestGraph } from "./randomBiggest";
import { sphereMeshGraph } from "./sphereMesh";
import { cylindricalMeshGraph } from "./sphericalMesh";
import { thinkers1 } from "./thinkers1Graph";
import { thinkers2 } from "./thinkers2Graph";
import { thoughtDiagram } from "./thoughtDiagram";
import { unigraphGraph } from "./unigraph";

export interface SceneGraphCategory {
  name: string;
  graphs: { [key: string]: SceneGraph | (() => SceneGraph) };
}

export const sceneGraphs: { [key: string]: SceneGraphCategory } = {
  Base: {
    name: "Base",
    graphs: {
      Empty: new SceneGraph({}),
      URL: urlSceneGraph.sceneGraph,
    },
  },
  "Demo Graphs": {
    name: "Demo Graphs",
    graphs: {
      "Demo 1": demo_SceneGraph_SolvayConference,
      thoughtDiagram: thoughtDiagram,
    },
  },
  "Math Graphs": {
    name: "Math Graphs",
    graphs: {
      "E8 Petrie 4.21": demo_SceneGraph_e8petrieProjection,
      "E8 4.21 T2 B6": demo_SceneGraph_e8petrieProjection_421t2b6,
      "E8 Copilot Attempt": createE8Petrie2DGraph,
    },
  },
  "Mesh Graphs": {
    name: "Mesh Graphs",
    graphs: {
      cylindrical: cylindricalMeshGraph,
      spherical: sphereMeshGraph,
      blobMesh: blobMeshGraph,
    },
  },
  "Test Graphs": {
    name: "Test Graphs",
    graphs: {
      big: randomBigGraph,
      biggest: randomBiggestGraph,
      unigraph: unigraphGraph,
      journal: journalSceneGraph,
      AcademicsKG: demo_sceneGraph_academicsKG,
    },
  },
  "Thinker Graphs": {
    name: "Thinker Graphs",
    graphs: {
      thinkers1: thinkers1,
      thinkers2: thinkers2,
    },
  },
  "Image Graphs": {
    name: "Image Graphs",
    graphs: {
      "Solvay Conference": demo_SceneGraph_SolvayConference,
      "Single Image": demo_SceneGraph_ImageGallery,
      "Stacked Gallery": demo_SceneGraph_StackedImageGallery,
      "Transparent Stacked Gallery": demo_SceneGraph_StackedGalleryTransparent,
      Thinking: demo_SceneGraph_Thinking,
      Art: demo_SceneGraph_ArtCollection,
    },
  },
};

// Helper function to get all graphs flattened
export const getAllGraphs = (): { [key: string]: (SceneGraph | (() => SceneGraph)) } => {
  const allGraphs: { [key: string]: (SceneGraph | (() => SceneGraph)) } = {};
  Object.values(sceneGraphs).forEach((category) => {
    Object.entries(category.graphs).forEach(([key, graph]) => {
      allGraphs[key] = graph;
    });
  });
  return allGraphs;
};

export const getSceneGraph = (name: string): (SceneGraph | (() => SceneGraph)) => {
  for (const [k, graphs] of Object.entries(sceneGraphs)) {
    for (const [key, graph] of Object.entries(graphs.graphs)) {
      if (key === name) {
        return graph;
      }
    }
  }
  throw new Error(`SceneGraph not found: ${name}`);
}