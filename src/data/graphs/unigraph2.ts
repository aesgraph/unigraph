import { Graph } from "../../core/model/Graph";
import { GraphBuilder } from "../../core/model/GraphBuilder";
import { SceneGraph } from "../../core/model/SceneGraph";

export const unigraphGraph2 = () => {
  const graph = new Graph();

  graph.createNode({
    id: "axiomOfInteraction",
    type: "concept pillar",
    tags: ["axiom of interaction", "story entrypoint"],
  });

  graph.createNode({
    id: "theoryOfEverything",
    type: "concept pillar",
    tags: ["theory of everything", "story entrypoint"],
  });

  graph.createNode({
    id: "unigraph",
    type: "concept pillar",
    tags: ["unigraph", "story entrypoint", "graph software"],
  });

  graph.createNode({
    id: "graphviz",
    type: "graph software",
    tags: ["graph software"],
  });

  graph.createNode({
    id: "reactflow",
    type: "graph software",
    tags: ["graph software", "story entrypoint"],
  });

  graph.createEdgeIfMissing("axiomOfInteraction", "theoryOfEverything", {
    type: "philosophical approach to",
  });

  graph.createEdgeIfMissing("unigraph", "theoryOfEverything", {
    type: "technology to implement a",
  });

  graph.createNode({
    id: "communication medium",
    type: "technology",
    tags: ["technology", "language"],
  });

  graph.createEdgeIfMissing("unigraph", "communication medium", {
    type: "is a",
  });

  graph.createNode({ id: "analytics engine", type: "concept pillar" });
  graph.createEdgeIfMissing("unigraph", "analytics engine", {
    type: "is a",
  });

  graph.createEdgeIfMissing("unigraph", "axiomOfInteraction", {
    type: "can be understood through",
  });

  graph.createEdgeIfMissing("unigraph", "graphviz", { type: "adaptor for" });
  graph.createEdgeIfMissing("unigraph", "reactflow", { type: "adaptor for" });

  graph.createNode({
    id: "logical mind maps",
    type: "material thing",
  });

  graph.createEdgeIfMissing("axiomOfInteraction", "logical mind maps", {
    type: "is a",
  });

  graph.createEdgeIfMissing("unigraph", "logical mind maps", {
    type: "builds",
  });

  graph.createEdgeIfMissing("logical mind maps", "theoryOfEverything", {
    type: "to describe a",
  });

  graph.createEdgeIfMissing("logical mind maps", "analytics engine", {
    type: "powered by",
  });

  graph.createEdgeIfMissing("communication medium", "logical mind maps", {
    type: "in the form of",
  });

  // graph.createEdgeIfMissing("theoryOfEverything", "analytics engine", {
  //   type: "described within",
  // });

  graph.createEdgeIfMissing("analytics engine", "theoryOfEverything", {
    type: "to build and navigate a",
  });

  const builder = new GraphBuilder(graph);
  builder.addEdge("theoryOfEverything", "is a", "overloaded term");

  // console.log("journal", unigraphGraph2);
  return new SceneGraph({ graph: graph });
};
