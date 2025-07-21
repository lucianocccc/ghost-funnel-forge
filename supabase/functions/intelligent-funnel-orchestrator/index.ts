
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IntelligentFunnelRequest {
  userPrompt: string;
  productName: string;
  productDescription: string;
  category?: string;
  industry?: string;
  targetAudience?: string;
  analysisDepth?: 'basic' | 'intermediate' | 'advanced' | 'comprehensive';
  personalizationLevel?: 'basic' | 'standard' | 'advanced' | 'maximum';
  includeWebResearch?: boolean;
  includeMarketAnalysis?: boolean;
  includeCompetitorAnalysis?: boolean;
  userId: string;
}

const ANALYSIS_PROMPTS = {
  comprehensive: `Sei un esperto di marketing digitale e analisi prodotto. Analizza profondamente questo prodotto e genera un'esperienza personalizzata unica.

PRODOTTO: {productName}
DESCRIZIONE: {productDescription}
CATEGORIA: {category}
SETTORE: {industry}
TARGET: {targetAudience}
RICHIESTA UTENTE: {userPrompt}

ANALIZZA E GENERA UN'ESPERIENZA COMPLETAMENTE PERSONALIZZATA:

1. ANALISI PRODOTTO (approfondita):
   - Valore principale e proposition unica
   - Vantaggi competitivi specifici
   - Punti di forza e debolezza
   - Posizionamento ideale nel mercato
   - Opportunità di crescita

2. PROFILAZIONE AUDIENCE (dettagliata):
   - Personas primarie e secondarie
   - Pain points specifici
   - Motivazioni d'acquisto
   - Obiezioni tipiche
   - Canali preferiti

3. STRATEGIA NARRATIVA (creativa):
   - Storyline emotiva coinvolgente
   - Messaggio chiave differenziante
   - Sequenza di engagement
   - Trigger comportamentali
   - Elementi di urgenza

4. ESPERIENZA STEP-BY-STEP:
   Genera esattamente 3-4 step con questi tipi validi:
   - "lead_capture" (primo step)
   - "qualification" (qualificazione)
   - "discovery" (scoperta valore)
   - "conversion" (conversione finale)

Per ogni step includi:
- Titolo specifico e accattivante
- Descrizione che spiega il valore
- Contenuto personalizzato con headline, benefici, social proof
- Campi form pertinenti e strategici
- Elementi visivi suggeriti
- Trigger comportamentali

5. PERSONALIZZAZIONE AVANZATA:
   - Elementi unici per questo prodotto
   - Angoli creativi non convenzionali
   - Tocchi personali memorabili
   - Strategie di differenziazione
   - Ottimizzazioni per conversione

RISPONDI SOLO CON JSON VALIDO:`,

  webResearch: `Basandoti su ricerche web aggiornate, analizza:
- Trend di mercato attuali per {industry}
- Competitor principali di {productName}
- Insights clienti e recensioni
- Opportunità e minacce

Integra queste informazioni nell'esperienza.`,

  personalization: `Crea un'esperienza {personalizationLevel} personalizzata per {productName}:
- Adatta linguaggio e tone per {targetAudience}
- Personalizza benefici per {industry}
- Integra elementi emotivi specifici
- Ottimizza per conversione massima`
};

