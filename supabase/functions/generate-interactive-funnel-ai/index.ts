
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  prompt: string;
  userId: string;
  saveToLibrary?: boolean;
  funnelTypeId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { prompt, userId, saveToLibrary = true, funnelTypeId }: RequestBody = await req.json();

    console.log('🚀 Starting AI funnel generation:', {
      promptLength: prompt.length,
      userId,
      funnelTypeId: funnelTypeId || 'custom'
    });

    // Get funnel type if specified
    let funnelType = null;
    if (funnelTypeId) {
      const { data: typeData, error: typeError } = await supabase
        .from('funnel_types')
        .select('*')
        .eq('id', funnelTypeId)
        .single();

      if (typeError) {
        console.error('Error fetching funnel type:', typeError);
      } else {
        funnelType = typeData;
      }
    }

    // Prepare AI prompt
    let systemPrompt = `Sei un esperto di marketing digitale e funnel conversion. Genera un funnel interattivo dettagliato basato sulla richiesta dell'utente.

IMPORTANTE: Rispondi SOLO con un JSON valido senza testo aggiuntivo.

Il JSON deve avere questa struttura:
{
  "name": "Nome del funnel",
  "description": "Descrizione dettagliata",
  "settings": {
    "theme": "modern",
    "primaryColor": "#3B82F6",
    "showProgressBar": true
  },
  "steps": [
    {
      "title": "Titolo step",
      "description": "Descrizione step", 
      "step_type": "lead_capture|qualification|discovery|conversion|contact_form|thank_you",
      "step_order": 1,
      "is_required": true,
      "fields_config": {
        "fields": [
          {
            "type": "text|email|tel|select|textarea|checkbox|radio",
            "name": "field_name",
            "label": "Etichetta campo",
            "placeholder": "Placeholder",
            "required": true,
            "options": ["opzione1", "opzione2"] // solo per select/radio
          }
        ]
      },
      "settings": {
        "buttonText": "Continua",
        "showProgress": true
      }
    }
  ]
}

Tipi di step disponibili:
- lead_capture: Cattura lead iniziale
- qualification: Qualificazione prospect  
- discovery: Scoperta esigenze
- conversion: Conversione finale
- contact_form: Modulo contatti
- thank_you: Pagina ringraziamento

Crea un funnel ottimizzato per massimizzare conversioni con 3-5 step strategici.`;

    // Add funnel type specific guidance
    if (funnelType) {
      systemPrompt += `\n\nTipo di funnel richiesto: ${funnelType.name}
Categoria: ${funnelType.category}
Descrizione: ${funnelType.description}
Settore: ${funnelType.industry || 'generale'}
Target: ${funnelType.target_audience || 'generale'}

Usa queste informazioni per personalizzare il funnel.`;

      if (funnelType.ai_prompts?.system_prompt) {
        systemPrompt += `\n\nGuida specifica: ${funnelType.ai_prompts.system_prompt}`;
      }
    }

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const generatedContent = openAIData.choices[0].message.content;

    console.log('🤖 AI generated content length:', generatedContent.length);

    // Parse AI response
    let funnelData;
    try {
      // Clean up response - remove code blocks if present
      const cleanContent = generatedContent.replace(/```json\n?|\n?```/g, '').trim();
      funnelData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.log('Raw content:', generatedContent);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate required fields
    if (!funnelData.name || !funnelData.steps || !Array.isArray(funnelData.steps)) {
      throw new Error('Invalid funnel data structure');
    }

    // Ensure steps have proper order
    funnelData.steps.forEach((step: any, index: number) => {
      step.step_order = index + 1;
    });

    console.log('✅ Generated funnel:', {
      name: funnelData.name,
      stepsCount: funnelData.steps.length
    });

    // Save to database if requested
    if (saveToLibrary) {
      try {
        // Create the funnel - REMOVED funnel_type_id to fix the error
        const { data: funnel, error: funnelError } = await supabase
          .from('interactive_funnels')
          .insert({
            name: funnelData.name,
            description: funnelData.description,
            settings: funnelData.settings || {},
            created_by: userId,
            status: 'active',
            is_public: true,
            share_token: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          })
          .select()
          .single();

        if (funnelError) {
          console.error('❌ Error creating funnel:', funnelError);
          throw funnelError;
        }

        console.log('📝 Created funnel:', funnel.id);

        // Create steps
        const stepsToInsert = funnelData.steps.map((step: any) => ({
          funnel_id: funnel.id,
          title: step.title,
          description: step.description || '',
          step_type: step.step_type,
          step_order: step.step_order,
          fields_config: step.fields_config || {},
          settings: step.settings || {},
          is_required: step.is_required !== false
        }));

        const { data: steps, error: stepsError } = await supabase
          .from('interactive_funnel_steps')
          .insert(stepsToInsert)
          .select();

        if (stepsError) {
          console.error('❌ Error creating steps:', stepsError);
          throw stepsError;
        }

        console.log('📋 Created steps:', steps.length);

        // Return complete funnel with steps
        const completeData = {
          ...funnel,
          steps: steps,
          funnel_type: funnelType
        };

        return new Response(JSON.stringify({
          success: true,
          funnel: completeData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (dbError) {
        console.error('❌ Database error:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }
    } else {
      // Return funnel data without saving
      return new Response(JSON.stringify({
        success: true,
        funnel: funnelData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('❌ Error in generate-interactive-funnel-ai:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Errore interno del server'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
