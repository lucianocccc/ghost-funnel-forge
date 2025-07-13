
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
    const { productAnalysis, interviewData, userId, generateVisuals = true, optimizeForConversion = true } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key non configurata');
    }

    console.log('Generazione funnel cinematico per prodotto specifico...');

    // Sistema di prompt per generare funnel cinematico ottimizzato
    const funnelGenerationPrompt = `Sei un AI Cinematic Funnel Designer esperto.
    Crea un funnel cinematico SPECIFICO e OTTIMIZZATO per questo prodotto:

    ANALISI PRODOTTO:
    ${JSON.stringify(productAnalysis, null, 2)}

    DATI INTERVISTA:
    ${JSON.stringify(interviewData.productData, null, 2)}

    OBIETTIVO: Genera un funnel cinematico completo che:
    1. Catturi l'attenzione con un hero cinematico
    2. Comunichi il valore unico del prodotto
    3. Addressing pain points specifici del target
    4. Includa social proof rilevante
    5. Converta con CTA ottimizzate

    STRUTTURA RICHIESTA (JSON):
    {
      "id": "funnel-id-generato",
      "name": "Nome funnel specifico per il prodotto",
      "description": "Descrizione funnel ottimizzata",
      "advanced_funnel_data": {
        "heroSection": {
          "headline": "Headline potente e specifica",
          "subheadline": "Sottotitolo che rinforza il valore",
          "animation": "fade-in-up",
          "backgroundGradient": "Gradiente appropriato al brand",
          "ctaText": "CTA action-oriented",
          "ctaStyle": "primary",
          "urgencyText": "Elemento di urgency se appropriato"
        },
        "visualTheme": {
          "primaryColor": "Colore primario del brand",
          "secondaryColor": "Colore secondario complementare", 
          "accentColor": "Colore accent per CTA",
          "backgroundColor": "Colore di sfondo",
          "textColor": "Colore testo principale",
          "fontPrimary": "Font primario moderno",
          "fontSecondary": "Font secondario",
          "borderRadius": "Radius appropriato",
          "spacing": "Spaziatura ottimale"
        },
        "productBenefits": [
          {
            "title": "Beneficio 1 specifico",
            "description": "Descrizione dettagliata del beneficio",
            "icon": "icona-appropriata",
            "animation": "fade-in",
            "highlight": true,
            "statistic": "Stat supportiva se disponibile"
          }
        ],
        "socialProof": {
          "testimonials": [
            {
              "name": "Nome testimone",
              "text": "Testimonial specifico e credibile",
              "rating": 5,
              "role": "Ruolo del testimone",
              "verified": true
            }
          ],
          "trustIndicators": ["Indicatori di fiducia rilevanti"],
          "statistics": [
            {
              "number": "Numero significativo",
              "label": "Label della statistica",
              "icon": "icona"
            }
          ]
        },
        "interactiveDemo": {
          "type": "preview",
          "title": "Titolo demo coinvolgente",
          "description": "Descrizione che invita all'azione",
          "content": "Contenuto demo"
        },
        "conversionForm": {
          "title": "Titolo form convertente",
          "description": "Descrizione che motiva alla compilazione",
          "steps": [
            {
              "title": "Step title",
              "fields": [
                {
                  "name": "nome",
                  "label": "Nome",
                  "type": "text",
                  "placeholder": "Il tuo nome",
                  "required": true
                },
                {
                  "name": "email",
                  "label": "Email",
                  "type": "email", 
                  "placeholder": "La tua email",
                  "required": true
                }
              ]
            }
          ],
          "submitText": "CTA finale ottimizzata",
          "incentive": "Incentivo alla conversione",
          "progressBar": true,
          "socialProofInline": "Social proof nel form"
        },
        "advancedFeatures": {
          "personalization": {
            "enabled": true,
            "triggers": ["scroll_depth", "time_on_page"],
            "messages": ["Messaggio personalizzato 1", "Messaggio personalizzato 2"]
          },
          "urgencyMechanics": {
            "type": "limited_time",
            "message": "Messaggio di urgency appropriato",
            "expiresIn": "24 ore"
          },
          "exitIntent": {
            "enabled": true,
            "offer": "Offerta exit intent",
            "discount": "Sconto percentuale"
          }
        }
      },
      "customer_facing": {
        "welcome_title": "Titolo di benvenuto coinvolgente",
        "welcome_description": "Descrizione che cattura l'interesse",
        "completion_message": "Messaggio di completamento motivante"
      },
      "settings": {
        "theme": "cinematic",
        "primaryColor": "#colore-brand",
        "showProgress": true
      },
      "target_audience": "Target audience dal'analisi",
      "industry": "Settore specifico"
    }

    IMPORTANTE:
    - Contenuti SPECIFICI per il prodotto, non generici
    - Copy ottimizzato per il target audience identificato
    - Colori e design in linea con il settore
    - CTA action-oriented e persuasive
    - Social proof credibile e rilevante
    - Form step appropriati al funnel type

    Rispondi SOLO con il JSON del funnel, assicurandoti che sia valido e completo.`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'Sei un funnel designer esperto. Crea sempre contenuti specifici e personalizzati. Rispondi SOLO con JSON valido.' 
          },
          { role: 'user', content: funnelGenerationPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3000
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenAI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let funnelData;

    try {
      const rawContent = aiData.choices[0].message.content;
      console.log('Raw funnel content:', rawContent.substring(0, 300));
      
      // Pulisci il contenuto JSON
      let cleanContent = rawContent.trim();
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
      }
      
      funnelData = JSON.parse(cleanContent);
      console.log('Funnel data parsed successfully');
      
    } catch (parseError) {
      console.error('Error parsing funnel JSON:', parseError);
      
      // Fallback con funnel base ma specifico
      const productName = interviewData.productData?.productName || 'Soluzione Innovativa';
      const targetAudience = productAnalysis?.targetAudience?.primary?.description || 'Professionisti';
      
      funnelData = {
        id: crypto.randomUUID(),
        name: `Funnel Cinematico per ${productName}`,
        description: `Funnel ottimizzato per convertire ${targetAudience} interessati a ${productName}`,
        advanced_funnel_data: {
          heroSection: {
            headline: `Scopri ${productName}`,
            subheadline: `La soluzione che ${targetAudience.toLowerCase()} stavano aspettando`,
            animation: "fade-in-up",
            backgroundGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            ctaText: "Scopri di Più",
            ctaStyle: "primary"
          },
          visualTheme: {
            primaryColor: "#667eea",
            secondaryColor: "#764ba2",
            accentColor: "#f093fb",
            backgroundColor: "#ffffff",
            textColor: "#2d3748",
            fontPrimary: "Inter",
            fontSecondary: "Georgia",
            borderRadius: "12px",
            spacing: "normal"
          },
          productBenefits: [
            {
              title: "Risultati Immediati",
              description: `${productName} ti permette di ottenere risultati concreti fin da subito`,
              icon: "zap",
              animation: "fade-in",
              highlight: true
            },
            {
              title: "Facile da Usare",
              description: "Interfaccia intuitiva progettata per la massima efficienza",
              icon: "heart",
              animation: "fade-in"
            },
            {
              title: "Supporto Completo",
              description: "Team di esperti pronti ad aiutarti in ogni momento",
              icon: "shield",
              animation: "fade-in"
            }
          ],
          socialProof: {
            testimonials: [
              {
                name: "Marco Rossi",
                text: `${productName} ha trasformato il modo in cui lavoriamo. Risultati straordinari!`,
                rating: 5,
                role: "CEO",
                verified: true
              }
            ],
            trustIndicators: ["Oltre 1000+ clienti soddisfatti", "Garanzia soddisfatti o rimborsati"],
            statistics: [
              {
                number: "98%",
                label: "Clienti Soddisfatti",
                icon: "heart"
              }
            ]
          },
          conversionForm: {
            title: "Inizia Subito",
            description: "Compila il form per ricevere accesso immediato",
            steps: [
              {
                title: "I tuoi dati",
                fields: [
                  {
                    name: "nome",
                    label: "Nome e Cognome",
                    type: "text",
                    placeholder: "Il tuo nome completo",
                    required: true
                  },
                  {
                    name: "email",
                    label: "Email",
                    type: "email",
                    placeholder: "La tua email",
                    required: true
                  }
                ]
              }
            ],
            submitText: "Accedi Ora",
            incentive: "Accesso immediato e gratuito",
            progressBar: true
          }
        },
        customer_facing: {
          welcome_title: `Benvenuto nel futuro con ${productName}`,
          welcome_description: `Scopri come ${productName} può rivoluzionare il tuo business`,
          completion_message: "Perfetto! Ti contatteremo presto con tutte le informazioni"
        },
        settings: {
          theme: "cinematic",
          primaryColor: "#667eea",
          showProgress: true
        },
        target_audience: targetAudience,
        industry: interviewData.productData?.category || 'Business'
      };
    }

    // Genera token di condivisione
    const shareToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0')).join('');

    funnelData.share_token = shareToken;

    // Salva il funnel nel database
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    try {
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
        console.error('Database save error:', funnelError);
      } else {
        funnelData.id = funnelResult.id;
        console.log('Funnel saved with ID:', funnelResult.id);
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
    }

    return new Response(JSON.stringify({
      success: true,
      funnel: funnelData,
      generatedAt: new Date().toISOString(),
      optimizations: {
        conversionOptimized: optimizeForConversion,
        visualsGenerated: generateVisuals,
        productSpecific: true
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error generating cinematic product funnel:', error);
    
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
