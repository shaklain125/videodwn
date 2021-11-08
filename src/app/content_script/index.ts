import { downloadLink, genDownloadData, get_original_url } from "@src/lib/DownloadHelper";
import { injectJW } from "@src/lib/injectJW";
import { getAll, updateKey } from "@src/lib/Storage";
import { arrSet, disableLog, get_win, importJq } from "@src/utils/helper";

var links_l: downloadLink[] = [];

disableLog(false);

const filterLinks = (links: downloadLink[]) => {
	const links_set = arrSet(links.map(get_original_url));
	links = arrSet(
		links
			.filter(v => links_set.includes(get_original_url(v)))
			.filter(v => (v?.type == "dlink" ? !v.ext?.match(/(ts|html)/i) : v))
			.filter(Boolean)
	);
	return links;
};

const pushLink = (tab_id: number | null, callback: (links: downloadLink[]) => downloadLink[]) => {
	if (tab_id)
		updateKey(tab_id.toString(), current => {
			links_l = filterLinks(callback([...(current || []), ...links_l]));
			console.log("UPDATE", links_l);
			return links_l;
		}).then(() => {
			getAll().then(v => console.log("ALL", v));
		});
};

const link_exists = (links: downloadLink[], f: string) =>
	links.find(
		(v: downloadLink) =>
			(v?.type == "dlink" && v?.original_url == f) || (v?.type == "url" && v?.url == f)
	);

(() => {
	var tab_id: number | null = null;
	var is_main_frame: boolean = false;

	importJq();

	console.log("Hello from content_script.js", "at", window.location.origin);

	chrome.runtime.sendMessage("tab_id", ({ id, url }: { id: number | null; url: string }) => {
		tab_id = id;
		is_main_frame = url == window.location.href;
		if (is_main_frame && id) chrome.storage.sync.remove(id.toString());
	});

	get_win("jwplayer").then(v => {
		if (v) {
			const files = v.map(({ file }: any) => file).filter(Boolean);
			if (files.length) {
				console.log("JWFILES", files);
				pushLink(tab_id, links => {
					files.forEach((f: any) => {
						if (!link_exists(links, f)) links.push({ type: "url", url: f });
					});
					return links;
				});
			}
		}
	});

	injectJW();

	chrome.runtime.onMessage.addListener(req => {
		const response: chrome.webRequest.WebResponseHeadersDetails = req.response;
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
						const d =
							contentType && contentLength
								? genDownloadData(req.url, contentType, parseInt(contentLength))
								: null;
						if (!link_exists(links, req.url) && d) links.push(d);
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
