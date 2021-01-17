import { DB } from "./../../lib/DB";

export module TagCategory {
  
  class Table extends DB.AbstractTable<Entity> {
    public readonly name: string = "tag_categories";

    public toObject(entity: Entity): Object {
      return {label: entity.label};
    }

    public initialize(obj: Object): Entity {
      return {label: String(obj["label"] || "")};
    }

    public mkFilter(cond: Object): (r: DB.Record<Entity>) => boolean {
      return function(r: DB.Record<Entity>){
        const label    : string | undefined = cond["label"];
//        const position: number | undefined = cond["position"];
        return ( label == undefined ? true : String(label) == r.entity.label ) 
//          && ( position == undefined ? true : Number(position) == r.entity.position )
      }
    }
  }

  export const table: DB.Table<Entity> = new Table();

  export interface Entity extends DB.Entity {
    label: string;
  };
}
