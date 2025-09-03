import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import aiFunnelRoutes from './routes/ai-funnel-routes';

// Load environment variables from the root .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// AI Funnel Routes
app.use('/api/ai-funnels', aiFunnelRoutes);

// Legacy simple AI funnel endpoint (deprecated - use /api/ai-funnels for advanced features)
app.post('/api/ai/generate-funnel', async (req, res) => {
  res.status(301).json({ 
    message: 'This endpoint has been upgraded. Please use /api/ai-funnels/generate for advanced multi-AI funnel generation.',
    new_endpoint: '/api/ai-funnels/generate'
  });
});

// Creative Content Generation endpoint
app.post('/api/ai/generate-creative', async (req, res) => {
  try {
    const { context, parameters, contentType } = req.body;
    
    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (!openAIApiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    let specificPrompt = '';
    
    switch (contentType) {
      case 'headline':
        specificPrompt = `Crea 5 headline persuasive per il seguente contesto business:
        
Target: ${context.targetAudience || 'Non specificato'}
Prodotto: ${context.productType || 'Non specificato'} 
Settore: ${context.industry || 'Non specificato'}
Pain Points: ${context.painPoints?.join(', ') || 'Non specificati'}
Personalità Brand: ${context.brandPersonality || 'Professionale'}

Crea headlines che:
- Parlino direttamente ai pain points
- Usino il linguaggio del target
- Creino urgenza o curiosità
- Siano specifiche e concrete
- Includano benefici chiari

Format: una headline per riga, numerate 1-5.`;
        break;
        
      case 'description':
        specificPrompt = `Scrivi una descrizione persuasiva (200-300 parole) per:

Target: ${context.targetAudience || 'Professionisti'}
Prodotto: ${context.productType || 'Servizio'}
Settore: ${context.industry || 'Business'}
Pain Points: ${context.painPoints?.join(', ') || 'Inefficienza, perdita tempo'}
Desideri: ${context.desires?.join(', ') || 'Successo, crescita'}

Struttura la descrizione con:
1. Hook iniziale che colpisce un pain point
2. Presentazione della soluzione
3. 3-4 benefici specifici
4. Prova sociale o credibilità
5. Call-to-action naturale

Usa un tono ${context.brandPersonality || 'professionale ma accessibile'}.`;
        break;
        
      case 'cta':
        specificPrompt = `Crea 5 call-to-action efficaci per:

Contesto: ${context.productType || 'Servizio professionale'}
Target: ${context.targetAudience || 'Professionisti'}
Fase del funnel: ${context.funnelStage || 'Conversione'}

Le CTA devono:
- Essere specifiche, non generiche
- Ridurre l'attrito psicologico
- Creare senso di urgenza o valore
- Essere orientate al beneficio
- Massimo 4 parole ciascuna

Format: una CTA per riga, numerate 1-5.`;
        break;
        
      default:
        specificPrompt = `Crea contenuto marketing persuasivo per il tipo "${contentType}" basandoti su questo contesto: ${JSON.stringify(context)}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: specificPrompt }],
        temperature: 0.8,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI error: ${response.status}`);
    }

    const aiData = await response.json();
    const rawContent = aiData.choices[0].message.content;

    // Parse content based on type
    let parsedContent = {
      headlines: [] as string[],
      descriptions: [] as string[],
      ctaTexts: [] as string[],
      narrativeElements: [] as string[],
      visualPrompts: [] as string[],
      emotionalHooks: [] as string[],
      persuasionFrameworks: [] as string[]
    };

    if (contentType === 'headline') {
      const lines = rawContent.split('\n').filter(line => line.match(/^\d+\./));
      parsedContent.headlines = lines.map(line => line.replace(/^\d+\.\s*/, '').trim());
    } else if (contentType === 'cta') {
      const lines = rawContent.split('\n').filter(line => line.match(/^\d+\./));
      parsedContent.ctaTexts = lines.map(line => line.replace(/^\d+\.\s*/, '').trim());
    } else {
      parsedContent.descriptions = [rawContent];
      parsedContent.narrativeElements = rawContent.split('\n').filter(line => line.length > 20).slice(0, 3);
    }

    res.json({
      success: true,
      content: {
        raw: rawContent,
        ...parsedContent
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