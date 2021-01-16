import * as React from "react";
import * as ReactDOM from "react-dom";

// import { Result } from "./Result";

import { DB } from "./../../lib/DB";
import { Period } from "./../models/Period";
import { SchedulePeriodMap } from "./../models/SchedulePeriodMap";

export interface Props extends React.Props<{}> {
  allPeriods: ReadonlyArray<DB.Record<Period.Entity>>;
  reload: () => void;
  onChecked: (m: DB.Record<Period.Entity>, checked: boolean, position: number) => void;
  upPosition(member_id: string);
  downPosition(member_id: string);
  getMapOf(member_id: string): SchedulePeriodMap.Entity | undefined;
}

export const PeriodsView: React.FunctionComponent<Props> = (props: Props) => {
  var form4mkuser    : HTMLFormElement   | null = null;
  var input_name     : HTMLInputElement  | null = null;
  var input_time_hh  : HTMLInputElement  | null = null;
  var input_time_mm  : HTMLInputElement  | null = null;
  var input_dura_hh  : HTMLInputElement  | null = null;
  var input_dura_mm  : HTMLInputElement  | null = null;
  
  const allPeriods: ReadonlyArray<[DB.Record<Period.Entity> , SchedulePeriodMap.Entity | undefined]>
    = ([] as DB.Record<Period.Entity>[]).concat(props.allPeriods)
    .map(function(x: DB.Record<Period.Entity>): [DB.Record<Period.Entity> , SchedulePeriodMap.Entity | undefined] {
      return [x, props.getMapOf(x.id)];
    }).sort(function(a,b): number {
      const am: DB.Record<Period.Entity> = a[0];
      const ap = a[1]?.position || am.entity.position;
      const bm: DB.Record<Period.Entity> = b[0];
      const bp = b[1]?.position || bm.entity.position;
      return bp - ap;
    });

  const mems: ReadonlyArray<JSX.Element> = allPeriods.map(function(x: [DB.Record<Period.Entity> , SchedulePeriodMap.Entity | undefined], idx: number) {
    const m: DB.Record<Period.Entity> = x[0];
    const map: SchedulePeriodMap.Entity | undefined = x[1];
    const position: number = map?.position || m.entity.position;
    function deletePeriod(): void {
      if(window.confirm("時間帯" + m.entity.name + "を除外します。よろしいですか?" )){
        Period.table.delete(m);
        props.reload();
      }
    }

    function toUp(): void {
      props.upPosition(m.id);
      props.reload();
    } 

    function toDown(): void {
      props.downPosition(m.id);
      props.reload();
    } 

    function onPeriodCheckChanged(e: React.ChangeEvent<HTMLInputElement>): void {
      props.onChecked(m, e.target.checked,position);
    }

    const defaultChecked: boolean = !!map;

    return (<tr>
            <td><label><input defaultChecked={defaultChecked} type="checkbox" onChange={onPeriodCheckChanged} />{m.entity.name}({m.id})</label></td>
            <td>{m.entity.startTimeStr()} - {m.entity.endTimeStr()}</td>
            <td>
              <input type="button" value="上へ" onClick={toUp} />
              <input type="button" value="下へ" onClick={toDown} />
            </td>
            <td><input type="button" value="削除" onClick={deletePeriod} /></td>
            <td>{position}</td>
            </tr>);
  });

  function validateCreatingPeriod(): Period.Entity | null {
    if(!form4mkuser){
      return null;
    }
    if(!form4mkuser.reportValidity()){
      return null;
    }
    if(!input_name){
      return null;
    }
    if(!input_time_hh){
      return null;
    }
    if(!input_time_mm){
      return null;
    }
    if(!input_dura_hh){
      return null;
    }
    if(!input_dura_mm){
      return null;
    }

    const startTime : number = Number(input_time_hh.value) * 60 + Number(input_time_mm.value);

    const durationMins : number = Number(input_dura_hh.value) * 60 + Number(input_dura_mm.value);

    if(durationMins < 1){
      return null;
    }

    return Period.mkEntity({name: input_name.value, position: 1, startTime: startTime, duration: durationMins});
  }

  function onSubmitCreatingPeriod(): boolean {
    const data : Period.Entity | null = validateCreatingPeriod();
    if(!data){
      return false;
    }

    const newrec: DB.Record<Period.Entity> | null = Period.table.create(data);

    if(newrec){
      props.reload();
      if(form4mkuser){
        form4mkuser.reset();
      }
      if(input_time_hh) { input_time_hh.value = String(newrec.entity.endTimeHH); }
      if(input_time_mm) { input_time_mm.value = String(newrec.entity.endTimeMM); }
      return true;
    }else{
      return false;
    }
  }

  return(
      <div>
      <fieldset>
      <legend>時間帯</legend>
      <form ref={(e: HTMLFormElement) => form4mkuser = e}>
      <label style={{display: "block"}}>時間帯名: <input type="text" ref={(e: HTMLInputElement) => input_name = e} required={false} /></label>
      <div style={{display: "block"}}>開始時間: 
      <label><input type="number" defaultValue={9} min="0" max="23" ref={(e: HTMLInputElement) => input_time_hh = e} required={true} />時</label>
      <label><input type="number" min="0" max="59" ref={(e: HTMLInputElement) => input_time_mm = e} required={true} defaultValue={0} />分</label>
      </div>
      <div style={{display: "block"}}>長さ: 
      <label><input type="number" defaultValue={8} min={0} max={23} ref={(e: HTMLInputElement) => input_dura_hh = e} required={true} />時間</label>
      <label><input type="number" defaultValue={0} min={0} max={59} ref={(e: HTMLInputElement) => input_dura_mm = e} required={true} />分</label>
      </div>
      <input type="button" value="作成" onClick={onSubmitCreatingPeriod} />
      </form>
      <table>
      <caption>時間帯</caption>
      <thead>
      <th>name</th>
      <th>時間帯</th>
      <th>移動</th>
      <th>削除</th>
      <th>優先度</th>
      </thead>
      <tbody>{mems}</tbody>
      </table>
      <div>数:{allPeriods.length}</div>
      </fieldset>
      </div>
  );
}

