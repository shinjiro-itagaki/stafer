import { DB } from "./../../lib/DB";
import { Member } from "./Member";
import { Place } from "./Place";
import { Period } from "./Period";
import { ScheduleMemberMap } from "./ScheduleMemberMap";
import { SchedulePlaceMap } from "./SchedulePlaceMap";
import { SchedulePeriodMap } from "./SchedulePeriodMap";

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

  export type HasPositionEntity = DB.Entity & {position: number, deleteFlag: boolean};

  export interface HasPositionMap<E extends DB.Entity, MAP extends HasPositionEntity> {
    readonly list: ReadonlyArray<MAP>;
    upPositionOf(id: string): void;
    downPositionOf(id: string): void;
    findMapOf(id: string): MAP | undefined;
    getPositionOf(id: string): number | undefined;
    setRecord(r: DB.Record<Entity>, member: DB.Record<E>, options?: {checked?: boolean, position?: number}): void;
    setRecordById(r: DB.Record<Entity>, id: string, options?: {checked?: boolean, position?: number}): void;
    filteringRecords(members: ReadonlyArray<DB.Record<E>>): ReadonlyArray<DB.Record<E>>;
    findMapBy(args: {record_id: string, schedule_id: string}): DB.Record<MAP> | null;
    saveRecordsMap(schedule_id: string);
  }

  abstract class AbstractHasPositionMap<E extends DB.Entity, MAP extends HasPositionEntity> implements HasPositionMap<E, MAP>{
    protected readonly _list: MAP[] = [];

    protected abstract initializeRecord(schedule_id: string, record_id: string): MAP;

    get list(): ReadonlyArray<MAP> {
      return this._list;
    }

    protected abstract getFkey(x: MAP): string;
    protected abstract getScheduleId(x: MAP): string;

    public findMapOf(id: string): MAP | undefined {
      return this._list.find((x)=>this.getFkey(x) == id);
    }

    public getPositionOf(id: string): number | undefined {
      return this.findMapOf(id)?.position;
    }

    private sorted(): MAP[] {
      return this._list.sort((a,b) => b.position - a.position );
    }

    public upPositionOf(id: string): void {
      var prev: MAP | null = null;
      const list: ReadonlyArray<MAP> = this.sorted();
      const self = this;
      list.forEach(function(e: MAP, idx: number){
        const pos: number = list.length - idx;
        if(self.getFkey(e) == id && prev){
          e.position = prev.position;
          prev.position = pos;
        }else{
          e.position = pos;
        }
        prev = e;
      });
      // console.log(list);
    }

    public downPositionOf(id: string): void {
      var matched: MAP | null = null;
      const list: ReadonlyArray<MAP> = this.sorted();
      const self = this;
      list.forEach(function(e: MAP, idx: number){
        const pos: number = list.length - idx;
        e.position = pos;

        if(self.getFkey(e) == id){
          matched = e;
        }else{
          if(matched){
            e.position = matched.position;
            matched.position = pos;
            matched = null;
          }
        }
      });    
    }

    public setRecord(r: DB.Record<Entity>, record: DB.Record<E>, options?: {checked?: boolean, position?: number}): void {
      this.setRecordById(r, record.id,options);
    }

    public setRecordById(r: DB.Record<Entity>, id: string, options?: {checked?: boolean, position?: number}): void {
      var map: MAP | null = this.findMapOf(id) || null;
      if(!map){
        map = this.initializeRecord(r.id, id);
        this._list.push(map);
      }
      if(map){
        if(options?.checked !== undefined){
          map.deleteFlag = options.checked;
        }

        if(options?.position !== undefined) {
          map.position = options.position;
        }
      }
    }

    public filteringRecords(list: ReadonlyArray<DB.Record<E>>): ReadonlyArray<DB.Record<E>> {
      const dict: Map<string, DB.Record<E>> = new Map<string, DB.Record<E>>();
      list.forEach((x: DB.Record<E>) => {
        dict.set(x.id,x);
      });

      return this._list.map((m: MAP): DB.Record<E> | undefined => {
        return dict.get(this.getFkey(m))
      }).filter((x) : x is DB.Record<E> => {
        return !!x
      });
    }

    protected abstract get table(): DB.Table<MAP>;

    public findMapBy(args: {record_id: string, schedule_id: string}): DB.Record<MAP> | null {
      const self = this;
      return this.table.all().find(function(x: DB.Record<MAP>){ return self.getFkey(x.entity) == args.record_id && self.getScheduleId(x.entity) == args.schedule_id; }) || null;
    }

    public saveRecordsMap(schedule_id: string) {
      const self = this;
      this._list.forEach(function(x: MAP){
        const rec : DB.Record<MAP> | null = self.findMapBy({record_id: self.getFkey(x), schedule_id: schedule_id});
        if(rec){
          // alert(JSON.stringify(rec.entity));
          rec.entity.position = x.position;
          rec.save();
        }else{
          self.table.create(self.table.initialize({...x, schedule_id: schedule_id}));
        }
      });
    }
  }

  class MemberHasPositionMap extends AbstractHasPositionMap<Member.Entity, ScheduleMemberMap.Entity> {

    protected getFkey(x: ScheduleMemberMap.Entity): string {
      return x.member_id;
    }

    protected getScheduleId(x: ScheduleMemberMap.Entity): string {
      return x.schedule_id;
    }

    protected initializeRecord(schedule_id: string, record_id: string): ScheduleMemberMap.Entity {
      return ScheduleMemberMap.table.initialize({schedule_id: schedule_id, member_id: record_id});
    }

    protected get table(): DB.Table<ScheduleMemberMap.Entity> {
      return ScheduleMemberMap.table;
    }
  }

  class PlaceHasPositionMap extends AbstractHasPositionMap<Place.Entity, SchedulePlaceMap.Entity> {

    protected getFkey(x: SchedulePlaceMap.Entity): string {
      return x.place_id;
    }

    protected getScheduleId(x: SchedulePlaceMap.Entity): string {
      return x.schedule_id;
    }

    protected initializeRecord(schedule_id: string, record_id: string): SchedulePlaceMap.Entity {
      return SchedulePlaceMap.table.initialize({schedule_id: schedule_id, place_id: record_id});
    }

    protected get table(): DB.Table<SchedulePlaceMap.Entity> {
      return SchedulePlaceMap.table;
    }
  }

  class PeriodHasPositionMap extends AbstractHasPositionMap<Period.Entity, SchedulePeriodMap.Entity> {

    protected getFkey(x: SchedulePeriodMap.Entity): string {
      return x.period_id;
    }

    protected getScheduleId(x: SchedulePeriodMap.Entity): string {
      return x.schedule_id;
    }

    protected initializeRecord(schedule_id: string, record_id: string): SchedulePeriodMap.Entity {
      return SchedulePeriodMap.table.initialize({schedule_id: schedule_id, period_id: record_id});
    }

    protected get table(): DB.Table<SchedulePeriodMap.Entity> {
      return SchedulePeriodMap.table;
    }
  }

  export interface Entity extends DB.Entity {
    startDate: Date;
    endDate: Date;
    readonly members: HasPositionMap<Member.Entity, ScheduleMemberMap.Entity>;
    readonly places: HasPositionMap<Place.Entity, SchedulePlaceMap.Entity>;
    readonly periods: HasPositionMap<Period.Entity, SchedulePeriodMap.Entity>;
  };

  class EntityImpl implements Entity {
    private start: Date = new Date(0);
    private end  : Date = new Date(0);

    readonly members: HasPositionMap<Member.Entity, ScheduleMemberMap.Entity> = new MemberHasPositionMap(); 

    readonly places: HasPositionMap<Place.Entity, SchedulePlaceMap.Entity> = new PlaceHasPositionMap();

    readonly periods: HasPositionMap<Period.Entity, SchedulePeriodMap.Entity> = new PeriodHasPositionMap();

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
