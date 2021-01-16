import * as React from "react";
import * as ReactDOM from "react-dom";

// import { Result } from "./Result";

import { DB } from "./../../lib/DB";
import { Place } from "./../models/Place";
import { SchedulePlaceMap } from "./../models/SchedulePlaceMap";

export interface Props extends React.Props<{}> {
  allPlaces: ReadonlyArray<DB.Record<Place.Entity>>;
  reload: () => void;
  onChecked: (m: DB.Record<Place.Entity>, checked: boolean, position: number) => void;
  upPosition(member_id: string);
  downPosition(member_id: string);
  getMapOf(member_id: string): SchedulePlaceMap.Entity | undefined;
}

export const PlacesView: React.FunctionComponent<Props> = (props: Props) => {
  var form4mkuser    : HTMLFormElement   | null = null;
  var input_username : HTMLInputElement  | null = null;
  
  const allPlaces: ReadonlyArray<[DB.Record<Place.Entity> , SchedulePlaceMap.Entity | undefined]>
    = ([] as DB.Record<Place.Entity>[]).concat(props.allPlaces)
    .map(function(x: DB.Record<Place.Entity>): [DB.Record<Place.Entity> , SchedulePlaceMap.Entity | undefined] {
      return [x, props.getMapOf(x.id)];
    }).sort(function(a,b): number {
      const am: DB.Record<Place.Entity> = a[0];
      const ap = a[1]?.position || am.entity.position;
      const bm: DB.Record<Place.Entity> = b[0];
      const bp = b[1]?.position || bm.entity.position;
      return bp - ap;
    });

  const mems: ReadonlyArray<JSX.Element> = allPlaces.map(function(x: [DB.Record<Place.Entity> , SchedulePlaceMap.Entity | undefined], idx: number) {
    const m: DB.Record<Place.Entity> = x[0];
    const map: SchedulePlaceMap.Entity | undefined = x[1];
    const position: number = map?.position || m.entity.position;
    function deletePlace(): void {
      if(window.confirm("場所" + m.entity.name + "を除外します。よろしいですか?" )){
        Place.table.delete(m);
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

    function onPlaceCheckChanged(e: React.ChangeEvent<HTMLInputElement>): void {
      props.onChecked(m, e.target.checked,position);
      // props.reload();
      // if(e.target.checked){
      //   console.log("checked");
      //   checkedPlaces[m.id] = m;
      // }else{
      //   console.log("not checked");
      //   checkedPlaces.delete(m.id);
      // }
    }

    const defaultChecked: boolean = !!map;

//             <td>{m.id}</td>
// checked={!!checkedPlaces.get(m.id)}
    return (<tr>
            <td><label><input defaultChecked={defaultChecked} type="checkbox" onChange={onPlaceCheckChanged} />{m.entity.name}({m.id})</label></td>
            <td>
              <input type="button" value="上へ" onClick={toUp} />
              <input type="button" value="下へ" onClick={toDown} />
            </td>
            <td><input type="button" value="削除" onClick={deletePlace} /></td>
            <td>{position}</td>
            </tr>);
  });
//       <th>member ID</th>


  function validateCreatingPlace(): Place.Entity | null {
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

  function onSubmitCreatingPlace(): boolean {
    const data : Place.Entity | null = validateCreatingPlace();
    if(!data){
      return false;
    }

    if(!!Place.table.create(data)){
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
      <legend>場所の新規作成</legend>
      <form ref={(e: HTMLFormElement) => form4mkuser = e}>
      <input type="text" ref={(e: HTMLInputElement) => input_username = e} required={true} />
      <input type="button" value="作成" onClick={onSubmitCreatingPlace} />
      </form>
      <table>
      <caption>場所</caption>
      <thead>
      <th>place name</th>
      <th>移動</th>
      <th>削除</th>
      <th>優先度</th>
      </thead>
      <tbody>{mems}</tbody>
      </table>
      <div>数:{allPlaces.length}</div>
      </fieldset>
      </div>
  );
}

