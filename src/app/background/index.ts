import { addRefererToDownloadLink, DownloadLinkRefererTuple } from "@src/lib/DownloadHelper";
import { Mp4Upload } from "@src/lib/Mp4Upload";
import { getAll, rmKey } from "@src/lib/Storage";

const downloadLinkReferers: DownloadLinkRefererTuple[] = [
	[Mp4Upload.origin_url, Mp4Upload.match_url_pattern],
];

downloadLinkReferers.forEach(r => addRefererToDownloadLink(...r));

chrome.webRequest.onHeadersReceived.addListener(
	details => {
		if (!details.responseHeaders) return;
		const dest = details.responseHeaders.find(
			({ name, value }) => name.match(/content-type/i) && value?.match(/video/i)
		);
		if (dest) {
			chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
				const activeTab = tabs[0]?.id;
				if (!activeTab || (activeTab && details.tabId != activeTab)) return;
				chrome.tabs.sendMessage(activeTab, {
					type: "video_response",
					url: details.url,
					response: details,
				});
			});
		}
		chrome.runtime.sendMessage({ type: "response", url: details.url, response: details });
	},
	{ urls: ["<all_urls>"] },
	["blocking", "extraHeaders", "responseHeaders"]
);

chrome.runtime.onMessage.addListener((req, sender, sendResp) => {
	if (req == "tab_id") sendResp({ id: sender.tab?.id, url: sender.tab?.url });
});

chrome.tabs.onActivated.addListener(() => {
	chrome.tabs.query({}, function (tabs) {
		const tab_ids = tabs.map(({ id }) => id).filter(Boolean);
		getAll().then(v => {
			Object.keys(v)
				.filter(key => !tab_ids.includes(parseInt(key)))
				.forEach(key => {
					rmKey(key);
				});
		});
	});
});
