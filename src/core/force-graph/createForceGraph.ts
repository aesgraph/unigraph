import ForceGraph3D, { ForceGraph3DInstance } from "3d-force-graph";
import {
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
} from "three";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer";
import { ForceGraph3dLayoutMode } from "../../AppConfig";
import { RenderingManager } from "../../controllers/RenderingManager";
import {
  getEdgeLegendConfig,
  getNodeLegendConfig,
} from "../../store/activeLegendConfigStore";
import {
  getInteractivityFlags,
  getLegendMode,
} from "../../store/appConfigStore";
import {
  DEFAULT_FORCE_GRAPH_RENDER_CONFIG,
  IForceGraphRenderConfig,
} from "../../store/forceGraphConfigStore";
import {
  getHoveredEdgeIds,
  getHoveredNodeIds,
  getSelectedNodeId,
  getSelectedNodeIds,
  setHoveredEdgeId,
  setHoveredNodeId,
  setSelectedEdgeId,
  setSelectedEdgeIds,
  setSelectedNodeId,
  setSelectedNodeIds,
} from "../../store/graphInteractionStore";
import {
  clearSelectionBox,
  endSelectionBox,
  getIsDraggingNode,
  getMouseControlMode,
  getSelectionBox,
  SelectionBox,
  setIsDraggingNode,
  startSelectionBox,
  updateSelectionBox,
} from "../../store/mouseControlsStore";
import {
  getActiveSection,
  setRightActiveSection,
} from "../../store/workspaceConfigStore";
import { getLocalCoords } from "../../utils/getLocalCoords";
import { ILayoutEngineResult } from "../layouts/layoutEngineTypes";
import { NodePositionData } from "../layouts/layoutHelpers";
import { EdgeId } from "../model/Edge";
import { EntityIds } from "../model/entity/entityIds";
import { NodeId } from "../model/Node";
import { SceneGraph } from "../model/SceneGraph";
import { exportGraphDataForReactFlow } from "../react-flow/exportGraphDataForReactFlow";
import { flyToNode } from "../webgl/webglHelpers";
import { getNodePositionDataFromForceGraphInstance } from "./forceGraphHelpers";
import { ForceGraphManager } from "./ForceGraphManager";

export const MOUSE_HOVERED_NODE_COLOR = "rgb(243, 255, 16)";
export const SELECTED_NODE_COLOR = "rgb(254, 148, 9)";

