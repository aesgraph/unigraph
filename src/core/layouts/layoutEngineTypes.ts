import { CustomLayoutType } from "./CustomLayoutEngine";
import { GraphologyLayoutType } from "./GraphologyLayoutEngine";
import { GraphvizLayoutType } from "./GraphvizLayoutEngine";
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

export const LayoutEngineOptionLabels = [
  ...Object.values(GraphvizLayoutType),
  ...Object.values(GraphologyLayoutType),
  ...Object.values(CustomLayoutType),
  ...Object.values(PresetLayoutType),
];

export interface ILayoutEngineResult {
  positions: NodePositionData;
  svg?: string;
  layoutType: LayoutEngineOption | string;
}
