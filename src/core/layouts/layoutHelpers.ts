import Graph from "graphology";
import { ObjectOf } from "../../App";
import { SceneGraph } from "../model/SceneGraph";

export type Position = { x: number; y: number; z?: number };
export type NodePositionData = ObjectOf<Position>;

export const translateToPositiveCoordinates = (
  positions: NodePositionData
): NodePositionData => {
  const translatedPositions: NodePositionData = {};
  const minX = Math.min(...Object.values(positions).map((pos) => pos.x));
  const minY = Math.min(...Object.values(positions).map((pos) => pos.y));
  const minZ = Math.min(...Object.values(positions).map((pos) => pos?.z ?? 0));

  Object.entries(positions).forEach(([id, pos]) => {
    translatedPositions[id] = {
      x: pos.x - minX,
      y: pos.y - minY,
      z: pos.z ? pos.z - minZ : 0,
    };
  });

  return translatedPositions;
};

export const translateCoordinates = (
  positions: NodePositionData,
  offsetX: number,
  offsetY: number
): NodePositionData => {
  const translatedPositions: NodePositionData = {};

  Object.entries(positions).forEach(([id, pos]) => {
    translatedPositions[id] = {
      x: pos.x + offsetX,
      y: pos.y + offsetY,
      z: pos?.z ?? 0,
    };
  });

  return translatedPositions;
};

export function createGraphologyGraph(sceneGraph: SceneGraph): Graph {
  const graph = new Graph();

  // Add nodes
  sceneGraph
    .getGraph()
    .getNodes()
    .forEach((node) => {
      graph.addNode(node.getId(), {
        type: node.getType(),
      });
    });

  // Add edges
  sceneGraph
    .getGraph()
    .getEdges()
    .forEach((edge) => {
      graph.addEdge(edge.getSource(), edge.getTarget(), {
        type: edge.getType(),
      });
    });

  return graph;
}

export function normalizePositions(
  positions: NodePositionData,
  scale = 10
): NodePositionData {
  // Find bounds
  let minX = Infinity,
    minY = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity;
  let minZ = -Infinity,
    maxZ = Infinity;

  Object.values(positions).forEach((pos) => {
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x);
    maxY = Math.max(maxY, pos.y);
    minZ = Math.min(minX, pos?.z ?? 0);
    maxZ = Math.max(maxX, pos?.z ?? 0);
  });

  // // Scale factor for normalization (keeping aspect ratio)
  // const width = maxX - minX;
  // const height = maxY - minY;
  // const scale = Math.min(1000 / width, 800 / height);

  // Normalize
  const normalized: NodePositionData = {};
  Object.entries(positions).forEach(([id, pos]) => {
    normalized[id] = {
      x: (pos.x - minX) * scale,
      y: (pos.y - minY) * scale,
      z: pos.z ? (pos.z - minZ) * scale : 0,
    };
  });

  console.log("NORMALIZED POSITIONS ARE", normalized);

  return normalized;
}

export function scalePositions(
  positions: NodePositionData,
  width: number,
  height: number
): NodePositionData {
  const scaled: NodePositionData = {};
  Object.entries(positions).forEach(([id, pos]) => {
    scaled[id] = {
      x: pos.x * (width / 1000),
      y: pos.y * (height / 800),
      z: pos.z !== undefined ? pos.z * (width / 1000) : 0,
    };
  });
  return scaled;
}

export function centerPositions(positions: NodePositionData): NodePositionData {
  // Calculate center of graph
  let sumX = 0,
    sumY = 0,
    sumZ = 0;
  const nodes = Object.values(positions);
  nodes.forEach((pos) => {
    sumX += pos.x;
    sumY += pos.y;
    sumZ += pos.z ?? 0;
  });

  const centerX = sumX / nodes.length;
  const centerY = sumY / nodes.length;
  const centerZ = sumZ / nodes.length;

  // Center the graph
  const centered: NodePositionData = {};
  Object.entries(positions).forEach(([id, pos]) => {
    centered[id] = {
      x: pos.x - centerX,
      y: pos.y - centerY,
      z: pos.z !== undefined ? pos.z - centerZ : 0,
    };
  });
  console.log("centered", centered);
  return centered;
}

export function fitToRect(
  width: number,
  height: number,
  positions: NodePositionData
): NodePositionData {
  // If no positions, return empty object
  if (Object.keys(positions).length === 0) {
    return {};
  }

  // Find current bounds
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  Object.values(positions).forEach((pos) => {
    minX = Math.min(minX, pos.x);
    maxX = Math.max(maxX, pos.x);
    minY = Math.min(minY, pos.y);
    maxY = Math.max(maxY, pos.y);
  });

  // Calculate current dimensions and scale factors
  const currentWidth = maxX - minX;
  const currentHeight = maxY - minY;

  // Handle edge cases where current dimensions are 0
  if (currentWidth === 0 && currentHeight === 0) {
    return positions; // Return original positions if all nodes are at same point
  }

  // Calculate scale factors, accounting for potential 0 dimensions
  const scaleX = currentWidth === 0 ? 1 : width / currentWidth;
  const scaleY = currentHeight === 0 ? 1 : height / currentHeight;

  // Use the smaller scale to maintain aspect ratio
  const scale = Math.min(scaleX, scaleY);

  // Calculate centering offsets
  const scaledWidth = currentWidth * scale;
  const scaledHeight = currentHeight * scale;
  const offsetX = (width - scaledWidth) / 2;
  const offsetY = (height - scaledHeight) / 2;

  // Create new positions object
  const newPositions: NodePositionData = {};

  Object.entries(positions).forEach(([key, pos]) => {
    newPositions[key] = {
      x: (pos.x - minX) * scale + offsetX,
      y: (pos.y - minY) * scale + offsetY,
      ...(pos.z !== undefined ? { z: pos.z } : {}),
    };
  });

  return newPositions;
}
