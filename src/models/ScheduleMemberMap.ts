import { DB } from "./../../lib/DB";
import { Schedule } from "./Schedule";

export module ScheduleMemberMap {
  
  class Table extends DB.AbstractTable<Entity> {
    public readonly name: string = "schedule_member_map";

    public toObject(entity: Entity): Object {
      return {
        meber_id: entity.member_id,
        schedule_id: entity.schedule_id,
        position: entity.position,
      };
    }

    public initialize(obj: Object): Entity {
      return {
        member_id: String(obj["member_id"]) || "",
        schedule_id: String(obj["schedule_id"]) || "",
        position: Number(obj["position"]) || 1,
        deleteFlag: false,
      };
    }

    public all(): ReadonlyArray<DB.Record<Entity>> {
      return ([] as DB.Record<Entity>[]).concat(super.all()).sort(function(a: DB.Record<Entity>, b: DB.Record<Entity>){ return b.entity.position - a.entity.position; } );
    }

    public allOf(schedule: DB.Record<Schedule.Entity>, oncache: boolean = false): ReadonlyArray<DB.Record<Entity>> {
      return (oncache ? this.cache.all() : this.all()).filter((x: DB.Record<Entity>) => { x.entity.schedule_id == schedule.id });
    }

    public findBy(args: {member_id: string, schedule_id: string}): DB.Record<Entity> | null {
      return this.all().find(function(x: DB.Record<Entity>){ return x.entity.member_id == args.member_id && x.entity.schedule_id == args.schedule_id; }) || null;
    }

    public mkFilter(cond: Object): (r: DB.Record<Entity>) => boolean {
      return function(r: DB.Record<Entity>){
        return true;
      }
    }
  }

  export const table: Table = new Table();

  export interface Entity extends DB.Entity {
    readonly member_id: string;
    readonly schedule_id: string;
    position: number;
    deleteFlag: boolean;
  };
}

