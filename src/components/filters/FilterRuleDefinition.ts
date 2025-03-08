export type FilterOperator = "include" | "exclude";
export type FilterRuleMode = "typesAndTags" | "entities" | "everything";

export interface FilterRuleDefinition {
  id: string;
  operator: FilterOperator;
  ruleMode: FilterRuleMode;
  conditions: {
    types?: string[];
    tags?: string[];
    nodes?: string[]; // Add nodes array for manual selection
  };
}

export interface FilterPreset {
  name: string;
  rules: FilterRuleDefinition[];
  description?: string;
}
