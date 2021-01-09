import * as React from "react";
import * as ReactDOM from "react-dom";

// import { Result } from "./Result";

import { DB } from "./../../lib/DB";
import { Member } from "./../models/Member";

export interface Props extends React.Props<{}> {
  members?: ReadonlyArray<DB.Record<Member.Entity>>;
  reload: () => void;
}

export const MembersView: React.FunctionComponent<Props> = (props: Props) => {
  const mems: ReadonlyArray<JSX.Element> = (props.members || []).map(function(m: DB.Record<Member.Entity>) {
    return (<tr>
            <td>{m.id}</td>
            <td>{m.id}</td>
            </tr>);
  });

  return(
      <div>
      <div style={{width: "100%", height: "40px", backgroundColor: "blue"}} onClick={props.reload}></div>
      <form>
      </form>
      <table>
      <thead><th>ID</th><th>..</th></thead>
      <tbody>{mems}</tbody>
      </table>
      </div>
  );
}

