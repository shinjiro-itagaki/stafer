import * as React from "react";
import * as ReactDOM from "react-dom";

// import { Result } from "./Result";

import { DB } from "./../../lib/DB";
import { Member } from "./../models/Member";

export interface Props extends React.Props<{}> {
  members?: ReadonlyArray<DB.Record<Member.Entity>>;
  reload: () => void;
  onChecked: (m: DB.Record<Member.Entity>, checked: boolean) => void;
}

export const MembersView: React.FunctionComponent<Props> = (props: Props) => {
  const mems: ReadonlyArray<JSX.Element> = (props.members || []).map(function(m: DB.Record<Member.Entity>) {
    function deleteMember(): void {
      if(window.confirm("メンバー" + m.entity.name +"を削除します。よろしいですか?" )){
        DB.delete_(Member.klass, m.id);
        props.reload();
      }
    }

    function toUp(): void {
    } 

    function toDown(): void {
    } 

    function onMemberCheckChanged(e: React.ChangeEvent<HTMLInputElement>): void {
      props.onChecked(m, e.target.checked);
      // props.reload();
      // if(e.target.checked){
      //   console.log("checked");
      //   checkedMembers[m.id] = m;
      // }else{
      //   console.log("not checked");
      //   checkedMembers.delete(m.id);
      // }
    }

//             <td>{m.id}</td>
// checked={!!checkedMembers.get(m.id)}
    return (<tr>
            <td><label><input type="checkbox" onChange={onMemberCheckChanged} />{m.entity.name}</label></td>
            <td>
              <input type="button" value="上へ" onClick={toUp} />
              <input type="button" value="下へ" onClick={toDown} />
            </td>
            <td><input type="button" value="削除" onClick={deleteMember} /></td>
            </tr>);
  });
//       <th>member ID</th>
  return(
      <div>
      <div style={{width: "100%", height: "40px", backgroundColor: "blue"}} onClick={props.reload}></div>
      <form>
      </form>
      <table>
      <thead>
      <th>member name</th>
      <th>移動</th>
      <th>削除</th>
      </thead>
      <tbody>{mems}</tbody>
      </table>
      </div>
  );
}

