import { Graph } from "../../core/model/Graph";
import { SceneGraph } from "../../core/model/SceneGraph";

export const constructModel = () => {
  const graph = new Graph();

  graph.createNode("Graphviz");
  graph.createNode("ReactFlow");
  graph.createNode("Unigraph");

  graph.createNode("A technology for communication");
  graph.createNode("Use it to tell a story");

  graph.createNode("Diagramming tool");
  graph.createNode("Describes itself");

  // Adding famous mathematicians
  graph.createNode("Euclid", { tags: ["mathematician"] });
  graph.createNode("Isaac Newton", { tags: ["mathematician"] });
  graph.createNode("Carl Friedrich Gauss", { tags: ["mathematician"] });
  graph.createNode("Leonhard Euler", { tags: ["mathematician"] });
  graph.createNode("Pythagoras", { tags: ["mathematician"] });
  graph.createNode("Albert Einstein", { tags: ["scientist"] });
  graph.createNode("Galileo Galilei", { tags: ["scientist"] });
  graph.createNode("Marie Curie", { tags: ["scientist"] });
  graph.createNode("Nikola Tesla", { tags: ["scientist"] });
  graph.createNode("Stephen Hawking", { tags: ["scientist"] });
  graph.createNode("Alan Turing", { tags: ["scientist"] });
  graph.createNode("Ada Lovelace", { tags: ["scientist"] });
  graph.createNode("Niels Bohr", { tags: ["scientist"] });
  graph.createNode("Richard Feynman", { tags: ["scientist"] });
  graph.createNode("James Clerk Maxwell", { tags: ["scientist"] });

  // Adding major works
  graph.createNode("Elements", { tags: ["major work"] });
  graph.createNode("Principia Mathematica", { tags: ["major work"] });
  graph.createNode("Opticks", { tags: ["major work"] });
  graph.createNode("Disquisitiones Arithmeticae", { tags: ["major work"] });
  graph.createNode("Introductio in analysin infinitorum", {
    tags: ["major work"],
  });
  graph.createNode("Pythagorean Theorem", { tags: ["major work"] });
  graph.createNode("Theory of Relativity", { tags: ["major work"] });
  graph.createNode("Dialogue Concerning the Two Chief World Systems", {
    tags: ["major work"],
  });
  graph.createNode("Radioactivity", { tags: ["major work"] });
  graph.createNode("AC Power", { tags: ["major work"] });
  graph.createNode("A Brief History of Time", { tags: ["major work"] });
  graph.createNode("On Computable Numbers", { tags: ["major work"] });
  graph.createNode("Analytical Engine", { tags: ["major work"] });
  graph.createNode("Bohr Model", { tags: ["major work"] });
  graph.createNode("Quantum Electrodynamics", { tags: ["major work"] });
  graph.createNode("Maxwell's Equations", { tags: ["major work"] });

  // Adding scientific and mathematical fields
  graph.createNode("Geometry", { tags: ["field"] });
  graph.createNode("Physics", { tags: ["field"] });
  graph.createNode("Mathematics", { tags: ["field"] });
  graph.createNode("Computer Science", { tags: ["field"] });
  graph.createNode("Chemistry", { tags: ["field"] });
  graph.createNode("Electrical Engineering", { tags: ["field"] });
  graph.createNode("Quantum Mechanics", { tags: ["field"] });

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
