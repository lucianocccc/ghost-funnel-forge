
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Utility function to sanitize and validate funnel data
const sanitizeAndValidateFunnelData = (data: any, originalPrompt: string) => {
  console.log('🔍 Validating funnel data:', {
    hasName: !!data?.name,
    hasSteps: !!data?.steps,
    stepsCount: data?.steps?.length || 0,
    hasSettings: !!data?.settings
  });

  // Ensure we have a valid name
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    console.log('⚠️ Missing or invalid name, generating from prompt');
    data.name = `Funnel per ${originalPrompt.substring(0, 50).trim()}`;
  }

  // Ensure we have a description
  if (!data.description || typeof data.description !== 'string') {
    data.description = `Funnel personalizzato generato per: ${originalPrompt}`;
  }

  // Ensure we have steps array with variety
  if (!Array.isArray(data.steps) || data.steps.length === 0) {
    console.log('⚠️ Missing or invalid steps, creating creative default');
    data.steps = createCreativeDefaultSteps(originalPrompt);
  }

  // Ensure we have settings
  if (!data.settings || typeof data.settings !== 'object') {
    data.settings = {};
  }

  // Clean the name and description
  data.name = data.name.trim().substring(0, 255);
  if (data.description && typeof data.description === 'string') {
    data.description = data.description.trim().substring(0, 1000);
  }

  console.log('✅ Validated funnel data:', {
    name: data.name,
    description: data.description?.substring(0, 100) + '...',
    stepsCount: data.steps.length,
    stepTypes: data.steps.map((s: any) => s.step_type)
  });

  return data;
};

// Create creative default steps based on prompt analysis
const createCreativeDefaultSteps = (prompt: string) => {
  const lowerPrompt = prompt.toLowerCase();
  const steps = [];
  
  // Analyze the business type and create appropriate steps
  if (lowerPrompt.includes('e-commerce') || lowerPrompt.includes('negozio') || lowerPrompt.includes('vendita')) {
    steps.push({
      step_order: 1,
      step_type: "quiz",
      title: "Qual è il tuo stile?",
      description: "Aiutaci a capire le tue preferenze per consigliarti i prodotti migliori",
      fields_config: [
        {type: "radio", name: "stile", label: "Che stile preferisci?", required: true, options: ["Moderno", "Classico", "Minimalista", "Eclettico"]},
        {type: "select", name: "budget", label: "Qual è il tuo budget?", required: true, options: ["< 100€", "100-500€", "500-1000€", "> 1000€"]},
        {type: "checkbox", name: "caratteristiche", label: "Caratteristiche importanti", required: false, options: ["Qualità premium", "Prezzo conveniente", "Design unico", "Sostenibilità"]}
      ]
    });
  } else if (lowerPrompt.includes('consulenza') || lowerPrompt.includes('servizio') || lowerPrompt.includes('coaching')) {
    steps.push({
      step_order: 1,
      step_type: "assessment",
      title: "Valutazione delle tue esigenze",
      description: "Analizziamo la tua situazione attuale per offrirti la soluzione migliore",
      fields_config: [
        {type: "scale", name: "urgenza", label: "Quanto è urgente la tua esigenza?", required: true, min: 1, max: 10},
        {type: "textarea", name: "situazione", label: "Descrivi brevemente la tua situazione attuale", required: true, placeholder: "Raccontaci cosa ti ha portato qui..."},
        {type: "select", name: "esperienza", label: "La tua esperienza in questo ambito", required: true, options: ["Principiante", "Intermedio", "Avanzato", "Esperto"]}
      ]
    });
  } else if (lowerPrompt.includes('app') || lowerPrompt.includes('software') || lowerPrompt.includes('digitale')) {
    steps.push({
      step_order: 1,
      step_type: "demo_request",
      title: "Scopri come funziona",
      description: "Vedi in anteprima le funzionalità principali",
      fields_config: [
        {type: "select", name: "ruolo", label: "Qual è il tuo ruolo?", required: true, options: ["CEO/Founder", "Manager", "Sviluppatore", "Marketing", "Altro"]},
        {type: "number", name: "team_size", label: "Dimensione del team", required: false, placeholder: "Quante persone nel tuo team?"},
        {type: "checkbox", name: "funzionalita", label: "Funzionalità di interesse", required: true, options: ["Analytics", "Automazione", "Integrations", "Mobile App", "API"]}
      ]
    });
  } else {
    // Default creative form
    steps.push({
      step_order: 1,
      step_type: "discovery",
      title: "Scopriamo le tue esigenze",
      description: "Alcune domande per creare la soluzione perfetta per te",
      fields_config: [
        {type: "text", name: "nome", label: "Nome", required: true, placeholder: "Il tuo nome"},
        {type: "email", name: "email", label: "Email", required: true, placeholder: "La tua email"},
        {type: "tel", name: "telefono", label: "Telefono", required: false, placeholder: "Il tuo numero"},
        {type: "textarea", name: "obiettivo", label: "Qual è il tuo obiettivo principale?", required: true, placeholder: "Descrivi cosa vorresti ottenere..."},
        {type: "select", name: "timeline", label: "Quando vorresti iniziare?", required: true, options: ["Subito", "Entro 1 mese", "Entro 3 mesi", "Entro 6 mesi", "Non ho fretta"]}
      ]
    });
  }

  return steps;
};

