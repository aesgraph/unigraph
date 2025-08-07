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
  Position,
  ReactFlow,
  ReactFlowInstance,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SelectionMode } from "reactflow";
import { RenderingManager } from "../../controllers/RenderingManager";
import {
  MOUSE_HOVERED_NODE_COLOR,
  SELECTED_NODE_COLOR,
} from "../../core/force-graph/createForceGraph";
import { LayoutEngineOption } from "../../core/layouts/layoutEngineTypes";
import { NodeId, createNodeId } from "../../core/model/Node";
import { EntityIds } from "../../core/model/entity/entityIds";
import { exportGraphDataForReactFlow } from "../../core/react-flow/exportGraphDataForReactFlow";
import useActiveLayoutStore from "../../store/activeLayoutStore";
import {
  getEdgeLegendConfig,
  getNodeLegendConfig,
} from "../../store/activeLegendConfigStore";
import useAppConfigStore, { getLegendMode } from "../../store/appConfigStore";
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
import { computeLayoutAndTriggerUpdateForCurrentSceneGraph } from "../../store/sceneGraphHooks";
import useWorkspaceConfigStore, {
  setRightActiveSection,
} from "../../store/workspaceConfigStore";
import GraphLayoutToolbar from "../common/GraphLayoutToolbar";
import CustomNode from "./ReactFlow/nodes/CustomNode";
import WebpageNode from "./ReactFlow/nodes/WebpageNode";
import ResizerNode from "./ReactFlow/nodes/resizerNode";

import "@xyflow/react/dist/style.css";
import { Annotation } from "../../api/annotationsApi";
import { EdgeId } from "../../core/model/Edge";
import ResizableAnnotationCard from "../annotations/ResizableAnnotationCard";
import ResizableClassCard from "../annotations/ResizableClassCard";
import ResizableDefinitionCard from "../annotations/ResizableDefinitionCard";