export const createForceGraph = (
  sceneGraph: SceneGraph,
  dom: HTMLElement,
  positions?: NodePositionData,
  options: IForceGraphRenderConfig = DEFAULT_FORCE_GRAPH_RENDER_CONFIG,
  layout: ForceGraph3dLayoutMode = "Physics"
): ForceGraph3DInstance => {
  // console.log("creating here", options, layout, positions);
  const data = exportGraphDataForReactFlow(sceneGraph);
  // console.log("data is ", data);
  // const controlMode = getMouseControlMode();
  const graph = new ForceGraph3D(dom, {
    extraRenderers: [new CSS2DRenderer()],
  })
    .graphData({ nodes: data.nodes, links: data.edges })
    .showNavInfo(getMouseControlMode() === "orbital")
    .nodeLabel("label")
    .nodeColor((node) => {
      if (getHoveredNodeIds().has(node.id as NodeId)) {
        console.log("hovered node is ", node.id);
        return MOUSE_HOVERED_NODE_COLOR;
      } else if (
        getSelectedNodeId() === node.id ||
        getSelectedNodeIds().has(node.id as NodeId)
      ) {
        return SELECTED_NODE_COLOR;
      }
      return RenderingManager.getColor(
        sceneGraph.getGraph().getNode(node.id as NodeId),
        getNodeLegendConfig(),
        getLegendMode()
      );
    })
    .linkColor((link) => {
      if (
        getHoveredNodeIds().has((link.source as any).id) ||
        getHoveredNodeIds().has((link.target as any).id)
      ) {
        return "yellow";
      }
      if (getHoveredEdgeIds().has((link as any).id)) {
        return "white";
      }
      return RenderingManager.getColor(
        sceneGraph.getGraph().getEdge((link as any).id),
        getEdgeLegendConfig(),
        getLegendMode()
      );
    })
    .linkLabel("type")
    .backgroundColor(options.backgroundColor ?? "#1a1a1a")
    .enableNodeDrag(true)
    .onNodeClick((node) => {
      flyToNode(graph, node, layout);
      console.log("node clicked");
    })
    .onNodeDrag((node, translate: any) => {
      setIsDraggingNode(true);
      // console.log("translate is ", translate);

      const selectedNodeIds = getSelectedNodeIds();
      if (selectedNodeIds.has(node.id as NodeId) && selectedNodeIds.size > 1) {
        const forceGraphPositionData =
          getNodePositionDataFromForceGraphInstance(graph, selectedNodeIds);
        for (const id of selectedNodeIds) {
          if (node.id === id) {
            continue;
          }
          forceGraphPositionData[id] = {
            x: forceGraphPositionData[id].x + translate.x,
            y: forceGraphPositionData[id].y + translate.y,
            z: forceGraphPositionData[id].z + translate.z,
          };
        }
        ForceGraphManager.updateNodePositions(graph, forceGraphPositionData);
      }
    })
    .onNodeDragEnd((node, _translate: any) => {
      if (node == undefined || node.id == undefined) {
        setIsDraggingNode(false);
        return;
      }
      // console.log("translate end is ", translate);
      const selectedNodeIds = getSelectedNodeIds();
      let positions: NodePositionData = {};
      if (selectedNodeIds.has(node.id as NodeId) && selectedNodeIds.size > 1) {
        positions = getNodePositionDataFromForceGraphInstance(
          graph,
          selectedNodeIds
        );
      } else if (node.id) {
        positions[node.id as NodeId] = {
          x: node.fx! ?? node.x ?? 0,
          y: node.fy! ?? node.y ?? 0,
          z: node.fz! ?? node.z ?? 0,
        };
      }

      Object.entries(positions).forEach(([id, pos]) => {
        sceneGraph
          .getGraph()
          .getNode(id as NodeId)
          .setPosition({
            x: pos.x,
            y: -pos.y,
            z: pos.z,
          });

        sceneGraph.setNodePosition(id as NodeId, {
          x: pos.x,
          y: -pos.y,
          z: pos.z,
        });
      });
      setIsDraggingNode(false);
    });

  // if (selectedNodeIds.has(node.id as NodeId)) {
  //   // Update positions for all selected nodes
  //   selectedNodeIds.forEach((id) => {
  //     const draggedNode = graph
  //       .graphData()
  //       .nodes.find((n: any) => n.id === id);
  //     if (draggedNode) {
  //       sceneGraph
  //         .getGraph()
  //         .getNode(draggedNode.id as NodeId)
  //         .setPosition({
  //           x: draggedNode.fx!,
  //           y: draggedNode.fy!,
  //           z: draggedNode.fz!,
  //         });

  //       sceneGraph.getDisplayConfig().nodePositions![
  //         draggedNode.id as NodeId
  //       ] = {
  //         x: draggedNode.fx!,
  //         y: draggedNode.fy!,
  //         z: draggedNode.fz!,
  //       };
  //     }
  //   });
  // } else {
  //   // Update position for the current node
  //   sceneGraph
  //     .getGraph()
  //     .getNode(node.id as NodeId)
  //     .setPosition({
  //       x: node.fx!,
  //       y: node.fy!,
  //       z: node.fz!,
  //     });

  //   sceneGraph.getDisplayConfig().nodePositions![node.id as NodeId] = {
  //     x: node.fx!,
  //     y: node.fy!,
  //     z: node.fz!,
  //   };
  // }
  // setIsDraggingNode(false);
  // };

  // .d3Force(
  //   "link",
  //   d3
  //     .forceLink()
  //     // .distance((distance) => 5) // Set link length
  //     .strength((link) => 0.5) // Set spring strength
  // );

  // // Customize charge force (node repulsion)
  // .d3Force(
  //   "charge",
  //   d3
  //     .forceManyBody()
  //     .strength(-300) // Negative for repulsion, positive for attraction
  //     .distanceMin(10) // Minimum distance for force application
  //     .distanceMax(1000) // Maximum distance for force application
  // );

  // // Customize center force
  // .d3Force(
  //   "center",
  //   d3.forceCenter().strength(0.5) // How strongly to pull nodes to center
  // );

  // // Set overall simulation parameters
  // .cooldownTime(15000) // Duration of simulation
  // .cooldownTicks(100) // Number of ticks before stopping
  // .d3VelocityDecay(0.1); // "Friction" - lower means more movement

  if (options.nodeTextLabels) {
    console.log("node text labels enabled", sceneGraph.getGraph());
    graph
      .nodeThreeObject((node) => {
        console.log("EHYYY");
        const n = sceneGraph.getGraph().getNode(node.id as NodeId);
        const imageUrl = n.maybeGetUserData("imageUrl") as string | undefined;
        console.log("node is ", n);
        if (imageUrl) {
          console.log("entered");
          const texture = new TextureLoader().load(imageUrl);
          texture.colorSpace = SRGBColorSpace;
          const material = new SpriteMaterial({ map: texture });
          const sprite = new Sprite(material);
          sprite.scale.set(30, 20, 20);
          return sprite;
        }

        // const imageBoxData = n.maybeGetUserData("imageBoxData") as
        //   | ImageBoxData
        //   | undefined;
        // if (imageBoxData) {
        //   const nodeEl = document.createElement("div");
        //   nodeEl.className = "node-label";
        //   nodeEl.innerHTML = `
        //   <div class="node-card" style="
        //     background: #666;
        //     color: white;
        //     padding: 0.5rem;
        //     border-radius: 0.25rem;
        //     user-select: none;
        //   ">
        //     HELLO
        //   </div>
        // `;

        //   const label = new CSS2DObject(nodeEl);

        //   return label;
        // }

        const nodeEl = document.createElement("div");

        nodeEl.textContent = `${node.id}` as string;
        if (getHoveredNodeIds().has(node.id as NodeId)) {
          nodeEl.style.color = "yellow";
        }

        nodeEl.style.color = RenderingManager.getColor(
          sceneGraph.getGraph().getNode(node.id as NodeId),
          getNodeLegendConfig(),
          getLegendMode()
        );

        nodeEl.style.fontSize = `${options.fontSize}px`;

        nodeEl.className = "node-label";
        return new CSS2DObject(nodeEl);
      })
      .nodeThreeObjectExtend(true);
  }

  // Check if camera controls are disabled via interactivityFlags
  const interactivityFlags = getInteractivityFlags();
  if (interactivityFlags?.cameraControls === false) {
    console.log("Camera controls are disabled via interactivityFlags");
    const controls = graph.controls() as any;
    if (controls) {
      controls.enableRotate = false;
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.update();
    }
  }

  if (layout === "Layout" && positions) {
    ForceGraphManager.applyFixedNodePositions(graph, positions);
  }

  ForceGraphManager.applyForceGraphRenderConfig(
    graph,
    options,
    sceneGraph,
    true
  );

  // Apply initial camera settings if provided
  if (options.cameraPosition && options.cameraTarget) {
    console.log(
      "setting camera position",
      options.cameraPosition,
      options.cameraTarget
    );
    console.log("Camera target Z value:", options.cameraTarget.z);

    graph.cameraPosition(
      options.cameraPosition,
      options.cameraTarget,
      0 // Immediate transition for initial setup
    );

    // Debug: Check what the camera target actually is after setting
    const controls = graph.controls() as any;
    if (controls && controls.target) {
      console.log("Camera target after setting:", controls.target);

      // Manually set the controls target to ensure Z coordinate is applied
      if (controls.target.set) {
        controls.target.set(
          options.cameraTarget.x,
          options.cameraTarget.y,
          options.cameraTarget.z
        );
        controls.update();
        console.log("Manually set camera target to:", controls.target);
      }
    }
  }

  // Apply initial zoom if provided
  if (options.initialZoom && options.initialZoom !== 1) {
    console.log("setting initial zoom", options.initialZoom);
    const controls = graph.controls() as any;
    if (controls && controls.object) {
      controls.object.zoom = options.initialZoom;
      controls.update();
    }
  }

  return graph;
};

