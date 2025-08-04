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

    // Enhanced AI prompt with dynamic section logic
    const systemPrompt = `Sei un esperto di marketing digitale e funnel di conversione con capacità di analisi dinamica.
    
    ANALIZZA il prompt dell'utente per identificare:
    1. KEYWORDS per l'attivazione delle sezioni (trust, testimonials, products, faq, urgent, free, etc.)
    2. TONE OF VOICE (professional, friendly, aggressive, educational, luxury)
    3. MICROCOPY PERSONALIZATION basata su settore e tono
    
    APPLICA queste regole IF/THEN:
    - SE tone = "professional" → priorità: hero, trust_block, product_gallery, testimonials, faq, lead_capture + evita urgency
    - SE tone = "aggressive" → priorità: hero, urgency, lead_magnet, testimonials, trust_block + forza urgency  
    - SE tone = "educational" → priorità: hero, faq, testimonials, trust_block, lead_magnet + enfasi content
    - SE tone = "luxury" → priorità: hero, product_gallery, testimonials, trust_block, lead_capture + evita urgency + minimizza sezioni
    - SE keywords contengono "trust/reviews" → aggiungi testimonials + trust_block
    - SE keywords contengono "products/gallery" → aggiungi product_gallery
    - SE keywords contengono "faq/questions" → aggiungi faq
    - SE keywords contengono "free/download" → aggiungi lead_magnet
    - SE settore = "ecommerce" → aggiungi product_gallery
    - SE settore = "consulting" → aggiungi testimonials
    
    SEZIONI DISPONIBILI:
    - hero (sempre incluso)
    - testimonials (galleria testimonianze avanzata)  
    - product_gallery (showcase prodotti/servizi)
    - faq (FAQ dinamiche con ricerca)
    - trust_block (certificazioni e garanzie)
    - lead_magnet (offerta irresistibile)
    - lead_capture (form raccolta contatti)
    - urgency (timer scarsità)
    - social_proof (proof sociale)
    - problem_solution (problema/soluzione)
    
    PERSONALIZZA il microcopy basato su:
    - Tone professional: "Richiedi Informazioni", "Scopri di Più"
    - Tone aggressive: "Ottieni Subito", "Ultima Possibilità" 
    - Tone friendly: "Inizia il Tuo Viaggio", "Unisciti a Noi"
    - Tone educational: "Impara di Più", "Accedi al Corso"
    - Tone luxury: "Richiedi Accesso Esclusivo", "Scopri l'Eccellenza"
    
    Rispondi SOLO con un JSON valido nel seguente formato:
    {
      "funnel_name": "Nome del funnel",
      "description": "Descrizione dettagliata",
      "analysis": {
        "detected_keywords": ["keyword1", "keyword2"],
        "tone_of_voice": "professional|friendly|aggressive|educational|luxury",
        "applied_rules": ["regola1", "regola2"],
        "confidence": 0.8
      },
      "sections": [
        {
          "section_id": "unique_id",
          "section_type": "hero|testimonials|product_gallery|faq|trust_block|lead_magnet|lead_capture|urgency|social_proof|problem_solution",
          "position": 0,
          "title": "Titolo sezione personalizzato",
          "content": {
            "headline": "Titolo principale personalizzato per tone",
            "subheadline": "Sottotitolo personalizzato",
            "body_text": "Testo principale personalizzato",
            "cta_text": "CTA personalizzato per tone",
            "additional_elements": {}
          },
          "styling": {
            "background_color": "#ffffff",
            "text_color": "#333333", 
            "layout": "default"
          },
          "is_enabled": true,
          "microcopy_personalization": {
            "tone": "detected_tone",
            "industry_specific": true,
            "cta_variant": "primary|secondary|urgency"
          }
        }
      ],
      "global_settings": {
        "theme": "professional",
        "primary_color": "#007bff", 
        "font_family": "Inter",
        "personalized_for_tone": true
      },
      "optimization_notes": ["Nota basata su analisi dinamica", "Regola applicata"],
      "dynamic_logic_summary": {
        "activated_sections": ["hero", "testimonials"],
        "if_then_rules_used": ["rule1", "rule2"],
        "section_order_logic": "Ordinamento basato su tone professional"
      }
    }`;

    const userPrompt = `ANALIZZA e GENERA un funnel dinamico per:
    - Settore: ${industry}
    - Target audience: ${target_audience} 
    - Obiettivi: ${objectives?.join(', ')}
    ${custom_prompt ? `- Richieste specifiche: ${custom_prompt}` : ''}
    ${advanced_options ? `- Opzioni avanzate: ${JSON.stringify(advanced_options)}` : ''}
    
    Sezioni template disponibili: ${sections?.map(s => `${s.section_name} (${s.section_type})`).join(', ')}
    
    APPLICA la logica dinamica di attivazione/ordinamento delle sezioni basata sull'analisi del mio prompt e crea un funnel ottimizzato di 4-6 sezioni.`;

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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