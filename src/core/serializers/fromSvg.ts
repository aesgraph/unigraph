import { v4 as uuidv4 } from "uuid";
import { SceneGraph } from "../model/SceneGraph";

interface Point {
  x: number;
  y: number;
}

interface PathData {
  start: Point;
  end: Point;
}

const parseTransform = (transform: string | null): { x: number; y: number } => {
  if (!transform) return { x: 0, y: 0 };
  const match = transform.match(/translate\(([-\d.]+)\s*([-\d.]+)\)/);
  if (match) {
    return {
      x: parseFloat(match[1]) || 0,
      y: parseFloat(match[2]) || 0,
    };
  }
  return { x: 0, y: 0 };
};

const parseSvgPath = (d: string, transform: string | null): PathData | null => {
  const commands = d.match(/[a-zA-Z][^a-zA-Z]*/g) || [];
  let currentX = 0,
    currentY = 0;
  let start: Point | null = null;
  let end: Point | null = null;
  const trans = parseTransform(transform);

  for (const cmd of commands) {
    const type = cmd[0];
    const coords = cmd
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(Number);

    if (type === "M" || type === "m") {
      if (type === "M") {
        currentX = coords[0] + trans.x;
        currentY = coords[1] + trans.y;
      } else {
        currentX += coords[0];
        currentY += coords[1];
      }
      start = { x: currentX, y: currentY };
    } else if (type === "L" || type === "l") {
      if (type === "L") {
        currentX = coords[0] + trans.x;
        currentY = coords[1] + trans.y;
      } else {
        currentX += coords[0];
        currentY += coords[1];
      }
      end = { x: currentX, y: currentY };
    }
  }

  if (start && end) {
    return { start, end };
  }
  return null;
};

const findOrCreateNode = (
  point: Point,
  nodes: Map<string, string>,
  sceneGraph: SceneGraph,
  tolerance: number = 1
): string => {
  // Check if a node already exists at this position (within tolerance)
  for (const [key, nodeId] of nodes.entries()) {
    const pos = JSON.parse(key);
    if (
      Math.abs(pos.x - point.x) < tolerance &&
      Math.abs(pos.y - point.y) < tolerance
    ) {
      return nodeId;
    }
  }

  // Create new node if none exists
  const nodeId = uuidv4();
  nodes.set(JSON.stringify(point), nodeId);
  sceneGraph.getGraph().createNode(nodeId, {
    type: "svgNode",
    position: { x: point.x, y: point.y, z: 0 },
    tags: new Set(["svg"]),
  });

  return nodeId;
};

export const deserializeSvgToSceneGraph = (svgContent: string): SceneGraph => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, "image/svg+xml");
  const sceneGraph = new SceneGraph();
  const nodes = new Map<string, string>();

  // Process all path elements
  const paths = doc.getElementsByTagName("path");
  let edgeCount = 0;

  for (const path of Array.from(paths)) {
    const pathD = path.getAttribute("d");
    const transform = path.getAttribute("transform");
    if (!pathD) continue;

    const pathData = parseSvgPath(pathD, transform);
    if (pathData) {
      const sourceId = findOrCreateNode(pathData.start, nodes, sceneGraph);
      const targetId = findOrCreateNode(pathData.end, nodes, sceneGraph);

      if (sourceId && targetId) {
        sceneGraph.getGraph().createEdgeIfMissing(sourceId, targetId, {
          type: "svgEdge",
          tags: new Set(["svg"]),
          userData: {
            color: path.getAttribute("stroke") || "#ffffff",
            style: path.getAttribute("style") || "",
          },
        });
        edgeCount++;
      }
    }
  }

  // Configure display properties
  sceneGraph.getDisplayConfig().nodeConfig.types["svgNode"] = {
    color: "#ffff00",
    isVisible: true,
  };

  sceneGraph.getDisplayConfig().edgeConfig.types["svgEdge"] = {
    color: "#4444ff",
    isVisible: true,
  };

  sceneGraph.setMetadata({
    name: "SVG Import",
    description: `Imported from SVG (${nodes.size} vertices, ${edgeCount} edges)`,
  });

  return sceneGraph;
};
