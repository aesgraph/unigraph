import { SceneGraph } from "../../../core/model/SceneGraph";

// Import the SVG as a raw string
import petrie421t2b6SvgUrl from "!!raw-loader!/public/svgs/e8_4_21_t2-B6.svg";
import petriesvgUrl from "!!raw-loader!/public/svgs/e8petrie.svg";
import { PresetLayoutType } from "../../../core/layouts/LayoutEngine";
import { loadSvgToSceneGraph } from "../../../utils/svgLoader";

/**
 * Creates a SceneGraph from the E8 Petrie projection SVG
 */
export const createE8PetrieSceneGraph = async (): Promise<SceneGraph> => {
  try {
    // Use the imported raw SVG content directly
    const svgContent = petriesvgUrl;
    console.log("svg content is ", svgContent);
    return loadSvgToSceneGraph(svgContent, {
      appConfig: {
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
      }, 
    });
  } catch (error) {
    throw new Error(`Failed to load E8 Petrie SVG: ${error}`);
  }
};

// Create a synchronous function that returns either the cached result or a placeholder
export const demo_SceneGraph_e8petrieProjection =
  await createE8PetrieSceneGraph();

/**
 * Creates a SceneGraph from the E8 Petrie projection SVG
 */
export const createE8_4_21_t2_b8_PetrieSceneGraph =
  async (): Promise<SceneGraph> => {
    try {
      // Use the imported raw SVG content directly
      const svgContent = petrie421t2b6SvgUrl;
      console.log("svg content is ", svgContent);
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
export const demo_SceneGraph_e8petrieProjection_421t2b6 =
  await createE8_4_21_t2_b8_PetrieSceneGraph();
