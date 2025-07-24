/* eslint-disable unused-imports/no-unused-vars */
import { getColor, useTheme } from "@aesgraph/app-shell";
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Controls,
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
import {
  MOUSE_HOVERED_NODE_COLOR,
  SELECTED_NODE_COLOR,
} from "../../core/force-graph/createForceGraph";
import { NodeId, createNodeId } from "../../core/model/Node";
import { EntityIds } from "../../core/model/entity/entityIds";
import { exportGraphDataForReactFlow } from "../../core/react-flow/exportGraphDataForReactFlow";
import useAppConfigStore, {
  getCurrentSceneGraph,
} from "../../store/appConfigStore";
import { useDocumentStore } from "../../store/documentStore";
import useGraphInteractionStore, {
  getSelectedNodeId,
  getSelectedNodeIds,
  setHoveredNodeId,
  setSelectedNodeId,
  setSelectedNodeIds,
} from "../../store/graphInteractionStore";
import {
  getReactFlowConfig,
  subscribeToReactFlowConfigChanges,
} from "../../store/reactFlowConfigStore";
import useWorkspaceConfigStore from "../../store/workspaceConfigStore";
import CustomNode from "./ReactFlow/nodes/CustomNode";
import WebpageNode from "./ReactFlow/nodes/WebpageNode";
import ResizerNode from "./ReactFlow/nodes/resizerNode";

import "@xyflow/react/dist/style.css";
import { EdgeId } from "../../core/model/Edge";

// Node types mapping - simplified to avoid type conflicts
const nodeTypes = {
  default: CustomNode,
  webpage: WebpageNode,
  resizer: ResizerNode,
};

// CSS styles for node selection and container constraints
const nodeStyles = document.createElement("style");
nodeStyles.textContent = `
  .react-flow__node.selected {
    box-shadow: 0 0 0 2px ${SELECTED_NODE_COLOR} !important;
  }
  .react-flow__node.hovered {
    box-shadow: 0 0 0 2px ${MOUSE_HOVERED_NODE_COLOR} !important;
  }
  
  /* Ensure ReactFlow stays within its container */
  .react-flow-panel-v2-container .react-flow {
    position: relative !important;
    width: 100% !important;
    height: 100% !important;
  }
  
  .react-flow-panel-v2-container .react-flow__viewport {
    position: relative !important;
  }
  
  .react-flow-panel-v2-container .react-flow__pane {
    position: relative !important;
  }
`;

// ReactFlow styles component
const ReactFlowStyles: React.FC<{ theme: any }> = ({ theme }) => {
  useEffect(() => {
    // Create dynamic styles with theme colors
    const dynamicStyles = document.createElement("style");
    dynamicStyles.textContent = `
      .react-flow__node.selected {
        box-shadow: 0 0 0 2px ${SELECTED_NODE_COLOR} !important;
      }
      .react-flow__node.hovered {
        box-shadow: 0 0 0 2px ${MOUSE_HOVERED_NODE_COLOR} !important;
      }
      
      /* Ensure ReactFlow stays within its container */
      .react-flow-panel-v2-container .react-flow {
        position: relative !important;
        width: 100% !important;
        height: 100% !important;
      }
      
      .react-flow-panel-v2-container .react-flow__viewport {
        position: relative !important;
      }
      
      .react-flow-panel-v2-container .react-flow__pane {
        position: relative !important;
      }
      
      /* Theme the ReactFlow controls */
      .react-flow-panel-v2-container .react-flow__controls {
        background-color: ${getColor(theme.colors, "surface")} !important;
        border: 1px solid ${getColor(theme.colors, "border")} !important;
        padding: 2px !important;
        gap: 1px !important;
      }
      
      .react-flow-panel-v2-container .react-flow__controls button {
        background-color: ${getColor(theme.colors, "surface")} !important;
        border: 1px solid ${getColor(theme.colors, "border")} !important;
        color: ${getColor(theme.colors, "text")} !important;
        width: 24px !important;
        height: 24px !important;
        padding: 2px !important;
        margin: 0 !important;
      }
      
      .react-flow-panel-v2-container .react-flow__controls button:hover {
        background-color: ${getColor(theme.colors, "surfaceHover")} !important;
        border-color: ${getColor(theme.colors, "borderHover")} !important;
      }
      
      .react-flow-panel-v2-container .react-flow__controls button:active {
        background-color: ${getColor(theme.colors, "surfaceActive")} !important;
      }
      
      .react-flow-panel-v2-container .react-flow__controls button svg {
        fill: ${getColor(theme.colors, "text")} !important;
        width: 14px !important;
        height: 14px !important;
      }
      
      /* Hide ReactFlow attribution */
      .react-flow-panel-v2-container .react-flow__attribution {
        display: none !important;
      }
    `;

    document.head.appendChild(dynamicStyles);
    return () => {
      document.head.removeChild(dynamicStyles);
    };
  }, [theme]);

  return null;
};

