
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductData {
  productName: string;
  description: string;
  targetAudience: {
    primary: string;
    industry: string;
  };
  uniqueValue: string;
  keyBenefits: string[];
}

interface FunnelRequest {
  productData: ProductData;
  funnelId?: string;
  userId: string;
  generateVisuals?: boolean;
  optimizeForConversion?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: FunnelRequest = await req.json();
    const { productData, userId, funnelId, generateVisuals = true, optimizeForConversion = true } = requestData;
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key non configurata');
    }

    console.log('🎬 Generazione funnel cinematico intelligente per:', productData.productName);

    // Step 1: Intelligent Product Analysis
    const productAnalysis = await analyzeProduct(productData, openAIApiKey);
    console.log('📊 Analisi prodotto completata:', productAnalysis);

    // Step 2: Market Intelligence
    const marketIntelligence = await gatherMarketIntelligence(productData, openAIApiKey);
    console.log('🔍 Intelligence di mercato completata');

    // Step 3: Generate Personalized Funnel
    const funnelData = await generatePersonalizedFunnel(productData, productAnalysis, marketIntelligence, openAIApiKey);
    console.log('🎯 Funnel personalizzato generato');

    // Step 4: Generate Visual Assets (if requested)
    let visualAssets = null;
    if (generateVisuals) {
      visualAssets = await generateVisualAssets(productData, funnelData, openAIApiKey);
      console.log('🎨 Asset visivi generati');
    }

    // Step 5: Optimize for Conversion
    if (optimizeForConversion) {
      await optimizeForConversion(funnelData, productAnalysis);
      console.log('⚡ Ottimizzazione conversioni completata');
    }

    // Step 6: Save to Database
    const savedFunnel = await saveFunnelToDatabase(funnelData, userId, funnelId);
    console.log('💾 Funnel salvato nel database:', savedFunnel.id);

    return new Response(JSON.stringify({
      success: true,
      funnel: savedFunnel,
      productAnalysis,
      marketIntelligence,
      visualAssets,
      generatedAt: new Date().toISOString(),
      optimizations: {
        conversionOptimized: optimizeForConversion,
        visualsGenerated: generateVisuals,
        intelligentAnalysis: true,
        personalizedContent: true,
        marketIntelligence: true
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Errore nella generazione del funnel:', error);
    
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

async function analyzeProduct(productData: ProductData, apiKey: string) {
  const analysisPrompt = `Analizza questo prodotto in modo approfondito e intelligente:

PRODOTTO: "${productData.productName}"
DESCRIZIONE: "${productData.description}"
TARGET: "${productData.targetAudience.primary}"
SETTORE: "${productData.targetAudience.industry}"
VALORE UNICO: "${productData.uniqueValue}"
BENEFICI: ${productData.keyBenefits.join(', ')}

Fornisci un'analisi JSON strutturata che includa:

{
  "targetAudience": {
    "primary": {
      "description": "Descrizione dettagliata del target principale",
      "demographics": "Dati demografici specifici",
      "psychographics": "Profilo psicografico",
      "painPoints": ["Problemi specifici che il prodotto risolve"],
      "motivations": ["Motivazioni di acquisto"],
      "objections": ["Possibili obiezioni"],
      "decisionFactors": ["Fattori che influenzano la decisione"]
    },
    "secondary": {
      "description": "Target secondario identificato",
      "potential": "Potenziale di conversione"
    }
  },
  "productPositioning": {
    "category": "Categoria di prodotto",
    "differentiators": ["Fattori differenzianti"],
    "competitiveAdvantage": "Vantaggio competitivo principale",
    "marketPosition": "Posizione nel mercato"
  },
  "conversionStrategy": {
    "approach": "Approccio di conversione ottimale",
    "emotional_triggers": ["Trigger emotivi da utilizzare"],
    "logical_arguments": ["Argomenti logici da presentare"],
    "urgency_factors": ["Fattori di urgenza"],
    "trust_builders": ["Elementi per costruire fiducia"],
    "potential": 0.85
  },
  "contentStrategy": {
    "tone": "Tono di comunicazione",
    "language_style": "Stile linguistico",
    "key_messages": ["Messaggi chiave da comunicare"],
    "storytelling_angle": "Angolo narrativo"
  },
  "visualStrategy": {
    "style": "Stile visivo raccomandato",
    "colors": ["Colori principali da utilizzare"],
    "imagery_type": "Tipo di immagini",
    "emotional_direction": "Direzione emotiva visiva"
  }
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Sei un esperto analista di prodotti e marketing. Rispondi SOLO con JSON valido.' },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function gatherMarketIntelligence(productData: ProductData, apiKey: string) {
  const intelligencePrompt = `Analizza il mercato per questo prodotto e fornisci intelligence strategica:

PRODOTTO: "${productData.productName}"
SETTORE: "${productData.targetAudience.industry}"
TARGET: "${productData.targetAudience.primary}"

Fornisci analisi di mercato in JSON:

{
  "marketSize": {
    "totalMarket": "Dimensione del mercato totale",
    "targetSegment": "Dimensione del segmento target",
    "growthRate": "Tasso di crescita annuale"
  },
  "competitiveLandscape": {
    "directCompetitors": ["Lista competitor diretti"],
    "indirectCompetitors": ["Competitor indiretti"],
    "marketGaps": ["Gap di mercato identificati"],
    "competitiveAdvantages": ["Vantaggi competitivi disponibili"]
  },
  "trends": {
    "currentTrends": ["Trend attuali nel settore"],
    "emergingTrends": ["Trend emergenti"],
    "threats": ["Minacce potenziali"],
    "opportunities": ["Opportunità di mercato"]
  },
  "pricingIntelligence": {
    "marketRange": "Range di prezzo del mercato",
    "priceAnchoring": "Prezzo di ancoraggio suggerito",
    "priceStrategy": "Strategia di prezzo raccomandata"
  },
  "channels": {
    "primary": ["Canali primari raccomandati"],
    "secondary": ["Canali secondari"],
    "digital": ["Canali digitali più efficaci"]
  }
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Sei un esperto di market intelligence. Rispondi SOLO con JSON valido.' },
        { role: 'user', content: intelligencePrompt }
      ],
      temperature: 0.2,
      max_tokens: 1500
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function generatePersonalizedFunnel(productData: ProductData, analysis: any, marketIntelligence: any, apiKey: string) {
  const funnelPrompt = `Crea un funnel cinematico ALTAMENTE PERSONALIZZATO utilizzando tutti i dati di analisi:

PRODOTTO: "${productData.productName}"
ANALISI COMPLETA: ${JSON.stringify(analysis, null, 2)}
MARKET INTELLIGENCE: ${JSON.stringify(marketIntelligence, null, 2)}

REGOLE FERREE:
1. OGNI elemento deve essere SPECIFICO per "${productData.productName}"
2. Utilizza TUTTI i dati dell'analisi per personalizzare il contenuto
3. Incorpora i trigger emotivi identificati nell'analisi
4. Usa gli argomenti logici specifici
5. Applica la strategia di contenuto suggerita
6. Implementa i trust builders identificati

Crea questo JSON COMPLETO:

{
  "id": "funnel-${Date.now()}",
  "name": "Funnel Cinematico Intelligente: ${productData.productName}",
  "description": "Funnel personalizzato con AI per ${productData.productName} - Target: ${productData.targetAudience.primary}",
  "advanced_funnel_data": {
    "heroSection": {
      "headline": "HEADLINE SPECIFICA che utilizza il trigger emotivo primario dall'analisi per ${productData.productName}",
      "subheadline": "Sottotitolo che incorpora gli argomenti logici e risolve il pain point #1 identificato",
      "animation": "fade-in-up-cinematic",
      "backgroundGradient": "Gradiente basato sulla strategia visiva dell'analisi",
      "ctaText": "CTA specifica per ${productData.productName} con trigger di urgenza",
      "ctaStyle": "primary-intelligent",
      "urgencyText": "Messaggio di urgenza basato sui fattori identificati nell'analisi",
      "personalizedMessage": "Messaggio personalizzato per ${productData.targetAudience.primary}",
      "visualElements": {
        "particles": true,
        "glowEffects": true,
        "colorTheme": "intelligent-adaptive",
        "smartAnimations": true
      }
    },
    "intelligentPersonalization": {
      "targetAudienceData": analysis.targetAudience.primary,
      "emotionalTriggers": analysis.conversionStrategy.emotional_triggers,
      "logicalArguments": analysis.conversionStrategy.logical_arguments,
      "trustBuilders": analysis.conversionStrategy.trust_builders,
      "objectionHandling": analysis.targetAudience.primary.objections.map((objection: string) => ({
        "objection": objection,
        "response": \`Risposta specifica per l'obiezione: \${objection}\`,
        "proof": "Prova sociale o garanzia per superare l'obiezione"
      }))
    },
    "visualTheme": {
      "primaryColor": "Colore primario dalla strategia visiva",
      "secondaryColor": "Colore secondario",
      "accentColor": "Colore accent",
      "backgroundColor": "Sfondo adattivo",
      "textColor": "#ffffff",
      "cardBackground": "rgba(255, 255, 255, 0.1)",
      "fontPrimary": "Font basato sul tone dell'analisi",
      "fontSecondary": "Font secondario",
      "borderRadius": "16px",
      "spacing": "luxurious",
      "shadows": "cinematic",
      "animations": "intelligent"
    },
    "productBenefits": productData.keyBenefits.map((benefit: string, index: number) => ({
      "title": \`\${benefit} - Versione Potenziata\`,
      "description": \`Come \${productData.productName} fornisce \${benefit.toLowerCase()} in modo unico per \${productData.targetAudience.primary}, risolvendo \${analysis.targetAudience.primary.painPoints[index] || 'problemi specifici'}\`,
      "icon": ["zap", "heart", "shield", "star", "crown"][index] || "star",
      "animation": ["slide-in-left", "slide-in-right", "fade-in-up", "scale-in", "rotate-in"][index] || "fade-in",
      "highlight": index === 0,
      "proofPoint": "Prova specifica per questo beneficio",
      "color": ["#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"][index]
    })),
    "socialProof": {
      "testimonials": [
        {
          "name": "Nome credibile per il settore ${productData.targetAudience.industry}",
          "text": \`Testimonial SPECIFICO su \${productData.productName}: come ha risolto \${analysis.targetAudience.primary.painPoints[0]} e ottenuto \${productData.keyBenefits[0]}. Risultati concreti e raccomandazione sincera.\`,
          "rating": 5,
          "role": analysis.targetAudience.primary.demographics,
          "verified": true,
          "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          "company": \`Azienda nel settore \${productData.targetAudience.industry}\`,
          "results": "Risultati specifici ottenuti"
        },
        {
          "name": "Secondo testimone credibile",
          "text": \`Altra esperienza con \${productData.productName}: ha superato \${analysis.targetAudience.primary.objections[0]} e ottenuto \${productData.keyBenefits[1]}. Dettagli specifici del successo.\`,
          "rating": 5,
          "role": "Altro ruolo target",
          "verified": true,
          "avatar": "https://images.unsplash.com/photo-1494790108755-2616b36d6de0?w=150&h=150&fit=crop&crop=face",
          "company": "Altra azienda pertinente"
        }
      ],
      "trustIndicators": analysis.conversionStrategy.trust_builders,
      "statistics": [
        {
          "number": "98%",
          "label": \`Clienti soddisfatti di \${productData.productName}\`,
          "icon": "heart",
          "source": "Studio interno"
        },
        {
          "number": "24h",
          "label": "Tempo medio di implementazione",
          "icon": "clock",
          "source": "Dati analytics"
        }
      ],
      "certifications": ["Certificazione specifica del settore", "Garanzia di qualità"],
      "mediaLogos": ["Logo media 1", "Logo media 2"]
    },
    "intelligentDemo": {
      "type": "adaptive_interactive",
      "title": \`Scopri \${productData.productName} in Azione\`,
      "description": \`Demo personalizzata che mostra come \${productData.productName} risolve i tuoi problemi specifici\`,
      "personalizedContent": "Contenuto demo adattato al profilo utente",
      "interactiveElements": ["Simulatore", "Configuratore", "Calcolatore ROI"],
      "features": productData.keyBenefits.slice(0, 3),
      "adaptiveScenarios": analysis.targetAudience.primary.painPoints.map((pain: string) => ({
        "scenario": pain,
        "solution": \`Come \${productData.productName} risolve: \${pain}\`,
        "outcome": "Risultato atteso"
      }))
    },
    "conversionForm": {
      "title": \`Ottieni \${productData.productName} Personalizzato\`,
      "description": \`Form intelligente che si adatta alle tue esigenze specifiche per \${productData.productName}\`,
      "adaptiveLogic": true,
      "steps": [
        {
          "title": "Qualificazione Intelligente",
          "subtitle": \`Aiutaci a personalizzare \${productData.productName} per te\`,
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
              "label": "Email Professionale",
              "type": "email",
              "placeholder": "La tua email aziendale",
              "required": true,
              "validation": "email"
            },
            {
              "name": "azienda",
              "label": "Nome Azienda",
              "type": "text",
              "placeholder": "La tua azienda",
              "required": true,
              "validation": "required"
            },
            {
              "name": "ruolo",
              "label": "Il Tuo Ruolo",
              "type": "select",
              "options": ["CEO/Founder", "Marketing Manager", "Sales Manager", "Altro"],
              "required": true
            }
          ]
        },
        {
          "title": "Analisi delle Esigenze",
          "subtitle": \`Personalizziamo \${productData.productName} per i tuoi obiettivi\`,
          "conditionalLogic": true,
          "fields": [
            {
              "name": "pain_point_primary",
              "label": "Qual è la tua sfida principale?",
              "type": "select",
              "options": analysis.targetAudience.primary.painPoints,
              "required": true,
              "triggers_personalization": true
            },
            {
              "name": "current_solution",
              "label": "Come gestisci attualmente questo problema?",
              "type": "textarea",
              "placeholder": "Descrivi la tua situazione attuale...",
              "required": true
            },
            {
              "name": "desired_outcome",
              "label": "Quale risultato vorresti ottenere?",
              "type": "select",
              "options": productData.keyBenefits,
              "required": true,
              "multiple": true
            },
            {
              "name": "timeline",
              "label": "Entro quando vuoi implementare la soluzione?",
              "type": "select",
              "options": ["Immediatamente", "Entro 1 mese", "Entro 3 mesi", "Entro 6 mesi"],
              "required": true
            },
            {
              "name": "budget_range",
              "label": "Budget di riferimento",
              "type": "select",
              "options": marketIntelligence.pricingIntelligence ? [
                \`Sotto \${marketIntelligence.pricingIntelligence.marketRange}\`,
                \`\${marketIntelligence.pricingIntelligence.marketRange}\`,
                \`Oltre \${marketIntelligence.pricingIntelligence.marketRange}\`
              ] : ["Sotto €5.000", "€5.000 - €15.000", "€15.000 - €50.000", "Oltre €50.000"],
              "required": false
            }
          ]
        }
      ],
      "submitText": \`Ottieni \${productData.productName} Personalizzato\`,
      "incentive": \`✅ Consulenza strategica gratuita\\n✅ Analisi personalizzata delle tue esigenze\\n✅ Proposta su misura per \${productData.productName}\\n✅ ROI calculator incluso\`,
      "progressBar": true,
      "socialProofInline": \`Oltre 1000+ professionisti nel settore \${productData.targetAudience.industry} hanno già scelto \${productData.productName}\`,
      "intelligentRouting": {
        "highValue": "Routing per lead high-value",
        "qualified": "Routing per lead qualificati",
        "nurturing": "Routing per lead da nutrire"
      },
      "styling": {
        "background": "Sfondo adattivo intelligente",
        "cardStyle": "premium-glass",
        "animations": "smooth-intelligent"
      }
    },
    "advancedFeatures": {
      "intelligentPersonalization": {
        "enabled": true,
        "behaviorTracking": true,
        "dynamicContent": true,
        "predictiveAnalytics": true,
        "triggers": ["scroll_depth", "time_on_page", "interaction_count", "exit_intent", "return_visitor"],
        "adaptiveMessages": analysis.conversionStrategy.emotional_triggers.map((trigger: string) => 
          \`Messaggio personalizzato basato su: \${trigger}\`
        )
      },
      "conversionOptimization": {
        "abTesting": {
          "enabled": true,
          "variants": ["Headline A/B", "CTA A/B", "Color A/B"],
          "autoOptimization": true
        },
        "urgencyMechanics": {
          "type": "intelligent_urgency",
          "message": \`🔥 Offerta limitata per \${productData.productName} - Basata sui tuoi dati!\`,
          "personalizedDeadline": true,
          "scarcityType": "limited_spots"
        },
        "exitIntent": {
          "enabled": true,
          "offer": \`Aspetta! Ricevi un'analisi gratuita per \${productData.productName}\`,
          "leadMagnet": "Guida personalizzata",
          "message": \`Prima di andare, scopri come \${productData.productName} può risolvere \${analysis.targetAudience.primary.painPoints[0]}\`
        }
      },
      "smartAnalytics": {
        "heatmapTracking": true,
        "conversionFunnelAnalysis": true,
        "cohortAnalysis": true,
        "predictiveScoring": true
      }
    }
  },
  "customer_facing": {
    "welcome_title": \`Benvenuto nel Futuro di \${productData.productName}\`,
    "welcome_description": \`Scopri come \${productData.productName} sta rivoluzionando il settore \${productData.targetAudience.industry} con soluzioni intelligenti per \${productData.targetAudience.primary}\`,
    "completion_message": \`Perfetto! Il nostro team di esperti ti contatterà entro 2 ore per una consulenza personalizzata su \${productData.productName}. Riceverai anche un'analisi gratuita delle tue esigenze specifiche.\`,
    "personalized_thank_you": \`Grazie per il tuo interesse in \${productData.productName}. Abbiamo preparato una proposta personalizzata basata sulle tue esigenze.\`
  },
  "settings": {
    "theme": "cinematic_intelligent",
    "primaryColor": "Colore dalla strategia visiva",
    "showProgress": true,
    "animations": "premium_cinematic",
    "mobileOptimized": true,
    "loadingOptimized": true,
    "seoOptimized": true,
    "analyticsEnabled": true,
    "personalizationEnabled": true
  },
  "target_audience": productData.targetAudience.primary,
  "industry": productData.targetAudience.industry,
  "product_name": productData.productName,
  "intelligence_level": "maximum",
  "personalization_score": 0.95
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'Sei un esperto di funnel marketing con AI. Crei contenuti ALTAMENTE PERSONALIZZATI e INTELLIGENTI. Rispondi SOLO con JSON valido.' 
        },
        { role: 'user', content: funnelPrompt }
      ],
      temperature: 0.1,
      max_tokens: 4000
    }),
  });

  const data = await response.json();
  let funnelData;
  
  try {
    const rawContent = data.choices[0].message.content;
    const cleanContent = rawContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
    funnelData = JSON.parse(cleanContent);
  } catch (parseError) {
    console.error('Errore nel parsing del JSON:', parseError);
    throw new Error('Errore nella generazione del funnel personalizzato');
  }

  return funnelData;
}

async function generateVisualAssets(productData: ProductData, funnelData: any, apiKey: string) {
  const visualPrompts = [
    `Professional hero image for ${productData.productName}: modern, sleek design showing the product in use by ${productData.targetAudience.primary}, high-quality, cinematic lighting`,
    `Elegant product showcase for ${productData.productName}: clean background, professional photography style, highlighting key features`,
    `Success story visualization for ${productData.productName}: happy customers from ${productData.targetAudience.industry} achieving results`
  ];

  const visualAssets = [];

  for (const prompt of visualPrompts) {
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'high',
          output_format: 'png'
        })
      });

      const imageData = await response.json();
      if (imageData.data && imageData.data[0]) {
        visualAssets.push({
          prompt: prompt,
          url: imageData.data[0].url,
          type: 'hero_image'
        });
      }
    } catch (error) {
      console.error('Errore nella generazione dell\'immagine:', error);
    }
  }

  return visualAssets;
}

async function optimizeForConversion(funnelData: any, analysis: any) {
  // Ottimizzazioni basate sull'analisi
  if (analysis.conversionStrategy.potential < 0.7) {
    funnelData.advanced_funnel_data.urgencyMechanics = {
      ...funnelData.advanced_funnel_data.urgencyMechanics,
      intensity: 'high',
      multipleScarcityFactors: true
    };
  }

  // Aggiungi elementi di fiducia extra se necessario
  if (analysis.targetAudience.primary.objections.length > 3) {
    funnelData.advanced_funnel_data.trustBuilders = {
      guarantees: ['Garanzia 100% soddisfatti o rimborsati', 'Supporto 24/7', 'Implementazione gratuita'],
      certifications: ['ISO 9001', 'GDPR Compliant', 'Industry Certified'],
      socialProof: 'Oltre 10.000 clienti soddisfatti'
    };
  }

  return funnelData;
}

async function saveFunnelToDatabase(funnelData: any, userId: string, funnelId?: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl!, supabaseKey!);

  const shareToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  funnelData.share_token = shareToken;

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
      console.error('Errore nel salvataggio del database:', funnelError);
      throw funnelError;
    }

    funnelData.id = funnelResult.id;
    console.log('✅ Funnel intelligente salvato con ID:', funnelResult.id);
    
    return funnelData;
  } catch (dbError) {
    console.error('Operazione di database fallita:', dbError);
    throw dbError;
  }
}
