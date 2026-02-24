import axios from 'axios';
import FormData from 'form-data';
import { delay } from 'baileys';

async function upscale(buffer, rasio = 2) {
	const form = new FormData();
	form.append('myfile', buffer, Date.now() + '.jpg');
	form.append('scaleRadio', rasio);

	const upload = await axios.post('https://get1.imglarger.com/api/UpscalerNew/UploadNew', form, {
		headers: {
			...form.getHeaders(),
			Origin: 'https://imgupscaler.com',
		},
	});

	if (upload.status !== 200) throw new Error('Gagal Upload Image');

	for (let i = 0; i < 20; i++) {
		const check = await axios.post(
			'https://get1.imglarger.com/api/UpscalerNew/CheckStatusNew',
			{
				code: upload.data?.data?.code,
				scaleRadio: rasio,
			},
			{
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

		const result = check.data;

		if (result?.data?.status === 'success') {
			return result;
		}

		await delay(5000);
	}

	throw new Error('Upscale Timeout');
}
