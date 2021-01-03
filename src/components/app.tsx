import * as React from "react";
import * as ReactDOM from "react-dom";

import { Member } from "./../models/Member";
import { MembersView } from "./MembersView";
import { Result } from "./Result";

export interface Props extends React.Props<{}> {
}

const App: React.FunctionComponent<Props> = (props: Props) => {
  Member.create();
  const members: ReadonlyArray<Member.Record> = Member.all();
  return(
      <div>
        <MembersView members={members} />
        <div>{members.length}</div>
        <Result />
      </div>
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
