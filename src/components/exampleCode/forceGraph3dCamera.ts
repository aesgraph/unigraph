import { ForceGraph3DInstance } from "3d-force-graph";
import { Vector3 } from "three";

interface Node {
  x?: number;
  y?: number;
  z?: number;
  [key: string]: any;
}

interface GraphBounds {
  min: Vector3;
  max: Vector3;
  center: Vector3;
  radius: number;
}

export function computeGraphBounds(nodes: Node[]): GraphBounds {
  const min = new Vector3(Infinity, Infinity, Infinity);
  const max = new Vector3(-Infinity, -Infinity, -Infinity);

  // Find min and max coordinates
  nodes.forEach((node) => {
    const x = node.x || 0;
    const y = node.y || 0;
    const z = node.z || 0;

    min.x = Math.min(min.x, x);
    min.y = Math.min(min.y, y);
    min.z = Math.min(min.z, z);

    max.x = Math.max(max.x, x);
    max.y = Math.max(max.y, y);
    max.z = Math.max(max.z, z);
  });

  // Calculate center point
  //   const center = new Vector3().addVectors(min, max).multiplyScalar(0.5);
  const center = new Vector3(0, 0, 0);

  // Calculate radius (distance from center to furthest node)
  let maxRadius = 0;
  nodes.forEach((node) => {
    const distance = new Vector3(
      node.x || 0,
      node.y || 0,
      node.z || 0
    ).distanceTo(center);
    maxRadius = Math.max(maxRadius, distance);
  });

  return { min, max, center, radius: maxRadius };
}

export function setupDynamicCamera(graph: ForceGraph3DInstance) {
  // Factor to control how much padding to add around the nodes
  const PADDING_FACTOR = 1.5;
  // Minimum distance to maintain from graph center
  const MIN_DISTANCE = 1000;

  // eslint-disable-next-line unused-imports/no-unused-vars
  let currentZoom = 1;
  let isFirstRender = true;

  graph.onEngineTick(() => {
    const nodes = graph.graphData().nodes;
    const bounds = computeGraphBounds(nodes);

    // Calculate optimal camera distance based on graph radius
    const distance = Math.max(bounds.radius * PADDING_FACTOR, MIN_DISTANCE);

    if (isFirstRender) {
      // Initial camera positioning
      graph.cameraPosition(
        {
          x: 0, //bounds.center.x,
          y: 0, //bounds.center.y,
          z: bounds.center.z + distance,
        },
        bounds.center,
        0 // Immediate transition for first render
      );
      isFirstRender = false;
    } else {
      // Smooth camera updates during animation
      graph.cameraPosition(
        {
          x: 0, //bounds.center.x,
          y: 0, //bounds.center.y,
          z: bounds.center.z + distance,
        },
        bounds.center,
        300 // Smooth transition duration in ms
      );
    }
  });

  // Optional: Add mouse wheel zoom control
  (graph.controls() as any).addEventListener("zoom", (event: any) => {
    currentZoom = event.target.object.zoom;
  });

  return {
    // Method to manually trigger camera fit
    fitView: (duration = 1000) => {
      const bounds = computeGraphBounds(graph.graphData().nodes);
      const distance = Math.max(bounds.radius * PADDING_FACTOR, MIN_DISTANCE);

      graph.cameraPosition(
        {
          x: bounds.center.x,
          y: bounds.center.y,
          z: bounds.center.z + distance,
        },
        bounds.center,
        duration
      );
    },

    focusOnNode: (node: any, duration = 1000) => {
      if (!node) return;

      // Get current camera position
      const _curCameraPos = graph.cameraPosition();

      // Calculate target position
      const distance = 100; // Base distance from node
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

      // Calculate new camera position
      const targetPos =
        node.x || node.y || node.z
          ? {
              x: node.x * distRatio,
              y: node.y * distRatio,
              z: node.z * distRatio,
            }
          : { x: 0, y: 0, z: distance }; // Default position if node is at origin

      // Animate camera to new position
      graph.cameraPosition(
        targetPos, // New position
        node, // Look at node
        duration // Animation duration in ms
      );
    },

    // Add option to reset camera
    resetCamera: (duration = 1000) => {
      const bounds = computeGraphBounds(graph.graphData().nodes);
      const distance = Math.max(bounds.radius * PADDING_FACTOR, MIN_DISTANCE);

      graph.cameraPosition(
        {
          x: 0,
          y: 0,
          z: distance,
        },
        bounds.center,
        duration
      );
    },
  };
}

export const focusOnNode = (
  node: any,
  duration = 1000,
  forceGraphInstance: ForceGraph3DInstance
) => {
  if (!node) return;

  // Get current camera position
  const _curCameraPos = forceGraphInstance.cameraPosition();

  // Calculate target position
  const distance = 100; // Base distance from node
  const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

  // Calculate new camera position
  const targetPos =
    node.x || node.y || node.z
      ? {
          x: node.x * distRatio,
          y: node.y * distRatio,
          z: node.z * distRatio,
        }
      : { x: 0, y: 0, z: distance }; // Default position if node is at origin

  // Animate camera to new position
  forceGraphInstance.cameraPosition(
    targetPos, // New position
    { x: node.x, y: node.y, z: node.z }, // Look at node
    duration // Animation duration in ms
  );
};
