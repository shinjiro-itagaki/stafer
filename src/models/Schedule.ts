import { DB } from "./../../lib/DB";
import { Member } from "./Member";
import { Place } from "./Place";
import { Period } from "./Period";
import { ScheduleMemberMap } from "./ScheduleMemberMap";
import { SchedulePlaceMap } from "./SchedulePlaceMap";
import { SchedulePeriodMap } from "./SchedulePeriodMap";

import { HasPositionMap } from "./traits/HasPositionMap";

export module Schedule {
  
  class Table extends DB.AbstractTable<Entity> {
    public readonly name: string = "schedules";

    public toObject(entity: Entity): Object {
      return {start: entity.startDate.getTime(), end: entity.endDate.getTime()};
    }

    public initialize(obj: Object): Entity {
      return new EntityImpl(obj);
    }

    public afterFind(r: DB.Record<Entity>): void {
      loadRecordsMap(r);
    }

    public afterCreate(r: DB.Record<Entity>,e: Entity): void {
      this.saveMembersMap(r,e);
    }

    public afterModify(rnew: DB.Record<Entity>,rold: DB.Record<Entity>): void {
      this.saveMembersMap(rnew,rold.entity);
    }

    private saveMembersMap(schedule: DB.Record<Entity>, e: Entity) {
      e.members.saveRecordsMap(schedule.id);
      e.places.saveRecordsMap(schedule.id);
      e.periods.saveRecordsMap(schedule.id);
    }

    public afterSave(r: DB.Record<Entity>): void {
    }

    public mkFilter(cond: Object): (r: DB.Record<Entity>) => boolean {
      return function(r: DB.Record<Entity>){
        return true;
        // const startDate: Date | undefined = cond["startDate"];
        // const endDate  : Date | undefined = cond["endDate"];
        // return ( startDate == undefined ? true : r.entity.startDate ) 
        //   && ( position == undefined ? true : Number(position) == r.entity.position )
      }
    }
  }

  export const table: Table = new Table();

  class MemberHasPositionMap extends HasPositionMap.AbstractHasPositionMap<Member.Entity, ScheduleMemberMap.Entity, Entity> {

    protected getKey(x: ScheduleMemberMap.Entity): string {
      return x.member_id;
    }

    protected getParentId(x: ScheduleMemberMap.Entity): string {
      return x.schedule_id;
    }

    protected initializeRecord(schedule_id: string, record_id: string, options?: ScheduleMemberMap.Entity): ScheduleMemberMap.Entity {
      return ScheduleMemberMap.table.initialize({...options, schedule_id: schedule_id, member_id: record_id});
    }

    protected get table(): DB.Table<ScheduleMemberMap.Entity> {
      return ScheduleMemberMap.table;
    }
  }

  class PlaceHasPositionMap extends HasPositionMap.AbstractHasPositionMap<Place.Entity, SchedulePlaceMap.Entity, Entity> {

    protected getKey(x: SchedulePlaceMap.Entity): string {
      return x.place_id;
    }

    protected getParentId(x: SchedulePlaceMap.Entity): string {
      return x.schedule_id;
    }

    protected initializeRecord(schedule_id: string, record_id: string, options?: SchedulePlaceMap.Entity): SchedulePlaceMap.Entity {
      return SchedulePlaceMap.table.initialize({...options, schedule_id: schedule_id, place_id: record_id});
    }

    protected get table(): DB.Table<SchedulePlaceMap.Entity> {
      return SchedulePlaceMap.table;
    }
  }

  class PeriodHasPositionMap extends HasPositionMap.AbstractHasPositionMap<Period.Entity, SchedulePeriodMap.Entity, Entity> {

    protected getKey(x: SchedulePeriodMap.Entity): string {
      return x.period_id;
    }

    protected getParentId(x: SchedulePeriodMap.Entity): string {
      return x.schedule_id;
    }

    protected initializeRecord(schedule_id: string, record_id: string, options?: SchedulePeriodMap.Entity): SchedulePeriodMap.Entity {
      return SchedulePeriodMap.table.initialize({...options, schedule_id: schedule_id, period_id: record_id});
    }

    protected get table(): DB.Table<SchedulePeriodMap.Entity> {
      return SchedulePeriodMap.table;
    }
  }

  export interface Entity extends DB.Entity {
    startDate: Date;
    endDate: Date;
    readonly members: HasPositionMap.HasPositionMap<Member.Entity, ScheduleMemberMap.Entity,Entity>;
    readonly places: HasPositionMap.HasPositionMap<Place.Entity, SchedulePlaceMap.Entity,Entity>;
    readonly periods: HasPositionMap.HasPositionMap<Period.Entity, SchedulePeriodMap.Entity,Entity>;
  };

  class EntityImpl implements Entity {
    private start: Date = new Date(0);
    private end  : Date = new Date(0);

    readonly members: HasPositionMap.HasPositionMap<Member.Entity, ScheduleMemberMap.Entity,Entity> = new MemberHasPositionMap(); 

    readonly places: HasPositionMap.HasPositionMap<Place.Entity, SchedulePlaceMap.Entity,Entity> = new PlaceHasPositionMap();

    readonly periods: HasPositionMap.HasPositionMap<Period.Entity, SchedulePeriodMap.Entity,Entity> = new PeriodHasPositionMap();

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

  export function current(): DB.Record<Entity> | null {
    const now: Date = new Date();
    const newEntity = new EntityImpl({});
    newEntity.startDate = now;
    newEntity.endDate   = new Date(now.getTime() + 7 * 24 * 3600 * 1000 - 1000);
    _current ||= table.first() || table.create(newEntity);
    return _current;
  }

  export function loadRecordsMap(r: DB.Record<Entity>): void {
    ScheduleMemberMap.table.allOf(r).forEach((x) => {
      r.entity.members.setRecordById(r, x.entity.member_id, x.entity);
    });

    SchedulePlaceMap.table.allOf(r).forEach((x) => {
      r.entity.places.setRecordById(r, x.entity.place_id, x.entity);
    });

    SchedulePeriodMap.table.allOf(r).forEach((x) => {
      r.entity.periods.setRecordById(r, x.entity.period_id, x.entity);
    });
  }
}
