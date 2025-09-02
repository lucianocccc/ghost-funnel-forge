import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratedQuestion {
  id: string;
  question: string;
  context: string;
  required: boolean;
}

interface PromptAnalysis {
  missingInfo: string[];
  questions: GeneratedQuestion[];
  readyToGenerate: boolean;
  confidence: number;
}

interface GeneratorRequest {
  analysis: PromptAnalysis;
  answers: Record<string, string>;
  userId?: string;
}

async function getSecret(secretName: string): Promise<string> {
  const secret = Deno.env.get(secretName);
  if (!secret) {
    throw new Error(`Secret ${secretName} not found`);
  }
  return secret;
}

async function synthesizeDataForGhostFunnel(analysis: PromptAnalysis, answers: Record<string, string>): Promise<any> {
  const openaiKey = await getSecret('OPENAI_API_KEY');
  
  // Costruisci il contesto completo
  const questionsAndAnswers = analysis.questions
    .map(q => answers[q.id] ? `Q: ${q.question}\nA: ${answers[q.id]}` : null)
    .filter(Boolean)
    .join('\n\n');
  
  const synthesisPrompt = `Sintetizza tutte le informazioni raccolte per creare i parametri necessari al Ghost Funnel Orchestrator.

INFORMAZIONI RACCOLTE:
${questionsAndAnswers}

INFORMAZIONI MANCANTI IDENTIFICATE:
${analysis.missingInfo.join(', ')}

COMPITO:
Estrai e struttura le seguenti informazioni per la generazione del funnel:

FORMATO RISPOSTA (JSON valido):
{
  "business_name": "nome del business estratto o dedotto",
  "business_type": "settore/tipo di business",
  "description": "descrizione completa del prodotto/servizio",
  "target_audience": "target audience specifico",
  "tone": "professionale|amichevole|energico|lusso|startup",
  "language": "it",
  "buyer_persona": "ceo_executive|manager_director|entrepreneur_founder|small_business_owner|professional_specialist",
  "extracted_info": {
    "pain_points": ["pain point 1", "pain point 2"],
    "value_proposition": "USP principale",
    "objectives": "obiettivo del funnel",
    "budget_indication": "se specificato",
    "urgency_elements": ["elementi di urgenza identificati"],
    "social_proof": "elementi di credibilità menzionati"
  }
}

REGOLE:
- Se mancano info essenziali, deducile intelligentemente dal contesto
- Il tone deve riflettere la personalità del brand emersa
- La description deve essere ricca e dettagliata
- Includi tutti i pain points identificati
- Determina il buyer_persona più appropriato in base al business descritto
- Identifica elementi di urgency e social proof dal contesto

Rispondi SOLO con il JSON valido:`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'Sei un esperto di sintesi dati per marketing. Rispondi sempre con JSON valido.' },
        { role: 'user', content: synthesisPrompt }
      ],
      temperature: 0.2,
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    let cleanContent = content.trim();
    const jsonStart = cleanContent.indexOf('{');
    const jsonEnd = cleanContent.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
    }
    
    return JSON.parse(cleanContent);
    
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    console.error('Original content:', content);
    
    // Fallback data with neuro-copywriting support
    return {
      business_name: "Business",
      business_type: "Servizi",
      description: "Servizio professionale per clienti esigenti",
      target_audience: "Professionisti e aziende",
      tone: "professionale",
      language: "it",
      buyer_persona: "professional_specialist",
      extracted_info: {
        pain_points: ["Frustrazione con soluzioni attuali", "Mancanza di risultati"],
        value_proposition: "Soluzione efficace e affidabile",
        objectives: "Generazione lead qualificati",
        urgency_elements: ["Tempo limitato", "Offerta esclusiva"],
        social_proof: "Clienti soddisfatti"
      }
    };
  }
}

async function enhanceWithNeuroCopywriting(synthesizedData: any, userId?: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  console.log('🧠 Enhancing with neuro-copywriting...');

  try {
    // Generate neuro-copywriting for hero section
    const { data: heroData, error: heroError } = await supabase.functions.invoke('neuro-copywriting-engine', {
      body: {
        sectionType: 'hero',
        productName: synthesizedData.business_name,
        industry: synthesizedData.business_type,
        buyerPersona: synthesizedData.buyer_persona || 'professional_specialist',
        primaryPain: synthesizedData.extracted_info?.pain_points?.[0],
        transformation: synthesizedData.extracted_info?.value_proposition,
        socialProof: '1000+ professionisti',
        scarcityElement: 'Offerta limitata nel tempo',
        guarantee: '30 giorni di garanzia soddisfatti o rimborsati'
      }
    });

    // Generate neuro-copywriting for emotional section
    const { data: emotionalData, error: emotionalError } = await supabase.functions.invoke('neuro-copywriting-engine', {
      body: {
        sectionType: 'emotional',
        productName: synthesizedData.business_name,
        industry: synthesizedData.business_type,
        buyerPersona: synthesizedData.buyer_persona || 'professional_specialist',
        primaryPain: synthesizedData.extracted_info?.pain_points?.[0],
        transformation: synthesizedData.extracted_info?.value_proposition,
        socialProof: '1000+ professionisti',
        scarcityElement: 'Solo per i primi 100 clienti',
        urgencyReason: 'Prezzo promozionale in scadenza'
      }
    });

    // Generate neuro-copywriting for conversion section
    const { data: conversionData, error: conversionError } = await supabase.functions.invoke('neuro-copywriting-engine', {
      body: {
        sectionType: 'conversion',
        productName: synthesizedData.business_name,
        industry: synthesizedData.business_type,
        buyerPersona: synthesizedData.buyer_persona || 'professional_specialist',
        primaryPain: synthesizedData.extracted_info?.pain_points?.[0],
        transformation: synthesizedData.extracted_info?.value_proposition,
        priceAnchor: 'Soluzione premium',
        guarantee: '30 giorni soddisfatti o rimborsati',
        objections: ['Troppo costoso', 'Non funziona', 'Troppo complicato']
      }
    });

    if (heroError) console.warn('Hero neuro-copy error:', heroError);
    if (emotionalError) console.warn('Emotional neuro-copy error:', emotionalError);
    if (conversionError) console.warn('Conversion neuro-copy error:', conversionError);

    return {
      hero: heroData || null,
      emotional: emotionalData || null,
      conversion: conversionData || null,
      metadata: {
        neuroCopywritingEnabled: true,
        buyerPersona: synthesizedData.buyer_persona || 'professional_specialist',
        enhancedSections: ['hero', 'emotional', 'conversion']
      }
    };

  } catch (error) {
    console.error('Error enhancing with neuro-copywriting:', error);
    return {
      hero: null,
      emotional: null,
      conversion: null,
      metadata: {
        neuroCopywritingEnabled: false,
        error: error.message
      }
    };
}
}

