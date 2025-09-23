import { ForceGraph3DInstance } from "3d-force-graph";
import { IForceGraphRenderConfig } from "../../store/forceGraphConfigStore";
import { runManagedAnimation } from "./animationRunner";
import { transitionToConfig } from "./transition";

export interface TimedConfig {
  time: number; // When to apply this config (in ms)
  config: IForceGraphRenderConfig;
  duration?: number; // How long to transition to this config
}

interface SequenceConfig {
  loop?: boolean; // Whether to loop the sequence
  totalDuration?: number; // Override sequence length (ms)
  interval?: number; // How often to check for config changes
  onComplete?: () => void;
}

const DEFAULT_CONFIG: SequenceConfig = {
  loop: false,
  interval: 50,
  onComplete: () => {},
};

/**
 * Plays a sequence of rendering configurations at specified timestamps
 */
export function playConfigSequence(
  graph: ForceGraph3DInstance,
  configs: TimedConfig[],
  options: SequenceConfig = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...options };

  // Sort configs by time
  const sortedConfigs = [...configs].sort((a, b) => a.time - b.time);

  // Calculate or use provided total duration
  const totalDuration =
    finalConfig.totalDuration ||
    Math.max(...sortedConfigs.map((c) => c.time)) + 1000;

  let currentTransitionCleanup: (() => void) | null = null;
  let lastConfigIndex = -1;

  // Start the animation
  const cleanup = runManagedAnimation(
    graph,
    (elapsedTime) => {
      // Handle looping
      const currentTime = finalConfig.loop
        ? elapsedTime % totalDuration
        : elapsedTime;

      // Find the current config based on time
      const currentIndex = sortedConfigs.findIndex((item, index) => {
        const nextItem = sortedConfigs[index + 1];
        return nextItem
          ? currentTime >= item.time && currentTime < nextItem.time
          : currentTime >= item.time;
      });

      // If we found a new config to apply
      if (currentIndex !== -1 && currentIndex !== lastConfigIndex) {
        const config = sortedConfigs[currentIndex];

        // Clean up previous transition
        if (currentTransitionCleanup) {
          currentTransitionCleanup();
        }

        // Start new transition
        currentTransitionCleanup = transitionToConfig(graph, config.config, {
          duration: config.duration || 1000,
          onComplete: () =>
            console.log(`Transition to config ${currentIndex} complete`),
        });

        lastConfigIndex = currentIndex;
      }
    },
    {
      interval: finalConfig.interval,
      duration: finalConfig.loop ? 0 : totalDuration,
      onComplete: finalConfig.onComplete,
      onError: (error) => console.warn("Config sequence error:", error),
    }
  );

  // Return cleanup function
  return () => {
    if (currentTransitionCleanup) {
      currentTransitionCleanup();
    }
    cleanup();
  };
}

// Example usage:
/*
const configs: TimedConfig[] = [
  {
    time: 0,
    config: {
      nodeSize: 5,
      nodeOpacity: 1,
      linkWidth: 1,
      linkOpacity: 1,
      chargeStrength: -30,
      nodeTextLabels: false,
      linkTextLabels: false
    },
    duration: 1000
  },
  {
    time: 2000,
    config: {
      nodeSize: 10,
      nodeOpacity: 0.5,
      linkWidth: 2,
      linkOpacity: 0.5,
      chargeStrength: -50,
      nodeTextLabels: true,
      linkTextLabels: false
    },
    duration: 500
  },
  // ...more configs
];

const cleanup = playConfigSequence(forceGraphInstance, configs, {
  loop: true,
  interval: 50,
  onComplete: () => console.log('Sequence complete')
});

// Later:
cleanup();
*/

export const demoConfig: TimedConfig[] = [
  {
    time: 0,
    config: {
      nodeSize: 5,
      nodeOpacity: 1,
      linkWidth: 1,
      linkOpacity: 1,
      chargeStrength: -30,
      nodeTextLabels: false,
      linkTextLabels: false,
    },
    duration: 1000,
  },
  {
    time: 2000,
    config: {
      nodeSize: 10,
      nodeOpacity: 0.5,
      linkWidth: 2,
      linkOpacity: 0.5,
      chargeStrength: -50,
      nodeTextLabels: true,
      linkTextLabels: false,
    },
    duration: 500,
  },
];