// Utility function to parse OpenAI response with multiple fallback strategies
const parseOpenAIResponse = (content: string, originalPrompt: string) => {
  console.log('🔄 Parsing OpenAI response, content length:', content.length);
  
  let cleanContent = content.trim();
  
  try {
    // Remove markdown code blocks
    cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    
    // Find JSON boundaries
    const jsonStart = cleanContent.indexOf('{');
    const jsonEnd = cleanContent.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
    }

    const parsedData = JSON.parse(cleanContent);
    console.log('✅ Successfully parsed JSON from OpenAI');

    // Handle nested structure (if response is wrapped in "funnel" key)
    let funnelData = parsedData;
    if (parsedData.funnel && typeof parsedData.funnel === 'object') {
      console.log('📦 Extracting funnel from nested structure');
      funnelData = parsedData.funnel;
    }

    return sanitizeAndValidateFunnelData(funnelData, originalPrompt);
    
  } catch (parseError) {
    console.error('❌ JSON parsing failed:', parseError.message);
    console.log('📝 Creating creative fallback funnel data');
    
    // Create comprehensive fallback data with creative steps
    return sanitizeAndValidateFunnelData({
      name: `Funnel per ${originalPrompt.substring(0, 50)}`,
      description: `Funnel personalizzato per ${originalPrompt}`,
      steps: createCreativeDefaultSteps(originalPrompt),
      settings: {
        productSpecific: true,
        focusType: "consultative",
        product_name: originalPrompt.substring(0, 100),
        personalizedSections: {
          hero: {
            title: `Scopri ${originalPrompt.substring(0, 30)}`,
            subtitle: "Soluzioni personalizzate per te",
            value_proposition: "Ti aiutiamo a raggiungere i tuoi obiettivi",
            cta_text: "Inizia ora"
          }
        },
        customer_facing: {
          hero_title: `Trasforma il tuo ${originalPrompt.substring(0, 30)}`,
          hero_subtitle: "Soluzioni professionali per risultati concreti",
          value_proposition: "Un approccio personalizzato per il tuo successo",
          style_theme: "modern"
        }
      }
    }, originalPrompt);
  }
};

