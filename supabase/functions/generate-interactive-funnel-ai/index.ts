
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Valid step types as per database constraint
const VALID_STEP_TYPES = [
  'lead_capture',
  'qualification',
  'discovery',
  'conversion',
  'contact_form',
  'thank_you'
];

// Mapping from creative step types to valid database types
const STEP_TYPE_MAPPING: Record<string, string> = {
  // AI-generated creative types -> valid database types
  'quiz': 'qualification',
  'assessment': 'qualification', 
  'calculator': 'qualification',
  'demo_request': 'lead_capture',
  'calendar_booking': 'contact_form',
  'social_proof': 'discovery',
  'urgency_builder': 'conversion',
  'product_showcase': 'discovery',
  'trial_signup': 'lead_capture',
  'lead_magnet': 'lead_capture',
  'feature_selection': 'qualification',
  'technical_qualification': 'qualification',
  'onboarding': 'discovery',
  'property_preferences': 'qualification',
  'budget_calculator': 'qualification',
  'location_selector': 'qualification',
  'viewing_scheduler': 'contact_form',
  'health_assessment': 'qualification',
  'symptom_checker': 'qualification',
  'specialist_finder': 'discovery',
  'appointment_booking': 'contact_form',
  'medical_form': 'contact_form',
  'case_study': 'discovery',
  'discovery_form': 'discovery',
  // Fallback mappings
  'form': 'contact_form',
  'contact': 'contact_form',
  'submit': 'conversion',
  'final': 'conversion'
};

// Function to normalize step type to valid database type
const normalizeStepType = (stepType: string): string => {
  const normalized = stepType.toLowerCase().trim();
  
  // Direct match
  if (VALID_STEP_TYPES.includes(normalized)) {
    return normalized;
  }
  
  // Mapped type
  if (STEP_TYPE_MAPPING[normalized]) {
    return STEP_TYPE_MAPPING[normalized];
  }
  
  // Fallback based on common patterns
  if (normalized.includes('quiz') || normalized.includes('assessment') || normalized.includes('qualif')) {
    return 'qualification';
  }
  if (normalized.includes('capture') || normalized.includes('lead') || normalized.includes('signup')) {
    return 'lead_capture';
  }
  if (normalized.includes('contact') || normalized.includes('form') || normalized.includes('booking')) {
    return 'contact_form';
  }
  if (normalized.includes('discovery') || normalized.includes('showcase') || normalized.includes('demo')) {
    return 'discovery';
  }
  if (normalized.includes('convert') || normalized.includes('final') || normalized.includes('submit')) {
    return 'conversion';
  }
  
  // Default fallback
  return 'qualification';
};

