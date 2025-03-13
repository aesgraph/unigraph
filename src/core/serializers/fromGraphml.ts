import { NodePositionData } from "../layouts/layoutHelpers";
import { forceConsistencyOnGraph } from "../model/forceConsistency";
import { Graph } from "../model/Graph";
import { SceneGraph } from "../model/SceneGraph";
import { validateSceneGraph } from "../model/validateSceneGraph";

export async function deserializeGraphmlToSceneGraph(
  graphmlContent: string
): Promise<SceneGraph> {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(graphmlContent, "application/xml");

  const graphElement = xmlDoc.querySelector("graph");
  if (!graphElement) {
    throw new Error("Invalid GraphML content: Missing <graph> element.");
  }

  const positions: NodePositionData = {};
  const graph = new Graph();

  const nodeElements = graphElement.querySelectorAll("node");
  nodeElements.forEach((nodeElement) => {
    const id = nodeElement.getAttribute("id");
    const label =
      nodeElement.querySelector("data[key='label']")?.textContent || "";
    const x = parseFloat(
      nodeElement.querySelector("data[key='x']")?.textContent || "0"
    );
    const y = parseFloat(
      nodeElement.querySelector("data[key='y']")?.textContent || "0"
    );
    const z = parseFloat(
      nodeElement.querySelector("data[key='z']")?.textContent || "0"
    );
    const color =
      nodeElement.querySelector("data[key='color']")?.textContent || "#000000";
    const type =
      nodeElement.querySelector("data[key='type']")?.textContent || "default";
    const tags =
      nodeElement.querySelector("data[key='tags']")?.textContent?.split(", ") ||
      [];

    if (id) {
      const node = graph.createNode(id, { label, type });
      tags.forEach((tag) => {
        if (tag) {
          node.addTag(tag);
        }
      });
      positions[id] = { x, y, z };
    }
  });

  const edgeElements = graphElement.querySelectorAll("edge");
  edgeElements.forEach((edgeElement) => {
    const id = edgeElement.getAttribute("id");
    const source = edgeElement.getAttribute("source");
    const target = edgeElement.getAttribute("target");
    const label =
      edgeElement.querySelector("data[key='label']")?.textContent || "";
    const color =
      edgeElement.querySelector("data[key='color']")?.textContent || "#000000";
    const type =
      edgeElement.querySelector("data[key='type']")?.textContent || "default";
    const tags =
      edgeElement.querySelector("data[key='tags']")?.textContent?.split(", ") ||
      [];

    if (id && source && target) {
      const edge = graph.createEdge(source, target, { label, type });
      tags.forEach((tag) => {
        if (tag) {
          edge.addTag(tag);
        }
      });
    }
  });

  const sceneGraph = new SceneGraph({
    graph,
    metadata: { name: "GraphML Import" },
  });
  sceneGraph.getDisplayConfig().nodePositions = positions;
  forceConsistencyOnGraph(sceneGraph.getGraph());
  validateSceneGraph(sceneGraph);
  return sceneGraph;
}
