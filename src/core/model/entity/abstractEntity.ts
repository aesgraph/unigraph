import { ObjectOf } from "../../../App";

export type EntityId = string;
export type Tag = string;

export interface EntityData {
  id: EntityId;
  tags: Set<Tag>;
  label?: string;
  type: string;
  userData: ObjectOf<any>;
  description?: string;
}

export type EntityDataArgs = Omit<Partial<EntityData>, "tags" | "id"> & {
  tags?: Iterable<Tag>;
};

type FullEntityType<T> = Omit<T, keyof EntityDataArgs> & EntityData;

function fromDefault<T extends EntityDataArgs>(
  id: EntityId,
  args?: T
): FullEntityType<T> {
  return {
    ...args,
    id,
    tags: new Set(args?.tags ?? []),
    type: args?.type ?? "entity",
    userData: args?.userData ?? {},
  } as FullEntityType<T>;
}

export interface IEntity<T extends EntityId = EntityId> {
  getId(): T;
  getLabel(): string;
  getFullyQualifiedId(): string;
  setType(type: string): void;
  getType(): string;
  getTags(): Set<Tag>;
  setTags(tags: Set<Tag>): void;
  addTag(tag: Tag): void;
  removeTag(tag: Tag): void;
  maybeGetUserData(key: string): any | undefined;
  getAllUserData(): ObjectOf<any>;
  getUserData(key: string): any;
  getDescription(): string;
  getEntityType(): string; // special method for resolving entity types in logic, not data.
}

export abstract class AbstractEntity<
  T extends EntityId,
  Data extends EntityData,
> implements IEntity<T>
{
  protected data: Data;

  public constructor(id: T, args?: EntityDataArgs) {
    this.data = {
      ...fromDefault(id, {
        ...args,
      }),
    } as Data;
  }

  abstract getEntityType(): string;

  getId(): T {
    return this.data.id as T;
  }

  getData(): Data {
    return this.data;
  }

  getLabel(): string {
    return this.data.label ?? this.data.id;
  }

  getFullyQualifiedId(): string {
    return `${this.data.type}:${this.data.id}`;
  }

  // TODO: fix this antipattern
  setId(id: string): void {
    this.data.id = id;
  }

  setType(type: string | undefined): void {
    this.data.type = type ?? "undefined";
  }

  getType(): string {
    return this.data.type;
  }

  setLabel(label: string | undefined): void {
    this.data.label = label;
  }

  getTags(): Set<Tag> {
    return this.data.tags;
  }

  setTags(tags: Set<Tag>): void {
    this.data.tags = tags;
  }

  addTag(tag: Tag): void {
    this.data.tags.add(tag);
  }

  removeTag(tag: Tag): void {
    this.data.tags.delete(tag);
  }

  maybeGetUserData(key: string): any | undefined {
    return this.data.userData[key];
  }

  getAllUserData(): ObjectOf<any> {
    return this.data.userData;
  }

  getUserData(key: string): any {
    if (!(key in this.data.userData)) {
      throw new Error(`Key ${key} not found in userData`);
    }
    return this.data.userData[key];
  }

  setUserData(key: string, value: any): void {
    this.data.userData[key] = value;
  }

  setUserDataObject(userData: ObjectOf<any>): void {
    this.data.userData = userData;
  }

  getUserDataObject(): ObjectOf<any> {
    return this.data.userData;
  }

  setDescription(description: string | undefined): void {
    if (description !== undefined) {
      this.data.userData.description = description;
    } else {
      delete this.data.userData.description;
    }
  }

  getDescription(): string {
    return this.data.userData.description ?? "";
  }

  deepCopy<T>(): T {
    // Create a new instance of the specific class type with the same arguments
    const constructor = Object.getPrototypeOf(this).constructor;
    const clone = new constructor(this.data.id);

    // Get all property names, including inherited ones
    const propertyNames = Object.getOwnPropertyNames(this);

    // Copy each property
    for (const prop of propertyNames) {
      const value = this[prop as keyof this];

      if (value === null || value === undefined) {
        continue; // Skip undefined or null values
      }
      // Handle arrays
      else if (Array.isArray(value)) {
        clone[prop] = value.map((item) =>
          item instanceof AbstractEntity
            ? item.deepCopy()
            : this.deepCopyValue(item)
        );
      }
      // Handle sets
      else if (value instanceof Set) {
        clone[prop] = new Set(
          Array.from(value).map((item) => this.deepCopyValue(item))
        );
      }
      // Handle nested objects that are instances of AbstractEntity
      else if (value instanceof AbstractEntity) {
        clone[prop] = value.deepCopy();
      }
      // Handle Date objects
      else if (value instanceof Date) {
        clone[prop] = new Date(value);
      }
      // Handle plain objects
      else if (typeof value === "object") {
        clone[prop] = this.deepCopyValue(value);
      }
      // Handle primitive values
      else {
        clone[prop] = value;
      }
    }
    return clone as T;
  }

  private deepCopyValue(value: any): any {
    if (value === null || typeof value !== "object") {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.deepCopyValue(item));
    }

    if (value instanceof Set) {
      return new Set(value);
    }

    if (value instanceof Date) {
      return new Date(value);
    }

    const copy: any = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        copy[key] = this.deepCopyValue(value[key]);
      }
    }
    return copy;
  }

  toJSON() {
    return { ...this.data, tags: Array.from(this.data.tags) };
  }
}

export class Entity extends AbstractEntity<EntityId, EntityData> {
  getEntityType(): string {
    return "entity";
  }
}
