
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

    // Enhanced prompt per funnel personalizzati e consultivi
    const systemPrompt = `Sei un esperto di marketing conversazionale e funnel personalizzati. 
    Il tuo obiettivo è creare funnel che si adattano perfettamente al business specifico dell'utente.
    
    APPROCCIO:
    - Comprendi profondamente il business dell'utente
    - Crea contenuti specifici e non generici
    - Focalizzati su benefici concreti e misurabili
    - Usa un linguaggio consultivo, non venditive
    - Adatta ogni sezione al target specifico
    
    IMPORTANTE: 
    - Evita frasi generiche come "la migliore soluzione"
    - Usa metriche concrete quando possibile
    - Fai domande specifiche nel form
    - Crea urgenza naturale, non artificiale
    
    Restituisci SOLO un oggetto JSON valido con la struttura richiesta, includendo SEMPRE la sezione "personalizedSections" con contenuti specifici per ogni area del funnel.`;

    console.log('Chiamata OpenAI per generazione funnel personalizzato...');
    
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
          { role: 'user', content: `Crea un funnel personalizzato per: ${prompt}` }
        ],
        temperature: 0.7,
        max_tokens: 3000
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
      
      // Fallback con contenuto base ma personalizzabile
      funnelData = {
        name: `Funnel Personalizzato per ${prompt.substring(0, 50)}`,
        description: `Funnel consultivo per ${prompt}`,
        steps: [
          {
            step_order: 1,
            step_type: "form",
            title: "Parliamo delle tue esigenze",
            description: "Compila il form per ricevere una consulenza personalizzata",
            fields_config: [
              {type: "text", name: "nome", label: "Nome", required: true, placeholder: "Il tuo nome"},
              {type: "email", name: "email", label: "Email", required: true, placeholder: "La tua email"},
              {type: "tel", name: "telefono", label: "Telefono", required: false, placeholder: "Il tuo numero di telefono"},
              {type: "select", name: "esigenza", label: "Qual è la tua esigenza principale?", required: true, options: ["Crescita business", "Ottimizzazione processi", "Formazione team", "Altro"]},
              {type: "textarea", name: "dettagli", label: "Descrivici la tua situazione attuale", required: false, placeholder: "Raccontaci di più delle tue sfide e obiettivi..."}
            ],
            settings: {
              submitButtonText: "Richiedi Consulenza Gratuita",
              description: "Ti contatteremo entro 24 ore per una consulenza personalizzata"
            }
          }
        ],
        settings: {
          productSpecific: true,
          focusType: "consultative",
          product_name: prompt.substring(0, 50),
          personalizedSections: {
            hero: {
              title: `Scopri come migliorare ${prompt}`,
              subtitle: "Soluzioni personalizzate per il tuo business",
              value_proposition: `Ti aiutiamo a ottenere risultati concreti con ${prompt}`,
              cta_text: "Richiedi Consulenza Gratuita"
            },
            attraction: {
              main_headline: "Perché Scegliere i Nostri Servizi?",
              benefits: [
                {title: "Approccio Personalizzato", description: "Ogni soluzione è studiata su misura per te", icon_name: "target"},
                {title: "Risultati Misurabili", description: "Monitoriamo i progressi insieme a te", icon_name: "trending-up"},
                {title: "Supporto Continuo", description: "Ti accompagniamo in ogni fase del processo", icon_name: "heart"},
                {title: "Esperienza Comprovata", description: "Anni di esperienza nel settore", icon_name: "shield"}
              ],
              social_proof: {
                stats: [
                  {number: "100+", label: "Clienti Soddisfatti"},
                  {number: "95%", label: "Tasso di Successo"},
                  {number: "5★", label: "Rating Medio"}
                ],
                testimonial: "Grazie al loro aiuto abbiamo migliorato significativamente i nostri risultati"
              }
            },
            urgency: {
              main_title: "Non Perdere Questa Opportunità",
              subtitle: "Il momento giusto per agire è adesso",
              urgency_reasons: [
                {title: "Posti Limitati", description: "Accettiamo solo un numero limitato di nuovi clienti", icon_name: "users"},
                {title: "Consulenza Gratuita", description: "Per tempo limitato, la prima consulenza è gratuita", icon_name: "gift"}
              ],
              cta_text: "Prenota Ora la Tua Consulenza",
              warning_text: "Non lasciare che i tuoi concorrenti ti superino"
            },
            benefits: {
              section_title: "Cosa Otterrai Lavorando con Noi",
              main_benefits: [
                {title: "Strategia Personalizzata", description: "Un piano d'azione specifico per la tua situazione", highlight: "Su Misura", icon_name: "target"},
                {title: "Implementazione Guidata", description: "Ti seguiamo passo passo nell'implementazione", highlight: "Supporto 24/7", icon_name: "users"},
                {title: "Risultati Garantiti", description: "Se non sei soddisfatto, ti rimborsiamo", highlight: "Garanzia 100%", icon_name: "shield"}
              ],
              bonus_list: [
                "✅ Analisi gratuita della situazione attuale",
                "✅ Piano d'azione dettagliato personalizzato",
                "✅ Supporto via email per 30 giorni",
                "✅ Accesso a risorse esclusive",
                "✅ Sessioni di follow-up incluse",
                "✅ Garanzia soddisfatti o rimborsati"
              ],
              total_value: "€2.500",
              testimonial: {
                text: "Il loro approccio professionale e personalizzato ha fatto la differenza per il nostro business",
                author: "Marco R., Imprenditore"
              }
            }
          },
          customer_facing: {
            hero_title: `Trasforma il tuo ${prompt}`,
            hero_subtitle: "Soluzioni professionali per risultati concreti",
            value_proposition: "Ti aiutiamo a raggiungere i tuoi obiettivi con un approccio personalizzato",
            style_theme: "consultative"
          }
        }
      };
    }

    // Crea il funnel nel database se saveToLibrary è true
    if (saveToLibrary) {
      console.log('Salvataggio funnel personalizzato nella libreria...');
      
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

      console.log('Funnel personalizzato salvato con ID:', funnelResult.id);

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
        message: 'Funnel personalizzato generato e salvato con successo'
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