// Utility function to sanitize and validate funnel data
const sanitizeAndValidateFunnelData = (data: any, originalPrompt: string, funnelType?: any) => {
  console.log('🔍 Validating funnel data:', {
    hasName: !!data?.name,
    hasSteps: !!data?.steps,
    stepsCount: data?.steps?.length || 0,
    hasSettings: !!data?.settings,
    funnelType: funnelType?.name || 'custom'
  });

  // Ensure we have a valid name
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    console.log('⚠️ Missing or invalid name, generating from prompt');
    data.name = funnelType?.name ? `${funnelType.name} - ${originalPrompt.substring(0, 30)}` : `Funnel per ${originalPrompt.substring(0, 50).trim()}`;
  }

  // Ensure we have a description
  if (!data.description || typeof data.description !== 'string') {
    data.description = funnelType?.description || `Funnel personalizzato generato per: ${originalPrompt}`;
  }

  // Use template steps if available and no custom steps provided
  if (funnelType?.template_steps && (!Array.isArray(data.steps) || data.steps.length === 0)) {
    console.log('📋 Using template steps from funnel type');
    data.steps = funnelType.template_steps.map((templateStep: any, index: number) => ({
      step_order: index + 1,
      step_type: normalizeStepType(templateStep.type),
      title: templateStep.title,
      description: templateStep.description || '',
      fields_config: templateStep.fields_config || createDefaultFieldsForStep(normalizeStepType(templateStep.type)),
      settings: templateStep.settings || { submitButtonText: 'Continua' }
    }));
  } else if (!Array.isArray(data.steps) || data.steps.length === 0) {
    console.log('⚠️ Missing or invalid steps, creating default');
    data.steps = createDefaultSteps(originalPrompt);
  }

  // Normalize all step types and validate structure
  data.steps = data.steps.map((step: any, index: number) => {
    const originalType = step.step_type || step.type || 'qualification';
    const normalizedType = normalizeStepType(originalType);
    
    console.log(`Step ${index + 1}: ${originalType} -> ${normalizedType}`);
    
    return {
      step_order: step.step_order || (index + 1),
      step_type: normalizedType,
      title: step.title || `Step ${index + 1}`,
      description: step.description || '',
      fields_config: Array.isArray(step.fields_config) ? step.fields_config : createDefaultFieldsForStep(normalizedType),
      settings: step.settings || { submitButtonText: 'Continua' },
      is_required: step.is_required !== false
    };
  });

  // Merge settings from funnel type if available
  if (!data.settings || typeof data.settings !== 'object') {
    data.settings = {};
  }
  
  if (funnelType?.conversion_optimization) {
    data.settings = { ...data.settings, ...funnelType.conversion_optimization };
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

// Create default fields for specific step types
const createDefaultFieldsForStep = (stepType: string) => {
  switch (stepType) {
    case 'lead_capture':
      return [
        {
          id: 'name',
          type: 'text',
          label: 'Nome',
          required: true,
          placeholder: 'Il tuo nome'
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email',
          required: true,
          placeholder: 'La tua email'
        }
      ];
    case 'contact_form':
      return [
        {
          id: 'phone',
          type: 'tel',
          label: 'Telefono',
          required: false,
          placeholder: 'Il tuo numero di telefono'
        },
        {
          id: 'message',
          type: 'textarea',
          label: 'Messaggio',
          required: false,
          placeholder: 'Come possiamo aiutarti?'
        }
      ];
    case 'qualification':
      return [
        {
          id: 'needs',
          type: 'checkbox',
          label: 'Cosa stai cercando?',
          required: true,
          options: ['Qualità', 'Prezzo', 'Velocità', 'Supporto', 'Innovazione']
        }
      ];
    default:
      return [];
  }
};

// Create default steps with valid types
const createDefaultSteps = (prompt: string) => {
  const lowerPrompt = prompt.toLowerCase();
  const steps = [];
  
  // Always start with lead capture
  steps.push({
    step_order: 1,
    step_type: "lead_capture",
    title: "Iniziamo",
    description: "Condividi con noi le tue informazioni di base",
    fields_config: createDefaultFieldsForStep('lead_capture'),
    settings: {
      submitButtonText: 'Continua'
    }
  });

  // Add qualification step
  steps.push({
    step_order: 2,
    step_type: "qualification",
    title: "Scopri le tue esigenze",
    description: "Aiutaci a capire meglio le tue necessità",
    fields_config: createDefaultFieldsForStep('qualification'),
    settings: {
      submitButtonText: 'Avanti'
    }
  });

  // Add final contact form
  steps.push({
    step_order: 3,
    step_type: "contact_form",
    title: "Parliamone",
    description: "Lasciaci i tuoi dati per essere ricontattato",
    fields_config: createDefaultFieldsForStep('contact_form'),
    settings: {
      submitButtonText: 'Invia richiesta'
    }
  });

  return steps;
};

// Enhanced OpenAI call with funnel type context
const callOpenAIWithRetry = async (openAIApiKey: string, prompt: string, funnelType?: any, maxRetries = 2) => {
  let systemPrompt = `Sei un esperto di marketing conversazionale e funnel building. 
  Il tuo obiettivo è creare funnel personalizzati che convertono.

  IMPORTANTE: Usa SOLO questi tipi di step validi:
  - "lead_capture" → Per raccogliere contatti iniziali
  - "qualification" → Per qualificare e comprendere le esigenze
  - "discovery" → Per far scoprire valore e caratteristiche
  - "conversion" → Per conversioni e vendite
  - "contact_form" → Per form di contatto e prenotazioni
  - "thank_you" → Per pagine di ringraziamento

  NON usare altri tipi di step. Ogni step deve avere uno di questi tipi esatti.`;

  // Use specialized system prompt if funnel type is provided
  if (funnelType?.ai_prompts?.system_prompt) {
    systemPrompt = `${funnelType.ai_prompts.system_prompt}

    IMPORTANTE: Usa SOLO questi tipi di step validi:
    - "lead_capture" → Per raccogliere contatti iniziali
    - "qualification" → Per qualificare e comprendere le esigenze
    - "discovery" → Per far scoprire valore e caratteristiche
    - "conversion" → Per conversioni e vendite
    - "contact_form" → Per form di contatto e prenotazioni
    - "thank_you" → Per pagine di ringraziamento

    Focus specifico: ${funnelType.ai_prompts.focus}
    Metriche chiave da ottimizzare: ${funnelType.ai_prompts.key_metrics?.join(', ')}`;
  }

  systemPrompt += `

  STRUTTURA JSON RICHIESTA:

  {
    "name": "Nome funnel specifico e attrattivo",
    "description": "Descrizione dettagliata del valore e processo",
    "steps": [
      {
        "step_order": 1,
        "step_type": "lead_capture",
        "title": "Titolo step specifico",
        "description": "Descrizione che spiega valore dello step",
        "fields_config": [
          {
            "id": "nome_campo",
            "type": "text|email|textarea|select|radio|checkbox",
            "label": "Label campo",
            "required": true,
            "placeholder": "Placeholder se applicabile",
            "options": ["opzione1", "opzione2"] // solo per select/radio/checkbox
          }
        ],
        "settings": {
          "submitButtonText": "Testo button specifico"
        }
      }
    ],
    "settings": {
      "productSpecific": true,
      "focusType": "consultative",
      "personalizedSections": {
        "hero": {
          "title": "Titolo magnetico",
          "subtitle": "Sottotitolo coinvolgente",
          "value_proposition": "Proposta di valore unica",
          "cta_text": "CTA specifica"
        }
      }
    }
  }

  REGOLE:
  1. Usa solo i tipi di step validi indicati sopra
  2. Crea massimo 3-4 step per funnel
  3. Inizia sempre con "lead_capture" o "qualification"
  4. Finisci con "conversion" o "contact_form"
  5. Personalizza completamente per il business specifico`;

  let userPrompt = `Crea un funnel personalizzato per: ${prompt}`;
  
  if (funnelType) {
    userPrompt = `Crea un funnel di tipo "${funnelType.name}" per: ${prompt}
    
    Contesto del tipo di funnel:
    - Categoria: ${funnelType.category}
    - Settore: ${funnelType.industry || 'generale'}
    - Target: ${funnelType.target_audience || 'generale'}
    - Livello: ${funnelType.complexity_level}
    - Descrizione: ${funnelType.description}`;
  }

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
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 3000
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
      
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};

// Utility function to parse OpenAI response with multiple fallback strategies
const parseOpenAIResponse = (content: string, originalPrompt: string, funnelType?: any) => {
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

    return sanitizeAndValidateFunnelData(funnelData, originalPrompt, funnelType);
    
  } catch (parseError) {
    console.error('❌ JSON parsing failed:', parseError.message);
    console.log('📝 Creating fallback funnel data');
    
    // Create comprehensive fallback data with valid step types
    return sanitizeAndValidateFunnelData({
      name: funnelType?.name ? `${funnelType.name} - ${originalPrompt.substring(0, 30)}` : `Funnel per ${originalPrompt.substring(0, 50)}`,
      description: funnelType?.description || `Funnel personalizzato per ${originalPrompt}`,
      steps: funnelType?.template_steps ? 
        funnelType.template_steps.map((step: any, index: number) => ({
          ...step,
          step_order: index + 1,
          step_type: normalizeStepType(step.type),
          fields_config: createDefaultFieldsForStep(normalizeStepType(step.type))
        })) : 
        createDefaultSteps(originalPrompt),
      settings: funnelType?.conversion_optimization || {
        productSpecific: true,
        focusType: "consultative",
        product_name: originalPrompt.substring(0, 100)
      }
    }, originalPrompt, funnelType);
  }
};

