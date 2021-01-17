import * as React from "react";
import * as ReactDOM from "react-dom";

import { DB } from "./../../lib/DB";

import { Schedule } from "./../models/Schedule";

import { Member } from "./../models/Member";
import { Place } from "./../models/Place";
import { Period } from "./../models/Period";
import { Tag } from "./../models/Tag";

import { ScheduleMemberMap } from "./../models/ScheduleMemberMap";
import { SchedulePlaceMap } from "./../models/SchedulePlaceMap";
import { SchedulePeriodMap } from "./../models/SchedulePeriodMap";

import { MembersView } from "./MembersView";
import { PlacesView } from "./PlacesView";
import { PeriodsView } from "./PeriodsView";
import { TagsView } from "./TagsView";

import { Result } from "./Result";

export interface Props extends React.Props<{}> {
}

const App: React.FunctionComponent<Props> = (props: Props) => {
  const [allMembers, setAllMembers] = React.useState<ReadonlyArray<DB.Record<Member.Entity>>>(Member.table.all());

  const [allPlaces, setAllPlaces] = React.useState<ReadonlyArray<DB.Record<Place.Entity>>>(Place.table.all());

  const [allPeriods, setAllPeriods] = React.useState<ReadonlyArray<DB.Record<Period.Entity>>>(Period.table.all());

  const [allTags, setAllTags] = React.useState<ReadonlyArray<DB.Record<Tag.Entity>>>(Tag.table.all());

  const [schedule, resetSchedule] = React.useState<DB.Record<Schedule.Entity> | null>(Schedule.current());

  if(schedule){
    allMembers.forEach((x,idx) => {
      schedule.entity.members.setRecord(schedule,x);
    });

    allPlaces.forEach((x,idx) => {
      schedule.entity.places.setRecord(schedule,x);
    });

    allPeriods.forEach((x,idx) => {
      schedule.entity.periods.setRecord(schedule,x);
    })
  }

  function reCreateSchedule(): void {
    resetSchedule(Schedule.current());
  }

  if(!schedule) {
    return (
      <div>
        スケジュールの作成に失敗しました。<input type="button" value="再実行" onClick={reCreateSchedule} />をクリックして、リトライしてみてください。
      </div>
    );
  }

  function reloadAllMembers(): void{
    setAllMembers(Member.table.all());
  }

  function reloadAllPlaces(): void{
    setAllPlaces(Place.table.all());
  }

  function reloadAllPeriods(): void{
    setAllPeriods(Period.table.all());
  }

  function reloadAllTags(): void{
    setAllTags(Tag.table.all());
  }

  function onMemberChecked(m: DB.Record<Member.Entity>, checked: boolean, position: number): void {
    if(schedule){ schedule.entity.members.setRecord(schedule, m, {checked: checked, position: position}) };
  }

  function onPlaceChecked(m: DB.Record<Place.Entity>, checked: boolean, position: number): void {
    if(schedule){ schedule.entity.places.setRecord(schedule, m, {checked: checked, position: position}) };
  }

  function onPeriodChecked(m: DB.Record<Period.Entity>, checked: boolean, position: number): void {
    if(schedule){ schedule.entity.periods.setRecord(schedule, m, {checked: checked, position: position}) };
  }

  var form : HTMLFormElement  | null = null;
  var start: HTMLInputElement | null = null;
  var endee: HTMLInputElement | null = null;

  function validate(): boolean {
    if(!form){
      return false;
    }

    return form.reportValidity();
  }


  function onSubmit(): boolean {
    if(!validate()){
      return false;
    }

    return false;
  }

  function upMemberPosition(member_id: string): void {
    if(schedule){
      schedule.entity.members.upPositionOf(member_id);
      schedule.save();
    }
  }

  function downMemberPosition(member_id: string): void {
    if(schedule){
      schedule.entity.members.downPositionOf(member_id);
      schedule.save();
    }
  }

  function getMemberMapOf(member_id: string): ScheduleMemberMap.Entity | undefined {
    const rtn : ScheduleMemberMap.Entity | undefined = schedule?.entity.members.findMapOf(member_id);
    return rtn;
  }

  function upPlacePosition(place_id: string): void {
    if(schedule){
      schedule.entity.places.upPositionOf(place_id);
      schedule.save();
    }
  }

  function downPlacePosition(place_id: string): void {
    if(schedule){
      schedule.entity.places.downPositionOf(place_id);
      schedule.save();
    }
  }

  function getPlaceMapOf(place_id: string): SchedulePlaceMap.Entity | undefined {
    const rtn : SchedulePlaceMap.Entity | undefined = schedule?.entity.places.findMapOf(place_id);
    return rtn;
  }

  function upPeriodPosition(period_id: string): void {
    if(schedule){
      schedule.entity.periods.upPositionOf(period_id);
      schedule.save();
    }
  }

  function downPeriodPosition(period_id: string): void {
    if(schedule){
      schedule.entity.periods.downPositionOf(period_id);
      schedule.save();
    }
  }

  function getPeriodMapOf(period_id: string): SchedulePeriodMap.Entity | undefined {
    const rtn : SchedulePeriodMap.Entity | undefined = schedule?.entity.periods.findMapOf(period_id);
    return rtn;
  }

  function upTagPosition(tag_id: string): void {
    // hoge
  }

  function downTagPosition(tag_id: string): void {
    
  }


  return (
    <form ref={(e: HTMLFormElement) => form = e}>
      <fieldset>
      <legend>期間</legend>
      <label><input required type="date" ref={(e: HTMLInputElement) => start = e} /></label> 〜 <label><input required type="date" ref={(e: HTMLInputElement) => endee = e} /></label>
      </fieldset>
      <PeriodsView allPeriods={allPeriods} reload={reloadAllPeriods} onChecked={onPeriodChecked} upPosition={upPeriodPosition} downPosition={downPeriodPosition} getMapOf={getPeriodMapOf} />
      <MembersView allMembers={allMembers} reload={reloadAllMembers} onChecked={onMemberChecked} upPosition={upMemberPosition} downPosition={downMemberPosition} getMapOf={getMemberMapOf} />
      <PlacesView  allPlaces={allPlaces}   reload={reloadAllPlaces}  onChecked={onPlaceChecked}  upPosition={upPlacePosition}  downPosition={downPlacePosition}  getMapOf={getPlaceMapOf}  />
      <TagsView    allTags={allTags}       reload={reloadAllTags}                                upPosition={upTagPosition}    downPosition={downTagPosition} />
      <input type="button" value="作成" onClick={onSubmit} />
      <Result />
    </form>
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
