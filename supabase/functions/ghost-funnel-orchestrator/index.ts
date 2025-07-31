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

// Task-specific configurations leveraging each AI's strengths
const TASK_CONFIGS = {
  market_research: {
    primaryModel: {
      modelType: 'perplexity',
      model: 'pplx-70b-online',
      temperature: 0.2,
      maxTokens: 2000,
      systemPrompt: `You are a market research expert with access to real-time data and trends. Provide comprehensive market analysis including competitive landscape, consumer behavior, market opportunities, and recent industry developments.`
    },
    fallbackModel: {
      modelType: 'openai',
      model: 'gpt-4.1-2025-04-14',
      temperature: 0.3,
      maxTokens: 1500,
      systemPrompt: 'You are a strategic market analyst. Provide data-driven insights and recommendations based on current market trends and your training data.'
    }
  },
  copywriting: {
    primaryModel: {
      modelType: 'claude',
      model: 'claude-opus-4-20250514', // Latest Claude Opus for superior storytelling
      temperature: 0.8,
      maxTokens: 3000,
      systemPrompt: `You are a master copywriter and storyteller with exceptional emotional intelligence. Create compelling, persuasive content that resonates deeply with the target audience while driving conversions. Focus on emotional triggers, narrative arc, and psychological persuasion.`
    },
    fallbackModel: {
      modelType: 'claude',
      model: 'claude-sonnet-4-20250514', // Claude Sonnet 4 as fallback
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: 'You are a skilled content creator focused on engaging and persuasive writing with strong emotional appeal.'
    }
  },
  coordination: {
    primaryModel: {
      modelType: 'openai',
      model: 'gpt-4.1-2025-04-14', // Latest GPT-4.1 for synthesis and structure
      temperature: 0.4,
      maxTokens: 3500,
      systemPrompt: `You are an AI orchestrator responsible for coordinating and synthesizing insights from multiple AI models. Create cohesive, comprehensive funnel strategies that perfectly blend market insights with emotional storytelling. Ensure structural consistency and strategic alignment.`
    },
    fallbackModel: {
      modelType: 'openai',
      model: 'gpt-4.1-mini-2025-04-14', // Mini version as fallback
      temperature: 0.5,
      maxTokens: 2500,
      systemPrompt: 'You are an AI coordinator focused on synthesis and structure with attention to detail and consistency.'
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
  
  const maxRetries = 3;
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Perplexity API call attempt ${attempt}/${maxRetries} using model: ${config.model}`);
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': 'Ghost-Funnel-Orchestrator/1.0'
        },
        body: JSON.stringify({
          model: config.model || 'pplx-7b-online',
          messages: [
            { role: 'system', content: config.systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          return_related_questions: false,
          return_images: false,
          search_recency_filter: 'month',
          search_domain_filter: ['perplexity.ai'],
          frequency_penalty: 1,
          presence_penalty: 0
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Perplexity API error (attempt ${attempt}): ${response.status} - ${errorText}`);
        
        if (response.status === 429 && attempt < maxRetries) {
          const retryAfter = response.headers.get('retry-after') || '2';
          const waitTime = Math.min(parseInt(retryAfter) * 1000, 10000);
          console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from Perplexity API');
      }
      
      console.log(`Perplexity API success on attempt ${attempt}`);
      return {
        content: data.choices[0].message.content,
        model: config.model,
        confidence: 0.85,
        metadata: { 
          usage: data.usage || {},
          attempts: attempt,
          citations: data.citations || []
        }
      };
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) break;
      
      const backoffMs = Math.pow(2, attempt) * 1000; // Exponential backoff
      console.log(`Perplexity API attempt ${attempt} failed, retrying in ${backoffMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }
  
  throw new Error(`Perplexity API failed after ${maxRetries} attempts: ${lastError.message}`);
}

async function callClaudeAPI(config: any, prompt: string): Promise<any> {
  const apiKey = await getSecret('ANTHROPIC_API_KEY');
  
  const maxRetries = 3;
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Claude API call attempt ${attempt}/${maxRetries} using model: ${config.model}`);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'User-Agent': 'Ghost-Funnel-Orchestrator/1.0'
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
        console.error(`Claude API error (attempt ${attempt}): ${response.status} - ${errorText}`);
        
        if (response.status === 429 && attempt < maxRetries) {
          const retryAfter = response.headers.get('retry-after') || '2';
          const waitTime = Math.min(parseInt(retryAfter) * 1000, 10000);
          console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.content || !data.content[0]) {
        throw new Error('Invalid response format from Claude API');
      }
      
      console.log(`Claude API success on attempt ${attempt}`);
      return {
        content: data.content[0].text,
        model: config.model,
        confidence: 0.92,
        metadata: { 
          usage: data.usage || {},
          attempts: attempt,
          stop_reason: data.stop_reason
        }
      };
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) break;
      
      const backoffMs = Math.pow(2, attempt) * 1000;
      console.log(`Claude API attempt ${attempt} failed, retrying in ${backoffMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }
  
  throw new Error(`Claude API failed after ${maxRetries} attempts: ${lastError.message}`);
}

async function callOpenAIAPI(config: any, prompt: string): Promise<any> {
  const apiKey = await getSecret('OPENAI_API_KEY');
  
  const maxRetries = 3;
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`OpenAI API call attempt ${attempt}/${maxRetries} using model: ${config.model}`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': 'Ghost-Funnel-Orchestrator/1.0'
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
        console.error(`OpenAI API error (attempt ${attempt}): ${response.status} - ${errorText}`);
        
        if (response.status === 429 && attempt < maxRetries) {
          const retryAfter = response.headers.get('retry-after') || '2';
          const waitTime = Math.min(parseInt(retryAfter) * 1000, 10000);
          console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenAI API');
      }
      
      console.log(`OpenAI API success on attempt ${attempt}`);
      return {
        content: data.choices[0].message.content,
        model: config.model,
        confidence: 0.88,
        metadata: { 
          usage: data.usage || {},
          attempts: attempt,
          finish_reason: data.choices[0].finish_reason
        }
      };
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) break;
      
      const backoffMs = Math.pow(2, attempt) * 1000;
      console.log(`OpenAI API attempt ${attempt} failed, retrying in ${backoffMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }
  
  throw new Error(`OpenAI API failed after ${maxRetries} attempts: ${lastError.message}`);
}

