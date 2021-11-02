import { arrSet } from "@src/utils/helper";

const extractLinks = (regex?: RegExp | null) => {
	const link_attrs = (e: HTMLElement) => ($(e).attr("src") || $(e).attr("href"))?.trim() || "";
	return arrSet(
		$("*")
			.toArray()
			.filter(link_attrs)
			.map(link_attrs)
			.filter(Boolean)
			.filter(e => (regex ? e?.match(regex) : e))
	);
};

export { extractLinks };