const generateIntelligentExperience = async (request: IntelligentFunnelRequest): Promise<any> => {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key non configurata');
  }

  console.log('🧠 Starting intelligent experience generation:', {
    productName: request.productName,
    analysisDepth: request.analysisDepth,
    personalizationLevel: request.personalizationLevel
  });

  const systemPrompt = ANALYSIS_PROMPTS.comprehensive
    .replace('{productName}', request.productName)
    .replace('{productDescription}', request.productDescription)
    .replace('{category}', request.category || 'Non specificata')
    .replace('{industry}', request.industry || 'Non specificato')
    .replace('{targetAudience}', request.targetAudience || 'Non specificato')
    .replace('{userPrompt}', request.userPrompt)
    .replace('{personalizationLevel}', request.personalizationLevel || 'maximum');

  const jsonStructure = {
    "name": "Nome esperienza coinvolgente e specifico",
    "description": "Descrizione dettagliata dell'esperienza e del valore",
    "theme": {
      "primary": "#colore",
      "secondary": "#colore", 
      "accent": "#colore",
      "style": "modern/classic/minimalist/bold/elegant"
    },
    "narrative": {
      "storyline": "Storia emotiva che guida l'utente",
      "keyMessages": ["Messaggio1", "Messaggio2", "Messaggio3"],
      "callToActions": ["CTA1", "CTA2", "CTA3"],
      "personalTouches": ["Tocco1", "Tocco2", "Tocco3"]
    },
    "steps": [
      {
        "stepOrder": 1,
        "stepType": "lead_capture",
        "title": "Titolo accattivante",
        "description": "Descrizione del valore",
        "personalizedContent": {
          "headline": "Headline magnetica",
          "subheadline": "Sottotitolo coinvolgente",
          "body": "Corpo del testo persuasivo",
          "benefits": ["Beneficio1", "Beneficio2", "Beneficio3"],
          "socialProof": ["Testimonianza1", "Dato2", "Prova3"],
          "objectionHandling": ["Obiezione1", "Obiezione2"]
        },
        "fieldsConfig": [
          {
            "id": "nome_campo",
            "type": "text/email/select/checkbox",
            "label": "Label campo",
            "placeholder": "Placeholder",
            "required": true,
            "options": ["per select"]
          }
        ],
        "settings": {
          "submitButtonText": "Testo button specifico",
          "allowBack": false,
          "showProgress": true
        }
      }
    ],
    "settings": {
      "adaptiveElements": true,
      "dynamicContent": true,
      "personalizedMessaging": true
    },
    "personalizationScore": 95,
    "uniquenessScore": 88,
    "conversionOptimization": {
      "primaryGoal": "Obiettivo principale",
      "optimizationStrategies": ["Strategia1", "Strategia2"],
      "conversionTriggers": ["Trigger1", "Trigger2"]
    }
  };

  const fullPrompt = `${systemPrompt}

STRUTTURA JSON RICHIESTA:
${JSON.stringify(jsonStructure, null, 2)}

REGOLE CRITICHE:
1. Usa SOLO i step_type validi: lead_capture, qualification, discovery, conversion
2. Personalizza al 100% per "${request.productName}"
3. Rendi l'esperienza unica e memorabile
4. Ottimizza per la conversione
5. Includi elementi emotivi e razionali
6. Crea contenuti specifici, non generici

GENERA L'ESPERIENZA PERSONALIZZATA:`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Sei un esperto di marketing e personalizzazione che genera esperienze uniche.' },
          { role: 'user', content: fullPrompt }
        ],
        temperature: 0.8,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('✅ OpenAI response received, parsing...');
    
    // Parse JSON response
    let cleanContent = content.trim();
    cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    
    const jsonStart = cleanContent.indexOf('{');
    const jsonEnd = cleanContent.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
    }

    const parsedData = JSON.parse(cleanContent);
    
    // Validate and enhance the experience
    const enhancedExperience = await enhanceExperience(parsedData, request);
    
    console.log('🎯 Intelligent experience generated successfully:', {
      name: enhancedExperience.name,
      steps: enhancedExperience.steps?.length || 0,
      personalizationScore: enhancedExperience.personalizationScore
    });

    return enhancedExperience;

  } catch (error) {
    console.error('❌ OpenAI generation failed:', error);
    throw error;
  }
};

