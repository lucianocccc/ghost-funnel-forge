import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== GENERATE INTERACTIVE FUNNEL AI FUNCTION STARTED ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, userId, saveToLibrary = true } = await req.json();
    
    if (!prompt || !userId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Prompt e userId richiesti" 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Inizializza Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configurazione Supabase mancante');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Ottieni la chiave OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key non configurata');
    }

    // Prompt migliorato per generare contenuti specifici e intelligenti
    const systemPrompt = `Sei un esperto di marketing digitale e funnel design. 
    Crea un funnel interattivo SPECIFICO e PERSONALIZZATO basato sul prodotto/servizio descritto dall'utente.
    
    IMPORTANTE: 
    - Genera contenuti SPECIFICI per il prodotto/servizio menzionato, non generici
    - Includi dettagli realistici e pertinenti al settore
    - Crea step che abbiano senso per il business specifico
    - Usa terminologia appropriata al settore
    
    Restituisci SOLO un oggetto JSON valido con questa struttura:
    {
      "name": "Nome specifico del funnel per il prodotto/servizio",
      "description": "Descrizione dettagliata e specifica",
      "steps": [
        {
          "step_order": 1,
          "step_type": "info",
          "title": "Titolo specifico per il prodotto",
          "description": "Descrizione specifica",
          "fields_config": {},
          "settings": {
            "content": "Contenuto HTML specifico per il prodotto/servizio",
            "style": "elegant"
          }
        },
        {
          "step_order": 2,
          "step_type": "form",
          "title": "Raccolta dati specifici",
          "description": "Form personalizzato per il settore",
          "fields_config": {
            "fields": [
              {"type": "text", "name": "nome", "label": "Nome", "required": true},
              {"type": "email", "name": "email", "label": "Email", "required": true},
              {"type": "text", "name": "campo_specifico", "label": "Campo specifico per il settore", "required": false}
            ]
          },
          "settings": {}
        }
      ],
      "settings": {
        "theme": "cinematic",
        "primaryColor": "#D4AF37",
        "showProgress": true
      },
      "customer_facing": {
        "welcome_title": "Titolo di benvenuto specifico",
        "welcome_description": "Descrizione accattivante specifica per il prodotto",
        "completion_message": "Messaggio di completamento personalizzato"
      }
    }
    
    Tipi di step disponibili: info, form, survey, contact`;

    console.log('Chiamata OpenAI per generazione contenuti specifici...');
    
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Crea un funnel interattivo per: ${prompt}` }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenAI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('Risposta OpenAI ricevuta');

    let funnelData;
    try {
      const content = aiData.choices[0].message.content;
      console.log('Contenuto AI grezzo:', content.substring(0, 200));
      
      // Pulisci il contenuto JSON
      let cleanContent = content.trim();
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
      }
      
      funnelData = JSON.parse(cleanContent);
      console.log('Funnel data parsato con successo');
      
    } catch (parseError) {
      console.error('Errore parsing JSON AI:', parseError);
      
      // Fallback con contenuto specifico base
      funnelData = {
        name: `Funnel per ${prompt.substring(0, 50)}`,
        description: `Funnel interattivo personalizzato per: ${prompt}`,
        steps: [
          {
            step_order: 1,
            step_type: "info",
            title: "Benvenuto",
            description: "Introduzione al nostro servizio",
            fields_config: {},
            settings: {
              content: `<h2>Scopri ${prompt}</h2><p>Benvenuto nel nostro funnel personalizzato. Guidarti verso la soluzione perfetta è il nostro obiettivo.</p>`,
              style: "elegant"
            }
          },
          {
            step_order: 2,
            step_type: "form",
            title: "I tuoi dati",
            description: "Condividi le tue informazioni",
            fields_config: {
              fields: [
                {type: "text", name: "nome", label: "Nome", required: true},
                {type: "email", name: "email", label: "Email", required: true},
                {type: "text", name: "interesse", label: "Cosa ti interessa di più?", required: false}
              ]
            },
            settings: {}
          }
        ],
        settings: {
          theme: "cinematic",
          primaryColor: "#D4AF37",
          showProgress: true
        },
        customer_facing: {
          welcome_title: "Scopri le nostre soluzioni",
          welcome_description: `Funnel personalizzato per ${prompt}`,
          completion_message: "Grazie! Ti contatteremo presto."
        }
      };
    }

    // Crea il funnel nel database se saveToLibrary è true
    if (saveToLibrary) {
      console.log('Salvataggio funnel nella libreria...');
      
      // Genera token di condivisione unico
      const shareToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');

      const { data: funnelResult, error: funnelError } = await supabase
        .from('interactive_funnels')
        .insert({
          name: funnelData.name,
          description: funnelData.description,
          created_by: userId,
          share_token: shareToken,
          is_public: true,
          status: 'active',
          settings: funnelData.settings || {}
        })
        .select()
        .single();

      if (funnelError) {
        console.error('Errore creazione funnel:', funnelError);
        throw new Error('Errore nel salvare il funnel');
      }

      console.log('Funnel salvato con ID:', funnelResult.id);

      // Salva gli step del funnel
      if (funnelData.steps && Array.isArray(funnelData.steps)) {
        const stepsToInsert = funnelData.steps.map((step: any) => ({
          funnel_id: funnelResult.id,
          step_order: step.step_order,
          step_type: step.step_type,
          title: step.title,
          description: step.description,
          fields_config: step.fields_config || {},
          settings: step.settings || {}
        }));

        const { error: stepsError } = await supabase
          .from('interactive_funnel_steps')
          .insert(stepsToInsert);

        if (stepsError) {
          console.error('Errore salvataggio step:', stepsError);
          // Non interrompiamo per errori sui step
        } else {
          console.log('Step salvati con successo');
        }
      }

      // Prepara la risposta con i dati del funnel salvato
      const responseData = {
        id: funnelResult.id,
        name: funnelData.name,
        description: funnelData.description,
        share_token: shareToken,
        steps: funnelData.steps || [],
        settings: funnelData.settings || {},
        customer_facing: funnelData.customer_facing || {},
        advanced_funnel_data: funnelData,
        target_audience: prompt.includes('target') ? prompt.split('target')[1] : null,
        industry: prompt.includes('settore') ? prompt.split('settore')[1] : null
      };

      return new Response(JSON.stringify({ 
        success: true,
        funnel: responseData,
        savedToLibrary: true,
        message: 'Funnel generato e salvato con successo'
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else {
      // Restituisci solo i dati senza salvare
      const shareToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');

      const responseData = {
        id: shareToken, // Usa il token come ID temporaneo
        name: funnelData.name,
        description: funnelData.description,
        share_token: shareToken,
        steps: funnelData.steps || [],
        settings: funnelData.settings || {},
        customer_facing: funnelData.customer_facing || {},
        advanced_funnel_data: funnelData
      };

      return new Response(JSON.stringify({ 
        success: true,
        funnel: responseData,
        savedToLibrary: false
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Errore generale:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Errore interno del server',
      details: error.stack
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});