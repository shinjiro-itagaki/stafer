
import { DBBackend } from "./DBBackend";
import { LocalStorageBackend } from "./LocalStorageBackend";
import { IndexedDBBackend } from "./IndexedDBBackend";
import { v4 as uuid } from "uuid";

export module DB {

  export interface Entity {
  }

  export interface Record<E extends Entity> {
    readonly id: string;
    readonly entity: E;
    destroy(): boolean;
  }

  type NewRecordArg<E> = {readonly id: string, readonly entity: E, readonly table: Table<E>};

  class DefaultRecord<E extends Entity> implements Record<E> {
    public readonly id: string;
    public readonly entity: E;
    private readonly table: Table<E>;
    constructor(args: NewRecordArg<E>){
      this.id = args.id;
      this.entity = args.entity;
      this.table = args.table;
    }
    public destroy(): boolean {
      return delete_(this.table, this.id);
    }
  }

  export interface Table<E extends Entity> {
    readonly name: string;
    toObject(entity: E): Object;
    initialize(obj: Object): E;
    all(): ReadonlyArray<Record<E>>;
    find(id: string): Record<E> | null;
    create(e: E): Record<E> | null;
    delete(r: Record<E>): boolean;
  }

  export abstract class AbstractTable<E extends Entity> implements Table<E> {
    abstract get name(): string;
    public abstract toObject(entity: E): Object;
    public abstract initialize(obj: Object): E;
    public all(): ReadonlyArray<Record<E>> {
      return all(this);
    }
    public find(id: string): Record<E> | null {
      return find(this,id);
    }
    public create(e: E): Record<E> | null {
      return create(this,e);
    }
    public delete(r: Record<E>): boolean {
      return delete_(this,r.id);
    }
  }

  const defaultBackend: DBBackend = new LocalStorageBackend();
//  const defaultBackend: DBBackend = new IndexedDBBackend();
  var customBackend: DBBackend | null = null;

  export function getBackend(): DBBackend {
    return customBackend || defaultBackend;
  }

  function newRecord<E extends Entity>(args: NewRecordArg<E>): Record<E> {
    return new DefaultRecord(args);
  }

  export function all<E extends Entity>(table: Table<E>): ReadonlyArray<Record<E>> {
    return getBackend().all(table.name).map(function(x: [string,Object]): Record<E> {
      return newRecord({id: x[0], entity: table.initialize(x[1]), table: table});
    });
  }

  export function find<E extends Entity>(table: Table<E>, id: string): Record<E> | null {
    const raw: Object | null = getBackend().find(table.name,id);
    if(raw){
      return newRecord({id: id, entity: table.initialize(raw), table: table});
    }else{
      return null;
    }
  }

  export function create<E extends Entity>(table: Table<E>, entity: E): Record<E> | null {
    const res: [string, Object] | null = getBackend().insert(table.name, table.toObject(entity));
    return res ? newRecord({id: res[0], entity: table.initialize(res[1]), table: table}) : null;
  }

  export function modify<E extends Entity>(table: Table<E>, record: Record<E>): Record<E> | null {
    const res: Object | null = getBackend().update(table.name, record.id, table.toObject(record.entity));
    return res ? newRecord({id: record.id, entity: table.initialize(res), table: table}) : null;
  }

  export function delete_<E extends Entity>(table: Table<E>, id: string): boolean {
    return getBackend().delete(table.name, id);
  }
}

// https://python5.com/q/iribcvbi
