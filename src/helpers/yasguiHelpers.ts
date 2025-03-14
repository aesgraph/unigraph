import { EdgeId } from "../core/model/Edge";
import { NodeDataArgs, NodeId } from "../core/model/Node";
import { SceneGraph } from "../core/model/SceneGraph";

export const processYasguiResults = (results: any, sceneGraph: SceneGraph) => {
  console.log("results are ", results);
  const nodes: { [id: string]: NodeDataArgs } = {};
  const edges: {
    [id: string]: { source: string; target: string; label: string };
  } = {};

  results.forEach((binding: any) => {
    const sourceId = binding.sub.value;
    const predId = binding.pred.value;
    const targetId = binding.obj.value;

    if (!nodes[sourceId]) {
      nodes[sourceId] = {
        label: sourceId,
        type: "Node",
        tags: [],
        description: "",
      };
    }

    if (!nodes[targetId]) {
      nodes[targetId] = {
        label: targetId,
        type: "Node",
        tags: [],
        description: "",
      };
    }

    const edgeId: EdgeId = `${sourceId}-${targetId}` as EdgeId;
    edges[edgeId] = { source: sourceId, target: targetId, label: predId };
  });

  Object.values(nodes).forEach((nodeData) => {
    sceneGraph.getGraph().createNode(nodeData.label as NodeId, nodeData);
  });

  Object.entries(edges).forEach(([edgeId, edgeData]) => {
    console.log("creating edge", edgeData);
    // sceneGraph.getGraph().setStrictMode(true);
    sceneGraph.getGraph().createEdge(edgeData.source, edgeData.target, {
      label: edgeData.label,
    });
  });

  sceneGraph.notifyGraphChanged();
};
