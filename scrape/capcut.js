import axios from 'axios';

async function capcutDL(url) {
	if (!url) throw new Error('URL is required');

	const res = await axios.post(
		'https://3bic.com/api/download',
		{ url },
		{
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
			},
		}
	);

	if (res.data.code !== 200) throw new Error('Failed to fetch video');

	return {
		title: res.data.title,
		author: res.data.authorName,
		cover: res.data.coverUrl,
		video: 'https://3bic.com' + res.data.originalVideoUrl,
	};
}
