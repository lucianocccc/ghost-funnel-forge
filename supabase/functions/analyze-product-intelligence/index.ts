
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { responses, userId, analysisType } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key non configurata');
    }

    console.log('🔬 Iniziando analisi intelligente per utente:', userId);

    const analysisPrompt = `Analizza in modo approfondito e intelligente queste risposte di product discovery:

RISPOSTE UTENTE:
${JSON.stringify(responses, null, 2)}

Esegui un'analisi comprensiva che includa:

1. PRODUCT ANALYSIS
- Positioning unico nel mercato
- Differenziatori chiave
- Punti di forza e debolezza
- Opportunità di sviluppo

2. TARGET AUDIENCE INTELLIGENCE
- Profilo demografico e psicografico dettagliato
- Pain points specifici e urgenti
- Motivazioni di acquisto
- Obiezioni probabili
- Processo decisionale
- Trigger emotivi e razionali

3. MARKET INTELLIGENCE
- Dimensione e potenziale del mercato
- Analisi competitiva
- Trend e opportunità
- Posizionamento ottimale
- Strategia di pricing

4. CONVERSION STRATEGY
- Approccio di marketing più efficace
- Messaggi chiave da comunicare
- Canali di distribuzione ideali
- Tattiche di conversione
- Elementi di fiducia necessari

5. CONTENT & VISUAL STRATEGY
- Tono e stile di comunicazione
- Angolo narrativo
- Direzione visiva
- Colori e imagery

Rispondi con JSON strutturato:

{
  "productAnalysis": {
    "category": "Categoria di prodotto",
    "uniquePositioning": "Posizionamento unico identificato",
    "coreValue": "Valore principale",
    "differentiators": ["Differenziatore 1", "Differenziatore 2"],
    "strengths": ["Forza 1", "Forza 2"],
    "opportunities": ["Opportunità 1", "Opportunità 2"],
    "developmentAreas": ["Area 1", "Area 2"]
  },
  "targetAudience": {
    "primary": {
      "description": "Descrizione dettagliata del target primario",
      "demographics": "Dati demografici specifici",
      "psychographics": "Profilo psicografico",
      "painPoints": ["Pain point 1", "Pain point 2", "Pain point 3"],
      "motivations": ["Motivazione 1", "Motivazione 2"],
      "objections": ["Obiezione 1", "Obiezione 2"],
      "decisionProcess": "Come prendono decisioni",
      "emotionalTriggers": ["Trigger 1", "Trigger 2"],
      "rationalFactors": ["Fattore 1", "Fattore 2"]
    },
    "secondary": {
      "description": "Target secondario",
      "potential": "Potenziale di mercato"
    }
  },
  "marketIntelligence": {
    "marketSize": "Dimensione del mercato",
    "growthRate": "Tasso di crescita",
    "competitiveLandscape": {
      "directCompetitors": ["Competitor 1", "Competitor 2"],
      "indirectCompetitors": ["Competitor indiretto 1"],
      "competitiveAdvantage": "Vantaggio competitivo",
      "marketGaps": ["Gap 1", "Gap 2"]
    },
    "trends": {
      "current": ["Trend 1", "Trend 2"],
      "emerging": ["Trend emergente 1"],
      "threats": ["Minaccia 1"],
      "opportunities": ["Opportunità 1", "Opportunità 2"]
    },
    "pricingStrategy": {
      "recommendedRange": "Range di prezzo consigliato",
      "strategy": "Strategia di pricing",
      "justification": "Giustificazione della strategia"
    }
  },
  "conversionStrategy": {
    "primaryApproach": "Approccio principale di conversione",
    "keyMessages": ["Messaggio 1", "Messaggio 2"],
    "channels": ["Canale 1", "Canale 2"],
    "conversionTactics": ["Tattica 1", "Tattica 2"],
    "trustBuilders": ["Elemento fiducia 1", "Elemento fiducia 2"],
    "urgencyFactors": ["Fattore urgenza 1"],
    "socialProofNeeded": ["Tipo proof 1", "Tipo proof 2"],
    "riskMitigators": ["Mitigatore rischio 1"]
  },
  "contentStrategy": {
    "tone": "Tono di comunicazione",
    "style": "Stile di comunicazione",
    "narrativeAngle": "Angolo narrativo principale",
    "keyThemes": ["Tema 1", "Tema 2"],
    "avoidanceTopics": ["Cosa evitare 1"]
  },
  "visualStrategy": {
    "overallStyle": "Stile visivo generale",
    "colorPalette": ["Colore primario", "Colore secondario"],
    "imagery": "Tipo di immagini",
    "emotionalDirection": "Direzione emotiva",
    "designPrinciples": ["Principio 1", "Principio 2"]
  },
  "recommendedActions": [
    "Azione raccomandata 1",
    "Azione raccomandata 2",
    "Azione raccomandata 3"
  ],
  "conversionPotential": 0.85,
  "confidenceScore": 0.92,
  "analysisDate": "${new Date().toISOString()}"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Sei un analista di mercato e strategist di prodotto AI esperto. Fornisci analisi approfondite e actionable. Rispondi SOLO con JSON valido.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.2,
        max_tokens: 3000
      }),
    });

    const data = await response.json();
    let analysisResult;
    
    try {
      const rawContent = data.choices[0].message.content;
      const cleanContent = rawContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      analysisResult = JSON.parse(cleanContent);
      
      console.log('✅ Analisi completata con successo');
      
    } catch (parseError) {
      console.error('Errore nel parsing dell\'analisi:', parseError);
      throw new Error('Errore nella generazione dell\'analisi');
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Errore nell\'analisi del prodotto:', error);
    
    return new Response(JSON.stringify({
      error: error.message || 'Errore interno del server',
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
