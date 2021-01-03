import { Model } from "./../../lib/Model";

export module Tag {
  
  class TagClass implements Model.Class<Entity> {
    public readonly tableName = "tags";

    public toObject(entity: Entity): Object {
      return {};
    }

    public initialize(obj: Object): Entity {
      return {};
    }    
  }

  const klass: TagClass = new TagClass();

  export interface Entity extends Model.Entity {
  };

  export type Record = Model.Record<Entity>;
}

