import { IForceGraphRenderConfig } from "../../store/forceGraphConfigStore";
import { SongAnnotationData } from "../mp3/SongAnnotation";
import { TimedConfig } from "./configSequencePlayer";

interface ConfigGeneratorOptions {
  minNodeSize: number;
  maxNodeSize: number;
  minLinkWidth: number;
  maxLinkWidth: number;
  minOpacity: number;
  maxOpacity: number;
  minCharge: number;
  maxCharge: number;
  transitionDuration: number;
  showLabels: boolean;
}

type ConfigGeneratorArgs = Partial<ConfigGeneratorOptions>;

const DEFAULT_OPTIONS: ConfigGeneratorOptions = {
  minNodeSize: 2,
  maxNodeSize: 15,
  minLinkWidth: 1,
  maxLinkWidth: 8,
  minOpacity: 0.2,
  maxOpacity: 1,
  minCharge: -200,
  maxCharge: -30,
  transitionDuration: 1000,
  showLabels: false,
};

function generateRandomConfig(
  options: ConfigGeneratorArgs = {}
): IForceGraphRenderConfig {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // Helper for random range
  const random = (min: number, max: number) =>
    min! + Math.random() * (max! - min!);

  return {
    nodeSize: random(config.minNodeSize, config.maxNodeSize),
    nodeOpacity: random(config.minOpacity, config.maxOpacity),
    linkWidth: random(config.minLinkWidth, config.maxLinkWidth),
    linkOpacity: random(config.minOpacity, config.maxOpacity),
    chargeStrength: random(config.minCharge, config.maxCharge),
    nodeTextLabels: false,
    linkTextLabels: false,
  };
}

export function generateConfigsFromAnnotations(
  annotations: SongAnnotationData[],
  options: ConfigGeneratorArgs = {}
): TimedConfig[] {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };

  // Sort annotations by time
  const sortedAnnotations = [...annotations].sort((a, b) => a.time - b.time);

  // Generate a config for each annotation
  return sortedAnnotations.map((annotation) => {
    // Generate different configs based on annotation tags
    const config = generateRandomConfig(finalOptions);

    // Optional: Modify config based on specific tags
    if (annotation.tags.has("tag1")) {
      config.nodeSize = 0.5;
      config.nodeOpacity = 1;
      config.linkWidth = 1;
      config.linkOpacity = 0.5;
      config.chargeStrength = -50;
    }
    if (annotation.tags.has("tag2")) {
      config.nodeSize = 1;
      config.nodeOpacity = 0.2;
      config.linkWidth = 0.2;
      config.linkOpacity = 0.7;
      config.chargeStrength = 1;
    }
    if (annotation.tags.has("tag3")) {
      config.nodeSize = 3;
      config.nodeOpacity = 0.1;
      config.linkWidth = 1;
      config.linkOpacity = 0.8;
      config.chargeStrength = -30;
    }
    if (annotation.tags.has("tag4")) {
      config.nodeSize = 0.5;
      config.nodeOpacity = 1;
      config.linkWidth = 1;
      config.linkOpacity = 0.5;
      config.chargeStrength = -20;
    }

    return {
      time: annotation.time * 1000, // Convert to milliseconds
      config,
      duration: finalOptions.transitionDuration,
    };
  });
}

// Example usage:
/*
const configs = generateConfigsFromAnnotations(annotations, {
  minNodeSize: 3,
  maxNodeSize: 12,
  minOpacity: 0.3,
  maxOpacity: 0.9,
  transitionDuration: 800
});

playConfigSequence(forceGraphInstance, configs, {
  loop: true,
  interval: 50
});
*/
