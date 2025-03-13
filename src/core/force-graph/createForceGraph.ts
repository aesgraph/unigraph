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
import { ILayoutEngineResult } from "../layouts/LayoutEngine";
import { NodePositionData } from "../layouts/layoutHelpers";
import { NodeId } from "../model/Node";
import { SceneGraph } from "../model/SceneGraph";
import { exportGraphDataForReactFlow } from "../react-flow/exportGraphDataForReactFlow";
import { flyToNode } from "../webgl/webglHelpers";
import { updateVisibleEntitiesInForceGraphInstance } from "./forceGraphHelpers";
import { ForceGraphManager } from "./ForceGraphManager";

export const refreshForceGraphInstance = (
  forceGraphInstance: ForceGraph3DInstance,
  sceneGraph: SceneGraph,
  layout: ForceGraph3dLayoutMode = "Physics"
) => {
  console.log("Refreshing existing force graph instance...");

  const renderingManager = sceneGraph.getRenderingManager();

  // Update visible nodes and edges (with smart position handling)
  updateVisibleEntitiesInForceGraphInstance(forceGraphInstance, sceneGraph);

  forceGraphInstance.nodeColor((node) => {
    if (sceneGraph.getAppState().hoveredNodes.has(node.id as string)) {
      return "rgb(242, 254, 9)";
    }
    return renderingManager.getNodeColor(
      sceneGraph.getGraph().getNode(node.id as NodeId)
    );
  });

  forceGraphInstance.linkColor((link) => {
    if (
      sceneGraph
        .getAppState()
        .hoveredNodes.has((link.source as any).id as string)
    ) {
      return "yellow";
    }
    if (
      sceneGraph
        .getAppState()
        .hoveredNodes.has((link.target as any).id as string)
    ) {
      return "white";
    }
    return renderingManager.getEdgeColor(
      sceneGraph.getGraph().getEdge((link as any).id)
    );
  });

  ForceGraphManager.applyForceGraphRenderConfig(
    forceGraphInstance,
    sceneGraph.getForceGraphRenderConfig(),
    sceneGraph
  );

  if (layout === "Layout" && sceneGraph.getDisplayConfig().nodePositions) {
    ForceGraphManager.applyFixedNodePositions(
      forceGraphInstance,
      sceneGraph.getDisplayConfig().nodePositions!
    );
  }
};

export interface IForceGraphRenderConfig {
  nodeTextLabels: boolean;
  linkWidth: number;
  nodeSize: number;
  linkTextLabels: boolean;
  nodeOpacity: number;
  linkOpacity: number;
  chargeStrength: number;
}

export const DEFAULT_FORCE_GRAPH_RENDER_CONFIG: IForceGraphRenderConfig = {
  nodeTextLabels: false,
  linkWidth: 2,
  nodeSize: 6,
  linkTextLabels: true,
  nodeOpacity: 1,
  linkOpacity: 1,
  //phyics
  chargeStrength: -30, // default.
};

export const createForceGraph = (
  sceneGraph: SceneGraph,
  dom: HTMLElement,
  positions?: NodePositionData,
  options: IForceGraphRenderConfig = DEFAULT_FORCE_GRAPH_RENDER_CONFIG,
  layout: ForceGraph3dLayoutMode = "Physics"
): ForceGraph3DInstance => {
  console.log("creating here", options, layout, positions);
  const data = exportGraphDataForReactFlow(sceneGraph);
  console.log("data is ", data);
  const renderingManager = sceneGraph.getRenderingManager();

  const graph = new ForceGraph3D(dom, {
    extraRenderers: [new CSS2DRenderer()],
  })
    .graphData({ nodes: data.nodes, links: data.edges })
    .nodeLabel("id")
    .nodeColor((node) => {
      if (sceneGraph.getAppState().hoveredNodes.has(node.id as string)) {
        return "rgb(242, 254, 9)";
      }
      return renderingManager.getNodeColor(
        sceneGraph.getGraph().getNode(node.id as NodeId)
      );
    })
    .linkColor((link) => {
      if (
        sceneGraph
          .getAppState()
          .hoveredNodes.has((link.source as any).id as string)
      ) {
        return "yellow";
      }
      if (
        sceneGraph
          .getAppState()
          .hoveredNodes.has((link.target as any).id as string)
      ) {
        return "white";
      }
      const x = renderingManager.getEdgeColor(
        sceneGraph.getGraph().getEdge((link as any).id)
      );
      return x;
    })
    .linkLabel("type")
    .backgroundColor("#1a1a1a")
    .onNodeClick((node) => {
      flyToNode(graph, node);
    })
    .onNodeDragEnd((node) => {
      console.log("drag end", node);
      node.fx = node.x;
      node.fy = node.y;
      node.fz = node.z;

      sceneGraph
        .getGraph()
        .getNode(node.id as NodeId)
        .setPosition({
          x: node.x!,
          y: node.y!,
          z: node.z!,
        });

      sceneGraph.getDisplayConfig().nodePositions![node.id as NodeId] = {
        x: node.x!,
        y: node.y!,
        z: node.z!,
      };
    })
    .enableNodeDrag(true);

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
        if (sceneGraph.getAppState()) {
          if (sceneGraph.getAppState().hoveredNodes.has(n.getId())) {
            nodeEl.style.color = "yellow";
          }
        }

        nodeEl.style.color = renderingManager.getNodeColor(n);
        nodeEl.className = "node-label";
        return new CSS2DObject(nodeEl);
      })
      .nodeThreeObjectExtend(true);
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

  return graph;
};

export const bindEventsToGraphInstance = (
  graph: ForceGraph3DInstance,
  sceneGraph: SceneGraph,
  onNodeHovered: (node: NodeId | null) => void,
  onNodeClicked: (node: NodeId | null) => void,
  onNodeRightClick?: (event: MouseEvent, nodeId: string | null) => void,
  onBackgroundRightClick?: (event: MouseEvent) => void
) => {
  graph.onNodeClick((node) => onNodeClicked(node?.id as NodeId));
  graph.onNodeHover((node) => {
    // no state change
    // if (!node && !sceneGraph.getAppState().hoveredNodes.has(node.id as string)) {
    //   return;
    // }
    sceneGraph.getAppState().hoveredNodes.clear();
    if (node) {
      sceneGraph.getAppState().hoveredNodes.add(node.id as string);
    }
    onNodeHovered(node?.id as NodeId);

    // highlightNodes.clear();
    // highlightLinks.clear();
    // if (node) {
    //   highlightNodes.add(node);
    //   node.neighbors.forEach((neighbor) => highlightNodes.add(neighbor));
    //   node.links.forEach((link) => highlightLinks.add(link));
    // }

    // hoverNode = node || null;

    updateHighlight(graph);
  });

  graph.onNodeDrag((node) => {});
  graph.onEngineTick(() => {
    // zoomToFit(graph, 100, 1.2);
  });

  // Update right-click handling
  graph.onNodeRightClick((node, event) => {
    if (event && onNodeRightClick) {
      event.preventDefault();
      onNodeRightClick(event, (node?.id as string) ?? null); // Match the new signature
    }
  });

  graph.onBackgroundRightClick((event) => {
    if (onBackgroundRightClick) {
      event.preventDefault();
      onBackgroundRightClick(event);
    }
  });
};

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
  graph
    .nodeColor(graph.nodeColor())
    .linkColor(graph.linkColor())
    .linkWidth(graph.linkWidth())
    .linkDirectionalParticles(graph.linkDirectionalParticles());
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
