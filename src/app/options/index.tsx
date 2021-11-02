import { Options } from "@src/app/options/components/Options";
import React, { FC } from "react";
import ReactDOM from "react-dom";

const Main: FC = () => <Options />;

ReactDOM.render(<Main />, document.querySelector("#app"));
