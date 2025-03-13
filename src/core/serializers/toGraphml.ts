import { SceneGraph } from "../model/SceneGraph";

export function serializeSceneGraphToGraphml(sceneGraph: SceneGraph): string {
  const graph = sceneGraph.getGraph();
  const nodes = graph.getNodes();
  const edges = graph.getEdges();
  const nodePositions = sceneGraph.getDisplayConfig().nodePositions || {};

  let graphml = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
         xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns 
         http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">
  <graph id="G" edgedefault="directed">`;

  nodes.forEach((node, idx) => {
    const position = nodePositions[node.getId()] || { x: 0, y: 0 };
    const color = sceneGraph.getColor(node);
    const tags = Array.from(node.getTags()).join(", ");
    graphml += `
    <node id="${node.getId()}">
      <data key="label">${node.getLabel()}</data>
      <data key="x">${position.x}</data>
      <data key="y">${position.y}</data>`;
    if (position.z !== undefined) {
      graphml += `
      <data key="z">${position.z}</data>`;
    }
    graphml += `
      <data key="color">${color}</data>
      <data key="type">${node.getType()}</data>
      <data key="tags">${tags}</data>
    </node>`;
  });

  edges.forEach((edge, idx) => {
    const [source, target] = edge.getId().split(":::");
    const color = sceneGraph.getColor(edge);
    const tags = Array.from(edge.getTags()).join(", ");
    graphml += `
    <edge id="${edge.getId()}" source="${source}" target="${target}">
      <data key="label">${edge.getId()}</data>
      <data key="color">${color}</data>
      <data key="type">${edge.getType()}</data>
      <data key="tags">${tags}</data>
    </edge>`;
  });

  graphml += `
  </graph>
</graphml>`;

  return graphml;
}
