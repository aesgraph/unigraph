import { FilterRuleDefinition } from "../../components/filters/FilterRuleDefinition";
import { Graph } from "../model/Graph";
import { Node, NodeId } from "../model/Node";
import { EntitiesContainer } from "../model/entity/entitiesContainer";

const applyRule = (nodes: Node[], rule: FilterRuleDefinition): Node[] => {
  return nodes.filter((node) => {
    if (rule.ruleMode === "everything") {
      return true;
    }

    if (rule.ruleMode === "entities" && rule.conditions.nodes?.length) {
      return rule.conditions.nodes.includes(node.getId());
    }

    if (rule.ruleMode === "typesAndTags") {
      const matchesTypes =
        !rule.conditions.types?.length ||
        rule.conditions.types.includes(node.getType());

      const matchesTags =
        !rule.conditions.tags?.length ||
        node.getTags().size === 0 || // If node has no tags, consider it matching
        rule.conditions.tags.some((tag) => node.getTags().has(tag));

      return matchesTypes && matchesTags;
    }

    return false;
  });
};

export const filterNodes = (
  nodes: Node[],
  filters: FilterRuleDefinition[]
): Node[] => {
  if (!filters.length) {
    return nodes;
  }

  const includeRules = filters.filter((r) => r.operator === "include");
  const excludeRules = filters.filter((r) => r.operator === "exclude");

  // Start with all nodes if no include rules, otherwise start empty
  let includedNodes = includeRules.length === 0 ? [...nodes] : [];

  // Apply include rules (union)
  includeRules.forEach((rule) => {
    const matchingNodes = applyRule(nodes, rule);
    includedNodes = [...includedNodes, ...matchingNodes];
  });

  // Remove duplicates
  includedNodes = Array.from(new Set(includedNodes));

  // Apply exclude rules (override includes)
  return includedNodes.filter((node) => {
    return !excludeRules.some((rule) => {
      const matchingNodes = applyRule([node], rule);
      return matchingNodes.length > 0;
    });
  });
};

export const createFilteredModelGraph = (
  graph: Graph,
  filters: FilterRuleDefinition[]
): Graph => {
  if (!filters.length) {
    return graph;
  }

  const allNodes = graph.getNodes().toArray();
  const finalNodes = filterNodes(allNodes, filters);

  // Create new graph with filtered nodes
  const filteredGraph = new Graph();
  finalNodes.forEach((node) => {
    filteredGraph.addNode(node);
  });

  // Add edges between filtered nodes
  const edgesBetweenFilteredNodes = graph.getAllEdgesConnectingBetween(
    new EntitiesContainer<NodeId, Node>(finalNodes).getIds()
  );
  edgesBetweenFilteredNodes.forEach((edge) => {
    filteredGraph.addEdge(edge);
  });

  return filteredGraph;
};

// Helper function to create a filter preset from basic criteria
export const createBasicFilter = (
  types?: string[],
  tags?: string[],
  nodeIds?: string[],
  operator: "include" | "exclude" = "include"
): FilterRuleDefinition => {
  if (nodeIds?.length) {
    return {
      id: Math.random().toString(36).substr(2, 9),
      operator,
      ruleMode: "entities",
      conditions: {
        nodes: nodeIds,
      },
    };
  }

  if (!types?.length && !tags?.length) {
    return {
      id: Math.random().toString(36).substr(2, 9),
      operator,
      ruleMode: "everything",
      conditions: {},
    };
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    operator,
    ruleMode: "typesAndTags",
    conditions: {
      types,
      tags,
    },
  };
};
