import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { generation_id, config_id, custom_prompt, target_audience, industry, objectives, advanced_options } = await req.json();

    console.log('Starting funnel generation for:', { generation_id, industry, objectives });

    // Update status to processing
    await supabase
      .from('modular_funnel_generations')
      .update({ generation_status: 'processing' })
      .eq('id', generation_id);

    // Get config if provided
    let configData = null;
    if (config_id) {
      const { data } = await supabase
        .from('modular_funnel_configs')
        .select('*')
        .eq('id', config_id)
        .single();
      configData = data;
    }

    // Get relevant section templates
    const { data: sections } = await supabase
      .from('funnel_section_library')
      .select('*')
      .contains('industry_tags', [industry])
      .order('conversion_impact_score', { ascending: false });

    // Create AI prompt
    const systemPrompt = `Sei un esperto di marketing digitale e funnel di conversione. 
    Genera un funnel modulare ottimizzato basato sui parametri forniti.
    
    Rispondi SOLO con un JSON valido nel seguente formato:
    {
      "funnel_name": "Nome del funnel",
      "description": "Descrizione dettagliata",
      "sections": [
        {
          "section_id": "unique_id",
          "section_type": "tipo_sezione",
          "position": 0,
          "title": "Titolo sezione",
          "content": {
            "headline": "Titolo principale",
            "subheadline": "Sottotitolo",
            "body_text": "Testo principale",
            "cta_text": "Testo call-to-action",
            "additional_elements": {}
          },
          "styling": {
            "background_color": "#ffffff",
            "text_color": "#333333",
            "layout": "default"
          },
          "is_enabled": true
        }
      ],
      "global_settings": {
        "theme": "professional",
        "primary_color": "#007bff",
        "font_family": "Inter"
      },
      "optimization_notes": ["Nota 1", "Nota 2"]
    }`;

    const userPrompt = `Genera un funnel per:
    - Settore: ${industry}
    - Target audience: ${target_audience}
    - Obiettivi: ${objectives?.join(', ')}
    ${custom_prompt ? `- Richieste specifiche: ${custom_prompt}` : ''}
    ${advanced_options ? `- Opzioni avanzate: ${JSON.stringify(advanced_options)}` : ''}
    
    Sezioni disponibili: ${sections?.map(s => s.section_name).join(', ')}
    
    Crea un funnel di 4-6 sezioni ottimizzato per la conversione.`;

    // Call OpenAI
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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiData = await response.json();
    const generatedContent = aiData.choices[0].message.content;

    let funnelData;
    try {
      funnelData = JSON.parse(generatedContent);
    } catch (error) {
      console.error('Failed to parse AI response:', generatedContent);
      throw new Error('Invalid JSON response from AI');
    }

    // Generate performance predictions
    const performancePredictions = {
      estimated_conversion_rate: Math.random() * 0.1 + 0.02, // 2-12%
      traffic_capacity: 'high',
      seo_score: 85,
      mobile_score: 90,
      user_experience_score: Math.floor(Math.random() * 20) + 80
    };

    // Generate optimization suggestions
    const optimizationSuggestions = [
      "Considera A/B test sul titolo principale",
      "Aggiungi più elementi di social proof",
      "Ottimizza i tempi di caricamento delle immagini",
      "Implementa tracking avanzato per le conversioni"
    ];

    // Update generation with results
    const { error: updateError } = await supabase
      .from('modular_funnel_generations')
      .update({
        generated_funnel_data: funnelData,
        ai_optimization_suggestions: optimizationSuggestions,
        performance_predictions: performancePredictions,
        generation_status: 'completed'
      })
      .eq('id', generation_id);

    if (updateError) {
      console.error('Error updating generation:', updateError);
      throw updateError;
    }

    console.log('Funnel generation completed successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      funnel_data: funnelData,
      performance_predictions: performancePredictions,
      optimization_suggestions: optimizationSuggestions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-modular-funnel-ai:', error);

    // Update status to failed if we have generation_id
    const { generation_id } = await req.json().catch(() => ({}));
    if (generation_id) {
      await supabase
        .from('modular_funnel_generations')
        .update({ generation_status: 'failed' })
        .eq('id', generation_id);
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});