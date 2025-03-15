import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  ReactFlowInstance,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import React, { useEffect, useRef } from "react";
import { SelectionMode } from "reactflow";
import CustomNode from "../CustomNode"; // Import the custom node component

import "@xyflow/react/dist/style.css";

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
};

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
  }, [initialNodes, initialEdges]);

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
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
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
