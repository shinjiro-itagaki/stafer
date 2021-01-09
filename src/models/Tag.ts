import { DB } from "./../../lib/DB";

export module Tag {
  
  class TagClass implements DB.Class<Entity> {
    public readonly tableName = "tags";

    public toObject(entity: Entity): Object {
      return {};
    }

    public initialize(obj: Object): Entity {
      return {};
    }    
  }

  const klass: TagClass = new TagClass();

  export interface Entity extends DB.Entity {
  };
}

