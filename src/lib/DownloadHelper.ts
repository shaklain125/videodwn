import { bytesToSize, contentTypeToExt } from "@src/utils/helper";

/**
 * @example [Referer, DownloadLinkMatchPattern]
 */
export type DownloadLinkRefererTuple = [string, string];

const addRefererToDownloadLink = (referer: string, download_link_match_pattern: string) => {
	chrome.webRequest.onBeforeSendHeaders.addListener(
		details => {
			const exists = details.requestHeaders?.find(({ name }) => name.match(/referer/gi));
			if (!exists) {
				details.requestHeaders?.push({
					name: "Referer",
					value: referer,
				});
			}
			return {
				requestHeaders: details.requestHeaders,
			};
		},
		{ urls: [download_link_match_pattern] },
		["blocking", "requestHeaders", "extraHeaders"]
	);
};

export type downloadLink = {
	url: string;
	original_url: string;
	filename: string;
	ext: string | null;
	size: string;
	rawSize: number;
} | null;

const download_file = (
	options: chrome.downloads.DownloadOptions,
	callback?: (downloadId?: number) => void
) => chrome.downloads.download(options, callback);

const download_with_attr = (download_url: string | null, filename?: string) => {
	if (!download_url) return;
	const link = document.createElement("a");
	link.href = download_url;
	link.style.display = "none";
	if (filename) link.setAttribute("download", filename);
	document.body.appendChild(link);
	link.click();
	link.remove();
};

const download_without_attr = (download_url?: string | null) => {
	if (!download_url) return;
	const link = document.createElement("a");
	link.href = download_url;
	link.style.display = "none";
	document.body.appendChild(link);
	link.click();
	link.remove();
};

const checkResponse = async (url: string) => {
	return new Promise<{
		type: "response";
		url: string;
		response: chrome.webRequest.WebResponseHeadersDetails;
	} | null>(resolve => {
		var listener1: any;
		var resolved = false;
		setTimeout(() => {
			if (!resolved) {
				resolved = true;
				resolve(null);
			}
		}, 5000);
		listener1 = (message: any) => {
			if (message.type == "response" && decodeURI(message.url) == url && !resolved) {
				resolved = true;
				resolve(message);
				chrome.runtime.onMessage.removeListener(listener1);
			}
		};
		chrome.runtime.onMessage.addListener(listener1);
	});
};

const changeDownloadFilename = (url: string, new_filename?: string | null, ext?: string | null) => {
	const new_url = url.split("/");
	if (new_url.length && new_filename) {
		new_filename = new_filename.replace(/[/\\?%*:|"<>]/g, "").replace(/\s\s+/g, " ");
		const indx = new_url.length - 1;
		const _ext = new_url[indx].match(/\.[0-9a-z]+$/i);
		const extension = _ext || ext ? `.${ext}` : null;
		new_url[indx] = `${new_filename}${extension || ""}`;
	}
	return new_url.join("/");
};

const getDownloadFilename = (url: string) => {
	const new_url = url.split("/");
	if (new_url.length) return new_url[new_url.length - 1];
	return "";
};

const genDownloadData = (
	url: string,
	contentType: string,
	contentLength: number,
	download_filename?: string
) => {
	const ext = contentTypeToExt(contentType);
	// if (ext?.match(/(ts|html)/i)) return null;
	const new_url = changeDownloadFilename(url, download_filename, ext);
	const rawSize = contentLength;
	const size = bytesToSize(rawSize);
	return {
		url: new_url,
		original_url: url,
		filename: getDownloadFilename(new_url),
		ext,
		size,
		rawSize,
	};
};

const changeFilenameFromDlink = (dlink: downloadLink, download_filename?: string) => {
	if (!dlink) return null;
	const { original_url, ext } = dlink;
	const new_url = changeDownloadFilename(original_url, download_filename, ext);
	return {
		...dlink,
		url: new_url,
		filename: getDownloadFilename(new_url),
	};
};

const fetchDownloadData = ({
	url,
	download_filename,
	timeout = 5000,
	method = "GET",
	body,
	headers = {},
}: {
	url: string;
	method?: string;
	headers?: Record<string, string>;
	download_filename?: string;
	timeout?: number;
	body?: Document | XMLHttpRequestBodyInit | null;
}) => {
	return new Promise<downloadLink>(resolve => {
		var resolved = false;
		setTimeout(() => {
			if (!resolved) {
				resolved = true;
				resolve(null);
			}
		}, timeout);
		const http = new XMLHttpRequest();
		http.open(method, url, true);
		Object.entries(headers).map(v => http.setRequestHeader(...v));
		http.onprogress = function (e) {
			const resp_url = this.responseURL;
			if (!resolved && resp_url.length) {
				const data = genDownloadData(
					resp_url,
					this.getResponseHeader("Content-Type") || "",
					e.total,
					download_filename
				);
				resolved = true;
				http.abort();
				resolve(data);
			}
		};
		http.send(body);
	});
};

export {
	addRefererToDownloadLink,
	download_with_attr,
	download_without_attr,
	download_file,
	checkResponse,
	changeDownloadFilename,
	getDownloadFilename,
	genDownloadData,
	changeFilenameFromDlink,
	fetchDownloadData,
};
