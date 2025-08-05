import {
  AbstractEntity,
  EntityData,
  EntityDataArgs,
  EntityId,
} from "../../core/model/entity/abstractEntity";

export type SongAnnotationId = EntityId & { readonly kind: "songAnnotation" };

type SongAnnotationData = EntityData & {
  time: number;
  text: string;
  description: string;
};

export type SongAnnotationDataArgs = EntityDataArgs & {
  id: string | SongAnnotationId;
  time: number;
  text?: string;
  description?: string;
};

class SongAnnotation extends AbstractEntity<
  SongAnnotationId,
  SongAnnotationData
> {
  constructor(id: SongAnnotationId | string, args: SongAnnotationDataArgs) {
    super(args);
  }

  getData(): SongAnnotationData {
    return this.data;
  }

  getEntityType(): string {
    return "songAnnotation";
  }

  getTime(): number {
    return this.data.time;
  }

  setTime(time: number): void {
    this.data.time = time;
  }

  getText(): string {
    return this.data.text;
  }

  setText(text: string): void {
    this.data.text = text;
  }
}

export { SongAnnotation };
export type { SongAnnotationData };
