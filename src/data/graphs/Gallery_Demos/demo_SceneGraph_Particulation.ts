import { demo_SceneGraph_Particulation_images } from "../../../_experimental/lumina/images";
import { demo_SceneGraph_Particulation_ImageBoxes } from "../../../assets/imageBoxes/demo_SceneGraph_Particulation_ImageBoxes";
import { Graph } from "../../../core/model/Graph";
import { SceneGraph } from "../../../core/model/SceneGraph";
import { ImageBoxData } from "../../../core/types/ImageBoxData";

export const demo_SceneGraph_Particulation = () => {
  const graph = new Graph();

  // Add the main particulation image
  for (const [key, value] of Object.entries(
    demo_SceneGraph_Particulation_images
  )) {
    graph.createNode({
      id: key,
      type: "image",
      userData: {
        imageUrl: value,
      },
    });
  }

  // Add image boxes with annotations
  const imageBoxLists: ImageBoxData[][] = [
    demo_SceneGraph_Particulation_ImageBoxes,
  ];

  for (const imageBoxList of imageBoxLists) {
    for (const imageBox of imageBoxList) {
      graph.createNode({
        id: imageBox.id,
        type: "imageBox",
        userData: {
          imageUrl: imageBox.imageUrl,
          topLeft: imageBox.topLeft,
          bottomRight: imageBox.bottomRight,
          label: imageBox.label,
        },
      });
      graph.createEdge(imageBox.id, imageBox.imageUrl, {
        type: `${imageBox.imageUrl}`,
      });
    }
  }

  // Add additional concept nodes related to particulation
  const conceptNodes = [
    {
      id: "particle-dynamics",
      label: "Particle Dynamics",
      description: "Study of particle movement and interaction patterns",
      type: "concept",
    },
    {
      id: "gravitational-attraction",
      label: "Gravitational Attraction",
      description: "Force causing particles to cluster together",
      type: "concept",
    },
    {
      id: "boundary-effects",
      label: "Boundary Effects",
      description: "Behavior of particles at system boundaries",
      type: "concept",
    },
    {
      id: "trajectory-analysis",
      label: "Trajectory Analysis",
      description: "Analysis of particle movement paths over time",
      type: "concept",
    },
    {
      id: "cluster-formation",
      label: "Cluster Formation",
      description: "Process of particle aggregation into clusters",
      type: "concept",
    },
  ];

  // Add concept nodes to the graph
  for (const concept of conceptNodes) {
    graph.createNode({
      id: concept.id,
      type: concept.type,
      userData: {
        label: concept.label,
        description: concept.description,
      },
    });
  }

  // Add relationships between concepts and image boxes
  const relationships = [
    { source: "particle-dynamics", target: "particulation-main" },
    { source: "gravitational-attraction", target: "particle-cluster-1" },
    { source: "gravitational-attraction", target: "particle-cluster-2" },
    { source: "boundary-effects", target: "boundary-zone" },
    { source: "trajectory-analysis", target: "particle-trajectory" },
    { source: "cluster-formation", target: "particle-cluster-1" },
    { source: "cluster-formation", target: "particle-cluster-2" },
  ];

  // Add relationship edges
  for (const rel of relationships) {
    graph.createEdge(rel.source, rel.target, {
      type: "concept-to-visualization",
    });
  }

  return new SceneGraph({
    graph,
    metadata: {
      name: "Particulation Experiment",
      description:
        "A visualization of particle dynamics and clustering behavior in a particulation experiment. The image shows various particle clusters, trajectories, and boundary effects with annotated regions for analysis.",
    },
  });
};
