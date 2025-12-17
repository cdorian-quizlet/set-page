import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { term, definition } = req.body;

        if (!term || !definition) {
            return res.status(400).json({ error: 'Term and definition are required' });
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful tutor creating quiz questions. Generate a single multiple choice question to test understanding of the concept.
                    Return ONLY a JSON object with these keys:
                    - "question": the quiz question
                    - "options": array of 4 options (a, b, c, d)
                    - "correct": the letter of the correct answer
                    - "explanation": brief explanation of why the answer is correct
                    Do not include any markdown formatting, just the raw JSON.`
                },
                {
                    role: 'user',
                    content: `Create a quiz question for:\nConcept: ${term}\nAnswer: ${definition}`
                }
            ],
            temperature: 0.8,
        });

        const responseText = completion.choices[0].message.content.trim();
        
        let quiz;
        try {
            quiz = JSON.parse(responseText);
        } catch (parseError) {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                quiz = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Failed to parse quiz from AI response');
            }
        }

        res.json({
            success: true,
            quiz,
            usage: completion.usage
        });
    } catch (error) {
        console.error('Quiz error:', error);
        res.status(500).json({ 
            error: 'Failed to generate quiz',
            details: error.message 
        });
    }
}

