import { delay } from 'baileys';

async function saveweb2zip(url, renameAssets = false, saveStructure = false, alternativeAlgorithm = false, mobileVersion = false) {
	const request = await fetch('https://copier.saveweb2zip.com/api/copySite', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			url,
			renameAssets,
			saveStructure,
			alternativeAlgorithm,
			mobileVersion,
		}),
	});

	if (!request.ok) throw new Error('Failed to fetch');
	const { md5 } = await request.json();

	while (true) {
		const req = await fetch('https://copier.saveweb2zip.com/api/getStatus/' + md5);
		const res = await req.json();
		if (res.isFinished) {
			if (!res.success) throw new Error(res.errorText || 'Failed');
			return {
				startedAt: res.startedAt,
				fileCopied: res.copiedFilesAmount,
				downloadUrl: 'https://copier.saveweb2zip.com/api/downloadArchive/' + res.md5,
			};
		}
		await delay(5000);
	}
}
