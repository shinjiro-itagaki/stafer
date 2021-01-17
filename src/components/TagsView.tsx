import * as React from "react";
import * as ReactDOM from "react-dom";

// import { Result } from "./Result";

import { DB } from "./../../lib/DB";
import { Tag } from "./../models/Tag";
import { TagCategory } from "./../models/TagCategory";

import { mkSelectTag } from "./traits/Utils";

export interface Props extends React.Props<{}> {
  allTags: ReadonlyArray<DB.Record<Tag.Entity>>;
  allTagCategories: ReadonlyArray<DB.Record<TagCategory.Entity>>;
  reload: () => void;
  upPosition(member_id: string);
  downPosition(member_id: string);
}

export const TagsView: React.FunctionComponent<Props> = (props: Props) => {
  var form4mk     : HTMLFormElement   | null = null;
  var input_label : HTMLInputElement  | null = null;
  
  const allTags: ReadonlyArray<DB.Record<Tag.Entity>> = ([] as DB.Record<Tag.Entity>[]).concat(props.allTags)
    .sort(function(a,b): number {
      return b.entity.position - a.entity.position;
    });

  const mems: ReadonlyArray<JSX.Element> = allTags.map(function(m: DB.Record<Tag.Entity>, idx: number) {
    const position: number = m.entity.position;

    function deleteTag(): void {
      if(window.confirm("タグ" + m.entity.label + "を除外します。よろしいですか?" )){
        Tag.table.delete(m);
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

    var select : HTMLSelectElement | null = null;

    function ref(e: HTMLSelectElement | null): void {
      select = e;
    }

    function onCatChange(): void {
      if(select){
        const option: HTMLOptionElement | null = select.selectedOptions.item(0);
        m.entity.category_id = option?.value;
        m.save();
      }
    }

    const selectCat: JSX.Element = mkSelectTag({selectedValue: m.entity.category_id || null, list: props.allTagCategories, mkLabel: (x) => x.entity.label, getValue: (x) => x.id, onEmpty: {}}, {onChange: onCatChange, ref: ref});
    
    return (<tr>
            <td><label>{m.entity.label}({m.id})</label></td>
            <td>
              <input type="button" value="上へ" onClick={toUp} />
              <input type="button" value="下へ" onClick={toDown} />
            </td>
            <td><input type="button" value="削除" onClick={deleteTag} /></td>
            <td>{position}</td>
            <td>{selectCat}</td>
            </tr>);
  });

  function validateCreatingTag(): Tag.Entity | null {
    if(!form4mk){
      return null;
    }
    if(!form4mk.reportValidity()){
      return null;
    }
    if(!input_label){
      return null;
    }
    return Tag.mkEntity({label: input_label.value, position: 1});
  }

  function onSubmitCreatingTag(): boolean {
    const data : Tag.Entity | null = validateCreatingTag();
    if(!data){
      return false;
    }

    if(!!Tag.table.create(data)){
      props.reload();
      if(form4mk){
        form4mk.reset();
      }
      return true;
    }else{
      return false;
    }
  }

  return(
      <div>
      <fieldset>
      <legend>タグ</legend>
      <form ref={(e: HTMLFormElement) => form4mk = e}>
      <input type="text" ref={(e: HTMLInputElement) => input_label = e} required={true} />
      <input type="button" value="作成" onClick={onSubmitCreatingTag} />
      </form>
      <table>
      <caption>タグ</caption>
      <thead>
      <th>tag name</th>
      <th>移動</th>
      <th>削除</th>
      <th>優先度</th>
      <th>カテゴリ</th>
      </thead>
      <tbody>{mems}</tbody>
      </table>
      <div>数:{allTags.length}</div>
      </fieldset>
      </div>
  );
}