// AnnotationNode component for annotation nodes
const AnnotationNode = (props: any) => {
  const annotation: Annotation | undefined = props.data?.annotation;
  if (!annotation) return <div>Invalid annotation</div>;
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

// Node types mapping - using the exact same as ReactFlowPanel
const nodeTypes = {
  customNode: CustomNode,
  resizerNode: ResizerNode,
  webpage: WebpageNode,
  annotation: AnnotationNode,
  definition: DefinitionNode,
  class: ClassNode,
};

// CSS styles for node selection and container constraints
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
      
      /* Ensure ReactFlow stays within its container and handles resizing properly */
      .react-flow-panel-v2-container .react-flow {
        width: 100% !important;
        height: 100% !important;
        position: relative !important;
        overflow: hidden !important;
      }
      
      /* Ensure ReactFlow viewport handles resizing */
      .react-flow-panel-v2-container .react-flow__viewport {
        width: 100% !important;
        height: 100% !important;
      }
      
      /* Ensure ReactFlow pane handles resizing */
      .react-flow-panel-v2-container .react-flow__pane {
        width: 100% !important;
        height: 100% !important;
      }
      
      /* Don't override viewport and pane positioning as it breaks drag selection */
      
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
  const viewportTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef(true);

  const {
    currentSceneGraph,
    setReactFlowViewportState,
    getReactFlowViewportState,
  } = useAppConfigStore();
  const sceneGraph = currentSceneGraph;
  const reactFlowConfig = getReactFlowConfig();
  const { setActiveDocument } = useDocumentStore();
  const { selectedNodeIds, selectedEdgeIds, hoveredNodeIds } =
    useGraphInteractionStore();
  const { getActiveSection } = useWorkspaceConfigStore();

  // Memoized node types to prevent unnecessary re-renders
  const nodeTypes = useMemo(
    () => ({
      customNode: CustomNode,
      resizerNode: ResizerNode,
      webpage: WebpageNode,
      annotation: AnnotationNode,
      definition: DefinitionNode,
      class: ClassNode,
    }),
    []
  );

  // Simple hover state - no debouncing for now
  const [currentHoveredNodeId, setCurrentHoveredNodeId] = useState<
    string | null
  >(null);
  const {
    setActiveView: setAppActiveView,
    activeView,
    activeLayout,
    forceGraph3dOptions,
  } = useAppConfigStore();

  // Handle layout change
  const handleLayoutChange = useCallback(async (layout: LayoutEngineOption) => {
    try {
      await computeLayoutAndTriggerUpdateForCurrentSceneGraph(layout);
    } catch (error) {
      console.error("Failed to compute layout:", error);
    }
  }, []);

  // Get legend configurations for reactivity
  const nodeLegendConfig = getNodeLegendConfig();
  const edgeLegendConfig = getEdgeLegendConfig();
  const legendMode = getLegendMode();

  // Get current layout result for reactivity
  const { currentLayoutResult } = useActiveLayoutStore();

  // Export graph data for ReactFlow - using same approach as ReactFlow v1
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!sceneGraph) {
      return { nodes: [], edges: [] };
    }

    const data = exportGraphDataForReactFlow(sceneGraph);

    // Apply the same styling as ReactFlow v1
    const nodesWithPositions = data.nodes.map((node) => ({
      ...node,
      type: (node?.type ?? "") in nodeTypes ? node.type : "resizerNode", // Match main ReactFlow logic
      style: {
        background: RenderingManager.getColor(
          sceneGraph.getGraph().getNode(node.id as NodeId),
          nodeLegendConfig,
          legendMode
        ),
        color: "#000000",
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));

    const edgesWithStyling = data.edges.map((edge) => ({
      ...edge,
      type: "default",
      style: {
        stroke: RenderingManager.getColor(
          sceneGraph.getGraph().getEdge(edge.id as EdgeId),
          edgeLegendConfig,
          legendMode
        ),
      },
      labelStyle: {
        fill: RenderingManager.getColor(
          sceneGraph.getGraph().getEdge(edge.id as EdgeId),
          edgeLegendConfig,
          legendMode
        ),
        fontWeight: 700,
      },
    }));

    return {
      nodes: nodesWithPositions,
      edges: edgesWithStyling,
    };
  }, [
    sceneGraph,
    nodeLegendConfig,
    edgeLegendConfig,
    legendMode,
    currentLayoutResult,
  ]);

  // PRE-PROCESS nodes without selection state - let ReactFlow handle selection internally
  const processedNodes = useMemo(() => {
    return initialNodes.map((node) => ({
      ...node,
      selected: false, // Let ReactFlow manage selection state
    }));
  }, [initialNodes]);

  const [nodes, setNodes, originalOnNodesChange] =
    useNodesState(processedNodes);
  const [edges, setEdges, originalOnEdgesChange] = useEdgesState(initialEdges);

  // Fix the type mismatch by avoiding direct NodeChange typing - use any as an intermediary
  const handleNodesChange = useCallback(
    (changes: any) => {
      originalOnNodesChange(changes);
    },
    [originalOnNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      originalOnEdgesChange(changes);
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

  // Cleanup viewport timeout on unmount
  useEffect(() => {
    return () => {
      if (viewportTimeoutRef.current) {
        clearTimeout(viewportTimeoutRef.current);
      }
      // Reset initialization flag
      isInitializingRef.current = true;
    };
  }, []);

  // Update nodes when processedNodes change
  useEffect(() => {
    setNodes(processedNodes);
  }, [processedNodes, setNodes]);

  // Update edges when initialEdges change
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Sync initial selection state with ReactFlow after initialization
  useEffect(() => {
    if (!isInitializingRef.current && reactFlowInstance.current) {
      const currentSelectedNodeIds = getSelectedNodeIds();
      const currentSelectedNodeId = getSelectedNodeId();

      if (currentSelectedNodeIds.size > 0 || currentSelectedNodeId) {
        console.log("ReactFlowPanelV2: Syncing initial selection state");
        // Update ReactFlow nodes to reflect current selection state
        reactFlowInstance.current.setNodes((currentNodes) =>
          currentNodes.map((node) => ({
            ...node,
            selected:
              currentSelectedNodeIds.has(node.id as NodeId) ||
              node.id === currentSelectedNodeId,
          }))
        );
      }
    }
  }, [isInitializingRef.current, getSelectedNodeIds, getSelectedNodeId]);

  // Update nodes and edges when layout result changes
  useEffect(() => {
    if (currentLayoutResult && currentLayoutResult.positions && sceneGraph) {
      const data = exportGraphDataForReactFlow(
        sceneGraph,
        currentLayoutResult.positions
      );

      const nodesWithNewPositions = data.nodes.map((node) => {
        const isSelected = selectedNodeIds.has(node.id as NodeId);

        return {
          ...node,
          type: (node?.type ?? "") in nodeTypes ? node.type : "resizerNode",
          style: {
            background: RenderingManager.getColor(
              sceneGraph.getGraph().getNode(node.id as NodeId),
              nodeLegendConfig,
              legendMode
            ),
            color: "#000000",
            // Default border - hover styling will be applied by the hover effect
            border: `2px solid ${RenderingManager.getColor(
              sceneGraph.getGraph().getNode(node.id as NodeId),
              nodeLegendConfig,
              legendMode
            )}`,
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          selected: isSelected,
        };
      });

      const edgesWithStyling = data.edges.map((edge) => ({
        ...edge,
        type: "default",
        style: {
          stroke: RenderingManager.getColor(
            sceneGraph.getGraph().getEdge(edge.id as EdgeId),
            edgeLegendConfig,
            legendMode
          ),
        },
        labelStyle: {
          fill: RenderingManager.getColor(
            sceneGraph.getGraph().getEdge(edge.id as EdgeId),
            edgeLegendConfig,
            legendMode
          ),
          fontWeight: 700,
        },
      }));

      setNodes(nodesWithNewPositions);
      setEdges(edgesWithStyling);
    }
  }, [
    currentLayoutResult,
    sceneGraph,
    nodeLegendConfig,
    edgeLegendConfig,
    legendMode,
    selectedNodeIds,
  ]);

  // Fix the onInit handler to use the correct type and avoid camera flickering
  const handleInit: OnInit = useCallback(
    (instance: ReactFlowInstance) => {
      reactFlowInstance.current = instance;
      // setReactFlowInstance(instance); // This line was removed as per the edit hint

      // Restore viewport state if available
      const savedViewportState = getReactFlowViewportState();
      if (savedViewportState) {
        console.log(
          "ReactFlowPanelV2: Restoring viewport state",
          savedViewportState
        );
        instance.setViewport({
          x: savedViewportState.x,
          y: savedViewportState.y,
          zoom: savedViewportState.zoom,
        });
      } else {
        console.log("ReactFlowPanelV2: No saved viewport state, using default");
      }

      // Mark initialization as complete after a short delay
      setTimeout(() => {
        isInitializingRef.current = false;
      }, 100);
    },
    [getReactFlowViewportState]
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

  // Handle container resize for AppShell pane changes
  useEffect(() => {
    if (!reactFlowWrapper.current || !reactFlowInstance.current) return;

    const resizeObserver = new ResizeObserver(() => {
      // Don't automatically fit view on resize - let the user control the camera
      // ReactFlow will handle the resize internally without changing the view
    });

    resizeObserver.observe(reactFlowWrapper.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Function to zoom to a specific node
  const zoomToNode = useCallback((nodeId: string) => {
    if (!reactFlowInstance.current) {
      console.log("ReactFlowPanelV2: ReactFlow instance not ready for zoom");
      return;
    }

    // Find the node in the current nodes
    const node = reactFlowInstance.current
      .getNodes()
      .find((n) => n.id === nodeId);
    if (node) {
      console.log("ReactFlowPanelV2: Zooming to node:", nodeId);
      // Zoom to the specific node with padding
      reactFlowInstance.current.fitView({
        padding: 0.3,
        includeHiddenNodes: false,
        minZoom: 0.1,
        maxZoom: 2,
        nodes: [node], // Only fit to this specific node
      });
    } else {
      console.log("ReactFlowPanelV2: Node not found for zoom:", nodeId);
    }
  }, []);

  // Optimized hover effect - only update the specific node that changed
  useEffect(() => {
    const hoveredNodeId =
      hoveredNodeIds.size > 0 ? Array.from(hoveredNodeIds)[0] : null;
    setCurrentHoveredNodeId(hoveredNodeId);

    if (reactFlowInstance.current) {
      reactFlowInstance.current.setNodes((currentNodes) =>
        currentNodes.map((n) => {
          const isHovered = n.id === hoveredNodeId;
          const isSelected = selectedNodeIds.has(n.id as NodeId);

          // Only update if hover state or selection state changed
          const wasHovered =
            typeof n.style?.border === "string" &&
            n.style.border.includes("#ff6b35");
          const wasSelected = n.selected;

          if (isHovered === wasHovered && isSelected === wasSelected) {
            return n; // No change needed
          }

          // Get the original node color for proper border reset
          const originalNodeColor = RenderingManager.getColor(
            sceneGraph?.getGraph().getNode(n.id as NodeId),
            nodeLegendConfig,
            legendMode
          );

          return {
            ...n,
            selected: isSelected,
            style: {
              ...n.style,
              border: isHovered
                ? `4px solid #ff6b35`
                : `2px solid ${originalNodeColor}`,
              background: isHovered
                ? `${n.style?.background || "#ccc"}ee`
                : n.style?.background,
              boxShadow: isHovered
                ? `0 4px 12px rgba(255, 107, 53, 0.4)`
                : "none",
            },
          };
        })
      );
    }
  }, [
    hoveredNodeIds,
    selectedNodeIds,
    sceneGraph,
    nodeLegendConfig,
    legendMode,
  ]);

  // Expose the zoom function globally so it can be called from anywhere
  useEffect(() => {
    // Add the zoom function to the window object for global access
    (window as any).reactFlowZoomToNode = (nodeId: string) => {
      zoomToNode(nodeId);
    };

    // Add fit view function for tab system
    (window as any).reactFlowFitView = () => {
      if (reactFlowInstance.current) {
        setReactFlowViewportState(null); // Clear saved state
        reactFlowInstance.current.fitView({
          padding: 0.2,
          includeHiddenNodes: false,
        });
      }
    };

    // Cleanup function to remove the global functions
    return () => {
      delete (window as any).reactFlowZoomToNode;
      delete (window as any).reactFlowFitView;
    };
  }, [zoomToNode, setReactFlowViewportState]);

  // Don't sync selection state automatically - let ReactFlow and our handlers manage it
  // The sync effect was causing conflicts with ReactFlow's internal selection management

  // Handle node interactions
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    console.log("Node clicked:", node.id);
    selectionChangeRef.current = true;

    const nodeId = createNodeId(node.id);
    setSelectedNodeId(nodeId);
    setSelectedNodeIds(new EntityIds([nodeId]));

    // Open the node details panel
    // setRightActiveSection("node-details");

    // Don't manually update ReactFlow nodes - let ReactFlow handle selection state
    // The manual update was causing conflicts with the selection change handler
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
      setActiveDocument(node.id as NodeId);
      setAppActiveView("document-editor");
    },
    [setActiveDocument, setAppActiveView]
  );

  // Save viewport state when it changes - with debouncing to prevent excessive updates
  const handleViewportChange = useCallback(
    (viewport: { x: number; y: number; zoom: number }) => {
      // Clear any existing timeout
      if (viewportTimeoutRef.current) {
        clearTimeout(viewportTimeoutRef.current);
      }

      // Set a new timeout to debounce the viewport state update
      viewportTimeoutRef.current = setTimeout(() => {
        // Only save if the viewport has changed significantly (avoid saving identical states)
        const currentState = getReactFlowViewportState();
        if (
          !currentState ||
          Math.abs(currentState.x - viewport.x) > 1 ||
          Math.abs(currentState.y - viewport.y) > 1 ||
          Math.abs(currentState.zoom - viewport.zoom) > 0.01
        ) {
          setReactFlowViewportState(viewport);
        }
      }, 300); // 300ms debounce for even smoother performance
    },
    [setReactFlowViewportState, getReactFlowViewportState]
  );

  // Handle fit view button click - clear saved viewport state
  const handleFitView = useCallback(() => {
    console.log(
      "ReactFlowPanelV2: Fit view button clicked - clearing saved viewport state"
    );
    setReactFlowViewportState(null);
  }, [setReactFlowViewportState]);

  const handleSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      console.log("handleSelectionChange called with:", params);

      // Skip if this selection change was triggered by our node click handler
      if (selectionChangeRef.current) {
        selectionChangeRef.current = false;
        console.log("Skipping selection change - triggered by node click");
        return;
      }

      // Skip if we're still initializing to prevent conflicts during mount
      if (isInitializingRef.current) {
        console.log("Skipping selection change - still initializing");
        return;
      }

      // Get current selection state to compare
      const currentSelectedNodeIds = getSelectedNodeIds();
      const currentSelectedNodeId = getSelectedNodeId();

      if (!params.nodes || params.nodes.length === 0) {
        // Only clear if there's actually a selection to clear
        if (currentSelectedNodeIds.size > 0 || currentSelectedNodeId) {
          console.log("Clearing selection in handleSelectionChange");
          setSelectedNodeIds(new EntityIds([]));
          setSelectedNodeId(null);
        }
        return;
      }

      const newSelectedNodeIds = new EntityIds(
        params.nodes.map((node) => createNodeId(node.id))
      );

      // Only update if the selection has actually changed
      if (
        currentSelectedNodeIds.size !== newSelectedNodeIds.size ||
        !Array.from(currentSelectedNodeIds).every((id) =>
          newSelectedNodeIds.has(id)
        )
      ) {
        console.log(
          "Setting selection from handleSelectionChange:",
          newSelectedNodeIds
        );
        setSelectedNodeIds(newSelectedNodeIds);

        if (params.nodes.length === 1) {
          // Single node selection
          const newSelectedNodeId = createNodeId(params.nodes[0].id);
          if (newSelectedNodeId !== currentSelectedNodeId) {
            console.log("Single node selection - setting selected node ID");
            setSelectedNodeId(newSelectedNodeId);
          }
        } else {
          // Multi-node selection - clear single node ID
          if (currentSelectedNodeId) {
            setSelectedNodeId(null);
          }
        }
      }
    },
    []
  );

  const handlePaneClick = useCallback(() => {
    console.log("Pane clicked - clearing selection");
    // Clear selection in global store for both single and multi-select
    setSelectedNodeId(null);
    setSelectedNodeIds(new EntityIds([]));

    // Don't manually update ReactFlow nodes - let ReactFlow handle selection clearing
    // The manual update was causing conflicts

    // Close the node details panel if it's open
    setRightActiveSection(null);
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
            proOptions={{ hideAttribution: true }}
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
            onViewportChange={handleViewportChange}
            minZoom={0.01}
            maxZoom={1000}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
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
              onFitView={handleFitView}
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

        {/* Layout Toolbar */}
        <GraphLayoutToolbar
          activeLayout={activeLayout as LayoutEngineOption}
          onLayoutChange={handleLayoutChange}
          physicsMode={forceGraph3dOptions.layout === "Physics"}
          isDarkMode={false} // ReactFlow doesn't have dark mode detection, using false for now
        />
      </div>
    </div>
  );
};

export default ReactFlowPanelV2;
