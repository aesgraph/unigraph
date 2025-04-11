import {
  Compute_Layout,
  ILayoutEngineResult,
  LayoutEngineOption,
  LayoutEngineOptionLabels,
  PresetLayoutType,
} from "../core/layouts/LayoutEngine";
import { SceneGraph } from "../core/model/SceneGraph";
import { Layout, setCurrentLayoutResult } from "./activeLayoutStore";
import { getCurrentSceneGraph } from "./appConfigStore";

export async function applyLayoutAndTriggerAppUpdate(layout: Layout) {
  const sceneGraph = getCurrentSceneGraph();
  if (layout != null && sceneGraph != null) {
    sceneGraph.setNodePositions(layout.positions);
    setCurrentLayoutResult({
      layoutType: LayoutEngineOptionLabels.includes(
        layout.name as LayoutEngineOption
      )
        ? layout.name
        : "Custom",
      positions: layout.positions,
    });
  }
}

export async function computeLayoutAndTriggerAppUpdate(
  sceneGraph: SceneGraph,
  layout: LayoutEngineOption
): Promise<ILayoutEngineResult | null> {
  if (
    layout != null &&
    !LayoutEngineOptionLabels.includes(layout as LayoutEngineOption)
  ) {
    throw new Error(`Invalid layout option ${layout}`);
  }
  console.log("layout selected is ", layout);
  if (
    layout === PresetLayoutType.Preset ||
    layout === PresetLayoutType.NodePositions
  ) {
    console.log(
      "Skipping layout computation for preset layout. Preset must be loaded"
    );
    return null;
  }
  const output = await Compute_Layout(sceneGraph, layout as LayoutEngineOption);
  if (output && Object.keys(output.positions).length > 0) {
    sceneGraph.setNodePositions(output.positions);
    setCurrentLayoutResult(output);
  }
  return output;
}

export async function computeLayoutAndTriggerUpdateForCurrentSceneGraph(
  layout: LayoutEngineOption
): Promise<ILayoutEngineResult | null> {
  return computeLayoutAndTriggerAppUpdate(getCurrentSceneGraph(), layout);
}

// export const activeViewFitView = () => {
//   if (getActiveView() === "ReactFlow" && getReactFlowInstance()) {
//     getReactFlowInstance()?.fitView();
//   } else if (getActiveView() === "ForceGraph3d" && getForceGraph3dInstance()) {
//     zoomToFit(getForceGraphInstance()!, 1);
//   }
// };
