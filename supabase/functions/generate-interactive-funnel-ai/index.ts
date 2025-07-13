
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Sistema prompt per generare dati AdvancedDynamicFunnel
function getSystemPrompt(): string {
  return `Sei un esperto consulente di marketing digitale con 15+ anni di esperienza. Il tuo compito è creare funnel personalizzati per il componente AdvancedDynamicFunnel che convertono realmente.

ANALISI EMPATICA: Comprendi profondamente l'utente e il suo business:
- Identifica vere sfide e pain points
- Analizza mercato e concorrenza  
- Considera customer journey specifico
- Valuta budget e risorse disponibili

STRATEGIA PERSONALIZZATA: Crea contenuto che:
- Rispecchi personalità del brand
- Si adatti al comportamento del target
- Massimizzi conversioni per quella industria
- Includa elementi di persuasione psicologica

IMPORTANTE: Rispondi SOLO con un JSON valido per AdvancedDynamicFunnel:

{
  "name": "Nome Funnel Personalizzato",
  "description": "Descrizione strategica dettagliata",
  "target_audience": {
    "primary": "Target principale",
    "demographics": "Dati demografici",
    "pain_points": ["pain point 1", "pain point 2"],
    "desires": ["desiderio 1", "desiderio 2"]
  },
  "industry": "Settore specifico",
  "customer_facing": {
    "hero_title": "Titolo emotivamente potente",
    "hero_subtitle": "Sottotitolo che promette trasformazione",
    "value_proposition": "Proposta di valore unica",
    "brand_colors": {
      "primary": "#colore-primario",
      "secondary": "#colore-secondario", 
      "accent": "#colore-accento"
    },
    "style_theme": "modern|elegant|playful|professional|minimal|luxury|tech",
    "psychological_approach": "urgency|scarcity|social_proof|authority|reciprocity"
  },
  "advanced_funnel_data": {
    "heroSection": {
      "headline": "Titolo principale irresistibile",
      "subheadline": "Sottotitolo che aumenta il desiderio",
      "animation": "fade-in-up|bounce|pulse|slide-in",
      "backgroundGradient": "linear-gradient(135deg, color1, color2)",
      "ctaText": "CTA persuasiva specifica",
      "ctaStyle": "primary|gradient|glow",
      "urgencyText": "Messaggio di urgenza se appropriato"
    },
    "visualTheme": {
      "primaryColor": "#colore-primario-hsl",
      "secondaryColor": "#colore-secondario-hsl",
      "accentColor": "#colore-accento-hsl",
      "backgroundColor": "#background-hsl",
      "textColor": "#text-hsl",
      "fontPrimary": "Inter|Poppins|Roboto|OpenSans",
      "fontSecondary": "font secondario",
      "borderRadius": "8px|12px|16px",
      "spacing": "compact|normal|spacious"
    },
    "productBenefits": [
      {
        "title": "Beneficio persuasivo",
        "description": "Descrizione che risolve pain point specifico",
        "icon": "icona-lucide-appropriata",
        "animation": "fade-in|slide-up|bounce",
        "highlight": true|false,
        "statistic": "Statistica convincente se disponibile"
      }
    ],
    "socialProof": {
      "testimonials": [
        {
          "name": "Nome credibile",
          "text": "Testimonianza autentica e specifica",
          "rating": 5,
          "role": "Ruolo professionale",
          "verified": true,
          "image": "URL immagine se disponibile"
        }
      ],
      "trustIndicators": ["indicatore1", "indicatore2"],
      "statistics": [
        {
          "number": "numero impressionante",
          "label": "etichetta statistica",
          "icon": "icona-lucide"
        }
      ]
    },
    "interactiveDemo": {
      "type": "calculator|quiz|preview|simulation",
      "title": "Titolo demo interattiva",
      "description": "Descrizione coinvolgente",
      "content": "contenuto specifico per il tipo di demo"
    },
    "conversionForm": {
      "title": "Titolo form persuasivo",
      "description": "Descrizione che riduce friction",
      "steps": [
        {
          "title": "Titolo step",
          "fields": [
            {
              "name": "campo_semantico",
              "label": "Etichetta persuasiva",
              "type": "text|email|tel|textarea|select",
              "placeholder": "Placeholder guida",
              "required": true|false,
              "options": ["opzione1", "opzione2"],
              "validation": "messaggio validazione friendly"
            }
          ]
        }
      ],
      "submitText": "CTA finale irresistibile",
      "incentive": "Incentivo finale convincente",
      "progressBar": true,
      "socialProofInline": "Prova sociale inline"
    },
    "advancedFeatures": {
      "personalization": {
        "enabled": true,
        "triggers": ["trigger1", "trigger2"],
        "messages": ["messaggio1", "messaggio2"]
      },
      "urgencyMechanics": {
        "type": "countdown|limited_spots|seasonal",
        "message": "Messaggio urgenza",
        "expiresIn": "24h|48h|72h"
      },
      "exitIntent": {
        "enabled": true,
        "offer": "Offerta exit intent",
        "discount": "percentuale sconto"
      }
    },
    "animations": {
      "entrance": "fade-in-up|bounce|slide-in",
      "scroll": "parallax|reveal|sticky",
      "interactions": "hover-scale|glow|shake",
      "transitions": "smooth|instant|bouncy"
    }
  },
  "steps": [
    {
      "title": "Step Database Title",
      "description": "Descrizione admin",
      "customer_title": "Titolo cliente",
      "customer_description": "Descrizione cliente",
      "step_type": "lead_capture",
      "step_order": 1,
      "form_fields": [],
      "settings": {
        "submitButtonText": "CTA step",
        "showProgressBar": true
      }
    }
  ]
}

GENERA CONTENUTO CHE:
- Sia psicologicamente persuasivo per il target
- Utilizzi trigger emotivi appropriati
- Includa elementi di personalizzazione
- Sia ottimizzato per conversioni massime
- Rifletta best practices del settore`;
}

