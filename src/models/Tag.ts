import { DB } from "./../../lib/DB";

export module Tag {
  
  class Table extends DB.AbstractTable<Entity> {
    public readonly name: string = "tags";

    public toObject(entity: Entity): Object {
      return {};
    }

    public initialize(obj: Object): Entity {
      return {};
    }    
  }

  const table: Table = new Table();

  export interface Entity extends DB.Entity {
  };
}

