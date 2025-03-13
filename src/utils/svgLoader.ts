import { AppConfig } from "../AppConfig";
import { GET_DEFAULT_RENDERING_CONFIG } from "../controllers/RenderingManager";
import { IForceGraphRenderConfig } from "../core/force-graph/createForceGraph";
import { PresetLayoutType } from "../core/layouts/LayoutEngine";
import { NodePositionData } from "../core/layouts/layoutHelpers";
import { Graph } from "../core/model/Graph";
import { ISceneGraphMetadata, SceneGraph } from "../core/model/SceneGraph";

/**
 * Utility function to load SVG from a URL
 */
export async function loadSvgFromUrl(
  url: string,
  options?: any
): Promise<SceneGraph> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load SVG from URL: ${url}`);
    }

    const svgContent = await response.text();
    return loadSvgToSceneGraph(svgContent, {
      metadata: { source: url },
      ...options,
    });
  } catch (error) {
    console.error("Error loading SVG from URL:", error);
    throw error;
  }
}

export interface ILoadSvgToSceneGraphOptions {
  forceGraphDisplayConfig?: IForceGraphRenderConfig;
  appConfig?: AppConfig;
  metadata?: ISceneGraphMetadata;
}

/**
 * Parse an SVG file and create a SceneGraph from it.
 * Extracts circles and group elements as nodes and lines as edges.
 * @param svgContent The SVG content as a string
 * @returns A SceneGraph representing the SVG
 */
export const loadSvgToSceneGraph = (
  svgContent: string,
  options?: ILoadSvgToSceneGraphOptions
): SceneGraph => {
  const graph = new Graph();
  const nodePositions: NodePositionData = {};

  const nodes: { id: string; cx: number; cy: number }[] = [];

  // Parse the SVG using a lightweight approach
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");

  // Extract group elements (nodes)
  const groupElements = svgDoc.querySelectorAll("g");
  Array.from(groupElements).forEach((group, index) => {
    const id = group.getAttribute("id") || `group_${index}`;
    const style = group.getAttribute("style");
    const fillMatch = style?.match(/fill:\s*([^;]+)/);
    const fill = fillMatch ? fillMatch[1] : "#ff0000";

    // Extract circles within the group
    const groupCircles = group.querySelectorAll("circle");
    Array.from(groupCircles).forEach((circle, circleIndex) => {
      const circleId = circle.getAttribute("id") || `${id}_node_${circleIndex}`;
      const cx = parseFloat(circle.getAttribute("cx") || "0");
      const cy = parseFloat(circle.getAttribute("cy") || "0");
      const r = parseFloat(circle.getAttribute("r") || "1");

      // Create node in graph
      graph.createNode(circleId, {
        label: circleId,
        type: fill,
        color: fill,
        position: { x: cx / 10, y: cy / 10, z: 0 }, // Scale down for better visualization
      });

      // Store position
      nodePositions[circleId] = {
        x: cx / 10, // Scale down for better visualization
        y: cy / 10,
        z: 0,
      };

      nodes.push({ id: circleId, cx, cy });
    });
  });

  // Extract edges from <g> elements
  Array.from(groupElements).forEach((group) => {
    const stroke =
      group.getAttribute("style")?.match(/stroke:\s*([^;]+)/)?.[1] || "#000000";
    const lines = group.querySelectorAll("line");

    Array.from(lines).forEach((line, index) => {
      const x1 = parseFloat(line.getAttribute("x1") || "0");
      const y1 = parseFloat(line.getAttribute("y1") || "0");
      const x2 = parseFloat(line.getAttribute("x2") || "0");
      const y2 = parseFloat(line.getAttribute("y2") || "0");

      // Find source and target nodes by position
      const sourceNode = findClosestNode(nodes, x1, y1);
      const targetNode = findClosestNode(nodes, x2, y2);

      if (sourceNode && targetNode && sourceNode !== targetNode) {
        const edgeId = `edge_${index}`;
        graph.createEdge(sourceNode, targetNode, {
          type: stroke,
        });
      }
    });
  });

  // Create and return the scene graph
  return new SceneGraph({
    graph,
    displayConfig: { ...GET_DEFAULT_RENDERING_CONFIG(graph), nodePositions },
    metadata: {
      name: "SVG Import: E8 Petrie Projection",
      description: "Imported from SVG file showing the E8 Petrie projection",
      ...options?.metadata,
    },
    forceGraphDisplayConfig: {
      nodeTextLabels: false,
      nodeSize: 0.2,
      nodeOpacity: 0.7,
      linkTextLabels: false,
      linkWidth: 0,
      linkOpacity: 0.4,
      chargeStrength: -30,
      ...options?.forceGraphDisplayConfig,
    },
    defaultAppConfig: {
      activeView: "ForceGraph3d",
      activeSceneGraph: "attempt2",
      windows: {
        showLegendBars: true,
        showOptionsPanel: true,
        showGraphLayoutToolbar: true,
        showEntityDataCard: false,
      },
      forceGraph3dOptions: {
        layout: "Layout",
        showOptionsPanel: false,
      },
      activeLayout: PresetLayoutType.NodePositions,
      ...options?.appConfig,
    },
  });
};

/**
 * Find the closest node to the given coordinates
 */
function findClosestNode(nodes: any[], x: number, y: number): string | null {
  let closestNode = null;
  let minDistance = Infinity;

  for (const node of nodes) {
    const distance = Math.sqrt(
      Math.pow(node.cx - x, 2) + Math.pow(node.cy - y, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestNode = node.id;
    }
  }

  return closestNode;
}
