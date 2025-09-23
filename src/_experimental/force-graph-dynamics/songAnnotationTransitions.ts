import { ForceGraph3DInstance } from "3d-force-graph";
import { IForceGraphRenderConfig } from "../../store/forceGraphConfigStore";
import { SongAnnotation } from "../mp3/SongAnnotation";
import { transitionToConfig } from "./transition";

interface SongVisualizationConfig {
  minNodeSize?: number;
  maxNodeSize?: number;
  minLinkWidth?: number;
  maxLinkWidth?: number;
  minOpacity?: number;
  maxOpacity?: number;
  transitionDuration?: number;
}

function generateRandomConfig(
  annotation: SongAnnotation,
  config: SongVisualizationConfig
): IForceGraphRenderConfig {
  const {
    minNodeSize = 2,
    maxNodeSize = 15, // Increased from 8
    minLinkWidth = 1,
    maxLinkWidth = 10, // Increased from 5
    minOpacity = 0.2, // Increased from 0
    maxOpacity = 1,
  } = config;

  // Use Math.floor to get whole numbers
  const nodeSize = Math.floor(
    minNodeSize + Math.random() * (maxNodeSize - minNodeSize)
  );
  const linkWidth = Math.floor(
    minLinkWidth + Math.random() * (maxLinkWidth - minLinkWidth)
  );

  // Use more dramatic opacity changes
  const nodeOpacity = Number(
    (minOpacity + Math.random() * (maxOpacity - minOpacity)).toFixed(1)
  );
  const linkOpacity = Number(
    (minOpacity + Math.random() * (maxOpacity - minOpacity)).toFixed(1)
  );

  // More dramatic force changes
  const chargeStrength = -50 - Math.floor(Math.random() * 150); // Increased range

  return {
    nodeSize: nodeSize,
    nodeOpacity: nodeOpacity,
    linkWidth: linkWidth,
    linkOpacity: linkOpacity,
    chargeStrength: chargeStrength,
    nodeTextLabels: Math.random() > 0.5, // Randomly show/hide labels
    linkTextLabels: false,
  };
}

export function createSongVisualizationTimeline(
  graph: ForceGraph3DInstance,
  annotations: SongAnnotation[],
  options: SongVisualizationConfig = {}
) {
  const { transitionDuration = 1000 } = options;
  let currentTransitionCleanup: (() => void) | null = null;
  let isPlaying = false;
  let animationFrame: number;
  let startTime: number | null = null;

  // Sort annotations by time
  const sortedAnnotations = [...annotations].sort(
    (a, b) => a.getTime() - b.getTime()
  );

  console.log("here they are ", sortedAnnotations);

  // Generate configurations for each annotation
  const timelineConfigs = sortedAnnotations.map((annotation) => ({
    time: annotation.getTime(),
    config: generateRandomConfig(annotation, options),
  }));

  function animate(currentTime: number) {
    if (!startTime) startTime = currentTime;
    const elapsed = (currentTime - startTime) / 1000; // Convert to seconds

    if (isPlaying) {
      updateVisualization(elapsed);
      animationFrame = requestAnimationFrame(animate);
    }
  }

  function updateVisualization(currentTime: number) {
    if (!isPlaying) return;

    // Find the current and next configurations based on time
    const currentIndex = timelineConfigs.findIndex((item, index) => {
      const nextItem = timelineConfigs[index + 1];
      return nextItem
        ? currentTime >= item.time && currentTime < nextItem.time
        : currentTime >= item.time;
    });

    if (currentIndex !== -1) {
      const current = timelineConfigs[currentIndex];
      const next = timelineConfigs[currentIndex + 1];

      if (next) {
        // Calculate transition progress
        const segmentDuration = next.time - current.time;
        const segmentProgress = (currentTime - current.time) / segmentDuration;

        // Interpolate between configurations
        const interpolatedConfig = {
          nodeSize:
            current.config.nodeSize +
            (next.config.nodeSize - current.config.nodeSize) * segmentProgress,
          nodeOpacity:
            current.config.nodeOpacity +
            (next.config.nodeOpacity - current.config.nodeOpacity) *
              segmentProgress,
          linkWidth:
            current.config.linkWidth +
            (next.config.linkWidth - current.config.linkWidth) *
              segmentProgress,
          linkOpacity:
            current.config.linkOpacity +
            (next.config.linkOpacity - current.config.linkOpacity) *
              segmentProgress,
          chargeStrength: current.config.chargeStrength,
          nodeTextLabels: current.config.nodeTextLabels,
          linkTextLabels: false,
        };
        console.log("interpolated", interpolatedConfig);

        // Clean up previous transition
        if (currentTransitionCleanup) {
          currentTransitionCleanup();
        }

        // Start new transition
        console.log("starting new transition", interpolatedConfig);
        currentTransitionCleanup = transitionToConfig(
          graph,
          interpolatedConfig,
          { duration: transitionDuration }
        );
      }
    }
  }

  return {
    start: () => {
      isPlaying = true;
      startTime = null;
      animationFrame = requestAnimationFrame(animate);
    },
    stop: () => {
      isPlaying = false;
      if (currentTransitionCleanup) {
        currentTransitionCleanup();
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    },
    updateTime: updateVisualization,
  };
}

// Example usage:
/*
const visualizer = createSongVisualizationTimeline(forceGraphInstance, annotations, {
  minNodeSize: 2,
  maxNodeSize: 8,
  minLinkWidth: 1,
  maxLinkWidth: 4,
  minOpacity: 0.3,
  maxOpacity: 1,
  transitionDuration: 1000
});

// Start visualization
visualizer.start();

// Update on audio time change
audioPlayer.addEventListener('timeupdate', (event) => {
  visualizer.updateTime(event.currentTime);
});

// Stop visualization
visualizer.stop();
*/
