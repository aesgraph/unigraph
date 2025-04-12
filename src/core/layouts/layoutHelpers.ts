import Graph from "graphology";
import { ObjectOf } from "../../App";
import { EntitiesContainer } from "../model/entity/entitiesContainer";
import { Graph as MGraph } from "../model/Graph";
import { Node, NodeId } from "../model/Node";

export type Position = { x: number; y: number; z?: number };
export type Dimensions = { width: number; height: number }; //for now this is 2d only
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

export function createGraphologyGraph(graph: MGraph): Graph {
  const graphologyGraph = new Graph();

  // Add nodes
  graph.getNodes().forEach((node) => {
    graphologyGraph.addNode(node.getId(), {
      type: node.getType(),
    });
  });

  // Add edges
  graph.getEdges().forEach((edge) => {
    graphologyGraph.addEdge(edge.getSource(), edge.getTarget(), {
      type: edge.getType(),
    });
  });

  return graphologyGraph;
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
    _maxZ = Infinity;

  Object.values(positions).forEach((pos) => {
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x);
    maxY = Math.max(maxY, pos.y);
    minZ = Math.min(minX, pos?.z ?? 0);
    _maxZ = Math.max(maxX, pos?.z ?? 0);
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

export const scalePositionsByFactor = (
  positions: NodePositionData,
  scaleFactor: number
): NodePositionData => {
  const scaled: NodePositionData = {};
  Object.entries(positions).forEach(([id, pos]) => {
    scaled[id] = {
      x: pos.x * scaleFactor,
      y: pos.y * scaleFactor,
      z: pos.z !== undefined ? pos.z * scaleFactor : 0,
    };
  });
  return scaled;
};

export const centerPositionsAroundPoint = (
  positions: NodePositionData,
  centerPoint: { x: number; y: number; z?: number }
): NodePositionData => {
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
  const offsetX = centerPoint.x - centerX;
  const offsetY = centerPoint.y - centerY;
  const offsetZ = centerPoint.z !== undefined ? centerPoint.z - centerZ : 0;
  const centered: NodePositionData = {};
  Object.entries(positions).forEach(([id, pos]) => {
    centered[id] = {
      x: pos.x + offsetX,
      y: pos.y + offsetY,
      z: pos.z !== undefined ? pos.z + offsetZ : 0,
    };
  });
  return centered;
};

export const getCenterPointOfNodes = (
  nodes: EntitiesContainer<NodeId, Node>
) => {
  let sumX = 0,
    sumY = 0,
    sumZ = 0;
  nodes.forEach((node) => {
    sumX += node.getPosition().x;
    sumY += node.getPosition().y;
    sumZ += node.getPosition().z ?? 0;
  });
  const centerX = sumX / nodes.size();
  const centerY = sumY / nodes.size();
  const centerZ = sumZ / nodes.size();

  return { x: centerX, y: centerY, z: centerZ };
};

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
