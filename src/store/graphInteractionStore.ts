import { create } from "zustand";
import { EdgeId } from "../core/model/Edge";
import { NodeId } from "../core/model/Node";
import { EntityIds } from "../core/model/entity/entityIds";
import { getCurrentSceneGraph } from "./appConfigStore";

type GraphInteractionState = {
  hoveredNodeIds: EntityIds<NodeId>;
  hoveredEdgeIds: EntityIds<EdgeId>;
  selectedNodeIds: EntityIds<NodeId>;
  selectedEdgeIds: EntityIds<EdgeId>;

  setHoveredNodeId: (nodeId: NodeId | null) => void;
  setHoveredEdgeId: (edgeId: EdgeId | null) => void;
  setHoveredNodeIds: (nodeIds: EntityIds<NodeId> | NodeId[]) => void;
  setHoveredEdgeIds: (edgeIds: EntityIds<EdgeId> | EdgeId[]) => void;
  getHoveredNodeId: () => NodeId | null;
  getHoveredEdgeId: () => EdgeId | null;
  getHoveredNodeIds: () => EntityIds<NodeId>;
  getHoveredEdgeIds: () => EntityIds<EdgeId>;
  setSelectedNodeId: (nodeId: NodeId | null) => void;
  setSelectedEdgeId: (edgeId: EdgeId | null) => void;
  setSelectedNodeIds: (nodeIds: EntityIds<NodeId> | NodeId[]) => void;
  setSelectedEdgeIds: (edgeIds: EntityIds<EdgeId> | EdgeId[]) => void;
  getSelectedNodeId: () => NodeId | null;
  getSelectedEdgeId: () => EdgeId | null;
  clearSelections: () => void;
};

const useGraphInteractionStore = create<GraphInteractionState>((set, get) => ({
  hoveredNodeIds: new EntityIds(),
  hoveredEdgeIds: new EntityIds(),
  selectedNodeIds: new EntityIds(),
  selectedEdgeIds: new EntityIds(),

  setHoveredNodeId: (nodeId) => {
    if (nodeId == null && getHoveredNodeIds().size === 0) {
      return;
    }
    // console.log("setting to ", nodeId);
    set({ hoveredNodeIds: nodeId ? new EntityIds([nodeId]) : new EntityIds() });
  },

  setHoveredEdgeId: (edgeId) =>
    set({ hoveredEdgeIds: edgeId ? new EntityIds([edgeId]) : new EntityIds() }),
  setHoveredNodeIds: (nodeIds) => {
    // console.log("setting to ", nodeIds);
    set({ hoveredNodeIds: new EntityIds(nodeIds) });
  },

  setHoveredEdgeIds: (edgeIds) =>
    set({ hoveredEdgeIds: new EntityIds(edgeIds) }),

  getHoveredNodeId: () => {
    const hoveredNodeIds = get().hoveredNodeIds;
    return hoveredNodeIds.size === 1 ? hoveredNodeIds.toArray()[0] : null;
  },
  getHoveredEdgeId: () => {
    const hoveredEdgeIds = get().hoveredEdgeIds;
    return hoveredEdgeIds.size === 1 ? hoveredEdgeIds.toArray()[0] : null;
  },
  getHoveredNodeIds: () => get().hoveredNodeIds,
  getHoveredEdgeIds: () => get().hoveredEdgeIds,

  setSelectedNodeId: (nodeId) => {
    console.log("setting selected node to ", nodeId);
    set({
      selectedNodeIds: nodeId ? new EntityIds([nodeId]) : new EntityIds(),
    });
  },

  getSelectedNodeId: () => {
    const selectedNodes = Array.from(get().selectedNodeIds);
    return selectedNodes.length === 1 ? selectedNodes[0] : null;
  },
  getSelectedEdgeId: () => {
    const selectedEdges = Array.from(get().selectedEdgeIds);
    return selectedEdges.length === 1 ? selectedEdges[0] : null;
  },
  setSelectedEdgeId: (edgeId) =>
    set({
      selectedEdgeIds: edgeId ? new EntityIds([edgeId]) : new EntityIds(),
    }),
  setSelectedNodeIds: (nodeIds) => {
    // console.log("setting selected nodes to ", nodeIds);
    set({ selectedNodeIds: new EntityIds(nodeIds) });
  },

  setSelectedEdgeIds: (edgeIds) =>
    set({ selectedEdgeIds: new EntityIds(edgeIds) }),
  clearSelections: () =>
    set({
      selectedNodeIds: new EntityIds(),
      selectedEdgeIds: new EntityIds(),
      hoveredNodeIds: new EntityIds(),
      hoveredEdgeIds: new EntityIds(),
    }),
}));

