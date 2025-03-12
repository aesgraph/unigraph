import { SceneGraph } from "../model/SceneGraph";
import { computeCustomLayout, CustomLayoutType } from "./CustomLayoutEngine";
import {
  GraphologyLayoutEngine,
  GraphologyLayoutType,
} from "./GraphologyLayoutEngine";
import {
  GraphvizLayoutEngine,
  GraphvizLayoutType,
} from "./GraphvizLayoutEngine";
import { NodePositionData } from "./layoutHelpers";

export enum PresetLayoutType {
  Preset = "Preset",
  NodePositions = "NodePositions", // Use the positions stored in the graph nodes
}

export type LayoutEngineOption =
  | GraphvizLayoutType
  | GraphologyLayoutType
  | CustomLayoutType
  | PresetLayoutType;

export interface ILayoutEngineResult {
  positions: NodePositionData;
  svg?: string;
  layoutType: LayoutEngineOption;
}

export class LayoutEngine {
  private sceneGraph: SceneGraph;
  private graphologyLayoutEngine: GraphologyLayoutEngine;
  private graphvizLayoutEngine: GraphvizLayoutEngine;
  private static isComputingSafeLayout: boolean = false; // can prob take static off of this

  constructor(sceneGraph: SceneGraph) {
    this.sceneGraph = sceneGraph;
    this.graphologyLayoutEngine = new GraphologyLayoutEngine(sceneGraph);
    this.graphvizLayoutEngine = new GraphvizLayoutEngine(sceneGraph);
  }

  async safeComputeLayout(
    layoutType: LayoutEngineOption
  ): Promise<ILayoutEngineResult | null> {
    if (LayoutEngine.isComputingSafeLayout) {
      console.log("Layout computation already in progress, skipping...");
      return null;
    }
    LayoutEngine.isComputingSafeLayout = true;
    console.log("Computing layout!...");
    const startTime = Date.now();
    try {
      const result = this.computeLayout(layoutType);
      return result;
    } finally {
      LayoutEngine.isComputingSafeLayout = false;
      const endTime = Date.now();
      console.log(
        `${layoutType} Layout computation took ${endTime - startTime} ms`
      );
    }
  }

  async computeLayout(
    layoutType: LayoutEngineOption
  ): Promise<ILayoutEngineResult> {
    if (
      Object.values(GraphologyLayoutType).includes(
        layoutType as GraphologyLayoutType
      )
    ) {
      const positions = await this.graphologyLayoutEngine.computeLayout(
        layoutType as GraphologyLayoutType
      );
      return { positions, layoutType };
    } else if (
      Object.values(GraphvizLayoutType).includes(
        layoutType as GraphvizLayoutType
      )
    ) {
      const output = await this.graphvizLayoutEngine.computeLayout(
        layoutType as GraphvizLayoutType
      );
      return { ...output, layoutType };
    } else if (
      Object.values(CustomLayoutType).includes(layoutType as CustomLayoutType)
    ) {
      const positions = computeCustomLayout(
        this.sceneGraph,
        layoutType as CustomLayoutType
      );
      return { positions, layoutType };
    }
    throw new Error("Invalid layout type: " + layoutType);
  }
}

export const Compute_Layout = (
  sceneGraph: SceneGraph,
  layoutType: LayoutEngineOption
): Promise<ILayoutEngineResult | null> => {
  const layoutEngine = new LayoutEngine(sceneGraph);
  return layoutEngine.safeComputeLayout(layoutType);
};
