import { DB } from "./../../lib/DB";

export module TagMemberMap {
  
  class TagMemberMapClass implements DB.Class<Entity> {
    public readonly tableName = "tag_member_map";

    public toObject(entity: Entity): Object {
      return {};
    }

    public initialize(obj: Object): Entity {
      return {};
    }    
  }

  const klass: TagMemberMapClass = new TagMemberMapClass();

  export interface Entity extends DB.Entity {
    readonly tag_id: string;
    readonly member_id: string;
  };
}
