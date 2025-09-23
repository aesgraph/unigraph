export const exampleDefinitionCards = [
  {
    name: "FilterRuleDefinition",
    kind: "interface",
    description: "Defines a single filter rule.",
    fields: [
      { name: "id", type: "string" },
      { name: "operator", type: "FilterOperator" },
      { name: "ruleMode", type: "FilterRuleMode" },
      {
        name: "conditions",
        type: "{ types?: string[]; tags?: string[]; nodes?: string[]; }",
      },
    ],
    dimensions: { width: 320, height: 180 },
  },
  {
    name: "Filter",
    kind: "interface",
    description: "A filter with a name, description, and rules.",
    fields: [
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "filterRules", type: "FilterRuleDefinition[]" },
    ],
    dimensions: { width: 320, height: 160 },
  },
  {
    name: "User",
    kind: "type",
    description: "A user object.",
    fields: [
      { name: "id", type: "string" },
      { name: "email", type: "string" },
      { name: "roles", type: "string[]" },
    ],
    dimensions: { width: 300, height: 140 },
  },
  {
    name: "GraphNode",
    kind: "class",
    description: "A node in a graph structure.",
    fields: [
      { name: "id", type: "string" },
      { name: "edges", type: "GraphEdge[]" },
      { name: "data", type: "any" },
    ],
    dimensions: { width: 340, height: 160 },
  },
];
