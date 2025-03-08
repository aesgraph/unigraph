import { EntitiesContainer } from "../entitiesContainer";
import { Entity, EntityId } from "../abstractEntity";
import { EntityIds } from "../entityIds";
import { NodeId } from "../../Node";

describe("EntitiesContainer", () => {
  let container: EntitiesContainer<EntityId, Entity>;

  beforeEach(() => {
    container = new EntitiesContainer();
  });

  describe("constructor", () => {
    it("should create an empty container", () => {
      expect(container.toArray()).toHaveLength(0);
    });
  });

  describe("add()", () => {
    it("should add an entity", () => {
      const entity = new Entity("test1");
      container.addEntity(entity);
      expect(container.get("test1")).toBe(entity);
    });

    it("should throw when adding duplicate entity", () => {
      const entity = new Entity("test1");
      container.addEntity(entity, true);
      expect(() => container.addEntity(entity, true)).toThrow();
    });
  });

  describe("get()", () => {
    it("should throw error for non-existent entity", () => {
      expect(() => container.get("nonexistent")).toThrow();
    });

    it("should retrieve an existing entity", () => {
      const entity = new Entity("test1");
      container.addEntity(entity);
      expect(container.get("test1")).toBe(entity);
    });
  });

  describe("delete()", () => {
    it("should delete an existing entity", () => {
      const entity = new Entity("test1");
      container.addEntity(entity);
      container.removeEntity("test1");
      expect(container.maybeGet("test1")).toBeUndefined();
    });

    it("should handle deletion of non-existent entity", () => {
      expect(() => container.removeEntity("nonexistent")).not.toThrow();
    });
  });

  describe("clear()", () => {
    it("should remove all entities", () => {
      container.addEntity(new Entity("test1"));
      container.addEntity(new Entity("test2"));
      container.clear();
      expect(container.toArray()).toHaveLength(0);
    });
  });

  describe("getAll()", () => {
    it("should return all entities", () => {
      const entity1 = new Entity("test1");
      const entity2 = new Entity("test2");
      container.addEntity(entity1);
      container.addEntity(entity2);
      const entities = container.toArray();
      expect(entities).toContain(entity1);
      expect(entities).toContain(entity2);
      expect(entities).toHaveLength(2);
    });

    it("should return empty iterator when no entities exist", () => {
      expect(container.toArray()).toHaveLength(0);
    });
  });

  describe("filterByType()", () => {
    beforeEach(() => {
      container.addEntity(new Entity("node1", { type: "type1" }));
      container.addEntity(new Entity("node2", { type: "type1" }));
      container.addEntity(new Entity("node3", { type: "type2" }));
    });

    it("should return entities of specified type", () => {
      const type1Entities = Array.from(container.filterByType("type1"));
      expect(type1Entities).toHaveLength(2);
      expect(type1Entities.map((e) => e.getId())).toContain("node1");
      expect(type1Entities.map((e) => e.getId())).toContain("node2");
    });

    it("should return empty iterator for non-existent type", () => {
      expect(Array.from(container.filterByType("nonexistent"))).toHaveLength(0);
    });
  });

  describe("filterByTag()", () => {
    beforeEach(() => {
      container.addEntity(new Entity("node1", { tags: ["tag1"] }));
      container.addEntity(new Entity("node2", { tags: ["tag1", "tag2"] }));
      container.addEntity(new Entity("node3", { tags: ["tag2"] }));
    });

    it("should return entities with specified tag", () => {
      const tag1Entities = Array.from(container.filterByTag("tag1"));
      expect(tag1Entities).toHaveLength(2);
      expect(tag1Entities.map((e) => e.getId())).toContain("node1");
      expect(tag1Entities.map((e) => e.getId())).toContain("node2");
    });

    it("should return empty iterator for non-existent tag", () => {
      expect(Array.from(container.filterByTag("nonexistent"))).toHaveLength(0);
    });
  });

  describe("getTypes()", () => {
    beforeEach(() => {
      container.addEntity(new Entity("node1", { type: "type1" }));
      container.addEntity(new Entity("node2", { type: "type1" }));
      container.addEntity(new Entity("node3", { type: "type2" }));
    });

    it("should return all unique types", () => {
      const types = container.getTypes();
      expect(types.size).toBe(2);
      expect(types).toContain("type1");
      expect(types).toContain("type2");
    });

    it("should return empty set when no entities exist", () => {
      container.clear();
      expect(container.getTypes().size).toBe(0);
    });
  });

  describe("getTags()", () => {
    beforeEach(() => {
      container.addEntity(new Entity("node1", { tags: ["tag1"] }));
      container.addEntity(new Entity("node2", { tags: ["tag1", "tag2"] }));
      container.addEntity(new Entity("node3", { tags: ["tag2"] }));
    });

    it("should return all unique tags", () => {
      const tags = container.getTags();
      expect(tags.size).toBe(2);
      expect(tags).toContain("tag1");
      expect(tags).toContain("tag2");
    });

    it("should return empty set when no entities have tags", () => {
      container.clear();
      expect(container.getTags().size).toBe(0);
    });
  });

  describe("has()", () => {
    it("should return true for existing entity", () => {
      const entity = new Entity("test1");
      container.addEntity(entity);
      expect(container.has("test1")).toBe(true);
    });

    it("should return false for non-existent entity", () => {
      expect(container.has("nonexistent")).toBe(false);
    });
  });

  describe("size()", () => {
    it("should return correct number of entities", () => {
      container.addEntity(new Entity("test1"));
      container.addEntity(new Entity("test2"));
      expect(container.size()).toBe(2);
    });

    it("should return 0 for empty container", () => {
      expect(container.size()).toBe(0);
    });

    it("should update after deletions", () => {
      container.addEntity(new Entity("test1"));
      container.addEntity(new Entity("test2"));
      container.removeEntity("test1");
      expect(container.size()).toBe(1);
    });
  });

  describe("edge cases", () => {
    it("should handle entities with no tags", () => {
      const entity = new Entity("test1");
      container.addEntity(entity);
      expect(container.getTags().size).toBe(0);
    });

    it("should handle entities with empty string tags", () => {
      const entity = new Entity("test1", { tags: [""] });
      container.addEntity(entity);
      expect(container.getTags().size).toBe(1);
      expect(container.getTags()).toContain("");
    });

    it("should handle entities with special characters in IDs", () => {
      const entity = new Entity("test/1@#$%^&*()");
      container.addEntity(entity);
      expect(container.has("test/1@#$%^&*()")).toBe(true);
    });
  });

  describe("basic operations", () => {
    it("should add and retrieve an entity", () => {
      const entity = new Entity("test1", { type: "testType" });
      container.addEntity(entity);
      expect(container.get("test1")).toBe(entity);
    });

    it("should return undefined for non-existent entity", () => {
      expect(container.maybeGet("nonexistent")).toBeUndefined();
    });

    it("should delete an entity", () => {
      const entity = new Entity("test1");
      container.addEntity(entity);
      container.removeEntity("test1");
      expect(container.has("test1")).toBe(false);
    });

    it("should return all entities", () => {
      const entity1 = new Entity("test1");
      const entity2 = new Entity("test2");
      container.addEntity(entity1);
      container.addEntity(entity2);
      const entities = container.toArray();
      expect(entities).toContain(entity1);
      expect(entities).toContain(entity2);
      expect(entities.length).toBe(2);
    });

    it("should clear all entities", () => {
      const entity1 = new Entity("test1");
      const entity2 = new Entity("test2");
      container.addEntity(entity1);
      container.addEntity(entity2);
      container.clear();
      expect(container.toArray().length).toBe(0);
    });
  });

  describe("filtering and querying", () => {
    beforeEach(() => {
      container.addEntity(
        new Entity("node1", { type: "type1", tags: ["tag1"] })
      );
      container.addEntity(
        new Entity("node2", { type: "type1", tags: ["tag2"] })
      );
      container.addEntity(
        new Entity("node3", { type: "type2", tags: ["tag1"] })
      );
    });

    it("should filter by type", () => {
      const type1Entities = Array.from(container.filterByType("type1"));
      expect(type1Entities.length).toBe(2);
      expect(type1Entities.map((e) => e.getId())).toContain("node1");
      expect(type1Entities.map((e) => e.getId())).toContain("node2");
    });

    it("should filter by tag", () => {
      const tag1Entities = Array.from(container.filterByTag("tag1"));
      expect(tag1Entities.length).toBe(2);
      expect(tag1Entities.map((e) => e.getId())).toContain("node1");
      expect(tag1Entities.map((e) => e.getId())).toContain("node3");
    });

    it("should get all types", () => {
      const types = container.getTypes();
      expect(types.size).toBe(2);
      expect(types).toContain("type1");
      expect(types).toContain("type2");
    });

    it("should get all tags", () => {
      const tags = container.getTags();
      expect(tags.size).toBe(2);
      expect(tags).toContain("tag1");
      expect(tags).toContain("tag2");
    });
  });

  describe("error handling", () => {
    it("should throw when adding duplicate entity", () => {
      const entity = new Entity("test1");
      container.addEntity(entity);
      expect(() => container.addEntity(entity, true)).toThrow();
    });

    it("should handle deletion of non-existent entity", () => {
      expect(() => container.removeEntity("nonexistent")).not.toThrow();
    });
  });

  describe("entity updates", () => {
    it("should update entity type", () => {
      const entity = new Entity("test1", { type: "oldType" });
      container.addEntity(entity);
      entity.setType("newType");
      expect(Array.from(container.filterByType("newType"))[0]).toBe(entity);
      expect(Array.from(container.filterByType("oldType"))).toHaveLength(0);
    });

    it("should update entity tags", () => {
      const entity = new Entity("test1", { tags: ["oldTag"] });
      container.addEntity(entity);
      entity.setTags(new Set(["newTag"]));
      expect(Array.from(container.filterByTag("newTag"))[0]).toBe(entity);
      expect(Array.from(container.filterByTag("oldTag"))).toHaveLength(0);
    });
  });

  describe("performance with large datasets", () => {
    it("should handle large number of entities efficiently", () => {
      const startTime = performance.now();
      for (let i = 0; i < 100000; i++) {
        container.addEntity(
          new Entity(`test${i}`, {
            type: `type${i % 100}`,
            tags: [`tag${i % 50}`],
          })
        );
      }
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
      expect(container.getTypes().size).toBe(100);
      expect(container.getTags().size).toBe(50);
    });

    it("should handle large number of queries efficiently", () => {
      const idsToFetch = new EntityIds<NodeId>();
      for (let i = 0; i < 100000; i++) {
        const id = `test${i}`;
        if (i < 50000) {
          idsToFetch.add(id as NodeId);
        }
        container.addEntity(
          new Entity(id, {
            type: `type${i % 100}`,
            tags: [`tag${i % 50}`],
          })
        );
      }
      const startTime = performance.now();
      const entities = container.getAll(idsToFetch);
      expect(entities.size()).toBe(50000);
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it("should handle large number of removals efficiently", () => {
      const idsToRemove = new EntityIds<NodeId>();
      for (let i = 0; i < 100000; i++) {
        const id = `test${i}`;
        if (i < 50000) {
          idsToRemove.add(id as NodeId);
        }
        container.addEntity(
          new Entity(id, {
            type: `type${i % 100}`,
            tags: [`tag${i % 50}`],
          })
        );
      }
      const startTime = performance.now();
      container.removeEntities(idsToRemove);
      expect(container.size()).toBe(50000);
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });
  });
});
