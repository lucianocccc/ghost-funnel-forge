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

// Enhanced AI Funnel Generation endpoint
app.post('/api/ai/generate-funnel', async (req, res) => {
  try {
    const { productData, targetAudience, businessGoals, userId, prompt } = req.body;
    
    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (!openAIApiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Create comprehensive prompt for funnel generation
    const systemPrompt = `Sei un esperto di marketing digitale e copywriting persuasivo. Crea un funnel marketing completo e personalizzato.

ANALIZZA I DATI FORNITI E CREA:
1. Nome accattivante per il funnel
2. Descrizione dettagliata della strategia
3. 4-6 step specifici con copy reale
4. Headlines persuasive per ogni step
5. Call-to-action ottimizzati
6. Obiezioni comuni e come superarle
7. Elementi di social proof da includere
8. Configurazione tecnica per ogni step

DATI DEL BUSINESS:
${JSON.stringify({ productData, targetAudience, businessGoals, prompt })}

CREA UN FUNNEL STRUTTURATO COSÌ:
{
  "name": "Nome del Funnel Specifico",
  "description": "Descrizione strategica dettagliata",
  "strategy": {
    "approach": "Approccio strategico scelto",
    "psychology": "Psicologia applicata",
    "target_pain_points": ["Pain point 1", "Pain point 2"],
    "value_proposition": "Proposta di valore unica"
  },
  "steps": [
    {
      "step_order": 1,
      "step_type": "landing_page",
      "title": "Titolo Step Specifico",
      "description": "Descrizione strategica dello step",
      "copy": {
        "headline": "Headline persuasiva specifica",
        "subheadline": "Sottotitolo di supporto",
        "body_text": "Testo del corpo dettagliato e persuasivo",
        "cta_text": "Call-to-action specifica",
        "objections": ["Obiezione 1", "Risposta 1"],
        "benefits": ["Beneficio specifico 1", "Beneficio specifico 2"]
      },
      "visual_elements": {
        "hero_image": "Descrizione immagine hero",
        "color_scheme": "Schema colori appropriato",
        "layout_style": "Stile layout ottimale"
      },
      "fields_config": {
        "fields": [/* configurazione campi se necessario */]
      },
      "conversion_optimization": {
        "urgency_element": "Elemento di urgenza",
        "social_proof": "Prova sociale da includere",
        "risk_reversal": "Garanzia o riduzione rischio"
      }
    }
  ],
  "conversion_sequence": {
    "email_sequence": ["Email 1 subject", "Email 2 subject"],
    "follow_up_strategy": "Strategia di follow-up",
    "upsell_opportunities": ["Upsell 1", "Upsell 2"]
  },
  "metrics": {
    "expected_conversion_rate": "X%",
    "key_kpis": ["KPI 1", "KPI 2"],
    "optimization_points": ["Area di ottimizzazione 1"]
  }
}

IMPORTANTE: Crea contenuti specifici e reali, non generici. Usa il tono appropriato per il target e includi copy persuasivo che converte davvero.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.8,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI error: ${response.status}`);
    }

    const aiData = await response.json();
    let funnelConfig;
    
    try {
      const content = aiData.choices[0].message.content;
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        funnelConfig = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback if JSON parsing fails
      const content = aiData.choices[0].message.content;
      funnelConfig = {
        name: "Funnel Personalizzato AI",
        description: content,
        strategy: {
          approach: "Basato sui dati forniti",
          psychology: "Persuasione diretta",
          target_pain_points: [targetAudience || "Target non specificato"],
          value_proposition: "Soluzione su misura"
        },
        steps: [
          {
            step_order: 1,
            step_type: "landing_page",
            title: "Homepage Persuasiva",
            description: "Landing page principale ottimizzata per la conversione",
            copy: {
              headline: content.split('\n')[0] || "Trasforma il Tuo Business Oggi",
              subheadline: "La soluzione che stavi cercando per raggiungere i tuoi obiettivi",
              body_text: content,
              cta_text: "Inizia Ora",
              benefits: ["Risultati garantiti", "Supporto completo", "ROI comprovato"]
            },
            visual_elements: {
              hero_image: "Immagine professionale del prodotto/servizio",
              color_scheme: "Blu professionale e arancione per CTA",
              layout_style: "Pulito e moderno"
            },
            conversion_optimization: {
              urgency_element: "Offerta limitata nel tempo",
              social_proof: "Testimonianze clienti",
              risk_reversal: "Garanzia soddisfatti o rimborsati"
            }
          },
          {
            step_order: 2,
            step_type: "lead_capture",
            title: "Cattura Lead Qualificati",
            description: "Form ottimizzato per acquisire lead di qualità",
            copy: {
              headline: "Ottieni la Tua Consulenza Gratuita",
              subheadline: "Compila il form per ricevere un'analisi personalizzata",
              cta_text: "Richiedi Consulenza",
              benefits: ["Analisi gratuita", "Strategia personalizzata", "Supporto dedicato"]
            },
            fields_config: {
              fields: [
                { name: "name", type: "text", label: "Nome", required: true },
                { name: "email", type: "email", label: "Email", required: true },
                { name: "phone", type: "tel", label: "Telefono", required: false },
                { name: "company", type: "text", label: "Azienda", required: false }
              ]
            }
          }
        ],
        conversion_sequence: {
          email_sequence: ["Benvenuto e prima risorsa", "Caso studio di successo", "Offerta speciale"],
          follow_up_strategy: "Sequenza email automatizzata + chiamata personale",
          upsell_opportunities: ["Servizio premium", "Consulenza avanzata"]
        },
        metrics: {
          expected_conversion_rate: "12-18%",
          key_kpis: ["Tasso di conversione", "Costo per lead", "LTV cliente"],
          optimization_points: ["A/B test headline", "Ottimizzazione form", "Miglioramento copy"]
        }
      };
    }

    res.json({
      success: true,
      funnel: funnelConfig,
      generated_at: new Date().toISOString(),
      ai_model: 'gpt-4',
      personalization_level: 'high'
    });

  } catch (error) {
    console.error('Error generating funnel:', error);
    res.status(500).json({ error: error.message });
  }
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
      headlines: [],
      descriptions: [],
      ctaTexts: [],
      narrativeElements: [],
      visualPrompts: [],
      emotionalHooks: [],
      persuasionFrameworks: []
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