serve(async (req) => {
  console.log('=== GENERATE INTERACTIVE FUNNEL AI FUNCTION STARTED ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, userId, saveToLibrary = true, funnelTypeId } = await req.json();
    
    console.log('📥 Request received:', {
      promptLength: prompt?.length || 0,
      userId: userId ? 'present' : 'missing',
      saveToLibrary,
      funnelTypeId: funnelTypeId || 'none'
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

    // Fetch funnel type if provided
    let funnelType = null;
    if (funnelTypeId) {
      console.log('🔍 Fetching funnel type:', funnelTypeId);
      const { data: typeData, error: typeError } = await supabase
        .from('funnel_types')
        .select('*')
        .eq('id', funnelTypeId)
        .eq('is_active', true)
        .single();

      if (typeError) {
        console.error('⚠️ Error fetching funnel type:', typeError);
      } else {
        funnelType = typeData;
        console.log('✅ Funnel type loaded:', funnelType.name);
      }
    }

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key non configurata');
    }

    console.log('🤖 Calling OpenAI API for funnel generation...');
    const aiContent = await callOpenAIWithRetry(openAIApiKey, sanitizedPrompt, funnelType);
    
    console.log('🔄 Parsing OpenAI response...');
    const funnelData = parseOpenAIResponse(aiContent, sanitizedPrompt, funnelType);

    // Final validation before database insertion
    if (!funnelData.name || funnelData.name.trim().length === 0) {
      console.error('❌ Critical error: funnel name is still empty after all validations');
      throw new Error('Impossibile generare un nome valido per il funnel');
    }

    // Validate all step types are valid
    const invalidSteps = funnelData.steps.filter((step: any) => 
      !VALID_STEP_TYPES.includes(step.step_type)
    );
    
    if (invalidSteps.length > 0) {
      console.error('❌ Invalid step types found:', invalidSteps.map(s => s.step_type));
      throw new Error('Step types non validi generati');
    }

    // Create the funnel in database if saveToLibrary is true
    if (saveToLibrary) {
      console.log('💾 Saving funnel to database...');
      
      // Generate unique share token
      const shareToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');

      console.log('📝 Inserting funnel record:', {
        name: funnelData.name,
        description: funnelData.description?.substring(0, 100) + '...',
        userId: userId,
        funnelTypeId: funnelTypeId || null,
        stepTypes: funnelData.steps?.map((s: any) => s.step_type).join(', ')
      });

      const funnelInsertData: any = {
        name: funnelData.name,
        description: funnelData.description,
        created_by: userId,
        share_token: shareToken,
        is_public: true,
        status: 'active',
        settings: funnelData.settings || {}
      };

      // Add funnel type reference if provided
      if (funnelType) {
        funnelInsertData.settings.funnel_type_id = funnelType.id;
        funnelInsertData.settings.funnel_type_name = funnelType.name;
        funnelInsertData.settings.funnel_category = funnelType.category;
      }

      const { data: funnelResult, error: funnelError } = await supabase
        .from('interactive_funnels')
        .insert(funnelInsertData)
        .select()
        .single();

      if (funnelError) {
        console.error('❌ Database insertion error:', funnelError);
        throw new Error(`Errore nel salvare il funnel: ${funnelError.message}`);
      }

      console.log('✅ Funnel saved successfully with ID:', funnelResult.id);

      // Save funnel steps with additional validation
      if (funnelData.steps && Array.isArray(funnelData.steps) && funnelData.steps.length > 0) {
        console.log('📝 Inserting funnel steps...');
        
        const stepsToInsert = funnelData.steps.map((step: any, index: number) => {
          const stepType = normalizeStepType(step.step_type);
          
          // Final validation
          if (!VALID_STEP_TYPES.includes(stepType)) {
            console.error(`❌ Invalid step type after normalization: ${stepType}`);
            throw new Error(`Step type non valido: ${stepType}`);
          }
          
          return {
            funnel_id: funnelResult.id,
            step_order: step.step_order || (index + 1),
            step_type: stepType,
            title: step.title || `Step ${index + 1}`,
            description: step.description || '',
            fields_config: step.fields_config || [],
            settings: step.settings || {}
          };
        });

        console.log('📋 Steps to insert:', stepsToInsert.map(s => ({
          order: s.step_order,
          type: s.step_type,
          title: s.title
        })));

        const { error: stepsError } = await supabase
          .from('interactive_funnel_steps')
          .insert(stepsToInsert);

        if (stepsError) {
          console.error('❌ Steps insertion error:', stepsError);
          throw new Error(`Errore nel salvare gli step: ${stepsError.message}`);
        } else {
          console.log('✅ Steps saved successfully');
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
        funnel_type: funnelType,
        advanced_funnel_data: funnelData
      };

      console.log('🎉 Success! Returning funnel response data');
      return new Response(JSON.stringify({ 
        success: true,
        funnel: responseData,
        savedToLibrary: true,
        message: 'Funnel generato con successo'
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else {
      // Return data without saving to database
      console.log('📤 Returning funnel data without saving');
      
      const shareToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');

      const responseData = {
        id: shareToken,
        name: funnelData.name,
        description: funnelData.description,
        share_token: shareToken,
        steps: funnelData.steps || [],
        settings: funnelData.settings || {},
        funnel_type: funnelType,
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
    console.error('💥 Critical error in funnel function:', error);
    
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
