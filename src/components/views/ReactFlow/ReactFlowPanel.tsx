import { getColor, useTheme } from "@aesgraph/app-shell";
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Controls,
  Edge,
  MiniMap,
  Node,
  OnInit,
  OnSelectionChangeParams,
  ReactFlow,
  ReactFlowInstance,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { SelectionMode } from "reactflow";
import { Annotation } from "../../../api/annotationsApi";
import {
  MOUSE_HOVERED_NODE_COLOR,
  SELECTED_NODE_COLOR,
} from "../../../core/force-graph/createForceGraph";
import { LayoutEngineOption } from "../../../core/layouts/layoutEngineTypes";
import { NodeId } from "../../../core/model/Node";
import { EntityIds } from "../../../core/model/entity/entityIds";
import useAppConfigStore from "../../../store/appConfigStore";
import { useDocumentStore } from "../../../store/documentStore";
import useGraphInteractionStore, {
  getSelectedNodeId,
  getSelectedNodeIds,
  setHoveredNodeId,
  setSelectedNodeId,
  setSelectedNodeIds,
} from "../../../store/graphInteractionStore";
import {
  getReactFlowConfig,
  subscribeToReactFlowConfigChanges,
} from "../../../store/reactFlowConfigStore";
import { computeLayoutAndTriggerUpdateForCurrentSceneGraph } from "../../../store/sceneGraphHooks";
import { setRightActiveSection } from "../../../store/workspaceConfigStore";
import GraphLayoutToolbar from "../../common/GraphLayoutToolbar";
import CustomNode from "./nodes/CustomNode";
import WebpageNode from "./nodes/WebpageNode";

import "@xyflow/react/dist/style.css";
import { EdgeId } from "../../../core/model/Edge";
import ResizableAnnotationCard from "../../annotations/ResizableAnnotationCard";
import ResizableClassCard from "../../annotations/ResizableClassCard";
import ResizableDefinitionCard from "../../annotations/ResizableDefinitionCard";
import ResizerNode from "./nodes/resizerNode";

// Remove the custom Node interface that was causing the type conflict
interface ReactFlowPanelProps {
  nodes: Node[];
  edges: Edge[];
  onLoad?: (instance: ReactFlowInstance) => void;
  onNodesContextMenu?: (
    event: React.MouseEvent,
    nodeIds: EntityIds<NodeId>
  ) => void; // Unified context menu handler
  onBackgroundContextMenu?: (
    event: React.MouseEvent<Element, MouseEvent>
  ) => void;
  onNodeDragStop?: (event: React.MouseEvent, node: Node, nodes: Node[]) => void;
  // sceneGraph: SceneGraph;
}

// AnnotationNode component for annotation nodes
const AnnotationNode = (props: any) => {
  const annotation: Annotation | undefined = props.data?.annotation;
  if (!annotation) return <div>Invalid annotation</div>;
  // console.log("valid annotation", annotation);
  return (
    <ResizableAnnotationCard
      annotation={annotation}
      dimensions={props.data?.dimensions}
      onResizeEnd={props.data?.onResizeEnd}
      style={props.style}
    />
  );
};

// DefinitionNode component for definition nodes
const DefinitionNode = (props: any) => {
  const data = props.data;
  if (!data || !data.definition) return <div>Invalid definition</div>;
  return (
    <ResizableDefinitionCard
      name={data.definition.name}
      kind={data.definition.kind}
      fields={data.definition.fields}
      description={data.definition.description}
      dimensions={data.dimensions}
      onResizeEnd={data.onResizeEnd}
      style={props.style}
    />
  );
};

// ClassNode component for class nodes
const ClassNode = (props: any) => {
  const data = props.data;
  if (!data || !data.classData) return <div>Invalid class</div>;
  return (
    <ResizableClassCard
      name={data.classData.name}
      description={data.classData.description}
      fields={data.classData.fields}
      methods={data.classData.methods}
      dimensions={data.dimensions}
      onResizeEnd={data.onResizeEnd}
      style={props.style}
    />
  );
};

