import { DB } from "./../../../lib/DB";

export module HasPositionMap {
  export type HasPositionEntity = DB.Entity & {position: number, deleteFlag: boolean};

  export interface HasPositionList<E> {
    readonly list: ReadonlyArray<E>;
    upPositionOf(id: string): void;
    downPositionOf(id: string): void;
  }

  export interface HasPositionMap<E extends DB.Entity, MAP extends HasPositionEntity, P extends DB.Entity> extends HasPositionList<MAP>{
    findMapOf(id: string): MAP | undefined;
    getPositionOf(id: string): number | undefined;
    setRecord(r: DB.Record<P>, member: DB.Record<E>, options?: {checked?: boolean, position?: number}): void;
    setRecordById(r: DB.Record<P>, id: string, options?: {checked?: boolean, position?: number}): void;
    filteringRecords(members: ReadonlyArray<DB.Record<E>>): ReadonlyArray<DB.Record<E>>;
    findMapBy(args: {record_id: string, parent_id: string}): DB.Record<MAP> | null;
    saveRecordsMap(parent_id: string);
  }

  export abstract class AbstractHasPositionList<E> implements HasPositionList<E> {
    protected readonly _list: E[] = [];

    public abstract getPosition(e: E): number;
    public abstract setPosition(e: E,pos: number): void;
    protected abstract getKey(x: E): string;

    get list(): ReadonlyArray<E> {
      return this._list;
    }

    protected sorted(): E[] {
      const self = this;
      return this._list.sort((a,b) => self.getPosition(b) - self.getPosition(a) );
    }

    public upPositionOf(id: string): void {
      var prev: E | null = null;
      const list: ReadonlyArray<E> = this.sorted();
      const self = this;
      list.forEach(function(e: E, idx: number){
        const pos: number = list.length - idx;
        if(self.getKey(e) == id && prev){
          self.setPosition(e,self.getPosition(prev));
          self.setPosition(prev,pos);
        }else{
          self.setPosition(e,pos);
        }
        prev = e;
      });
      // console.log(list);
    }

    public downPositionOf(id: string): void {
      var matched: E | null = null;
      const list: ReadonlyArray<E> = this.sorted();
      const self = this;
      list.forEach(function(e: E, idx: number){
        const pos: number = list.length - idx;
        self.setPosition(e,pos);

        if(self.getKey(e) == id){
          matched = e;
        }else{
          if(matched){
            self.setPosition(e,self.getPosition(matched));
            self.setPosition(matched,pos);
            matched = null;
          }
        }
      });
    }
  }

  export abstract class AbstractHasPositionMap<E extends DB.Entity, MAP extends HasPositionEntity, P extends DB.Entity> extends AbstractHasPositionList<MAP> implements HasPositionMap<E, MAP, P>{

    protected abstract initializeRecord(parent_id: string, record_id: string, options?: MAP): MAP;
    protected abstract getParentId(x: MAP): string;
    protected abstract get table(): DB.Table<MAP>;

    public getPosition(e: MAP): number {
      return e.position;
    }

    public setPosition(e: MAP,pos: number): void {
      e.position = pos;
    }

    public findMapOf(id: string): MAP | undefined {
      return this._list.find((x)=>this.getKey(x) == id);
    }

    public getPositionOf(id: string): number | undefined {
      return this.findMapOf(id)?.position;
    }

    public setRecord(r: DB.Record<P>, record: DB.Record<E>, options?: {checked?: boolean, position?: number}): void {
      this.setRecordById(r, record.id,options);
    }

    public setRecordById(r: DB.Record<P>, id: string, options?: {checked?: boolean, position?: number}): void {
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
        return dict.get(this.getKey(m))
      }).filter((x) : x is DB.Record<E> => {
        return !!x
      });
    }

    public findMapBy(args: {record_id: string, parent_id: string}): DB.Record<MAP> | null {
      const self = this;
      return this.table.all().find(function(x: DB.Record<MAP>){ return self.getKey(x.entity) == args.record_id && self.getParentId(x.entity) == args.parent_id; }) || null;
    }

    public saveRecordsMap(parent_id: string) {
      const self = this;
      this._list.forEach(function(x: MAP){
        const rec : DB.Record<MAP> | null = self.findMapBy({record_id: self.getKey(x), parent_id: parent_id});
        if(rec){
          // alert(JSON.stringify(rec.entity));
          rec.entity.position = x.position;
          rec.save();
        }else{
          self.table.create(self.initializeRecord(parent_id, self.getKey(x), x));
        }
      });
    }
  }
}
