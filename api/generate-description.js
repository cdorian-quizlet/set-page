import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { title, flashcards } = req.body;

        if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
            return res.status(400).json({ error: 'Flashcards array is required' });
        }

        const termsSummary = flashcards.slice(0, 15).map(card => card.term).join(', ');
        const setTitle = title || 'Study Set';

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful assistant that writes brief, engaging descriptions for educational flashcard sets. 
                    Write a 1-2 sentence description that explains what the set covers and who it might be useful for.
                    Be concise and informative. Do not use quotes or special formatting.`
                },
                {
                    role: 'user',
                    content: `Write a brief description for this flashcard set:
Title: ${setTitle}
Number of cards: ${flashcards.length}
Sample terms: ${termsSummary}`
                }
            ],
            temperature: 0.7,
            max_tokens: 100
        });

        res.json({
            success: true,
            description: completion.choices[0].message.content.trim(),
            usage: completion.usage
        });
    } catch (error) {
        console.error('Generate description error:', error);
        res.status(500).json({ 
            error: 'Failed to generate description',
            details: error.message 
        });
    }
}

