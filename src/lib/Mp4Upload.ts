import { downloadLink, download_without_attr, fetchDownloadData } from "@src/lib/DownloadHelper";
import { extractLinks } from "@src/lib/LinkExtractor";
import { arrSet } from "@src/utils/helper";

export namespace Mp4Upload {
	export const origin_url = "https://www.mp4upload.com/";
	export const match_url_pattern = "https://*.mp4upload.com:*/*";
	const match_url_regex = new RegExp("(.*)(.)?mp4upload.[a-z](:)?(.*)/(.*)", "i");

	export const getDownloadLink = async ({
		type,
		value,
		download_filename,
		origin = origin_url,
	}: {
		type: "id" | "url";
		value: string;
		download_filename?: string;
		origin?: string;
	}) => {
		return new Promise<downloadLink>(resolve => {
			var url: string | undefined;
			var id: string | undefined;

			switch (type) {
				case "id":
					url = `${origin}${value}`;
					id = value;
					break;
				case "url":
					url = value;
					id = value.split("/").slice(-1).toString();
					break;
				default:
					break;
			}

			if (!url || !id) {
				resolve(null);
				return;
			}

			const frmData = new FormData();
			Object.entries({
				op: "download2",
				id,
			}).forEach(([key, value]) => frmData.append(key, value));

			fetchDownloadData({
				url,
				download_filename,
				method: "POST",
				body: frmData,
				headers: {
					"Content-type": "multipart/form-data",
					// "Referer": origin_url
				},
			}).then(resolve);
		});
	};

	const embedToNormalLink = (embed_link: string) =>
		embed_link.replace(/\/embed-/, "/").replace(/\.html$/i, "");

	export const getLinks = () => {
		return arrSet(extractLinks(match_url_regex).map(embedToNormalLink));
	};

	export const download = download_without_attr;

	export const isMp4UploadDLink = (url?: string | null) => url?.match(match_url_regex);
}
