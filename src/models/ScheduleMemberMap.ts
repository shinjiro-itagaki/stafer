import { DB } from "./../../lib/DB";

export module ScheduleMemberMap {
  
  class Table extends DB.AbstractTable<Entity> {
    public readonly name: string = "schedule_member_map";

    public toObject(entity: Entity): Object {
      return entity;
    }

    public initialize(obj: Object): Entity {
      return {
        member_id: String(obj["member_id"]) || "",
        schedule_id: String(obj["schedule_id"]) || "",
        position: Number(obj["position"]) || 0,
      };
    }

    public all(): ReadonlyArray<DB.Record<Entity>> {
      return ([] as DB.Record<Entity>[]).concat(super.all()).sort(function(a: DB.Record<Entity>, b: DB.Record<Entity>){ return b.entity.position - a.entity.position; } );
    }

    public allOf(schedule_id: string): ReadonlyArray<DB.Record<Entity>> | null {
      return this.all().filter((x: DB.Record<Entity>) => { x.entity.schedule_id == schedule_id });
    }
  }

  export const table: Table = new Table();

  export interface Entity extends DB.Entity {
    readonly member_id: string;
    readonly schedule_id: string;
    position: number;
  };
}