// Funzione per creare il funnel nel database
async function createFunnelInDatabase(supabase: any, funnelData: any, userId: string) {
  console.log('🏗️ Starting database funnel creation...');
  
  const shareToken = crypto.randomUUID();
  console.log('🔑 Generated share token:', shareToken);

  try {
    // Crea il funnel interattivo
    console.log('💾 Creating interactive funnel record...');
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
      console.error('❌ Error creating funnel:', funnelError);
      throw new Error(`Errore nella creazione del funnel: ${funnelError.message}`);
    }

    console.log('✅ Funnel created successfully:', funnel.id);

    // Valori step_type validi
    const validStepTypes = ['lead_capture', 'form', 'qualification', 'education', 'conversion', 'follow_up'];
    
    // Crea gli step del funnel con validazione
    console.log('📝 Creating funnel steps...');
    const stepsToInsert = funnelData.steps.map((step: any, index: number) => {
      // Valida step_type
      let stepType = step.step_type;
      if (!validStepTypes.includes(stepType)) {
        console.warn(`⚠️ Invalid step_type: ${stepType}, defaulting to 'form'`);
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

    console.log(`📋 Inserting ${stepsToInsert.length} steps...`);
    const { error: stepsError } = await supabase
      .from('interactive_funnel_steps')
      .insert(stepsToInsert);

    if (stepsError) {
      console.error('❌ Error creating funnel steps:', stepsError);
      // Rollback - elimina il funnel
      console.log('🔄 Rolling back funnel creation...');
      await supabase.from('interactive_funnels').delete().eq('id', funnel.id);
      throw new Error(`Errore nella creazione degli step del funnel: ${stepsError.message}`);
    }

    console.log('✅ All steps created successfully');
    return { funnel, funnelData };

  } catch (error) {
    console.error('💥 Database operation failed:', error);
    throw error;
  }
}

// Funzione per chiamare OpenAI
async function generateFunnelWithAI(prompt: string): Promise<any> {
  console.log('🤖 Starting OpenAI generation...');
  console.log('📝 Prompt length:', prompt.length);
  
  const systemPrompt = getSystemPrompt();
  console.log('⚙️ System prompt length:', systemPrompt.length);
  
  try {
    console.log('📡 Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    console.log('📨 OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI response received');
    console.log('🔍 Response structure:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      hasMessage: !!data.choices?.[0]?.message,
      hasContent: !!data.choices?.[0]?.message?.content,
      contentLength: data.choices?.[0]?.message?.content?.length
    });

    const generatedContent = data.choices[0].message.content;
    console.log('📄 Generated content preview:', generatedContent.substring(0, 200) + '...');

    // Parse del JSON
    try {
      console.log('🔧 Parsing JSON response...');
      const parsedData = JSON.parse(generatedContent);
      console.log('✅ JSON parsed successfully');
      console.log('📊 Parsed data structure:', {
        hasName: !!parsedData.name,
        hasSteps: !!parsedData.steps,
        stepsCount: parsedData.steps?.length,
        hasCustomerFacing: !!parsedData.customer_facing
      });
      return parsedData;
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('🔍 Raw content that failed to parse:', generatedContent);
      throw new Error(`Errore nel parsing della risposta AI: ${parseError.message}`);
    }

  } catch (error) {
    console.error('💥 OpenAI generation failed:', error);
    throw error;
  }
}

serve(async (req) => {
  console.log('🚀 Edge function started:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(req.headers.entries())
  });

  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verifica configurazione iniziale
    console.log('🔧 Checking configuration...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not found');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Configurazione API non valida',
          details: 'OpenAI API key mancante'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Supabase configuration missing:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Configurazione database non valida',
          details: 'Supabase configuration mancante'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Configuration validated');

    // Lettura del body della richiesta con gestione errori migliorata
    console.log('📥 Reading request body...');
    let requestText: string;
    
    try {
      const requestBody = await req.text();
      requestText = requestBody;
      console.log('📄 Request body length:', requestText.length);
      console.log('📋 Request body preview:', requestText.substring(0, 500) + (requestText.length > 500 ? '...' : ''));
    } catch (bodyError) {
      console.error('❌ Failed to read request body:', bodyError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Impossibile leggere i dati della richiesta',
          details: 'Body della richiesta non valido'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verifica che il body non sia vuoto
    if (!requestText || requestText.trim().length === 0) {
      console.error('❌ Empty request body');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Richiesta vuota',
          details: 'Il body della richiesta è vuoto'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(requestText);
      console.log('✅ Request body parsed successfully');
      console.log('📊 Parsed body structure:', {
        keys: Object.keys(parsedBody),
        hasPrompt: !!parsedBody.prompt,
        hasUserId: !!parsedBody.userId,
        promptLength: parsedBody.prompt?.length
      });
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('🔍 Failed to parse:', requestText.substring(0, 200));
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Formato dati non valido', 
          details: 'JSON malformato nella richiesta'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { prompt, userId, saveToLibrary = true } = parsedBody;
    console.log('📋 Enhanced request data validated:', {
      hasPrompt: !!prompt,
      promptLength: prompt?.length,
      hasUserId: !!userId,
      userId: userId,
      saveToLibrary: !!saveToLibrary
    });

    if (!prompt || !userId) {
      console.error('❌ Missing required fields:', { hasPrompt: !!prompt, hasUserId: !!userId });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Parametri mancanti',
          details: 'Prompt e userId sono richiesti'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Genera il funnel con AI
    console.log('🎯 Starting AI generation process...');
    const funnelData = await generateFunnelWithAI(prompt);

    // Crea Supabase client
    console.log('🔧 Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Crea il funnel nel database
    console.log('💾 Creating enhanced funnel in database...');
    const { funnel } = await createFunnelInDatabase(supabase, funnelData, userId);

    // Se richiesto, salva anche il funnel nella libreria principale
    let savedToLibrary = false;
    if (saveToLibrary) {
      try {
        console.log('📚 Saving funnel to main library...');
        
        // Salva il funnel nella libreria principale (ai_generated_funnels)
        const { data: libraryFunnel, error: libraryError } = await supabase
          .from('ai_generated_funnels')
          .insert({
            user_id: userId,
            name: funnelData.name,
            description: funnelData.description,
            funnel_data: {
              ...funnelData,
              interactive_funnel_id: funnel.id,
              rich_content: true,
              cinematic_ux: true
            },
            is_active: true,
            interview_id: '', // Placeholder per compatibilità
            share_token: funnel.share_token
          })
          .select()
          .single();

        if (libraryError) {
          console.error('⚠️ Error saving to library:', libraryError);
        } else {
          console.log('✅ Funnel saved to library successfully:', libraryFunnel.id);
          savedToLibrary = true;
        }
      } catch (saveError) {
        console.error('⚠️ Library save attempt failed:', saveError);
      }
    }

    const response = {
      success: true,
      savedToLibrary,
      funnel: {
        id: funnel.id,
        name: funnel.name,
        description: funnel.description,
        share_token: funnel.share_token,
        steps: funnelData.steps,
        settings: funnel.settings,
        advanced_funnel_data: funnelData.advanced_funnel_data,
        customer_facing: funnelData.customer_facing,
        target_audience: funnelData.target_audience,
        industry: funnelData.industry
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
    console.error('💥 Critical error in edge function:', {
      error,
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Gestione errori più specifica
    let errorMessage = 'Errore interno del server';
    let statusCode = 500;

    if (error.message?.includes('OpenAI API')) {
      errorMessage = 'Errore nel servizio di AI. Riprova tra qualche minuto.';
      statusCode = 503;
    } else if (error.message?.includes('parsing') || error.message?.includes('JSON')) {
      errorMessage = 'Errore nella generazione del funnel. Riprova con una descrizione più dettagliata.';
      statusCode = 422;
    } else if (error.message?.includes('creazione') || error.message?.includes('database')) {
      errorMessage = 'Errore nel salvataggio del funnel. Riprova.';
      statusCode = 500;
    }

    const errorResponse = { 
      success: false,
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
