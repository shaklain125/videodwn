import { Box, CircularProgress, List, Typography } from "@mui/material";
import { DownloadLink } from "@src/app/popup/components/DownloadLink";
import { changeFilenameFromDlink, downloadLink, fetchDownloadData } from "@src/lib/DownloadHelper";
import { getAll } from "@src/lib/Storage";
import { arrSet, range } from "@src/utils/helper";
import React, { FC, useEffect, useState } from "react";

const FolderList: FC = () => (
	<List sx={{ width: "100%", bgcolor: "background.paper" }}>
		{range(20).map(v => (
			<DownloadLink key={v} none={true} />
		))}
	</List>
);

const Info = (e: string, dlink: downloadLink) => {
	if (!dlink) return <></>;
	return (
		<>
			<div>
				Link: <span>{e}</span>
			</div>
			<div>
				Raw Size: <span>{dlink.rawSize}</span>
			</div>
			<div>
				Size: <span>{dlink.size}</span>
			</div>
			<div>
				Filename: <span>{dlink.filename}</span>
			</div>
			<div>
				Ext: <span>{dlink.ext}</span>
			</div>
		</>
	);
};

type Props = {};

const Popup: FC<Props> = () => {
	const [links, setLinks] = useState<string[]>(() => []);
	const [downloadLinks, setDownloadLinks] = useState<Record<string, downloadLink>>({});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let active = true;
		setLoading(true);
		chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
			const activeId = tabs[0]?.id;
			const tabTitle = tabs[0].title || "";
			if (activeId && active) {
				getAll().then(v => {
					const linksFound = (v[activeId] || []) as (downloadLink | string)[];
					console.log(`(${linksFound.length})`, "Links found", linksFound);
					const setDlinks = async () => {
						const l = (
							await Promise.all(
								linksFound.filter(Boolean).map(async v =>
									typeof v != "string"
										? changeFilenameFromDlink(v, tabTitle)
										: await fetchDownloadData({
												url: v,
												download_filename: tabTitle,
										  })
								)
							)
						).filter(Boolean);
						if (active) {
							const get_original_url = (v: downloadLink | string) =>
								typeof v != "string" ? (v?.original_url as string) : v;
							const links_set = arrSet(l.map(get_original_url));
							setLinks(links_set);
							const dl = l
								.map(v => {
									const original = get_original_url(v);
									return links_set.includes(original) ? { [original]: v } : null;
								})
								.filter(Boolean);
							setDownloadLinks(Object.assign({}, ...dl));
							setLoading(false);
							console.log("DL", dl);
							console.log(links_set);
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

	if (links.length == 0 && loading) {
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
					<CircularProgress />
				</Typography>
				<Typography component={"div"} sx={{ fontWeight: "bold" }} variant="body1">
					Finding downloadable content...
				</Typography>
			</Box>
		);
	}

	if (links.length == 0 && !loading) {
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
					🙁
				</Typography>
				<Typography component={"div"} sx={{ fontWeight: "bold" }} variant="body1">
					No media links found
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
					{links.map((link, i) => {
						const dlink = downloadLinks[link];
						return (
							<DownloadLink
								key={`downloadLink-${i}`}
								original_link={link}
								link={dlink}
							/>
						);
					})}
				</List>
			)}
		</Box>
	);
};

export { Popup };
