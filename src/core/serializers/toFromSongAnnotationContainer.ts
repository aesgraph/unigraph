import {
  SongAnnotation,
  SongAnnotationId,
} from "../../_experimental/mp3/SongAnnotation";
import {
  EntitiesContainer,
  JSONString,
} from "../model/entity/entitiesContainer";

export function serializeSongAnnotationContainerToJson(
  container: EntitiesContainer<SongAnnotationId, SongAnnotation>
): string {
  const annotations = container.toArray().map((annotation) => ({
    id: annotation.getId(),
    time: annotation.getTime(),
    text: annotation.getText(),
    description: annotation.getDescription(),
    tags: Array.from(annotation.getTags()),
  }));

  return JSON.stringify(annotations, null, 2);
}

export function deserializeSongAnnotationContainerFromJson(
  json: JSONString
): EntitiesContainer<SongAnnotationId, SongAnnotation> {
  const rawAnnotations = JSON.parse(json);
  const container = new EntitiesContainer<SongAnnotationId, SongAnnotation>();

  rawAnnotations.forEach((annotation: any) => {
    const songAnnotation = new SongAnnotation(annotation.id, {
      ...annotation,
      tags: new Set(annotation.tags),
    });
    container.addEntitySafe(songAnnotation);
  });

  return container;
}
