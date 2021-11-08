import { Box, CircularProgress, List, Typography } from "@mui/material";
import { DownloadLink } from "@src/app/popup/components/DownloadLink";
import {
	changeFilenameFromDlink,
	dlink,
	downloadLink,
	fetchDownloadData,
	get_original_url,
} from "@src/lib/DownloadHelper";
import { getAll } from "@src/lib/Storage";
import { arrSet } from "@src/utils/helper";
import React, { FC, useEffect, useState } from "react";

type Props = {};

const Popup: FC<Props> = () => {
	const [links, setLinks] = useState<string[]>(() => []);
	const [downloadLinks, setDownloadLinks] = useState<Record<string, dlink>>({});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let active = true;
		setLoading(true);
		chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
			const activeId = tabs[0]?.id;
			const tabTitle = tabs[0].title || "";
			if (activeId && active) {
				getAll().then(v => {
					const linksFound: downloadLink[] = v[activeId] || [];

					const setDlinks = async () => {
						const l = linksFound
							.filter(Boolean)
							.map(v =>
								v
									? v.type == "dlink"
										? changeFilenameFromDlink(v, tabTitle)
										: v
									: null
							)
							.filter(Boolean);

						if (active) {
							const links_set = arrSet(l.map(get_original_url)).filter(Boolean);
							setLinks(links_set);

							const dl = l
								.map(v => {
									const original = get_original_url(v);
									return v?.type == "dlink" && links_set.includes(original)
										? {
												[original]: v,
										  }
										: null;
								})
								.filter(Boolean);
							setDownloadLinks(Object.assign({}, ...dl));

							l.forEach(value => {
								const key = get_original_url(value);
								if (value?.type != "url" || !links_set.includes(key)) return;
								fetchDownloadData({
									url: value.url,
									download_filename: tabTitle,
								}).then(v => {
									if (!v || v.ext?.match(/(ts|html)/i)) {
										// setLinks(prev => prev.filter(l => l != key));
										return;
									}
									setDownloadLinks(prev => ({ ...prev, [key]: v }));
								});
							});

							setLoading(false);

							// console.log("DL", dl);
							// console.log(links_set);
						}
					};
					setDlinks();
				});
			}
		});
		return () => {
			active = false;
			setLoading(false);
		};
	}, []);

	if (links.length == 0) {
		return (
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					height: "100%",
					bgcolor: "background.paper",
				}}>
				<Typography component={"div"} sx={{ mb: 2 }} variant="h2">
					{!loading ? "🙁" : <CircularProgress />}
				</Typography>
				<Typography component={"div"} sx={{ fontWeight: "bold" }} variant="body1">
					{!loading ? "No media links found" : "Finding downloadable content..."}
				</Typography>
			</Box>
		);
	}

	return (
		<Box
			sx={{
				bgcolor: "background.paper",
				height: "100%",
			}}>
			{links.length > 0 && (
				<List sx={{ width: "100%", bgcolor: "background.paper" }}>
					{links.map((link, i) => (
						<DownloadLink
							key={`downloadLink-${i}`}
							original_link={link}
							link={downloadLinks[link]}
						/>
					))}
				</List>
			)}
		</Box>
	);
};

export { Popup };
