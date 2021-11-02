import { useTheme } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

const useStateRef = <S = any>(
	initialState: S | (() => S)
): [React.MutableRefObject<S>, (data: S) => void] => {
	const [state, setState] = useState<S>(initialState);
	const stateRef = useRef(state);
	useEffect(() => {
		stateRef.current = state;
	}, [state]);
	return [stateRef, setState];
};

const isDarkMode = () => useTheme().palette.mode == "dark";

export { useStateRef, isDarkMode };
