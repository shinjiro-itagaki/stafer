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

    public afterSave(r: DB.Record<Entity>): void {
      r.entity.members.forEach(function(x: ScheduleMemberMap.Entity){
        const rec : DB.Record<ScheduleMemberMap.Entity> | null = ScheduleMemberMap.table.findBy({member_id: x.member_id, schedule_id: r.id});
        if(rec){
          rec.entity.position = x.position;
          rec.save();
        }else{
          ScheduleMemberMap.table.create(x);
        }
      });
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

  // function members(record: DB.Record<Entity>): DB.Record<Member.Entity>[] {
  //   return ScheduleMemberMap.table.all()
  //     .filter(function(m: DB.Record<ScheduleMemberMap.Entity>): boolean { return m.entity.schedule_id == record.id; })
  //     .map((m) => Member.table.find(m.entity.member_id))
  //     .filter((m): m is DB.Record<Member.Entity> => !!m)
  // }

  // function getScheduleMemberMapsOf(record: DB.Record<Entity>, oncache: boolean): ReadonlyArray<DB.Record<ScheduleMemberMap.Entity>> {
  //   return ScheduleMemberMap.table.allOf(record,oncache) || [];
  // }

  // function getMemberMapOf(record: DB.Record<Entity>, member_id: string, oncache: boolean): DB.Record<ScheduleMemberMap.Entity> | null {
  //   return getScheduleMemberMapsOf(record,oncache).find((x) => x.entity.member_id == member_id) || ScheduleMemberMap.table.create({schedule_id: record.id, member_id: member_id, position: 1});
  // }

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
