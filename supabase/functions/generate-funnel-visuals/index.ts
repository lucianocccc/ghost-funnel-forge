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
    const { funnelId, section, userId } = await req.json();

    console.log('🎨 Generating visuals for funnel:', { funnelId, section });

    // Recupera i dati del funnel
    const { data: funnel, error: funnelError } = await supabase
      .from('ai_generated_funnels')
      .select('*')
      .eq('id', funnelId)
      .eq('user_id', userId)
      .single();

    if (funnelError || !funnel) {
      throw new Error('Funnel non trovato');
    }

    // Estrai il prompt per l'immagine dalla sezione richiesta
    let imagePrompt = '';
    const content = funnel.content;
    
    switch (section) {
      case 'hero':
        imagePrompt = content.hero?.backgroundImagePrompt || `Modern ${funnel.metadata?.brandStyle || 'professional'} background for ${funnel.name}`;
        break;
      case 'emotional':
        imagePrompt = content.emotional?.imagePrompt || `Emotional visual representing ${funnel.description}`;
        break;
      default:
        imagePrompt = `Professional visual for ${funnel.name} funnel`;
    }

    // Ottimizza il prompt per il brand style
    const brandStyle = funnel.metadata?.brandStyle || 'professional';
    const optimizedPrompt = `${imagePrompt}, ${brandStyle} style, high quality, professional, marketing-ready, ultra high resolution`;

    console.log('🖼️ Generating image with prompt:', optimizedPrompt);

    // Genera l'immagine con DALL-E 3
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: optimizedPrompt,
        n: 1,
        size: '1792x1024',
        quality: 'hd',
        response_format: 'url'
      }),
    });

    if (!imageResponse.ok) {
      throw new Error(`OpenAI Image API error: ${imageResponse.statusText}`);
    }

    const imageData = await imageResponse.json();
    const imageUrl = imageData.data[0]?.url;

    if (!imageUrl) {
      throw new Error('Nessuna immagine generata');
    }

    console.log('✅ Image generated successfully');

    // Aggiorna il funnel con l'URL dell'immagine
    const updatedContent = { ...content };
    if (section === 'hero') {
      updatedContent.hero.backgroundImage = imageUrl;
    } else if (section === 'emotional') {
      updatedContent.emotional.image = imageUrl;
    }

    const { error: updateError } = await supabase
      .from('ai_generated_funnels')
      .update({ content: updatedContent })
      .eq('id', funnelId);

    if (updateError) {
      console.error('Error updating funnel with image:', updateError);
      // Non bloccare l'operazione, restituisci comunque l'URL
    }

    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl: imageUrl,
      section: section
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error generating visuals:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Errore nella generazione delle immagini',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});