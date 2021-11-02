import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { Popup } from "@src/app/popup/components/Popup";
import "@src/app/popup/css/style.css";
import { dark } from "@src/lib/Theme";
import React, { FC } from "react";
import ReactDOM from "react-dom";

const Main: FC = () => (
	<ThemeProvider theme={createTheme(dark)}>
		<CssBaseline />
		<Popup />
	</ThemeProvider>
);

ReactDOM.render(<Main />, document.querySelector("#app"));
