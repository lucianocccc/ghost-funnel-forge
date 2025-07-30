import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      prompt,
      brandStyle,
      productName,
      targetAudience,
      includeVisuals,
      optimizationLevel,
      optimizedPrompt,
      userId
    } = await req.json();

    console.log('🚀 Generating advanced funnel:', {
      brandStyle,
      productName,
      optimizationLevel,
      includeVisuals
    });

    // Prompt specifico per la generazione avanzata con brand styling
    const systemPrompt = `Sei un esperto copywriter e designer specializzato nella creazione di funnel di conversione ad alta performance.

BRAND STYLE: ${brandStyle}
PRODOTTO: ${productName}
TARGET: ${targetAudience}
LIVELLO OTTIMIZZAZIONE: ${optimizationLevel}

Crea un funnel completo seguendo esattamente questo formato JSON (IMPORTANTE: rispondi SOLO con il JSON, senza altro testo):

{
  "name": "Nome del funnel basato sul prodotto",
  "description": "Descrizione del funnel",
  "brandStyle": "${brandStyle}",
  "content": {
    "hero": {
      "title": "Titolo principale ottimizzato per ${brandStyle}",
      "subtitle": "Sottotitolo persuasivo",
      "cta": "Call-to-action specifico per ${brandStyle}",
      "backgroundImagePrompt": "Prompt per generare immagine di sfondo pertinente"
    },
    "benefits": [
      {
        "title": "Beneficio 1",
        "description": "Descrizione dettagliata del beneficio",
        "iconPrompt": "Prompt per icona rappresentativa"
      },
      {
        "title": "Beneficio 2", 
        "description": "Descrizione dettagliata del beneficio",
        "iconPrompt": "Prompt per icona rappresentativa"
      },
      {
        "title": "Beneficio 3",
        "description": "Descrizione dettagliata del beneficio", 
        "iconPrompt": "Prompt per icona rappresentativa"
      }
    ],
    "emotional": {
      "headline": "Titolo emotivo che crea urgenza",
      "story": "Storia che connette emotivamente con il target",
      "urgency": "Messaggio di urgenza convincente",
      "imagePrompt": "Prompt per immagine emotiva pertinente"
    },
    "conversion": {
      "headline": "Titolo finale per la conversione",
      "benefits": ["Beneficio finale 1", "Beneficio finale 2", "Beneficio finale 3"],
      "cta": "Call-to-action finale ottimizzato",
      "urgency": "Ultimo messaggio di urgenza"
    }
  },
  "analytics": {
    "estimatedConversion": 8.5,
    "optimizationScore": 92,
    "improvements": [
      "Suggestion per miglioramento 1",
      "Suggestion per miglioramento 2", 
      "Suggestion per miglioramento 3"
    ]
  }
}

STILE ${brandStyle.toUpperCase()}:
- Apple: minimalista, elegante, focus su innovazione e qualità premium
- Nike: energico, motivazionale, focus su performance e superamento limiti  
- Amazon: professionale, pratico, focus su convenienza e affidabilità

PROMPT UTENTE: ${optimizedPrompt}`;

    // Chiamata a OpenAI
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
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiData = await response.json();
    const generatedContent = aiData.choices[0].message.content;

    console.log('🤖 AI Generated content:', generatedContent.substring(0, 200) + '...');

    // Parse del JSON generato dall'AI
    let funnelData;
    try {
      funnelData = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw new Error('Errore nel parsing della risposta AI');
    }

    // Genera token di condivisione
    const shareToken = crypto.randomUUID();

    // Salva nel database
    const { data: savedFunnel, error: dbError } = await supabase
      .from('ai_generated_funnels')
      .insert({
        user_id: userId,
        name: funnelData.name,
        description: funnelData.description,
        content: funnelData.content,
        metadata: {
          brandStyle: funnelData.brandStyle,
          analytics: funnelData.analytics,
          generationType: 'advanced',
          optimizationLevel,
          includeVisuals
        },
        share_token: shareToken,
        is_public: false
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Errore nel salvataggio del funnel');
    }

    console.log('✅ Funnel saved successfully:', savedFunnel.id);

    // Prepara la risposta finale
    const finalFunnel = {
      id: savedFunnel.id,
      name: funnelData.name,
      description: funnelData.description,
      brandStyle: funnelData.brandStyle,
      content: funnelData.content,
      analytics: funnelData.analytics,
      shareToken: shareToken
    };

    return new Response(JSON.stringify({ 
      success: true, 
      funnel: finalFunnel 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error in generate-advanced-funnel:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Errore interno del server',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});