import { DB } from "./../../lib/DB";
import { Tag } from "./Tag";

export module Member {

  export interface Entity extends DB.Entity {
    name: string;
    position: number;
  };

  class Table extends DB.AbstractTable<Entity> {
    readonly name: string = "members";
    public toObject(entity: Entity): Object {
      return {name: entity.name};
    }

    public initialize(obj: Object): Entity {
      return { name: String(obj["name"] || "dummy"), position: Number(obj["position"] || 0) };
    }

    public all(): ReadonlyArray<DB.Record<Entity>> {
      return ([] as DB.Record<Entity>[]).concat(super.all()).sort(function(a: DB.Record<Entity>, b: DB.Record<Entity>){ return b.entity.position - a.entity.position; } );
    }
  }

  export const table: DB.Table<Entity> = new Table();
}

