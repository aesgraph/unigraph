import {
  SongAnnotation,
  SongAnnotationId,
} from "../../../_experimental/mp3/SongAnnotation";
import { EntitiesContainer } from "../../model/entity/entitiesContainer";
import {
  deserializeSongAnnotationContainerFromJson,
  serializeSongAnnotationContainerToJson,
} from "../toFromSongAnnotationContainer";

describe("SongAnnotation Container Serialization", () => {
  let container: EntitiesContainer<SongAnnotationId, SongAnnotation>;

  beforeEach(() => {
    container = new EntitiesContainer();

    const songAnnotation1 = new SongAnnotation("anno1", {
      id: "anno1",
      time: 1.5,
      text: "First mark",
      description: "Beginning of verse",
      tags: new Set(["verse", "start"]),
      type: "annotation",
    });

    const songAnnotation2 = new SongAnnotation("anno2", {
      id: "anno2",
      time: 4.2,
      text: "Second mark",
      description: "Chorus starts",
      tags: new Set(["chorus", "hook"]),
      type: "annotation",
    });

    container.addEntity(songAnnotation1);
    container.addEntity(songAnnotation2);
  });

  test("should correctly serialize and deserialize annotations", () => {
    // Serialize
    const json = serializeSongAnnotationContainerToJson(container);

    // Deserialize
    const deserializedContainer =
      deserializeSongAnnotationContainerFromJson(json);

    // Get arrays of both containers for comparison
    const originalAnnotations = container.toArray();
    const deserializedAnnotations = deserializedContainer.toArray();

    // Test container size
    expect(deserializedContainer.size()).toBe(container.size());

    // Compare each annotation
    originalAnnotations.forEach((original, index) => {
      const deserialized = deserializedAnnotations[index];

      // Compare basic properties
      expect(deserialized.getId()).toBe(original.getId());
      expect(deserialized.getTime()).toBe(original.getTime());
      expect(deserialized.getText()).toBe(original.getText());
      expect(deserialized.getDescription()).toBe(original.getDescription());

      // Compare tags as arrays (since Set comparison can be tricky)
      expect(Array.from(deserialized.getTags()).sort()).toEqual(
        Array.from(original.getTags()).sort()
      );
    });
  });

  test("should handle empty container", () => {
    const emptyContainer = new EntitiesContainer<
      SongAnnotationId,
      SongAnnotation
    >();
    const json = serializeSongAnnotationContainerToJson(emptyContainer);
    const deserialized = deserializeSongAnnotationContainerFromJson(json);

    expect(deserialized.size()).toBe(0);
    expect(deserialized.toArray()).toEqual([]);
  });

  test("should preserve time precision", () => {
    container.addEntity(
      new SongAnnotation("precise", {
        id: "precise",
        time: 3.14159265359,
        text: "Precise timestamp",
        type: "annotation",
      })
    );

    const json = serializeSongAnnotationContainerToJson(container);
    const deserialized = deserializeSongAnnotationContainerFromJson(json);

    const original = container.get("precise" as SongAnnotationId);
    const restored = deserialized.get("precise" as SongAnnotationId);

    expect(restored.getTime()).toBe(original.getTime());
  });

  test("should handle annotations with no tags", () => {
    container.addEntity(
      new SongAnnotation("notags", {
        id: "notags",
        time: 5.0,
        text: "No tags here",
        type: "annotation",
      })
    );

    const json = serializeSongAnnotationContainerToJson(container);
    const deserialized = deserializeSongAnnotationContainerFromJson(json);

    const restored = deserialized.get("notags" as SongAnnotationId);
    expect(Array.from(restored.getTags())).toEqual([]);
  });
});
