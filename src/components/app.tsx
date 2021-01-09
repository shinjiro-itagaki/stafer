import * as React from "react";
import * as ReactDOM from "react-dom";

import { DB } from "./../../lib/DB";

import { Member } from "./../models/Member";
import { MembersView } from "./MembersView";
import { Result } from "./Result";

export interface Props extends React.Props<{}> {
}

const App: React.FunctionComponent<Props> = (props: Props) => {
  const [initMembers, setMembers] = React.useState<ReadonlyArray<DB.Record<Member.Entity>>>([]);
  function reload(): void{
    // Member.create({name: "dummy"});
    // setMembers(DB.all<DB.Record<Member.Entity>>());
    setMembers(DB.all(Member.klass));
  }

  return(
      <div>
        <MembersView members={initMembers} reload={reload} />
        <div>{initMembers.length}</div>
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
