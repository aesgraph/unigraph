import { PresetLayoutType } from "../../../core/layouts/layoutEngineTypes";
import { SceneGraph } from "../../../core/model/SceneGraph";
import { loadSvgToSceneGraph } from "../../../utils/svgLoader";

/**
 * Creates a SceneGraph from the E8 Petrie projection SVG
 */
export const createE8PetrieSceneGraph = async (): Promise<SceneGraph> => {
  try {
    // Fetch the SVG content from public directory
    const response = await fetch("/svgs/e8petrie.svg");
    const svgContent = await response.text();
    // console.log("svg content is ", svgContent);
    return loadSvgToSceneGraph(svgContent, {
      appConfig: {
        activeView: "ForceGraph3d",
        activeSceneGraph: "attempt2",
        windows: {
          showEntityDataCard: false,
        },
        forceGraph3dOptions: {
          layout: "Layout",
        },
        activeLayout: PresetLayoutType.NodePositions,
        legendMode: "type",
        activeFilter: null,
      },
    });
  } catch (error) {
    throw new Error(`Failed to load E8 Petrie SVG: ${error}`);
  }
};

// Create a synchronous function that returns either the cached result or a placeholder
export const demo_SceneGraph_e8petrieProjection = async () =>
  await createE8PetrieSceneGraph();

/**
 * Creates a SceneGraph from the E8 Petrie projection SVG
 */
export const createE8_4_21_t2_b8_PetrieSceneGraph =
  async (): Promise<SceneGraph> => {
    try {
      // Fetch the SVG content from public directory
      const response = await fetch("/svgs/e8petrie_421t2b6.svg");
      const svgContent = await response.text();
      // console.log("svg content is ", svgContent);
      return loadSvgToSceneGraph(svgContent, {
        forceGraphDisplayConfig: {
          nodeTextLabels: false,
          nodeSize: 1,
          nodeOpacity: 0.7,
          linkTextLabels: false,
          linkWidth: 0,
          linkOpacity: 0.4,
          chargeStrength: -30,
        },
      });
    } catch (error) {
      throw new Error(`Failed to load E8 Petrie SVG: ${error}`);
    }
  };

// Create a synchronous function that returns either the cached result or a placeholder
export const demo_SceneGraph_e8petrieProjection_421t2b6 = async () =>
  await createE8_4_21_t2_b8_PetrieSceneGraph();
