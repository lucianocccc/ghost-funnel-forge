import express from 'express';
import { db } from '../db';
import { chatbotConversations, leads, funnels } from '../schema';

const router = express.Router();

// AI Product Interview endpoint (replaces supabase/functions/ai-product-interview)
router.post('/product-interview', async (req, res) => {
  try {
    const { message, sessionId, userId, conversationHistory } = req.body;
    
    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (!openAIApiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Sistema di prompt intelligente per l'intervista del prodotto
    const systemPrompt = `Sei un AI Product Discovery Specialist esperto. 
    La tua missione è condurre un'intervista approfondita per scoprire tutto sul prodotto/servizio dell'utente.

    OBIETTIVI:
    1. Identificare prodotto, benefici unici, target audience
    2. Capire positioning, competitor, obiettivi business 
    3. Scoprire pain points del target e come il prodotto li risolve
    4. Determinare strategia di conversione ottimale

    STILE DI INTERVISTA:
    - Fai UNA domanda alla volta, specifica e mirata
    - Usa emojis e linguaggio coinvolgente
    - Segui il flusso naturale della conversazione
    - Approfondisci quando necessario
    - Mantieni un tono professionale ma amichevole

    FASI DELL'INTERVISTA:
    1. PRODOTTO: Cosa vendi? A chi? Perché è unico?
    2. TARGET: Chi è il cliente ideale? Quali problemi ha?
    3. MERCATO: Come ti posizioni? Chi sono i competitor?
    4. OBIETTIVI: Cosa vuoi ottenere? Quali metriche contano?
    5. CONVERSIONE: Come preferiresti acquisire lead?

    Dopo 8-12 scambi significativi, concludi l'intervista con un riepilogo.

    IMPORTANTE: 
    - Non fare domande generiche
    - Personalizza in base alle risposte precedenti
    - Scava per trovare il vero valore unico
    - Identifica insights nascosti

    Rispondi sempre in italiano e mantieni il focus sulla scoperta del prodotto.`;

    // Costruisci il contesto della conversazione
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
        max_tokens: 800,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenAI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const response = aiData.choices[0].message.content;

    // Analizza il progresso dell'intervista
    let progress = Math.min((conversationHistory.length / 12) * 100, 95);
    let insights: string[] = [];
    let isComplete = false;
    let productData = null;

    // Controlla se l'intervista è completa
    if (conversationHistory.length >= 10 || response.toLowerCase().includes('riepilogo')) {
      isComplete = true;
      progress = 100;
    }

    // Salva la conversazione nel database
    try {
      await db.insert(chatbotConversations).values([
        {
          userId,
          sessionId,
          messageRole: 'user',
          messageContent: message,
          metadata: { type: 'product_interview', progress, insights }
        },
        {
          userId,
          sessionId,
          messageRole: 'assistant',
          messageContent: response,
          metadata: { type: 'product_interview', progress, isComplete, productData }
        }
      ]);
    } catch (dbError) {
      console.error('Database save error:', dbError);
    }

    res.json({
      response,
      progress,
      insights,
      isComplete,
      productData,
      analysis: { sessionId, messageCount: conversationHistory.length + 1 }
    });

  } catch (error) {
    console.error('Error in AI product interview:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
      details: error.stack
    });
  }
});

// Smart Funnel Generator endpoint
router.post('/generate-funnel', async (req, res) => {
  try {
    const { productData, targetAudience, businessGoals, userId } = req.body;
    
    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (!openAIApiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const systemPrompt = `You are an expert funnel strategist. Create a comprehensive marketing funnel based on the product data and business goals provided.

    Generate a detailed funnel configuration that includes:
    1. Funnel name and description
    2. Target audience segments
    3. Key messaging for each stage
    4. Conversion optimization strategies
    5. Recommended funnel steps and content

    Return the response as a structured JSON object.`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify({ productData, targetAudience, businessGoals }) }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenAI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let funnelConfig;
    
    try {
      funnelConfig = JSON.parse(aiData.choices[0].message.content);
    } catch {
      funnelConfig = { 
        name: "Generated Funnel",
        description: aiData.choices[0].message.content,
        steps: []
      };
    }

    // Save funnel to database
    const [savedFunnel] = await db.insert(funnels).values({
      userId,
      name: funnelConfig.name || "AI Generated Funnel",
      description: funnelConfig.description,
      type: "ai_generated",
      config: funnelConfig,
      status: "draft"
    }).returning();

    res.json({
      success: true,
      funnel: savedFunnel,
      config: funnelConfig
    });

  } catch (error) {
    console.error('Error generating funnel:', error);
    res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

// Creative Content Generator endpoint
router.post('/generate-creative', async (req, res) => {
  try {
    const { context, parameters, contentType } = req.body;
    
    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (!openAIApiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const creativityLevel = Math.round((parameters.linguisticCreativity + parameters.emotionalResonance) / 2);
    
    const prompt = `
You are a direct-response copywriter creating actual consumer-facing copy. Generate READY-TO-USE content that customers will read.

**TARGET CUSTOMER**: ${context.targetAudience}
**PRODUCT**: ${context.productType} in ${context.industry}
**BRAND VOICE**: ${context.brandPersonality}
**MAIN PAIN POINTS**: ${context.painPoints?.join(', ') || 'Not specified'}
**CUSTOMER DESIRES**: ${context.desires?.join(', ') || 'Not specified'}
**COMPETITIVE EDGE**: ${context.competitivePosition}

Content Type: ${contentType}

Generate compelling, conversion-focused copy that speaks directly to the target audience's needs and desires.
    `;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 2000
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenAI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;

    res.json({
      success: true,
      content: {
        raw: content,
        type: contentType,
        creativityScore: creativityLevel
      },
      metadata: {
        timestamp: new Date().toISOString(),
        model: 'gpt-4o-mini'
      }
    });

  } catch (error) {
    console.error('Error in creative generator:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;