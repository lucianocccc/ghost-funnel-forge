
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
  console.log('🎯 Funzione generate-cinematic-product-funnel avviata');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: FunnelRequest = await req.json();
    console.log('📥 Dati ricevuti:', JSON.stringify(requestData, null, 2));
    
    const { productData, userId } = requestData;
    
    if (!productData || !userId) {
      console.error('❌ Dati mancanti:', { productData: !!productData, userId: !!userId });
      return new Response(JSON.stringify({
        success: false,
        error: 'ProductData e userId sono richiesti'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key mancante');
      return new Response(JSON.stringify({
        success: false,
        error: 'OpenAI API key non configurata'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🎯 Analisi approfondita del prompt per:', productData.productName);

    // STEP 1: Analizza il prompt dell'utente per comprendere il contesto
    const analysisResult = await analyzeUserPromptAndContext(productData, openAIApiKey);
    console.log('📊 Risultato analisi:', analysisResult);
    
    // STEP 2: Genera il funnel con titoli magnetici specifici basati sull'analisi
    const funnelData = await generateContextualInteractiveFunnel(productData, analysisResult, openAIApiKey);
    console.log('✅ Dati funnel generati:', funnelData.name);
    
    // STEP 3: Salva nel database
    const savedFunnel = await saveFunnelToDatabase(funnelData, userId);
    console.log('💾 Funnel salvato con successo:', savedFunnel.id);

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
    console.error('Stack trace:', error.stack);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Errore interno del server',
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function analyzeUserPromptAndContext(productData: ProductData, apiKey: string) {
  console.log('🔍 Avvio analisi prompt...');
  
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

  try {
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

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('🤖 Risposta OpenAI per analisi ricevuta');
    
    let analysisResult;
    try {
      const content = data.choices[0].message.content;
      // Pulisci il contenuto JSON
      let cleanContent = content.trim();
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
      }
      
      analysisResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ Errore parsing analisi:', parseError);
      // Fallback con analisi base
      analysisResult = {
        productType: productData.productName,
        industry: productData.targetAudience.industry || 'generale',
        targetEmotion: 'speranza',
        keyPainPoints: ['difficoltà operative', 'perdita di tempo', 'costi elevati'],
        desiredOutcome: 'miglioramento delle performance',
        urgencyLevel: 'medio',
        magneticHook: `Scopri come ${productData.productName} può trasformare il tuo business`,
        contextualKeywords: ['innovativo', 'efficace', 'risultati'],
        competitiveDifferentiator: productData.uniqueValue || 'soluzione unica',
        magneticTitle: `🚀 Trasforma il Tuo Business con ${productData.productName}`,
        magneticSubtitle: `Scopri come ottenere risultati straordinari con la nostra soluzione innovativa`
      };
    }
    
    console.log('📊 Analisi del prompt completata:', analysisResult.magneticTitle);
    return analysisResult;
    
  } catch (error) {
    console.error('❌ Errore nella chiamata OpenAI per analisi:', error);
    throw error;
  }
}

async function generateContextualInteractiveFunnel(productData: ProductData, analysis: any, apiKey: string) {
  console.log('🏗️ Avvio generazione funnel contestuale...');
  
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

CREA un funnel con 3-4 STEP SPECIFICI per questo prodotto che includano:

1. STEP DI AGGANCIO EMOTIVO - basato sui pain points identificati
2. STEP DI QUALIFICAZIONE - per identificare il target giusto
3. STEP DI CONTATTO - per finalizzare

Ogni domanda deve essere SPECIFICA per il prodotto analizzato.

Rispondi SOLO con JSON valido:

{
  "name": "${analysis.magneticTitle}",
  "description": "${analysis.magneticSubtitle}",
  "magneticElements": {
    "primaryHook": "${analysis.magneticHook}",
    "targetEmotion": "${analysis.targetEmotion}",
    "urgencyLevel": "${analysis.urgencyLevel}",
    "competitiveDifferentiator": "${analysis.competitiveDifferentiator}",
    "valueProposition": "${analysis.magneticSubtitle}"
  },
  "steps": [
    {
      "title": "Benvenuto! Scopri la soluzione perfetta",
      "description": "Ti guidiamo verso il risultato che stai cercando",
      "step_type": "info",
      "step_order": 1,
      "is_required": true,
      "fields_config": [],
      "settings": {
        "customer_description": "Iniziamo questo percorso insieme",
        "content": "<h2>${analysis.magneticTitle}</h2><p>${analysis.magneticSubtitle}</p>"
      }
    },
    {
      "title": "Parliamo delle tue esigenze",
      "description": "Aiutaci a capire meglio la tua situazione",
      "step_type": "form",
      "step_order": 2,
      "is_required": true,
      "fields_config": [
        {
          "id": "nome",
          "label": "Il tuo nome",
          "type": "text",
          "placeholder": "Come ti chiami?",
          "required": true
        },
        {
          "id": "email",
          "label": "Email",
          "type": "email",
          "placeholder": "La tua email",
          "required": true
        },
        {
          "id": "esigenza_principale",
          "label": "Qual è la tua esigenza principale?",
          "type": "textarea",
          "placeholder": "Descrivi brevemente cosa stai cercando...",
          "required": true
        }
      ],
      "settings": {
        "customer_description": "Queste informazioni ci aiutano a personalizzare la nostra proposta"
      }
    },
    {
      "title": "Perfetto! Sei qualificato",
      "description": "Il nostro team ti contatterà presto",
      "step_type": "contact",
      "step_order": 3,
      "is_required": true,
      "fields_config": [
        {
          "id": "telefono",
          "label": "Numero di telefono",
          "type": "tel",
          "placeholder": "Il tuo numero di telefono",
          "required": false
        }
      ],
      "settings": {
        "customer_description": "Ti contatteremo entro 24 ore per discutere della soluzione perfetta per te"
      }
    }
  ],
  "target_audience": "${productData.targetAudience.primary}",
  "industry": "${productData.targetAudience.industry}",
  "product_name": "${productData.productName}"
}`;

  try {
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
        max_tokens: 2500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('🤖 Risposta OpenAI per funnel ricevuta');
    
    let funnelData;
    try {
      const content = data.choices[0].message.content;
      // Pulisci il contenuto JSON
      let cleanContent = content.trim();
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
      }
      
      funnelData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ Errore parsing funnel:', parseError);
      // Fallback con funnel base
      funnelData = {
        name: analysis.magneticTitle,
        description: analysis.magneticSubtitle,
        magneticElements: {
          primaryHook: analysis.magneticHook,
          targetEmotion: analysis.targetEmotion,
          urgencyLevel: analysis.urgencyLevel,
          competitiveDifferentiator: analysis.competitiveDifferentiator,
          valueProposition: analysis.magneticSubtitle
        },
        steps: [
          {
            title: "Benvenuto! Scopri la soluzione perfetta",
            description: "Ti guidiamo verso il risultato che stai cercando",
            step_type: "info",
            step_order: 1,
            is_required: true,
            fields_config: [],
            settings: {
              customer_description: "Iniziamo questo percorso insieme",
              content: `<h2>${analysis.magneticTitle}</h2><p>${analysis.magneticSubtitle}</p>`
            }
          },
          {
            title: "Parliamo delle tue esigenze",
            description: "Aiutaci a capire meglio la tua situazione",
            step_type: "form",
            step_order: 2,
            is_required: true,
            fields_config: [
              {
                id: "nome",
                label: "Il tuo nome",
                type: "text",
                placeholder: "Come ti chiami?",
                required: true
              },
              {
                id: "email",
                label: "Email",
                type: "email",
                placeholder: "La tua email",
                required: true
              }
            ],
            settings: {
              customer_description: "Queste informazioni ci aiutano a personalizzare la nostra proposta"
            }
          }
        ],
        target_audience: productData.targetAudience.primary,
        industry: productData.targetAudience.industry,
        product_name: productData.productName
      };
    }
    
    console.log('✅ Funnel specifico generato:', funnelData.name);
    return funnelData;
    
  } catch (error) {
    console.error('❌ Errore nella chiamata OpenAI per funnel:', error);
    throw error;
  }
}

async function saveFunnelToDatabase(funnelData: any, userId: string) {
  console.log('💾 Avvio salvataggio nel database...');
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Configurazione Supabase mancante');
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);

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
        status: 'active',
        views_count: 0,
        submissions_count: 0,
        settings: {
          magneticElements: funnelData.magneticElements || {},
          contextual: true,
          analysisTimestamp: new Date().toISOString(),
          target_audience: funnelData.target_audience,
          industry: funnelData.industry,
          product_name: funnelData.product_name
        }
      })
      .select()
      .single();

    if (funnelError) {
      console.error('❌ Errore nel salvataggio del funnel:', funnelError);
      throw new Error(`Errore database: ${funnelError.message}`);
    }

    console.log('✅ Funnel specifico creato con ID:', funnelResult.id);

    // Crea gli step del funnel
    if (funnelData.steps && Array.isArray(funnelData.steps)) {
      for (let i = 0; i < funnelData.steps.length; i++) {
        const step = funnelData.steps[i];
        const { error: stepError } = await supabase
          .from('interactive_funnel_steps')
          .insert({
            funnel_id: funnelResult.id,
            title: step.title,
            description: step.description,
            step_type: step.step_type,
            step_order: step.step_order || (i + 1),
            is_required: step.is_required !== false,
            fields_config: step.fields_config || [],
            settings: step.settings || {}
          });

        if (stepError) {
          console.error(`❌ Errore nella creazione dello step ${i + 1}:`, stepError);
          throw new Error(`Errore step database: ${stepError.message}`);
        }
      }
    }

    console.log('✅ Tutti gli step specifici del funnel creati con successo');
    
    return {
      id: funnelResult.id,
      name: funnelData.name,
      description: funnelData.description,
      steps_count: funnelData.steps?.length || 0,
      share_token: shareToken,
      magneticElements: funnelData.magneticElements,
      settings: funnelResult.settings
    };
    
  } catch (dbError) {
    console.error('❌ Errore nel database:', dbError);
    throw new Error(`Database error: ${dbError.message}`);
  }
}
