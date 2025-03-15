import { Dimensions, Position } from "../layouts/layoutHelpers";
import {
  AbstractEntity,
  EntityData,
  EntityDataArgs,
  EntityId,
} from "./entity/abstractEntity";

export type NodeId = EntityId & { readonly kind: "node" };
export const createNodeId = (id: string): NodeId => {
  // Could add validation here if needed
  return id as NodeId;
};

export interface DisplayNodeData {
  position: Position;
  dimensions?: { width: number; height: number };
  isVisible: boolean;
  color: string;
  size: number;
  opacity: number;
}

export type DisplayNodeDataArgs = Partial<DisplayNodeData>;

export const DEFAULT_DISPLAY_NODE_DATA: DisplayNodeData = {
  position: { x: 0, y: 0, z: 0 },
  isVisible: true,
  color: "rgb(255, 255, 255)",
  size: 1,
  opacity: 1,
};

export type NodeData = EntityData & DisplayNodeData;
export type NodeDataArgs = EntityDataArgs & DisplayNodeDataArgs;

class Node extends AbstractEntity<NodeId, NodeData> {
  constructor(id: NodeId | string, args?: NodeDataArgs) {
    super(id as NodeId, { ...DEFAULT_DISPLAY_NODE_DATA, ...args });
  }

  getDimensions(): Dimensions | undefined {
    return this.data.dimensions;
  }

  setDimensions(dimensions: Dimensions): Node {
    this.data.dimensions = dimensions;
    return this;
  }

  getData(): NodeData {
    return this.data;
  }

  getPosition(): Position {
    return this.data.position;
  }

  setPosition(position: Position): Node {
    this.data.position = position;
    return this;
  }

  isVisible(): boolean {
    return this.data.isVisible;
  }

  getColor(): string {
    return this.data.color;
  }

  setColor(color: string): void {
    this.data.color = color;
  }

  setVisibility(isVisible: boolean): void {
    this.data.isVisible = isVisible;
  }

  getSize(): number {
    return this.data.size;
  }

  getOpacity(): number {
    return this.data.opacity;
  }

  getEntityType(): string {
    return "node";
  }
}

export { Node };
