import { Graph } from "../../core/model/Graph";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";

// Types for the AST and SceneGraph
type InterfaceAST = Record<
  string,
  {
    properties: Record<string, string>;
    references: string[];
  }
>;

export async function demo_scenegraph_ast(
  url: string = "/public/data/unigraph-ast/interface-ast.json"
): Promise<SceneGraph> {
  // Load the AST
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch AST JSON: ${response.statusText}`);
  }
  console.log("Fetching AST JSON from:", url, response);

  const ast: InterfaceAST = await response.json();
  const graph = new Graph();

  for (const [iface, data] of Object.entries(ast)) {
    graph.createNode({
      id: iface,
      label: iface,
      type: "interface",
    });

    const refs: string[] = Array.isArray(data.references)
      ? data.references
      : Array.from(data.references);

    for (const ref of refs) {
      if (ast[ref]) {
        graph.createEdge(iface, ref as NodeId, {
          label: "references",
        });
      }
    }
  }

  return new SceneGraph({
    graph,
    metadata: {
      name: "Interface AST SceneGraph",
      description: "A scene graph representing the interface AST",
    },
  });
}