export const bindEventsToGraphInstance = (
  graph: ForceGraph3DInstance,
  sceneGraph: SceneGraph,
  onNodesRightClick?: (event: MouseEvent, nodeIds: EntityIds<NodeId>) => void,
  onBackgroundRightClick?: (event: MouseEvent) => void
) => {
  graph.onNodeClick((node) => {
    setSelectedNodeId(node?.id as NodeId);
    console.log("node clicked");

    // Force refresh to update node colors immediately
    updateHighlight(graph);
  });

  // Add a background click handler to clear selections
  graph.onBackgroundClick((_event) => {
    // Clear all selections when clicking on background
    setSelectedNodeId(null);
    setSelectedNodeIds([]);
    setSelectedEdgeId(null);
    setSelectedEdgeIds([]);

    // Close the node details panel if it's open
    if (getActiveSection("right") === "node-details") {
      setRightActiveSection(null);
    }

    // Force refresh to update visual state
    updateHighlight(graph);
  });

  graph.onNodeHover((node) => {
    // if (!node) {
    //   console.log("not called");
    // }
    if (!getIsDraggingNode() && !node && getHoveredNodeIds().size > 0) {
      setHoveredNodeId(null);
      updateHighlight(graph);
      return;
    } else if (node && !getHoveredNodeIds().has(node.id as NodeId)) {
      setHoveredNodeId(node.id as NodeId);
      updateHighlight(graph);
    }
  });

  graph.onLinkHover((link) => {
    setHoveredEdgeId((link as any)?.id as EdgeId);
    updateHighlight(graph);
  });

  // graph.onNodeDrag((_node) => {
  //   setIsDraggingNode(true);
  //   // console.log("drag start", _node);
  // });
  graph.onEngineTick(() => {
    // zoomToFit(graph, 100, 1.2);
  });

  // Update right-click handling
  graph.onNodeRightClick((node, event) => {
    if (node == null) {
      return;
    }
    let rightClickList = new EntityIds<NodeId>();
    const selectedNodeIds = getSelectedNodeIds();
    if (selectedNodeIds.has(node.id as NodeId)) {
      rightClickList = selectedNodeIds;
    } else {
      rightClickList = new EntityIds([node.id as NodeId]);
    }
    if (event && onNodesRightClick) {
      event.preventDefault();
      onNodesRightClick(event, rightClickList); // Match the new signature
    }
  });

  graph.onBackgroundRightClick((event) => {
    if (onBackgroundRightClick) {
      event.preventDefault();
      onBackgroundRightClick(event);
    }
  });

  // Add multi-selection support for 'multiselection' mode
  const selectedNodeSet = new Set<string>();

  graph.onNodeClick((node, event) => {
    const controlMode = getMouseControlMode();

    if (controlMode === "multiselection" && (event.ctrlKey || event.metaKey)) {
      // Multi-select mode with Ctrl/Cmd key
      if (node) {
        const nodeId = node.id as NodeId;
        if (selectedNodeSet.has(nodeId)) {
          selectedNodeSet.delete(nodeId);
        } else {
          selectedNodeSet.add(nodeId);
        }
        setSelectedNodeIds([...selectedNodeSet] as NodeId[]);
      }
    } else {
      // Regular click behavior (clear selection and select only this node)
      selectedNodeSet.clear();
      setSelectedNodeId(node?.id as NodeId);
      if (node) {
        selectedNodeSet.add(node.id as string);
      }
      // flyToNode(graph, node);
    }

    // Force refresh to update node colors immediately
    updateHighlight(graph);
  });

  // Add drag selection handling
  const container = graph.renderer()?.domElement.parentElement;
  if (container) {
    let isDragging = false;

    container.addEventListener("mousedown", (event) => {
      if (getIsDraggingNode()) {
        return;
      }
      // console.log("mouse down!");
      const controlMode = getMouseControlMode();
      if (controlMode === "multiselection") {
        // Only start selection box on left click on the background (not on nodes)
        if (
          event.button === 0 &&
          !(event.target as HTMLElement)?.closest(".node-label") &&
          getHoveredNodeIds().size === 0
        ) {
          isDragging = true;
          const { x, y } = getLocalCoords(event, container);
          startSelectionBox(x, y, event.shiftKey);
          // event.preventDefault();
        }
      }
    });

    container.addEventListener("mousemove", (event) => {
      const controlMode = getMouseControlMode();
      if (
        controlMode === "multiselection" &&
        isDragging &&
        !getIsDraggingNode()
      ) {
        const { x, y } = getLocalCoords(event, container);
        updateSelectionBox(x, y);
        event.preventDefault();
      }
    });

    container.addEventListener("mouseup", (event) => {
      const controlMode = getMouseControlMode();
      if (controlMode === "multiselection" && isDragging) {
        isDragging = false;
        endSelectionBox();
        selectNodesInSelectionBox(graph, sceneGraph, getSelectionBox());
        event.preventDefault();
      }
    });

    // Cancel selection if mouse leaves the container
    container.addEventListener("mouseleave", () => {
      if (isDragging) {
        isDragging = false;
        clearSelectionBox();
      }
    });
  }
};

