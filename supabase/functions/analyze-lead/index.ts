
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadData } = await req.json();
    console.log('Analyzing lead data:', leadData);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create a comprehensive prompt for GPT analysis
    const prompt = `
Analizza i seguenti dati di un potenziale cliente e crea un profilo personalizzato:

Nome: ${leadData.nome}
Email: ${leadData.email}
Servizio di interesse: ${leadData.servizio}
Bio/Descrizione: ${leadData.bio || 'Non fornita'}

Basandoti su questi dati, fornisci:
1. Un'analisi semantica del profilo del cliente
2. Suggerimenti per un funnel personalizzato
3. Strategie di approccio consigliate
4. Punti di dolore potenziali identificati
5. Opportunità di business

Rispondi in formato JSON con questa struttura:
{
  "analisi_profilo": "...",
  "funnel_personalizzato": ["step1", "step2", "step3"],
  "strategie_approccio": ["strategia1", "strategia2"],
  "punti_dolore": ["punto1", "punto2"],
  "opportunita": ["opportunita1", "opportunita2"],
  "priorita": "alta/media/bassa",
  "categoria_cliente": "...",
  "next_steps": ["azione1", "azione2"]
}
`;

    console.log('Sending request to OpenAI...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sei un esperto di marketing e analisi clienti. Rispondi sempre in italiano con analisi precise e actionable.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const analysisText = data.choices[0].message.content;
    
    // Try to parse as JSON, fallback to structured text if needed
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.log('Could not parse as JSON, creating structured response');
      analysis = {
        analisi_profilo: analysisText,
        funnel_personalizzato: ["Contatto iniziale", "Presentazione servizi", "Proposta personalizzata"],
        strategie_approccio: ["Approccio consultivo", "Focus sui benefici"],
        punti_dolore: ["Da identificare nel colloquio"],
        opportunita: ["Potenziale collaborazione"],
        priorita: "media",
        categoria_cliente: "Prospect qualificato",
        next_steps: ["Chiamata di discovery", "Preparazione proposta"]
      };
    }

    // Store the analysis in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update the lead record with the analysis
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        gpt_analysis: analysis,
        analyzed_at: new Date().toISOString()
      })
      .eq('email', leadData.email);

    if (updateError) {
      console.error('Error updating lead with analysis:', updateError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      analysis: analysis,
      message: 'Lead analizzato con successo'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-lead function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
