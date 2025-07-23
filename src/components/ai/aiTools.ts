// OpenAI Tools/Function definitions for AI interactions

export interface OpenAITool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, any>;
      required: string[];
    };
  };
}

// Semantic Web Query Tool
export const SEMANTIC_QUERY_TOOL: OpenAITool = {
  type: "function",
  function: {
    name: "semantic_query",
    description:
      "Execute a SPARQL query against the semantic web knowledge graph. Use this when you need to search for or retrieve information from the knowledge graph.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "The SPARQL query to execute. Should be a valid SPARQL SELECT query.",
        },
        description: {
          type: "string",
          description:
            "A brief description of what this query is trying to accomplish.",
        },
      },
      required: ["query", "description"],
    },
  },
};

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
  KNOWLEDGE_GRAPH_SEARCH_TOOL
);

export const GRAPH_ANALYSIS_TOOLS = combineTools(
  SEMANTIC_QUERY_TOOL,
  GRAPH_ANALYSIS_TOOL
);

export const ALL_TOOLS = combineTools(
  SEMANTIC_QUERY_TOOL,
  KNOWLEDGE_GRAPH_SEARCH_TOOL,
  GRAPH_ANALYSIS_TOOL
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
