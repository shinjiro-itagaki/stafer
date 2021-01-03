import { Model } from "./../../lib/Model";
import { Tag } from "./Tag";

export module Member {

  export interface Entity extends Model.Entity {
    readonly tags: Tag.Record[];
  };

  export type Record = Model.Record<Entity>;

  class Class implements Model.Class<Entity> {
    readonly tableName: string = "members";
    public toObject(entity: Entity): Object {
      return {};
    }

    public initialize(obj: Object): Entity {
      return { tags: []};
    }
  }

  const klass: Model.Class<Entity> = new Class();

  export function create(entity: Entity | null = null): Record | null {
    return Model.create(klass,entity || {tags: []});
  }

  export function all(): ReadonlyArray<Record> {
    return Model.all(klass);
  }

}

