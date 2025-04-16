import { EdgeId } from "../../core/model/Edge";
import { SceneGraph } from "../../core/model/SceneGraph";
import { ContextMenuItem } from "./ContextMenu";

/**
 * Generate context menu items for a single selected edge
 */
export const getEdgeContextMenuItems = (
  edgeId: EdgeId,
  sceneGraph: SceneGraph,
  setSelectedEdgeId: (edgeId: EdgeId | null) => void,
  setJsonEditEntity: (entity: any) => void,
  onMenuClose?: () => void
): ContextMenuItem[] => [
  {
    label: "Select Edge",
    action: () => setSelectedEdgeId(edgeId),
  },
  {
    label: "Edit JSON",
    action: () => {
      setJsonEditEntity(sceneGraph.getGraph().getEdge(edgeId));
    },
  },
  {
    label: "Delete Edge",
    action: () => {
      sceneGraph.getGraph().removeEdge(edgeId);
      sceneGraph.notifyGraphChanged();
      if (onMenuClose) onMenuClose();
    },
  },
];
