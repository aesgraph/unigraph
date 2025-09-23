import { ForceGraph3DInstance } from "3d-force-graph";
import { IForceGraphRenderConfig } from "../../store/forceGraphConfigStore";
import { SongAnnotation } from "../mp3/SongAnnotation";
import { transitionToConfig } from "./transition";

interface StaggeredEffectsConfig {
  minNodeSize?: number;
  maxNodeSize?: number;
  minLinkWidth?: number;
  maxLinkWidth?: number;
  minOpacity?: number;
  maxOpacity?: number;
  nodeSizeTransitionDuration?: number;
  linkWidthTransitionDuration?: number;
  nodeOpacityTransitionDuration?: number;
  linkOpacityTransitionDuration?: number;
}

function generateRandomConfig(
  config: StaggeredEffectsConfig
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

export function applyStaggeredEffects(
  graph: ForceGraph3DInstance,
  annotations: SongAnnotation[],
  config: StaggeredEffectsConfig = {}
) {
  const {
    nodeSizeTransitionDuration = 1000,
    linkWidthTransitionDuration = 1000,
    nodeOpacityTransitionDuration = 1000,
    linkOpacityTransitionDuration = 1000,
  } = config;
  let currentTransitionCleanup: (() => void) | null = null;

  annotations.forEach((annotation, index) => {
    const delay = annotation.getTime() * 1000; // Convert to milliseconds

    setTimeout(() => {
      const randomConfig = generateRandomConfig(config);

      if (currentTransitionCleanup) {
        currentTransitionCleanup();
      }

      // Apply node size transition
      currentTransitionCleanup = transitionToConfig(
        graph,
        {
          nodeSize: randomConfig.nodeSize,
          nodeOpacity: graph.nodeOpacity(),
          linkWidth: graph.linkWidth() as number,
          linkOpacity: graph.linkOpacity(),
          chargeStrength: graph.d3Force("charge")?.strength() || -30,
          nodeTextLabels: false,
          linkTextLabels: false,
        },
        {
          duration: nodeSizeTransitionDuration,
          onComplete: () =>
            console.log(
              `Node size transition complete for annotation ${index + 1}`
            ),
        }
      );

      // Apply link width transition
      setTimeout(() => {
        currentTransitionCleanup = transitionToConfig(
          graph,
          {
            nodeSize: graph.nodeRelSize(),
            nodeOpacity: graph.nodeOpacity(),
            linkWidth: randomConfig.linkWidth,
            linkOpacity: graph.linkOpacity(),
            chargeStrength: graph.d3Force("charge")?.strength() || -30,
            nodeTextLabels: false,
            linkTextLabels: false,
          },
          {
            duration: linkWidthTransitionDuration,
            onComplete: () =>
              console.log(
                `Link width transition complete for annotation ${index + 1}`
              ),
          }
        );
      }, nodeSizeTransitionDuration);

      // Apply node opacity transition
      setTimeout(() => {
        currentTransitionCleanup = transitionToConfig(
          graph,
          {
            nodeSize: graph.nodeRelSize(),
            nodeOpacity: randomConfig.nodeOpacity,
            linkWidth: graph.linkWidth() as number,
            linkOpacity: graph.linkOpacity(),
            chargeStrength: graph.d3Force("charge")?.strength() || -30,
            nodeTextLabels: false,
            linkTextLabels: false,
          },
          {
            duration: nodeOpacityTransitionDuration,
            onComplete: () =>
              console.log(
                `Node opacity transition complete for annotation ${index + 1}`
              ),
          }
        );
      }, nodeSizeTransitionDuration + linkWidthTransitionDuration);

      // Apply link opacity transition
      setTimeout(
        () => {
          currentTransitionCleanup = transitionToConfig(
            graph,
            {
              nodeSize: graph.nodeRelSize(),
              nodeOpacity: graph.nodeOpacity(),
              linkWidth: graph.linkWidth() as number,
              linkOpacity: randomConfig.linkOpacity,
              chargeStrength: graph.d3Force("charge")?.strength() || -30,
              nodeTextLabels: false,
              linkTextLabels: false,
            },
            {
              duration: linkOpacityTransitionDuration,
              onComplete: () =>
                console.log(
                  `Link opacity transition complete for annotation ${index + 1}`
                ),
            }
          );
        },
        nodeSizeTransitionDuration +
          linkWidthTransitionDuration +
          nodeOpacityTransitionDuration
      );
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

applyStaggeredEffects(forceGraphInstance, annotations, {
  minNodeSize: 2,
  maxNodeSize: 15,
  minLinkWidth: 1,
  maxLinkWidth: 10,
  minOpacity: 0.2,
  maxOpacity: 1,
  nodeSizeTransitionDuration: 1000,
  linkWidthTransitionDuration: 1000,
  nodeOpacityTransitionDuration: 1000,
  linkOpacityTransitionDuration: 1000,
});
*/