// function getNodesNear(graph: ForceGraph3DInstance, position: {x: number, y: number}, threshold: number) {
//   const nodes = graph.graphData().nodes;
//   const selectedNodes: NodeId[] = [];

//   nodes.forEach((node: any) => {
//     const screenCoords = graph.graph2ScreenCoords(
//       node.fx ?? node.x ?? 0,
//       node.fy ?? node.y ?? 0,
//       node.fz ?? node.z ?? 0
//     );

//     const dx = screenCoords.x - position.x;
//     const dy = screenCoords.y - position.y;

//     if (Math.sqrt(dx * dx + dy * dy) < threshold) {
//       selectedNodes.push(node.id as NodeId);
//     }
//   });

//   return selectedNodes;
// }

// Helper function to select nodes within the selection box
function selectNodesInSelectionBox(
  graph: ForceGraph3DInstance,
  sceneGraph: SceneGraph,
  selectionBox: SelectionBox
) {
  // Get the rectangle coordinates (ensure start is top-left, end is bottom-right)
  const minX = Math.min(selectionBox.startX, selectionBox.endX);
  const maxX = Math.max(selectionBox.startX, selectionBox.endX);
  const minY = Math.min(selectionBox.startY, selectionBox.endY);
  const maxY = Math.max(selectionBox.startY, selectionBox.endY);

  // Check if box is too small (click instead of drag)
  if (Math.abs(maxX - minX) < 5 && Math.abs(maxY - minY) < 5) {
    // console.log("too small", selectionBox);
    clearSelectionBox();

    return;
  }

  // Collect nodes that are within the selection box
  const selectedNodes: NodeId[] = [];

  // Get all currently selected nodes for potential additive selection
  const currentSelectedNodes = new Set(getSelectedNodeIds());
  const isAdditive = selectionBox.isAdditive || false;

  // console.log("selection box is ", selectionBox);

  graph.graphData().nodes.forEach((node: any) => {
    // Skip nodes that aren't visible
    if (
      !sceneGraph
        .getGraph()
        .getNode(node.id as NodeId)
        .isVisible()
    ) {
      return;
    }

    // Use the built-in utility to convert 3D coordinates to screen coordinates
    // This is more accurate than our manual projection calculation
    const screenCoords = graph.graph2ScreenCoords(
      node.fx ?? node.x ?? 0,
      node.fy ?? node.y ?? 0,
      node.fz ?? node.z ?? 0
    );
    // console.log("screen coords are ", screenCoords);

    // Check if the node's screen position is within the selection box
    if (
      screenCoords.x >= minX &&
      screenCoords.x <= maxX &&
      screenCoords.y >= minY &&
      screenCoords.y <= maxY
    ) {
      selectedNodes.push(node.id as NodeId);
    }
  });

  // console.log(
  //   `Found ${selectedNodes.length} nodes in selection box`,
  //   getCurrentSceneGraph().getGraph().getNodes().getAll(selectedNodes),
  //   ForceGraphManager.getNodes(
  //     new EntityIds(selectedNodes),
  //     getForceGraph3dInstance()!
  //   )
  // );

  if (selectedNodes.length > 0) {
    // If shift key is being held, add to existing selection instead of replacing
    const finalSelection = isAdditive
      ? [...new Set([...currentSelectedNodes, ...selectedNodes])]
      : selectedNodes;

    setSelectedNodeIds(finalSelection);

    // Force graph to update visuals
    updateHighlight(graph);
  }

  // Clear the selection box
  clearSelectionBox();
}

