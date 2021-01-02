import {
  mountApp
} from "./components/app";

const w: any = window;

w.mountApp = function(id: string): boolean {
  return mountApp(id);
}
