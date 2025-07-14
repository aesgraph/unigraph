import { Graph } from "../../core/model/Graph";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";

// Types for the AST and SceneGraph
// (You can adjust these as needed for your app)
type InterfaceAST = Record<
  string,
  {
    properties: Record<string, string>;
    references: string[];
  }
>;

// --- Enhanced Reference Extraction ---
function extractReferences(
  typeStr: string,
  allInterfaces: Set<string>
): string[] {
  // Remove array notation
  const baseType = typeStr.replace(/\[\]$/, "").trim();

  // If it's a union or intersection, split and recurse
  if (baseType.includes("|") || baseType.includes("&")) {
    return baseType
      .split(/[|&]/)
      .map((t) => extractReferences(t.trim(), allInterfaces))
      .flat();
  }

  // If it's an inline object, parse its fields
  if (baseType.startsWith("{") && baseType.endsWith("}")) {
    // Very basic field extraction (not a full parser)
    const fieldMatches = baseType.matchAll(/(\w+)\??:\s*([^;]+);?/g);
    let refs: string[] = [];
    for (const match of fieldMatches) {
      refs = refs.concat(extractReferences(match[2].trim(), allInterfaces));
    }
    return refs;
  }

  // If it's a known interface, return it
  if (allInterfaces.has(baseType)) {
    return [baseType];
  }

  // If it's a primitive, ignore
  if (
    [
      "string",
      "number",
      "boolean",
      "any",
      "unknown",
      "void",
      "object",
      "null",
      "undefined",
    ].includes(baseType)
  ) {
    return [];
  }

  // Otherwise, return as-is (could be a type alias or external type)
  return [baseType];
}

export async function demo_scenegraph_ast(
  url: string = "/data/unigraph-ast/interface-ast.json"
): Promise<SceneGraph> {
  // Load the AST
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch AST JSON: ${response.statusText}`);
  }
  console.log("Fetching AST JSON from:", url, response);

  const ast: InterfaceAST = await response.json();
  const graph = new Graph();
  const allInterfaces = new Set(Object.keys(ast));

  for (const [iface, data] of Object.entries(ast)) {
    graph.createNode({
      id: iface,
      label: iface,
      type: "interface",
    });

    // Enhanced: Extract references from property types
    for (const [prop, typeStr] of Object.entries(data.properties)) {
      const refs = extractReferences(typeStr, allInterfaces);
      for (const ref of refs) {
        if (ref && ref !== iface && allInterfaces.has(ref)) {
          graph.createEdgeIfMissing(iface, ref as NodeId);
        }
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
