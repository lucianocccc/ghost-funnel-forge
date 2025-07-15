
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

  // Ensure we have steps array
  if (!Array.isArray(data.steps)) {
    console.log('⚠️ Missing or invalid steps, creating default');
    data.steps = [{
      step_order: 1,
      step_type: "form",
      title: "Richiedi Informazioni",
      description: "Form di contatto personalizzato",
      fields_config: [
        {type: "text", name: "nome", label: "Nome", required: true, placeholder: "Il tuo nome"},
        {type: "email", name: "email", label: "Email", required: true, placeholder: "La tua email"},
        {type: "tel", name: "telefono", label: "Telefono", required: false, placeholder: "Il tuo numero"},
        {type: "select", name: "esigenza", label: "Come possiamo aiutarti?", required: true, options: ["Informazioni", "Consulenza", "Preventivo", "Altro"]},
        {type: "textarea", name: "dettagli", label: "Descrivi le tue esigenze", required: false, placeholder: "Raccontaci di più..."}
      ],
      settings: {
        submitButtonText: "Invia Richiesta",
        description: "Compila il form per essere ricontattato"
      }
    }];
  }

  // Ensure we have settings
  if (!data.settings || typeof data.settings !== 'object') {
    data.settings = {};
  }

  // Clean the name field
  data.name = data.name.trim().substring(0, 255);
  
  // Clean the description field
  if (data.description && typeof data.description === 'string') {
    data.description = data.description.trim().substring(0, 1000);
  }

  console.log('✅ Validated funnel data:', {
    name: data.name,
    description: data.description?.substring(0, 100) + '...',
    stepsCount: data.steps.length
  });

  return data;
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
    console.log('📝 Creating fallback funnel data');
    
    // Create comprehensive fallback data
    return sanitizeAndValidateFunnelData({
      name: `Funnel per ${originalPrompt.substring(0, 50)}`,
      description: `Funnel personalizzato per ${originalPrompt}`,
      steps: [{
        step_order: 1,
        step_type: "form",
        title: "Richiedi Informazioni",
        description: "Compila il form per essere ricontattato",
        fields_config: [
          {type: "text", name: "nome", label: "Nome", required: true, placeholder: "Il tuo nome"},
          {type: "email", name: "email", label: "Email", required: true, placeholder: "La tua email"},
          {type: "tel", name: "telefono", label: "Telefono", required: false, placeholder: "Il tuo numero"},
          {type: "select", name: "esigenza", label: "Come possiamo aiutarti?", required: true, options: ["Informazioni", "Consulenza", "Preventivo", "Supporto"]},
          {type: "textarea", name: "dettagli", label: "Descrivi le tue esigenze", required: false, placeholder: "Raccontaci di più delle tue necessità..."}
        ],
        settings: {
          submitButtonText: "Invia Richiesta",
          description: "Ti contatteremo entro 24 ore"
        }
      }],
      settings: {
        productSpecific: true,
        focusType: "consultative",
        product_name: originalPrompt.substring(0, 100),
        personalizedSections: {
          hero: {
            title: `Scopri ${originalPrompt.substring(0, 30)}`,
            subtitle: "Soluzioni personalizzate per te",
            value_proposition: "Ti aiutiamo a raggiungere i tuoi obiettivi",
            cta_text: "Richiedi Informazioni"
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

// Enhanced OpenAI call with retry logic
const callOpenAIWithRetry = async (openAIApiKey: string, prompt: string, maxRetries = 2) => {
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
  
  Restituisci SOLO un oggetto JSON valido con questa ESATTA struttura:

  {
    "name": "Nome del funnel specifico per il business (OBBLIGATORIO)",
    "description": "Descrizione dettagliata del prodotto/servizio",
    "steps": [
      {
        "step_order": 1,
        "step_type": "form",
        "title": "Titolo del form personalizzato",
        "description": "Descrizione del form",
        "fields_config": [
          {"type": "text", "name": "nome", "label": "Nome", "required": true, "placeholder": "Il tuo nome"},
          {"type": "email", "name": "email", "label": "Email", "required": true, "placeholder": "La tua email"},
          {"type": "tel", "name": "telefono", "label": "Telefono", "required": false, "placeholder": "Il tuo numero"},
          {"type": "select", "name": "esigenza", "label": "Domanda specifica per il business", "required": true, "options": ["Opzione 1", "Opzione 2", "Opzione 3"]},
          {"type": "textarea", "name": "dettagli", "label": "Domanda approfondita", "required": false, "placeholder": "Descrivi la tua situazione..."}
        ],
        "settings": {
          "submitButtonText": "Call-to-action specifica",
          "description": "Descrizione personalizzata"
        }
      }
    ],
    "settings": {
      "productSpecific": true,
      "focusType": "consultative",
      "product_name": "Nome del prodotto/servizio",
      "personalizedSections": {
        "hero": {
          "title": "Titolo hero magnetico e specifico",
          "subtitle": "Sottotitolo che parla direttamente al target",
          "value_proposition": "Proposta di valore unica e specifica",
          "cta_text": "Call-to-action specifica"
        }
      },
      "customer_facing": {
        "hero_title": "Titolo hero",
        "hero_subtitle": "Sottotitolo hero", 
        "value_proposition": "Proposta di valore",
        "style_theme": "modern"
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
            { role: 'user', content: `Crea un funnel personalizzato per: ${prompt}` }
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
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};

serve(async (req) => {
  console.log('=== GENERATE INTERACTIVE FUNNEL AI FUNCTION STARTED ===');
  
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

    console.log('🤖 Calling OpenAI API...');
    const aiContent = await callOpenAIWithRetry(openAIApiKey, sanitizedPrompt);
    
    console.log('🔄 Parsing OpenAI response...');
    const funnelData = parseOpenAIResponse(aiContent, sanitizedPrompt);

    // Final validation before database insertion
    if (!funnelData.name || funnelData.name.trim().length === 0) {
      console.error('❌ Critical error: funnel name is still empty after all validations');
      throw new Error('Impossibile generare un nome valido per il funnel');
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
        userId: userId
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

      console.log('✅ Funnel saved successfully with ID:', funnelResult.id);

      // Save funnel steps
      if (funnelData.steps && Array.isArray(funnelData.steps) && funnelData.steps.length > 0) {
        console.log('📝 Inserting funnel steps...');
        
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
        customer_facing: funnelData.customer_facing || {},
        advanced_funnel_data: funnelData,
        target_audience: sanitizedPrompt.includes('target') ? sanitizedPrompt.split('target')[1]?.substring(0, 200) : null,
        industry: sanitizedPrompt.includes('settore') ? sanitizedPrompt.split('settore')[1]?.substring(0, 100) : null
      };

      console.log('🎉 Success! Returning response data');
      return new Response(JSON.stringify({ 
        success: true,
        funnel: responseData,
        savedToLibrary: true,
        message: 'Funnel personalizzato generato e salvato con successo'
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
    console.error('💥 Critical error in function:', error);
    
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
