import { DB } from "./../../lib/DB";
import { Tag } from "./Tag";

export module Member {

  export interface Entity extends DB.Entity {
    name: string;
  };

  class Class implements DB.Class<Entity> {
    readonly tableName: string = "members";
    public toObject(entity: Entity): Object {
      return {};
    }

    public initialize(obj: Object): Entity {
      return { name: "dummy" };
    }
  }

  export const klass: DB.Class<Entity> = new Class();
}

