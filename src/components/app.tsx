import * as React from "react";
import * as ReactDOM from "react-dom";

import { DB } from "./../../lib/DB";

import { Member } from "./../models/Member";
import { Schedule } from "./../models/Schedule";
import { ScheduleMemberMap } from "./../models/ScheduleMemberMap";

import { MembersView } from "./MembersView";
import { Result } from "./Result";

export interface Props extends React.Props<{}> {
}

const App: React.FunctionComponent<Props> = (props: Props) => {
  const [allMembers, setAllMembers] = React.useState<ReadonlyArray<DB.Record<Member.Entity>>>(Member.table.all());

  const [schedule, resetSchedule] = React.useState<DB.Record<Schedule.Entity> | null>(Schedule.current());

  // const posMap : Map<string,number> = new Map<string,number>();

  if(schedule){
    allMembers.forEach((x,idx) => {
      // schedule.entity.setMember(x,{position: allMembers.length - idx});
      schedule.entity.setMember(x);
    })
  }

  function reCreateSchedule(): void {
    resetSchedule(Schedule.current());
  }

  if(!schedule) {
    return (
      <div>
        スケジュールの作成に失敗しました。<input type="button" value="再実行" onClick={reCreateSchedule} />をクリックして、リトライしてみてください。
      </div>
    );
  }

  function reload(): void{
    setAllMembers(DB.all(Member.table));
  }

  function onChecked(m: DB.Record<Member.Entity>, checked: boolean, position: number): void {
    if(schedule){ schedule.entity.setMember(m, {checked: checked, position: position}) };
  }

  var form : HTMLFormElement  | null = null;
  var start: HTMLInputElement | null = null;
  var endee: HTMLInputElement | null = null;

  function validate(): boolean {
    if(!form){
      return false;
    }

    return form.reportValidity();
  }


  function onSubmit(): boolean {
    if(!validate()){
      return false;
    }

    return false;
  }

  function upPosition(member_id: string): void {
    if(schedule){
      schedule.entity.upPositionOf(member_id);
      schedule.save();
    }
  }

  function downPosition(member_id: string): void {
    if(schedule){
      schedule.entity.downPositionOf(member_id);
    }
  }

  function getMapOf(member_id: string): ScheduleMemberMap.Entity | undefined {
    // return Math.random();
    const rtn : ScheduleMemberMap.Entity | undefined = schedule?.entity.findMemberMapOf(member_id);
    return rtn;
  }

  return (
    <form ref={(e: HTMLFormElement) => form = e}>
      <fieldset>
      <legend>期間</legend>
      <label><input required type="date" ref={(e: HTMLInputElement) => start = e} /></label> 〜 <label><input required type="date" ref={(e: HTMLInputElement) => endee = e} /></label>
      </fieldset>
      <MembersView allMembers={allMembers} reload={reload} onChecked={onChecked} upPosition={upPosition} downPosition={downPosition} getMapOf={getMapOf} />
      <input type="button" value="作成" onClick={onSubmit} />
      <Result />
    </form>
  );
}


export function mountApp(id: string): boolean {
  const htmlElement: HTMLElement | null = document.getElementById(id);
  const x: JSX.Element = (
    <App />
  );

  if(htmlElement){
    ReactDOM.render(x, htmlElement);
    return true;
  }else{
    return false;
  }
}
