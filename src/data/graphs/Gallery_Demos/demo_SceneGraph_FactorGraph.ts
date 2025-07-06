import { PresetLayoutType } from "../../../core/layouts/layoutEngineTypes";
import { Graph } from "../../../core/model/Graph";
import { SceneGraph } from "../../../core/model/SceneGraph";

/**
 * Creates a Graph representing a factor graph
 * Factor graphs have two types of nodes:
 * - Variable nodes (typically represented as circles)
 * - Factor nodes (typically represented as squares)
 */
const createGraph = (): Graph => {
  const tmp = new SceneGraph();
  const g = tmp.getGraph();

  // Create variable nodes (typically represented as circles)
  const x1 = g.createNode({
    id: "X1",
    type: "variable",
    label: "X₁",
    position: { x: 250, y: 50, z: 0 },
    color: "rgb(100, 150, 255)",
    dimensions: { width: 25, height: 25 },
    size: 1.5,
    fontColor: "rgb(0, 0, 0)", // Optional font color for labels
    shape: "circle",
    borderWidth: 2,
    borderColor: "rgb(255, 197, 6)",
  });

  const x2 = g.createNode({
    id: "X2",
    type: "variable",
    label: "X₂",
    position: { x: 250, y: 150, z: 0 },
    color: "rgb(100, 150, 255)",
    dimensions: { width: 25, height: 25 },
    size: 1.5,
    fontColor: "rgb(0, 0, 0)", // Optional font color for labels
    shape: "circle",
    borderWidth: 2,
    borderColor: "rgb(255, 197, 6)",
  });

  const x3 = g.createNode({
    id: "X3",
    type: "variable",
    label: "X₃",
    position: { x: 50, y: 150, z: 0 },
    color: "rgb(100, 150, 255)",
    dimensions: { width: 25, height: 25 },
    size: 1.5,
    fontColor: "rgb(0, 0, 0)", // Optional font color for labels
    shape: "circle",
    borderWidth: 2,
    borderColor: "rgb(255, 197, 6)",
  });

  // Create factor nodes (typically represented as squares)
  const f1 = g.createNode({
    id: "f1",
    type: "factor",
    label: "f₁",
    position: { x: 150, y: 50, z: 0 },
    color: "rgb(255, 150, 100)",
    dimensions: { width: 25, height: 25 },
    size: 1.2,
    fontColor: "rgb(0, 0, 0)", // Optional font color for labels
    shape: "square",
    borderWidth: 2,
    borderColor: "rgb(255, 197, 6)",
  });

  const f2 = g.createNode({
    id: "f2",
    type: "factor",
    label: "f₂",
    position: { x: 150, y: 100, z: 0 },
    color: "rgb(255, 150, 100)",
    dimensions: { width: 25, height: 25 },
    size: 1.2,
    fontColor: "rgb(0, 0, 0)", // Optional font color for labels
    shape: "square",
    borderWidth: 2,
    borderColor: "rgb(255, 197, 6)",
  });

  const f3 = g.createNode({
    id: "f3",
    type: "factor",
    label: "f₃",
    position: { x: 250, y: 100, z: 0 },
    color: "rgb(255, 150, 100)",
    dimensions: { width: 25, height: 25 },
    size: 1.2,
    fontColor: "rgb(0, 0, 0)", // Optional font color for labels
    shape: "square",
    borderWidth: 2,
    borderColor: "rgb(255, 197, 6)",
  });

  const f4 = g.createNode({
    id: "f4",
    type: "factor",
    label: "f₄",
    position: { x: 150, y: 150, z: 0 },
    color: "rgb(255, 150, 100)",
    dimensions: { width: 25, height: 25 },
    size: 1.2,
    fontColor: "rgb(0, 0, 0)", // Optional font color for labels
    shape: "square",
    borderWidth: 2,
    borderColor: "rgb(255, 197, 6)",
  });

  // Create edges connecting factors to variables
  // f₁ connections
  g.createEdgeIfMissing(f1.getId(), x1.getId(), {
    id: "f1-X1",
    type: "factor-variable",
  });

  // f₂ connections
  g.createEdgeIfMissing(f2.getId(), x1.getId(), {
    id: "f2-X1",
    type: "factor-variable",
  });
  g.createEdgeIfMissing(f2.getId(), x2.getId(), {
    id: "f2-X2",
    type: "factor-variable",
  });

  // f₃ connections
  g.createEdgeIfMissing(f3.getId(), x1.getId(), {
    id: "f3-X1",
    type: "factor-variable",
  });

  // f₃ connections
  g.createEdgeIfMissing(f3.getId(), x2.getId(), {
    id: "f3-X2",
    type: "factor-variable",
  });

  // f₄ connections
  g.createEdgeIfMissing(f4.getId(), x3.getId(), {
    id: "f4-X3",
    type: "factor-variable",
  });
  g.createEdgeIfMissing(f4.getId(), x2.getId(), {
    id: "f4-X2",
    type: "factor-variable",
  });

  return g;
};

/**
 * Creates a SceneGraph representing a factor graph
 */
export const createFactorGraphSceneGraph = async (): Promise<SceneGraph> => {
  return new SceneGraph({
    graph: createGraph(),
    metadata: {
      name: "FactorGraph",
      description:
        "A demonstration of a factor graph with variables and factors.",
    },
    defaultAppConfig: {
      activeView: "ForceGraph3d",
      activeSceneGraph: "FactorGraph",
      windows: {
        showEntityDataCard: false,
      },
      forceGraph3dOptions: {
        layout: "Layout",
      },
      activeLayout: PresetLayoutType.NodePositions, // Use the positions we defined
      legendMode: "type",
      activeFilter: null,
    },
    forceGraphDisplayConfig: {
      nodeTextLabels: true,
      nodeSize: 3,
      nodeOpacity: 1,
      linkTextLabels: false,
      linkWidth: 1.5,
      linkOpacity: 1,
      chargeStrength: -30,
      backgroundColor: "rgba(211, 211, 211, 1)",
      fontSize: 25, // Default font size for labels
    },
    displayConfig: {
      mode: "type",
      nodeConfig: {
        types: {
          factor: { color: "rgb(255, 150, 100)", isVisible: true },
          variable: { color: "rgb(100, 150, 255)", isVisible: true },
        },
        tags: {},
      },
      edgeConfig: { types: {}, tags: {} },
      nodePositions: {},
    },
  });
};

// Export the function to create the factor graph
export const demo_SceneGraph_FactorGraph = async () =>
  await createFactorGraphSceneGraph();

export default demo_SceneGraph_FactorGraph;
