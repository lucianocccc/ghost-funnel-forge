
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
      return new Response(JSON.stringify({ success: false, error: "Missing leadId" }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Init Supabase server client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Fetching lead with ID: ${leadId}`);

    // 1. Fetch Lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      console.error('Lead fetch error:', leadError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Lead non trovato' 
      }), { 
        status: 404, 
        headers: corsHeaders 
      });
    }

    console.log(`Lead found: ${lead.nome}`);

    // 2. Prompt to GPT
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'OpenAI API key non configurata' 
      }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }

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
    { "step_type": "opt_in", "title": "...", "description": "...", "content": {} },
    { "step_type": "sales_page", "title": "...", "description": "...", "content": {} }
  ]
}

Usa come tipi di step: landing_page, opt_in, sales_page, checkout, thank_you, upsell, downsell, email_sequence, webinar, survey.
Restituisci solo l'oggetto JSON richiesto, senza testo aggiuntivo.
`;

    console.log('Calling OpenAI API...');

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
      console.error('OpenAI API error:', errText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Errore OpenAI: ${errText}` 
      }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    const gptRaw = await aiResp.json();
    console.log('OpenAI response received');

    let funnelAI;
    try {
      const content = gptRaw.choices[0].message.content;
      console.log('Raw GPT content:', content);
      
      // Clean the content to extract JSON
      let cleanContent = content.trim();
      
      // Remove markdown code blocks if present
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      funnelAI = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', gptRaw.choices[0].message.content);
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Impossibile estrarre funnel da risposta GPT" 
      }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    console.log('Parsed funnel AI:', funnelAI);

    // 3. Create funnel
    const { data: user } = await supabase.auth.getUser();
    const userId = user?.user?.id || lead.created_by || lead.user_id;
    
    if (!userId) {
      console.error('No user ID found for funnel creation');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing user id per assegnazione funnel' 
      }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    console.log('Creating funnel...');

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
      console.error('Funnel creation error:', funnelErr);
      return new Response(JSON.stringify({ 
        success: false, 
        error: funnelErr.message 
      }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    console.log('Funnel created:', funnelResult.id);

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

      console.log('Inserting funnel steps...');

      const { error: stepsError } = await supabase
        .from('funnel_steps')
        .insert(steps);

      if (stepsError) {
        console.error('Steps creation error:', stepsError);
        return new Response(JSON.stringify({ 
          success: false, 
          error: stepsError.message, 
          funnelId: funnelResult.id 
        }), { 
          status: 500, 
          headers: corsHeaders 
        });
      }

      console.log('Funnel steps created successfully');
    }

    return new Response(JSON.stringify({ 
      success: true,
      funnelId: funnelResult.id,
      message: 'Funnel generato e salvato con successo'
    }), { 
      status: 200, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('General error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
