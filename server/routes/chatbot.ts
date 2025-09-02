import express from 'express';
import { db } from '../db';
import { chatbotConversations } from '../schema';
import { eq, desc } from 'drizzle-orm';

const router = express.Router();

// Get conversation history
router.get('/conversations/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const conversations = await db.select()
      .from(chatbotConversations)
      .where(eq(chatbotConversations.sessionId, sessionId))
      .orderBy(desc(chatbotConversations.createdAt));

    res.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// General chatbot conversation
router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId, userId, conversationHistory = [], context } = req.body;
    
    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (!openAIApiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const systemPrompt = `You are an AI assistant specialized in marketing and lead generation. 
    Help users with their marketing funnels, lead management, and business growth strategies.
    
    Provide helpful, actionable advice and be conversational in your responses.
    Keep responses focused and practical.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenAI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const response = aiData.choices[0].message.content;

    // Save conversation to database
    try {
      await db.insert(chatbotConversations).values([
        {
          userId,
          sessionId,
          messageRole: 'user',
          messageContent: message,
          metadata: { context, type: 'general_chat' }
        },
        {
          userId,
          sessionId,
          messageRole: 'assistant',
          messageContent: response,
          metadata: { context, type: 'general_chat' }
        }
      ]);
    } catch (dbError) {
      console.error('Database save error:', dbError);
    }

    res.json({
      response,
      sessionId,
      messageCount: conversationHistory.length + 1
    });

  } catch (error) {
    console.error('Error in chatbot:', error);
    res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

module.exports = router;