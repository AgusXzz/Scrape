async function bypass(url) {
    try {
        const cf = await solveTurnstile({
            url: "https://bypass.tools",
            siteKey: "0x4AAAAAACXArKb_xnkUnwy8"
        });
        const res = await fetch('https://bypass.tools/api/bypass', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url,
                captchaToken: cf?.data?.token,
                isPremium: false,
                key: null,
                forceRefresh: false
            })
        });

        return res.json();;

    } catch (e) {
        throw new Error('Terjadi Kesalahan Saat Bypass Link: ' + e);
    }
}

/***
https://npmjs.com/zencf
Ngambil dari sini wok,
makasih buat yg bkin ini web,
dan makasih dah kasi tau.
***/

async function solveTurnstile({
    url,
    siteKey,
    mode = "turnstile-min"
}) {
    try {
        const res = await fetch('https://cf.zenzxz.web.id/solve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url,
                siteKey,
                mode
            })
        });

        return res.json();;

    } catch (e) {
        throw new Error('Terjadi Kesalahan Saat Solve Turnstile: ' + e);
    }
}
