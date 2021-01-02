import * as React from "react";
import * as ReactDOM from "react-dom";

export interface Props extends React.Props<{}> {
//  root_id: string;
//  on_id_not_found: string | null;
//  delete_confirm_msg: string;  
}

export const Result: React.FunctionComponent<Props> = (props: Props) => {
  return(
      <div className={"qr-code-wrapper"} style={{position: "relative"}}>
      <div style={{width: "92%", height: "92%", position: "absolute", left: "4%", top: "4%"}}>
        <img className="non-qrcode" src={ "url('image/qr_space.png')" } />
      </div>
    </div>
  );
}
