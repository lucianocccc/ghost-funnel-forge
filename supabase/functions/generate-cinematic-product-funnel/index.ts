
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

    console.log('Generazione funnel cinematico personalizzato per:', interviewData?.productData?.productName);

    // Extract real product data with better fallbacks
    const productName = interviewData?.productData?.productName || 'Il Prodotto';
    const productDescription = interviewData?.productData?.productDescription || '';
    const targetAudience = productAnalysis?.targetAudience?.primary?.description || interviewData?.productData?.targetAudience || 'professionisti';
    const keyBenefits = interviewData?.productData?.keyBenefits || [];
    const uniqueSellingPoints = interviewData?.productData?.uniqueSellingPoints || [];
    const priceRange = interviewData?.productData?.priceRange || '';
    const industry = interviewData?.productData?.category || productAnalysis?.industry || 'business';

    // Comprehensive prompt for truly personalized content
    const funnelGenerationPrompt = `Tu sei un ESPERTO COPYWRITER specializzato in funnel di conversione. Devi creare un funnel COMPLETAMENTE PERSONALIZZATO per questo prodotto REALE:

PRODOTTO SPECIFICO:
Nome: "${productName}"
Descrizione: "${productDescription}"
Target: "${targetAudience}"
Benefici: ${keyBenefits.join(', ')}
USP: ${uniqueSellingPoints.join(', ')}
Prezzo: ${priceRange}
Settore: ${industry}

DATI COMPLETI PRODOTTO:
${JSON.stringify(interviewData?.productData || {}, null, 2)}

ANALISI AI:
${JSON.stringify(productAnalysis || {}, null, 2)}

REGOLE FERREE:
1. OGNI FRASE deve menzionare "${productName}" in modo naturale
2. ZERO frasi generiche o template
3. Copy SPECIFICO per "${targetAudience}" 
4. Benefici REALI del prodotto, non inventati
5. Testimonial CREDIBILI per il settore "${industry}"
6. CTA specifiche per "${productName}"
7. Prezzi e offerte realistiche
8. Colori e styling moderni e accattivanti

Crea questo JSON COMPLETO:

{
  "id": "funnel-${Date.now()}",
  "name": "Funnel Cinematico: ${productName}",
  "description": "Funnel personalizzato per convertire ${targetAudience} interessati a ${productName}",
  "advanced_funnel_data": {
    "heroSection": {
      "headline": "HEADLINE SPECIFICA che menziona ${productName} e risolve un problema reale di ${targetAudience}",
      "subheadline": "Sottotitolo che spiega COME ${productName} aiuta ${targetAudience} con benefici concreti",
      "animation": "fade-in-up",
      "backgroundGradient": "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
      "ctaText": "Scopri ${productName} Ora",
      "ctaStyle": "primary",
      "urgencyText": "Offerta limitata per ${productName}",
      "visualElements": {
        "particles": true,
        "glowEffects": true,
        "colorTheme": "vibrant"
      }
    },
    "visualTheme": {
      "primaryColor": "#6366f1",
      "secondaryColor": "#8b5cf6", 
      "accentColor": "#ec4899",
      "backgroundColor": "#0f0f23",
      "textColor": "#ffffff",
      "cardBackground": "rgba(255, 255, 255, 0.1)",
      "fontPrimary": "Inter",
      "fontSecondary": "Georgia",
      "borderRadius": "16px",
      "spacing": "relaxed",
      "shadows": "dramatic",
      "animations": "smooth"
    },
    "productBenefits": [
      {
        "title": "PRIMO BENEFICIO REALE di ${productName}",
        "description": "Descrizione dettagliata di come ${productName} risolve questo problema specifico per ${targetAudience}. Esempio concreto e risultati misurabili.",
        "icon": "zap",
        "animation": "slide-in-left",
        "highlight": true,
        "statistic": "Numero o percentuale realistica",
        "color": "#6366f1"
      },
      {
        "title": "SECONDO BENEFICIO SPECIFICO",
        "description": "Come ${productName} migliora la vita/lavoro di ${targetAudience} in modo concreto. Evita frasi generiche.",
        "icon": "heart",
        "animation": "slide-in-right",
        "color": "#8b5cf6"
      },
      {
        "title": "TERZO VANTAGGIO UNICO",
        "description": "Il valore distintivo che solo ${productName} può offrire a ${targetAudience}. Differenziazione chiara.",
        "icon": "shield",
        "animation": "fade-in-up",
        "color": "#ec4899"
      }
    ],
    "socialProof": {
      "testimonials": [
        {
          "name": "Nome credibile per ${industry}",
          "text": "Testimonial SPECIFICO su ${productName}: come ha risolto un problema reale, risultati concreti ottenuti, raccomandazione sincera.",
          "rating": 5,
          "role": "Ruolo appropriato per ${targetAudience}",
          "verified": true,
          "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          "company": "Azienda credibile"
        },
        {
          "name": "Secondo testimone credibile",
          "text": "Altra esperienza positiva con ${productName}: benefici ottenuti, tempo di risultati, valore percepito.",
          "rating": 5,
          "role": "Altro ruolo pertinente",
          "verified": true,
          "avatar": "https://images.unsplash.com/photo-1494790108755-2616b36d6de0?w=150&h=150&fit=crop&crop=face",
          "company": "Altra azienda"
        }
      ],
      "trustIndicators": [
        "Certificazione specifica per ${productName}",
        "Garanzia concreta offerta",
        "Numero clienti soddisfatti realistico"
      ],
      "statistics": [
        {
          "number": "95%",
          "label": "Clienti soddisfatti di ${productName}",
          "icon": "heart"
        },
        {
          "number": "24h",
          "label": "Tempo medio di risposta",
          "icon": "clock"
        }
      ]
    },
    "interactiveDemo": {
      "type": "interactive_preview",
      "title": "Prova ${productName} in Azione",
      "description": "Scopri come ${productName} risolve i problemi di ${targetAudience}",
      "content": "Demo interattiva specifica per ${productName}",
      "features": [
        "Caratteristica 1 di ${productName}",
        "Caratteristica 2 specifica",
        "Beneficio pratico 3"
      ]
    },
    "conversionForm": {
      "title": "Richiedi ${productName}",
      "description": "Compila il form per ricevere informazioni dettagliate su ${productName} e una consulenza personalizzata",
      "steps": [
        {
          "title": "I Tuoi Dati",
          "subtitle": "Per personalizzare la proposta di ${productName}",
          "fields": [
            {
              "name": "nome",
              "label": "Nome e Cognome",
              "type": "text",
              "placeholder": "Il tuo nome completo",
              "required": true,
              "validation": "required"
            },
            {
              "name": "email",
              "label": "Email",
              "type": "email",
              "placeholder": "La tua email",
              "required": true,
              "validation": "email"
            },
            {
              "name": "telefono",
              "label": "Numero di Telefono",
              "type": "tel",
              "placeholder": "+39 XXX XXX XXXX",
              "required": true,
              "validation": "phone"
            },
            {
              "name": "azienda",
              "label": "Nome Azienda",
              "type": "text",
              "placeholder": "La tua azienda",
              "required": false
            }
          ]
        },
        {
          "title": "Le Tue Esigenze",
          "subtitle": "Per proporti la soluzione ${productName} più adatta",
          "fields": [
            {
              "name": "esigenze",
              "label": "Descrivi le tue esigenze specifiche",
              "type": "textarea",
              "placeholder": "Come ${productName} può aiutarti? Quali problemi vuoi risolvere?",
              "required": true
            },
            {
              "name": "budget",
              "label": "Budget di riferimento",
              "type": "select",
              "options": [
                "Sotto €1.000",
                "€1.000 - €5.000", 
                "€5.000 - €15.000",
                "Oltre €15.000"
              ],
              "required": false
            },
            {
              "name": "tempistiche",
              "label": "Quando vorresti iniziare?",
              "type": "select",
              "options": [
                "Subito",
                "Entro 1 mese",
                "Entro 3 mesi",
                "Oltre 3 mesi"
              ],
              "required": false
            }
          ]
        }
      ],
      "submitText": "Richiedi Consulenza per ${productName}",
      "incentive": "✅ Consulenza gratuita personalizzata\n✅ Analisi delle tue esigenze\n✅ Proposta su misura per ${productName}",
      "progressBar": true,
      "socialProofInline": "Oltre 500 ${targetAudience} hanno già scelto ${productName}",
      "styling": {
        "background": "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))",
        "cardStyle": "glass",
        "animations": true
      }
    },
    "advancedFeatures": {
      "personalization": {
        "enabled": true,
        "triggers": ["scroll_depth", "time_on_page", "interaction_count"],
        "messages": [
          "${productName} sembra interessarti! Vuoi saperne di più?",
          "Hai visto i benefici di ${productName}. Ti aiutiamo a iniziare?",
          "${targetAudience} come te apprezzano ${productName}. Parliamone!"
        ]
      },
      "urgencyMechanics": {
        "type": "limited_offer",
        "message": "🔥 Offerta speciale per ${productName} - Solo per oggi!",
        "expiresIn": "24 ore",
        "discount": "20%"
      },
      "exitIntent": {
        "enabled": true,
        "offer": "Aspetta! Sconto del 15% su ${productName}",
        "discount": "15%",
        "message": "Prima di andare, scopri questa offerta esclusiva per ${productName}"
      }
    }
  },
  "customer_facing": {
    "welcome_title": "Benvenuto nel mondo di ${productName}",
    "welcome_description": "Scopri come ${productName} può trasformare il tuo ${industry} con soluzioni su misura per ${targetAudience}",
    "completion_message": "Perfetto! Ti contatteremo entro 24 ore per parlare di ${productName} e delle tue esigenze specifiche."
  },
  "settings": {
    "theme": "cinematic_modern",
    "primaryColor": "#6366f1",
    "showProgress": true,
    "animations": "enhanced",
    "mobileOptimized": true
  },
  "target_audience": "${targetAudience}",
  "industry": "${industry}",
  "product_name": "${productName}"
}

IMPORTANTE: Questo JSON deve essere COMPLETAMENTE personalizzato per "${productName}" targeting "${targetAudience}". Zero contenuti generici!`;

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
            content: 'Sei un copywriter esperto in funnel di conversione. Crei SOLO contenuti specifici e personalizzati per il prodotto fornito. ZERO frasi generiche. Rispondi SOLO con JSON valido senza spiegazioni.' 
          },
          { role: 'user', content: funnelGenerationPrompt }
        ],
        temperature: 0.1,
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
      console.log('Raw AI response (first 500 chars):', rawContent.substring(0, 500));
      
      // Clean JSON content
      let cleanContent = rawContent.trim();
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
      }
      
      funnelData = JSON.parse(cleanContent);
      console.log('✅ Funnel personalizzato generato per:', funnelData.product_name);
      
      // Validate personalization
      const contentString = JSON.stringify(funnelData).toLowerCase();
      const productNameLower = productName.toLowerCase();
      
      if (!contentString.includes(productNameLower)) {
        console.log('⚠️ Content not personalized, using enhanced fallback');
        throw new Error('Generated content not personalized');
      }
      
    } catch (parseError) {
      console.error('Error parsing funnel JSON:', parseError);
      
      // Enhanced personalized fallback
      funnelData = {
        id: `funnel-${Date.now()}`,
        name: `Funnel Cinematico: ${productName}`,
        description: `Funnel personalizzato per convertire ${targetAudience} interessati a ${productName}`,
        advanced_funnel_data: {
          heroSection: {
            headline: `Scopri ${productName}: ${keyBenefits.length > 0 ? keyBenefits[0] : 'La Soluzione che Cercavi'}`,
            subheadline: `${productName} è progettato specificamente per ${targetAudience} che vogliono ${keyBenefits.length > 1 ? keyBenefits[1] : 'risultati concreti'}`,
            animation: "fade-in-up",
            backgroundGradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
            ctaText: `Richiedi ${productName}`,
            ctaStyle: "primary",
            urgencyText: `Offerta limitata per ${productName}`,
            visualElements: {
              particles: true,
              glowEffects: true,
              colorTheme: "vibrant"
            }
          },
          visualTheme: {
            primaryColor: "#6366f1",
            secondaryColor: "#8b5cf6",
            accentColor: "#ec4899",
            backgroundColor: "#0f0f23",
            textColor: "#ffffff",
            cardBackground: "rgba(255, 255, 255, 0.1)",
            fontPrimary: "Inter",
            fontSecondary: "Georgia",
            borderRadius: "16px",
            spacing: "relaxed",
            shadows: "dramatic",
            animations: "smooth"
          },
          productBenefits: keyBenefits.slice(0, 3).map((benefit, index) => ({
            title: benefit,
            description: `${productName} ti offre ${benefit.toLowerCase()} per aiutare ${targetAudience} a raggiungere i loro obiettivi`,
            icon: ["zap", "heart", "shield"][index] || "star",
            animation: ["slide-in-left", "slide-in-right", "fade-in-up"][index] || "fade-in",
            highlight: index === 0,
            color: ["#6366f1", "#8b5cf6", "#ec4899"][index]
          })),
          socialProof: {
            testimonials: [
              {
                name: industry === 'technology' ? "Marco Rossi" : industry === 'fitness' ? "Laura Bianchi" : "Giulia Verdi",
                text: `${productName} ha superato le mie aspettative. Come ${targetAudience}, ho ottenuto ${keyBenefits.length > 0 ? keyBenefits[0].toLowerCase() : 'risultati eccellenti'} in poco tempo.`,
                rating: 5,
                role: targetAudience.includes('aziend') ? "CEO" : "Cliente",
                verified: true,
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                company: `${industry} Italia`
              }
            ],
            trustIndicators: [
              `${productName} - Qualità certificata`,
              `Oltre 100+ ${targetAudience} soddisfatti`,
              "Garanzia soddisfatti o rimborsati"
            ],
            statistics: [
              {
                number: "95%",
                label: `Clienti soddisfatti di ${productName}`,
                icon: "heart"
              }
            ]
          },
          interactiveDemo: {
            type: "interactive_preview",
            title: `Prova ${productName} in Azione`,
            description: `Scopri come ${productName} risolve i problemi di ${targetAudience}`,
            content: `Demo interattiva di ${productName}`,
            features: keyBenefits.length > 0 ? keyBenefits.slice(0, 3) : [
              `Funzionalità principale di ${productName}`,
              "Interface intuitiva",
              "Risultati misurabili"
            ]
          },
          conversionForm: {
            title: `Richiedi ${productName}`,
            description: `Compila il form per ricevere informazioni dettagliate su ${productName} e una consulenza personalizzata`,
            steps: [
              {
                title: "I Tuoi Dati",
                subtitle: `Per personalizzare la proposta di ${productName}`,
                fields: [
                  {
                    name: "nome",
                    label: "Nome e Cognome",
                    type: "text",
                    placeholder: "Il tuo nome completo",
                    required: true,
                    validation: "required"
                  },
                  {
                    name: "email",
                    label: "Email",
                    type: "email",
                    placeholder: "La tua email",
                    required: true,
                    validation: "email"
                  },
                  {
                    name: "telefono",
                    label: "Numero di Telefono",
                    type: "tel",
                    placeholder: "+39 XXX XXX XXXX",
                    required: true,
                    validation: "phone"
                  },
                  {
                    name: "azienda",
                    label: "Nome Azienda",
                    type: "text",
                    placeholder: "La tua azienda",
                    required: false
                  }
                ]
              },
              {
                title: "Le Tue Esigenze",
                subtitle: `Per proporti la soluzione ${productName} più adatta`,
                fields: [
                  {
                    name: "esigenze",
                    label: "Descrivi le tue esigenze specifiche",
                    type: "textarea",
                    placeholder: `Come ${productName} può aiutarti? Quali problemi vuoi risolvere?`,
                    required: true
                  },
                  {
                    name: "budget",
                    label: "Budget di riferimento",
                    type: "select",
                    options: [
                      "Sotto €1.000",
                      "€1.000 - €5.000", 
                      "€5.000 - €15.000",
                      "Oltre €15.000"
                    ],
                    required: false
                  }
                ]
              }
            ],
            submitText: `Richiedi Consulenza per ${productName}`,
            incentive: "✅ Consulenza gratuita personalizzata\n✅ Analisi delle tue esigenze\n✅ Proposta su misura",
            progressBar: true,
            socialProofInline: `Oltre 500 ${targetAudience} hanno già scelto ${productName}`,
            styling: {
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))",
              cardStyle: "glass",
              animations: true
            }
          },
          advancedFeatures: {
            personalization: {
              enabled: true,
              triggers: ["scroll_depth", "time_on_page"],
              messages: [
                `${productName} sembra interessarti! Vuoi saperne di più?`,
                `${targetAudience} come te apprezzano ${productName}. Parliamone!`
              ]
            },
            urgencyMechanics: {
              type: "limited_offer",
              message: `🔥 Offerta speciale per ${productName} - Solo per oggi!`,
              expiresIn: "24 ore",
              discount: "20%"
            },
            exitIntent: {
              enabled: true,
              offer: `Sconto del 15% su ${productName}`,
              discount: "15%",
              message: `Prima di andare, scopri questa offerta esclusiva per ${productName}`
            }
          }
        },
        customer_facing: {
          welcome_title: `Benvenuto nel mondo di ${productName}`,
          welcome_description: `Scopri come ${productName} può trasformare il tuo ${industry} con soluzioni su misura per ${targetAudience}`,
          completion_message: `Perfetto! Ti contatteremo entro 24 ore per parlare di ${productName} e delle tue esigenze specifiche.`
        },
        settings: {
          theme: "cinematic_modern",
          primaryColor: "#6366f1",
          showProgress: true,
          animations: "enhanced",
          mobileOptimized: true
        },
        target_audience: targetAudience,
        industry: industry,
        product_name: productName
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
          settings: funnelData.settings || {},
          steps: funnelData.advanced_funnel_data?.conversionForm?.steps || []
        })
        .select()
        .single();

      if (funnelError) {
        console.error('Database save error:', funnelError);
      } else {
        funnelData.id = funnelResult.id;
        console.log('✅ Personalized funnel saved with ID:', funnelResult.id);
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
        personalizedContent: true,
        interactiveDesign: true
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
