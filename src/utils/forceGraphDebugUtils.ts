import { ForceGraph3DInstance } from "3d-force-graph";
import { getCurrentSceneGraph } from "../store/appConfigStore";

/**
 * Debug utility for ForceGraph3D camera information
 * Displays detailed camera state including position, target, controls, and configuration
 */
export const debugForceGraph3DCamera = (
  forceGraphInstance: ForceGraph3DInstance | null
) => {
  if (!forceGraphInstance) {
    console.log("ForceGraph3D instance not available");
    alert("ForceGraph3D instance not available");
    return;
  }

  const camera = forceGraphInstance.camera();
  const controls = forceGraphInstance.controls() as any;
  const currentPosition = forceGraphInstance.cameraPosition();

  console.log("=== ForceGraph3D Camera Debug Info ===");
  console.log("Camera object:", camera);
  console.log("Camera position:", camera.position);
  console.log("Camera rotation:", camera.rotation);
  console.log("Camera quaternion:", camera.quaternion);
  console.log("Camera matrix:", camera.matrix);
  console.log("Camera matrixWorld:", camera.matrixWorld);

  if (controls) {
    console.log("Controls object:", controls);
    console.log("Controls target:", controls.target);
    console.log("Controls enabled:", {
      enableRotate: controls.enableRotate,
      enableZoom: controls.enableZoom,
      enablePan: controls.enablePan,
    });
    // Calculate distance manually since getDistance() doesn't exist
    const distance = camera.position.distanceTo(controls.target);
    console.log("Controls distance:", distance);
    console.log("Controls zoom:", controls.object?.zoom);
  }

  console.log("Current camera position (from method):", currentPosition);

  // Get scene graph camera config
  const sceneGraph = getCurrentSceneGraph();
  const config = sceneGraph.getForceGraphRenderConfig();
  console.log("Scene graph camera config:", {
    cameraPosition: config.cameraPosition,
    cameraTarget: config.cameraTarget,
    initialZoom: config.initialZoom,
  });

  // Display in alert for easy viewing
  const debugInfo = `
ForceGraph3D Camera Debug Info:

Camera Position: ${JSON.stringify(camera.position, null, 2)}
Camera Target: ${controls?.target ? JSON.stringify(controls.target, null, 2) : "N/A"}
Camera Rotation: ${JSON.stringify(camera.rotation, null, 2)}
Controls Distance: ${controls?.target ? camera.position.distanceTo(controls.target).toFixed(2) : "N/A"}
Controls Zoom: ${controls?.object?.zoom || "N/A"}

Scene Graph Config:
Position: ${JSON.stringify(config.cameraPosition, null, 2)}
Target: ${JSON.stringify(config.cameraTarget, null, 2)}
Zoom: ${config.initialZoom}
  `;

  alert(debugInfo);
};

/**
 * Get current camera state from ForceGraph3D instance
 * Returns a formatted object with camera position, target, and zoom
 */
export const getCurrentCameraState = (
  forceGraphInstance: ForceGraph3DInstance | null
) => {
  if (!forceGraphInstance) {
    return {
      cameraPosition: { x: 0, y: 0, z: 500 },
      cameraTarget: { x: 0, y: 0, z: 0 },
      zoom: 1,
      distance: 0,
    };
  }

  const camera = forceGraphInstance.camera();
  const controls = forceGraphInstance.controls() as any;

  const cameraPosition = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  };

  const cameraTarget = controls?.target
    ? {
        x: controls.target.x,
        y: controls.target.y,
        z: controls.target.z,
      }
    : { x: 0, y: 0, z: 0 };

  const distance = controls?.target
    ? camera.position.distanceTo(controls.target)
    : 0;
  const zoom = controls?.object?.zoom || 1;

  return {
    cameraPosition,
    cameraTarget,
    zoom,
    distance,
  };
};

/**
 * Log camera state to console in a formatted way
 */
export const logCameraState = (
  forceGraphInstance: ForceGraph3DInstance | null
) => {
  const state = getCurrentCameraState(forceGraphInstance);

  console.log("=== Current Camera State ===");
  console.log("Position:", state.cameraPosition);
  console.log("Target:", state.cameraTarget);
  console.log("Zoom:", state.zoom);
  console.log("Distance:", state.distance.toFixed(2));
  console.log("===========================");
};
