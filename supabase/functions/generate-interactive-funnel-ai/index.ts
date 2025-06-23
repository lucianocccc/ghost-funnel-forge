
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, userId } = await req.json();

    if (!prompt || !userId) {
      return new Response(
        JSON.stringify({ error: 'Prompt e userId sono richiesti' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating interactive funnel for prompt:', prompt);

    const systemPrompt = `Sei un esperto di marketing digitale e funnel. Genera un funnel interattivo completo basato sul prompt dell'utente.

IMPORTANTE: Rispondi SOLO con un JSON valido seguendo esattamente questa struttura:

{
  "name": "Nome del Funnel",
  "description": "Descrizione dettagliata del funnel",
  "target_audience": "Target audience specifico",
  "industry": "Settore/industria",
  "customer_facing": {
    "hero_title": "Titolo principale accattivante per i clienti",
    "hero_subtitle": "Sottotitolo che spiega il valore",
    "brand_colors": {
      "primary": "#2563eb",
      "secondary": "#1e40af",
      "accent": "#f59e0b"
    },
    "style_theme": "modern|elegant|playful|professional|minimal"
  },
  "steps": [
    {
      "title": "Titolo del Step (per admin)",
      "description": "Descrizione del step (per admin)",
      "customer_title": "Titolo accattivante per il cliente",
      "customer_description": "Descrizione coinvolgente per il cliente",
      "customer_motivation": "Breve testo motivazionale",
      "step_type": "lead_capture|qualification|education|conversion|follow_up",
      "is_required": true|false,
      "step_order": 1,
      "form_fields": [
        {
          "id": "field_id",
          "type": "text|email|tel|textarea|select|checkbox|radio",
          "label": "Etichetta del campo",
          "placeholder": "Placeholder coinvolgente",
          "required": true|false,
          "options": ["opzione1", "opzione2"] // solo per select/radio
        }
      ],
      "settings": {
        "showProgressBar": true|false,
        "allowBack": true|false,
        "submitButtonText": "Testo del bottone accattivante",
        "backgroundColor": "#ffffff",
        "textColor": "#000000"
      }
    }
  ],
  "strategy": "Strategia di implementazione e distribuzione"
}

Crea un funnel di 3-5 step appropriati per il prompt dell'utente. Assicurati che:
- I titoli e descrizioni customer_* siano coinvolgenti e orientati al cliente
- I colori siano appropriati per l'industria
- I testi motivazionali spingano all'azione
- I bottoni abbiano CTA convincenti
- Lo stile sia coerente con il settore di riferimento`;

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

    // Parse the JSON response
    let funnelData;
    try {
      funnelData = JSON.parse(generatedContent);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return new Response(
        JSON.stringify({ error: 'Errore nel parsing della risposta AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate share token
    const shareToken = crypto.randomUUID();

    // Create the interactive funnel with customer-facing settings
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
      return new Response(
        JSON.stringify({ error: 'Errore nella creazione del funnel' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the funnel steps with customer-facing content
    const stepsToInsert = funnelData.steps.map((step: any, index: number) => ({
      funnel_id: funnel.id,
      title: step.title,
      description: step.description,
      step_type: step.step_type,
      step_order: step.step_order || index + 1,
      is_required: step.is_required || false,
      fields_config: step.form_fields || [],
      settings: {
        ...step.settings,
        customer_title: step.customer_title,
        customer_description: step.customer_description,
        customer_motivation: step.customer_motivation
      }
    }));

    const { error: stepsError } = await supabase
      .from('interactive_funnel_steps')
      .insert(stepsToInsert);

    if (stepsError) {
      console.error('Error creating funnel steps:', stepsError);
      // Rollback - delete the funnel
      await supabase.from('interactive_funnels').delete().eq('id', funnel.id);
      return new Response(
        JSON.stringify({ error: 'Errore nella creazione degli step del funnel' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully created interactive funnel:', funnel.id);

    return new Response(
      JSON.stringify({
        success: true,
        funnel: {
          id: funnel.id,
          name: funnel.name,
          description: funnel.description,
          share_token: funnel.share_token,
          steps: funnelData.steps,
          settings: funnel.settings
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-interactive-funnel-ai:', error);
    return new Response(
      JSON.stringify({ error: 'Errore interno del server' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
