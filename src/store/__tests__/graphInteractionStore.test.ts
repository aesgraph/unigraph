import { NodeId } from "../../core/model/Node";
import { EntityIds } from "../../core/model/entity/entityIds";
import useGraphInteractionStore, {
  getHoveredEdgeId,
  getHoveredEdgeIds,
  getHoveredNodeId,
  getHoveredNodeIds,
  getSelectedEdgeId,
  getSelectedEdgeIds,
  getSelectedNodeId,
  getSelectedNodeIds,
  setHoveredNodeId,
  setSelectedNodeId,
  setSelectedNodeIds,
} from "../graphInteractionStore";

describe("graphInteractionStore", () => {
  beforeEach(() => {
    useGraphInteractionStore.setState({
      hoveredNodeIds: new EntityIds([]),
      hoveredEdgeIds: new EntityIds([]),
      selectedNodeIds: new EntityIds([]),
      selectedEdgeIds: new EntityIds([]),
    });
  });

  describe("single node selection", () => {
    it("should set and get selected node id", () => {
      const nodeId = "node1" as NodeId;
      setSelectedNodeId(nodeId);
      expect(getSelectedNodeId()).toBe(nodeId);
      expect(getSelectedNodeIds().size).toBe(1);
      expect(getHoveredNodeId()).toBeNull();
      expect(getHoveredNodeIds().size).toBe(0);
      expect(getSelectedEdgeId()).toBeNull();
      expect(getSelectedEdgeIds().size).toBe(0);
      expect(getHoveredEdgeId()).toBeNull();
      expect(getHoveredEdgeIds().size).toBe(0);
    });

    it("should clear selected node id when null is passed", () => {
      setSelectedNodeId("node1" as NodeId);
      setSelectedNodeId(null);
      expect(getSelectedNodeId()).toBeNull();
    });
  });

  describe("multi-node selection", () => {
    it("should set and get multiple selected node ids", () => {
      const nodeIds = new EntityIds(["node1", "node2"] as NodeId[]);
      setSelectedNodeIds(nodeIds);
      expect(getSelectedNodeIds().toArray()).toEqual(nodeIds.toArray());
    });

    it("should clear selected node ids when empty set is passed", () => {
      setSelectedNodeIds(new EntityIds(["node1", "node2"] as NodeId[]));
      setSelectedNodeIds(new EntityIds([]));
      expect(getSelectedNodeIds().size).toBe(0);
    });
  });

  describe("node hovering", () => {
    it("should set hovered node id", () => {
      const nodeId = "node1" as NodeId;
      setHoveredNodeId(nodeId);
      expect(
        useGraphInteractionStore.getState().hoveredNodeIds.toArray()
      ).toEqual([nodeId]);
    });

    it("should clear hovered node id when null is passed", () => {
      setHoveredNodeId("node1" as NodeId);
      setHoveredNodeId(null);
      expect(useGraphInteractionStore.getState().hoveredNodeIds.size).toBe(0);
    });
  });

  describe("interaction scenarios", () => {
    it("should handle switching between single and multi-selection", () => {
      // Set single selection
      setSelectedNodeId("node1" as NodeId);
      expect(getSelectedNodeId()).toBe("node1");

      // Switch to multi-selection
      setSelectedNodeIds(new EntityIds(["node2", "node3"] as NodeId[]));
      expect(getSelectedNodeId()).toBeNull();
      expect(getSelectedNodeIds().size).toBe(2);

      // Switch back to single selection
      setSelectedNodeId("node4" as NodeId);
      expect(getSelectedNodeId()).toBe("node4");
      expect(getSelectedNodeIds().size).toBe(1);
    });

    it("should maintain selection state consistency", () => {
      setSelectedNodeId("node1" as NodeId);
      setHoveredNodeId("node2" as NodeId);

      const state = useGraphInteractionStore.getState();
      expect(state.getSelectedNodeId()).toBe("node1");
      expect(state.getHoveredNodeId()).toBe("node2");
      expect(state.selectedNodeIds.size).toBe(1);
    });
  });
});