interface ReactFlowPanelV2Props {
  theme?: any;
  [key: string]: any;
}

const ReactFlowPanelV2: React.FC<ReactFlowPanelV2Props> = ({
  theme: propTheme,
  ...props
}) => {
  const { theme } = useTheme();
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const selectionChangeRef = useRef(false);

  const { selectedNodeIds, selectedEdgeIds } = useGraphInteractionStore();
  const { getActiveSection } = useWorkspaceConfigStore();
  const { setActiveDocument } = useDocumentStore();
  const { setActiveView, activeView, setReactFlowInstance } =
    useAppConfigStore();

  // Get current scene graph
  const sceneGraph = getCurrentSceneGraph();

  // Get configuration from the store
  const reactFlowConfig = getReactFlowConfig();

  // Export graph data for ReactFlow
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!sceneGraph) {
      return { nodes: [], edges: [] };
    }
    return exportGraphDataForReactFlow(sceneGraph);
  }, [sceneGraph]);

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

  // Update nodes when processedNodes change
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
      setReactFlowInstance(instance);

      // Custom fit view for large graphs
      setTimeout(() => {
        if (nodes.length > 50) {
          // For large graphs, use a more aggressive fit
          instance.fitView({
            padding: 0.3,
            includeHiddenNodes: false,
            minZoom: 0.01,
            maxZoom: 2,
          });
        } else {
          // For smaller graphs, use standard fit
          instance.fitView({
            padding: 0.2,
            includeHiddenNodes: false,
          });
        }
      }, 100);
    },
    [setReactFlowInstance, nodes.length]
  );

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
  }, [selectedNodeIds, selectedEdgeIds]);

  // Handle node interactions
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const nodeId = createNodeId(node.id);
    setSelectedNodeId(nodeId);
    setSelectedNodeIds(new EntityIds([nodeId]));
  }, []);

  const handleNodeMouseEnter = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setHoveredNodeId(createNodeId(node.id));
    },
    []
  );

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  const handleNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Open document editor for the node
      setActiveDocument(createNodeId(node.id));
      setActiveView("document-editor");
    },
    [setActiveDocument, setActiveView]
  );

  const handleSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      if (selectionChangeRef.current) {
        selectionChangeRef.current = false;
        return;
      }

      const selectedNodeIds = new EntityIds(
        params.nodes.map((node) => createNodeId(node.id))
      );
      setSelectedNodeIds(selectedNodeIds);

      if (params.nodes.length === 1) {
        setSelectedNodeId(createNodeId(params.nodes[0].id));
      } else {
        setSelectedNodeId(null);
      }
    },
    []
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedNodeIds(new EntityIds([]));
  }, []);

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      // Handle context menu for nodes
      console.log("Node context menu:", node.id);
    },
    []
  );

  if (!sceneGraph) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: getColor(theme.colors, "text"),
          backgroundColor: getColor(theme.colors, "background"),
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>No scene graph available. Please load a graph first.</p>
      </div>
    );
  }

  return (
    <div
      className="react-flow-panel-v2-container"
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ReactFlowStyles theme={theme} />
      <div
        style={{
          width: "100%",
          height: "100%",
          margin: 0,
          padding: 0,
          overflow: "hidden",
          position: "relative",
          flex: 1,
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
            onInit={handleInit}
            onNodeContextMenu={handleNodeContextMenu}
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
            <Background
              variant={BackgroundVariant.Dots}
              gap={12}
              size={1}
              color={getColor(theme.colors, "border")}
            />
            <Controls
              style={{
                backgroundColor: getColor(theme.colors, "surface"),
                border: `1px solid ${getColor(theme.colors, "border")}`,
                padding: 0,
                margin: 0,
              }}
              className="react-flow__controls"
              showZoom={true}
              showFitView={true}
              showInteractive={true}
              fitViewOptions={{
                padding: 0.3,
                includeHiddenNodes: false,
                minZoom: 0.01,
                maxZoom: 2,
              }}
            />
            {reactFlowConfig.minimap && (
              <MiniMap
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: getColor(theme.colors, "surface"),
                  border: `1px solid ${getColor(theme.colors, "border")}`,
                  zIndex: 10,
                  margin: 0,
                  padding: 0,
                }}
                nodeColor={getColor(theme.colors, "primary")}
                maskColor={getColor(theme.colors, "background")}
              />
            )}
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default ReactFlowPanelV2;
