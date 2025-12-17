import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { term, definition, question } = req.body;

        if (!term || !definition) {
            return res.status(400).json({ error: 'Term and definition are required' });
        }

        const userQuestion = question || 'Explain this concept in more detail with examples.';

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful tutor explaining concepts to students. Be clear, concise, and use examples when helpful.'
                },
                {
                    role: 'user',
                    content: `The flashcard shows:\nTerm: ${term}\nDefinition: ${definition}\n\nStudent question: ${userQuestion}`
                }
            ],
            temperature: 0.7,
        });

        res.json({
            success: true,
            explanation: completion.choices[0].message.content,
            usage: completion.usage
        });
    } catch (error) {
        console.error('Explain error:', error);
        res.status(500).json({ 
            error: 'Failed to get explanation',
            details: error.message 
        });
    }
}

