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

// Task-specific configurations
const TASK_CONFIGS = {
  market_research: {
    primaryModel: {
      modelType: 'perplexity',
      temperature: 0.2,
      maxTokens: 1500,
      systemPrompt: `You are a market research expert with access to real-time data and trends. Provide comprehensive market analysis including competitive landscape, consumer behavior, and market opportunities.`
    },
    fallbackModel: {
      modelType: 'gpt-4.1',
      temperature: 0.3,
      maxTokens: 1200,
      systemPrompt: 'You are a strategic market analyst. Provide data-driven insights and recommendations.'
    }
  },
  copywriting: {
    primaryModel: {
      modelType: 'claude-opus-4',
      temperature: 0.8,
      maxTokens: 2000,
      systemPrompt: `You are a master copywriter and storyteller. Create compelling, persuasive content that resonates emotionally with the target audience while driving conversions.`
    },
    fallbackModel: {
      modelType: 'claude-sonnet-4',
      temperature: 0.7,
      maxTokens: 1500,
      systemPrompt: 'You are a skilled content creator focused on engaging and persuasive writing.'
    }
  },
  coordination: {
    primaryModel: {
      modelType: 'gpt-4.1',
      temperature: 0.4,
      maxTokens: 2500,
      systemPrompt: `You are an AI orchestrator responsible for coordinating and synthesizing insights from multiple AI models. Create cohesive, comprehensive funnel strategies.`
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

// Execute AI request with fallback
async function executeAIRequest(config: any, prompt: string, context?: any): Promise<any> {
  const startTime = Date.now();
  
  try {
    let response;
    
    switch (config.primaryModel.modelType) {
      case 'perplexity':
        response = await callPerplexityAPI(config.primaryModel, prompt);
        break;
      case 'claude-opus-4':
      case 'claude-sonnet-4':
        response = await callClaudeAPI(config.primaryModel, prompt);
        break;
      case 'gpt-4.1':
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
    console.warn(`Primary model failed: ${error.message}`);
    
    // Try fallback if available
    if (config.fallbackModel) {
      try {
        const response = await executeAIRequest({ primaryModel: config.fallbackModel }, prompt, context);
        return {
          ...response,
          executionTime: Date.now() - startTime,
          fromFallback: true
        };
      } catch (fallbackError) {
        console.error(`Fallback also failed: ${fallbackError.message}`);
        throw error;
      }
    }
    
    throw error;
  }
}

async function callPerplexityAPI(config: any, prompt: string): Promise<any> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await getSecret('PERPLEXITY_API_KEY')}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      return_related_questions: false
    })
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: 'perplexity',
    confidence: 0.8,
    metadata: { usage: data.usage }
  };
}

async function callClaudeAPI(config: any, prompt: string): Promise<any> {
  const model = config.modelType === 'claude-opus-4' ? 'claude-3-opus-20240229' : 'claude-3-5-sonnet-20241022';
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': await getSecret('ANTHROPIC_API_KEY'),
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      system: config.systemPrompt,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    model: config.modelType,
    confidence: 0.9,
    metadata: { usage: data.usage }
  };
}

async function callOpenAIAPI(config: any, prompt: string): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await getSecret('OPENAI_API_KEY')}`
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: 'gpt-4.1',
    confidence: 0.85,
    metadata: { usage: data.usage }
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
    
    // Parse del risultato finale
    let parsedResult: GhostFunnelResult;
    try {
      parsedResult = JSON.parse(finalResult.content);
    } catch (e) {
      console.error('Errore parsing JSON:', e);
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