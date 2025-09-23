// OpenAI Tools/Function definitions for AI interactions

import { getAvailableViewIds } from "../views/viewDefinitions";

export interface OpenAITool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, any>;
      required: string[];
    };
  };
}

export const SEMANTIC_QUERY_TOOL: OpenAITool = {
  type: "function",
  function: {
    name: "semantic_query",
    description:
      "Query the semantic web data using SPARQL or natural language. Use this to explore and analyze the graph data. IMPORTANT: When generating SPARQL queries, always include all necessary PREFIX declarations at the beginning of the query. Common prefixes include dbo:, dbr:, foaf:, rdf:, rdfs:, wd:, wdt:, and wikibase:. Return complete, executable SPARQL queries with all required prefixes.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "The complete SPARQL query with PREFIX declarations, or natural language query to execute",
        },
        queryType: {
          type: "string",
          enum: ["sparql", "natural"],
          description:
            "Type of query: 'sparql' for SPARQL queries, 'natural' for natural language queries",
        },
      },
      required: ["query", "queryType"],
    },
  },
};

export const WORKSPACE_LAYOUT_TOOL: OpenAITool = {
  type: "function",
  function: {
    name: "add_view_to_panel",
    description:
      "Add a view to a specific panel in the workspace layout. Use this when users want to open or switch to different views like AI Chat, SPARQL Query, ForceGraph 3D, etc.",
    parameters: {
      type: "object",
      properties: {
        viewId: {
          type: "string",
          enum: getAvailableViewIds(),
          description:
            "The ID of the view to add. Available views: " +
            getAvailableViewIds().join(", "),
        },
        panelId: {
          type: "string",
          enum: ["left", "center", "right", "bottom"],
          description: "The ID of the panel to add the view to",
        },
      },
      required: ["viewId", "panelId"],
    },
  },
};

export const CODE_EDITOR_TOOL: OpenAITool = {
  type: "function",
  function: {
    name: "edit_code",
    description:
      "Edit or generate code in the Monaco editor. Use this to write, modify, or update code in the code editor.",
    parameters: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "The code content to write or append to the editor",
        },
        language: {
          type: "string",
          enum: [
            "typescript",
            "javascript",
            "python",
            "java",
            "cpp",
            "csharp",
            "go",
            "rust",
            "html",
            "css",
            "json",
            "markdown",
            "sql",
            "yaml",
            "xml",
          ],
          description:
            "The programming language for the code (optional - will use current language if not specified)",
        },
        description: {
          type: "string",
          description: "A brief description of what the code does (optional)",
        },
        replace: {
          type: "boolean",
          description:
            "If true, replace the entire editor content. If false, append to existing content (default: false)",
        },
      },
      required: ["code"],
    },
  },
};

export const WRITE_CODE_TOOL: OpenAITool = {
  type: "function",
  function: {
    name: "write_code",
    description:
      "Write code to a file in the workspace. Use this to create or update code files.",
    parameters: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description:
            "The path to the file to write (e.g., 'src/components/MyComponent.tsx')",
        },
        code: {
          type: "string",
          description: "The code content to write to the file",
        },
        description: {
          type: "string",
          description: "A brief description of what the code does (optional)",
        },
      },
      required: ["filePath", "code"],
    },
  },
};

// Export all tools
export const MAP_CONTROL_TOOL: OpenAITool = {
  type: "function",
  function: {
    name: "map_control",
    description:
      "Control the 2D map view. Use this to navigate to locations, add markers, change map settings, or interact with the map. You can go to cities, landmarks, addresses, or any location that can be geocoded.",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: [
            "go_to",
            "add_marker",
            "set_zoom",
            "set_map_type",
            "clear_markers",
            "create_path",
          ],
          description: "The action to perform on the map",
        },
        location: {
          type: "string",
          description:
            "The location to navigate to or add as a marker (e.g., 'Tokyo', 'Eiffel Tower', 'New York City')",
        },
        zoom: {
          type: "number",
          description: "Zoom level (1-18) for the map",
        },
        mapType: {
          type: "string",
          enum: ["roadmap", "satellite", "terrain", "dark"],
          description: "The type of map to display",
        },
        description: {
          type: "string",
          description:
            "Optional description for the marker when adding a location",
        },
        locations: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "Array of locations for creating a path (e.g., ['Tokyo', 'Kyoto', 'Osaka'])",
        },
        pathName: {
          type: "string",
          description:
            "Name for the path (e.g., 'Japan Trip', 'European Tour')",
        },
      },
      required: ["action"],
    },
  },
};

