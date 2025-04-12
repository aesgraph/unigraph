import {
  getAllPaths,
  getDownstreamNodes,
  getUpstreamNodes,
} from "../../core/graphAlgorithms/getAllPaths";
import { EntityIds } from "../../core/model/entity/entityIds";
import { NodeId } from "../../core/model/Node";
import { Filter, saveFilter } from "../../store/activeFilterStore";
import { getCurrentSceneGraph } from "../../store/appConfigStore";
import { addNotification } from "../../store/notificationStore";
import { ContextMenuItem } from "./ContextMenu";

/**
 * Generate a "Show" submenu with various visualization options
 * Works for both single and multiple node selections
 */
export const getShowSubmenuItems = (
  nodeIds: NodeId | NodeId[],
  applyFilter: (filter: Filter) => void,
  onMenuClose?: () => void
): ContextMenuItem => {
  // Ensure nodeIds is always an array
  const nodeIdArray = Array.isArray(nodeIds) ? nodeIds : [nodeIds];
  console.log("nodeIdArray", nodeIdArray);

  return {
    label: "Show",
    submenu: [
      {
        label: "Selected Nodes Only",
        action: () => {
          applyFilter({
            name: "show only selected nodes",
            filterRules: [
              {
                id: "show only selected nodes",
                operator: "include",
                ruleMode: "entities",
                conditions: {
                  nodes: nodeIdArray,
                },
              },
            ],
          });
          onMenuClose?.();
        },
      },
      {
        label: "Inputs",
        action: () => {
          const inputNodes = getCurrentSceneGraph()
            .getGraph()
            .getEdgesTo(new EntityIds(nodeIdArray))
            .map((edge) => edge.getSource());
          const visibleNodes = getCurrentSceneGraph().getVisibleNodes();
          const newFilterSet = new EntityIds([
            ...nodeIdArray,
            ...inputNodes,
            ...visibleNodes,
          ]);

          applyFilter({
            name: "show selected nodes and their inputs",
            filterRules: [
              {
                id: "show selected nodes and inputs",
                operator: "include",
                ruleMode: "entities",
                conditions: {
                  nodes: newFilterSet.toArray(),
                },
              },
            ],
          });
          onMenuClose?.();
        },
      },
      {
        label: "Outputs",
        action: () => {
          const outputNodes = getCurrentSceneGraph()
            .getGraph()
            .getEdgesFrom(new EntityIds(nodeIdArray))
            .map((edge) => edge.getTarget());
          const visibleNodes = getCurrentSceneGraph().getVisibleNodes();
          const newFilterSet = new EntityIds([
            ...nodeIdArray,
            ...outputNodes,
            ...visibleNodes,
          ]);

          applyFilter({
            name: "show selected nodes and their outputs",
            filterRules: [
              {
                id: "show selected nodes and outputs",
                operator: "include",
                ruleMode: "entities",
                conditions: {
                  nodes: newFilterSet.toArray(),
                },
              },
            ],
          });
          onMenuClose?.();
        },
      },
      {
        label: "All Upstream",
        action: () => {
          const upstreamNodes = getUpstreamNodes(
            nodeIdArray,
            getCurrentSceneGraph()
          );
          const visibleNodes = getCurrentSceneGraph().getVisibleNodes();
          const newFilterSet = new EntityIds([
            ...upstreamNodes.toArray(),
            ...visibleNodes.toArray(),
          ]);

          applyFilter({
            name: "show selected nodes and all upstream",
            filterRules: [
              {
                id: "show selected nodes and upstream",
                operator: "include",
                ruleMode: "entities",
                conditions: {
                  nodes: newFilterSet.toArray(),
                },
              },
            ],
          });
          onMenuClose?.();
        },
      },
      {
        label: "All Downstream",
        action: () => {
          const downstreamNodes = getDownstreamNodes(
            nodeIdArray,
            getCurrentSceneGraph()
          );
          const visibleNodes = getCurrentSceneGraph().getVisibleNodes();
          const newFilterSet = new EntityIds([
            ...downstreamNodes.toArray(),
            ...visibleNodes.toArray(),
          ]);

          applyFilter({
            name: "show selected nodes and all downstream",
            filterRules: [
              {
                id: "show selected nodes and downstream",
                operator: "include",
                ruleMode: "entities",
                conditions: {
                  nodes: newFilterSet.toArray(),
                },
              },
            ],
          });
          onMenuClose?.();
        },
      },
      {
        label: "All Paths",
        action: () => {
          const allPathNodes = getAllPaths(nodeIdArray, getCurrentSceneGraph());
          const visibleNodes = getCurrentSceneGraph().getVisibleNodes();
          const newFilterSet = new EntityIds([
            ...nodeIdArray,
            ...allPathNodes.toArray(),
            ...visibleNodes.toArray(),
          ]);

          applyFilter({
            name: "show selected nodes and all paths",
            filterRules: [
              {
                id: "show selected nodes and all paths",
                operator: "include",
                ruleMode: "entities",
                conditions: {
                  nodes: newFilterSet.toArray(),
                },
              },
            ],
          });
          onMenuClose?.();
        },
      },
    ],
  };
};

/**
 * Generate a "Hide" menu item for selected nodes
 * Works for both single and multiple node selections
 */
export const getHideMenuItem = (
  nodeIds: NodeId | NodeId[],
  applyFilter: (filter: Filter) => void,
  onMenuClose?: () => void
): ContextMenuItem => {
  // Ensure nodeIds is always an array
  const nodeIdArray = Array.isArray(nodeIds) ? nodeIds : [nodeIds];

  return {
    label: `Hide ${nodeIdArray.length > 1 ? "Selected Nodes" : "Node"}`,
    action: () => {
      applyFilter({
        name: "hide selected nodes",
        filterRules: [
          {
            id: "hide selected nodes",
            operator: "exclude",
            ruleMode: "entities",
            conditions: {
              nodes: nodeIdArray,
            },
          },
        ],
      });
      onMenuClose?.();
    },
  };
};

/**
 * Create a menu item to save the current filter configuration
 */
export const getSaveAsNewFilterMenuItem = (
  nodeIds: EntityIds<NodeId>,
  label: string = "Save as New Filter",
  onMenuClose?: () => void
): ContextMenuItem => {
  return {
    label,
    action: () => {
      // Prompt user for filter name
      const filterName = prompt("Enter a name for this filter:", "New Filter");

      if (filterName) {
        // Create a new filter with the provided name
        const newFilter: Filter = {
          name: filterName,
          filterRules: [
            {
              id: "node selection",
              operator: "include",
              ruleMode: "entities",
              conditions: {
                nodes: nodeIds.toArray(),
              },
            },
          ],
        };

        // Save the filter
        saveFilter(newFilter);

        // Notify user
        addNotification({
          message: `Filter "${filterName}" saved successfully`,
          type: "success",
          duration: 3000,
        });
      }

      onMenuClose?.();
    },
  };
};
