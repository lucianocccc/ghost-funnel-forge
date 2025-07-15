
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductData {
  productName: string;
  description: string;
  targetAudience: {
    primary: string;
    industry: string;
  };
  uniqueValue: string;
  keyBenefits: string[];
  priceRange: string;
  businessGoals: string[];
  currentChallenges: string[];
}

interface FunnelRequest {
  productData: ProductData;
  userId: string;
  generateVisuals?: boolean;
  optimizeForConversion?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: FunnelRequest = await req.json();
    const { productData, userId } = requestData;
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key non configurata');
    }

    console.log('🎯 Analisi approfondita del prompt per:', productData.productName);

    // STEP 1: Analizza il prompt dell'utente per comprendere il contesto
    const analysisResult = await analyzeUserPromptAndContext(productData, openAIApiKey);
    
    // STEP 2: Genera il funnel con titoli magnetici specifici basati sull'analisi
    const funnelData = await generateContextualInteractiveFunnel(productData, analysisResult, openAIApiKey);
    
    // STEP 3: Salva nel database
    const savedFunnel = await saveFunnelToDatabase(funnelData, userId);

    return new Response(JSON.stringify({
      success: true,
      funnel: savedFunnel,
      analysis: analysisResult,
      message: `Funnel cinematico "${productData.productName}" creato con titoli magnetici personalizzati`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Errore nella generazione del funnel:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Errore interno del server'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function analyzeUserPromptAndContext(productData: ProductData, apiKey: string) {
  const analysisPrompt = `Analizza attentamente questa richiesta dell'utente per comprendere il contesto e creare titoli magnetici PERTINENTI:

PROMPT UTENTE: "${productData.productName}"
DESCRIZIONE: "${productData.description}"
TARGET: "${productData.targetAudience.primary}"
SETTORE: "${productData.targetAudience.industry}"
VALORE UNICO: "${productData.uniqueValue}"
BENEFICI: ${productData.keyBenefits.join(', ')}
FASCIA PREZZO: "${productData.priceRange}"
OBIETTIVI: ${productData.businessGoals.join(', ')}

ANALIZZA E RISPONDI CON JSON:

{
  "productType": "tipo di prodotto/servizio identificato",
  "industry": "settore specifico",
  "targetEmotion": "emozione principale da toccare",
  "keyPainPoints": ["dolore 1", "dolore 2", "dolore 3"],
  "desiredOutcome": "risultato finale desiderato",
  "urgencyLevel": "alto|medio|basso",
  "magneticHook": "gancio emotivo principale",
  "contextualKeywords": ["parola1", "parola2", "parola3"],
  "competitiveDifferentiator": "elemento che lo distingue",
  "magneticTitle": "titolo magnetico SPECIFICO per questo prodotto",
  "magneticSubtitle": "sottotitolo che spiega il valore"
}

IMPORTANTE: Il titolo deve essere SPECIFICO per il prodotto/servizio analizzato, NON generico!`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'Sei un esperto analista di marketing che comprende i prompt degli utenti e crea titoli magnetici PERTINENTI e SPECIFICI. Non usare mai titoli generici.' 
        },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    }),
  });

  const data = await response.json();
  const analysisResult = JSON.parse(data.choices[0].message.content);
  
  console.log('📊 Analisi del prompt completata:', analysisResult);
  return analysisResult;
}

