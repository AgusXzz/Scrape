import * as cheerio from 'cheerio'

async function readSurah(url) {
    const htmlRaw = await fetch(url)
    if (!htmlRaw.ok) throw new Error('Gagal Fetch')
    const html = await htmlRaw.text()
    const $ = cheerio.load(html)
    const result = []

    $('.flex-grow.flex').each((i, el) => {
        result.push({
            arab: $(el).find('.__className_8a198f').text().trim(),
            latin: $(el).find('.mb-3').text().trim(),
            indo: $(el).find('.text-neutral-700').text().trim()
        })

    })

    if (result) return result
}

async function listSurah() {
    const htmlRaw = await fetch('https://quran.nu.or.id')
    if (!htmlRaw.ok) throw new Error('Gagal Fetch')
    const html = await htmlRaw.text()
    const $ = cheerio.load(html)
    const result = []

    $('.line-clamp-1').each((i, el) => {
        result.push({
            title: $(el).attr('title').trim(),
            link: 'https://quran.nu.or.id' + $(el).attr('href')
        })
    })

    if (result) return result

}
