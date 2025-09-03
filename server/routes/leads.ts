import express from 'express';
import { db } from '../db';
import { leads, funnels } from '../schema';
import { eq, desc } from 'drizzle-orm';

const router = express.Router();

// Get all leads for user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userLeads = await db.select()
      .from(leads)
      .where(eq(leads.userId, userId))
      .orderBy(desc(leads.createdAt));

    res.json({ leads: userLeads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Create new lead
router.post('/', async (req, res) => {
  try {
    const { userId, funnelId, email, name, phone, company, source, customFields } = req.body;
    
    const [newLead] = await db.insert(leads).values({
      userId,
      funnelId,
      email,
      name,
      phone,
      company,
      source,
      customFields,
      status: 'new',
      score: 0
    }).returning();

    res.json({ lead: newLead });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Update lead
router.put('/:leadId', async (req, res) => {
  try {
    const { leadId } = req.params;
    const updates = req.body;
    
    const [updatedLead] = await db.update(leads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(leads.id, leadId))
      .returning();

    res.json({ lead: updatedLead });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Get leads for specific funnel
router.get('/funnel/:funnelId', async (req, res) => {
  try {
    const { funnelId } = req.params;
    
    const funnelLeads = await db.select()
      .from(leads)
      .where(eq(leads.funnelId, funnelId))
      .orderBy(desc(leads.createdAt));

    res.json({ leads: funnelLeads });
  } catch (error) {
    console.error('Error fetching funnel leads:', error);
    res.status(500).json({ error: 'Failed to fetch funnel leads' });
  }
});

// AI Lead Analysis
router.post('/:leadId/analyze', async (req, res) => {
  try {
    const { leadId } = req.params;
    
    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (!openAIApiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const [lead] = await db.select()
      .from(leads)
      .where(eq(leads.id, leadId));

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const analysisPrompt = `Analyze this lead and provide insights:
    
    Lead Data:
    - Name: ${lead.name || 'Unknown'}
    - Email: ${lead.email || 'Unknown'}
    - Company: ${lead.company || 'Unknown'}
    - Source: ${lead.source || 'Unknown'}
    - Custom Fields: ${JSON.stringify(lead.customFields)}
    
    Provide a JSON response with:
    {
      "score": number (1-100),
      "insights": ["insight1", "insight2"],
      "recommendedActions": ["action1", "action2"],
      "priority": "high/medium/low"
    }`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: analysisPrompt }],
        temperature: 0.3,
        max_tokens: 500
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenAI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let analysis;
    
    try {
      analysis = JSON.parse(aiData.choices[0].message.content);
    } catch {
      analysis = {
        score: 50,
        insights: ['Analysis completed'],
        recommendedActions: ['Follow up with lead'],
        priority: 'medium'
      };
    }

    // Update lead with analysis
    const [updatedLead] = await db.update(leads)
      .set({
        score: analysis.score,
        lastActivity: new Date(),
        updatedAt: new Date()
      })
      .where(eq(leads.id, leadId))
      .returning();

    res.json({
      lead: updatedLead,
      analysis
    });

  } catch (error) {
    console.error('Error analyzing lead:', error);
    res.status(500).json({ error: 'Failed to analyze lead' });
  }
});

export default router;