import * as cheerio from 'cheerio';
import fs from 'fs';
export class lk21 {
	constructor() {
		this.base = 'https://tv3.lk21online.mom';
	}

	async byGenre(genre, page = 1) {
		const html = await this.fetch(this.base + '/genre/' + genre + '/page/' + page);
		const tag = this.extractTag(html, 'genre1');
		if (!tag.includes(genre)) throw new Error('Pilih Salah Satu Genre: ' + tag.join(', '));
		const result = this.extractMetadata(html);
		if (!result?.length) throw new Error('Gagal Mengambil Data Genre');
		return result;
	}

	async byCountry(county, page = 1) {
		const html = await this.fetch(this.base + '/country/' + county + '/page/' + page);
		const tag = this.extractTag(html, 'country');
		if (!tag.includes(county)) throw new Error('Pilih Salah Satu Country: ' + tag.join(', '));
		const result = this.extractMetadata(html);
		if (!result?.length) throw new Error('Gagal Mengambil Data Country');
		return result;
	}

	async byYear(year, page = 1) {
		const html = await this.fetch(this.base + '/year/' + year + '/page/' + page);
		const tag = this.extractTag(html, 'tahun');
		if (!tag.includes(year)) throw new Error('Pilih Salah Satu Tahun: ' + tag.join(', '));
		const result = this.extractMetadata(html);
		if (!result?.length) throw new Error('Gagal Mengambil Data Year');
		return result;
	}

	async bySeries(series, page = 1) {
		const list = ['asian', 'west', 'ongoing', 'complete'];
		if (!list.includes(series)) throw new Error('Pilih Salah Satu Series: ' + list.join(', '));
		const html = await this.fetch(this.base + '/series/' + series + '/page/' + page);
		const result = this.extractMetadata(html);
		if (!result?.length) throw new Error('Gagal Mengambil Data Year');
		return result;
	}

	async byPopuler(type = 'both', page = 1) {
		const list = ['both', 'movie', 'series'];
		if (!list.includes(series)) throw new Error('Pilih Salah Satu Type: ' + list.join(', '));
		const html = await this.fetch(this.base + '/populer/type/' + type + '/page/' + page);
		const result = this.extractMetadata(html);
		if (!result?.length) throw new Error('Gagal Mengambil Data Year');
		return result;
	}

	async Search(query, page) {
		if (!query) throw new Error('Tulis Yang Ingin Dicari');
		const raw = await fetch(`https://gudangvape.com/search.php?s=${query}&page=${page}`, {
			headers: {
				Referer: 'https://tv3.lk21online.mom/',
			},
		});
		const res = await raw.json();
		if (!res?.data?.length) throw new Error('Hasil Tidak Ditemukan');
		return res.data.map((res) => {
			return {
				title: res.title,
				rating: res.rating,
				episode: res.episode,
				quality: res.quality || 'Unknown',
				duration: res.runtime || 'Unknown',
				type: res.type,
				year: res.year,
				thumbnail: 'https://poster.lk21.party/wp-content/uploads/' + res.poster,
				link: this.base + '/' + res.slug,
			};
		});
	}

	async fetch(url) {
		const res = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
				'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
				Referer: 'https://google.com',
			},
		});

		if (!res.ok) throw new Error(`HTTP ${res.status}, ${res.statusText}`);

		return res.text();
	}

	extractMetadata(html) {
		const $ = cheerio.load(html);
		const result = [];

		$('article').each((_, el) => {
			result.push({
				title: $(el).find('[itemprop="name"]').text().trim(),
				thumbnail: $(el).find('img').attr('src'),
				rating: $(el).find('[itemprop="ratingValue"]').text().trim() || 'Unknown',
				year: $(el).find('.year').text().trim(),
				quality: $(el).find('.label').first().text().trim() || 'Unknown',
				duration: $(el).find('.duration').text().trim(),
				link: this.base + $(el).find('a[itemprop="url"]').attr('href'),
			});
		});

		return result;
	}

	extractTag(html, tag) {
		const $ = cheerio.load(html);
		const result = new Set();
		$(`.form-filter .form-group select[name="${tag}"] option`).each((i, el) => {
			const opt = $(el).val();
			if (opt) result.add(opt);
		});

		return [...result];
	}
}
const anu = new lk21();
anu.byGenre('action').then(console.log);
