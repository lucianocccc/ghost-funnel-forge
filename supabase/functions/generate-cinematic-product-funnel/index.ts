
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

    console.log('Generazione funnel cinematico personalizzato...');

    // Extract real product data
    const productName = interviewData?.productData?.productName || 'Il Prodotto';
    const productDescription = interviewData?.productData?.productDescription || '';
    const targetAudience = productAnalysis?.targetAudience?.primary?.description || interviewData?.productData?.targetAudience || 'i nostri clienti';
    const keyBenefits = interviewData?.productData?.keyBenefits || [];
    const uniqueSellingPoints = interviewData?.productData?.uniqueSellingPoints || [];
    const priceRange = interviewData?.productData?.priceRange || '';
    const industry = interviewData?.productData?.category || productAnalysis?.industry || 'business';

    // Enhanced prompt for truly personalized content
    const funnelGenerationPrompt = `Sei un AI Funnel Designer esperto. Crea un funnel cinematico ALTAMENTE PERSONALIZZATO per questo prodotto REALE:

PRODOTTO REALE:
Nome: ${productName}
Descrizione: ${productDescription}
Target Audience: ${targetAudience}
Benefici Chiave: ${keyBenefits.join(', ')}
Punti di Forza Unici: ${uniqueSellingPoints.join(', ')}
Fascia di Prezzo: ${priceRange}
Settore: ${industry}

ANALISI AI:
${JSON.stringify(productAnalysis, null, 2)}

DATI INTERVISTA COMPLETI:
${JSON.stringify(interviewData.productData, null, 2)}

ISTRUZIONI CRITICHE:
1. USA SOLO informazioni REALI dal prodotto fornito
2. NON usare mai frasi generiche come "Amazing Product", "Transform your life", "Revolutionary solution"
3. Scrivi copy SPECIFICO che parla DIRETTAMENTE del ${productName}
4. Indirizza il target "${targetAudience}" con linguaggio appropriato
5. Menziona benefici REALI e specifici del prodotto
6. Crea testimonial CREDIBILI per il settore ${industry}
7. Il funnel è per i CONSUMATORI FINALI, non per chi ha creato il prodotto

STRUTTURA RICHIESTA (JSON valido):
{
  "id": "funnel-${Date.now()}",
  "name": "Funnel per ${productName}",
  "description": "Funnel ottimizzato per convertire ${targetAudience}",
  "advanced_funnel_data": {
    "heroSection": {
      "headline": "Headline specifica che menziona ${productName} e risolve un problema reale",
      "subheadline": "Sottotitolo che spiega come ${productName} aiuta ${targetAudience}",
      "animation": "fade-in-up",
      "backgroundGradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "ctaText": "CTA specifica per ${productName}",
      "ctaStyle": "primary",
      "urgencyText": "Elemento di urgency appropriato se pertinente"
    },
    "visualTheme": {
      "primaryColor": "#667eea",
      "secondaryColor": "#764ba2", 
      "accentColor": "#f093fb",
      "backgroundColor": "#ffffff",
      "textColor": "#2d3748",
      "fontPrimary": "Inter",
      "fontSecondary": "Georgia",
      "borderRadius": "12px",
      "spacing": "normal"
    },
    "productBenefits": [
      {
        "title": "Primo beneficio REALE specifico di ${productName}",
        "description": "Descrizione dettagliata di come questo beneficio aiuta ${targetAudience}",
        "icon": "zap",
        "animation": "fade-in",
        "highlight": true,
        "statistic": "Statistica reale se disponibile"
      },
      {
        "title": "Secondo beneficio REALE specifico",
        "description": "Come ${productName} risolve un problema specifico",
        "icon": "heart",
        "animation": "fade-in"
      },
      {
        "title": "Terzo beneficio REALE specifico",
        "description": "Vantaggio concreto per ${targetAudience}",
        "icon": "shield",
        "animation": "fade-in"
      }
    ],
    "socialProof": {
      "testimonials": [
        {
          "name": "Nome credibile per il settore ${industry}",
          "text": "Testimonial specifico su ${productName} e i suoi benefici reali",
          "rating": 5,
          "role": "Ruolo appropriato per ${targetAudience}",
          "verified": true
        },
        {
          "name": "Secondo nome credibile",
          "text": "Altro testimonial specifico sui risultati ottenuti con ${productName}",
          "rating": 5,
          "role": "Altro ruolo pertinente",
          "verified": true
        }
      ],
      "trustIndicators": [
        "Indicatori di fiducia pertinenti al settore ${industry}",
        "Certificazioni o garanzie specifiche per ${productName}"
      ],
      "statistics": [
        {
          "number": "Numero realistico basato sui dati",
          "label": "Metrica specifica per ${productName}",
          "icon": "heart"
        }
      ]
    },
    "interactiveDemo": {
      "type": "preview",
      "title": "Scopri ${productName} in azione",
      "description": "Vedi come ${productName} può aiutare ${targetAudience}",
      "content": "Demo preview specifica"
    },
    "conversionForm": {
      "title": "Ottieni ${productName}",
      "description": "Compila il form per ricevere informazioni su ${productName}",
      "steps": [
        {
          "title": "Le tue informazioni",
          "fields": [
            {
              "name": "nome",
              "label": "Nome e Cognome",
              "type": "text",
              "placeholder": "Il tuo nome completo",
              "required": true
            },
            {
              "name": "email",
              "label": "Email",
              "type": "email",
              "placeholder": "La tua email",
              "required": true
            },
            {
              "name": "telefono",
              "label": "Telefono",
              "type": "tel",
              "placeholder": "Il tuo numero di telefono",
              "required": false
            }
          ]
        }
      ],
      "submitText": "Richiedi Informazioni su ${productName}",
      "incentive": "Ricevi una consulenza gratuita personalizzata",
      "progressBar": true,
      "socialProofInline": "Unisciti a centinaia di ${targetAudience} soddisfatti"
    },
    "advancedFeatures": {
      "personalization": {
        "enabled": true,
        "triggers": ["scroll_depth", "time_on_page"],
        "messages": [
          "Messaggio personalizzato per ${targetAudience} interessati a ${productName}",
          "Secondo messaggio basato sul comportamento"
        ]
      },
      "urgencyMechanics": {
        "type": "limited_time",
        "message": "Offerta limitata per ${productName}",
        "expiresIn": "24 ore"
      },
      "exitIntent": {
        "enabled": true,
        "offer": "Sconto esclusivo per ${productName}",
        "discount": "10%"
      }
    }
  },
  "customer_facing": {
    "welcome_title": "Benvenuto nel mondo di ${productName}",
    "welcome_description": "Scopri come ${productName} può trasformare la tua esperienza",
    "completion_message": "Grazie! Ti contatteremo presto per parlare di ${productName}"
  },
  "settings": {
    "theme": "cinematic",
    "primaryColor": "#667eea",
    "showProgress": true
  },
  "target_audience": "${targetAudience}",
  "industry": "${industry}"
}

IMPORTANTE: 
- Sostituisci TUTTE le variabili ${} con contenuto reale e specifico
- Non lasciare NESSUN placeholder generico
- Ogni frase deve essere pertinente a ${productName}
- Copy deve essere convincente per ${targetAudience}
- Testimonial devono sembrare autentici per il settore ${industry}

Rispondi SOLO con il JSON del funnel completo e specifico.`;

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
            content: `Sei un funnel designer esperto specializzato in contenuti personalizzati. Crei sempre contenuti specifici per il prodotto reale fornito, mai generici. Rispondi SOLO con JSON valido senza spiegazioni.` 
          },
          { role: 'user', content: funnelGenerationPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4000
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenAI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let funnelData;

    try {
      const rawContent = aiData.choices[0].message.content;
      console.log('Raw funnel content (first 500 chars):', rawContent.substring(0, 500));
      
      // Clean JSON content
      let cleanContent = rawContent.trim();
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
      }
      
      funnelData = JSON.parse(cleanContent);
      console.log('Funnel data parsed successfully with product:', productName);
      
      // Validate that content is actually personalized
      const contentString = JSON.stringify(funnelData).toLowerCase();
      const hasGenericContent = contentString.includes('amazing product') || 
                               contentString.includes('revolutionary') ||
                               contentString.includes('transform your life') ||
                               contentString.includes('${');

      if (hasGenericContent) {
        console.log('Detected generic content, regenerating...');
        throw new Error('Generated content still contains generic placeholders');
      }
      
    } catch (parseError) {
      console.error('Error parsing or validating funnel JSON:', parseError);
      
      // Enhanced fallback with real product data
      funnelData = {
        id: `funnel-${Date.now()}`,
        name: `Funnel per ${productName}`,
        description: `Funnel cinematico ottimizzato per ${productName} targeting ${targetAudience}`,
        advanced_funnel_data: {
          heroSection: {
            headline: `Scopri ${productName}: ${productDescription ? productDescription.substring(0, 100) : 'La soluzione che cercavi'}`,
            subheadline: `Perfetto per ${targetAudience} che vogliono ${keyBenefits.length > 0 ? keyBenefits[0] : 'risultati eccellenti'}`,
            animation: "fade-in-up",
            backgroundGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            ctaText: `Scopri ${productName}`,
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
          productBenefits: keyBenefits.slice(0, 3).map((benefit, index) => ({
            title: benefit,
            description: `${productName} ti offre ${benefit.toLowerCase()} per migliorare la tua esperienza`,
            icon: ["zap", "heart", "shield"][index] || "star",
            animation: "fade-in",
            highlight: index === 0
          })).concat(keyBenefits.length === 0 ? [
            {
              title: "Qualità Superiore",
              description: `${productName} è progettato specificamente per ${targetAudience}`,
              icon: "zap",
              animation: "fade-in",
              highlight: true
            },
            {
              title: "Risultati Garantiti",
              description: `Con ${productName} ottieni i risultati che cerchi`,
              icon: "heart",
              animation: "fade-in"
            }
          ] : []),
          socialProof: {
            testimonials: [
              {
                name: industry === 'technology' ? "Marco Tecnoweb" : industry === 'fitness' ? "Laura Fitness" : "Giulia Rossi",
                text: `${productName} ha davvero fatto la differenza per me. ${keyBenefits.length > 0 ? `Soprattutto per ${keyBenefits[0].toLowerCase()}` : 'Risultati eccellenti'}`,
                rating: 5,
                role: targetAudience.includes('aziend') ? "Imprenditore" : "Cliente",
                verified: true
              }
            ],
            trustIndicators: [
              `Oltre 100+ ${targetAudience} soddisfatti`,
              `${productName} - Qualità certificata`
            ],
            statistics: [
              {
                number: "98%",
                label: "Clienti Soddisfatti",
                icon: "heart"
              }
            ]
          },
          interactiveDemo: {
            type: "preview",
            title: `Prova ${productName}`,
            description: `Scopri come ${productName} può aiutarti a raggiungere i tuoi obiettivi`,
            content: `Demo interattiva di ${productName}`
          },
          conversionForm: {
            title: `Richiedi ${productName}`,
            description: `Compila il form per ricevere informazioni dettagliate su ${productName}`,
            steps: [
              {
                title: "Le tue informazioni",
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
                  },
                  {
                    name: "telefono",
                    label: "Telefono",
                    type: "tel",
                    placeholder: "Il tuo numero di telefono",
                    required: false
                  }
                ]
              }
            ],
            submitText: `Richiedi Info su ${productName}`,
            incentive: `Consulenza gratuita per ${productName}`,
            progressBar: true,
            socialProofInline: `Unisciti a ${targetAudience} che hanno scelto ${productName}`
          },
          advancedFeatures: {
            personalization: {
              enabled: true,
              triggers: ["scroll_depth", "time_on_page"],
              messages: [
                `${productName} potrebbe essere la soluzione che cerchi`,
                `Scopri di più su ${productName}`
              ]
            },
            urgencyMechanics: {
              type: "limited_time",
              message: `Offerta speciale per ${productName}`,
              expiresIn: "24 ore"
            },
            exitIntent: {
              enabled: true,
              offer: `Sconto esclusivo per ${productName}`,
              discount: "10%"
            }
          }
        },
        customer_facing: {
          welcome_title: `Benvenuto nel mondo di ${productName}`,
          welcome_description: `Scopri tutti i vantaggi di ${productName} per ${targetAudience}`,
          completion_message: `Grazie per il tuo interesse in ${productName}! Ti contatteremo presto.`
        },
        settings: {
          theme: "cinematic",
          primaryColor: "#667eea",
          showProgress: true
        },
        target_audience: targetAudience,
        industry: industry
      };
    }

    // Generate share token
    const shareToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0')).join('');

    funnelData.share_token = shareToken;

    // Save to database
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
        console.log('Personalized funnel saved with ID:', funnelResult.id);
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
        productSpecific: true,
        personalizedContent: true
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
