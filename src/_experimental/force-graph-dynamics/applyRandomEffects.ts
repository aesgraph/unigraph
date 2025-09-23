import { ForceGraph3DInstance } from "3d-force-graph";
import { IForceGraphRenderConfig } from "../../store/forceGraphConfigStore";
import { SongAnnotation } from "../mp3/SongAnnotation";
import { transitionToConfig } from "./transition";

interface RandomEffectsConfig {
  minNodeSize?: number;
  maxNodeSize?: number;
  minLinkWidth?: number;
  maxLinkWidth?: number;
  minOpacity?: number;
  maxOpacity?: number;
  transitionDuration?: number;
}

function generateRandomConfig(
  config: RandomEffectsConfig
): IForceGraphRenderConfig {
  const {
    minNodeSize = 2,
    maxNodeSize = 15,
    minLinkWidth = 1,
    maxLinkWidth = 10,
    minOpacity = 0.2,
    maxOpacity = 1,
  } = config;

  const nodeSize = Math.floor(
    minNodeSize + Math.random() * (maxNodeSize - minNodeSize)
  );
  const linkWidth = Math.floor(
    minLinkWidth + Math.random() * (maxLinkWidth - minLinkWidth)
  );
  const nodeOpacity = Number(
    (minOpacity + Math.random() * (maxOpacity - minOpacity)).toFixed(1)
  );
  const linkOpacity = Number(
    (minOpacity + Math.random() * (maxOpacity - minOpacity)).toFixed(1)
  );
  const chargeStrength = -50 - Math.floor(Math.random() * 150);

  return {
    nodeSize,
    nodeOpacity,
    linkWidth,
    linkOpacity,
    chargeStrength,
    nodeTextLabels: Math.random() > 0.5,
    linkTextLabels: false,
  };
}

export function applyRandomEffects(
  graph: ForceGraph3DInstance,
  annotations: SongAnnotation[],
  config: RandomEffectsConfig = {}
) {
  const { transitionDuration = 100 } = config;
  let currentTransitionCleanup: (() => void) | null = null;

  annotations.forEach((annotation, index) => {
    const delay = annotation.getTime() * 100; // Convert to milliseconds

    setTimeout(() => {
      const randomConfig = generateRandomConfig(config);

      if (currentTransitionCleanup) {
        currentTransitionCleanup();
      }

      currentTransitionCleanup = transitionToConfig(graph, randomConfig, {
        duration: transitionDuration,
        onComplete: () =>
          console.log(`Transition complete for annotation ${index + 1}`),
      });
    }, delay);
  });
}

// Example usage:
/*
const annotations = [
  new SongAnnotation("anno1", { time: 1.5, text: "First mark", description: "Beginning of verse", tags: new Set(["verse", "start"]), type: "annotation" }),
  new SongAnnotation("anno2", { time: 4.2, text: "Second mark", description: "Chorus starts", tags: new Set(["chorus", "hook"]), type: "annotation" }),
  // ...more annotations
];

applyRandomEffects(forceGraphInstance, annotations, {
  minNodeSize: 2,
  maxNodeSize: 15,
  minLinkWidth: 1,
  maxLinkWidth: 10,
  minOpacity: 0.2,
  maxOpacity: 1,
  transitionDuration: 1000,
});
*/
