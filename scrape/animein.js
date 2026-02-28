import axios from 'axios'
class Animein {
    constructor() {
        this.baseUrl = 'https://animeinweb.com'
    }

    async request(url, buffer = false) {
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36 OPR/95.0.0.0',
                Referer: this.baseUrl,
                maxContentLength: Infinity,
  maxBodyLength: Infinity
            },
            responseType: buffer ? 'arraybuffer' : 'json'
        })
        if (res.status !== 200) throw new Error('Terjadi kesalahan saat mengambil data')

        return buffer ? Buffer.from(res.data) : res.data?.data
    }

    async schedule(day = 'senin') {
        day = day.toLowerCase()
        const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu']
        if (!days.includes(day)) throw new Error('Hari tidak valid.\nList: ' + days.join(', '))

        return this.request(`${this.baseUrl}/api/proxy/3/2/schedule/data?day=${day}`)
    }

    async search(keyword, page = 0, sort = 'views') {
        const query = new URLSearchParams({
            page,
            sort,
            keyword
        }).toString()
        return this.request(`${this.baseUrl}/api/proxy/3/2/explore/movie?${query}`)
    }

    async getAnimeDetail(id) {
        return this.request(`${this.baseUrl}/api/proxy/3/2/movie/detail/${id}`)
    }

    async getEpisodes(id, page = 0) {
        const data = await this.request(`${this.baseUrl}/api/proxy/3/2/movie/episode/${id}?page=${page}`)
        return data?.episode ?? []
    }

    async getEpisodeStream(id) {
        return this.request(`${this.baseUrl}/api/proxy/3/2/episode/streamnew/${id}`)
    }
}
