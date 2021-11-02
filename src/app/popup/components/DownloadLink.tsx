import { FileDownloadRounded, Movie } from "@mui/icons-material";
import {
	Avatar,
	CircularProgress,
	Divider,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	Typography,
} from "@mui/material";
import {
	checkResponse,
	downloadLink,
	download_file,
	download_with_attr,
} from "@src/lib/DownloadHelper";
import { Mp4Upload } from "@src/lib/Mp4Upload";
import React, { FC } from "react";

type Props = {
	link?: downloadLink;
	original_link?: string;
	none?: boolean;
};

const El: FC = () => (
	<React.Fragment>
		<ListItemButton>
			<ListItemAvatar>
				<Avatar>
					<Movie />
				</Avatar>
			</ListItemAvatar>
			<ListItemText
				primary="Vacation"
				secondary={
					<React.Fragment>
						<Typography
							sx={{ display: "inline" }}
							component="span"
							variant="body2"
							color="text.primary">
							Sandra Adams
						</Typography>
						{" — Do you have Paris recommendations? Have you ever…"}
					</React.Fragment>
				}
			/>
		</ListItemButton>
		<Divider variant="inset" component="li" sx={{ ml: 0 }} />
	</React.Fragment>
);

const DownloadLink: FC<Props> = ({ link, original_link, none }) => {
	if (!link) {
		if (none) return <El />;
		return (
			<ListItemButton>
				<ListItemAvatar>
					<Avatar>
						<CircularProgress />
					</Avatar>
				</ListItemAvatar>
				<ListItemText
					primary={<React.Fragment>Finding downloadable content</React.Fragment>}
					secondary={
						<React.Fragment>
							<Typography
								component="span"
								variant="body2"
								sx={{
									display: "flex",
									alignItems: "end",
									mt: "0.5rem",
									whiteSpace: "nowrap",
								}}>
								<span
									style={{
										width: "fit-content",
										textOverflow: "ellipsis",
										overflow: "hidden",
									}}>
									{original_link}
								</span>
							</Typography>
						</React.Fragment>
					}
				/>
			</ListItemButton>
		);
	}
	return (
		<React.Fragment>
			<ListItemButton
				onClick={() => {
					const download_and_check = (
						url?: string | null,
						cb?: (status: boolean) => void
					) => {
						if (!url) return;
						Mp4Upload.download(url);
						checkResponse(url).then(v => {
							if (cb) cb(v?.response.statusCode != 200 ? false : true);
						});
					};

					const download_and_check_alt = (
						url?: string | null,
						cb?: (status: boolean) => void
					) => {
						if (!url) return;
						download_with_attr(url, link.filename);
						checkResponse(url).then(v => {
							if (cb) cb(v?.response.statusCode != 200 ? false : true);
						});
					};

					const normalDownload = () => {
						download_file({ url: link.original_url, filename: link.filename }, id => {
							if (!id)
								download_and_check_alt(link.original_url, status => {
									if (!status) download_and_check(link.original_url);
								});
						});
					};

					if (Mp4Upload.isMp4UploadDLink(link.url)) {
						download_and_check(link.url, status => {
							if (!status)
								download_and_check(link.original_url, status => {
									if (status) download_and_check_alt(link.original_url);
								});
						});
					} else {
						normalDownload();
					}

					// Mp4Upload.download(link.url);
				}}>
				<ListItemAvatar>
					<Avatar>
						<Movie />
					</Avatar>
				</ListItemAvatar>
				<ListItemText
					primary={link.filename}
					classes={{
						primary: "twolines_ellipsis",
					}}
					secondary={
						<React.Fragment>
							<Typography
								component="span"
								variant="body2"
								sx={{
									display: "flex",
									alignItems: "end",
									mt: "0.5rem",
									whiteSpace: "nowrap",
								}}>
								<FileDownloadRounded sx={{ mr: "0.2rem" }} />
								<span>
									{`${link.size} ${
										link.ext ? `- ${link.ext.toUpperCase()}` : ""
									}`}
								</span>
								<span
									style={{
										width: "fit-content",
										textOverflow: "ellipsis",
										overflow: "hidden",
										marginLeft: "0.5rem",
									}}>
									{link.url}
								</span>
							</Typography>
						</React.Fragment>
					}
				/>
			</ListItemButton>
			<Divider variant="inset" component="li" sx={{ ml: 0 }} />
		</React.Fragment>
	);
};

export { DownloadLink };
