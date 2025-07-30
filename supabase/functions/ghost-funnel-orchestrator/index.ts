import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GhostFunnelRequest {
  business_name: string;
  business_type: string;
  description: string;
  tone: string;
  target_audience: string;
  language: string;
}

interface GhostFunnelResult {
  hero: {
    headline: string;
    subheadline: string;
    cta_text: string;
  };
  advantages: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  emotional: {
    story: string;
    pain_points: string[];
    transformation: string;
  };
  cta: {
    primary_text: string;
    secondary_text: string;
    urgency: string;
  };
  style: 'Apple' | 'Nike' | 'Amazon';
  images: Array<{
    type: string;
    description: string;
    alt_text: string;
  }>;
}

interface MultiModelResponse {
  marketResearch?: any;
  copywriting?: any;
  coordination?: any;
  synthesizedResult: any;
  metadata: {
    executionTime: number;
    modelsUsed: string[];
    cacheHits: number;
    totalCost?: number;
  };
}

// Task-specific configurations with updated models
const TASK_CONFIGS = {
  market_research: {
    primaryModel: {
      modelType: 'perplexity',
      model: 'llama-3.1-sonar-large-128k-online',
      temperature: 0.2,
      maxTokens: 1500,
      systemPrompt: `You are a market research expert with access to real-time data and trends. Provide comprehensive market analysis including competitive landscape, consumer behavior, and market opportunities.`
    },
    fallbackModel: {
      modelType: 'openai',
      model: 'gpt-4.1-2025-04-14',
      temperature: 0.3,
      maxTokens: 1200,
      systemPrompt: 'You are a strategic market analyst. Provide data-driven insights and recommendations.'
    }
  },
  copywriting: {
    primaryModel: {
      modelType: 'claude',
      model: 'claude-opus-4-20250514',
      temperature: 0.8,
      maxTokens: 2000,
      systemPrompt: `You are a master copywriter and storyteller. Create compelling, persuasive content that resonates emotionally with the target audience while driving conversions.`
    },
    fallbackModel: {
      modelType: 'claude',
      model: 'claude-sonnet-4-20250514',
      temperature: 0.7,
      maxTokens: 1500,
      systemPrompt: 'You are a skilled content creator focused on engaging and persuasive writing.'
    }
  },
  coordination: {
    primaryModel: {
      modelType: 'openai',
      model: 'gpt-4.1-2025-04-14',
      temperature: 0.4,
      maxTokens: 2500,
      systemPrompt: `You are an AI orchestrator responsible for coordinating and synthesizing insights from multiple AI models. Create cohesive, comprehensive funnel strategies.`
    },
    fallbackModel: {
      modelType: 'claude',
      model: 'claude-sonnet-4-20250514',
      temperature: 0.5,
      maxTokens: 2000,
      systemPrompt: 'You are an AI coordinator focused on synthesis and structure.'
    }
  }
};

// Get API key from Supabase secrets
async function getSecret(secretName: string): Promise<string> {
  const secret = Deno.env.get(secretName);
  if (!secret) {
    throw new Error(`Secret ${secretName} not found`);
  }
  return secret;
}

// Execute AI request with improved fallback mechanism
async function executeAIRequest(config: any, prompt: string, context?: any): Promise<any> {
  const startTime = Date.now();
  
  try {
    let response;
    
    switch (config.primaryModel.modelType) {
      case 'perplexity':
        response = await callPerplexityAPI(config.primaryModel, prompt);
        break;
      case 'claude':
        response = await callClaudeAPI(config.primaryModel, prompt);
        break;
      case 'openai':
        response = await callOpenAIAPI(config.primaryModel, prompt);
        break;
      default:
        throw new Error(`Unsupported model type: ${config.primaryModel.modelType}`);
    }
    
    return {
      ...response,
      executionTime: Date.now() - startTime,
      fromCache: false
    };
  } catch (error) {
    console.warn(`Primary model (${config.primaryModel.modelType}) failed: ${error.message}`);
    
    // Try fallback if available with improved error handling
    if (config.fallbackModel) {
      try {
        console.log(`Attempting fallback with ${config.fallbackModel.modelType}...`);
        const response = await executeAIRequest({ primaryModel: config.fallbackModel }, prompt, context);
        return {
          ...response,
          executionTime: Date.now() - startTime,
          fromFallback: true,
          fallbackReason: error.message
        };
      } catch (fallbackError) {
        console.error(`Fallback (${config.fallbackModel.modelType}) also failed: ${fallbackError.message}`);
        throw new Error(`Both primary and fallback models failed. Primary: ${error.message}, Fallback: ${fallbackError.message}`);
      }
    }
    
    throw error;
  }
}