// Enhanced OpenAI call with creative prompting
const callOpenAIWithRetry = async (openAIApiKey: string, prompt: string, maxRetries = 2) => {
  // Determine business sector and funnel type
  const lowerPrompt = prompt.toLowerCase();
  let sectorSpecificGuidance = "";
  let suggestedStepTypes = [];

  if (lowerPrompt.includes('e-commerce') || lowerPrompt.includes('negozio') || lowerPrompt.includes('vendita')) {
    sectorSpecificGuidance = `
    SETTORE E-COMMERCE - Crea un funnel specifico per la vendita online:
    - Usa quiz per la product discovery
    - Includi step di social proof con recensioni
    - Aggiungi urgency con countdown o stock limitato
    - Personalizza le raccomandazioni prodotto`;
    suggestedStepTypes = ["quiz", "product_showcase", "social_proof", "urgency_builder", "checkout_form"];
  } else if (lowerPrompt.includes('consulenza') || lowerPrompt.includes('coaching') || lowerPrompt.includes('servizio')) {
    sectorSpecificGuidance = `
    SETTORE SERVIZI/CONSULENZA - Crea un funnel per servizi professionali:
    - Inizia con assessment delle esigenze
    - Includi step di qualification del lead
    - Mostra case studies e risultati
    - Proponi call di discovery gratuita`;
    suggestedStepTypes = ["assessment", "qualification", "case_study", "calendar_booking", "discovery_form"];
  } else if (lowerPrompt.includes('app') || lowerPrompt.includes('software') || lowerPrompt.includes('saas')) {
    sectorSpecificGuidance = `
    SETTORE TECH/SOFTWARE - Crea un funnel per prodotti digitali:
    - Offri demo interattiva o free trial
    - Mostra features attraverso step progressivi
    - Includi step di onboarding
    - Fai qualification tecnica del prospect`;
    suggestedStepTypes = ["demo_request", "feature_selection", "technical_qualification", "trial_signup", "onboarding"];
  } else if (lowerPrompt.includes('immobiliare') || lowerPrompt.includes('casa') || lowerPrompt.includes('proprietà')) {
    sectorSpecificGuidance = `
    SETTORE IMMOBILIARE - Crea un funnel per real estate:
    - Inizia con preferenze di ricerca
    - Includi calculatore budget/mutuo
    - Mostra proprietà simili
    - Raccogli criteri specifici di ricerca`;
    suggestedStepTypes = ["property_preferences", "budget_calculator", "location_selector", "viewing_scheduler", "contact_form"];
  } else if (lowerPrompt.includes('salute') || lowerPrompt.includes('medico') || lowerPrompt.includes('benessere')) {
    sectorSpecificGuidance = `
    SETTORE SALUTE/BENESSERE - Crea un funnel per servizi sanitari:
    - Inizia con assessment dei sintomi/esigenze
    - Includi questionario medico semplificato
    - Mostra specializzazioni disponibili
    - Facilita prenotazione consulto`;
    suggestedStepTypes = ["health_assessment", "symptom_checker", "specialist_finder", "appointment_booking", "medical_form"];
  } else {
    suggestedStepTypes = ["discovery", "qualification", "value_demonstration", "social_proof", "conversion_form"];
  }

  const systemPrompt = `Sei un esperto di marketing conversazionale e funnel building con 15+ anni di esperienza. 
  Il tuo obiettivo è creare funnel COMPLETAMENTE PERSONALIZZATI che si adattano al business specifico.

  REGOLE FONDAMENTALI:
  1. NON usare mai lo stesso tipo di step - diversifica sempre
  2. Crea step SPECIFICI per il settore (non generici)
  3. Usa psicologia del consumatore appropriata al business
  4. Ogni step deve avere uno scopo strategico preciso
  5. Personalizza completamente campi, domande e flow

  ${sectorSpecificGuidance}

  TIPI DI STEP DISPONIBILI (USA VARI TIPI):
  - "quiz" → Per product discovery, personalizzazione, segmentazione
  - "assessment" → Per valutare esigenze, problemi, situazione attuale  
  - "calculator" → Per budget, ROI, dimensionamento, pricing
  - "demo_request" → Per software, servizi premium, B2B
  - "calendar_booking" → Per consulenze, appuntamenti, demo
  - "discovery" → Per raccolta esigenze iniziali, qualification
  - "social_proof" → Per testimonial interattive, case studies
  - "urgency_builder" → Per scarcity, limited time offers
  - "product_showcase" → Per mostrare prodotti, features, benefici
  - "qualification" → Per verificare fit cliente-servizio
  - "form" → Solo come ultimo step per dati finali

  ESEMPI DI CREATIVITÀ PER SETTORE:
  
  E-COMMERCE MODA:
  Step 1: Quiz stile personale (radio buttons per stili, checkbox occasioni)
  Step 2: Calculator budget + wishlist size 
  Step 3: Product showcase personalizzato
  Step 4: Urgency builder (stock limitato, sconti tempo limitato)

  CONSULENZA BUSINESS:
  Step 1: Assessment situazione aziendale (scale 1-10, textarea problemi)
  Step 2: Qualification budget e timeline (select range, radio urgenza)
  Step 3: Case study selector (checkbox settori interesse)
  Step 4: Calendar booking consulenza strategica

  SOFTWARE B2B:
  Step 1: Demo request con ruolo/industry (select, number team size)
  Step 2: Feature selection priority (drag&drop, checkbox)
  Step 3: Technical qualification (select current tools, radio experience)
  Step 4: Trial signup con onboarding preferences

  IMPORTANTE SULLA CONFIGURAZIONE CAMPI:
  - Usa field types specifici: radio, checkbox, select, scale, textarea, number
  - Personalizza labels e placeholder per il business
  - Crea options meaningful per il settore
  - Aggiungi validation appropriata

  STEP TYPES DA USARE IN BASE AL PROMPT:
  ${suggestedStepTypes.join(', ')}

  Restituisci SOLO un oggetto JSON valido con questa ESATTA struttura:

  {
    "name": "Nome funnel specifico e attrattivo",
    "description": "Descrizione dettagliata del valore e processo",
    "steps": [
      {
        "step_order": 1,
        "step_type": "uno_dei_tipi_sopra",
        "title": "Titolo step specifico e coinvolgente",
        "description": "Descrizione che spiega valore dello step",
        "fields_config": [
          {
            "type": "radio|checkbox|select|scale|textarea|number|text|email|tel",
            "name": "nome_campo_meaningful", 
            "label": "Label specifica per il business",
            "required": true|false,
            "placeholder": "Placeholder helpful se applicabile",
            "options": ["opzioni", "specifiche", "settore"] // solo per radio/checkbox/select
            "min": 1, "max": 10 // solo per scale/number
          }
        ],
        "settings": {
          "submitButtonText": "CTA specifica step (non generico 'Avanti')",
          "description": "Testo motivazionale sotto il form",
          "validation_rules": "regole specifiche se necessarie"
        }
      }
    ],
    "settings": {
      "productSpecific": true,
      "focusType": "consultative|sales|discovery|qualification",
      "product_name": "Nome prodotto/servizio",
      "industry": "settore specifico",
      "target_psychology": "psicologia target audience",
      "personalizedSections": {
        "hero": {
          "title": "Titolo magnetico specifico problema/desiderio",
          "subtitle": "Sottotitolo che amplifica valore proposition", 
          "value_proposition": "Proposta valore unica e differenziante",
          "cta_text": "CTA specifica prima azione"
        },
        "conversion_strategy": {
          "primary_emotion": "emozione principale da scatenare",
          "objection_handling": ["obiezione1", "obiezione2"],
          "urgency_mechanism": "tipo urgency appropriata al business"
        }
      },
      "customer_facing": {
        "hero_title": "Titolo pubblico orientato beneficio",
        "hero_subtitle": "Sottotitolo che risolve problema specifico",
        "value_proposition": "Value prop customer-facing",
        "style_theme": "modern|professional|creative|trustworthy"
      }
    }
  }`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🚀 OpenAI API call attempt ${attempt}/${maxRetries}`);
      
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
            { role: 'user', content: `Crea un funnel COMPLETAMENTE PERSONALIZZATO per: ${prompt}` }
          ],
          temperature: 0.8,
          max_tokens: 4000
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`OpenAI API error: ${aiResponse.status} - ${aiResponse.statusText}`);
      }

      const aiData = await aiResponse.json();
      console.log('✅ OpenAI response received successfully');
      
      return aiData.choices[0].message.content;
      
    } catch (error) {
      console.error(`❌ OpenAI attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};