export const setHoveredNodeId = (nodeId: NodeId | null) =>
  useGraphInteractionStore.getState().setHoveredNodeId(nodeId);
export const setHoveredEdgeId = (edgeId: EdgeId | null) =>
  useGraphInteractionStore.getState().setHoveredEdgeId(edgeId);
export const setHoveredNodeIds = (nodeIds: EntityIds<NodeId> | NodeId[]) =>
  useGraphInteractionStore.getState().setHoveredNodeIds(nodeIds);
export const setHoveredEdgeIds = (edgeIds: EntityIds<EdgeId> | EdgeId[]) =>
  useGraphInteractionStore.getState().setHoveredEdgeIds(edgeIds);
export const getHoveredNodeId = () =>
  useGraphInteractionStore.getState().getHoveredNodeId();
export const getHoveredEdgeId = () =>
  useGraphInteractionStore.getState().getHoveredEdgeId();
export const getHoveredNodeIds = () =>
  useGraphInteractionStore.getState().getHoveredNodeIds();
export const getHoveredEdgeIds = () =>
  useGraphInteractionStore.getState().getHoveredEdgeIds();
export const getSelectedNodeId = () =>
  useGraphInteractionStore.getState().getSelectedNodeId();
export const getSelectedEdgeId = () =>
  useGraphInteractionStore.getState().getSelectedEdgeId();
export const setSelectedNodeId = (nodeId: NodeId | null) =>
  useGraphInteractionStore.getState().setSelectedNodeId(nodeId);
export const setSelectedEdgeId = (edgeId: EdgeId | null) =>
  useGraphInteractionStore.getState().setSelectedEdgeId(edgeId);
export const setSelectedNodeIds = (nodeIds: EntityIds<NodeId> | NodeId[]) =>
  useGraphInteractionStore.getState().setSelectedNodeIds(nodeIds);
export const setSelectedEdgeIds = (edgeIds: EntityIds<EdgeId> | EdgeId[]) =>
  useGraphInteractionStore.getState().setSelectedEdgeIds(edgeIds);
export const getSelectedNodeIds = () =>
  useGraphInteractionStore.getState().selectedNodeIds;
export const getSelectedEdgeIds = () =>
  useGraphInteractionStore.getState().selectedEdgeIds;
export const clearSelections = () =>
  useGraphInteractionStore.getState().clearSelections();

export const selectNodeIdsByType = (nodeType: string) => {
  useGraphInteractionStore
    .getState()
    .setSelectedNodeIds(
      Array.from(
        getCurrentSceneGraph().getNodes().filterByType(nodeType).getIds()
      )
    );
};

export const selectNodesIdsByTag = (tag: string) => {
  useGraphInteractionStore
    .getState()
    .setSelectedNodeIds(
      Array.from(getCurrentSceneGraph().getNodes().filterByTag(tag).getIds())
    );
};

export const selectEdgeIdsByType = (edgeType: string) => {
  useGraphInteractionStore
    .getState()
    .setSelectedEdgeIds(
      Array.from(
        getCurrentSceneGraph().getEdges().filterByType(edgeType).getIds()
      )
    );
};

export const selectEdgeIdsByTag = (tag: string) => {
  useGraphInteractionStore
    .getState()
    .setSelectedEdgeIds(
      Array.from(getCurrentSceneGraph().getEdges().filterByTag(tag).getIds())
    );
};

export default useGraphInteractionStore;
