import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MiniMap,
  Node,
  OnSelectionChangeParams,
  ReactFlow,
  ReactFlowInstance,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import React, { useCallback, useEffect, useRef } from "react";
import { SelectionMode } from "reactflow";
import {
  MOUSE_HOVERED_NODE_COLOR,
  SELECTED_NODE_COLOR,
} from "../../core/force-graph/createForceGraph";
import { NodeId } from "../../core/model/Node";
import { EntityIds } from "../../core/model/entity/entityIds";
import {
  setHoveredNodeId,
  setSelectedNodeId,
  setSelectedNodeIds,
} from "../../store/graphInteractionStore";
import { setRightActiveSection } from "../../store/workspaceConfigStore";
import CustomNode from "../CustomNode"; // Import the custom node component

import "@xyflow/react/dist/style.css";
import ResizerNode from "../resizerNode";

interface ReactFlowPanelProps {
  nodes: Node[];
  edges: Edge[];
  onLoad?: (instance: ReactFlowInstance) => void;
  onNodeContextMenu?: (event: React.MouseEvent, node: Node) => void;
  onBackgroundContextMenu?: (event: React.MouseEvent) => void;
  onNodeDragStop?: (event: React.MouseEvent, node: Node, nodes: Node[]) => void;
  // sceneGraph: SceneGraph;
}

const nodeTypes = {
  customNode: CustomNode, // Register the custom node component
  resizerNode: ResizerNode,
};

// Add a style tag for selected and hovered nodes
const nodeStyles = document.createElement("style");
nodeStyles.textContent = `
  .react-flow__node.selected {
    box-shadow: 0 0 0 2px ${SELECTED_NODE_COLOR} !important;
    border: 2px solid ${SELECTED_NODE_COLOR} !important;
    border-radius: 4px !important;
  }

  .react-flow__node-customNode.selected, .react-flow__node-resizerNode.selected {
    outline: 2px solid ${SELECTED_NODE_COLOR} !important;
    outline-offset: 2px;
  }
  
  /* Add hover styles */
  .react-flow__node:hover {
    box-shadow: 0 0 0 2px ${MOUSE_HOVERED_NODE_COLOR} !important;
    border: 2px solid ${MOUSE_HOVERED_NODE_COLOR} !important;
    border-radius: 4px !important;
  }
  
  .react-flow__node-customNode:hover:not(.selected), .react-flow__node-resizerNode:hover:not(.selected) {
    outline: 2px solid ${MOUSE_HOVERED_NODE_COLOR} !important;
    outline-offset: 2px;
  }
`;

const ReactFlowPanel: React.FC<ReactFlowPanelProps> = ({
  nodes: initialNodes,
  edges: initialEdges,
  onLoad,
  onNodeContextMenu,
  onBackgroundContextMenu,
  onNodeDragStop,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Add the selection and hover styles to the document head
  useEffect(() => {
    document.head.appendChild(nodeStyles);
    return () => {
      document.head.removeChild(nodeStyles);
    };
  }, []);

  // Handle selection change in ReactFlow
  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      if (!selectedNodes || selectedNodes.length === 0) {
        // Clear selection when no nodes are selected
        setSelectedNodeIds(new EntityIds([]));
        return;
      }

      // If only one node is selected, use setSelectedNodeId for compatibility with existing code
      if (selectedNodes.length === 1) {
        setSelectedNodeId(selectedNodes[0].id as NodeId);

        // Also open the node details panel in the right sidebar when a node is selected
        setRightActiveSection("node-details");
      } else {
        // For multiple selections, update the store with all selected node IDs
        const nodeIds = selectedNodes.map((node) => node.id as NodeId);
        setSelectedNodeIds(new EntityIds(nodeIds));
      }

      console.log(
        "ReactFlow selection changed:",
        selectedNodes.map((n) => n.id)
      );
    },
    []
  );

  // Custom node click handler that sets the selected node
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // Set this node as the selected node
    setSelectedNodeId(node.id as NodeId);

    // Also open the node details panel
    setRightActiveSection("node-details");
  }, []);

  // Handle node hover to update the store
  const handleNodeMouseEnter = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setHoveredNodeId(node.id as NodeId);
    },
    []
  );

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    if (reactFlowInstance.current) {
      reactFlowInstance.current.fitView({ padding: 0.1 });
    }
    return () => {
      setNodes([]);
      setEdges([]);
    };
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        position: "absolute",
        top: 0,
        left: 0,
      }}
      ref={reactFlowWrapper}
    >
      <ReactFlowProvider>
        <ReactFlow
          selectionMode={SelectionMode.Partial}
          selectionOnDrag={true}
          selectNodesOnDrag={false}
          panOnDrag={[2]}
          panOnScroll={false}
          multiSelectionKeyCode="Shift"
          nodes={nodes}
          edges={edges}
          onNodesChange={(changes) => setTimeout(() => onNodesChange(changes))} // Need to set timeout here to avoid resizeobserver errors
          onEdgesChange={(changes) => setTimeout(() => onEdgesChange(changes))} // Need to set timeout here to avoid resizeobserver errors
          onNodeDragStop={onNodeDragStop}
          onInit={(instance: ReactFlowInstance) => {
            reactFlowInstance.current = instance;
            if (onLoad) {
              onLoad(instance);
            }
            instance.fitView({ padding: 0.1 });
          }}
          onNodeContextMenu={onNodeContextMenu}
          onPaneContextMenu={(event: any) =>
            onBackgroundContextMenu?.(event as React.MouseEvent)
          }
          onNodeMouseEnter={handleNodeMouseEnter}
          onNodeMouseLeave={handleNodeMouseLeave}
          onNodeClick={handleNodeClick}
          onSelectionChange={handleSelectionChange}
          fitView={true}
          minZoom={0.1}
          maxZoom={200}
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: false,
          }}
          nodeTypes={nodeTypes} // Use the custom node types
          style={{
            width: "100%",
            height: "100%",
            margin: 0,
            padding: 0,
          }}
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default ReactFlowPanel;
