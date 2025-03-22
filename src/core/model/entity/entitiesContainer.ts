import { AbstractEntity, EntityId } from "./abstractEntity";
import { EntityIds } from "./entityIds";

export type JSONString = string;
export class EntitiesContainer<
  T extends EntityId,
  V extends AbstractEntity<T, any>,
> implements Iterable<V>
{
  private entities: V[];
  private _map: Map<T, number>;

  public constructor(entities?: Array<V>) {
    this.entities = [];
    this._map = new Map<T, number>();
    entities?.forEach((entity, _index) => {
      this.addEntitySafe(entity);
    });
  }

  public addEntity(entity: V, strict: boolean = false) {
    if (strict) {
      this.throwIfContains(entity.getId());
    }
    const index = this.entities.length;
    this.entities.push(entity);
    this._map.set(entity.getId(), index);
  }

  public addEntitySafe(entity: V, strict: boolean = false) {
    if (strict) {
      this.throwIfContains(entity.getId());
    }
    const contains = this.has(entity.getId());
    if (contains) {
      const index = this._map.get(entity.getId())!;
      this.entities[index] = entity;
    } else {
      const index = this.entities.length;
      this.entities.push(entity);
      this._map.set(entity.getId(), index);
    }
  }

  public removeEntity(id: T, strict: boolean = false) {
    if (strict) {
      this.throwIfNotContains(id);
    }

    const index = this._map.get(id);
    if (index === undefined) return;

    // Move last entity to fill the hole (if it's not the last element)
    const lastIndex = this.entities.length - 1;
    if (index !== lastIndex) {
      const lastEntity = this.entities[lastIndex];
      this.entities[index] = lastEntity;
      this._map.set(lastEntity.getId(), index);
    }

    // Remove the last element and the mapping
    this.entities.pop();
    this._map.delete(id);
  }

  public get(id: T): V {
    const index = this._map.get(id);
    if (index === undefined) {
      throw new Error("No id in entities container: " + id);
    }
    return this.entities[index];
  }

  public getIds(): EntityIds<T> {
    return new EntityIds(this.entities.map((entity) => entity.getId()));
  }

  public maybeGet(id: T): V | undefined {
    const index = this._map.get(id);
    return index === undefined ? undefined : this.entities[index];
  }

  public getAny(ids: EntityIds<T>): EntitiesContainer<T, V> {
    return new EntitiesContainer(
      ids
        .toArray()
        .map((id) => this.maybeGet(id) as V)
        .filter((entity) => entity !== undefined)
    );
  }

  public getAll(
    ids: EntityIds<T>,
    strict: boolean = true
  ): EntitiesContainer<T, V> {
    const container = new EntitiesContainer<T, V>();
    ids.toArray().forEach((id) => {
      if (this.has(id)) {
        container.addEntity(this.get(id));
      } else if (strict) {
        throw new Error("getAll called for nonpresent entity id: " + id);
      }
    });
    return container;
  }

  public removeEntities(ids: EntityIds<T>, strict: boolean = false) {
    ids.forEach((id) => this.removeEntity(id, strict));
  }

  public addEntities(
    entities: EntitiesContainer<T, V> | V[],
    strict: boolean = false
  ) {
    entities.forEach((entity) => this.addEntity(entity, strict));
  }

  public addEntitiesSafe(
    entities: EntitiesContainer<T, V> | V[],
    strict: boolean = false
  ) {
    entities.forEach((entity) => this.addEntitySafe(entity, strict));
  }

  public has(id: T) {
    return this._map.has(id);
  }

  private throwIfContains(id: T) {
    if (this.has(id)) {
      throw new Error("EntitiesContainer already contains id " + id);
    }
  }

  private throwIfNotContains(id: T) {
    if (!this.has(id)) {
      throw new Error("EntitiesContainer doesn't contain id " + id);
    }
  }

  public toArray(): V[] {
    return [...this.entities];
  }

  public clear() {
    this.entities = [];
    this._map.clear();
  }

  public getTypes(): Set<string> {
    return new Set(this.map((entity) => entity.getType()));
  }

  public getTags(): Set<string> {
    return new Set(this.map((entity) => Array.from(entity.getTags())).flat());
  }

  public filter(predicate: (entity: V) => boolean): EntitiesContainer<T, V> {
    return new EntitiesContainer(this.entities.filter(predicate));
  }

  public filterByType(type: string): EntitiesContainer<T, V> {
    return this.filter((entity) => entity.getType() === type);
  }

  public filterByTag(tag: string): EntitiesContainer<T, V> {
    return this.filter((entity) => entity.getTags().has(tag));
  }

  public size(): number {
    return this.entities.length;
  }

  public forEach(
    callback: (entity: V, index: number, array: V[]) => void
  ): void {
    this.entities.forEach(callback);
  }

  public [Symbol.iterator](): Iterator<V> {
    return this.entities[Symbol.iterator]();
  }

  public map<U>(callbackfn: (value: V, index: number, array: V[]) => U): U[] {
    return this.entities.map(callbackfn);
  }

  public getRandomEntity(): V {
    if (this.entities.length === 0) {
      throw new Error("No entities in container");
    }
    return this.entities[Math.floor(Math.random() * this.entities.length)];
  }

  public deepCopy(): EntitiesContainer<T, V> {
    return new EntitiesContainer<T, V>(
      this.entities.map((entity) => entity.deepCopy())
    );
  }

  public getDatas(): any[] {
    return this.entities.map((entity) => entity.getData());
  }

  // util method
  public validate() {
    if (this.entities.length !== this._map.size) {
      const duplicates: T[] = [];
      const seen = new Set<T>();

      this.entities.forEach((entity) => {
        const id = entity.getId();
        if (seen.has(id)) {
          duplicates.push(id);
        } else {
          seen.add(id);
        }
      });
      throw new Error(
        `EntitiesContainer has duplicate entries: ${duplicates.join(", ")}`
      );
    }
  }

  public getRandom() {
    return this.entities[Math.floor(Math.random() * this.entities.length)];
  }

  public toJSON() {
    console.log("entities JSON", this.entities);
    console.log("entities JSON", JSON.stringify(this.entities));
    return this.entities;
  }

  public static fromJSON<T extends EntityId, V extends AbstractEntity<T, any>>(
    json: JSONString,
    entityFactory: (json: JSONString) => V
  ): EntitiesContainer<T, V> {
    const entities = JSON.parse(json).map((entityJson: JSONString) =>
      entityFactory(entityJson)
    );
    return new EntitiesContainer<T, V>(entities);
  }
}