export interface IForceGraph3dCameraData {
  pos: Vector3;
  quaternion: any;
}

export const saveForceGraphCameraAndControls = (
  graph: ForceGraph3DInstance
) => {
  const pos = graph.camera().position.clone();
  const quaternion = graph.camera().quaternion.clone();
  return { pos, quaternion };
  // const targetPos = graph.controls().target.clone();
};

export const applyCameraAndControls = (
  graph: ForceGraph3DInstance,
  cameraData: IForceGraph3dCameraData
) => {
  graph.camera().position.copy(cameraData.pos);
  graph.camera().quaternion.copy(cameraData.quaternion);
  // graph.controls().target.copy(targetPos);

  graph.camera().updateMatrixWorld();
};

function updateHighlight(graph: ForceGraph3DInstance) {
  // Force complete refresh of all node and link appearances
  graph.nodeColor(graph.nodeColor());
  graph.linkColor(graph.linkColor());
  graph.linkWidth(graph.linkWidth());

  // Add explicit refresh to ensure immediate visual update
  requestAnimationFrame(() => {
    graph.refresh();
  });
}

export const getNodePosition = (
  nodeId: string,
  forceGraphInstance: ForceGraph3DInstance
) => {
  const node = forceGraphInstance
    .graphData()
    .nodes.find((node) => node.id === nodeId);
  if (node) {
    return {
      x: node.x,
      y: node.y,
      z: node.z,
    };
  }
  return null;
};

