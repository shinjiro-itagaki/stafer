import { v4 as uuid } from "uuid";
import { ModelBackend } from "./ModelBackend";

export class LocalStorageBackend implements ModelBackend {

  public delete_(tablename: string, id: string): boolean {
    const key: string = this.getRecordKey(tablename,id);
    localStorage.removeItem(key);
    return this.removeRecordKeys(tablename,[id]);
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
    const self: this = this;
    return this.getAllRecordIds(tablename).map(function(id: string): [string,Object] | null {
      const res: Object | null = self.find(tablename,id);
      return res ? [id, res] : null;
    }).filter((x): x is [string,Object] => !!x);
  }

  protected save(tablename: string, idorg: string | null, obj: Object): [string,Object] | null {
    const id: string = idorg || uuid();
    const key: string = this.getRecordKey(tablename,id);
    localStorage.setItem(key,JSON.stringify(obj));
    if(this.addRecordKeys(tablename,[id])){
      return [id,obj];
    }else{
      return null;
    };
  }

  protected getRecordKey(tablename: string, id: string): string {
    return "__54F31D42-F65F-4619-91EA-1237A8AF8128__" +  tablename + "__" + id;
  }

  protected getAllRecordIds(tablename: string): ReadonlyArray<string> {
    const idx: Object = this.loadRawData(tablename, "index") || {};
    return Object.keys(idx || {});
  }

  protected addRecordKeys(tablename: string, ids: ReadonlyArray<string>): boolean {
    const idx: Object = this.loadRawData(tablename, "index") || {};
    const key: string = this.getRecordKey(tablename, "index");
    ids.forEach(function(id){
      idx[id]=Date.now();
    });
    localStorage.setItem(key,JSON.stringify(idx));
    const newidx: Object = this.loadRawData(tablename, "index") || {};
    return ids.every(function(id: string): boolean {
      return !!newidx[id];
    });
  }

  protected removeRecordKeys(tablename: string, ids: ReadonlyArray<string>): boolean {
    const idx: Object = this.loadRawData(tablename, "index") || {};
    const key: string = this.getRecordKey(tablename, "index");
    ids.forEach(function(id){
      delete idx[id];
    });
    const newidx: Object = this.loadRawData(tablename, "index") || {};
    return ids.every(function(id: string): boolean {
      return !newidx[id];
    });
  }

  protected loadRawData(tablename: string, id: string): Object | null {
    const key: string = this.getRecordKey(tablename, id);
    const item: string | null = localStorage.getItem(key);
    const rtn: Object | null = (item ? JSON.parse(item) : null);
    return rtn;
  }
  
}
