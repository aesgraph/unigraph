import { DEFAULT_WORKSPACE_CONFIG } from "../../../AppConfig";
import { PresetLayoutType } from "../../../core/layouts/layoutEngineTypes";
import { Graph } from "../../../core/model/Graph";
import { SceneGraph } from "../../../core/model/SceneGraph";
import { DEFAULT_INTERACTIVITY_FLAGS } from "./../../../AppConfig";

/**
 * Creates a Graph representing a factor graph
 * Factor graphs have two types of nodes:
 * - Variable nodes (typically represented as circles)
 * - Factor nodes (typically represented as squares)
 */
const createGraph = (): Graph => {
  const tmp = new SceneGraph();
  const g = tmp.getGraph();

  // Grid layout settings
  const gridSpacing = 100;
  const rowsCount = 4;
  const colsCount = 5;

  // Create variable nodes in a grid pattern
  const variables: { [key: string]: any } = {};
  for (let row = 0; row < rowsCount; row++) {
    for (let col = 0; col < colsCount; col++) {
      const id = `X${row * colsCount + col + 1}`;
      const label = `X${row * colsCount + col + 1}`;
      const x = col * gridSpacing + 50;
      const y = row * gridSpacing + 50;

      variables[id] = g.createNode({
        id,
        type: "variable",
        label,
        position: { x, y, z: 0 },
        color: "rgb(100, 150, 255)",
        dimensions: { width: 16, height: 16 },
        size: 1.5,
        fontColor: "rgb(0, 0, 0)",
        shape: "circle",
        borderWidth: 2,
        borderColor: "rgb(255, 197, 6)",
      });
    }
  }

  // Create factor nodes between variables
  const factors: { [key: string]: any } = {};
  let factorCount = 1;

  // Horizontal factors (connecting variables in the same row)
  for (let row = 0; row < rowsCount; row++) {
    for (let col = 0; col < colsCount - 1; col++) {
      const id = `f${factorCount}`;
      const label = `f${factorCount}`;
      const x = col * gridSpacing + gridSpacing / 2 + 50;
      const y = row * gridSpacing + 50;

      factors[id] = g.createNode({
        id,
        type: "factor",
        label,
        position: { x, y, z: 0 },
        color: "rgb(255, 150, 100)",
        dimensions: { width: 16, height: 16 },
        size: 1.2,
        fontColor: "rgb(0, 0, 0)",
        shape: "square",
        borderWidth: 2,
        borderColor: "rgb(255, 197, 6)",
      });

      // Connect to the variables to the left and right
      const leftVar = `X${row * colsCount + col + 1}`;
      const rightVar = `X${row * colsCount + col + 2}`;

      g.createEdgeIfMissing(id, leftVar, {
        id: `${id}-${leftVar}`,
        type: "factor-variable",
      });

      g.createEdgeIfMissing(id, rightVar, {
        id: `${id}-${rightVar}`,
        type: "factor-variable",
      });

      factorCount++;
    }
  }

  // Vertical factors (connecting variables in the same column)
  for (let col = 0; col < colsCount; col++) {
    for (let row = 0; row < rowsCount - 1; row++) {
      const id = `f${factorCount}`;
      const label = `f${factorCount}`;
      const x = col * gridSpacing + 50;
      const y = row * gridSpacing + gridSpacing / 2 + 50;

      factors[id] = g.createNode({
        id,
        type: "factor",
        label,
        position: { x, y, z: 0 },
        color: "rgb(255, 150, 100)",
        dimensions: { width: 16, height: 16 },
        size: 1.2,
        fontColor: "rgb(0, 0, 0)",
        shape: "square",
        borderWidth: 2,
        borderColor: "rgb(255, 197, 6)",
      });

      // Connect to the variables above and below
      const topVar = `X${row * colsCount + col + 1}`;
      const bottomVar = `X${(row + 1) * colsCount + col + 1}`;

      g.createEdgeIfMissing(id, topVar, {
        id: `${id}-${topVar}`,
        type: "factor-variable",
      });

      g.createEdgeIfMissing(id, bottomVar, {
        id: `${id}-${bottomVar}`,
        type: "factor-variable",
      });

      factorCount++;
    }
  }

  // Add some diagonal connections for more complexity
  for (let row = 0; row < rowsCount - 1; row++) {
    for (let col = 0; col < colsCount - 1; col++) {
      if ((row + col) % 2 === 0) {
        // Only add diagonal factors for some positions
        const id = `f${factorCount}`;
        const label = `f${factorCount}`;
        const x = col * gridSpacing + gridSpacing / 2 + 50;
        const y = row * gridSpacing + gridSpacing / 2 + 50;

        factors[id] = g.createNode({
          id,
          type: "factor",
          label,
          position: { x, y, z: 0 },
          color: "rgb(255, 150, 100)",
          dimensions: { width: 16, height: 16 },
          size: 1.2,
          fontColor: "rgb(0, 0, 0)",
          shape: "square",
          borderWidth: 2,
          borderColor: "rgb(255, 197, 6)",
        });

        // Connect to the variables at diagonal corners
        const topLeftVar = `X${row * colsCount + col + 1}`;
        const bottomRightVar = `X${(row + 1) * colsCount + col + 2}`;

        g.createEdgeIfMissing(id, topLeftVar, {
          id: `${id}-${topLeftVar}`,
          type: "factor-variable",
        });

        g.createEdgeIfMissing(id, bottomRightVar, {
          id: `${id}-${bottomRightVar}`,
          type: "factor-variable",
        });

        factorCount++;
      }
    }
  }

  return g;
};

/**
 * Creates a SceneGraph representing a factor graph
 */
export const createFactorGraphSceneGraph = async (): Promise<SceneGraph> => {
  return new SceneGraph({
    graph: createGraph(),
    metadata: {
      name: "FactorGraphComplex",
      description:
        "An expanded factor graph with many variables and factors in a grid layout.",
    },
    defaultAppConfig: {
      activeView: "ForceGraph3d",
      activeSceneGraph: "FactorGraphComplex",
      windows: {
        showEntityDataCard: false,
      },
      forceGraph3dOptions: {
        layout: "Layout",
      },
      activeLayout: PresetLayoutType.NodePositions, // Use the positions we defined
      legendMode: "type",
      activeFilter: null,
      workspaceConfig: {
        ...DEFAULT_WORKSPACE_CONFIG(),
        hideAll: true,
      },
      interactivityFlags: {
        ...DEFAULT_INTERACTIVITY_FLAGS,
        commandPalette: false,
        cameraControls: false,
        mouseClickMode: "multiselection",
      },
    },
    forceGraphDisplayConfig: {
      nodeTextLabels: true,
      nodeSize: 3,
      nodeOpacity: 1,
      linkTextLabels: false,
      linkWidth: 3,
      linkOpacity: 1,
      chargeStrength: -30,
      backgroundColor: "rgba(211, 211, 211, 1)",
      fontSize: 25, // Default font size for labels,
      cameraPosition: { x: 250, y: -200, z: 450 },
      cameraTarget: { x: 250, y: -200, z: 0 },
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
export const demo_SceneGraph_FactorGraph_ComplexExpansion = async () =>
  await createFactorGraphSceneGraph();

export default demo_SceneGraph_FactorGraph_ComplexExpansion;
