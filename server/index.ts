import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Simple AI endpoint for migration
app.post('/api/ai/generate-creative', async (req, res) => {
  try {
    const { context, parameters, contentType } = req.body;
    
    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (!openAIApiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const prompt = `Generate creative content for ${contentType} based on the context: ${JSON.stringify(context)}`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;

    res.json({
      success: true,
      content: {
        raw: content,
        headlines: [content.split('\n')[0] || 'Generated Headline'],
        descriptions: [content],
        ctaTexts: ['Get Started Now'],
        narrativeElements: [content],
        visualPrompts: ['Professional setting'],
        emotionalHooks: ['Transform your business'],
        persuasionFrameworks: ['AIDA']
      }
    });

  } catch (error) {
    console.error('Error generating creative:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});