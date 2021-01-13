import * as React from "react";
import * as ReactDOM from "react-dom";

// import { Result } from "./Result";

import { DB } from "./../../lib/DB";
import { Member } from "./../models/Member";

export interface Props extends React.Props<{}> {
  allMembers: ReadonlyArray<DB.Record<Member.Entity>>;
  reload: () => void;
  onChecked: (m: DB.Record<Member.Entity>, checked: boolean, position: number) => void;
  upPosition(member_id: string);
  downPosition(member_id: string);
  getPositionOf(member_id: string): number | undefined;
}

export const MembersView: React.FunctionComponent<Props> = (props: Props) => {
  const allMembers: ReadonlyArray<DB.Record<Member.Entity>> = ([] as DB.Record<Member.Entity>[]).concat(props.allMembers).sort(function(a: DB.Record<Member.Entity>,b: DB.Record<Member.Entity>){ return (props.getPositionOf(b.id) || b.entity.position) - (props.getPositionOf(a.id) || a.entity.position); });

  const mems: ReadonlyArray<JSX.Element> = allMembers.map(function(m: DB.Record<Member.Entity>, idx: number) {
    const position = idx + 1;
    function deleteMember(): void {
      if(window.confirm("メンバー" + m.entity.name + "を除外します。よろしいですか?" )){
        Member.table.delete(m);
        props.reload();
      }
    }

    function toUp(): void {
      props.upPosition(m.id);
    } 

    function toDown(): void {
      props.downPosition(m.id);
    } 

    function onMemberCheckChanged(e: React.ChangeEvent<HTMLInputElement>): void {
      props.onChecked(m, e.target.checked,position);
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
            <td><label><input type="checkbox" onChange={onMemberCheckChanged} />{m.entity.name}({m.id})</label></td>
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
      <caption>メンバー</caption>
      <thead>
      <th>member name</th>
      <th>移動</th>
      <th>削除</th>
      </thead>
      <tbody>{mems}</tbody>
      </table>
      <div>人数:{allMembers.length}</div>
      </div>
  );
}

