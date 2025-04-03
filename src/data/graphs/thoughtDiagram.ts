import { Graph } from "../../core/model/Graph";
import { SceneGraph } from "../../core/model/SceneGraph";

export const constructModel = () => {
  const graph = new Graph();

  graph.createNode({ id: "Graphviz" });
  graph.createNode({ id: "ReactFlow" });
  graph.createNode({ id: "Unigraph" });

  graph.createNode({ id: "A technology for communication" });
  graph.createNode({ id: "Use it to tell a story" });

  graph.createNode({ id: "Diagramming tool" });
  graph.createNode({ id: "Describes itself" });

  // Adding famous mathematicians
  graph.createNode({ id: "Euclid", tags: ["mathematician"] });
  graph.createNode({ id: "Isaac Newton", tags: ["mathematician"] });
  graph.createNode({ id: "Carl Friedrich Gauss", tags: ["mathematician"] });
  graph.createNode({ id: "Leonhard Euler", tags: ["mathematician"] });
  graph.createNode({ id: "Pythagoras", tags: ["mathematician"] });
  graph.createNode({ id: "Albert Einstein", tags: ["scientist"] });
  graph.createNode({ id: "Galileo Galilei", tags: ["scientist"] });
  graph.createNode({ id: "Marie Curie", tags: ["scientist"] });
  graph.createNode({ id: "Nikola Tesla", tags: ["scientist"] });
  graph.createNode({ id: "Stephen Hawking", tags: ["scientist"] });
  graph.createNode({ id: "Alan Turing", tags: ["scientist"] });
  graph.createNode({ id: "Ada Lovelace", tags: ["scientist"] });
  graph.createNode({ id: "Niels Bohr", tags: ["scientist"] });
  graph.createNode({ id: "Richard Feynman", tags: ["scientist"] });
  graph.createNode({ id: "James Clerk Maxwell", tags: ["scientist"] });

  // Adding major works
  graph.createNode({ id: "Elements", tags: ["major work"] });
  graph.createNode({ id: "Principia Mathematica", tags: ["major work"] });
  graph.createNode({ id: "Opticks", tags: ["major work"] });
  graph.createNode({ id: "Disquisitiones Arithmeticae", tags: ["major work"] });
  graph.createNode({
    id: "Introductio in analysin infinitorum",
    tags: ["major work"],
  });
  graph.createNode({ id: "Pythagorean Theorem", tags: ["major work"] });
  graph.createNode({ id: "Theory of Relativity", tags: ["major work"] });
  graph.createNode({
    id: "Dialogue Concerning the Two Chief World Systems",
    tags: ["major work"],
  });
  graph.createNode({ id: "Radioactivity", tags: ["major work"] });
  graph.createNode({ id: "AC Power", tags: ["major work"] });
  graph.createNode({ id: "A Brief History of Time", tags: ["major work"] });
  graph.createNode({ id: "On Computable Numbers", tags: ["major work"] });
  graph.createNode({ id: "Analytical Engine", tags: ["major work"] });
  graph.createNode({ id: "Bohr Model", tags: ["major work"] });
  graph.createNode({ id: "Quantum Electrodynamics", tags: ["major work"] });
  graph.createNode({ id: "Maxwell's Equations", tags: ["major work"] });

  // Adding scientific and mathematical fields
  graph.createNode({ id: "Geometry", tags: ["field"] });
  graph.createNode({ id: "Physics", tags: ["field"] });
  graph.createNode({ id: "Mathematics", tags: ["field"] });
  graph.createNode({ id: "Computer Science", tags: ["field"] });
  graph.createNode({ id: "Chemistry", tags: ["field"] });
  graph.createNode({ id: "Electrical Engineering", tags: ["field"] });
  graph.createNode({ id: "Quantum Mechanics", tags: ["field"] });

  // Creating links between mathematicians/scientists and their works
  graph.createEdge("Euclid", "Elements", { tags: ["contributed"] });
  graph.createEdge("Isaac Newton", "Principia Mathematica", {
    tags: ["contributed"],
  });
  graph.createEdge("Isaac Newton", "Opticks", { tags: ["contributed"] });
  graph.createEdge("Carl Friedrich Gauss", "Disquisitiones Arithmeticae", {
    tags: ["contributed"],
  });
  graph.createEdge("Leonhard Euler", "Introductio in analysin infinitorum", {
    tags: ["contributed"],
  });
  graph.createEdge("Pythagoras", "Pythagorean Theorem", {
    tags: ["contributed"],
  });
  graph.createEdge("Albert Einstein", "Theory of Relativity", {
    tags: ["contributed"],
  });
  graph.createEdge(
    "Galileo Galilei",
    "Dialogue Concerning the Two Chief World Systems",
    { tags: ["contributed"] }
  );
  graph.createEdge("Marie Curie", "Radioactivity", { tags: ["contributed"] });
  graph.createEdge("Nikola Tesla", "AC Power", { tags: ["contributed"] });
  graph.createEdge("Stephen Hawking", "A Brief History of Time", {
    tags: ["contributed"],
  });
  graph.createEdge("Alan Turing", "On Computable Numbers", {
    tags: ["contributed"],
  });
  graph.createEdge("Ada Lovelace", "Analytical Engine", {
    tags: ["contributed"],
  });
  graph.createEdge("Niels Bohr", "Bohr Model", { tags: ["contributed"] });
  graph.createEdge("Richard Feynman", "Quantum Electrodynamics", {
    tags: ["contributed"],
  });
  graph.createEdge("James Clerk Maxwell", "Maxwell's Equations", {
    tags: ["contributed"],
  });

  // Creating links between works and fields
  graph.createEdge("Elements", "Geometry", { tags: ["within the field of"] });
  graph.createEdge("Principia Mathematica", "Physics", {
    tags: ["within the field of"],
  });
  graph.createEdge("Opticks", "Physics", { tags: ["within the field of"] });
  graph.createEdge("Disquisitiones Arithmeticae", "Mathematics", {
    tags: ["within the field of"],
  });
  graph.createEdge("Introductio in analysin infinitorum", "Mathematics", {
    tags: ["within the field of"],
  });
  graph.createEdge("Pythagorean Theorem", "Geometry", {
    tags: ["within the field of"],
  });
  graph.createEdge("Theory of Relativity", "Physics", {
    tags: ["within the field of"],
  });
  graph.createEdge(
    "Dialogue Concerning the Two Chief World Systems",
    "Physics",
    { tags: ["within the field of"] }
  );
  graph.createEdge("Radioactivity", "Chemistry", {
    tags: ["within the field of"],
  });
  graph.createEdge("AC Power", "Electrical Engineering", {
    tags: ["within the field of"],
  });
  graph.createEdge("A Brief History of Time", "Physics", {
    tags: ["within the field of"],
  });
  graph.createEdge("On Computable Numbers", "Computer Science", {
    tags: ["within the field of"],
  });
  graph.createEdge("Analytical Engine", "Computer Science", {
    tags: ["within the field of"],
  });
  graph.createEdge("Bohr Model", "Quantum Mechanics", {
    tags: ["within the field of"],
  });
  graph.createEdge("Quantum Electrodynamics", "Quantum Mechanics", {
    tags: ["within the field of"],
  });
  graph.createEdge("Maxwell's Equations", "Physics", {
    tags: ["within the field of"],
  });

  return graph;
};

// export const thoughtDiagram = new SceneGraph({ graph: constructModel() });

export const thoughtDiagram = () => {
  return new SceneGraph({ graph: constructModel() });
};
