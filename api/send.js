module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const blockedAgents = [
        'curl', 'wget', 'python', 'requests', 'httpie', 'postman',
        'insomnia', 'axios', 'node-fetch', 'got', 'superagent',
        'scrapy', 'beautifulsoup', 'selenium', 'puppeteer', 'playwright',
        'httrack', 'mechanize', 'aiohttp', 'httpx', 'java', 'go-http',
        'ruby', 'perl', 'libwww', 'okhttp', 'apache-http', 'bot', 'spider',
        'crawler', 'scraper', 'headless'
    ];

    for (const agent of blockedAgents) {
        if (userAgent.includes(agent)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
    }

    if (!userAgent.includes('mozilla') && !userAgent.includes('chrome') && !userAgent.includes('safari')) {
        return res.status(403).json({
            success: false,
            message: 'Invalid request'
        });
    }

    const origin = req.headers['origin'] || '';
    const referer = req.headers['referer'] || '';
    const xRequestedWith = req.headers['x-requested-with'] || '';

    const allowedOrigins = [
        'https://yogaxd-ngl.vercel.app',
        'https://yogaxd-ngl.zone.id',
        'http://localhost',
        'http://127.0.0.1'
    ];

    const isAllowedOrigin = allowedOrigins.some(allowed =>
        origin.includes(allowed.replace('https://', '').replace('http://', '')) ||
        referer.includes(allowed.replace('https://', '').replace('http://', ''))
    );

    if (!isAllowedOrigin && origin !== '' && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return res.status(403).json({
            success: false,
            message: 'Unauthorized origin'
        });
    }

    if (xRequestedWith !== 'XMLHttpRequest') {
        return res.status(403).json({
            success: false,
            message: 'Invalid request type'
        });
    }

    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
        return res.status(400).json({
            success: false,
            message: 'Invalid content type'
        });
    }

    try {
        const { username, question, deviceId } = req.body;

        if (!username || !question) {
            return res.status(400).json({
                success: false,
                message: 'Username dan question wajib diisi'
            });
        }

        if (typeof username !== 'string' || typeof question !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid data type'
            });
        }

        if (username.length > 30 || question.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Data too long'
            });
        }

        const finalDeviceId = deviceId || `anon-${Math.random().toString(36).substr(2, 9)}${Date.now()}`;

        const response = await fetch('https://ngl.link/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
                'Origin': 'https://ngl.link',
                'Referer': `https://ngl.link/${username}/`,
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: new URLSearchParams({
                username: username,
                question: question,
                deviceId: finalDeviceId,
                gameSlug: '',
                referrer: ''
            })
        });

        const responseText = await response.text();

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
                return res.status(response.status || 500).json({
                    success: false,
                    message: 'NGL returned error page. Mungkin rate limited atau username tidak valid.'
                });
            }
            return res.status(response.status || 500).json({
                success: false,
                message: responseText || 'Unknown error from NGL'
            });
        }

        return res.status(response.status).json({
            success: response.ok,
            ...data
        });

    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({
            success: false,
            message: 'Proxy error: ' + error.message
        });
    }
};
