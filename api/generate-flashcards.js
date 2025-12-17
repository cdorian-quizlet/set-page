import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text, count = 10 } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text content is required' });
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful assistant that creates educational flashcards. 
                    Generate exactly ${count} flashcards from the provided content.
                    Return ONLY a JSON array with objects containing "term" and "definition" keys.
                    Make the terms clear questions or key concepts, and definitions should be concise but complete answers.
                    Do not include any markdown formatting or code blocks, just the raw JSON array.`
                },
                {
                    role: 'user',
                    content: `Create ${count} flashcards from this content:\n\n${text}`
                }
            ],
            temperature: 0.7,
        });

        const responseText = completion.choices[0].message.content.trim();
        
        let flashcards;
        try {
            flashcards = JSON.parse(responseText);
        } catch (parseError) {
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                flashcards = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Failed to parse flashcards from AI response');
            }
        }

        res.json({
            success: true,
            flashcards,
            usage: completion.usage
        });
    } catch (error) {
        console.error('Generate flashcards error:', error);
        res.status(500).json({ 
            error: 'Failed to generate flashcards',
            details: error.message 
        });
    }
}

