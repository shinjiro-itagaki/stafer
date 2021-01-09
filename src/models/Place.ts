import { Model } from "./../../lib/Model";

export module Place {

  export interface Entity extends Model.Entity {
    name: string;
  };

  export type Record = Model.Record<Entity>;

  class Class implements Model.Class<Entity> {
    readonly tableName: string = "places";
    public toObject(entity: Entity): Object {
      return {};
    }

    public initialize(obj: Object): Entity {
      return {};
    }
  }

  const klass: Model.Class<Entity> = new Class();

  export function create(entity: Entity | null = null): Record | null {
    return Model.create(klass,entity || {});
  }

  export function all(): ReadonlyArray<Record> {
    return Model.all(klass);
  }

}

