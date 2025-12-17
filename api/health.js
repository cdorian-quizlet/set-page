export default function handler(req, res) {
    res.json({ status: 'ok', hasApiKey: !!process.env.OPENAI_API_KEY });
}

