import { Graph } from "../../core/model/Graph";
import { SceneGraph } from "../../core/model/SceneGraph";

export const graph = new Graph();

const numTags = 10;
const numNodes = 100;
const numEdges = 200;

const tags = Array.from({ length: numTags }, (_, i) => `tag${i}`);

for (let i = 0; i < numNodes; i++) {
  graph.createNode(`node${i}`, { tags: [tags[i % numTags]] });
}

for (let i = 0; i < numEdges; i++) {
  const source = `node${Math.floor(Math.random() * numNodes)}`;
  const target = `node${Math.floor(Math.random() * numNodes)}`;
  graph.createEdge(source, target, { tags: [tags[i % numTags]] });
}

export const randomBigGraph = new SceneGraph({
  graph,
  metadata: {
    name: "Random hundred",
    description: "A randomly generated graph with 100 nodes and 200 edges.",
  },
});
