import { DB } from "./../../lib/DB";
import { Schedule } from "./Schedule";

export module Period {

  export type TimeFmtFunc = (h: number, m: number) => string;

  export function defaultTimeFmtFunc(h: number, m: number): string {
    return ("0" + h).slice(-2) + ":" + ("0" + m).slice(-2);
  }

  export interface Entity extends DB.Entity {
    name: string;
    startTime: number;
    duration: number; // minutes
    position: number;
    readonly endTime: number;
    readonly startTimeHH: number;
    readonly startTimeMM: number;
    readonly endTimeHH: number;
    readonly endTimeMM: number;
    startTimeStr(f?: TimeFmtFunc): string;
    endTimeStr(f?: TimeFmtFunc): string;
  };

  export function hmStr(x: number, f?: TimeFmtFunc): string {
    const hours: number = Math.floor(x / 60);
    const mins : number = x % 60;
    return (f || defaultTimeFmtFunc)(hours,mins);
  }

  export type MkEntityArgs = {name: string, startTime: number, duration: number, position: number};

  export function mkEntity(args: MkEntityArgs) {
    return new EntityImpl(args);
  }

  class EntityImpl implements Entity {
    public name: string;
    public startTime: number;
    private _duration: number; // minutes
    public position: number;

    public get duration(): number {
      return Math.max(this._duration,1);
    }

    public set duration(x: number) {
      this._duration = Math.max(x,1);
    }

    constructor(args: MkEntityArgs){
      this.name = args.name;
      this.startTime = args.startTime;
      this._duration = args.duration;
      this.position = args.position;
    }

    public get endTime(): number {
      return (this.startTime + this.duration) % (24*60);
    }

    public startTimeStr(f?: TimeFmtFunc): string {
      return hmStr(this.startTime,f);
    }

    public endTimeStr(f?: TimeFmtFunc): string {
      return hmStr(this.endTime,f);
    }

    public get startTimeHH(): number {
      return Math.floor(this.startTime / 60);
    }

    public get startTimeMM(): number {
      return this.startTime % 60;
    }

    public get endTimeHH(): number {
      return Math.floor(this.endTime / 60);
    }

    public get endTimeMM(): number {
      return this.endTime % 60;
    }
  }


  class Table extends DB.AbstractTable<Entity> {
    readonly name: string = "periods";
    public toObject(entity: Entity): Object {
      return {
        name: entity.name,
        startTime: entity.startTime,
        duration: entity.duration,
        position: entity.position
      };
    }

    public initialize(obj: Object): Entity {
      const name: string = String(obj["name"] || "");
      return mkEntity({ startTime: Number(obj["startTime"] || 0), duration: Number(obj["duration"] || 30), name: name, position: Number(obj["position"] || 0) });
    }

    public all(): ReadonlyArray<DB.Record<Entity>> {
      return ([] as DB.Record<Entity>[]).concat(super.all()).sort(function(a: DB.Record<Entity>, b: DB.Record<Entity>){ return b.entity.startTime - a.entity.startTime; } );
    }

    public mkFilter(cond: Object): (r: DB.Record<Entity>) => boolean {
      return function(r: DB.Record<Entity>){
        return true;
      }
    }
  }

  export const table: DB.Table<Entity> = new Table();
}