async function generateContextualInteractiveFunnel(productData: ProductData, analysis: any, apiKey: string) {
  const funnelPrompt = `Crea un funnel interattivo SPECIFICO basato su questa analisi approfondita:

ANALISI DEL PROMPT:
- Prodotto/Servizio: ${analysis.productType}
- Settore: ${analysis.industry}
- Emozione target: ${analysis.targetEmotion}
- Pain Points: ${analysis.keyPainPoints.join(', ')}
- Risultato desiderato: ${analysis.desiredOutcome}
- Gancio magnetico: ${analysis.magneticHook}
- Differenziatore: ${analysis.competitiveDifferentiator}

TITOLO MAGNETICO SPECIFICO: "${analysis.magneticTitle}"
SOTTOTITOLO: "${analysis.magneticSubtitle}"

DATI ORIGINALI:
PRODOTTO: "${productData.productName}"
DESCRIZIONE: "${productData.description}"
TARGET: "${productData.targetAudience.primary}"
SETTORE: "${productData.targetAudience.industry}"
VALORE UNICO: "${productData.uniqueValue}"
BENEFICI: ${productData.keyBenefits.join(', ')}

CREA un funnel con 5-7 STEP SPECIFICI per questo prodotto che includano:

1. STEP DI AGGANCIO EMOTIVO - basato sui pain points identificati
2. STEP DI QUALIFICAZIONE - per identificare il target giusto
3. STEP DI DISCOVERY - per capire le esigenze specifiche
4. STEP DI VALUTAZIONE - per qualificare budget/timing
5. STEP DI COMMITMENT - per ottenere l'impegno
6. STEP DI CONTATTO - per finalizzare

Ogni domanda deve essere SPECIFICA per il prodotto analizzato.

Rispondi SOLO con JSON valido:

{
  "name": "${analysis.magneticTitle}",
  "description": "${analysis.magneticSubtitle}",
  "magneticElements": {
    "primaryHook": "${analysis.magneticHook}",
    "targetEmotion": "${analysis.targetEmotion}",
    "urgencyLevel": "${analysis.urgencyLevel}",
    "competitiveDifferentiator": "${analysis.competitiveDifferentiator}"
  },
  "steps": [
    {
      "title": "Titolo step specifico per ${productData.productName}",
      "description": "Descrizione che tocca i pain points specifici",
      "step_type": "qualification|lead_capture|education|assessment",
      "step_order": 1,
      "is_required": true,
      "fields_config": [
        {
          "id": "field_id",
          "label": "Domanda specifica per ${analysis.productType}",
          "type": "text|email|phone|select|radio|checkbox|textarea",
          "placeholder": "Placeholder pertinente",
          "required": true,
          "options": ["Opzione specifica 1", "Opzione specifica 2"]
        }
      ],
      "settings": {
        "customer_description": "Messaggio personalizzato che spiega perché questa domanda è importante per ${analysis.productType}",
        "next_step_logic": "Logica basata sul tipo di prodotto",
        "qualifying_questions": "Domande specifiche per ${analysis.industry}"
      }
    }
  ],
  "target_audience": "${productData.targetAudience.primary}",
  "industry": "${productData.targetAudience.industry}",
  "product_name": "${productData.productName}"
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'Sei un esperto di funnel marketing che crea funnel SPECIFICI e PERTINENTI basati sull\'analisi del prodotto. Non usare mai template generici.' 
        },
        { role: 'user', content: funnelPrompt }
      ],
      temperature: 0.3,
      max_tokens: 3000
    }),
  });

  const data = await response.json();
  const funnelData = JSON.parse(data.choices[0].message.content);
  
  console.log('✅ Funnel specifico generato:', funnelData.name);
  return funnelData;
}

async function saveFunnelToDatabase(funnelData: any, userId: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl!, supabaseKey!);

  const shareToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  try {
    // Crea il funnel interattivo con elementi magnetici specifici
    const { data: funnelResult, error: funnelError } = await supabase
      .from('interactive_funnels')
      .insert({
        name: funnelData.name,
        description: funnelData.description,
        created_by: userId,
        share_token: shareToken,
        is_public: false,
        status: 'draft',
        views_count: 0,
        submissions_count: 0,
        settings: {
          magneticElements: funnelData.magneticElements || {},
          contextual: true,
          analysisTimestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (funnelError) {
      console.error('Errore nel salvataggio del funnel:', funnelError);
      throw funnelError;
    }

    console.log('✅ Funnel specifico creato con ID:', funnelResult.id);

    // Crea gli step del funnel
    for (const step of funnelData.steps) {
      const { error: stepError } = await supabase
        .from('interactive_funnel_steps')
        .insert({
          funnel_id: funnelResult.id,
          title: step.title,
          description: step.description,
          step_type: step.step_type,
          step_order: step.step_order,
          is_required: step.is_required,
          fields_config: step.fields_config,
          settings: step.settings
        });

      if (stepError) {
        console.error('Errore nella creazione dello step:', stepError);
        throw stepError;
      }
    }

    console.log('✅ Tutti gli step specifici del funnel creati con successo');
    
    return {
      id: funnelResult.id,
      name: funnelData.name,
      description: funnelData.description,
      steps_count: funnelData.steps.length,
      share_token: shareToken,
      magneticElements: funnelData.magneticElements
    };
    
  } catch (dbError) {
    console.error('Errore nel database:', dbError);
    throw dbError;
  }
}
