
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Sistema prompt separato per maggiore manutenibilità
function getSystemPrompt(): string {
  return `Sei un esperto consulente di marketing digitale con oltre 15 anni di esperienza. Il tuo compito è creare funnel personalizzati che convertono realmente, basandoti su psicologia del consumatore, best practices del settore e analisi comportamentale.

ANALISI EMPATICA: Prima di tutto, comprendi profondamente l'utente e il suo business:
- Identifica le vere sfide e pain points
- Analizza il mercato di riferimento e la concorrenza  
- Considera il customer journey specifico
- Valuta budget e risorse disponibili

STRATEGIA PERSONALIZZATA: Crea un funnel che:
- Rispecchi la personalità del brand
- Si adatti al comportamento del target
- Massimizzi le conversioni per quella specifica industria
- Includa elementi di persuasione psicologica

IMPORTANTE: Rispondi SOLO con un JSON valido seguendo esattamente questa struttura:

{
  "empathic_analysis": {
    "user_challenges": ["sfida1", "sfida2", "sfida3"],
    "market_opportunities": ["opportunità1", "opportunità2"],
    "psychological_triggers": ["trigger1", "trigger2"],
    "competitive_advantages": ["vantaggio1", "vantaggio2"]
  },
  "name": "Nome del Funnel Personalizzato",
  "description": "Descrizione strategica dettagliata del funnel",
  "target_audience": {
    "primary": "Target audience principale",
    "demographics": "Dati demografici specifici",
    "pain_points": ["pain point 1", "pain point 2"],
    "desires": ["desiderio 1", "desiderio 2"]
  },
  "industry": "Settore/industria specifica",
  "personalization_level": "basic|intermediate|advanced",
  "estimated_conversion_rate": "percentuale stimata",
  "customer_facing": {
    "hero_title": "Titolo potente che colpisce emotivamente",
    "hero_subtitle": "Sottotitolo che promette una trasformazione",
    "value_proposition": "Proposta di valore unica e differenziante", 
    "brand_colors": {
      "primary": "#colore-primario-strategico",
      "secondary": "#colore-secondario-complementare", 
      "accent": "#colore-accento-conversione"
    },
    "style_theme": "modern|elegant|playful|professional|minimal|luxury|tech",
    "psychological_approach": "urgency|scarcity|social_proof|authority|reciprocity"
  },
  "steps": [
    {
      "title": "Titolo Step Admin",
      "description": "Descrizione strategica per admin",
      "customer_title": "Titolo irresistibile per il cliente",
      "customer_description": "Descrizione che aumenta il desiderio",
      "customer_motivation": "Messaggio motivazionale potente",
      "psychological_triggers": ["trigger applicati in questo step"],
      "step_type": "lead_capture|form|qualification|education|conversion|follow_up",
      "is_required": true|false,
      "step_order": 1,
      "conversion_goal": "obiettivo specifico di conversione",
      "form_fields": [
        {
          "id": "field_id_semantico",
          "type": "text|email|tel|textarea|select|checkbox|radio|file|date",
          "label": "Etichetta persuasiva",
          "placeholder": "Placeholder che guida l'azione",
          "required": true|false,
          "validation_message": "messaggio di validazione friendly",
          "options": ["opzione strategica 1", "opzione 2"],
          "psychological_bias": "social_proof|scarcity|anchoring"
        }
      ],
      "settings": {
        "showProgressBar": true|false,
        "allowBack": true|false,
        "submitButtonText": "CTA irresistibile e specifica",
        "backgroundColor": "#colore-background-strategico",
        "textColor": "#colore-testo-ottimale",
        "animation_style": "subtle|dynamic|none",
        "trust_signals": ["segnale1", "segnale2"],
        "urgency_elements": ["elemento1", "elemento2"]
      },
      "optimization_notes": "Note per ottimizzazione futura"
    }
  ],
  "strategy": {
    "implementation_approach": "Approccio strategico di implementazione",
    "traffic_sources": ["fonte1", "fonte2", "fonte3"],
    "kpi_tracking": ["kpi1", "kpi2", "kpi3"],
    "ab_testing_suggestions": ["test1", "test2"],
    "follow_up_strategy": "Strategia di follow-up post-conversione"
  },
  "personalization_data": {
    "dynamic_content_areas": ["area1", "area2"],
    "behavioral_triggers": ["trigger1", "trigger2"],
    "segmentation_logic": "Logica di segmentazione utenti"
  }
}

CREA UN FUNNEL CHE:
- Sia psicologicamente persuasivo per il target specifico
- Utilizzi trigger emotivi appropriati per l'industria
- Includa elementi di personalizzazione avanzata
- Sia ottimizzato per massime conversioni
- Rifletta le migliori pratiche del settore specifico
- Consideri il customer journey completo
- Includa strategie di retention e upselling`;
}

