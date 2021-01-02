import * as React from "react";
import * as ReactDOM from "react-dom";

declare global {
  namespace JSX {
    // tslint:disable-next-line:no-empty-interface
    interface Element extends React.ReactElement<any, any> {}
  }
}

export function mountApp(id: string): boolean {
  const htmlElement: HTMLElement | null = document.getElementById(id);
  const x: JSX.Element = (
    <div>Hello world</div>
  );
  if(htmlElement){
    ReactDOM.render(x, htmlElement);
    return true;
  }else{
    return false;
  }
}
