import { DB } from "./../../lib/DB";

import { TagCategory } from "./TagCategory";
import { HasPositionMap } from "./traits/HasPositionMap";

export module Tag {
  
  class Table extends DB.AbstractTable<Entity> {
    public readonly name: string = "tags";

    public toObject(entity: Entity): Object {
      return {label: entity.label, position: entity.position, category_id: entity.category_id};
    }

    public initialize(obj: Object): Entity {
      const catid: string | undefined = obj["category_id"];
      return new EntityImpl({label: String(obj["label"] || ""), position: Number(obj["position"] || 1), category_id: catid ? String(catid) : undefined});
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

  export interface EntityProps {
    label: string;
    position: number;
    category_id?: string;
  }

  export interface Entity extends DB.Entity, EntityProps {
    category(): DB.Record<TagCategory.Entity> | null;
  };

  class EntityImpl implements Entity {
    public label: string;
    public category_id?: string;
    public position: number;
    public category(): DB.Record<TagCategory.Entity> | null {
      return this.category_id ? TagCategory.table.find(this.category_id) : null;
    }
    
    constructor(args: EntityProps){
      this.label = args.label;
      this.category_id = args.category_id;
      this.position = args.position;
    }
  }

  export function mkEntity(args: EntityProps): Entity {
    return new EntityImpl(args);
  }

  export class List extends HasPositionMap.HasPositionRecordList<Entity> {
    protected get table(): DB.Table<Entity> {
      return table;
    }
  }
}

