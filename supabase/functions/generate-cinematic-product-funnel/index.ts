
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

    console.log('🎯 Generazione funnel interattivo complesso per:', productData.productName);

    // Genera il funnel con step complessi e raccolta dati
    const funnelData = await generateComplexInteractiveFunnel(productData, openAIApiKey);
    
    // Salva nel database come funnel interattivo
    const savedFunnel = await saveFunnelToDatabase(funnelData, userId);

    return new Response(JSON.stringify({
      success: true,
      funnel: savedFunnel,
      message: `Funnel interattivo "${productData.productName}" creato con successo`
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

async function generateComplexInteractiveFunnel(productData: ProductData, apiKey: string) {
  const funnelPrompt = `Crea un funnel interattivo COMPLESSO e ARTICOLATO per la raccolta dati e qualificazione lead per questo prodotto:

PRODOTTO: "${productData.productName}"
DESCRIZIONE: "${productData.description}"
TARGET: "${productData.targetAudience.primary}"
SETTORE: "${productData.targetAudience.industry}"
VALORE UNICO: "${productData.uniqueValue}"
BENEFICI: ${productData.keyBenefits.join(', ')}
FASCIA PREZZO: "${productData.priceRange}"
OBIETTIVI: ${productData.businessGoals.join(', ')}
SFIDE: ${productData.currentChallenges.join(', ')}

CREA un funnel con ALMENO 5-7 STEP ARTICOLATI che includano:

1. STEP DI QUALIFICAZIONE INIZIALE - per filtrare i prospect
2. STEP DI DISCOVERY DELLE ESIGENZE - per capire le necessità specifiche
3. STEP DI RACCOLTA DATI AZIENDALI - per profilar l'azienda
4. STEP DI ASSESSMENT DEI PROBLEMI - per identificare pain point
5. STEP DI VALUTAZIONE BUDGET - per qualificare la disponibilità economica
6. STEP DI TIMING E URGENZA - per capire i tempi di decisione
7. STEP FINALE DI CONTATTO - per completare la qualificazione

Ogni step deve avere:
- Domande specifiche e intelligenti
- Campi di raccolta dati mirati
- Logica condizionale basata sulle risposte
- Messaggi personalizzati per il settore

Rispondi SOLO con JSON valido:

{
  "name": "Funnel Qualificazione: ${productData.productName}",
  "description": "Funnel di qualificazione e raccolta dati per ${productData.productName} - Target: ${productData.targetAudience.primary}",
  "steps": [
    {
      "title": "Titolo step specifico per ${productData.productName}",
      "description": "Descrizione che spiega il valore dello step",
      "step_type": "qualification|lead_capture|education|assessment",
      "step_order": 1,
      "is_required": true,
      "fields_config": [
        {
          "id": "field_id",
          "label": "Domanda specifica e intelligente",
          "type": "text|email|phone|select|radio|checkbox|textarea",
          "placeholder": "Placeholder specifico",
          "required": true,
          "options": ["Opzione 1", "Opzione 2"] // solo per select/radio
        }
      ],
      "settings": {
        "customer_description": "Messaggio personalizzato per il cliente che spiega perché questo step è importante",
        "next_step_logic": "Logica per determinare il prossimo step",
        "qualifying_questions": "Domande che aiutano a qualificare il lead"
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
          content: 'Sei un esperto di funnel marketing e lead generation. Crei funnel COMPLESSI e ARTICOLATI per la raccolta e qualificazione di lead B2B. Rispondi SOLO con JSON valido.' 
        },
        { role: 'user', content: funnelPrompt }
      ],
      temperature: 0.3,
      max_tokens: 3000
    }),
  });

  const data = await response.json();
  const funnelData = JSON.parse(data.choices[0].message.content);
  
  return funnelData;
}

async function saveFunnelToDatabase(funnelData: any, userId: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl!, supabaseKey!);

  const shareToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  try {
    // Crea il funnel interattivo
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
        submissions_count: 0
      })
      .select()
      .single();

    if (funnelError) {
      console.error('Errore nel salvataggio del funnel:', funnelError);
      throw funnelError;
    }

    console.log('✅ Funnel creato con ID:', funnelResult.id);

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

    console.log('✅ Tutti gli step del funnel creati con successo');
    
    return {
      id: funnelResult.id,
      name: funnelData.name,
      description: funnelData.description,
      steps_count: funnelData.steps.length,
      share_token: shareToken
    };
    
  } catch (dbError) {
    console.error('Errore nel database:', dbError);
    throw dbError;
  }
}
