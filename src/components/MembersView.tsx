import * as React from "react";
import * as ReactDOM from "react-dom";

// import { Result } from "./Result";

import { DB } from "./../../lib/DB";
import { Member } from "./../models/Member";
import { Tag } from "./../models/Tag";
import { TagCategory } from "./../models/TagCategory";
import { ScheduleMemberMap } from "./../models/ScheduleMemberMap";
// import { MemberTagMap } from "./../models/MemberTagMap";

import { mkSelectTag } from "./traits/Utils";

export interface Props extends React.Props<{}> {
  allMembers: ReadonlyArray<DB.Record<Member.Entity>>;
  allTags: ReadonlyArray<DB.Record<Tag.Entity>>;
  allTagCategories: ReadonlyArray<DB.Record<TagCategory.Entity>>;
  reload: () => void;
  onChecked: (m: DB.Record<Member.Entity>, checked: boolean, position: number) => void;
  upPosition(member_id: string);
  downPosition(member_id: string);
  getMapOf(member_id: string): ScheduleMemberMap.Entity | undefined;
}

export const MembersView: React.FunctionComponent<Props> = (props: Props) => {
  var form4mkuser    : HTMLFormElement   | null = null;
  var input_username : HTMLInputElement  | null = null;
  
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
    }

    const defaultChecked: boolean = !!map;

    function onTagCheckChange(tag: DB.Record<Tag.Element>){
      alert("");
    }

    const checkBoxes: JSX.Element[] = props.allTags.map((x) => (<label><input type="checkbox" value={x.id} onChange={onTagCheckChange} />{x.entity.label}</label>));

    return (<tr>
            <td><label><input defaultChecked={defaultChecked} type="checkbox" onChange={onMemberCheckChanged} />{m.entity.name}({m.id})</label></td>
            <td>
              <input type="button" value="上へ" onClick={toUp} />
              <input type="button" value="下へ" onClick={toDown} />
            </td>
            <td><input type="button" value="削除" onClick={deleteMember} /></td>
            <td>{position}</td>
            <td>タグ: {checkBoxes}</td>
            </tr>);
  });


  function validateCreatingMember(): Member.Entity | null {
    if(!form4mkuser){
      return null;
    }
    if(!form4mkuser.reportValidity()){
      return null;
    }
    if(!input_username){
      return null;
    }
    return {name: input_username.value, position: 1};
  }

  function onSubmitCreatingMember(): boolean {
    const data : Member.Entity | null = validateCreatingMember();
    if(!data){
      return false;
    }

    if(!!Member.table.create(data)){
      props.reload();
      if(form4mkuser){
        form4mkuser.reset();
      }
      return true;
    }else{
      return false;
    }
  }

  return(
      <div>
      <fieldset>
      <legend>メンバー</legend>
      <form ref={(e: HTMLFormElement) => form4mkuser = e}>
      <input type="text" ref={(e: HTMLInputElement) => input_username = e} required={true} />
      <input type="button" value="作成" onClick={onSubmitCreatingMember} />
      </form>
      <table>
      <caption>メンバー</caption>
      <thead>
      <th>member name</th>
      <th>移動</th>
      <th>削除</th>
      <th>優先度</th>
      <th>タグ</th>
      </thead>
      <tbody>{mems}</tbody>
      </table>
      <div>人数:{allMembers.length}</div>      
      </fieldset>
      </div>
  );
}