serve(async (req) => {
  console.log('=== GENERATE CREATIVE INTERACTIVE FUNNEL AI FUNCTION STARTED ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, userId, saveToLibrary = true } = await req.json();
    
    console.log('📥 Request received:', {
      promptLength: prompt?.length || 0,
      userId: userId ? 'present' : 'missing',
      saveToLibrary
    });
    
    if (!prompt || !userId) {
      console.error('❌ Missing required fields:', { prompt: !!prompt, userId: !!userId });
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Prompt e userId richiesti" 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Sanitize input prompt
    const sanitizedPrompt = prompt.trim().substring(0, 2000);
    if (sanitizedPrompt.length === 0) {
      throw new Error('Prompt vuoto dopo sanitizzazione');
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configurazione Supabase mancante');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key non configurata');
    }

    console.log('🤖 Calling OpenAI API for creative funnel generation...');
    const aiContent = await callOpenAIWithRetry(openAIApiKey, sanitizedPrompt);
    
    console.log('🔄 Parsing creative OpenAI response...');
    const funnelData = parseOpenAIResponse(aiContent, sanitizedPrompt);

    // Final validation before database insertion
    if (!funnelData.name || funnelData.name.trim().length === 0) {
      console.error('❌ Critical error: funnel name is still empty after all validations');
      throw new Error('Impossibile generare un nome valido per il funnel');
    }

    // Create the funnel in database if saveToLibrary is true
    if (saveToLibrary) {
      console.log('💾 Saving creative funnel to database...');
      
      // Generate unique share token
      const shareToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');

      console.log('📝 Inserting creative funnel record:', {
        name: funnelData.name,
        description: funnelData.description?.substring(0, 100) + '...',
        userId: userId,
        stepTypes: funnelData.steps?.map((s: any) => s.step_type).join(', ')
      });

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
        console.error('❌ Database insertion error:', funnelError);
        throw new Error(`Errore nel salvare il funnel: ${funnelError.message}`);
      }

      console.log('✅ Creative funnel saved successfully with ID:', funnelResult.id);

      // Save funnel steps
      if (funnelData.steps && Array.isArray(funnelData.steps) && funnelData.steps.length > 0) {
        console.log('📝 Inserting creative funnel steps...');
        
        const stepsToInsert = funnelData.steps.map((step: any, index: number) => ({
          funnel_id: funnelResult.id,
          step_order: step.step_order || (index + 1),
          step_type: step.step_type || 'form',
          title: step.title || `Step ${index + 1}`,
          description: step.description || '',
          fields_config: step.fields_config || [],
          settings: step.settings || {}
        }));

        const { error: stepsError } = await supabase
          .from('interactive_funnel_steps')
          .insert(stepsToInsert);

        if (stepsError) {
          console.error('⚠️ Steps insertion error:', stepsError);
          // Don't throw here, funnel is already created
        } else {
          console.log('✅ Creative steps saved successfully');
        }
      }

      // Prepare successful response
      const responseData = {
        id: funnelResult.id,
        name: funnelData.name,
        description: funnelData.description,
        share_token: shareToken,
        steps: funnelData.steps || [],
        settings: funnelData.settings || {},
        customer_facing: funnelData.customer_facing || {},
        advanced_funnel_data: funnelData,
        target_audience: sanitizedPrompt.includes('target') ? sanitizedPrompt.split('target')[1]?.substring(0, 200) : null,
        industry: sanitizedPrompt.includes('settore') ? sanitizedPrompt.split('settore')[1]?.substring(0, 100) : null
      };

      console.log('🎉 Success! Returning creative funnel response data');
      return new Response(JSON.stringify({ 
        success: true,
        funnel: responseData,
        savedToLibrary: true,
        message: 'Funnel personalizzato e creativo generato con successo'
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else {
      // Return data without saving to database
      console.log('📤 Returning creative funnel data without saving');
      
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
    console.error('💥 Critical error in creative funnel function:', error);
    
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
