declare global {
  namespace JSX {
    // tslint:disable-next-line:no-empty-interface
    interface Element extends React.ReactElement<any, any> {}
  }
}

import {
  mountApp
} from "./components/app";

const w: any = window;

w.mountApp = function(id: string): boolean {
  return mountApp(id);
}
