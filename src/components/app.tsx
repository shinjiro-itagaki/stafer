import * as React from "react";
import * as ReactDOM from "react-dom";

import * as Result from "./result";

export function mountApp(id: string): boolean {
  const htmlElement: HTMLElement | null = document.getElementById(id);
  const x: JSX.Element = (
    <div><Result.Result /></div>
  );
  if(htmlElement){
    ReactDOM.render(x, htmlElement);
    return true;
  }else{
    return false;
  }
}
