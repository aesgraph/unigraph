import { ForceGraph3DInstance } from "3d-force-graph";

interface AnimationConfig {
  duration?: number; // Total duration of animation in ms (0 for infinite)
  interval?: number; // Time between callbacks in ms
  onComplete?: () => void; // Called when animation completes
  onError?: (error: any) => void;
}

const DEFAULT_CONFIG: AnimationConfig = {
  duration: 0, // Infinite by default
  interval: 100, // 100ms between callbacks
  onComplete: () => {},
  onError: (error) => console.warn("Animation error:", error),
};

/**
 * Creates a managed animation that calls a callback function periodically
 * @param graph ForceGraph3D instance
 * @param callback Function to call on each interval
 * @param config Animation configuration
 * @returns Cleanup function to stop the animation
 */
export function runManagedAnimation(
  graph: ForceGraph3DInstance,
  callback: (elapsedTime: number, frameCount: number) => void,
  config: AnimationConfig = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let isRunning = true;
  const startTime = Date.now();
  let frameCount = 0;
  let timeoutId: NodeJS.Timeout;

  function animate() {
    if (!isRunning) return;

    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;

    // Check if animation should end based on duration
    if (finalConfig.duration && elapsedTime >= finalConfig.duration) {
      isRunning = false;
      finalConfig.onComplete?.();
      return;
    }

    try {
      // Call the user's callback with elapsed time and frame count
      callback(elapsedTime, frameCount);
      frameCount++;

      // Schedule next frame
      timeoutId = setTimeout(animate, finalConfig.interval);
    } catch (error) {
      finalConfig.onError?.(error);
      isRunning = false;
    }
  }

  // Start the animation
  animate();

  // Return cleanup function
  return () => {
    isRunning = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}

// Example usage:
/*
// Basic usage
const cleanup = runManagedAnimation(forceGraphInstance, (elapsedTime, frame) => {
  // Do something with the graph
  console.log(`Frame ${frame}: ${elapsedTime}ms elapsed`);
});

// Usage with configuration
const cleanup = runManagedAnimation(
  forceGraphInstance,
  (elapsedTime, frame) => {
    const progress = elapsedTime / 5000; // 5 second animation
    // Update graph based on progress
    forceGraphInstance.nodeColor(() => 
      `rgba(255,0,0,${Math.sin(progress * Math.PI)})`
    );
  },
  {
    duration: 5000,
    interval: 50,
    onComplete: () => console.log('Animation complete'),
    onError: (error) => console.error('Animation failed:', error)
  }
);

// Stop the animation
cleanup();
*/
