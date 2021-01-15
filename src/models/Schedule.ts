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

    public afterFind(r: DB.Record<Entity>): void {
      loadMembersMap(r);
    }

    public afterCreate(r: DB.Record<Entity>,e: Entity): void {
      this.saveMembersMap(r.id,e);
    }

    public afterModify(rnew: DB.Record<Entity>,rold: DB.Record<Entity>): void {
      this.saveMembersMap(rnew.id, rold.entity);
    }

    private saveMembersMap(schedule_id: string, e: Entity) {
      e.members.forEach(function(x: ScheduleMemberMap.Entity){
        const rec : DB.Record<ScheduleMemberMap.Entity> | null = ScheduleMemberMap.table.findBy({member_id: x.member_id, schedule_id: schedule_id});
        if(rec){
          rec.entity.position = x.position;
          rec.save();
          rec.entity.position
        }else{
          ScheduleMemberMap.table.create({...x, schedule_id: schedule_id});
        }
      });      
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

  export interface Entity extends DB.Entity {
    startDate: Date;
    endDate: Date;
    readonly members: ReadonlyArray<ScheduleMemberMap.Entity>;
    upPositionOf(member_id: string): void;
    downPositionOf(member_id: string): void;
    findMemberMapOf(member_id: string): ScheduleMemberMap.Entity | undefined;
    getPositionOf(member_id: string): number | undefined;
    setMember(member: DB.Record<Member.Entity>, options?: {checked?: boolean, position?: number}): void;
    setMemberById(member_id: string, options?: {checked?: boolean, position?: number}): void;
    filteringMembers(members: ReadonlyArray<DB.Record<Member.Entity>>): ReadonlyArray<DB.Record<Member.Entity>>;
  };

  class EntityImpl implements Entity {
    private start: Date = new Date(0);
    private end  : Date = new Date(0);
    private _members: ScheduleMemberMap.Entity[] = [];

    constructor(obj: Object){
      this.start = new Date(Number(obj["start"]));
      this.end   = new Date(Number(obj["end"]));
    }

    get members(): ReadonlyArray<ScheduleMemberMap.Entity> {
      // return this._members.sort((a,b) => b.position - a.position );
      return this._members;
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

    public findMemberMapOf(member_id: string): ScheduleMemberMap.Entity | undefined {
      return this._members.find((x)=>x.member_id == member_id);
    }

    public getPositionOf(member_id: string): number | undefined {
      return this.findMemberMapOf(member_id)?.position;
    }

    private sortedMembers(): ScheduleMemberMap.Entity[] {
      return this._members.sort((a,b) => b.position - a.position );
    }

    public upPositionOf(member_id: string): void {
      var prev: ScheduleMemberMap.Entity | null = null;
      const list: ReadonlyArray<ScheduleMemberMap.Entity> = this.sortedMembers();
      list.forEach(function(e: ScheduleMemberMap.Entity, idx: number){
        const pos: number = list.length - idx;
        if(e.member_id == member_id && prev){
          e.position = prev.position;
          prev.position = pos;
        }else{
          e.position = pos;
        }
        prev = e;
      });
    }

    public downPositionOf(member_id: string): void {
      var matched: ScheduleMemberMap.Entity | null = null;
      const list: ReadonlyArray<ScheduleMemberMap.Entity> = this.sortedMembers();
      list.forEach(function(e: ScheduleMemberMap.Entity, idx: number){
        const pos: number = list.length - idx;
        e.position = pos;

        if(e.member_id == member_id){
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

    public setMember(member: DB.Record<Member.Entity>, options?: {checked?: boolean, position?: number}): void {
      this.setMemberById(member.id,options);
    }

    public setMemberById(member_id: string, options?: {checked?: boolean, position?: number}): void {
      var map: ScheduleMemberMap.Entity | null = this.findMemberMapOf(member_id) || null;
      if(!map){
        map = ScheduleMemberMap.table.initialize({member_id: member_id});
        this._members.push(map);
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

    public filteringMembers(members: ReadonlyArray<DB.Record<Member.Entity>>): ReadonlyArray<DB.Record<Member.Entity>> {
      const dict: Map<string, DB.Record<Member.Entity>> = new Map<string, DB.Record<Member.Entity>>();
      members.forEach((x: DB.Record<Member.Entity>) => {
        dict.set(x.id,x);
      });

      return this._members.map((m: ScheduleMemberMap.Entity): DB.Record<Member.Entity> | undefined => {
        return dict.get(m.member_id)
      }).filter((x) : x is DB.Record<Member.Entity> => {
        return !!x
      });
    }
  }

  var _current: DB.Record<Entity> | null = null;

  export function current(): DB.Record<Entity> | null {
    const now: Date = new Date();
    const newEntity = new EntityImpl({});
    newEntity.startDate = now;
    newEntity.endDate   = new Date(now.getTime() + 7 * 24 * 3600 * 1000 - 1000);
    return _current ||= table.create(newEntity);
  }

  export function loadMembersMap(r: DB.Record<Entity>): void {
    ScheduleMemberMap.table.allOf(r,true).forEach((x) => {
      r.entity.setMemberById(x.entity.member_id, x.entity);
    })
  }
}