async function callPerplexityAPI(config: any, prompt: string): Promise<any> {
  const apiKey = await getSecret('PERPLEXITY_API_KEY');
  
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: config.model || 'llama-3.1-sonar-large-128k-online',
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      return_related_questions: false,
      return_images: false,
      search_recency_filter: 'month'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Perplexity API error: ${response.status} - ${errorText}`);
    throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response format from Perplexity API');
  }
  
  return {
    content: data.choices[0].message.content,
    model: 'perplexity',
    confidence: 0.8,
    metadata: { usage: data.usage || {} }
  };
}

async function callClaudeAPI(config: any, prompt: string): Promise<any> {
  const apiKey = await getSecret('ANTHROPIC_API_KEY');
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      system: config.systemPrompt,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Claude API error: ${response.status} - ${errorText}`);
    throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.content || !data.content[0]) {
    throw new Error('Invalid response format from Claude API');
  }
  
  return {
    content: data.content[0].text,
    model: config.model,
    confidence: 0.9,
    metadata: { usage: data.usage || {} }
  };
}

async function callOpenAIAPI(config: any, prompt: string): Promise<any> {
  const apiKey = await getSecret('OPENAI_API_KEY');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`OpenAI API error: ${response.status} - ${errorText}`);
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response format from OpenAI API');
  }
  
  return {
    content: data.choices[0].message.content,
    model: config.model,
    confidence: 0.85,
    metadata: { usage: data.usage || {} }
  };
}

