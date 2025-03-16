import { ForceGraph3DInstance } from "3d-force-graph";
import { SceneGraph } from "../../model/SceneGraph";

interface PulsateOptions {
  minOpacity?: number;
  maxOpacity?: number;
  duration?: number; // Duration in milliseconds for one complete cycle
  nodeFilter?: (node: any) => boolean; // Optional filter for which nodes to animate
}

export function pulsateNodes(
  graph: ForceGraph3DInstance,
  sceneGraph: SceneGraph,
  options: PulsateOptions = {}
) {
  const {
    minOpacity = 0.3,
    maxOpacity = 1.0,
    duration = 1500,
    // eslint-disable-next-line unused-imports/no-unused-vars
    nodeFilter = () => true,
  } = options;

  let animationFrame: number;
  let startTime: number | null = null;

  function animate(currentTime: number) {
    if (!startTime) startTime = currentTime;
    const elapsedTime = currentTime - startTime;

    // Calculate progress through the cycle (0 to 1)
    const progress = (elapsedTime % duration) / duration;

    // Use sine wave for smooth pulsing (returns -1 to 1)
    const wave = Math.sin(progress * Math.PI * 2);

    // Convert wave to opacity value
    const opacity = minOpacity + ((maxOpacity - minOpacity) * (wave + 1)) / 2;

    // Update node opacities
    graph.nodeOpacity(opacity);
    //   nodeFilter(node as NodeObject) ? opacity : graph.nodeOpacity()(node)

    // Continue animation
    animationFrame = requestAnimationFrame(animate);
  }

  // Start animation
  animationFrame = requestAnimationFrame(animate);

  // Return cleanup function
  return () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    // Reset opacities
    graph.nodeOpacity(graph.nodeOpacity());
  };
}

// Example usage:
// const cleanup = pulsateNodes(forceGraphInstance, {
//   minOpacity: 0.2,
//   maxOpacity: 1.0,
//   duration: 2000,
//   nodeFilter: node => node.type === 'special'
// });
//
// // Later, to stop animation:
// cleanup();