export const nodeTypes = {
  customNode: CustomNode, // Register the custom node component
  resizerNode: ResizerNode,
  annotation: AnnotationNode,
  webpage: WebpageNode,
  definition: DefinitionNode,
  class: ClassNode,
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
  
  /* Make the selection rectangle not capture mouse events */
  .react-flow__nodesselection-rect {
    pointer-events: none !important;
    z-index: 0 !important;
  }
  
  /* Ensure nodes remain clickable even when inside selection */
  .react-flow__node {
    pointer-events: all !important;
    z-index: 10 !important;
  }
`;

const ReactFlowPanel: React.FC<ReactFlowPanelProps> = ({
  nodes: initialNodes,
  edges: initialEdges,
  onLoad,
  onNodesContextMenu, // Just need the unified prop
  onBackgroundContextMenu,
  onNodeDragStop,
}) => {
  const { theme } = useTheme();
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const selectionChangeRef = useRef(false);

  const { selectedNodeIds, selectedEdgeIds } = useGraphInteractionStore();
  const { setActiveDocument } = useDocumentStore();
  const { setActiveView, activeView, activeLayout, forceGraph3dOptions } =
    useAppConfigStore();

  // Handle layout change
  const handleLayoutChange = useCallback(async (layout: LayoutEngineOption) => {
    try {
      await computeLayoutAndTriggerUpdateForCurrentSceneGraph(layout);
    } catch (error) {
      console.error("Failed to compute layout:", error);
    }
  }, []);

  // Get configuration from the store
  const reactFlowConfig = getReactFlowConfig();

  // PRE-PROCESS nodes to include selection state from global store
  const processedNodes = useMemo(() => {
    const selectedNodeId = getSelectedNodeId();
    const selectedNodeIds = getSelectedNodeIds();

    return initialNodes.map((node) => ({
      ...node,
      selected:
        node.id === selectedNodeId || selectedNodeIds.has(node.id as NodeId),
    }));
  }, [initialNodes]);

  const [nodes, setNodes, originalOnNodesChange] =
    useNodesState(processedNodes);
  const [edges, setEdges, originalOnEdgesChange] = useEdgesState(initialEdges);

  // Fix the type mismatch by avoiding direct NodeChange typing - use any as an intermediary
  const handleNodesChange = useCallback(
    (changes: any) => {
      setTimeout(() => {
        originalOnNodesChange(changes);
      });
    },
    [originalOnNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      setTimeout(() => {
        originalOnEdgesChange(changes);
      });
    },
    [originalOnEdgesChange]
  );

  // Add the selection styles to the document head
  useEffect(() => {
    document.head.appendChild(nodeStyles);
    return () => {
      document.head.removeChild(nodeStyles);
    };
  }, []);

  // Custom node click handler that sets the selected node
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    selectionChangeRef.current = true;

    // Set this node as the selected node in the global store
    setSelectedNodeId(node.id as NodeId);

    // Open the node details panel
    // setRightActiveSection("node-details");

    // Update the ReactFlow nodes directly to show selection immediately
    if (reactFlowInstance.current) {
      reactFlowInstance.current.setNodes((currentNodes) =>
        currentNodes.map((n) => ({
          ...n,
          selected: n.id === node.id,
        }))
      );
    }
  }, []);

  // Unified handler for node context menu events (single or multi)
  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Prevent default browser context menu
      event.preventDefault();
      event.stopPropagation();

      const selectedNodeIds = getSelectedNodeIds();

      // If we have multiple nodes selected and the right-clicked node is part of that selection
      if (selectedNodeIds.size > 1 && selectedNodeIds.has(node.id as NodeId)) {
        // Pass all selected nodes to the handler
        if (onNodesContextMenu) {
          onNodesContextMenu(event, selectedNodeIds);
        }
      } else {
        // For a single node, create an EntityIds with just this node
        if (onNodesContextMenu) {
          onNodesContextMenu(event, new EntityIds([node.id as NodeId]));
        }
      }
    },
    [onNodesContextMenu]
  );

  // Handle selection change in ReactFlow
  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      // Skip if this selection change was triggered by our node click handler
      if (selectionChangeRef.current) {
        selectionChangeRef.current = false;
        return;
      }

      if (!selectedNodes || selectedNodes.length === 0) {
        // Clear selection in global store
        setSelectedNodeIds(new EntityIds([]));
        return;
      }

      if (selectedNodes.length === 1) {
        // Single node selection
        setSelectedNodeId(selectedNodes[0].id as NodeId);
        // setRightActiveSection("node-details");
      } else {
        // Multi-node selection
        const nodeIds = selectedNodes.map((node) => node.id as NodeId);
        setSelectedNodeIds(new EntityIds(nodeIds));
        // setRightActiveSection("node-details");
      }
    },
    []
  );

  // Handle node hover
  const handleNodeMouseEnter = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setHoveredNodeId(node.id as NodeId);
    },
    []
  );

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  // Handle background click to clear selection - update this to properly clear all selections
  const handlePaneClick = useCallback(() => {
    // Clear selection in global store for both single and multi-select
    setSelectedNodeId(null);
    setSelectedNodeIds(new EntityIds([]));

    // Update the ReactFlow nodes directly to clear selection state
    if (reactFlowInstance.current) {
      reactFlowInstance.current.setNodes((currentNodes) =>
        currentNodes.map((n) => ({
          ...n,
          selected: false,
        }))
      );
    }

    // Close the node details panel if it's open
    setRightActiveSection(null);
  }, []);

  // Update nodes when initialNodes change
  useEffect(() => {
    setNodes(processedNodes);
  }, [processedNodes, setNodes]);

  // Update edges when initialEdges change
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Fix the onInit handler to use the correct type and avoid camera flickering
  const handleInit: OnInit = useCallback(
    (instance: ReactFlowInstance) => {
      reactFlowInstance.current = instance;
      if (onLoad) {
        onLoad(instance);
      }

      instance.fitView({ padding: 0.1 });
    },
    [onLoad]
  );

  useEffect(() => {
    if (onLoad && reactFlowInstance.current) {
      onLoad(reactFlowInstance.current);
    }
  }, [onLoad]);

  // Subscribe to ReactFlowConfig changes
  useEffect(() => {
    const unsubscribe = subscribeToReactFlowConfigChanges((newConfig) => {
      // Update ReactFlow instance with the new configuration
      if (reactFlowInstance.current) {
        reactFlowInstance.current.setNodes((currentNodes) =>
          currentNodes.map((node) => ({
            ...node,
            style: {
              ...node.style,
              borderRadius: `${newConfig.nodeBorderRadius}px`,
              fontSize: `${newConfig.nodeFontSize}px`,
              borderWidth: `${newConfig.nodeStrokeWidth}px`,
            },
            selected: selectedNodeIds.has(node.id as NodeId),
          }))
        );

        reactFlowInstance.current.setEdges((currentEdges) =>
          currentEdges.map((edge) => ({
            ...edge,
            style: {
              ...edge.style,
              strokeWidth: newConfig.edgeStrokeWidth,
              fontSize: newConfig.edgeFontSize,
            },
            selected: selectedEdgeIds.has(edge.id as EdgeId),
          }))
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedEdgeIds, selectedNodeIds]);

  useEffect(() => {
    // Update the ReactFlow nodes directly to show selection immediately
    if (reactFlowInstance.current) {
      reactFlowInstance.current.setNodes((currentNodes) =>
        currentNodes.map((n) => ({
          ...n,
          selected: selectedNodeIds.has(n.id as NodeId),
        }))
      );
      reactFlowInstance.current.setEdges((currentEdges) =>
        currentEdges.map((e) => ({
          ...e,
          selected: selectedEdgeIds.has(e.id as EdgeId),
        }))
      );
    }
  }, [selectedNodeIds, selectedEdgeIds]);

  const handleNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: any) => {
      // Create document and switch to editor view
      setActiveDocument(node.id as NodeId, activeView);
      setActiveView("Editor");
    },
    [setActiveDocument, activeView, setActiveView]
  );

  return (
    <>
      <ReactFlowStyles />
      <div
        style={{
          width: "100%",
          height: "100%",
          margin: 0,
          padding: 0,
          overflow: "hidden",
          position: "relative",
          top: 0,
          left: 0,
        }}
        ref={reactFlowWrapper}
      >
        <ReactFlowProvider>
          <ReactFlow
            onlyRenderVisibleElements={true}
            selectionMode={SelectionMode.Partial}
            selectionOnDrag={true}
            selectNodesOnDrag={false}
            panOnDrag={[2]}
            panOnScroll={false}
            multiSelectionKeyCode="Shift"
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onNodeDragStop={onNodeDragStop}
            onInit={handleInit} // Use the properly typed handler
            onNodeContextMenu={(event, node) =>
              handleNodeContextMenu(event, node)
            }
            onPaneContextMenu={(event) =>
              onBackgroundContextMenu?.(
                event as React.MouseEvent<Element, MouseEvent>
              )
            }
            onPaneClick={handlePaneClick}
            onNodeMouseEnter={handleNodeMouseEnter}
            onNodeMouseLeave={handleNodeMouseLeave}
            onNodeClick={handleNodeClick}
            onSelectionChange={handleSelectionChange}
            onNodeDoubleClick={handleNodeDoubleClick}
            fitView={true}
            minZoom={0.01}
            maxZoom={1000}
            connectionLineType={ConnectionLineType.Bezier}
            snapToGrid={reactFlowConfig.snapToGrid}
            snapGrid={reactFlowConfig.snapGrid}
            defaultEdgeOptions={{
              type: reactFlowConfig.connectionLineStyle || "smoothstep",
              style: {
                strokeWidth: reactFlowConfig.edgeStrokeWidth,
                fontSize: reactFlowConfig.edgeFontSize,
              },
            }}
            nodeTypes={nodeTypes}
            style={
              {
                width: "100%",
                height: "100%",
                margin: 0,
                padding: 0,
                "--node-border-radius": `${reactFlowConfig.nodeBorderRadius}px`,
                "--node-stroke-width": `${reactFlowConfig.nodeStrokeWidth}px`,
                "--node-font-size": `${reactFlowConfig.nodeFontSize}px`,
              } as React.CSSProperties
            }
          >
            <Controls
              style={{
                backgroundColor: getColor(theme.colors, "surface"),
                border: `1px solid ${getColor(theme.colors, "border")}`,
              }}
              className="react-flow__controls"
            />
            {reactFlowConfig.minimap && (
              <MiniMap
                style={{
                  position: "absolute",
                  bottom: 0, // Increased from 5 to avoid the "React Flow" text
                  right: 0, // Position to the left of the right sidebar
                  backgroundColor: getColor(theme.colors, "surface"),
                  border: `1px solid ${getColor(theme.colors, "border")}`,
                  zIndex: 10, // Ensure it's above other elements
                }}
                nodeColor={getColor(theme.colors, "primary")}
                maskColor={getColor(theme.colors, "surface")}
              />
            )}
            <Background
              variant={
                reactFlowConfig.backgroundVariant || BackgroundVariant.Dots
              }
              gap={reactFlowConfig.backgroundGap}
              size={reactFlowConfig.backgroundSize}
            />
          </ReactFlow>
        </ReactFlowProvider>

        {/* Layout Toolbar */}
        <GraphLayoutToolbar
          activeLayout={activeLayout as LayoutEngineOption}
          onLayoutChange={handleLayoutChange}
          physicsMode={forceGraph3dOptions.layout === "Physics"}
          isDarkMode={false} // ReactFlow doesn't have dark mode detection, using false for now
        />
      </div>
    </>
  );
};

export default ReactFlowPanel;

// Add theme-aware styles for React Flow controls
const ReactFlowStyles = () => {
  const { theme } = useTheme();

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .react-flow__controls {
        background-color: ${getColor(theme.colors, "surface")} !important;
        border: 1px solid ${getColor(theme.colors, "border")} !important;
      }
      
      .react-flow__controls button {
        background-color: ${getColor(theme.colors, "surface")} !important;
        border: 1px solid ${getColor(theme.colors, "border")} !important;
        color: ${getColor(theme.colors, "text")} !important;
      }
      
      .react-flow__controls button:hover {
        background-color: ${getColor(theme.colors, "surfaceHover")} !important;
        border-color: ${getColor(theme.colors, "borderHover")} !important;
      }
      
      .react-flow__minimap {
        background-color: ${getColor(theme.colors, "surface")} !important;
        border: 1px solid ${getColor(theme.colors, "border")} !important;
      }
      
      .react-flow__minimap .react-flow__minimap-mask {
        fill: ${getColor(theme.colors, "surface")} !important;
      }
      
      .react-flow__minimap .react-flow__minimap-node {
        fill: ${getColor(theme.colors, "primary")} !important;
      }
      
      /* Hide the "React Flow" attribution text that interferes with minimap positioning */
      .react-flow__attribution {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [theme]);

  return null;
};
