import { v4 as uuid } from "uuid";
import { DBBackend, Migration, ColumnInfo } from "./DBBackend";

const openRequest: IDBOpenDBRequest = indexedDB.open('23B281C0-7144-4DA6-9D11-6CF805F17174');
var connection : IDBDatabase | null = null;

openRequest.onsuccess = function(e: any){
  connection = openRequest.result;
}

openRequest.onupgradeneeded = function(event) {
//   connection = event?.target?.result;
};

const tables: Map<string, IDBObjectStore> = new Map<string, IDBObjectStore>();

export class IndexedDBBackend implements DBBackend {

  constructor() {
  }
  
  protected getTable(tablename: string): IDBObjectStore | null {
    return tables.get(tablename) || null;
  }

  public migrate(migrations: ReadonlyArray<Migration>): boolean {
    migrations.forEach(function(m: Migration){
      const objectStore: IDBObjectStore | undefined = connection?.createObjectStore(m.tableName, { keyPath: "id" });
      if(objectStore){
        m.columns.forEach(function(c: ColumnInfo){
          objectStore.createIndex(c.name, c.name, c.params);
        });
        tables[m.tableName] = objectStore;
      }
    });
    return true;
  }

  public isPrepared(): boolean {
    return !!connection;
  }

  public delete(tablename: string, id: string): boolean {
    const tbl : IDBObjectStore | null = this.getTable(tablename);
    if(!tbl){
      return false;
    }
    tbl.delete(id);
    return !!tbl.get(id).result;
  }

  public insert(tablename: string, data: Object): [string,Object] | null {
    return this.save(tablename,null,data);
  }

  public update(tablename: string, id: string, data: Object): Object | null {
    const res: [string,Object] | null = this.save(tablename,id,data);
    return res ? res[1] : null;
  }

  public find(tablename: string, id: string): Object | null {
    return this.loadRawData(tablename, id);
  }

  public all(tablename: string): ReadonlyArray<[string,Object]> {
    const tbl : IDBObjectStore | null = this.getTable(tablename);
    if(!tbl){
      return [];
    }
    return tbl.getAll().result.map(function(obj: Object): [string,Object] | null {
      return obj["id"] ? [obj["id"], obj] : null;
    }).filter((x): x is [string,Object] => !!x);
  }

  protected save(tablename: string, idorg: string | null, obj: Object): [string,Object] | null {
    const id: string = idorg || uuid();
    const tbl : IDBObjectStore | null = this.getTable(tablename);
    if(!tbl){
      return null
    }
    tbl.put(obj,id);
    const newobj : Object | null = tbl.get(id).result;
    return newobj ? [id, newobj] : null;
  }

  protected getAllRecordIds(tablename: string): ReadonlyArray<string> {
    const tbl : IDBObjectStore | null = this.getTable(tablename);
    if(!tbl){
      return [];
    }
    return tbl.getAllKeys().result.filter((x) : x is string => !!x).map( function(x){ return x; } );
  }

  protected loadRawData(tablename: string, id: string): Object | null {
    const tbl : IDBObjectStore | null = this.getTable(tablename);
    if(!tbl){
      return null;
    }
    return tbl.get(id).result;
  }
  
}
