import * as React from "react";
import * as ReactDOM from "react-dom";

import { DB } from "./../../lib/DB";

import { Member } from "./../models/Member";
import { MembersView } from "./MembersView";
import { Result } from "./Result";

export interface Props extends React.Props<{}> {
}

const App: React.FunctionComponent<Props> = (props: Props) => {
  const [initMembers, setMembers] = React.useState<ReadonlyArray<DB.Record<Member.Entity>>>(DB.all(Member.klass));

  const checkedMembers: Map<string, DB.Record<Member.Entity>> = new Map<string, DB.Record<Member.Entity>>();

  function reload(): void{
    // Member.create({name: "dummy"});
    // DB.create(Member.klass, {name: "dummy"});
    // setMembers(DB.all<DB.Record<Member.Entity>>());
    setMembers(DB.all(Member.klass));
  }

  function onChecked(m: DB.Record<Member.Entity>, checked: boolean): void {
    if(checked){
      checkedMembers.set(m.id, m);
    }else{
      checkedMembers.delete(m.id);
    }
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

  return(
    <form ref={(e: HTMLFormElement) => form = e}>
      <fieldset>
      <legend>期間</legend>
      <label><input required type="date" ref={(e: HTMLInputElement) => start = e} /></label> 〜 <label><input required type="date" ref={(e: HTMLInputElement) => endee = e} /></label>
      </fieldset>
      <MembersView members={initMembers} reload={reload} onChecked={onChecked} />
      <div>人数:{initMembers.length}</div>
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
