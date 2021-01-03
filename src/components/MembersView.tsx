import * as React from "react";
import * as ReactDOM from "react-dom";

// import { Result } from "./Result";

import { Member } from "./../models/Member";

export interface Props extends React.Props<{}> {
  members?: ReadonlyArray<Member.Record>;
}

export const MembersView: React.FunctionComponent<Props> = (props: Props) => {
  const mems: ReadonlyArray<JSX.Element> = (props.members || []).map(function(m: Member.Record) {
    return (<tr><td>{m.id}</td></tr>);
  });

  return(
      <table><tbody>{mems}</tbody></table>
  );
}