async function orchestrateGhostFunnel(request: GhostFunnelRequest): Promise<GhostFunnelResult> {
  const startTime = Date.now();
  
  try {
    // Fase 1: Perplexity - Ricerca mercato + pain points
    const marketPrompt = `Analizza il mercato per un business di tipo "${request.business_type}" chiamato "${request.business_name}". 
    Descrizione: ${request.description}
    Target audience: ${request.target_audience}
    Lingua: ${request.language}
    
    Fornisci:
    1. Pain points specifici del target
    2. Opportunità di mercato
    3. Competitor principali
    4. Trend del settore
    
    Rispondi in ${request.language}.`;
    
    console.log('Fase 1: Ricerca mercato con Perplexity...');
    const marketResearch = await executeAIRequest(TASK_CONFIGS.market_research, marketPrompt);

    // Fase 2: Claude - Storytelling + messaggio emozionale
    const storyPrompt = `Come master storyteller, crea una narrativa emotiva per:
    Business: ${request.business_name} (${request.business_type})
    Descrizione: ${request.description}
    Tone: ${request.tone}
    Target: ${request.target_audience}
    Pain points identificati: ${marketResearch.content}
    
    Crea:
    1. Storia emotiva che risuoni con il target
    2. Messaggio di trasformazione
    3. Hook emozionale potente
    4. Benefici emotivi (non solo razionali)
    
    Rispondi in ${request.language} con tone ${request.tone}.`;
    
    console.log('Fase 2: Storytelling con Claude...');
    const storyContent = await executeAIRequest(TASK_CONFIGS.copywriting, storyPrompt);

    // Fase 3: GPT-4 - Orchestrazione finale + adattamento brand
    const orchestrationPrompt = `Come AI orchestrator, sintetizza tutto in un funnel strutturato:
    
    DATI MERCATO: ${marketResearch.content}
    STORYTELLING: ${storyContent.content}
    
    Business: ${request.business_name}
    Tipo: ${request.business_type}
    Tone: ${request.tone}
    
    Determina lo stile brand più adatto (Apple/Nike/Amazon) e crea questo JSON:
    {
      "hero": {
        "headline": "headline principale",
        "subheadline": "sottotitolo",
        "cta_text": "testo call-to-action"
      },
      "advantages": [
        {"title": "vantaggio 1", "description": "dettaglio", "icon": "icona-suggerita"},
        {"title": "vantaggio 2", "description": "dettaglio", "icon": "icona-suggerita"},
        {"title": "vantaggio 3", "description": "dettaglio", "icon": "icona-suggerita"}
      ],
      "emotional": {
        "story": "storia emotiva",
        "pain_points": ["pain 1", "pain 2", "pain 3"],
        "transformation": "messaggio di trasformazione"
      },
      "cta": {
        "primary_text": "CTA principale",
        "secondary_text": "CTA secondaria",
        "urgency": "messaggio di urgenza"
      },
      "style": "Apple|Nike|Amazon",
      "images": [
        {"type": "hero", "description": "descrizione immagine hero", "alt_text": "alt text"},
        {"type": "benefit", "description": "descrizione benefit", "alt_text": "alt text"}
      ]
    }
    
    Rispondi SOLO con il JSON valido in ${request.language}.`;
    
    console.log('Fase 3: Orchestrazione finale con GPT-4...');
    const finalResult = await executeAIRequest(TASK_CONFIGS.coordination, orchestrationPrompt);
    
    // Parse del risultato finale con parsing robusto
    let parsedResult: GhostFunnelResult;
    try {
      // Estrai JSON da eventuali wrapper di markdown
      let cleanContent = finalResult.content.trim();
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
      }
      
      parsedResult = JSON.parse(cleanContent);
      
      // Valida la struttura del risultato
      if (!parsedResult.hero || !parsedResult.advantages || !parsedResult.emotional) {
        throw new Error('Struttura JSON incompleta');
      }
      
    } catch (e) {
      console.error('Errore parsing JSON:', e, 'Contenuto originale:', finalResult.content);
      // Fallback con struttura predefinita
      parsedResult = {
        hero: {
          headline: `${request.business_name} - Trasforma il tuo business`,
          subheadline: `Scopri come ${request.business_name} può rivoluzionare la tua esperienza`,
          cta_text: "Inizia Ora"
        },
        advantages: [
          { title: "Innovazione", description: "Soluzioni all'avanguardia", icon: "innovation" },
          { title: "Qualità", description: "Standard eccellenti", icon: "quality" },
          { title: "Risultati", description: "Successo garantito", icon: "results" }
        ],
        emotional: {
          story: `${request.business_name} nasce dalla passione di trasformare il settore ${request.business_type}`,
          pain_points: ["Frustrazione attuale", "Problemi comuni", "Sfide quotidiane"],
          transformation: "Immagina un futuro migliore con le nostre soluzioni"
        },
        cta: {
          primary_text: "Scopri di Più",
          secondary_text: "Contattaci",
          urgency: "Offerta limitata!"
        },
        style: "Apple",
        images: [
          { type: "hero", description: "Immagine hero professionale", alt_text: "Hero image" }
        ]
      };
    }
    
    return parsedResult;
    
  } catch (error) {
    console.error('Errore orchestrazione Ghost Funnel:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: GhostFunnelRequest = await req.json();
    
    // Validazione campi obbligatori
    if (!request.business_name || !request.business_type || !request.description) {
      return new Response(
        JSON.stringify({ error: 'business_name, business_type e description sono obbligatori' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Elaborazione richiesta Ghost Funnel:', {
      business: request.business_name,
      type: request.business_type,
      language: request.language
    });

    const result = await orchestrateGhostFunnel(request);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Errore in ghost-funnel-orchestrator:', error);
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