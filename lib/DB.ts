
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
  }

  export interface Class<E extends Entity> {
    readonly tableName: string;
    toObject(entity: E): Object;
    initialize(obj: Object): E;
  }

  const defaultBackend: DBBackend = new LocalStorageBackend();
//  const defaultBackend: DBBackend = new IndexedDBBackend();
  var customBackend: DBBackend | null = null;

  export function getBackend(): DBBackend {
    return customBackend || defaultBackend;
  }

  export function all<E extends Entity>(klass: Class<E>): ReadonlyArray<Record<E>> {
    return getBackend().all(klass.tableName).map(function(x: [string,Object]): Record<E> {
      return {id: x[0], entity: klass.initialize(x[1])};
    });
  }

  export function find<E extends Entity>(klass: Class<E>, id: string): Record<E> | null {
    const raw: Object | null = getBackend().find(klass.tableName,id);
    if(raw){
      return {id: id, entity: klass.initialize(raw) };
    }else{
      return null;
    }
  }

  export function create<E extends Entity>(klass: Class<E>, entity: E): Record<E> | null {
    const res: [string, Object] | null = getBackend().insert(klass.tableName, klass.toObject(entity));
    return res ? {id: res[0], entity: klass.initialize(res[1])} : null;
  }

  export function modify<E extends Entity>(klass: Class<E>, record: Record<E>): Record<E> | null {
    const res: Object | null = getBackend().update(klass.tableName, record.id, klass.toObject(record.entity));
    return res ? {id: record.id, entity: klass.initialize(res)} : null;
  }

  export function delete_<E extends Entity>(klass: Class<E>, id: string): boolean {
    return getBackend().delete(klass.tableName, id);
  }
}

// https://python5.com/q/iribcvbi
