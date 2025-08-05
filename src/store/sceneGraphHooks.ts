import { Compute_Layout } from "../core/layouts/LayoutEngine";
import {
  ILayoutEngineResult,
  LayoutEngineOption,
  LayoutEngineOptionLabels,
  PresetLayoutType,
} from "../core/layouts/layoutEngineTypes";
import {
  centerPositionsAroundPoint,
  filterNodePositionsToSelection,
  getCenterPointOfNodePositionData,
} from "../core/layouts/layoutHelpers";
import { DisplayManager } from "../core/model/DisplayManager";
import { EntityIds } from "../core/model/entity/entityIds";
import { NodeId } from "../core/model/Node";
import { SceneGraph } from "../core/model/SceneGraph";
import { extractPositionsFromNodes } from "../data/graphs/blobMesh";
import { Filter } from "./activeFilterStore";
import {
  getCurrentLayoutResult,
  Layout,
  setCurrentLayoutResult,
} from "./activeLayoutStore";
import {
  ResetNodeAndEdgeLegends,
  SetNodeAndEdgeLegendsForOnlyVisibleEntities,
} from "./activeLegendConfigStore";
import {
  getActiveView,
  getCurrentSceneGraph,
  getLegendMode,
  getReactFlowInstance,
  setActiveFilter,
} from "./appConfigStore";
import { getMouseControlMode, setMouseControlMode } from "./mouseControlsStore";

export async function applyLayoutAndTriggerAppUpdate(layout: Layout) {
  const sceneGraph = getCurrentSceneGraph();
  if (layout != null && sceneGraph != null) {
    sceneGraph.setNodePositions(layout.positions);
    setCurrentLayoutResult(
      {
        layoutType: LayoutEngineOptionLabels.includes(
          layout.name as LayoutEngineOption
        )
          ? layout.name
          : "Custom",
        positions: layout.positions,
      },
      "Layout"
    );
  }
}

export async function computeLayoutAndTriggerAppUpdate(
  sceneGraph: SceneGraph,
  layout: LayoutEngineOption,
  nodeSelection?: EntityIds<NodeId>
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
  const output = await Compute_Layout(
    sceneGraph,
    layout as LayoutEngineOption,
    nodeSelection
  );
  if (output && Object.keys(output.positions).length > 0) {
    if (nodeSelection && nodeSelection.size > 0) {
      const currentNodePositions =
        getCurrentLayoutResult()?.positions ||
        extractPositionsFromNodes(sceneGraph);

      const filteredPositions = filterNodePositionsToSelection(
        currentNodePositions,
        nodeSelection.toArray()
      );

      let currentNodeSelectionCenterPoint = { x: 0, y: 0, z: 0 };
      if (Object.keys(filteredPositions).length > 0) {
        currentNodeSelectionCenterPoint = {
          ...currentNodeSelectionCenterPoint,
          ...getCenterPointOfNodePositionData(filteredPositions),
        };
      }
      output.positions = centerPositionsAroundPoint(
        output.positions,
        currentNodeSelectionCenterPoint
      );

      // console.log("Center point is ", currentNodeSelectionCenterPoint);

      for (const [key, position] of Object.entries(output.positions)) {
        currentNodePositions[key] = position;
      }
      output.positions = currentNodePositions;
    }
    setCurrentLayoutResult(output, "Layout");
  }
  return output;
}

export async function computeLayoutAndTriggerUpdateForCurrentSceneGraph(
  layout: LayoutEngineOption,
  nodeSelection?: EntityIds<NodeId>
): Promise<ILayoutEngineResult | null> {
  return computeLayoutAndTriggerAppUpdate(
    getCurrentSceneGraph(),
    layout,
    nodeSelection
  );
}

// export const activeViewFitView = () => {
//   if (getActiveView() === "ReactFlow" && getReactFlowInstance()) {
//     getReactFlowInstance()?.fitView();
//   } else if (getActiveView() === "ForceGraph3d" && getForceGraph3dInstance()) {
//     zoomToFit(getForceGraphInstance()!, 1);
//   }
// };

export const applyActiveFilterToAppInstance = (filter: Filter) => {
  const currentSceneGraph = getCurrentSceneGraph();
  DisplayManager.applyVisibilityFromFilterRulesToGraph(
    currentSceneGraph.getGraph(),
    filter.filterRules
  );
  SetNodeAndEdgeLegendsForOnlyVisibleEntities(
    currentSceneGraph,
    getLegendMode(),
    filter.filterRules
  );
  setActiveFilter(filter);
};

export const filterSceneGraphToOnlyVisibleNodes = (
  nodeIds: EntityIds<NodeId>
) => {
  applyActiveFilterToAppInstance({
    name: "node id selection",
    filterRules: [
      {
        id: "node id selection",
        operator: "include",
        ruleMode: "entities",
        conditions: {
          nodes: nodeIds.toArray(),
        },
      },
    ],
  });
};

export const hideVisibleNodes = (nodeIds: EntityIds<NodeId>) => {
  applyActiveFilterToAppInstance({
    name: "hide selected nodes",
    filterRules: [
      {
        id: "hide selected nodes",
        operator: "exclude",
        ruleMode: "entities",
        conditions: {
          nodes: nodeIds.toArray(),
        },
      },
    ],
  });
};

export const toggleForceGraphMouseControls = () => {
  const currentMode = getMouseControlMode();
  const newMode = currentMode === "orbital" ? "multiselection" : "orbital";

  // Use the explicit setter instead of toggle
  setMouseControlMode(newMode);

  console.log(`Mouse control mode toggled from ${currentMode} to ${newMode}`);
};

export const clearFiltersOnAppInstance = () => {
  const currentSceneGraph = getCurrentSceneGraph();
  DisplayManager.setAllVisible(currentSceneGraph.getGraph());
  ResetNodeAndEdgeLegends(currentSceneGraph);
  setActiveFilter(null);
};

export const handleReactFlowFitView = (
  padding: number = 0.1,
  duration: number = 0
) => {
  if (getActiveView() === "ReactFlow" && getReactFlowInstance()) {
    setTimeout(() => {
      getReactFlowInstance()?.fitView({ padding, duration });
    }, 0);
  }
};
