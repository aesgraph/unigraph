import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// CameraHelper class for managing camera positioning and transitions
export class CameraHelper {
  private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private controls: OrbitControls | null;
  private scene: THREE.Scene;
  private isAnimating: boolean = false;

  constructor(
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
    scene: THREE.Scene,
    controls?: OrbitControls
  ) {
    this.camera = camera;
    this.scene = scene;
    this.controls = controls || null;
  }

  /**
   * Centers the camera on a specific object
   * @param target - The object to center on
   * @param options - Configuration options for the centering behavior
   */
  centerOnObject(
    target: THREE.Object3D,
    options: {
      duration?: number; // Duration of transition in milliseconds
      distance?: number; // Distance from object
      offset?: THREE.Vector3; // Offset from center position
      immediate?: boolean; // Skip animation
      onComplete?: () => void; // Callback when centering is complete
    } = {}
  ) {
    const {
      duration = 1000,
      distance = 5,
      offset = new THREE.Vector3(0, 0, 0),
      immediate = false,
      onComplete,
    } = options;

    // Get world position of target
    const targetWorldPosition = new THREE.Vector3();
    target.getWorldPosition(targetWorldPosition);

    // Calculate desired camera position
    const targetCameraPosition = this.calculateCameraPosition(
      targetWorldPosition,
      distance,
      offset
    );

    if (immediate) {
      this.setCameraPosition(targetCameraPosition, targetWorldPosition);
      if (onComplete) onComplete();
      return;
    }

    this.animateCameraToPosition(
      targetCameraPosition,
      targetWorldPosition,
      duration,
      onComplete
    );
  }

  /**
   * Calculates the desired camera position based on target and parameters
   */
  private calculateCameraPosition(
    targetPos: THREE.Vector3,
    distance: number,
    offset: THREE.Vector3
  ): THREE.Vector3 {
    const position = new THREE.Vector3();

    // Calculate position to be perpendicular to the z-axis
    position.x = targetPos.x;
    position.y = targetPos.y;
    position.z = targetPos.z + distance;

    // Apply additional offset
    position.add(offset);

    return position;
  }

  /**
   * Smoothly animates the camera to a new position
   */
  private animateCameraToPosition(
    targetCameraPosition: THREE.Vector3,
    lookAtPosition: THREE.Vector3,
    duration: number,
    onComplete?: () => void
  ) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const startPosition = this.camera.position.clone();
    const startRotation = this.camera.quaternion.clone();
    const startTime = performance.now();

    // Create a temporary camera to calculate the target rotation
    const tempCamera = this.camera.clone();
    tempCamera.position.copy(targetCameraPosition);
    tempCamera.lookAt(lookAtPosition);
    const targetRotation = tempCamera.quaternion.clone();

    const animate = () => {
      const currentTime = performance.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Use smooth easing function
      const easing = this.easeInOutCubic(progress);

      // Interpolate position and rotation
      this.camera.position.lerpVectors(
        startPosition,
        targetCameraPosition,
        easing
      );

      // this doesnt work, using the block below instead
      //   const inter = this.camera.quaternion.slerpQuaternions(
      //     startRotation,
      //     targetRotation,
      //     easing
      //   );

      console.log("rotation", startRotation, targetRotation);
      if (this.controls) {
        this.controls.target.copy(lookAtPosition);
        this.controls.update();
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isAnimating = false;

        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Immediately sets camera position and rotation
   */
  private setCameraPosition(
    position: THREE.Vector3,
    lookAtPosition: THREE.Vector3
  ) {
    this.camera.position.copy(position);
    this.camera.lookAt(lookAtPosition);

    if (this.controls) {
      this.controls.target.copy(lookAtPosition);
      this.controls.update();
    }
  }

  /**
   * Cubic easing function for smooth animation
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Returns whether the camera is currently animating
   */
  isCurrentlyAnimating(): boolean {
    return this.isAnimating;
  }
}

// Usage example:
/*
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const scene = new THREE.Scene();
const controls = new THREE.OrbitControls(camera, renderer.domElement);

const cameraHelper = new CameraHelper(camera, scene, controls);

// Basic centering
cameraHelper.centerOnObject(targetMesh);

// Advanced centering with options
cameraHelper.centerOnObject(targetMesh, {
  duration: 2000,
  distance: 10,
  offset: new THREE.Vector3(0, 2, 0),
  onComplete: () => console.log('Camera centered!')
});
*/