async function callGhostFunnelOrchestrator(funnelData: any, neuroCopyEnhancements: any, userId?: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Enhance the funnel data with neuro-copywriting
    const enhancedFunnelData = {
      ...funnelData,
      neuro_enhancements: neuroCopyEnhancements,
      // Override with conversion-optimized copy if available
      ...(neuroCopyEnhancements.hero && {
        hero_override: {
          headline: neuroCopyEnhancements.hero.title,
          subheadline: neuroCopyEnhancements.hero.subtitle,
          cta_text: neuroCopyEnhancements.hero.cta
        }
      })
    };

    const { data, error } = await supabase.functions.invoke('ghost-funnel-orchestrator', {
      body: {
        ...enhancedFunnelData,
        userId
      }
    });

    if (error) {
      console.error('Errore Ghost Funnel Orchestrator:', error);
      throw new Error('Errore nella generazione del funnel');
    }

    return data;
  } catch (error) {
    console.error('Errore chiamata Ghost Funnel Orchestrator:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: GeneratorRequest = await req.json();
    
    if (!request.analysis) {
      return new Response(
        JSON.stringify({ error: 'Analisi mancante' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🚀 Generando funnel smart:', {
      questionsCount: request.analysis.questions.length,
      answersCount: Object.keys(request.answers).length,
      confidence: request.analysis.confidence,
      userId: request.userId
    });

    // Step 1: Sintetizza i dati raccolti
    console.log('📊 Step 1: Sintesi dati...');
    const synthesizedData = await synthesizeDataForGhostFunnel(request.analysis, request.answers);
    
    console.log('✅ Dati sintetizzati:', {
      business_name: synthesizedData.business_name,
      business_type: synthesizedData.business_type,
      tone: synthesizedData.tone
    });

    // Step 2: Enhance with neuro-copywriting
    console.log('🧠 Step 2: Neuro-copywriting enhancement...');
    const neuroCopyEnhancements = await enhanceWithNeuroCopywriting(synthesizedData, request.userId);
    
    console.log('✅ Neuro-copy enhanced:', {
      heroEnhanced: !!neuroCopyEnhancements.hero,
      emotionalEnhanced: !!neuroCopyEnhancements.emotional,
      conversionEnhanced: !!neuroCopyEnhancements.conversion
    });

    // Step 3: Chiama il Ghost Funnel Orchestrator with enhancements
    console.log('🎯 Step 3: Generazione funnel con neuro-copy...');
    const ghostFunnelResult = await callGhostFunnelOrchestrator(synthesizedData, neuroCopyEnhancements, request.userId);
    
    // Step 4: Aggiungi metadata della sessione smart con neuro-copy
    const finalResult = {
      ...ghostFunnelResult,
      smart_generation_metadata: {
        initial_analysis: request.analysis,
        collected_answers: request.answers,
        synthesized_data: synthesizedData,
        neuro_copy_enhancements: neuroCopyEnhancements,
        generation_type: 'smart_funnel_neuro_optimized',
        questions_asked: request.analysis.questions.length,
        confidence_score: request.analysis.confidence,
        buyer_persona: synthesizedData.buyer_persona,
        conversion_optimized: true
      }
    };

    // Step 5: Aggiorna la sessione nel database
    if (request.userId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      try {
        await supabase
          .from('smart_funnel_sessions')
          .update({
            session_status: 'completed',
            final_result: finalResult,
            completed_at: new Date().toISOString()
          })
          .eq('user_id', request.userId)
          .eq('session_status', 'questioning')
          .order('created_at', { ascending: false })
          .limit(1);
      } catch (dbError) {
        console.error('Errore aggiornamento sessione:', dbError);
        // Non blocca la risposta
      }
    }

    console.log('🎉 Smart Funnel con Neuro-Copywriting generato con successo!');

    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Errore in smart-funnel-generator:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});