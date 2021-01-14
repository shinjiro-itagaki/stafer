import { DB } from "./../../lib/DB";
import { Member } from "./Member";
import { ScheduleMemberMap } from "./ScheduleMemberMap";

export module Schedule {
  
  class Table extends DB.AbstractTable<Entity> {
    public readonly name: string = "schedules";

    public toObject(entity: Entity): Object {
      return {start: entity.startDate.getTime(), end: entity.endDate.getTime()};
    }

    public initialize(obj: Object): Entity {
      return new EntityImpl(obj);
    }    
  }

  export const table: Table = new Table();

  export interface Entity extends DB.Entity {
    startDate: Date;
    endDate: Date;
  };

  class EntityImpl implements Entity {
    private start: Date = new Date(0);
    private end  : Date = new Date(0);

    constructor(obj: Object){
      this.start = new Date(Number(obj["start"]));
      this.end   = new Date(Number(obj["end"]));
    }

    get startDate(): Date {
      return this.start;
    }

    set startDate(v: Date) {
      this.start = v;
    }

    get endDate(): Date {
      return this.end;
    }

    set endDate(v: Date) {
      this.end = v;
    }
  }

  var _current: DB.Record<Entity> | null = null;

  function members(record: DB.Record<Entity>): DB.Record<Member.Entity>[] {
    return ScheduleMemberMap.table.all()
      .filter(function(m: DB.Record<ScheduleMemberMap.Entity>): boolean { return m.entity.schedule_id == record.id; })
      .map((m) => Member.table.find(m.entity.member_id))
      .filter((m): m is DB.Record<Member.Entity> => !!m)
  }

  function getScheduleMemberMapsOf(record: DB.Record<Entity>): ReadonlyArray<DB.Record<ScheduleMemberMap.Entity>> {
    return ScheduleMemberMap.table.all().filter((x) => x.entity.schedule_id == record.id);
  }

  function getMemberMapOf(record: DB.Record<Entity>, member_id: string): DB.Record<ScheduleMemberMap.Entity> | null {
    return getScheduleMemberMapsOf(record).find((x) => x.entity.member_id == member_id) || null;
  }

  export function setMember(record: DB.Record<Entity>, member_id: string, onoff: boolean, position: number): void {
    const map: DB.Record<ScheduleMemberMap.Entity> | null = getMemberMapOf(record,member_id);
    if(onoff){
      if(!map){
        ScheduleMemberMap.table.create({member_id: member_id, schedule_id: record.id, position: position});
      }
    }else{
      if(map){
        map.destroy();
      }
    }
    
  }

  export function getPositionOf(record: DB.Record<Entity>, member_id: string): number | undefined {
    return getMemberMapOf(record,member_id)?.entity.position || undefined;
  }

  export function current(): DB.Record<Entity> | null {
    const now: Date = new Date();
    return _current ||= table.create({startDate: now, endDate: new Date(now.getTime() + 7 * 24 * 3600 * 1000 - 1000) });
  }

  export function upPositionOf(record: DB.Record<Entity>, member_id: string): void {
    var prev: DB.Record<ScheduleMemberMap.Entity> | null = null;
    getScheduleMemberMapsOf(record).forEach(function(r: DB.Record<ScheduleMemberMap.Entity>, idx: number){
      const pos: number = idx + 1;
      if(r.entity.member_id == member_id && prev){
        r.entity.position = prev.entity.position;
        prev.entity.position = pos;
      }else{
        r.entity.position = pos;
      }
      prev = r;
    });
  }

  export function downPositionOf(record: DB.Record<Entity>, member_id: string): void {
    var matched: DB.Record<ScheduleMemberMap.Entity> | null = null;
    getScheduleMemberMapsOf(record).forEach(function(r: DB.Record<ScheduleMemberMap.Entity>, idx: number){
      const pos: number = idx + 1;
      r.entity.position = pos;

      if(r.entity.member_id == member_id){
        matched = r;
      }else{
        if(matched){
          r.entity.position = matched.entity.position;
          matched.entity.position = pos;
          matched = null;
        }
      }
    });    
  }

  export function saveMapsOf(record: DB.Record<Entity>): void {
    
  }
}
