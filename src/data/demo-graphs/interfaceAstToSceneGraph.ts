import { DEFAULT_APP_CONFIG } from "../../AppConfig";
import { GraphvizLayoutType } from "../../core/layouts/GraphvizLayoutType";
import { Graph } from "../../core/model/Graph";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";

// Types for the AST and SceneGraph
// (You can adjust these as needed for your app)
type InterfaceAST = Record<
  string,
  {
    kind: "interface" | "type" | "function";
    properties: Record<string, string>;
    references: string[];
    definition?: string; // For type aliases
    arguments?: Record<string, string>; // For functions
    returnType?: string; // For functions
  }
>;

// --- Enhanced Reference Extraction ---
function extractReferences(typeStr: string, allTypes: Set<string>): string[] {
  // Remove array notation
  const baseType = typeStr.replace(/\[\]$/, "").trim();

  // If it's a union or intersection, split and recurse
  if (baseType.includes("|") || baseType.includes("&")) {
    return baseType
      .split(/[|&]/)
      .map((t) => extractReferences(t.trim(), allTypes))
      .flat();
  }

  // If it's an inline object, parse its fields
  if (baseType.startsWith("{") && baseType.endsWith("}")) {
    // Very basic field extraction (not a full parser)
    const fieldMatches = baseType.matchAll(/(\w+)\??:\s*([^;]+);?/g);
    let refs: string[] = [];
    for (const match of fieldMatches) {
      refs = refs.concat(extractReferences(match[2].trim(), allTypes));
    }
    return refs;
  }

  // If it's a known interface or type, return it
  if (allTypes.has(baseType)) {
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
  const allTypes = new Set(Object.keys(ast));

  for (const [name, data] of Object.entries(ast)) {
    graph.createNode({
      id: name,
      label: name,
      type: data.kind,
    });

    // Enhanced: Extract references from property types (for interfaces)
    for (const [_, typeStr] of Object.entries(data.properties)) {
      const refs = extractReferences(typeStr, allTypes);
      for (const ref of refs) {
        if (ref && ref !== name && allTypes.has(ref)) {
          graph.createEdgeIfMissing(name, ref as NodeId);
        }
      }
    }

    // Extract references from type definition (for type aliases)
    if (data.definition) {
      const refs = extractReferences(data.definition, allTypes);
      for (const ref of refs) {
        if (ref && ref !== name && allTypes.has(ref)) {
          graph.createEdgeIfMissing(name, ref as NodeId);
        }
      }
    }

    // Extract references from function arguments (for functions)
    if (data.arguments) {
      for (const [argName, argType] of Object.entries(data.arguments)) {
        const refs = extractReferences(argType, allTypes);
        for (const ref of refs) {
          if (ref && allTypes.has(ref)) {
            graph.createEdgeIfMissing(name, ref as NodeId);
          }
        }

        // Create argument node
        const argNodeId = `${name}:${argName}`;
        graph.createNode({
          id: argNodeId,
          label: `${argName}: ${argType}`,
          type: "argument",
        });
        graph.createEdgeIfMissing(name, argNodeId as NodeId);
      }
    }

    // Extract references from return type (for functions)
    if (data.returnType && data.returnType !== "void") {
      const refs = extractReferences(data.returnType, allTypes);
      for (const ref of refs) {
        if (ref && ref !== name && allTypes.has(ref)) {
          graph.createEdgeIfMissing(name, ref as NodeId);
        }
      }
    }

    // Also use the explicit references from the AST
    for (const ref of data.references) {
      if (ref && ref !== name && allTypes.has(ref)) {
        graph.createEdgeIfMissing(name, ref as NodeId);
      }
    }
  }

  return new SceneGraph({
    graph,
    metadata: {
      name: "Interface, Type, and Function AST SceneGraph",
      description:
        "A scene graph representing interfaces, types, and functions from the AST",
    },
    defaultAppConfig: {
      ...DEFAULT_APP_CONFIG(),
      activeLayout: GraphvizLayoutType.Graphviz_dot,
      activeView: "ReactFlow",
    },
  });
}
