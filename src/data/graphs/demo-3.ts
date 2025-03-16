import { Graph } from "../../core/model/Graph";
import { SceneGraph } from "../../core/model/SceneGraph";

export const constructModel = () => {
  const graph = new Graph();

  const createEdge = (subject: string, verb: string, object: string): void => {
    graph.createNodeIfMissing(subject);
    graph.createNodeIfMissing(object);
    graph.createEdge(subject, object, { type: verb });
  };

  createEdge("AbstractEntity", "has", "id");
  createEdge("AbstractEntity", "has", "type");
  createEdge("AbstractEntity", "has", "tags");

  createEdge("Entity", "implements", "AbstractEntity");
  createEdge("Node", "is a", "Entity");
  createEdge("Edge", "is a", "Entity");
  createEdge("EntityContainer", "data store for ", "Entity");
  createEdge("NodesContainer", "is a", "EntityContainer");
  createEdge("EdgesContainer", "is a", "EntityContainer");
  createEdge("Graph", "has a", "NodesContainer");
  createEdge("Graph", "has a", "EdgesContainer");
  createEdge("SceneGraph", "is bound to a", "Graph");
  createEdge("SceneGraph", "drives", "RenderingManager");
  createEdge("RenderingManager", "drives", "Graph display settings");
  createEdge("Graph display settings", "via", "tags");
  createEdge("Graph display settings", "via", "type");

  createEdge("ForceGraph3d", "visualizes", "SceneGraph");
  createEdge("ReactFlow", "visualizes", "SceneGraph");
  createEdge("Graphviz", "visualizes", "SceneGraph");

  createEdge("SceneGraph", "import/export", "GraphMl");
  createEdge("SceneGraph", "import/export", "JSON");

  createEdge("SceneGraph", "has a", "LayoutEngine");
  createEdge("LayoutEngine", "includes", "Graphology Layouts");
  createEdge("LayoutEngine", "includes", "Graphviz Layouts");
  createEdge("LayoutEngine", "includes", "Custom 3d Layouts");

  createEdge("Gephi", "is a", "Graph visualization and analysis tool");
  createEdge("Graphviz", "is a", "Graph visualization tool");
  createEdge("NetworkX", "is a", "Graph analysis tool");
  createEdge("ReactFlow", "is a", "Graph visualization and interaction tool");

  return graph;
};

export const demo3 = () => {
  return new SceneGraph({
    graph: constructModel(),
    // metadata: {
    //   name: "demo3",
    //   description: "Basic viz for organization of unigraph",
    // },
  });
};
