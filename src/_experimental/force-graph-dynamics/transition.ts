import { ForceGraph3DInstance } from "3d-force-graph";
import { IForceGraphRenderConfig } from "../../store/forceGraphConfigStore";

interface TransitionOptions {
  duration?: number;
  easing?: (t: number) => number;
  onComplete?: () => void;
}

const defaultEasing = (t: number): number => {
  // Cubic ease-in-out
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export function transitionToConfig(
  graph: ForceGraph3DInstance,
  targetConfig: IForceGraphRenderConfig,
  options: TransitionOptions = {}
) {
  const { duration = 1000, easing = defaultEasing, onComplete } = options;

  // Store initial values - call the getters properly
  const initial = {
    nodeOpacity: graph.nodeOpacity(), // Need to call twice - it's a getter function
    linkOpacity: graph.linkOpacity(),
    nodeSize: graph.nodeRelSize(),
    linkWidth: graph.linkWidth(),
  };

  // Store target values
  const target = {
    nodeOpacity: targetConfig.nodeOpacity,
    linkOpacity: targetConfig.linkOpacity,
    nodeSize: targetConfig.nodeSize,
    linkWidth: targetConfig.linkWidth,
  };

  let startTime: number | null = null;
  let animationFrame: number;

  function interpolate(start: number, end: number, progress: number): number {
    return start + (end - start) * progress;
  }

  function animate(currentTime: number) {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);

    // Create interpolated values
    const currentNodeOpacity = interpolate(
      initial.nodeOpacity,
      target.nodeOpacity,
      easedProgress
    );
    const currentLinkOpacity = interpolate(
      initial.linkOpacity,
      target.linkOpacity,
      easedProgress
    );
    const currentNodeSize = interpolate(
      initial.nodeSize,
      target.nodeSize,
      easedProgress
    );
    const currentLinkWidth = interpolate(
      initial.linkWidth as number,
      target.linkWidth,
      easedProgress
    );

    // Update properties with proper function calls
    graph.nodeOpacity(currentNodeOpacity);
    graph.linkOpacity(currentLinkOpacity);
    graph.nodeRelSize(currentNodeSize);
    graph.linkWidth(() => currentLinkWidth);
    // graph.d3Force("charge")?.strength(Math.random() * 400 - 200); // Reheat simulation
    graph.d3ReheatSimulation();

    if (progress < 1) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      // Ensure final values are set exactly
      graph.nodeOpacity(target.nodeOpacity);
      graph.linkOpacity(target.linkOpacity);
      graph.nodeRelSize(target.nodeSize);
      graph.linkWidth(target.linkWidth);

      onComplete?.();
    }
  }

  // Start animation
  animationFrame = requestAnimationFrame(animate);

  // Return cleanup function
  return () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  };
}

// Example usage:
// const cleanup = transitionToConfig(forceGraphInstance, {
//   nodeOpacity: 0.8,
//   linkOpacity: 0.5,
//   nodeSize: 5,
//   linkWidth: 2
// }, {
//   duration: 2000,
//   onComplete: () => console.log('Transition complete')
// });
//
// // To cancel transition:
// cleanup();
