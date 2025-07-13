import { ForceGraph3DInstance } from "3d-force-graph";
import { Trash2 } from "lucide-react";
import {
  bfsQuery,
  processYasguiResults,
} from "../../_experimental/yasgui/yasguiHelpers";
import { attachRepulsiveForce } from "../../core/force-graph/createForceGraph";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";
import { flyToNode } from "../../core/webgl/webglHelpers";
import { Filter } from "../../store/activeFilterStore"; // Add this import
import { ContextMenuItem } from "./ContextMenu";
import { getHideMenuItem, getShowSubmenuItems } from "./sharedContextMenuItems"; // Import shared menu items

/**
 * Generate context menu items for a single selected node
 */
export const getNodeContextMenuItems = (
  nodeId: NodeId,
  sceneGraph: SceneGraph,
  forceGraphInstance: ForceGraph3DInstance | null,
  setEntityEditorData: (data: { entity: any; isOpen: boolean } | null) => void,
  setJsonEditEntity: (entity: any) => void,
  setSelectedNodeId: (nodeId: NodeId | null) => void,
  setPathAnalysisConfig: (config: {
    startNode?: NodeId;
    endNode?: NodeId;
  }) => void,
  setShowPathAnalysis: (show: boolean) => void,
  applyFilter: (filter: Filter) => void, // Add this parameter
  onMenuClose?: () => void, // Add this parameter
  onShowDeleteDialog?: (nodeId: NodeId) => void // Add callback for delete dialog
): ContextMenuItem[] => {
  return [
    {
      label: "Focus Node",
      action: () => {
        if (forceGraphInstance) {
          const node = forceGraphInstance
            .graphData()
            .nodes.find((n) => n.id === nodeId);
          if (node) {
            flyToNode(forceGraphInstance, node, "Layout");
          }
        }
      },
    },
    {
      label: "Expand around Node",
      action: () => {
        if (forceGraphInstance) {
          attachRepulsiveForce(forceGraphInstance, nodeId);
        }
      },
    },
    {
      label: "Select Node",
      action: () => setSelectedNodeId(nodeId),
    },

    // Use shared show submenu
    getShowSubmenuItems(nodeId, applyFilter, onMenuClose),

    // Use shared hide menu item
    getHideMenuItem(nodeId, applyFilter, onMenuClose),

    {
      label: "Find path",
      submenu: [
        {
          label: "to...",
          action: () => {
            setPathAnalysisConfig({
              startNode: nodeId,
              endNode: undefined,
            });
            setShowPathAnalysis(true);
          },
        },
        {
          label: "from...",
          action: () => {
            setPathAnalysisConfig({
              startNode: undefined,
              endNode: nodeId,
            });
            setShowPathAnalysis(true);
          },
        },
      ],
    },
    {
      label: "Edit",
      action: () => {
        const entity = sceneGraph.getGraph().getNode(nodeId);
        setEntityEditorData({ entity, isOpen: true });
        onMenuClose?.();
      },
    },
    {
      label: "Edit JSON",
      action: () => {
        setJsonEditEntity(sceneGraph.getGraph().getNode(nodeId));
      },
    },
    {
      label: "Query dbpedia",
      action: () => {
        bfsQuery(nodeId.replace(" ", "_"), 200, 150, 500).then((results) =>
          processYasguiResults(results, sceneGraph)
        );
      },
    },
    {
      label: "",
      separator: true,
      action: () => {}, // This is just a separator
    },
    {
      label: "Delete Node",
      style: "caution",
      icon: Trash2,
      action: () => {
        onShowDeleteDialog?.(nodeId);
        onMenuClose?.();
      },
    },
  ];
};
