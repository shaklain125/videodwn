import { downloadLink, genDownloadData } from "@src/lib/DownloadHelper";
import { injectJW } from "@src/lib/injectJW";
import { getAll, updateKey } from "@src/lib/Storage";
import { arrSet, disableLog, importJq } from "@src/utils/helper";

var links_l: (downloadLink | string)[] = [];

disableLog(false);

const filterLinks = (links: any) => {
	const get_original_url = (v: downloadLink | string) =>
		typeof v != "string" ? (v?.original_url as string) : v;
	const links_set = arrSet(links.map(get_original_url));
	links = arrSet(
		links
			.filter((v: any) => links_set.includes(get_original_url(v)))
			.filter((v: any) => (typeof v != "string" ? !v.ext.match(/(ts|html)/i) : v))
			.filter(Boolean)
	);
	return links;
};

const pushLink = (tab_id: number | null, callback?: (links: any) => any) => {
	if (tab_id && callback)
		updateKey(tab_id.toString(), current => {
			links_l = filterLinks(callback([...(current || []), ...links_l]));
			// console.log("UPDATE", [...(current || []), ...links_l]);
			// return [...(current || []), ...links_l];
			console.log("UPDATE", links_l);
			return links_l;
		}).then(() => {
			getAll().then(v => console.log("ALL", v));
		});
};

(() => {
	var tab_id: number | null = null;
	var is_main_frame: boolean = false;
	importJq();
	console.log("Hello from content_script.js", "at", window.location.origin);

	chrome.runtime.sendMessage("tab_id", ({ id, url }: { id: number | null; url: string }) => {
		tab_id = id;
		is_main_frame = url == window.location.href;
		if (is_main_frame) {
			console.log("IS_MAIN");
			if (id) chrome.storage.sync.remove(id.toString());
		}
	});

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

	get_win("jwplayer").then(v => {
		if (v) {
			const files = v.map(({ file }: any) => file).filter(Boolean);
			if (files.length) {
				console.log("JWFILES", files);
				pushLink(tab_id, links => {
					files.forEach((f: any) => {
						const exists = links.find(
							(v: any) =>
								(typeof v != "string" && v?.original_url == f) ||
								(typeof v == "string" && v == f)
						);
						if (!exists) links.push(f);
					});
					return links;
				});
			}
		}
	});

	injectJW();

	chrome.runtime.onMessage.addListener(req => {
		const response = req.response as chrome.webRequest.WebResponseHeadersDetails;
		switch (req.type) {
			case "video_response": {
				// console.log("VID_RESP", req);
				const headers = response.responseHeaders;
				if (headers) {
					const contentType = headers.find(({ name }) =>
						name.match(/content-type/i)
					)?.value;
					const contentLength = headers.find(({ name }) =>
						name.match(/content-length/i)
					)?.value;
					pushLink(tab_id, links => {
						const exists = links.find(
							(v: any) =>
								(typeof v != "string" && v?.original_url == req.url) ||
								(typeof v == "string" && v == req.url)
						);
						const d =
							contentType && contentLength
								? genDownloadData(req.url, contentType, parseInt(contentLength))
								: null;
						if (!exists && d) links.push(d);
						return links;
					});
				}
				break;
			}
			default:
				break;
		}
	});
})();
