
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

    // Enhanced prompt for product-specific landing pages
    const systemPrompt = `Sei un esperto di marketing digitale e product landing pages. 
    Crea una landing page prodotto-specifica VISUALMENTE ACCATTIVANTE basata sulla descrizione dell'utente.
    
    IMPORTANTE: 
    - Genera contenuti SPECIFICI per il prodotto/servizio menzionato
    - Includi elementi visivi e di design (colori, stili, icone)
    - Crea copy persuasivo e magnetico
    - Focalizzati sulla conversione e lead generation
    - Usa terminologia appropriata al settore
    
    Restituisci SOLO un oggetto JSON valido con questa struttura:
    {
      "name": "Landing Page per [Prodotto Specifico]",
      "description": "Descrizione accattivante del prodotto",
      "steps": [
        {
          "step_order": 1,
          "step_type": "form",
          "title": "Richiedi Informazioni",
          "description": "Form principale per lead generation",
          "fields_config": [
            {"type": "text", "name": "nome", "label": "Nome", "required": true, "placeholder": "Il tuo nome"},
            {"type": "email", "name": "email", "label": "Email", "required": true, "placeholder": "La tua email"},
            {"type": "tel", "name": "telefono", "label": "Telefono", "required": false, "placeholder": "Il tuo numero di telefono"},
            {"type": "select", "name": "interesse", "label": "Cosa ti interessa di più?", "required": true, "options": ["Opzione 1", "Opzione 2", "Opzione 3"]},
            {"type": "textarea", "name": "messaggio", "label": "Descrivici le tue esigenze", "required": false, "placeholder": "Raccontaci di cosa hai bisogno..."}
          ],
          "settings": {
            "submitButtonText": "Richiedi Proposta Gratuita",
            "description": "Compila il form per ricevere una proposta personalizzata entro 24 ore"
          }
        }
      ],
      "settings": {
        "productSpecific": true,
        "focusType": "product-centric",
        "product_name": "Nome del Prodotto/Servizio",
        "magneticElements": {
          "primaryHook": "Gancio principale magnetico",
          "valueProposition": "Proposta di valore unica",
          "urgencyTrigger": "Elemento di urgenza",
          "socialProof": "Testimonianza o prova sociale",
          "primaryColor": "#D4AF37"
        },
        "customer_facing": {
          "hero_title": "Titolo hero accattivante",
          "hero_subtitle": "Sottotitolo che spiega il valore",
          "value_proposition": "Proposta di valore dettagliata",
          "style_theme": "modern",
          "brand_colors": {
            "primary": "#D4AF37",
            "secondary": "#2563EB",
            "accent": "#7C3AED"
          }
        }
      }
    }`;

    console.log('Chiamata OpenAI per generazione landing page prodotto-specifica...');
    
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
          { role: 'user', content: `Crea una landing page prodotto-specifica per: ${prompt}` }
        ],
        temperature: 0.7,
        max_tokens: 2500
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
      
      // Fallback con contenuto prodotto-specifico
      funnelData = {
        name: `Landing Page per ${prompt.substring(0, 50)}`,
        description: `Landing page professionale per ${prompt}`,
        steps: [
          {
            step_order: 1,
            step_type: "form",
            title: "Richiedi Informazioni",
            description: "Form principale per lead generation",
            fields_config: [
              {type: "text", name: "nome", label: "Nome", required: true, placeholder: "Il tuo nome"},
              {type: "email", name: "email", label: "Email", required: true, placeholder: "La tua email"},
              {type: "tel", name: "telefono", label: "Telefono", required: false, placeholder: "Il tuo numero di telefono"},
              {type: "textarea", name: "messaggio", label: "Descrivici le tue esigenze", required: false, placeholder: "Raccontaci di cosa hai bisogno..."}
            ],
            settings: {
              submitButtonText: "Richiedi Proposta Gratuita",
              description: "Compila il form per ricevere una proposta personalizzata entro 24 ore"
            }
          }
        ],
        settings: {
          productSpecific: true,
          focusType: "product-centric",
          product_name: prompt.substring(0, 50),
          magneticElements: {
            primaryHook: `Scopri ${prompt}`,
            valueProposition: `La soluzione professionale per ${prompt}`,
            urgencyTrigger: "Offerta limitata - Richiedi subito",
            socialProof: "Centinaia di clienti soddisfatti",
            primaryColor: "#D4AF37"
          },
          customer_facing: {
            hero_title: `La Soluzione Professionale per ${prompt}`,
            hero_subtitle: "Servizio di qualità, risultati garantiti",
            value_proposition: `Offriamo soluzioni su misura per ${prompt}`,
            style_theme: "modern"
          }
        }
      };
    }

    // Crea il funnel nel database se saveToLibrary è true
    if (saveToLibrary) {
      console.log('Salvataggio landing page nella libreria...');
      
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

      console.log('Landing page salvata con ID:', funnelResult.id);

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
        message: 'Landing page generata e salvata con successo'
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else {
      // Restituisci solo i dati senza salvare
      const shareToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');

      const responseData = {
        id: shareToken,
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
