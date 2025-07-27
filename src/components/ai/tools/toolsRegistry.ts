import codeGenerationToolDefinition from "./codeGenerationTool";

// Semantic Web Query Tool Definition
const semanticWebQueryToolDefinition = {
  name: "semantic_query",
  description:
    "Execute SPARQL queries against semantic web endpoints and display results. Can query knowledge bases like Wikidata, DBpedia, and other linked data sources.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "The SPARQL query to execute. Should be a valid SPARQL SELECT, ASK, CONSTRUCT, or DESCRIBE query.",
      },
      description: {
        type: "string",
        description:
          "A brief description of what the query does or what information it's seeking.",
      },
      endpoint: {
        type: "string",
        description:
          "The SPARQL endpoint URL to query. If not specified, will use the currently selected endpoint in the semantic web panel.",
      },
    },
    required: ["query"],
  },
  examples: [
    {
      description: "Query for famous scientists from Wikidata",
      parameters: {
        query: `SELECT ?scientist ?scientistLabel ?field ?fieldLabel WHERE {
  ?scientist wdt:P106 wd:Q169470 .
  ?scientist wdt:P101 ?field .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
} LIMIT 10`,
        description: "Find famous scientists and their fields of study",
        endpoint: "https://query.wikidata.org/sparql",
      },
    },
    {
      description: "Query for cities in France from DBpedia",
      parameters: {
        query: `SELECT ?city ?cityName ?population WHERE {
  ?city a dbo:City .
  ?city dbo:country dbr:France .
  ?city dbo:populationTotal ?population .
  ?city rdfs:label ?cityName .
  FILTER(LANG(?cityName) = "en")
} ORDER BY DESC(?population) LIMIT 10`,
        description: "Find French cities ordered by population",
        endpoint: "https://dbpedia.org/sparql",
      },
    },
  ],
};

// Workspace Layout Tool Definition
const workspaceLayoutToolDefinition = {
  name: "add_view_to_panel",
  description:
    "Add a specific view to a panel in the workspace layout. This allows dynamic arrangement of different views and panels.",
  parameters: {
    type: "object",
    properties: {
      viewId: {
        type: "string",
        description:
          "The ID of the view to add. Available views include: 'monaco-editor', 'ai-chat', 'semantic-web-query', 'force-graph-3d-v2', 'entity-table-v2', 'system-monitor', etc.",
        enum: [
          "monaco-editor",
          "ai-chat",
          "semantic-web-query",
          "force-graph-3d-v2",
          "entity-table-v2",
          "system-monitor",
          "node-legend",
          "edge-legend",
          "react-flow-panel-v2",
          "about",
          "dev-tools",
          "lexical-editor",
        ],
      },
      panelId: {
        type: "string",
        description:
          "The ID of the panel to add the view to. Available panels: 'left', 'center', 'right', 'bottom'.",
        enum: ["left", "center", "right", "bottom"],
      },
    },
    required: ["viewId", "panelId"],
  },
  examples: [
    {
      description: "Add the Monaco Editor to the left panel",
      parameters: {
        viewId: "monaco-editor",
        panelId: "left",
      },
    },
    {
      description: "Add the AI Chat to the right panel",
      parameters: {
        viewId: "ai-chat",
        panelId: "right",
      },
    },
  ],
};

// Export all tool definitions
export const allToolDefinitions = [
  semanticWebQueryToolDefinition,
  codeGenerationToolDefinition,
  workspaceLayoutToolDefinition,
];

// Export individual tools for specific use cases
export {
  codeGenerationToolDefinition,
  semanticWebQueryToolDefinition,
  workspaceLayoutToolDefinition,
};

export default allToolDefinitions;
