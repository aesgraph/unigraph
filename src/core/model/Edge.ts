import {
  AbstractEntity,
  EntityData,
  EntityDataArgs,
  EntityId,
} from "./entity/abstractEntity";
import { NodeId } from "./Node";

export type EdgeId = EntityId & { readonly kind: "edge" };
export const createEdgeId = (
  source: NodeId | string,
  target: NodeId | string
): EdgeId => {
  return `${source}:::${target}` as EdgeId;
};

export interface DisplayEdgeData {
  isVisible: boolean;
  color: string;
  size: number;
  opacity: number;
  drawType?: "arrow" | "line";
}

export type DisplayEdgeDataArgs = Partial<DisplayEdgeData>;

export const DEFAULT_DISPLAY_EDGE_DATA: DisplayEdgeData = {
  isVisible: true,
  color: "#000000",
  size: 1,
  opacity: 1,
  drawType: "line",
};

type EdgeData = EntityData & {
  source: NodeId;
  target: NodeId;
} & DisplayEdgeData;

export type EdgeDataArgs = EntityDataArgs & {
  source: NodeId | string;
  target: NodeId | string;
} & DisplayEdgeDataArgs;

class Edge extends AbstractEntity<EdgeId, EdgeData> {
  constructor(args: EdgeDataArgs) {
    const id = Edge.id(args.source, args.target);

    super({ ...DEFAULT_DISPLAY_EDGE_DATA, ...args, id });
  }

  public static id(source: NodeId | string, target: NodeId | string): EdgeId {
    return `${source}:::${target}` as EdgeId;
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

export { Edge };
export type { EdgeData };
