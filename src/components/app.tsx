import * as React from "react";
import * as ReactDOM from "react-dom";

import { DB } from "./../../lib/DB";

import { Member } from "./../models/Member";
import { Schedule } from "./../models/Schedule";

import { MembersView } from "./MembersView";
import { Result } from "./Result";

export interface Props extends React.Props<{}> {
}

const App: React.FunctionComponent<Props> = (props: Props) => {
  const [allMembers, setAllMembers] = React.useState<ReadonlyArray<DB.Record<Member.Entity>>>(Member.table.all());

  const [schedule, resetSchedule] = React.useState<DB.Record<Schedule.Entity> | null>(Schedule.current());

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
    // Member.create({name: "dummy"});
    // DB.create(Member.klass, {name: "dummy"});
    // setMembers(DB.all<DB.Record<Member.Entity>>());
    setAllMembers(DB.all(Member.table));
  }

  function onChecked(m: DB.Record<Member.Entity>, checked: boolean, position: number): void {
    if(schedule){ Schedule.setMember(schedule, m.id, checked, position) };
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
      alert(getPositionOf(member_id));
      Schedule.upPositionOf(schedule,member_id);
      alert(getPositionOf(member_id));
    }
  }

  function downPosition(member_id: string): void {
    if(schedule){
      Schedule.downPositionOf(schedule,member_id);
    }
  }

  function getPositionOf(member_id: string): number | undefined {
    return schedule ? Schedule.getPositionOf(schedule,member_id) : undefined;
  }

  return (
    <form ref={(e: HTMLFormElement) => form = e}>
      <fieldset>
      <legend>期間</legend>
      <label><input required type="date" ref={(e: HTMLInputElement) => start = e} /></label> 〜 <label><input required type="date" ref={(e: HTMLInputElement) => endee = e} /></label>
      </fieldset>
      <MembersView allMembers={allMembers} reload={reload} onChecked={onChecked} upPosition={upPosition} downPosition={downPosition} getPositionOf={getPositionOf} />
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
