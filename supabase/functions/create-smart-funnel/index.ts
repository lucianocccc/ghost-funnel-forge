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
    const { 
      business_description, 
      target_audience, 
      main_goal, 
      budget_range, 
      timeline, 
      industry,
      experience_level,
      specific_requirements,
      preferred_style,
      userId 
    } = await req.json();

    if (!business_description || !userId) {
      return new Response(
        JSON.stringify({ error: 'Business description e userId sono richiesti' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating smart funnel for business:', business_description);

    const smartPrompt = `Sei un consulente senior di marketing digitale con 20 anni di esperienza. Analizza attentamente il business dell'utente e crea un funnel ultra-personalizzato.

DATI DELL'UTENTE:
- Business: ${business_description}
- Target: ${target_audience || 'Non specificato'}
- Obiettivo: ${main_goal || 'Non specificato'}
- Budget: ${budget_range || 'Non specificato'}
- Timeline: ${timeline || 'Non specificato'}
- Settore: ${industry || 'Non specificato'}
- Esperienza: ${experience_level || 'Non specificato'}
- Requisiti: ${specific_requirements || 'Nessuno'}
- Stile preferito: ${preferred_style || 'Non specificato'}

ANALISI APPROFONDITA RICHIESTA:
1. Comprendi il vero business model e pain points
2. Identifica opportunità di mercato nascoste
3. Analizza la psicologia del target specifico
4. Progetta un customer journey ottimale
5. Seleziona trigger psicologici specifici per il settore
6. Ottimizza per il budget e timeline disponibili

CREA UN FUNNEL STRATEGICO che:
- Massimizzi ROI e conversioni per quel business specifico
- Utilizzi tecniche di persuasione avanzate
- Includa elementi di differenziazione competitiva
- Sia scalabile e automatizzabile
- Consideri il lifecycle value del cliente

Rispondi SOLO con JSON seguendo questa struttura avanzata:

{
  "empathic_analysis": {
    "business_model_insights": ["insight1", "insight2", "insight3"],
    "target_psychology": ["aspetto1", "aspetto2", "aspetto3"],
    "market_opportunities": ["opportunità1", "opportunità2"],
    "competitive_gaps": ["gap1", "gap2"],
    "growth_potential": "alto|medio|basso",
    "risk_factors": ["rischio1", "rischio2"]
  },
  "name": "Nome Funnel Ultra-Personalizzato",
  "description": "Descrizione strategica che spiega perché questo funnel funzionerà",
  "target_audience": {
    "primary": "Audience primaria specifica",
    "demographics": "Demografia dettagliata",
    "psychographics": "Psicografia e motivazioni",
    "pain_points": ["pain specifico 1", "pain specifico 2", "pain specifico 3"],
    "desires": ["desiderio 1", "desiderio 2", "desiderio 3"],
    "objections": ["obiezione 1", "obiezione 2"],
    "preferred_communication": "Stile di comunicazione preferito"
  },
  "industry": "${industry}",
  "personalization_level": "advanced",
  "estimated_conversion_rate": "percentuale realistica",
  "roi_projection": "proiezione ROI realistica",
  "customer_facing": {
    "hero_title": "Titolo che risolve il pain point principale",
    "hero_subtitle": "Sottotitolo che promette trasformazione specifica",
    "value_proposition": "Proposta di valore unica e differenziante",
    "social_proof_elements": ["elemento1", "elemento2", "elemento3"],
    "brand_colors": {
      "primary": "#colore-strategico-per-settore",
      "secondary": "#colore-complementare-psicologico",
      "accent": "#colore-conversione-ottimizzato"
    },
    "style_theme": "luxury|tech|professional|friendly|authoritative|innovative",
    "psychological_approach": "urgency|scarcity|social_proof|authority|reciprocity|commitment",
    "trust_building_strategy": "Strategia per costruire fiducia specifica per settore"
  },
  "steps": [
    {
      "title": "Titolo Admin Step",
      "description": "Descrizione strategica dettagliata",
      "customer_title": "Titolo irresistibile per target specifico",
      "customer_description": "Descrizione che parla direttamente ai pain points",
      "customer_motivation": "Messaggio motivazionale ultra-personalizzato",
      "psychological_triggers": ["trigger specifici per questo step"],
      "step_type": "awareness|interest|consideration|intent|conversion|retention|advocacy",
      "is_required": true,
      "step_order": 1,
      "conversion_goal": "Obiettivo micro-conversione specifico",
      "personalization_rules": ["regola1", "regola2"],
      "form_fields": [
        {
          "id": "field_semantico_specifico",
          "type": "text|email|tel|textarea|select|checkbox|radio|file|date|number",
          "label": "Label psicologicamente ottimizzata",
          "placeholder": "Placeholder che guida verso valore",
          "required": true|false,
          "validation_message": "Messaggio incoraggiante",
          "options": ["opzione strategica 1", "opzione 2"],
          "psychological_bias": "social_proof|scarcity|anchoring|loss_aversion",
          "data_collection_purpose": "Scopo specifico raccolta dati"
        }
      ],
      "settings": {
        "showProgressBar": true,
        "allowBack": false,
        "submitButtonText": "CTA ultra-specifica per target",
        "backgroundColor": "#background-ottimizzato",
        "textColor": "#testo-ad-alto-contrasto",
        "animation_style": "professional|dynamic|subtle",
        "trust_signals": ["segnale fiducia 1", "segnale 2"],
        "urgency_elements": ["elemento urgenza 1", "elemento 2"],
        "personalization_elements": ["elemento personalizzazione 1", "elemento 2"]
      },
      "optimization_notes": "Note strategiche per A/B testing futuro",
      "expected_drop_off_rate": "percentuale realistica",
      "value_delivery": "Valore specifico consegnato in questo step"
    }
  ],
  "strategy": {
    "implementation_approach": "Strategia implementazione step-by-step",
    "traffic_sources": ["fonte ottimale 1", "fonte 2", "fonte 3"],
    "budget_allocation": "Allocazione budget consigliata",
    "kpi_tracking": ["KPI cruciale 1", "KPI 2", "KPI 3"],
    "ab_testing_priorities": ["test prioritario 1", "test 2"],
    "follow_up_strategy": "Strategia nurturing post-conversione",
    "scaling_roadmap": "Piano di scaling 3-6-12 mesi",
    "risk_mitigation": "Strategie di mitigazione rischi"
  },
  "personalization_data": {
    "dynamic_content_areas": ["area personalizzabile 1", "area 2"],
    "behavioral_triggers": ["trigger comportamentale 1", "trigger 2"],
    "segmentation_logic": "Logica segmentazione intelligente",
    "adaptive_messaging": "Sistema messaggi adattivi",
    "progressive_profiling": "Strategia profilazione progressiva"
  },
  "advanced_features": {
    "ai_personalization": "Strategia personalizzazione AI",
    "predictive_analytics": "Analytics predittive implementabili",
    "automation_workflows": ["workflow 1", "workflow 2"],
    "integration_recommendations": ["integrazione 1", "integrazione 2"]
  }
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: smartPrompt },
          { 
            role: 'user', 
            content: `Crea un funnel ultra-personalizzato per il mio business. Analizza attentamente tutti i dettagli forniti e crea una strategia di conversione ottimale.` 
          }
        ],
        temperature: 0.8,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Generated smart funnel content:', generatedContent);

    // Parse the JSON response
    let smartFunnelData;
    try {
      smartFunnelData = JSON.parse(generatedContent);
    } catch (error) {
      console.error('Error parsing smart funnel JSON:', error);
      return new Response(
        JSON.stringify({ error: 'Errore nel parsing della risposta AI avanzata' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate share token
    const shareToken = crypto.randomUUID();

    // Create the smart interactive funnel with advanced settings
    const { data: funnel, error: funnelError } = await supabase
      .from('interactive_funnels')
      .insert({
        created_by: userId,
        name: smartFunnelData.name,
        description: smartFunnelData.description,
        status: 'draft',
        is_public: false,
        share_token: shareToken,
        settings: {
          customer_facing: smartFunnelData.customer_facing,
          target_audience: smartFunnelData.target_audience,
          industry: smartFunnelData.industry,
          strategy: smartFunnelData.strategy,
          personalization_data: smartFunnelData.personalization_data,
          advanced_features: smartFunnelData.advanced_features,
          empathic_analysis: smartFunnelData.empathic_analysis,
          roi_projection: smartFunnelData.roi_projection,
          estimated_conversion_rate: smartFunnelData.estimated_conversion_rate,
          personalization_level: smartFunnelData.personalization_level,
          creation_context: {
            business_description,
            target_audience,
            main_goal,
            budget_range,
            timeline,
            industry,
            experience_level,
            specific_requirements,
            preferred_style,
            created_at: new Date().toISOString()
          }
        }
      })
      .select()
      .single();

    if (funnelError) {
      console.error('Error creating smart funnel:', funnelError);
      return new Response(
        JSON.stringify({ error: 'Errore nella creazione del funnel intelligente' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the advanced funnel steps
    const stepsToInsert = smartFunnelData.steps.map((step: any, index: number) => ({
      funnel_id: funnel.id,
      title: step.title,
      description: step.description,
      step_type: step.step_type,
      step_order: step.step_order || index + 1,
      is_required: step.is_required !== false,
      fields_config: step.form_fields || [],
      settings: {
        ...step.settings,
        customer_title: step.customer_title,
        customer_description: step.customer_description,
        customer_motivation: step.customer_motivation,
        psychological_triggers: step.psychological_triggers,
        conversion_goal: step.conversion_goal,
        personalization_rules: step.personalization_rules,
        optimization_notes: step.optimization_notes,
        expected_drop_off_rate: step.expected_drop_off_rate,
        value_delivery: step.value_delivery
      }
    }));

    const { error: stepsError } = await supabase
      .from('interactive_funnel_steps')
      .insert(stepsToInsert);

    if (stepsError) {
      console.error('Error creating smart funnel steps:', stepsError);
      // Rollback - delete the funnel
      await supabase.from('interactive_funnels').delete().eq('id', funnel.id);
      return new Response(
        JSON.stringify({ error: 'Errore nella creazione degli step del funnel intelligente' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully created smart interactive funnel:', funnel.id);

    return new Response(
      JSON.stringify({
        success: true,
        funnel: {
          id: funnel.id,
          name: funnel.name,
          description: funnel.description,
          share_token: funnel.share_token,
          steps: smartFunnelData.steps,
          settings: funnel.settings,
          empathic_analysis: smartFunnelData.empathic_analysis,
          advanced_features: smartFunnelData.advanced_features,
          personalization_level: smartFunnelData.personalization_level,
          estimated_conversion_rate: smartFunnelData.estimated_conversion_rate,
          roi_projection: smartFunnelData.roi_projection
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-smart-funnel:', error);
    return new Response(
      JSON.stringify({ error: 'Errore interno del server nella creazione funnel intelligente' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});