import $ from "jquery";
import mime from "mime";

const xhr_get_example = (url: string) => {
	const http = new XMLHttpRequest();
	http.open("GET", url, true);
	http.onprogress = function (e) {
		const percent_complete = (e.loaded / e.total) * 100;
		console.log(percent_complete);
		console.log("Progress", e);
	};
	http.send();
};

const importJq = () => {
	if (!window.$) window.$ = $;
};

const arrSet = <T = any>(arr: T[]) => [...new Set(arr)];

const contentTypeToExt = (content_type: string | null) => mime.getExtension(content_type || "");

const bytesToSize = (bytes: number, decimals: number = 1) => {
	if (bytes == 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	const i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)).toString());
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

const range = (start: number, end?: number) =>
	Array.from({ length: end ? end - start + 1 : start }, (_, i) => (end ? start + i : i));

const disableLog = (value?: boolean) => {
	if (value || value == undefined) console.log = (...data: any[]) => {};
};

const get_win = async (message_type: string) => {
	return new Promise<any>(resolve => {
		const lis1 = (event: any) => {
			if (event.source != window) return;
			if (event.data.type && event.data.type == message_type) {
				window.removeEventListener("message", lis1);
				resolve(event.data.data);
			}
		};
		window.addEventListener("message", lis1, false);
	});
};

const hashCode = (str: string) => {
	var hash = 0;
	if (str.length === 0) return hash.toString();
	for (var i = 0; i < str.length; i++) {
		hash = (hash << 5) - hash + str.charCodeAt(i);
		hash |= 0;
	}
	return hash.toString();
};

export {
	xhr_get_example,
	importJq,
	arrSet,
	contentTypeToExt,
	bytesToSize,
	range,
	disableLog,
	get_win,
	hashCode,
};
