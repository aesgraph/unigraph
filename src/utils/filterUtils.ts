import { FilterRuleDefinition } from "../components/filters/FilterRuleDefinition";
import { EntityIds } from "../core/model/entity/entityIds";
import { NodeId } from "../core/model/Node";
import { SceneGraph } from "../core/model/SceneGraph";

export const GetInclusiveTypesAndTags = (
  rules: FilterRuleDefinition[],
  sceneGraph: SceneGraph
) => {
  const includedTypes = new Set<string>();
  const excludedTypes = new Set<string>();
  const includedTags = new Set<string>();
  const excludedTags = new Set<string>();
  const includedNodeIds = new Set<string>();
  const excludedNodeIds = new Set<string>();

  // Single pass to categorize rules
  rules.forEach((rule) => {
    if (rule.ruleMode === "typesAndTags") {
      if (rule.operator === "include") {
        (rule.conditions.types || []).forEach((type) =>
          includedTypes.add(type)
        );
        (rule.conditions.tags || []).forEach((tag) => includedTags.add(tag));
      } else if (rule.operator === "exclude") {
        (rule.conditions.types || []).forEach((type) =>
          excludedTypes.add(type)
        );
        (rule.conditions.tags || []).forEach((tag) => excludedTags.add(tag));
      }
    } else if (rule.ruleMode === "entities") {
      if (rule.operator === "include") {
        (rule.conditions.nodes || []).forEach((id) => includedNodeIds.add(id));
      } else if (rule.operator === "exclude") {
        (rule.conditions.nodes || []).forEach((id) => excludedNodeIds.add(id));
      }
    }
  });

  // Fetch nodes based on IDs
  const includedNodes = sceneGraph
    .getNodes()
    .getAll(
      new EntityIds(Array.from(includedNodeIds).map((id) => id as NodeId)),
      false
    )
    .filter((node) => node !== undefined);

  const excludedNodes = sceneGraph
    .getNodes()
    .getAll(
      new EntityIds(Array.from(excludedNodeIds).map((id) => id as NodeId)),
      false
    )
    .filter((node) => node !== undefined);

  // Process types and tags from nodes
  includedNodes.forEach((node) => {
    includedTypes.add(node.getType());
    node.getTags().forEach((tag) => includedTags.add(tag));
  });

  excludedNodes.forEach((node) => {
    excludedTypes.add(node.getType());
    node.getTags().forEach((tag) => excludedTags.add(tag));
  });

  // Filter final types and tags
  const finalIncludedTypes = Array.from(includedTypes).filter(
    (type) => !excludedTypes.has(type)
  );

  const finalIncludedTags = Array.from(includedTags).filter(
    (tag) => !excludedTags.has(tag)
  );

  // Filter nodes and edges
  const filteredNodes = sceneGraph
    .getNodes()
    .filter(
      (node) =>
        finalIncludedTypes.includes(node.getType()) ||
        Array.from(node.getTags()).some((tag) =>
          finalIncludedTags.includes(tag)
        )
    );

  const filteredEdges = sceneGraph
    .getGraph()
    .getEdgesConnectedToNodes(filteredNodes.getIds());

  return {
    node: {
      types: finalIncludedTypes,
      tags: finalIncludedTags,
    },
    edge: {
      types: filteredEdges.getTypes(),
      tags: filteredEdges.getTags(),
    },
  };
};