// Helper function to get mouse coordinates for a node
export const getNodeMousePosition = (
  node: any,
  graphInstance: ForceGraph3DInstance
) => {
  if (!node || !graphInstance) return null;

  const renderer = graphInstance.renderer();
  if (!renderer) return null;

  const camera = graphInstance.camera();

  const vector = new Vector3(node.x, node.y, node.z);

  vector.project(camera);

  const canvas = renderer.domElement;
  const screenX = ((vector.x + 1) / 2) * canvas.clientWidth;
  const screenY = ((-vector.y + 1) / 2) * canvas.clientHeight;

  return {
    x: screenX,
    y: screenY,
  };
};

// New zoomToFit method
export const zoomToFit = (
  graph: ForceGraph3DInstance,
  duration: number = 0,
  padding: number = 1.2
) => {
  const nodes = graph.graphData().nodes;
  if (!nodes.length) return;

  const bbox = {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
    minZ: Infinity,
    maxZ: -Infinity,
  };

  nodes.forEach((node: any) => {
    bbox.minX = Math.min(bbox.minX, node.fx ?? node.x);
    bbox.maxX = Math.max(bbox.maxX, node.fx ?? node.x);
    bbox.minY = Math.min(bbox.minY, node.fy ?? node.y);
    bbox.maxY = Math.max(bbox.maxY, node.fy ?? node.y);
    bbox.minZ = Math.min(bbox.minZ, node.fz ?? node.z);
    bbox.maxZ = Math.max(bbox.maxZ, node.fz ?? node.z);
  });

  const centerX = (bbox.minX + bbox.maxX) / 2;
  const centerY = (bbox.minY + bbox.maxY) / 2;
  const centerZ = (bbox.minZ + bbox.maxZ) / 2;

  const maxDistance = Math.max(
    bbox.maxX - bbox.minX,
    bbox.maxY - bbox.minY,
    bbox.maxZ - bbox.minZ
  );

  const cameraDistance = (maxDistance / (2 * Math.tan(Math.PI / 8))) * padding;

  graph.cameraPosition(
    { x: centerX, y: centerY, z: centerZ + cameraDistance },
    { x: centerX, y: centerY, z: centerZ },
    duration
  );
};

