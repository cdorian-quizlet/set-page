import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasApiKey: !!process.env.OPENAI_API_KEY });
});

// Chat completion endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, model = 'gpt-4o-mini' } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        const completion = await openai.chat.completions.create({
            model,
            messages,
            temperature: 0.7,
        });

        res.json({
            success: true,
            message: completion.choices[0].message,
            usage: completion.usage
        });
    } catch (error) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ 
            error: 'Failed to get AI response',
            details: error.message 
        });
    }
});

// Generate flashcards from text
app.post('/api/generate-flashcards', async (req, res) => {
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
        
        // Try to parse the JSON response
        let flashcards;
        try {
            flashcards = JSON.parse(responseText);
        } catch (parseError) {
            // Try to extract JSON from the response if it's wrapped in markdown
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
});

// Explain a flashcard concept in more detail
app.post('/api/explain', async (req, res) => {
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
});

// Generate a description for a flashcard set
app.post('/api/generate-description', async (req, res) => {
    try {
        const { title, flashcards } = req.body;

        if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
            return res.status(400).json({ error: 'Flashcards array is required' });
        }

        // Create a summary of the content
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
});

// Group flashcards into categories for TOC
app.post('/api/group-flashcards', async (req, res) => {
    try {
        const { flashcards } = req.body;

        if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
            return res.status(400).json({ error: 'Flashcards array is required' });
        }

        // Create a summary of all terms for the AI to categorize
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
});

// Quiz me on current flashcard
app.post('/api/quiz', async (req, res) => {
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
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📚 Flashcard app ready!`);
    if (!process.env.OPENAI_API_KEY) {
        console.warn('⚠️  Warning: OPENAI_API_KEY not set in .env file');
    }
});

