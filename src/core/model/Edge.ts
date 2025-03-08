import {
  AbstractEntity,
  EntityData,
  EntityDataArgs,
  EntityId,
} from "./entity/abstractEntity";
import { NodeId } from "./Node";

export type EdgeId = EntityId & { readonly kind: "edge" };

type EdgeData = EntityData & {
  source: NodeId;
  target: NodeId;
} & DisplayEdgeData;

export type EdgeDataArgs = EntityDataArgs & {
  source: NodeId | string;
  target: NodeId | string;
};

export interface DisplayEdgeData {
  isVisible: boolean;
  color: string;
  size: number;
  opacity: number;
}

export const DEFAULT_DISPLAY_EDGE_DATA: DisplayEdgeData = {
  isVisible: true,
  color: "#000000",
  size: 1,
  opacity: 1,
};

export type DisplayEdgeDataArgs = Partial<DisplayEdgeData>;
class Edge extends AbstractEntity<EdgeId, EdgeData> {
  constructor(id: EdgeId | string, args: EdgeDataArgs) {
    super(id as EdgeId, { ...DEFAULT_DISPLAY_EDGE_DATA, ...args });
  }

  getEntityType(): string {
    return "edge";
  }

  getUniqueConnectionId(): string {
    return `${this.getSource()}:::${this.getTarget()}`;
  }

  getData(): EdgeData {
    return this.data;
  }

  setData(data: EdgeData): void {
    this.data = data;
  }

  getSource(): NodeId {
    return this.data.source;
  }

  getTarget(): NodeId {
    return this.data.target;
  }

  isVisible(): boolean {
    return this.data.isVisible;
  }

  setVisibility(isVisible: boolean): void {
    this.data.isVisible = isVisible;
  }

  getColor(): string {
    return this.data.color;
  }

  setColor(color: string): void {
    this.data.color = color;
  }

  getSize(): number {
    return this.data.size;
  }

  getOpacity(): number {
    return this.data.opacity;
  }
}

export { Edge, EdgeData };
