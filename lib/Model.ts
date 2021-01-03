
import { ModelBackend } from "./ModelBackend";
import { LocalStorageBackend } from "./LocalStorageBackend";
import { v4 as uuid } from "uuid";

export module Model {

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

  const defaultBackend: ModelBackend = new LocalStorageBackend();
  var customBackend: ModelBackend | null = null;

  export function getBackend(): ModelBackend {
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
}

// https://python5.com/q/iribcvbi
//export class Model {
  // private _id: string;

  // private static backend: ModelBackend = new LocalStorageBackend();

  // public static tableName<T extends typeof Model>(this: T): string {
  //   return "B884244B-73E5-4FB9-85F6-C0AD4D9BEF2D";
  // }

  // public static all<T extends typeof Model>(this: T): ReadonlyArray<InstanceType<T>> {
  //   const klass: T = this;
  //   return this.backend.all(this.tableName()).map(function(obj: Object): InstanceType<T> { return klass.initialize(obj); });
  // }

  // public static find<T extends typeof Model>(this: T, id: string): InstanceType<T> | null {
  //   // const ins: T = new this();
  //   const raw: Object | null = this.backend.find(this.tableName(),id);
  //   if(raw){
  //     //ins.rawToData(raw);
  //     return this.initialize<typeof this>(raw);
  //   }else{
  //     return null;
  //   }
  // }

  // constructor(id?: string){
  //   this._id = id || uuid();
  // }

  // get id(): string {
  //   return this._id;
  // }

  // public save(): this {
  //   if(this._id){
  //     Model.backend.update("",this._id, this.toRawData());
  //   }else{
  //     Model.backend.insert("",this.toRawData());
  //   }

  //   return this;
  // }

  // public reload(): this {
  //   return this;
  // }

  // static initialize<T extends typeof Model>(this: T, raw: Object={}): InstanceType<T> {
  //   return (new this() as InstanceType<T>).setRawData({...raw});
  // }

  // static create<T extends typeof Model>(this: T, raw: Object={}): InstanceType<T> {
  //   return this.initialize(raw).save();
  // }

  // // protected abstract setRawData(raw: Object): this;
  // protected setRawData(raw: Object): this {
  //   this._id = raw["id"] || this._id;
  //   return this;
  // }

  // protected toRawData(): any {
  //   const data: any = {};
  //   data.id = this._id;
  //   return data;
  // }

  // protected abstract rawToData<T extends Model>(raw: Object): T;
//}
