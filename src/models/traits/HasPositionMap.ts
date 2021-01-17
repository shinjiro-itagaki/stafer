import { DB } from "./../../../lib/DB";

export module HasPositionMap {
  export type HasPositionEntity = DB.Entity & {position: number, deleteFlag: boolean};

  export interface HasPositionMap<E extends DB.Entity, MAP extends HasPositionEntity, P extends DB.Entity> {
    readonly list: ReadonlyArray<MAP>;
    upPositionOf(id: string): void;
    downPositionOf(id: string): void;
    findMapOf(id: string): MAP | undefined;
    getPositionOf(id: string): number | undefined;
    setRecord(r: DB.Record<P>, member: DB.Record<E>, options?: {checked?: boolean, position?: number}): void;
    setRecordById(r: DB.Record<P>, id: string, options?: {checked?: boolean, position?: number}): void;
    filteringRecords(members: ReadonlyArray<DB.Record<E>>): ReadonlyArray<DB.Record<E>>;
    findMapBy(args: {record_id: string, parent_id: string}): DB.Record<MAP> | null;
    saveRecordsMap(parent_id: string);
  }

  export abstract class AbstractHasPositionMap<E extends DB.Entity, MAP extends HasPositionEntity, P extends DB.Entity> implements HasPositionMap<E, MAP, P>{
    protected readonly _list: MAP[] = [];

    protected abstract initializeRecord(parent_id: string, record_id: string, options?: MAP): MAP;

    get list(): ReadonlyArray<MAP> {
      return this._list;
    }

    protected abstract getFkey(x: MAP): string;
    protected abstract getParentId(x: MAP): string;

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
        return dict.get(this.getFkey(m))
      }).filter((x) : x is DB.Record<E> => {
        return !!x
      });
    }

    protected abstract get table(): DB.Table<MAP>;

    public findMapBy(args: {record_id: string, parent_id: string}): DB.Record<MAP> | null {
      const self = this;
      return this.table.all().find(function(x: DB.Record<MAP>){ return self.getFkey(x.entity) == args.record_id && self.getParentId(x.entity) == args.parent_id; }) || null;
    }

    public saveRecordsMap(parent_id: string) {
      const self = this;
      this._list.forEach(function(x: MAP){
        const rec : DB.Record<MAP> | null = self.findMapBy({record_id: self.getFkey(x), parent_id: parent_id});
        if(rec){
          // alert(JSON.stringify(rec.entity));
          rec.entity.position = x.position;
          rec.save();
        }else{
          self.table.create(self.initializeRecord(parent_id, self.getFkey(x), x));
        }
      });
    }
  }
}
