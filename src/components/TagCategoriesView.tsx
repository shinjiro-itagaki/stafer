import * as React from "react";
import * as ReactDOM from "react-dom";

// import { Result } from "./Result";

import { DB } from "./../../lib/DB";
import { TagCategory } from "./../models/TagCategory";

export interface Props extends React.Props<{}> {
  allTagCategories: ReadonlyArray<DB.Record<TagCategory.Entity>>;
  reload: () => void;
  upPosition(member_id: string);
  downPosition(member_id: string);
}

export const TagCategoriesView: React.FunctionComponent<Props> = (props: Props) => {
  var form4mk     : HTMLFormElement   | null = null;
  var input_label : HTMLInputElement  | null = null;
  
  const allTagCategories: ReadonlyArray<DB.Record<TagCategory.Entity>> = ([] as DB.Record<TagCategory.Entity>[]).concat(props.allTagCategories)
    .sort(function(a,b): number {
      return b.entity.position - a.entity.position;
    });

  const mems: ReadonlyArray<JSX.Element> = allTagCategories.map(function(m: DB.Record<TagCategory.Entity>, idx: number) {
    const position: number = m.entity.position;

    function deleteTag(): void {
      if(window.confirm("タグカテゴリー" + m.entity.label + "を除外します。よろしいですか?" )){
        TagCategory.table.delete(m);
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

    return (<tr>
            <td><label>{m.entity.label}({m.id})</label></td>
            <td>
              <input type="button" value="上へ" onClick={toUp} />
              <input type="button" value="下へ" onClick={toDown} />
            </td>
            <td><input type="button" value="削除" onClick={deleteTag} /></td>
            <td>{position}</td>
            </tr>);
  });

  function validateCreating(): TagCategory.Entity | null {
    if(!form4mk){
      return null;
    }
    if(!form4mk.reportValidity()){
      return null;
    }
    if(!input_label){
      return null;
    }
    return TagCategory.mkEntity({label: input_label.value, position: 1});
  }

  function onSubmitCreating(): boolean {
    const data : TagCategory.Entity | null = validateCreating();
    if(!data){
      return false;
    }

    if(!!TagCategory.table.create(data)){
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
      <legend>タグカテゴリ</legend>
      <form ref={(e: HTMLFormElement) => form4mk = e}>
      <input type="text" ref={(e: HTMLInputElement) => input_label = e} required={true} />
      <input type="button" value="作成" onClick={onSubmitCreating} />
      </form>
      <table>
      <caption>タグ</caption>
      <thead>
      <th>tag name</th>
      <th>移動</th>
      <th>削除</th>
      <th>優先度</th>
      </thead>
      <tbody>{mems}</tbody>
      </table>
      <div>数:{allTagCategories.length}</div>
      </fieldset>
      </div>
  );
}
