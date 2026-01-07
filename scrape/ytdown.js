import axios from 'axios';
import { delay } from 'baileys';
//const delay = ms => new Promise(r => setTimeout(r, ms));

async function ytdown(url, type = 'video') {
	const { data } = await axios.post('https://ytdown.to/proxy.php', new URLSearchParams({ url }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

	const api = data.api;

	const media = api.mediaItems.find((m) => m.type.toLowerCase() === type.toLowerCase());

	if (!media) throw new Error('Media type not found');

	while (true) {
		const { data: res } = await axios.get(media.mediaUrl);

		if (res.error === 'METADATA_NOT_FOUND') throw new Error('Metadata not found');

		if (res.percent === 'Completed' && res.fileUrl !== 'In Processing...') {
			return {
				info: {
					title: api.title,
					desc: api.description,
					thumbnail: api.imagePreviewUrl,
					views: api.mediaStats?.viewsCount,
					uploader: api.userInfo?.name,
					quality: media.mediaQuality,
					duration: media.mediaDuration,
					extension: media.mediaExtension,
					size: media.mediaFileSize,
				},
				download: res.fileUrl,
			};
		}

		await delay(5000);
	}
}