async function orchestrateGhostFunnel(request: GhostFunnelRequest): Promise<GhostFunnelResult> {
  const startTime = Date.now();
  const executionLog: string[] = [];
  
  try {
    executionLog.push(`🚀 Starting Ghost Funnel orchestration for ${request.business_name}`);
    
    // PHASE 1: Perplexity - Deep Market Research & Real-time Insights
    const marketPrompt = `Conduct comprehensive market research for "${request.business_name}" in the ${request.business_type} industry:

    Business Description: ${request.description}
    Target Audience: ${request.target_audience}
    Language: ${request.language}
    
    Provide detailed analysis covering:
    1. 🎯 SPECIFIC PAIN POINTS of target audience (be very specific)
    2. 📈 Current market opportunities and gaps
    3. 🏪 Top 3 direct competitors and their positioning
    4. 📊 Latest industry trends and developments (2024-2025)
    5. 💡 Unique positioning opportunities
    6. 📱 Digital behavior patterns of the target audience
    
    Focus on actionable, data-driven insights. Use real-time information where available.
    Respond in ${request.language}.`;
    
    console.log('🔍 PHASE 1: Deep Market Research with Perplexity...');
    executionLog.push('Phase 1: Leveraging Perplexity for real-time market intelligence...');
    const marketResearch = await executeAIRequest(TASK_CONFIGS.market_research, marketPrompt);
    executionLog.push(`✅ Market research completed (${marketResearch.executionTime}ms)`);

    // PHASE 2: Claude - Master Storytelling & Emotional Architecture  
    const storyPrompt = `As a master storyteller and emotional architect, create a powerful narrative framework for:

    🏢 Business: ${request.business_name} (${request.business_type})
    📝 Description: ${request.description}
    🎭 Brand Tone: ${request.tone}
    👥 Target Audience: ${request.target_audience}
    📊 Market Intelligence: ${marketResearch.content}
    
    Create an emotionally-driven narrative including:
    1. 📖 HERO'S JOURNEY STORY that positions the customer as the hero
    2. 💔 Emotional pain points that create urgency and relatability
    3. ✨ Transformation promise that feels both aspirational and achievable
    4. 🎯 Emotional hooks that trigger immediate engagement
    5. 💪 Psychological benefits beyond functional ones
    6. 🌟 Social proof elements and trust signals
    7. ⚡ Urgency elements that feel natural, not pushy
    
    Focus on emotional resonance, psychological triggers, and narrative flow.
    Use ${request.tone} tone and respond in ${request.language}.`;
    
    console.log('✨ PHASE 2: Emotional Storytelling with Claude...');
    executionLog.push('Phase 2: Crafting emotional narrative with Claude Opus...');
    const storyContent = await executeAIRequest(TASK_CONFIGS.copywriting, storyPrompt);
    executionLog.push(`✅ Storytelling completed (${storyContent.executionTime}ms)`);

    // PHASE 3: OpenAI GPT-4.1 - Strategic Orchestration & Brand Synthesis
    const orchestrationPrompt = `As an expert funnel strategist and brand architect, synthesize all intelligence into a cohesive, high-converting funnel:

    📊 MARKET INTELLIGENCE:
    ${marketResearch.content}
    
    ✨ EMOTIONAL NARRATIVE:
    ${storyContent.content}
    
    🎯 BUSINESS CONTEXT:
    - Name: ${request.business_name}
    - Type: ${request.business_type}
    - Tone: ${request.tone}
    - Target: ${request.target_audience}
    
    STRATEGIC REQUIREMENTS:
    1. Determine optimal brand style (Apple/Nike/Amazon) based on market position and target psychology
    2. Create compelling, conversion-optimized copy that balances emotion and logic
    3. Ensure all elements work synergistically for maximum impact
    4. Apply psychological principles for conversion optimization
    
    Output this EXACT JSON structure (no markdown formatting):
    {
      "hero": {
        "headline": "Powerful, benefit-driven headline",
        "subheadline": "Supporting emotional hook that amplifies desire",
        "cta_text": "Action-oriented CTA that feels natural"
      },
      "advantages": [
        {"title": "Benefit 1", "description": "Specific value proposition", "icon": "relevant-icon-name"},
        {"title": "Benefit 2", "description": "Specific value proposition", "icon": "relevant-icon-name"},
        {"title": "Benefit 3", "description": "Specific value proposition", "icon": "relevant-icon-name"}
      ],
      "emotional": {
        "story": "Compelling brand story that positions customer as hero",
        "pain_points": ["Specific pain 1", "Specific pain 2", "Specific pain 3"],
        "transformation": "Clear, aspirational transformation promise"
      },
      "cta": {
        "primary_text": "Primary action CTA",
        "secondary_text": "Lower-commitment alternative",
        "urgency": "Natural urgency message"
      },
      "style": "Apple|Nike|Amazon",
      "images": [
        {"type": "hero", "description": "Hero image description optimized for emotional impact", "alt_text": "Descriptive alt text"},
        {"type": "benefit", "description": "Supporting visual description", "alt_text": "Descriptive alt text"},
        {"type": "testimonial", "description": "Social proof visual description", "alt_text": "Descriptive alt text"}
      ]
    }
    
    Ensure all copy is in ${request.language} and maintains ${request.tone} tone throughout.
    CRITICAL: Return ONLY the JSON object, no additional text or formatting.`;
    
    console.log('🎯 PHASE 3: Strategic Synthesis with GPT-4.1...');
    executionLog.push('Phase 3: Strategic orchestration with GPT-4.1...');
    const finalResult = await executeAIRequest(TASK_CONFIGS.coordination, orchestrationPrompt);
    executionLog.push(`✅ Orchestration completed (${finalResult.executionTime}ms)`);
    
    // Enhanced JSON parsing with multiple strategies
    let parsedResult: GhostFunnelResult;
    try {
      executionLog.push('🔧 Parsing final funnel structure...');
      
      // Strategy 1: Direct JSON parsing
      let cleanContent = finalResult.content.trim();
      
      // Strategy 2: Extract JSON from markdown blocks
      const codeBlockMatch = cleanContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (codeBlockMatch) {
        cleanContent = codeBlockMatch[1];
      }
      
      // Strategy 3: Find JSON object boundaries
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
      }
      
      // Strategy 4: Clean common formatting issues
      cleanContent = cleanContent
        .replace(/[\u2018\u2019]/g, "'") // Smart quotes
        .replace(/[\u201C\u201D]/g, '"') // Smart quotes
        .replace(/\n\s*/g, ' ') // Normalize whitespace
        .trim();
      
      parsedResult = JSON.parse(cleanContent);
      
      // Comprehensive validation
      const requiredFields = ['hero', 'advantages', 'emotional', 'cta', 'style', 'images'];
      const missingFields = requiredFields.filter(field => !parsedResult[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Validate nested structures
      if (!parsedResult.hero.headline || !parsedResult.hero.subheadline || !parsedResult.hero.cta_text) {
        throw new Error('Incomplete hero section');
      }
      
      if (!Array.isArray(parsedResult.advantages) || parsedResult.advantages.length < 3) {
        throw new Error('Insufficient advantages provided');
      }
      
      if (!Array.isArray(parsedResult.emotional.pain_points) || parsedResult.emotional.pain_points.length < 2) {
        throw new Error('Insufficient pain points provided');
      }
      
      executionLog.push('✅ JSON parsing and validation successful');
      
    } catch (parseError) {
      console.error('🚨 JSON parsing failed:', parseError.message);
      console.error('📝 Original content:', finalResult.content);
      executionLog.push(`❌ JSON parsing failed: ${parseError.message}`);
      
      // Advanced fallback with GPT-4 JSON repair
      try {
        executionLog.push('🔧 Attempting JSON repair with GPT-4...');
        const repairPrompt = `Fix this malformed JSON and return only valid JSON:
        
        ${finalResult.content}
        
        Ensure it matches this structure exactly:
        {
          "hero": {"headline": "text", "subheadline": "text", "cta_text": "text"},
          "advantages": [{"title": "text", "description": "text", "icon": "text"}],
          "emotional": {"story": "text", "pain_points": ["text"], "transformation": "text"},
          "cta": {"primary_text": "text", "secondary_text": "text", "urgency": "text"},
          "style": "Apple|Nike|Amazon",
          "images": [{"type": "text", "description": "text", "alt_text": "text"}]
        }
        
        Return ONLY the corrected JSON, no other text.`;
        
        const repairResult = await executeAIRequest(TASK_CONFIGS.coordination, repairPrompt);
        
        let repairedContent = repairResult.content.trim();
        const repairJsonStart = repairedContent.indexOf('{');
        const repairJsonEnd = repairedContent.lastIndexOf('}');
        
        if (repairJsonStart !== -1 && repairJsonEnd !== -1) {
          repairedContent = repairedContent.substring(repairJsonStart, repairJsonEnd + 1);
        }
        
        parsedResult = JSON.parse(repairedContent);
        executionLog.push('✅ JSON repair successful');
        
      } catch (repairError) {
        console.error('🚨 JSON repair also failed:', repairError.message);
        executionLog.push(`❌ JSON repair failed: ${repairError.message}`);
        
        // Ultimate fallback with intelligent defaults
        parsedResult = {
          hero: {
            headline: `${request.business_name} - Trasforma il tuo ${request.business_type}`,
            subheadline: `Scopri come ${request.business_name} può rivoluzionare la tua esperienza nel settore ${request.business_type}`,
            cta_text: "Scopri di Più"
          },
          advantages: [
            { title: "Innovazione", description: "Soluzioni all'avanguardia per il tuo successo", icon: "lightbulb" },
            { title: "Qualità Premium", description: "Standard eccellenti garantiti", icon: "shield-check" },
            { title: "Risultati Misurabili", description: "Successo concreto e verificabile", icon: "chart-bar" }
          ],
          emotional: {
            story: `${request.business_name} nasce dalla passione di trasformare il settore ${request.business_type}, offrendo soluzioni innovative per ${request.target_audience}.`,
            pain_points: ["Frustrazione con le soluzioni attuali", "Mancanza di risultati concreti", "Complessità eccessiva"],
            transformation: `Immagina un futuro dove ${request.target_audience} può finalmente ottenere i risultati desiderati con ${request.business_name}`
          },
          cta: {
            primary_text: "Inizia Ora",
            secondary_text: "Scopri di Più",
            urgency: "Offerta limitata - Non perdere questa opportunità"
          },
          style: "Apple" as const,
          images: [
            { type: "hero", description: "Immagine professionale che rappresenta il successo nel settore", alt_text: "Hero image professionale" },
            { type: "benefit", description: "Visualizzazione dei benefici chiave", alt_text: "Benefici principali" }
          ]
        };
        executionLog.push('✅ Fallback structure applied successfully');
      }
    }
    
    const totalExecutionTime = Date.now() - startTime;
    executionLog.push(`🎉 Ghost Funnel orchestration completed in ${totalExecutionTime}ms`);
    
    // Add execution metadata
    parsedResult.execution_metadata = {
      total_time_ms: totalExecutionTime,
      phases_completed: 3,
      models_used: [
        `Perplexity: ${marketResearch.model}`,
        `Claude: ${storyContent.model}`,
        `OpenAI: ${finalResult.model}`
      ],
      execution_log: executionLog,
      confidence_scores: {
        market_research: marketResearch.confidence,
        storytelling: storyContent.confidence,
        orchestration: finalResult.confidence
      }
    };
    
    console.log('🎯 Ghost Funnel orchestration summary:', {
      business: request.business_name,
      total_time: totalExecutionTime,
      phases: 3,
      style: parsedResult.style
    });
    
    return parsedResult;
    
  } catch (error) {
    const totalExecutionTime = Date.now() - startTime;
    executionLog.push(`❌ Fatal error after ${totalExecutionTime}ms: ${error.message}`);
    console.error('🚨 Ghost Funnel orchestration failed:', error);
    console.error('📋 Execution log:', executionLog);
    throw new Error(`Ghost Funnel orchestration failed: ${error.message}`);
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

    // Salva il Ghost Funnel nel database se l'utente è autenticato
    if (request.userId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      try {
        const { data: savedFunnel, error: saveError } = await supabase
          .from('ai_generated_funnels')
          .insert({
            user_id: request.userId,
            name: `Ghost Funnel: ${request.business_name}`,
            description: `Ghost Funnel generato per ${request.business_type} - Target: ${request.target_audience}`,
            industry: request.business_type,
            use_case: 'Ghost Funnel Orchestrator',
            funnel_data: {
              ...result,
              generation_metadata: {
                business_name: request.business_name,
                business_type: request.business_type,
                target_audience: request.target_audience,
                tone: request.tone,
                language: request.language,
                generated_at: new Date().toISOString(),
                workflow_type: 'ghost_funnel_orchestrator'
              }
            },
            ai_generated: true
          })
          .select()
          .single();

        if (saveError) {
          console.error('Errore salvataggio Ghost Funnel:', saveError);
        } else {
          console.log('Ghost Funnel salvato con successo:', savedFunnel.id);
          // Aggiungi l'ID del funnel salvato alla risposta mantenendo i metadata
          result.saved_funnel_id = savedFunnel.id;
        }
      } catch (dbError) {
        console.error('Errore database durante il salvataggio:', dbError);
        // Non bloccare la risposta se il salvataggio fallisce
      }
    }

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