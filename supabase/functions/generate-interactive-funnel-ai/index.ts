
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
  "steps": [
    {
      "title": "Titolo del Step",
      "description": "Descrizione del step",
      "step_type": "lead_capture|qualification|education|conversion|follow_up",
      "is_required": true|false,
      "step_order": 1,
      "form_fields": [
        {
          "id": "field_id",
          "type": "text|email|tel|textarea|select|checkbox|radio",
          "label": "Etichetta del campo",
          "placeholder": "Placeholder opzionale",
          "required": true|false,
          "options": ["opzione1", "opzione2"] // solo per select/radio
        }
      ],
      "settings": {
        "showProgressBar": true|false,
        "allowBack": true|false,
        "submitButtonText": "Testo del bottone",
        "backgroundColor": "#ffffff",
        "textColor": "#000000"
      }
    }
  ],
  "strategy": "Strategia di implementazione e distribuzione"
}

Crea un funnel di 3-5 step appropriati per il prompt dell'utente. Assicurati che ogni step abbia form_fields appropriati per raccogliere le informazioni necessarie.`;

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
        max_tokens: 3000,
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

    // Create the interactive funnel
    const { data: funnel, error: funnelError } = await supabase
      .from('interactive_funnels')
      .insert({
        user_id: userId,
        name: funnelData.name,
        description: funnelData.description,
        is_active: false,
        is_public: false,
        share_token: shareToken,
        settings: {
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

    // Create the funnel steps
    const stepsToInsert = funnelData.steps.map((step: any, index: number) => ({
      funnel_id: funnel.id,
      title: step.title,
      description: step.description,
      step_type: step.step_type,
      step_order: step.step_order || index + 1,
      is_required: step.is_required || false,
      form_fields: step.form_fields || [],
      settings: step.settings || {}
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
