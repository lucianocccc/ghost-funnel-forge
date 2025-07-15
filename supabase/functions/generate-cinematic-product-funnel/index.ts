
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductData {
  originalPrompt: string; // NEW: Original user request
  productName: string;
  description: string;
  targetAudience: {
    primary: string;
    industry: string;
  };
  uniqueValue: string;
  keyBenefits: string[];
  priceRange: string;
  businessGoals: string[];
  currentChallenges: string[];
}

interface FunnelRequest {
  productData: ProductData;
  userId: string;
  generateVisuals?: boolean;
  optimizeForConversion?: boolean;
  focusOnProduct?: boolean; // NEW: Signal to focus on product
}

serve(async (req) => {
  console.log('🎯 Product-Specific Funnel Generator started');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: FunnelRequest = await req.json();
    console.log('📥 Request received:', JSON.stringify(requestData, null, 2));
    
    const { productData, userId, focusOnProduct } = requestData;
    
    if (!productData || !userId) {
      console.error('❌ Missing data:', { productData: !!productData, userId: !!userId });
      return new Response(JSON.stringify({
        success: false,
        error: 'ProductData e userId sono richiesti'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key missing');
      return new Response(JSON.stringify({
        success: false,
        error: 'OpenAI API key non configurata'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🎯 Analyzing original prompt for product-specific funnel:', productData.originalPrompt);

    // STEP 1: Deep analysis of the original user prompt with product focus
    const productAnalysis = await analyzeProductSpecificPrompt(productData, openAIApiKey);
    console.log('📊 Product-specific analysis:', productAnalysis);
    
    // STEP 2: Generate ultra-specific funnel content based on the product
    const funnelData = await generateProductFocusedFunnel(productData, productAnalysis, openAIApiKey);
    console.log('✅ Product-focused funnel generated:', funnelData.name);
    
    // STEP 3: Save to database with product-specific context
    const savedFunnel = await saveFunnelToDatabase(funnelData, userId);
    console.log('💾 Product-specific funnel saved:', savedFunnel.id);

    return new Response(JSON.stringify({
      success: true,
      funnel: savedFunnel,
      analysis: productAnalysis,
      message: `Funnel prodotto-specifico creato per "${productData.productName}"`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in product-specific funnel generation:', error);
    console.error('Stack trace:', error.stack);
    
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

async function analyzeProductSpecificPrompt(productData: ProductData, apiKey: string) {
  console.log('🔍 Starting product-specific prompt analysis...');
  
  const analysisPrompt = `ANALISI PRODOTTO-SPECIFICA - PRIORITÀ MASSIMA AL PROMPT ORIGINALE:

PROMPT ORIGINALE UTENTE (PRIORITÀ ASSOLUTA): "${productData.originalPrompt}"

DETTAGLI PRODOTTO SPECIFICO:
- Nome: "${productData.productName}"
- Cosa fa: "${productData.description}"  
- Target: "${productData.targetAudience.primary}"
- Settore: "${productData.targetAudience.industry}"
- Valore unico: "${productData.uniqueValue}"
- Benefici specifici: ${productData.keyBenefits.join(', ')}
- Fascia prezzo: "${productData.priceRange}"
- Problemi che risolve: ${productData.currentChallenges.join(', ')}

ISTRUZIONI CRITICHE:
1. CONCENTRATI ESCLUSIVAMENTE SUL PRODOTTO/SERVIZIO SPECIFICO
2. IGNORA concetti generici di "business" o "azienda"
3. Crea contenuti che parlano DIRETTAMENTE del prodotto
4. Usa terminologia SPECIFICA del settore/prodotto
5. Le domande devono riguardare l'USO del prodotto, non il business in generale

Genera JSON con analisi PRODOTTO-SPECIFICA:

{
  "productType": "tipo esatto di prodotto/servizio",
  "specificIndustry": "sotto-settore molto specifico",
  "customerPainPoint": "problema specifico che il prodotto risolve",
  "productBenefit": "beneficio principale del prodotto",
  "customerJourney": "come il cliente scopre/usa questo prodotto",
  "urgencyTrigger": "perché il cliente ha bisogno del prodotto ORA",
  "productHook": "gancio magnetico SPECIFICO per questo prodotto",
  "specificKeywords": ["termine1", "termine2", "termine3"],
  "competitorDifferentiator": "cosa rende QUESTO prodotto diverso",
  "productTitle": "titolo magnetico SPECIFICO per il prodotto",
  "productSubtitle": "sottotitolo che descrive il valore del prodotto",
  "targetAction": "azione specifica che vuoi dal cliente per questo prodotto",
  "qualifyingQuestions": [
    "domanda specifica per qualificare interesse nel prodotto",
    "domanda per capire bisogno specifico",
    "domanda per raccogliere info per proposta mirata"
  ]
}

RICORDA: Ogni parola deve essere SPECIFICA al prodotto, MAI generica!`;

  try {
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
            content: 'Sei un esperto di marketing di prodotto che crea contenuti ULTRA-SPECIFICI. Non usi MAI linguaggio generico o orientato al business. Ti concentri SOLO sul prodotto specifico e sui suoi utilizzi concreti.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.2,
        max_tokens: 1200
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('🤖 Product-specific analysis received');
    
    let analysisResult;
    try {
      const content = data.choices[0].message.content;
      let cleanContent = content.trim();
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
      }
      
      analysisResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ Error parsing product analysis:', parseError);
      // Fallback with product-focused analysis
      analysisResult = {
        productType: productData.productName,
        specificIndustry: productData.targetAudience.industry || 'servizi',
        customerPainPoint: productData.currentChallenges[0] || 'problemi quotidiani',
        productBenefit: productData.keyBenefits[0] || 'migliore qualità di vita',
        customerJourney: 'ricerca online del servizio',
        urgencyTrigger: 'necessità immediata di una soluzione',
        productHook: `Scopri ${productData.productName}: la soluzione che cercavi`,
        specificKeywords: ['qualità', 'servizio', 'conveniente'],
        competitorDifferentiator: productData.uniqueValue || 'approccio personalizzato',
        productTitle: `${productData.productName}: ${productData.keyBenefits[0] || 'La Soluzione Perfetta'}`,
        productSubtitle: `${productData.description}`,
        targetAction: 'richiesta informazioni personalizzate',
        qualifyingQuestions: [
          'Quando avresti bisogno del servizio?',
          'Qual è la tua priorità principale?',
          'Preferisci essere contattato?'
        ]
      };
    }
    
    console.log('📊 Product-specific analysis completed:', analysisResult.productTitle);
    return analysisResult;
    
  } catch (error) {
    console.error('❌ Error in OpenAI call for product analysis:', error);
    throw error;
  }
}

async function generateProductFocusedFunnel(productData: ProductData, analysis: any, apiKey: string) {
  console.log('🏗️ Starting product-focused funnel generation...');
  
  const funnelPrompt = `GENERA FUNNEL ULTRA-SPECIFICO PER QUESTO PRODOTTO:

PROMPT ORIGINALE: "${productData.originalPrompt}"
PRODOTTO: "${productData.productName}"
ANALISI PRODOTTO: ${JSON.stringify(analysis, null, 2)}

ISTRUZIONI CRITICHE:
1. OGNI domanda deve riguardare il PRODOTTO SPECIFICO
2. EVITA completamente termini come "business", "azienda", "attività"
3. USA i termini specifici del settore/prodotto
4. Le domande devono aiutare a QUALIFICARE il bisogno del PRODOTTO
5. Il contenuto deve far sentire che stai parlando DIRETTAMENTE del loro problema/bisogno

STRUTTURA RICHIESTA:
- Step 1: Introduzione al PRODOTTO (non al business)
- Step 2: Qualificazione BISOGNO specifico
- Step 3: Dettagli per PROPOSTA MIRATA

Genera JSON:

{
  "name": "${analysis.productTitle}",
  "description": "${analysis.productSubtitle}",
  "magneticElements": {
    "primaryHook": "${analysis.productHook}",
    "targetCustomer": "${analysis.customerPainPoint}",
    "urgencyLevel": "${analysis.urgencyTrigger}",
    "productDifferentiator": "${analysis.competitorDifferentiator}",
    "valueProposition": "${analysis.productSubtitle}",
    "specificFocus": "product-centric"
  },
  "steps": [
    {
      "title": "Scopri ${productData.productName}!",
      "description": "La soluzione che stavai cercando",
      "step_type": "info",
      "step_order": 1,
      "is_required": true,
      "fields_config": [],
      "settings": {
        "customer_description": "Inizia il tuo percorso verso una soluzione perfetta",
        "content": "<h2>${analysis.productTitle}</h2><p>${analysis.productSubtitle}</p><p><strong>Perfetto per:</strong> ${productData.targetAudience.primary}</p>"
      }
    },
    {
      "title": "Dimmi di cosa hai bisogno",
      "description": "Aiutami a capire la tua situazione specifica",
      "step_type": "form",
      "step_order": 2,
      "is_required": true,
      "fields_config": [
        {
          "id": "nome",
          "label": "Il tuo nome",
          "type": "text",
          "placeholder": "Come ti chiami?",
          "required": true
        },
        {
          "id": "email",
          "label": "Email",
          "type": "email",
          "placeholder": "La tua email per la proposta",
          "required": true
        },
        {
          "id": "bisogno_specifico",
          "label": "${analysis.qualifyingQuestions[0]}",
          "type": "textarea",
          "placeholder": "Descrivi la tua necessità...",
          "required": true
        },
        {
          "id": "urgenza",
          "label": "${analysis.qualifyingQuestions[1]}",
          "type": "select",
          "options": ["Entro una settimana", "Entro un mese", "Fra 2-3 mesi", "Non ho fretta"],
          "required": true
        }
      ],
      "settings": {
        "customer_description": "Queste informazioni mi permettono di creare una proposta perfetta per te"
      }
    },
    {
      "title": "Ultimi dettagli per la tua proposta",
      "description": "Personalizza la tua esperienza",
      "step_type": "contact",
      "step_order": 3,
      "is_required": true,
      "fields_config": [
        {
          "id": "telefono",
          "label": "Numero di telefono (opzionale)",
          "type": "tel",
          "placeholder": "Per un contatto più veloce",
          "required": false
        },
        {
          "id": "preferenza_contatto",
          "label": "${analysis.qualifyingQuestions[2]}",
          "type": "radio",
          "options": ["Email", "Telefono", "WhatsApp"],
          "required": true
        }
      ],
      "settings": {
        "customer_description": "Ti contatterò entro 24 ore con una proposta personalizzata per ${productData.productName}"
      }
    }
  ],
  "target_audience": "${productData.targetAudience.primary}",
  "industry": "${productData.targetAudience.industry}",
  "product_name": "${productData.productName}",
  "original_prompt": "${productData.originalPrompt}"
}`;

  try {
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
            content: 'Sei un esperto di funnel di prodotto che crea contenuti ULTRA-SPECIFICI per prodotti/servizi. Non usi mai linguaggio generico. Ogni parola è mirata al prodotto specifico e ai suoi utilizzatori.' 
          },
          { role: 'user', content: funnelPrompt }
        ],
        temperature: 0.2,
        max_tokens: 2500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('🤖 Product-focused funnel received');
    
    let funnelData;
    try {
      const content = data.choices[0].message.content;
      let cleanContent = content.trim();
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
      }
      
      funnelData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ Error parsing product funnel:', parseError);
      // Fallback with product-focused funnel
      funnelData = {
        name: analysis.productTitle,
        description: analysis.productSubtitle,
        magneticElements: {
          primaryHook: analysis.productHook,
          targetCustomer: analysis.customerPainPoint,
          urgencyLevel: analysis.urgencyTrigger,
          productDifferentiator: analysis.competitorDifferentiator,
          valueProposition: analysis.productSubtitle,
          specificFocus: "product-centric"
        },
        steps: [
          {
            title: `Scopri ${productData.productName}!`,
            description: "La soluzione che stavai cercando",
            step_type: "info",
            step_order: 1,
            is_required: true,
            fields_config: [],
            settings: {
              customer_description: "Inizia il tuo percorso verso una soluzione perfetta",
              content: `<h2>${analysis.productTitle}</h2><p>${analysis.productSubtitle}</p>`
            }
          },
          {
            title: "Dimmi di cosa hai bisogno",
            description: "Aiutami a capire la tua situazione specifica",
            step_type: "form",
            step_order: 2,
            is_required: true,
            fields_config: [
              {
                id: "nome",
                label: "Il tuo nome",
                type: "text",
                placeholder: "Come ti chiami?",
                required: true
              },
              {
                id: "email",
                label: "Email",
                type: "email",
                placeholder: "La tua email per la proposta",
                required: true
              }
            ],
            settings: {
              customer_description: "Queste informazioni mi permettono di creare una proposta perfetta per te"
            }
          }
        ],
        target_audience: productData.targetAudience.primary,
        industry: productData.targetAudience.industry,
        product_name: productData.productName,
        original_prompt: productData.originalPrompt
      };
    }
    
    console.log('✅ Product-focused funnel generated:', funnelData.name);
    return funnelData;
    
  } catch (error) {
    console.error('❌ Error in OpenAI call for product funnel:', error);
    throw error;
  }
}

async function saveFunnelToDatabase(funnelData: any, userId: string) {
  console.log('💾 Saving product-specific funnel to database...');
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  const shareToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  try {
    // Create product-specific interactive funnel
    const { data: funnelResult, error: funnelError } = await supabase
      .from('interactive_funnels')
      .insert({
        name: funnelData.name,
        description: funnelData.description,
        created_by: userId,
        share_token: shareToken,
        is_public: false,
        status: 'active',
        views_count: 0,
        submissions_count: 0,
        settings: {
          magneticElements: funnelData.magneticElements || {},
          productSpecific: true, // Mark as product-specific
          originalPrompt: funnelData.original_prompt, // Store original prompt
          analysisTimestamp: new Date().toISOString(),
          target_audience: funnelData.target_audience,
          industry: funnelData.industry,
          product_name: funnelData.product_name,
          focusType: 'product-centric' // Important flag
        }
      })
      .select()
      .single();

    if (funnelError) {
      console.error('❌ Error saving product funnel:', funnelError);
      throw new Error(`Database error: ${funnelError.message}`);
    }

    console.log('✅ Product-specific funnel created with ID:', funnelResult.id);

    // Create funnel steps
    if (funnelData.steps && Array.isArray(funnelData.steps)) {
      for (let i = 0; i < funnelData.steps.length; i++) {
        const step = funnelData.steps[i];
        const { error: stepError } = await supabase
          .from('interactive_funnel_steps')
          .insert({
            funnel_id: funnelResult.id,
            title: step.title,
            description: step.description,
            step_type: step.step_type,
            step_order: step.step_order || (i + 1),
            is_required: step.is_required !== false,
            fields_config: step.fields_config || [],
            settings: step.settings || {}
          });

        if (stepError) {
          console.error(`❌ Error creating step ${i + 1}:`, stepError);
          throw new Error(`Step database error: ${stepError.message}`);
        }
      }
    }

    console.log('✅ All product-specific funnel steps created successfully');
    
    return {
      id: funnelResult.id,
      name: funnelData.name,
      description: funnelData.description,
      steps_count: funnelData.steps?.length || 0,
      share_token: shareToken,
      magneticElements: funnelData.magneticElements,
      settings: funnelResult.settings,
      productSpecific: true
    };
    
  } catch (dbError) {
    console.error('❌ Database error:', dbError);
    throw new Error(`Database error: ${dbError.message}`);
  }
}
