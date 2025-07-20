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
    kind: "interface" | "type" | "function" | "class";
    properties: Record<string, string>;
    references: string[];
    definition?: string; // For type aliases
    arguments?: Record<string, string>; // For functions
    returnType?: string; // For functions
    methods?: Record<
      string,
      { arguments: Record<string, string>; returnType: string }
    >; // For classes
    extends?: string; // For classes that extend other classes
    implements?: string[]; // For classes that implement interfaces
    description?: string; // For interfaces/types/classes
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
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch AST JSON: ${response.statusText}`);
    }
    console.log("Fetching AST JSON from:", url, response);

    const rawData = await response.json();
    console.log("Raw AST data keys:", Object.keys(rawData));

    // Extract metadata
    const filesMap = rawData._files as Record<string, string[]> | undefined;
    const directoriesMap = rawData._directories as
      | Record<string, string[]>
      | undefined;

    // Filter out metadata entries to get actual AST data
    const ast: InterfaceAST = Object.fromEntries(
      Object.entries(rawData).filter(([key]) => !key.startsWith("_"))
    ) as InterfaceAST;

    console.log("Filtered AST data:", Object.keys(ast).length, "entries");

    const graph = new Graph();
    const allTypes = new Set(Object.keys(ast));

    for (const [name, data] of Object.entries(ast)) {
      try {
        // Ensure we have valid data structure
        if (!data || typeof data !== "object") {
          console.warn(`Skipping invalid entry: ${name}`);
          continue;
        }

        // Convert references from object to array if needed
        const references = Array.isArray(data.references)
          ? data.references
          : data.references && typeof data.references === "object"
            ? Object.keys(data.references)
            : [];

        // Prepare fields for ResizableDefinitionCard
        const fields = Object.entries(data.properties || {}).map(
          ([fieldName, fieldType]) => ({
            name: fieldName,
            type: fieldType,
          })
        );

        // Compose definition data
        const definitionData = {
          name,
          kind: data.kind,
          fields,
          description: data.description || undefined,
        };

        // Compose classData for ResizableClassCard if this is a class
        let classData = undefined;
        if (data.kind === "class") {
          // Data members
          const classFields = fields;
          // Methods
          const methods = data.methods
            ? Object.entries(data.methods).map(([methodName, methodData]) => ({
                name: methodName,
                arguments: Object.entries(methodData.arguments || {}).map(
                  ([argName, argType]) => ({
                    name: argName,
                    type: argType,
                  })
                ),
                returnType: methodData.returnType,
              }))
            : [];
          classData = {
            name,
            description: data.description || undefined,
            fields: classFields,
            methods,
          };
        }

        graph.createNode({
          id: name,
          label: name,
          type: data.kind === "class" ? "class" : "definition",
          userData: {
            definition: definitionData,
            ...(classData ? { classData } : {}),
          },
        });

        // Enhanced: Extract references from property types (for interfaces and classes)
        for (const [_, typeStr] of Object.entries(data.properties || {})) {
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

        // Handle class-specific features
        if (data.kind === "class") {
          // Handle inheritance (extends)
          if (data.extends && allTypes.has(data.extends)) {
            graph.createEdgeIfMissing(name, data.extends as NodeId);
          }

          // Handle interface implementation
          if (data.implements) {
            for (const interfaceName of data.implements) {
              if (allTypes.has(interfaceName)) {
                graph.createEdgeIfMissing(name, interfaceName as NodeId);
              }
            }
          }

          // Handle methods
          if (data.methods) {
            for (const [methodName, methodData] of Object.entries(
              data.methods
            )) {
              const methodNodeId = `${name}::${methodName}`;
              graph.createNode({
                id: methodNodeId,
                label: `${methodName}(): ${methodData.returnType}`,
                type: "method",
              });
              graph.createEdgeIfMissing(name, methodNodeId as NodeId);

              // Create argument nodes for method parameters
              for (const [argName, argType] of Object.entries(
                methodData.arguments || {}
              )) {
                const refs = extractReferences(argType, allTypes);
                for (const ref of refs) {
                  if (ref && allTypes.has(ref)) {
                    graph.createEdgeIfMissing(
                      methodNodeId as NodeId,
                      ref as NodeId
                    );
                  }
                }

                const methodArgNodeId = `${methodNodeId}:${argName}`;
                graph.createNode({
                  id: methodArgNodeId,
                  label: `${argName}: ${argType}`,
                  type: "method-argument",
                });
                graph.createEdgeIfMissing(
                  methodNodeId as NodeId,
                  methodArgNodeId as NodeId,
                  { type: "method-argument" }
                );
              }

              // Handle method return type references
              if (methodData.returnType && methodData.returnType !== "void") {
                const refs = extractReferences(methodData.returnType, allTypes);
                for (const ref of refs) {
                  if (ref && allTypes.has(ref)) {
                    graph.createEdgeIfMissing(
                      methodNodeId as NodeId,
                      ref as NodeId,
                      { type: "method-return" }
                    );
                  }
                }
              }
            }
          }
        }

        // Also use the explicit references from the AST
        for (const ref of references) {
          if (ref && ref !== name && allTypes.has(ref)) {
            graph.createEdgeIfMissing(name, ref as NodeId);
          }
        }
      } catch (nodeError) {
        console.error(`Error processing node ${name}:`, nodeError);
      }
    }

    // Add file nodes and edges
    if (filesMap) {
      for (const filePath of Object.keys(filesMap)) {
        graph.createNode({
          id: filePath,
          label: filePath.split("/").pop() || filePath,
          type: "file",
        });
        for (const symbol of filesMap[filePath]) {
          // Check if this symbol exists in our filtered AST data
          if (allTypes.has(symbol)) {
            graph.createEdgeIfMissing(filePath, symbol, {
              type: "parent to child",
            });
          }
        }
      }
    }

    // Add directory nodes and edges
    if (directoriesMap) {
      for (const dirPath of Object.keys(directoriesMap)) {
        graph.createNode({
          id: dirPath,
          label: dirPath.split("/").pop() || dirPath,
          type: "directory",
        });
        for (const filePath of directoriesMap[dirPath]) {
          // Only create edge if the file path exists as a node
          if (filesMap && Object.keys(filesMap).includes(filePath)) {
            graph.createEdgeIfMissing(dirPath, filePath, {
              type: "file contains",
            });
          }
        }
      }
    }

    console.log(
      `Created scene graph with ${graph.getNodes().size()} nodes and ${graph.getEdges().size()} edges`
    );
    console.log(
      "Node types created:",
      Array.from(
        new Set(
          graph
            .getNodes()
            .toArray()
            .map((n) => n.getType())
        )
      )
    );

    return new SceneGraph({
      graph,
      metadata: {
        name: "Ultimate AST SceneGraph",
        description:
          "Complete scene graph with interfaces, types, functions, classes, properties, and methods",
      },
      defaultAppConfig: {
        ...DEFAULT_APP_CONFIG(),
        activeLayout: GraphvizLayoutType.Graphviz_dot,
        activeView: "ReactFlow",
      },
    });
  } catch (error) {
    console.error("Error loading AST scene graph:", error);
    throw new Error(`Failed to load AST scene graph: ${error}`);
  }
}
