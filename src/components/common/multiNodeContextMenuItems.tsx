import { Trash2 } from "lucide-react";
import { LayoutEngineOptionLabels } from "../../core/layouts/layoutEngineTypes";
import { EntityIds } from "../../core/model/entity/entityIds";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";
import { Filter } from "../../store/activeFilterStore";
import { addNotification } from "../../store/notificationStore";
import { computeLayoutAndTriggerUpdateForCurrentSceneGraph } from "../../store/sceneGraphHooks";
import { ContextMenuItem } from "./ContextMenu";
import {
  getHideMenuItem,
  getSaveAsNewFilterMenuItem,
  getShowSubmenuItems,
} from "./sharedContextMenuItems";

/**
 * Generate context menu items for multiple selected nodes
 */
export const getMultiNodeContextMenuItems = (
  nodeIds: NodeId[],
  currentSceneGraph: SceneGraph,
  applyFilter: (filter: Filter) => void,
  onMenuClose?: () => void,
  onShowDeleteDialog?: (nodeIds: NodeId[]) => void // Add callback for delete dialog
): ContextMenuItem[] => [
  {
    label: `Selected ${nodeIds.length} Nodes`,
    information: true,
    action: () => {}, // This is just a label
  },

  // Use shared show submenu
  getShowSubmenuItems(nodeIds, applyFilter, onMenuClose),

  // Use shared hide menu item
  getHideMenuItem(nodeIds, applyFilter, onMenuClose),

  getSaveAsNewFilterMenuItem(
    new EntityIds(nodeIds),
    "Save as New Filter",
    onMenuClose
  ),

  {
    label: "Copy IDs to Clipboard",
    action: () => {
      navigator.clipboard.writeText(nodeIds.join(", "));
      addNotification({
        message: `Copied ${nodeIds.length} node IDs to clipboard`,
        type: "success",
        duration: 3000,
      });
      onMenuClose?.();
    },
  },
  {
    label: "Connect Selected Nodes",
    action: () => {
      // Create edges between all selected nodes
      if (nodeIds.length >= 2) {
        const graph = currentSceneGraph.getGraph();

        // Connect nodes in sequence (1->2->3->...)
        for (let i = 0; i < nodeIds.length - 1; i++) {
          graph.createEdge(nodeIds[i], nodeIds[i + 1]);
        }

        currentSceneGraph.notifyGraphChanged();
        addNotification({
          message: `Connected ${nodeIds.length} nodes sequentially`,
          type: "success",
          duration: 3000,
        });
      }
      onMenuClose?.();
    },
  },
  {
    label: "Create Subgraph from Selection",
    action: () => {
      // Create a new graph containing only the selected nodes and their connections
      // This would typically open a dialog to name and save the subgraph
      addNotification({
        message: "Creating subgraph from selection - Feature coming soon",
        type: "info",
        duration: 3000,
      });
      onMenuClose?.();
    },
  },
  {
    label: "Apply Color to Selection",
    submenu: [
      {
        label: "Red",
        action: () => {
          // Apply red color to all selected nodes
          // Color logic would go here
          onMenuClose?.();
        },
      },
      {
        label: "Green",
        action: () => {
          // Apply green color to all selected nodes
          onMenuClose?.();
        },
      },
      {
        label: "Blue",
        action: () => {
          // Apply blue color to all selected nodes
          onMenuClose?.();
        },
      },
    ],
  },
  {
    label: "Apply Layout",
    displayMode: "grid",
    gridColumns: 4,
    submenu: LayoutEngineOptionLabels.map((layout) => ({
      label: layout,
      action: () => {
        computeLayoutAndTriggerUpdateForCurrentSceneGraph(
          layout,
          new EntityIds(nodeIds)
        );
        onMenuClose?.();
      },
    })),
  },
  {
    label: "",
    separator: true,
    action: () => {}, // This is just a separator
  },
  {
    label: "Delete Nodes",
    style: "caution",
    icon: Trash2,
    action: () => {
      onShowDeleteDialog?.(nodeIds);
      onMenuClose?.();
    },
  },
];
