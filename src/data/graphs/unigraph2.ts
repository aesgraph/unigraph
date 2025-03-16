import { Graph } from "../../core/model/Graph";
import { GraphBuilder } from "../../core/model/GraphBuilder";
import { SceneGraph } from "../../core/model/SceneGraph";

export const unigraphGraph2 = () => {
  const graph = new Graph();

  graph.createNode("axiomOfInteraction", {
    type: "concept pillar",
    tags: ["axiom of interaction", "story entrypoint"],
  });

  graph.createNode("theoryOfEverything", {
    type: "concept pillar",
    tags: ["theory of everything", "story entrypoint"],
  });

  graph.createNode("unigraph", {
    type: "concept pillar",
    tags: ["unigraph", "story entrypoint", "graph software"],
  });

  graph.createNode("graphviz", {
    type: "graph software",
    tags: ["graph software"],
  });

  graph.createNode("reactflow", {
    type: "graph software",
    tags: ["graph software", "story entrypoint"],
  });

  graph.createEdge("axiomOfInteraction", "theoryOfEverything", {
    type: "philosophical approach to",
  });

  graph.createEdge("unigraph", "theoryOfEverything", {
    type: "technology to implement a",
  });

  graph.createNode("communication medium", {
    type: "technology",
    tags: ["technology", "language"],
  });

  graph.createEdge("unigraph", "communication medium", {
    type: "is a",
  });

  graph.createNode("analytics engine", { type: "concept pillar" });
  graph.createEdge("unigraph", "analytics engine", {
    type: "is a",
  });

  graph.createEdge("unigraph", "axiomOfInteraction", {
    type: "can be understood through",
  });

  graph.createEdge("unigraph", "graphviz", { type: "adaptor for" });
  graph.createEdge("unigraph", "reactflow", { type: "adaptor for" });

  graph.createNode("logical mind maps", { type: "material thing" });
  graph.createEdge("axiomOfInteraction", "logical mind maps", {
    type: "is a",
  });

  graph.createEdge("unigraph", "logical mind maps", { type: "builds" });

  graph.createEdge("logical mind maps", "theoryOfEverything", {
    type: "to describe a",
  });

  graph.createEdge("logical mind maps", "analytics engine", {
    type: "powered by",
  });

  graph.createEdge("communication medium", "logical mind maps", {
    type: "in the form of",
  });

  // graph.createEdge("theoryOfEverything", "analytics engine", {
  //   type: "described within",
  // });

  graph.createEdge("analytics engine", "theoryOfEverything", {
    type: "to build and navigate a",
  });

  const builder = new GraphBuilder(graph);
  builder.addEdge("theoryOfEverything", "is a", "overloaded term");

  // console.log("journal", unigraphGraph2);
  return new SceneGraph({ graph: graph });
};
