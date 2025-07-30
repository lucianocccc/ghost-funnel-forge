import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GhostFunnelRequest {
  userPrompt: string;
  productName?: string;
  productDescription?: string;
  targetAudience?: string;
  industry?: string;
  analysisLevel: 'basic' | 'advanced' | 'comprehensive';
  includeMarketResearch: boolean;
  includePersonalization: boolean;
  saveToDatabase: boolean;
  userId?: string;
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

async function orchestrateGhostFunnel(request: GhostFunnelRequest): Promise<MultiModelResponse> {
  const startTime = Date.now();
  const modelsUsed: string[] = [];
  const responses: any = {};

  try {
    // Phase 1: Market Research (if requested)
    if (request.includeMarketResearch) {
      const marketPrompt = `
        Conduct comprehensive market research for:
        Product: ${request.productName || 'the product'}
        Description: ${request.productDescription || 'Not provided'}
        Target Audience: ${request.targetAudience || 'General audience'}
        Industry: ${request.industry || 'General'}
        
        Provide insights on:
        1. Market size and trends
        2. Competitive landscape
        3. Consumer behavior patterns
        4. Pricing strategies
        5. Market opportunities and threats
        
        User Context: ${request.userPrompt}
      `;
      
      console.log('Starting market research phase...');
      responses.marketResearch = await executeAIRequest(TASK_CONFIGS.market_research, marketPrompt);
      modelsUsed.push('perplexity');
    }

    // Phase 2: Copywriting and Content Creation
    const copywritingPrompt = `
      Create a comprehensive ghost funnel strategy for:
      Product: ${request.productName || 'the product'}
      Description: ${request.productDescription || 'Not provided'}
      Target Audience: ${request.targetAudience || 'General audience'}
      
      ${responses.marketResearch ? `Market Research Insights: ${responses.marketResearch.content}` : ''}
      
      Create:
      1. Compelling value proposition
      2. Emotional triggers and pain points
      3. Persuasive copy for each funnel step
      4. Call-to-action strategies
      5. Social proof elements
      
      User Request: ${request.userPrompt}
      
      Format as JSON with sections: hero, benefits, emotional, conversion, social_proof
    `;
    
    console.log('Starting copywriting phase...');
    responses.copywriting = await executeAIRequest(TASK_CONFIGS.copywriting, copywritingPrompt);
    modelsUsed.push('claude');

    // Phase 3: Coordination and Synthesis
    const coordinationPrompt = `
      Synthesize the following insights into a cohesive ghost funnel strategy:
      
      ${responses.marketResearch ? `Market Research: ${responses.marketResearch.content}` : ''}
      
      Copywriting Content: ${responses.copywriting.content}
      
      Create a structured funnel with:
      1. Strategy overview
      2. Step-by-step funnel flow
      3. Content for each step
      4. Optimization recommendations
      5. Success metrics
      
      Original Request: ${request.userPrompt}
      Analysis Level: ${request.analysisLevel}
      
      Return as structured JSON format suitable for funnel implementation.
    `;
    
    console.log('Starting coordination phase...');
    responses.coordination = await executeAIRequest(TASK_CONFIGS.coordination, coordinationPrompt);
    modelsUsed.push('gpt-4');

    // Synthesize final result
    let synthesizedResult;
    try {
      synthesizedResult = JSON.parse(responses.coordination.content);
    } catch (e) {
      console.warn('Failed to parse coordination response as JSON, using raw content');
      synthesizedResult = {
        strategy: responses.coordination.content,
        marketInsights: responses.marketResearch?.content || null,
        copywritingContent: responses.copywriting.content
      };
    }

    // Save to database if requested
    if (request.saveToDatabase && request.userId) {
      console.log('Saving to database...');
      await saveToDatabase(synthesizedResult, request);
    }

    return {
      marketResearch: responses.marketResearch || null,
      copywriting: responses.copywriting,
      coordination: responses.coordination,
      synthesizedResult,
      metadata: {
        executionTime: Date.now() - startTime,
        modelsUsed,
        cacheHits: 0, // TODO: Implement cache hit tracking
        totalCost: calculateCost(responses)
      }
    };

  } catch (error) {
    console.error('Error in ghost funnel orchestration:', error);
    throw error;
  }
}

function calculateCost(responses: any): number {
  // Simplified cost calculation - would be more sophisticated in production
  let cost = 0;
  
  if (responses.marketResearch) cost += 0.02; // Perplexity cost
  if (responses.copywriting) cost += 0.05; // Claude cost
  if (responses.coordination) cost += 0.03; // GPT cost
  
  return cost;
}

async function saveToDatabase(result: any, request: GhostFunnelRequest): Promise<void> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Generate share token
    const shareToken = crypto.randomUUID();
    
    // Save to interactive_funnels table
    const { data: funnelData, error: funnelError } = await supabase
      .from('interactive_funnels')
      .insert({
        name: `Ghost Funnel - ${request.productName || 'AI Generated'}`,
        description: request.userPrompt,
        target_audience: request.targetAudience || 'General audience',
        industry: request.industry || 'General',
        strategy: JSON.stringify(result),
        share_token: shareToken,
        is_public: true,
        created_by: request.userId,
        ai_generated: true
      })
      .select()
      .single();

    if (funnelError) {
      console.error('Error saving funnel:', funnelError);
      return;
    }

    console.log('Successfully saved ghost funnel:', funnelData.id);
  } catch (error) {
    console.error('Database save error:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: GhostFunnelRequest = await req.json();
    
    // Validate required fields
    if (!request.userPrompt) {
      return new Response(
        JSON.stringify({ error: 'userPrompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing ghost funnel request:', {
      prompt: request.userPrompt.substring(0, 100) + '...',
      analysisLevel: request.analysisLevel,
      includeMarketResearch: request.includeMarketResearch
    });

    const result = await orchestrateGhostFunnel(request);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ghost-funnel-orchestrator:', error);
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