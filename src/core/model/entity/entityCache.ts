import { IEntity } from "./abstractEntity";
import { EntitiesContainer } from "./entitiesContainer";

export class EntityCache {
  private cache: Map<string, EntitiesContainer<any, any>>;

  constructor() {
    this.cache = new Map<string, EntitiesContainer<any, any>>();
  }

  public addEntity(entity: IEntity) {
    if (!this.cache.has(entity.getEntityType())) {
      this.cache.set(entity.getEntityType(), new EntitiesContainer());
    }
    this.cache.get(entity.getEntityType())!.addEntity(entity);
  }

  public addEntities(entities: EntitiesContainer<any, any>) {
    entities.forEach((entity) => this.addEntity(entity));
  }

  public getEntitiesOfType(type: string): EntitiesContainer<any, any> {
    return this.cache.get(type) || new EntitiesContainer();
  }

  public clearEntitiesOfType(type: string) {
    this.cache.get(type)?.clear();
  }

  public getTypes(): string[] {
    return Array.from(this.cache.keys());
  }
}