// Funzione per creare il funnel nel database
async function createFunnelInDatabase(supabase: any, funnelData: any, userId: string) {
  const shareToken = crypto.randomUUID();

  // Crea il funnel interattivo
  const { data: funnel, error: funnelError } = await supabase
    .from('interactive_funnels')
    .insert({
      created_by: userId,
      name: funnelData.name,
      description: funnelData.description,
      status: 'draft',
      is_public: false,
      share_token: shareToken,
      settings: {
        customer_facing: funnelData.customer_facing,
        target_audience: funnelData.target_audience,
        industry: funnelData.industry,
        strategy: funnelData.strategy
      }
    })
    .select()
    .single();

  if (funnelError) {
    console.error('Error creating funnel:', funnelError);
    throw new Error('Errore nella creazione del funnel');
  }

  // Valori step_type validi
  const validStepTypes = ['lead_capture', 'form', 'qualification', 'education', 'conversion', 'follow_up'];
  
  // Crea gli step del funnel con validazione
  const stepsToInsert = funnelData.steps.map((step: any, index: number) => {
    // Valida step_type
    let stepType = step.step_type;
    if (!validStepTypes.includes(stepType)) {
      console.warn(`Invalid step_type: ${stepType}, defaulting to 'form'`);
      stepType = 'form';
    }
    
    return {
      funnel_id: funnel.id,
      title: step.title,
      description: step.description,
      step_type: stepType,
      step_order: step.step_order || index + 1,
      is_required: step.is_required || false,
      fields_config: step.form_fields || [],
      settings: {
        ...step.settings,
        customer_title: step.customer_title,
        customer_description: step.customer_description,
        customer_motivation: step.customer_motivation
      }
    };
  });

  const { error: stepsError } = await supabase
    .from('interactive_funnel_steps')
    .insert(stepsToInsert);

  if (stepsError) {
    console.error('Error creating funnel steps:', stepsError);
    // Rollback - elimina il funnel
    await supabase.from('interactive_funnels').delete().eq('id', funnel.id);
    throw new Error('Errore nella creazione degli step del funnel');
  }

  return { funnel, funnelData };
}

// Funzione per chiamare OpenAI
async function generateFunnelWithAI(prompt: string): Promise<any> {
  const systemPrompt = getSystemPrompt();
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const generatedContent = data.choices[0].message.content;

  console.log('Generated content:', generatedContent);

  // Parse del JSON
  try {
    return JSON.parse(generatedContent);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    throw new Error('Errore nel parsing della risposta AI');
  }
}

serve(async (req) => {
  console.log('🚀 Edge function started:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    timestamp: new Date().toISOString()
  });

  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📥 Reading request body...');
    const requestText = await req.text();
    console.log('📄 Raw request body:', {
      length: requestText.length,
      preview: requestText.substring(0, 200)
    });

    let parsedBody;
    try {
      parsedBody = JSON.parse(requestText);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { prompt, userId } = parsedBody;
    console.log('✅ Parsed request data:', {
      hasPrompt: !!prompt,
      promptLength: prompt?.length,
      hasUserId: !!userId,
      userId: userId
    });

    if (!prompt || !userId) {
      console.error('❌ Missing required fields:', { hasPrompt: !!prompt, hasUserId: !!userId });
      return new Response(
        JSON.stringify({ error: 'Prompt e userId sono richiesti' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🤖 Starting AI generation process...');

    // Verifica che OpenAI API key sia disponibile
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not found');
      return new Response(
        JSON.stringify({ error: 'Configurazione API non valida' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('✅ OpenAI API key available');

    // Genera il funnel con AI
    console.log('🎯 Calling generateFunnelWithAI...');
    const funnelData = await generateFunnelWithAI(prompt);
    console.log('✅ AI generation completed:', {
      hasData: !!funnelData,
      hasSteps: !!funnelData?.steps,
      stepsCount: funnelData?.steps?.length
    });

    // Crea Supabase client
    console.log('🔧 Setting up Supabase client...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Supabase configuration missing:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      });
      return new Response(
        JSON.stringify({ error: 'Configurazione database non valida' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('✅ Supabase configuration available');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase client created');

    // Crea il funnel nel database
    console.log('💾 Creating funnel in database...');
    const { funnel } = await createFunnelInDatabase(supabase, funnelData, userId);
    console.log('✅ Successfully created interactive funnel:', {
      funnelId: funnel.id,
      funnelName: funnel.name,
      shareToken: funnel.share_token
    });

    const response = {
      success: true,
      funnel: {
        id: funnel.id,
        name: funnel.name,
        description: funnel.description,
        share_token: funnel.share_token,
        steps: funnelData.steps,
        settings: funnel.settings
      }
    };

    console.log('📤 Sending successful response:', {
      success: response.success,
      funnelId: response.funnel.id,
      responseSize: JSON.stringify(response).length
    });

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Error in generate-interactive-funnel-ai:', {
      error,
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    // Gestione errori più specifica
    let errorMessage = 'Errore interno del server';
    let statusCode = 500;

    if (error.message.includes('OpenAI API')) {
      errorMessage = 'Errore nel servizio di AI. Riprova tra qualche minuto.';
      statusCode = 503;
    } else if (error.message.includes('parsing')) {
      errorMessage = 'Errore nella generazione del funnel. Riprova con una descrizione più dettagliata.';
      statusCode = 422;
    } else if (error.message.includes('creazione')) {
      errorMessage = 'Errore nel salvataggio del funnel. Riprova.';
      statusCode = 500;
    }

    const errorResponse = { 
      error: errorMessage,
      details: error.message,
      timestamp: new Date().toISOString()
    };

    console.log('📤 Sending error response:', errorResponse);

    return new Response(
      JSON.stringify(errorResponse),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
