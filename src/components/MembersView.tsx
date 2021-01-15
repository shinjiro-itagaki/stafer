import * as React from "react";
import * as ReactDOM from "react-dom";

// import { Result } from "./Result";

import { DB } from "./../../lib/DB";
import { Member } from "./../models/Member";
import { ScheduleMemberMap } from "./../models/ScheduleMemberMap";

export interface Props extends React.Props<{}> {
  allMembers: ReadonlyArray<DB.Record<Member.Entity>>;
  reload: () => void;
  onChecked: (m: DB.Record<Member.Entity>, checked: boolean, position: number) => void;
  upPosition(member_id: string);
  downPosition(member_id: string);
  getMapOf(member_id: string): ScheduleMemberMap.Entity | undefined;
}

export const MembersView: React.FunctionComponent<Props> = (props: Props) => {
  const allMembers: ReadonlyArray<[DB.Record<Member.Entity> , ScheduleMemberMap.Entity | undefined]>
    = ([] as DB.Record<Member.Entity>[]).concat(props.allMembers)
    .map(function(x: DB.Record<Member.Entity>): [DB.Record<Member.Entity> , ScheduleMemberMap.Entity | undefined] {
      return [x, props.getMapOf(x.id)];
    }).sort(function(a,b): number {
      const am: DB.Record<Member.Entity> = a[0];
      const ap = a[1]?.position || am.entity.position;
      const bm: DB.Record<Member.Entity> = b[0];
      const bp = b[1]?.position || bm.entity.position;
      return bp - ap;
    });

  const mems: ReadonlyArray<JSX.Element> = allMembers.map(function(x: [DB.Record<Member.Entity> , ScheduleMemberMap.Entity | undefined], idx: number) {
    const m: DB.Record<Member.Entity> = x[0];
    const map: ScheduleMemberMap.Entity | undefined = x[1];
    const position: number = map?.position || m.entity.position;
    function deleteMember(): void {
      if(window.confirm("メンバー" + m.entity.name + "を除外します。よろしいですか?" )){
        Member.table.delete(m);
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

    const defaultChecked: boolean = !!map;

//             <td>{m.id}</td>
// checked={!!checkedMembers.get(m.id)}
    return (<tr>
            <td><label><input defaultChecked={defaultChecked} type="checkbox" onChange={onMemberCheckChanged} />{m.entity.name}({m.id})</label></td>
            <td>
              <input type="button" value="上へ" onClick={toUp} />
              <input type="button" value="下へ" onClick={toDown} />
            </td>
            <td><input type="button" value="削除" onClick={deleteMember} /></td>
            <td>{position}</td>
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
      <th>優先度</th>
      </thead>
      <tbody>{mems}</tbody>
      </table>
      <div>人数:{allMembers.length}</div>
      </div>
  );
}

