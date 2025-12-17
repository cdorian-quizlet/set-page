import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { flashcards } = req.body;

        if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
            return res.status(400).json({ error: 'Flashcards array is required' });
        }

        const termsList = flashcards.map((card, index) => `${index}: ${card.term}`).join('\n');

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert at organizing educational content. Given a list of flashcard terms/questions, group them into logical categories or topics.

Return ONLY a JSON object with this structure:
{
  "groups": [
    {
      "title": "Category Name",
      "description": "Brief description of this category",
      "cardIndices": [0, 1, 2]
    }
  ]
}

Rules:
- Create 2-6 logical groups based on the content
- Each card index should appear in exactly one group
- Use clear, concise category titles
- Order groups from most foundational concepts to more advanced
- Do not include any markdown formatting, just the raw JSON`
                },
                {
                    role: 'user',
                    content: `Group these flashcard terms into logical categories:\n\n${termsList}`
                }
            ],
            temperature: 0.5,
        });

        const responseText = completion.choices[0].message.content.trim();
        
        let grouping;
        try {
            grouping = JSON.parse(responseText);
        } catch (parseError) {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                grouping = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Failed to parse grouping from AI response');
            }
        }

        res.json({
            success: true,
            grouping,
            usage: completion.usage
        });
    } catch (error) {
        console.error('Group flashcards error:', error);
        res.status(500).json({ 
            error: 'Failed to group flashcards',
            details: error.message 
        });
    }
}

