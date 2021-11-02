import { darkScrollbar } from "@mui/material";
import { ThemeOptions } from "@mui/material/styles";

const default_colors = {
	primary: {
		main: "#9390c5",
		contrastText: "#FFFFFF",
	},
	secondary: {
		main: "#74858f",
		contrastText: "#FFFFFF",
	},
};

export const light: ThemeOptions = {
	palette: {
		mode: "light",
		...default_colors,
	},
};

export const BackgroundColor = "#191a1b";

export const dark: ThemeOptions = {
	palette: {
		mode: "dark",
		...default_colors,
		background: {
			paper: "#292c2f",
			default: BackgroundColor,
		},
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				body: darkScrollbar(),
			},
		},
	},
};
