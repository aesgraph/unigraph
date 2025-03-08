import { Graph } from "../../core/model/Graph";
import { SceneGraph } from "../../core/model/SceneGraphv2";

export const graph = new Graph();

const numTags = 10;
const numNodes = 1000;
const numEdges = 1000;

const tags = Array.from({ length: numTags }, (_, i) => `tag${i}`);

for (let i = 0; i < numNodes; i++) {
  graph.createNode(`node${i}`, { tags: [tags[i % numTags]] });
}

for (let i = 0; i < numEdges; i++) {
  const source = `node${Math.floor(Math.random() * numNodes)}`;
  const target = `node${Math.floor(Math.random() * numNodes)}`;
  graph.createEdge(source, target, { tags: [tags[i % numTags]] });
}

export const randomBiggestGraph = new SceneGraph({
  graph,
  metadata: {
    name: "Random 1k",
    description: "A randomly generated graph with 1k nodes and 1k edges.",
  },
});
