import axios from 'axios'
import cheerio from 'cheerio'

function findMedia(obj) {
  if (!obj || typeof obj !== 'object') return null;

  if (obj.xig_polaris_media?.if_not_gated_logged_out) {
    return obj.xig_polaris_media.if_not_gated_logged_out;
  }

  for (const key in obj) {
    const res = findMedia(obj[key]);
    if (res) return res;
  }

  return null;
}

function getMedia(data) {
  const result = [];

  const list = data.carousel_media
  for (const item of list) {
    if (item.__typename === 'XIGPolarisImageMedia' && item.display_uri) {
      result.push({ type: 'image', url: item?.image_versions2?.candidates?.[0]?.url });
    }

    if (item.__typename === 'XIGPolarisVideoMedia') {
      const url = item.video_versions?.[0]?.url;
      if (url) result.push({ type: 'video', url });
    }
  }

  return result;
}

function extractData(html) {
    const $ = cheerio.load(html);
  const scripts = $('script[type="application/json"][data-sjs]');

  for (let i = 0; i < scripts.length; i++) {
    try {
      const json = JSON.parse($(scripts[i]).html());
      const data = findMedia(json);

      if (data) return data;
      
    } catch {}
  }
}

async function igdl(url) {
  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'sec-fetch-site': 'same-origin',
    }
  });

  const data = extractData(html);
  if (!data) throw new Error('Gagal ambil data IG');

  return {
    title: data?.caption?.text || null,
    comment_count: data.comment_count,
    like_count: data.like_count,
    username: data?.user?.username,
    taken_at: data.taken_at,
    media: getMedia(data)
  };
}
