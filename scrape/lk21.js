import * as cheerio from 'cheerio';
import { URLSearchParams } from 'url';
export class lk21 {
	constructor() {
		this.base = 'https://tv3.lk21online.mom';
		this.baseDL = 'https://dl.lk21.party';
	}

	async byGenre(genre, page = 1) {
		const html = await this.fetch(this.base + '/genre/' + genre + '/page/' + page);
		this.extractTag(html, 'genre1', genre);
		return this.extractMetadata(html);
	}

	async byCountry(county, page = 1) {
		const html = await this.fetch(this.base + '/country/' + county + '/page/' + page);
		this.extractTag(html, 'country', country);
		return this.extractMetadata(html);
	}

	async byYear(year, page = 1) {
		const html = await this.fetch(this.base + '/year/' + year + '/page/' + page);
		this.extractTag(html, 'tahun', year);
		return this.extractMetadata(html);
	}

	async bySeries(series, page = 1) {
		const list = ['asian', 'west', 'ongoing', 'complete'];
		if (!list.includes(series)) throw new Error('Pilih Salah Satu Series: ' + list.join(', '));
		const html = await this.fetch(this.base + '/series/' + series + '/page/' + page);
		return this.extractMetadata(html);
	}

	async byPopuler(type, page = 1) {
		const list = ['both', 'movie', 'series'];
		if (!list.includes(type)) throw new Error('Pilih Salah Satu Type: ' + list.join(', '));
		const html = await this.fetch(this.base + '/populer/type/' + type + '/page/' + page);
		return this.extractMetadata(html);
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

	async Detail(url) {
		const html = await this.fetch(url);
		const $ = cheerio.load(html);

		const result = {};

		result.detail = {
			title: $('.movie-info h1').text().trim(),
			releaseDate: $('.info-tag span').eq(0).text().trim(),
			region: $('.info-tag span').eq(1).text().trim(),
			status: $('.info-tag span').eq(2).text().trim(),
			synopsis: $('.synopsis').text().trim(),
			tags: [],
			director: '',
			cast: [],
			country: '',
			poster: $('.detail picture img').attr('src') || null,
		};

		$('.detail p').each((_, el) => {
			const label = $(el).find('span').text();

			if (label.includes('Sutradara')) {
				result.detail.director = $(el).find('a').text().trim();
			}

			if (label.includes('Bintang Film')) {
				$(el)
					.find('a')
					.each((_, a) => {
						result.detail.cast.push($(a).text().trim());
					});
			}

			if (label.includes('Negara')) {
				result.detail.country = $(el).find('a').text().trim();
			}
		});

		$('.tag-list .tag a').each((_, el) => {
			result.detail.tags.push({
				name: $(el).text().trim(),
				url: this.base + $(el).attr('href'),
			});
		});

		result.trailer = $('.trailer-series iframe').attr('src') || null;
		result.relatedSeries = [];

		$('.mob-related-series .slider article').each((_, el) => {
			result.relatedSeries.push({
				title: $(el).find('.poster-title').text().trim(),
				year: $(el).find('.year').text().trim(),
				rating:
					$(el)
						.find('.rating')
						.text()
						.replace(/[^\d.]/g, '') || 'Unknown',
				genre: $(el).find('.genre').text().trim(),
				episode: $(el).find('.episode').text().trim(),
				season: $(el).find('.duration').text().trim(),
				url: this.base + $(el).find('a').attr('href'),
				thumbnail: $(el).find('picture img').attr('src'),
			});
		});

		result.download = $('.movie-action a').attr('href') || null;

		return result;
	}

	async Download(url) {
		const headers = {
			'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
			Referer: 'https://dl.lk21.party',
			'x-requested-with': 'XMLHttpRequest',
		};

		const slug = url.split('/')[3];
		const raw = await this.fetch(this.baseDL + '/get/' + slug, { headers });
		const match = raw.match(/setCookie\('validate', '([^']+)'/);

		const data = new URLSearchParams();
		data.append('slug', slug);

		const html = await this.fetch(this.baseDL + '/verifying.php?slug=' + slug, {
			method: 'POST',
			headers: {
				...headers,
				'Content-Type': 'application/x-www-form-urlencoded',
				Cookie: 'validate=' + match[1],
			},
			body: data,
		});

		const $ = cheerio.load(html);
		const result = [];
		$('tr').each((i, el) => {
			const name = $(el).find('strong').text().trim();
			const url = $(el).find('a').attr('href');

			if (name && url)
				result.push({
					name,
					url,
				});
		});

		if (!result?.length) throw new Error('Link Download Tidak Ditemukan');

		return result;
	}
	async fetch(url, options = {}) {
		const res = await fetch(url, {
			headers: options.headers
				? options.headers
				: {
						'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
						'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
						Referer: 'https://google.com',
					},
			...options,
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

		if (!result?.length) throw new Error('Gagal Mengekstrak Data');
		return result;
	}

	extractTag(html, tag, type) {
		const $ = cheerio.load(html);
		const result = new Set();
		$(`.form-filter .form-group select[name="${tag}"] option`).each((i, el) => {
			const opt = $(el).val();
			if (opt) result.add(opt);
		});

		if (!result.has(type)) throw new Error('Type yang dipilih tidak valid, Pilih type berikut: ' + Array.from(result).join(', '));
	}
}
