import { AbstractEntity, EntityId } from "./abstractEntity";
import { EntitiesContainer } from "./entitiesContainer";
export class EntityIds<T extends EntityId> extends Set<T> {
  constructor(ids?: Array<T> | EntityIds<T>) {
    super();
    ids?.forEach((id) => this.add(id));
  }

  public static fromId<T extends EntityId>(id: T) {
    return new EntityIds<T>(new Array(id));
  }

  public getAny<V extends AbstractEntity<T, any>>(
    container: EntitiesContainer<T, V>
  ): EntitiesContainer<T, V> {
    return container.getAny(this);
  }

  public getAll<V extends AbstractEntity<T, any>>(
    container: EntitiesContainer<T, V>
  ): EntitiesContainer<T, V> {
    return container.getAll(this);
  }

  public toArray(): T[] {
    return Array.from(this.values());
  }

  public isEmpty(): boolean {
    return this.size === 0;
  }

  public hasAll(ids: EntityIds<T>): boolean {
    return ids.toArray().every((id) => this.has(id));
  }

  public throwIfEmpty() {
    if (this.isEmpty()) {
      throw new Error("EntityIds is empty");
    }
  }

  public isEqualTo(other: EntityIds<T>): boolean {
    if (this.size !== other.size) return false;
    for (const id of this) {
      if (!other.has(id)) return false;
    }
    return true;
  }

  public static isEqualTo(a: EntityIds<any>, b: EntityIds<any>): boolean {
    return a.isEqualTo(b);
  }

  // Returns the set of entities contained in this set that are not present in the other.
  public getDifference(other: EntityIds<T>): EntityIds<T> {
    const difference = new EntityIds<T>();
    this.forEach((id) => {
      if (!other.has(id)) {
        difference.add(id);
      }
    });
    return difference;
  }
}
