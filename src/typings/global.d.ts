interface Window {
	$: JQueryStatic;
	jwplayer: any;
	unsafeWindow: any;
}

declare type JW = jwplayer.JWPlayer | null;

declare namespace jwplayer {
	type ConfigParam = {
		aspectratio?: string;
		autostart?: "viewable" | boolean;
		height?: number;
		mute?: boolean;
		repeat?: boolean;
		stretching?: "uniform" | "exactfit" | "fill" | "none";
		volume?: number;
		width?: number | string;
	};
	interface JWPlayer {
		setConfig(config: ConfigParam): void;
		getConfig(): Record<string, any>;
	}
}
