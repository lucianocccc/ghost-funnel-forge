
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  console.log('=== GENERATE FUNNEL AI FUNCTION STARTED ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body parsed:', requestBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid JSON in request body" 
      }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    const { leadId } = requestBody;
    console.log('Extracted leadId:', leadId);

    if (!leadId) {
      console.error('Missing leadId in request');
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Missing leadId" 
      }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Init Supabase server client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Supabase URL exists:', !!supabaseUrl);
    console.log('Supabase Key exists:', !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Configurazione Supabase mancante' 
      }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client created');

    // 1. Fetch Lead
    console.log('Fetching lead with ID:', leadId);
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError) {
      console.error('Lead fetch error:', leadError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Errore nel recupero lead: ${leadError.message}` 
      }), { 
        status: 404, 
        headers: corsHeaders 
      });
    }

    if (!lead) {
      console.error('Lead not found');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Lead non trovato' 
      }), { 
        status: 404, 
        headers: corsHeaders 
      });
    }

    console.log('Lead found:', { nome: lead.nome, email: lead.email });

    // 2. Check OpenAI API Key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('OpenAI API key exists:', !!openAIApiKey);
    
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

    // 3. Prepare prompt for GPT
    const prompt = `
Crea una proposta funnel di vendita per questo lead:

- Nome: ${lead.nome || 'Non fornito'}
- Email: ${lead.email || 'Non fornita'}
- Servizio: ${lead.servizio || 'Non specificato'}
- Bio: ${lead.bio || 'Non fornita'}

Restituisci SOLO un oggetto JSON valido con questa struttura esatta:

{
  "funnel_name": "Nome del funnel",
  "funnel_descrizione": "Breve descrizione",
  "steps": [
    {
      "step_type": "landing_page",
      "title": "Titolo step",
      "description": "Descrizione",
      "content": {
        "headline": "Titolo principale",
        "cta": "Call to action"
      }
    }
  ]
}

Tipi di step disponibili: landing_page, opt_in, sales_page, checkout, thank_you, upsell, downsell, email_sequence, webinar, survey.
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
          { 
            role: 'system', 
            content: "Sei un esperto di marketing digitale. Rispondi SEMPRE con un oggetto JSON valido, senza testo aggiuntivo, markdown o commenti." 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    console.log('OpenAI response status:', aiResp.status);

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error('OpenAI API error:', errText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Errore OpenAI (${aiResp.status}): ${errText}` 
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
      
      // Clean JSON content
      let cleanContent = content.trim();
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      cleanContent = cleanContent.replace(/```/g, '');
      
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
      }
      
      console.log('Cleaned content for parsing:', cleanContent);
      
      funnelAI = JSON.parse(cleanContent);
      console.log('Parsed funnel AI successfully:', funnelAI);
      
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', gptRaw.choices[0]?.message?.content);
      
      // Create fallback funnel
      funnelAI = {
        funnel_name: `Funnel per ${lead.nome || 'Lead'}`,
        funnel_descrizione: `Funnel personalizzato per ${lead.servizio || 'il servizio richiesto'}`,
        steps: [
          {
            step_type: 'landing_page',
            title: 'Pagina di Atterraggio',
            description: 'Prima impressione e cattura attenzione',
            content: {
              headline: `Scopri ${lead.servizio || 'i nostri servizi'}`,
              cta: 'Scopri di più'
            }
          },
          {
            step_type: 'opt_in',
            title: 'Raccolta Contatti',
            description: 'Acquisizione lead qualificati',
            content: {}
          },
          {
            step_type: 'sales_page',
            title: 'Pagina di Vendita',
            description: 'Presentazione offerta',
            content: {}
          }
        ]
      };
      console.log('Using fallback funnel:', funnelAI);
    }

    // 4. Get user for funnel creation
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      try {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        userId = user?.id;
        console.log('Authenticated user ID:', userId);
      } catch (authError) {
        console.error('Auth error:', authError);
      }
    }
    
    if (!userId) {
      // Fallback: find an admin user
      console.log('No authenticated user, looking for admin...');
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_admin', true)
        .limit(1);
      
      if (profiles && profiles.length > 0) {
        userId = profiles[0].id;
        console.log('Using admin user ID:', userId);
      } else {
        console.error('No admin user found');
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Impossibile determinare l\'utente per la creazione del funnel' 
        }), { 
          status: 500, 
          headers: corsHeaders 
        });
      }
    }

    // 5. Create funnel
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
        error: `Errore creazione funnel: ${funnelErr.message}` 
      }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    console.log('Funnel created with ID:', funnelResult.id);

    // 6. Insert funnel steps
    if (funnelAI.steps && Array.isArray(funnelAI.steps)) {
      console.log('Creating funnel steps...');
      const steps = funnelAI.steps.map((step: any, idx: number) => ({
        funnel_id: funnelResult.id,
        step_number: idx + 1,
        step_type: step.step_type,
        title: step.title,
        description: step.description || null,
        content: step.content || null
      }));

      const { error: stepsError } = await supabase
        .from('funnel_steps')
        .insert(steps);

      if (stepsError) {
        console.error('Steps creation error:', stepsError);
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Errore creazione steps: ${stepsError.message}`, 
          funnelId: funnelResult.id 
        }), { 
          status: 500, 
          headers: corsHeaders 
        });
      }

      console.log('Funnel steps created successfully');
    }

    console.log('=== FUNNEL GENERATION COMPLETED SUCCESSFULLY ===');
    return new Response(JSON.stringify({ 
      success: true,
      funnelId: funnelResult.id,
      message: 'Funnel generato e salvato con successo'
    }), { 
      status: 200, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('=== GENERAL ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Errore generale: ${error.message}` 
    }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
