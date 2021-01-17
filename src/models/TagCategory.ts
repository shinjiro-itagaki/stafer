import { DB } from "./../../lib/DB";

import { HasPositionMap } from "./traits/HasPositionMap";

export module TagCategory {
  
  class Table extends DB.AbstractTable<Entity> {
    public readonly name: string = "tag_categories";

    public toObject(entity: Entity): Object {
      return {label: entity.label, position: entity.position};
    }

    public initialize(obj: Object): Entity {
      return {label: String(obj["label"] || ""), position: Number(obj["position"] || 1)};
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
  }

  export interface Entity extends DB.Entity, EntityProps {
  };

  class EntityImpl implements Entity {
    public label: string;
    public position: number;
    
    constructor(args: EntityProps){
      this.label = args.label;
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
