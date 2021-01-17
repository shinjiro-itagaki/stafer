import { DB } from "./../../lib/DB";
import { Schedule } from "./Schedule";

export module Place {
  export interface Entity extends DB.Entity {
    name: string;
    position: number;
    cost?: number;
    max?: number; // 配置数の上限
    min?: number; // 配置数の下限（必要人数）
  };

  class Table extends DB.AbstractTable<Entity> {
    readonly name: string = "places";
    public toObject(entity: Entity): Object {
      return {name: entity.name};
    }

    public initialize(obj: Object): Entity {
      return { name: String(obj["name"] || "dummy"), position: Number(obj["position"] || 0) };
    }

    public all(): ReadonlyArray<DB.Record<Entity>> {
      return ([] as DB.Record<Entity>[]).concat(super.all()).sort(function(a: DB.Record<Entity>, b: DB.Record<Entity>){ return b.entity.position - a.entity.position; } );
    }

    public mkFilter(cond: Object): (r: DB.Record<Entity>) => boolean {
      return function(r: DB.Record<Entity>){
        const name    : string | undefined = cond["name"];
        const position: number | undefined = cond["position"];
        return ( name == undefined ? true : String(name) == r.entity.name ) 
          && ( position == undefined ? true : Number(position) == r.entity.position )
      }
    }
  }

  export const table: DB.Table<Entity> = new Table();
}

