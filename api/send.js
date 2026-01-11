export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { username, question, deviceId } = req.body;

        if (!username || !question) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username dan question wajib diisi' 
            });
        }

        // Generate deviceId if not provided
        const finalDeviceId = deviceId || `anon-${Math.random().toString(36).substr(2, 9)}${Date.now()}`;

        // Forward request to NGL API
        const response = await fetch('https://ngl.link/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Origin': 'https://ngl.link',
                'Referer': 'https://ngl.link/'
            },
            body: new URLSearchParams({
                username: username,
                question: question,
                deviceId: finalDeviceId,
                gameSlug: '',
                referrer: ''
            })
        });

        const data = await response.json();

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
}