// New method to update node positions on an existing instance
export const updateNodePositions = (
  graph: ForceGraph3DInstance,
  positions: NodePositionData
) => {
  const nodes = graph.graphData().nodes;
  nodes.forEach((node: any) => {
    if (positions[node.id]) {
      node.x = positions[node.id].x;
      node.y = positions[node.id].y;
      node.z = positions[node.id].z ?? 0;
    }
  });
  // graph.nodeRelSize(graph.nodeRelSize()); // Trigger re-render
  graph.refresh();
};

// Custom force to implement repulsion from center node
const repulsiveForce = (centerNodeId: string) => {
  let nodes: any[];
  const repulsionStrength = 30;
  const optimalDistance = 100;
  const maxForce = 10; // Limit maximum force
  const minDistance = 10; // Minimum distance to prevent extreme forces

  function force(alpha: number) {
    const centerNode = nodes.find((node) => node.id === centerNodeId);
    if (!centerNode) return;

    // Fix center node
    centerNode.fx = centerNode.x;
    centerNode.fy = centerNode.y;
    centerNode.fz = centerNode.z;

    nodes.forEach((node) => {
      if (node.id === centerNodeId) return;

      const dx = node.x - centerNode.x;
      const dy = node.y - centerNode.y;
      const dz = node.z - centerNode.z;

      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || minDistance;

      // Calculate normalized direction
      const nx = dx / distance;
      const ny = dy / distance;
      const nz = dz / distance;

      // Calculate force based on distance from optimal
      const distanceFromOptimal = distance - optimalDistance;
      const forceMagnitude = Math.min(
        repulsionStrength * (distanceFromOptimal / optimalDistance),
        maxForce
      );

      // Apply force
      const force = forceMagnitude * alpha;
      node.vx += nx * force;
      node.vy += ny * force;
      node.vz += nz * force;

      // Add damping to prevent infinite acceleration
      node.vx *= 0.9;
      node.vy *= 0.9;
      node.vz *= 0.9;
    });
  }

  force.initialize = function (_nodes: any[]) {
    nodes = _nodes;
  };

  return force;
};

export const attachRepulsiveForce = (
  graph: ForceGraph3DInstance,
  centerNodeId: string
) => {
  // Reset forces
  graph
    .d3Force("link", null)
    // .d3Force("charge", null)
    // .d3Force("center", null)
    .d3Force("collision", null);

  // Add custom force
  graph.d3Force("repulsion", repulsiveForce(centerNodeId));

  // Configure simulation
  // graph.d3VelocityDecay(0.4); // Increased to add more damping
  // .cooldownTime(3000)
  // .d3AlphaMin(0.1); // Stop simulation when it reaches this energy level

  // Reheat simulation
  graph.d3ReheatSimulation();
};

const finalPositionForce = (
  finalPositions: NodePositionData,
  strength: number = 0.01
) => {
  let nodes: any[];

  function force(alpha: number) {
    nodes.forEach((node) => {
      if (!finalPositions[node.id]) return;

      // Calculate direction to final position
      const targetX = finalPositions[node.id].x;
      const targetY = finalPositions[node.id].y;
      const targetZ = finalPositions[node.id].z ?? 0;

      // Apply force towards target position
      node.vx += (targetX - node.x) * strength * alpha;
      node.vy += (targetY - node.y) * strength * alpha;
      node.vz += (targetZ - node.z) * strength * alpha;
    });
  }

  force.initialize = function (_nodes: any[]) {
    nodes = _nodes;
  };

  return force;
};

export const attachSimulation = (
  graph: ForceGraph3DInstance,
  finalLayout: ILayoutEngineResult
) => {
  // Removed any forced noded positions
  graph.graphData().nodes.forEach((node: any) => {
    node.fx = undefined;
    node.fy = undefined;
    node.fz = undefined;
  });
  // Clear existing forces
  graph
    .d3Force("link", null)
    .d3Force("charge", null)
    .d3Force("center", null)
    .d3Force("collision", null)
    .d3Force("finalPosition", null);

  // Add force that moves nodes to their final positions
  graph.d3Force("finalPosition", finalPositionForce(finalLayout.positions));

  // Configure simulation
  graph
    .d3VelocityDecay(0.4) // Add damping to make movement smoother
    .cooldownTime(5000) // Animation duration
    .d3AlphaMin(0.001) // When to stop the simulation
    .d3ReheatSimulation();
};