export const ALL_AI_TOOLS = [
  SEMANTIC_QUERY_TOOL,
  WORKSPACE_LAYOUT_TOOL,
  CODE_EDITOR_TOOL,
  WRITE_CODE_TOOL,
  MAP_CONTROL_TOOL,
];

// Knowledge Graph Search Tool
export const KNOWLEDGE_GRAPH_SEARCH_TOOL: OpenAITool = {
  type: "function",
  function: {
    name: "knowledge_graph_search",
    description:
      "Search the knowledge graph for entities, relationships, or patterns. Use this for exploratory queries or when you need to find specific information.",
    parameters: {
      type: "object",
      properties: {
        search_term: {
          type: "string",
          description:
            "The search term or concept to look for in the knowledge graph.",
        },
        search_type: {
          type: "string",
          enum: ["entity", "relationship", "pattern", "general"],
          description: "The type of search to perform.",
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return (default: 10).",
        },
      },
      required: ["search_term", "search_type"],
    },
  },
};

// Graph Analysis Tool
export const GRAPH_ANALYSIS_TOOL: OpenAITool = {
  type: "function",
  function: {
    name: "graph_analysis",
    description:
      "Perform analysis on the knowledge graph, such as finding paths, calculating centrality, or identifying communities.",
    parameters: {
      type: "object",
      properties: {
        analysis_type: {
          type: "string",
          enum: [
            "shortest_path",
            "centrality",
            "communities",
            "clustering",
            "connectivity",
          ],
          description: "The type of analysis to perform.",
        },
        source_node: {
          type: "string",
          description:
            "Source node for path analysis (optional for some analysis types).",
        },
        target_node: {
          type: "string",
          description:
            "Target node for path analysis (optional for some analysis types).",
        },
        parameters: {
          type: "object",
          description: "Additional parameters specific to the analysis type.",
        },
      },
      required: ["analysis_type"],
    },
  },
};

// Helper function to create custom tools
export function createCustomTool(
  name: string,
  description: string,
  properties: Record<string, any>,
  required: string[] = []
): OpenAITool {
  return {
    type: "function",
    function: {
      name,
      description,
      parameters: {
        type: "object",
        properties,
        required,
      },
    },
  };
}

// Helper function to combine multiple tools
export function combineTools(...tools: OpenAITool[]): OpenAITool[] {
  return tools;
}

// Predefined tool sets for common use cases
export const SEMANTIC_TOOLS = combineTools(
  SEMANTIC_QUERY_TOOL,
  KNOWLEDGE_GRAPH_SEARCH_TOOL,
  WORKSPACE_LAYOUT_TOOL,
  CODE_EDITOR_TOOL,
  MAP_CONTROL_TOOL
);

export const GRAPH_ANALYSIS_TOOLS = combineTools(
  SEMANTIC_QUERY_TOOL,
  GRAPH_ANALYSIS_TOOL
);

export const ALL_TOOLS = combineTools(
  SEMANTIC_QUERY_TOOL,
  KNOWLEDGE_GRAPH_SEARCH_TOOL,
  GRAPH_ANALYSIS_TOOL,
  MAP_CONTROL_TOOL
);

// Type for tool call responses
export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

// Helper to parse tool call arguments
export function parseToolCallArguments(toolCall: ToolCall): any {
  try {
    return JSON.parse(toolCall.function.arguments);
  } catch (error) {
    console.error("Failed to parse tool call arguments:", error);
    return {};
  }
}
