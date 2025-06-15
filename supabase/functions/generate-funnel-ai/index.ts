
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId } = await req.json();

    if (!leadId) {
      return new Response(JSON.stringify({ success: false, error: "Missing leadId" }), { status: 400, headers: corsHeaders });
    }

    // Init Supabase server client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch Lead
    const { data: lead, error: leadError } = await supabase.from('leads').select('*').eq('id', leadId).single();
    if (leadError || !lead) {
      return new Response(JSON.stringify({ success: false, error: 'Lead non trovato' }), { status: 404, headers: corsHeaders });
    }

    // 2. Prompt to GPT
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) throw new Error('OpenAI API key non configurata');

    const prompt = `
Hai a disposizione i dati di questo lead:

- Nome: ${lead.nome}
- Email: ${lead.email}
- Servizio: ${lead.servizio}
- Bio: ${lead.bio || 'Non fornita'}

Crea una proposta funnel di vendita su misura per lui. Restituisci una struttura oggetto JSON di questo tipo:

{
  "funnel_name": "Nome creativo suggerito per il funnel",
  "funnel_descrizione": "Descrizione riassuntiva del funnel suggerito",
  "steps": [
    { "step_type": "landing_page", "title": "...", "description": "...", "content": { "headline": "...", "cta": "..."} },
    { "step_type": "opt_in", ... },
    ...
  ]
}

Usa come tipi di step: landing_page, opt_in, sales_page, checkout, thank_you, upsell, downsell, email_sequence, webinar, survey.
Restituisci solo l'oggetto JSON richiesto, senza testo aggiuntivo.
`;

    const aiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: "Rispondi sempre in formato JSON come richiesto dall'utente" },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1200
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      throw new Error(`Errore OpenAI: ${errText}`);
    }
    const gptRaw = await aiResp.json();
    let funnelAI;
    try {
      funnelAI = JSON.parse(gptRaw.choices[0].message.content);
    } catch (_) {
      return new Response(JSON.stringify({ success: false, error: "Impossibile estrarre funnel da risposta GPT" }), { status: 500, headers: corsHeaders });
    }

    // 3. Create funnel
    const userId = lead.created_by || lead.user_id || null; // fallback
    if (!userId) throw new Error('Missing user id per assegnazione funnel');
    const { data: funnelResult, error: funnelErr } = await supabase
      .from('funnels')
      .insert({
        name: funnelAI.funnel_name || `Funnel Lead ${lead.nome}`,
        description: funnelAI.funnel_descrizione || '',
        lead_id: leadId,
        created_by: userId,
        status: 'draft'
      })
      .select()
      .single();

    if (funnelErr) {
      return new Response(JSON.stringify({ success: false, error: funnelErr.message }), { status: 500, headers: corsHeaders });
    }

    // 4. Insert funnel steps
    if (funnelAI.steps && Array.isArray(funnelAI.steps)) {
      const steps = funnelAI.steps.map((step: any, idx: number) => ({
        funnel_id: funnelResult.id,
        step_number: idx + 1,
        step_type: step.step_type,
        title: step.title,
        description: step.description || null,
        content: step.content || null
      }));
      const { error: stepsError } = await supabase.from('funnel_steps').insert(steps);
      if (stepsError) {
        return new Response(JSON.stringify({ success: false, error: stepsError.message, funnelId: funnelResult.id }), { status: 500, headers: corsHeaders });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      funnelId: funnelResult.id,
      message: 'Funnel generato e salvato con successo'
    }), { status: 200, headers: corsHeaders });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: corsHeaders });
  }
});
