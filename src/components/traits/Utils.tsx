import * as React from "react";
import * as ReactDOM from "react-dom";

export function mkOptionTag<T>(x: T, selectedValue: string | null, mkLabel: (x: T) => string, getValue: (x: T) => string): JSX.Element {
  const label: string = mkLabel(x);
  const value: string = getValue(x);
  const isSelected: boolean = value == selectedValue;
  return (<option value={value} selected={isSelected}>{label}</option>);
}

export function mkSelectTag<T>(args: {selectedValue: string | null, list: ReadonlyArray<T>, mkLabel: (x: T) => string, getValue: (x: T) => string, onEmpty?: {label?: string, value?: string}}, tagoptions?: {ref?: (e: HTMLSelectElement) => void, onChange?: () => void}): JSX.Element {
  const options: ReadonlyArray<JSX.Element> = args.list.map((x) => mkOptionTag(x, args.selectedValue, args.mkLabel, args.getValue));
  const emptyOptionValue: string = args?.onEmpty?.value || "";
  const emptyOptionLabel: string = args?.onEmpty?.label || "";
  const emptyOption: JSX.Element | null = args?.onEmpty ? (<option value={emptyOptionValue}>{emptyOptionLabel}</option>) : null;
  return (
    <select {...tagoptions}>
      {emptyOption}
      {options}
    </select>
  );
}