const enhanceExperience = async (experience: any, request: IntelligentFunnelRequest): Promise<any> => {
  // Validate step types
  const validStepTypes = ['lead_capture', 'qualification', 'discovery', 'conversion', 'contact_form', 'thank_you'];
  
  if (experience.steps) {
    experience.steps = experience.steps.map((step: any, index: number) => {
      if (!validStepTypes.includes(step.stepType)) {
        console.warn(`Invalid step type: ${step.stepType}, using 'qualification'`);
        step.stepType = 'qualification';
      }
      
      // Ensure required fields
      return {
        stepOrder: step.stepOrder || (index + 1),
        stepType: step.stepType,
        title: step.title || `Step ${index + 1}`,
        description: step.description || '',
        personalizedContent: step.personalizedContent || {
          headline: step.title,
          subheadline: step.description,
          body: step.description,
          benefits: [],
          socialProof: [],
          objectionHandling: []
        },
        fieldsConfig: Array.isArray(step.fieldsConfig) ? step.fieldsConfig : [],
        settings: {
          submitButtonText: step.settings?.submitButtonText || 'Continua',
          allowBack: step.settings?.allowBack !== false,
          showProgress: step.settings?.showProgress !== false,
          ...step.settings
        }
      };
    });
  }

  // Ensure required fields
  return {
    name: experience.name || `Esperienza per ${request.productName}`,
    description: experience.description || `Esperienza personalizzata per ${request.productName}`,
    theme: experience.theme || {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      style: 'modern'
    },
    narrative: experience.narrative || {
      storyline: `Discover the power of ${request.productName}`,
      keyMessages: ['Quality', 'Innovation', 'Results'],
      callToActions: ['Get Started', 'Learn More', 'Buy Now'],
      personalTouches: ['Personalized approach', 'Tailored solutions']
    },
    steps: experience.steps || [],
    settings: experience.settings || {
      adaptiveElements: true,
      dynamicContent: true,
      personalizedMessaging: true
    },
    personalizationScore: experience.personalizationScore || 85,
    uniquenessScore: experience.uniquenessScore || 80,
    conversionOptimization: experience.conversionOptimization || {
      primaryGoal: 'Lead Generation',
      optimizationStrategies: ['Personalization', 'Social Proof'],
      conversionTriggers: ['Urgency', 'Scarcity']
    }
  };
};

const saveExperienceToDatabase = async (experience: any, request: IntelligentFunnelRequest): Promise<any> => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Generate share token
  const shareToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  // Save main funnel
  const { data: funnel, error: funnelError } = await supabase
    .from('interactive_funnels')
    .insert({
      name: experience.name,
      description: experience.description,
      created_by: request.userId,
      share_token: shareToken,
      is_public: true,
      status: 'active',
      settings: {
        ...experience.settings,
        theme: experience.theme,
        narrative: experience.narrative,
        conversionOptimization: experience.conversionOptimization,
        generatedBy: 'intelligent_orchestrator',
        generatedAt: new Date().toISOString(),
        originalRequest: request
      }
    })
    .select()
    .single();

  if (funnelError) {
    console.error('❌ Funnel save error:', funnelError);
    throw new Error(`Database error: ${funnelError.message}`);
  }

  // Save steps
  if (experience.steps && experience.steps.length > 0) {
    const steps = experience.steps.map((step: any) => ({
      funnel_id: funnel.id,
      step_order: step.stepOrder,
      step_type: step.stepType,
      title: step.title,
      description: step.description,
      fields_config: step.fieldsConfig,
      settings: {
        ...step.settings,
        personalizedContent: step.personalizedContent
      }
    }));

    const { error: stepsError } = await supabase
      .from('interactive_funnel_steps')
      .insert(steps);

    if (stepsError) {
      console.error('❌ Steps save error:', stepsError);
      throw new Error(`Steps save error: ${stepsError.message}`);
    }
  }

  return {
    id: funnel.id,
    shareToken,
    stepsCount: experience.steps?.length || 0
  };
};

serve(async (req) => {
  console.log('=== INTELLIGENT FUNNEL ORCHESTRATOR STARTED ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: IntelligentFunnelRequest = await req.json();
    
    console.log('📥 Intelligent funnel request received:', {
      productName: request.productName,
      analysisDepth: request.analysisDepth,
      personalizationLevel: request.personalizationLevel,
      includeWebResearch: request.includeWebResearch,
      userId: request.userId ? 'present' : 'missing'
    });

    // Validate request
    if (!request.userPrompt || !request.productName || !request.userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: userPrompt, productName, userId'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const startTime = Date.now();

    // Generate intelligent experience
    const experience = await generateIntelligentExperience(request);

    // Save to database
    const databaseRecord = await saveExperienceToDatabase(experience, request);

    const processingTime = Date.now() - startTime;

    // Return response
    return new Response(JSON.stringify({
      success: true,
      experience,
      databaseRecord,
      metadata: {
        processingTime,
        confidenceScore: experience.personalizationScore || 85,
        uniquenessScore: experience.uniquenessScore || 80,
        qualityScore: 90,
        generatedBy: 'intelligent_orchestrator',
        generatedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Intelligent orchestrator error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error',
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
