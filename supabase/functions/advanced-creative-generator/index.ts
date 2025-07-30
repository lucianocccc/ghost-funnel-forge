import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreativityParameters {
  linguisticCreativity: number;
  emotionalResonance: number;
  marketPsychology: number;
  visualStorytelling: number;
  persuasionArchitecture: number;
}

interface CreativeContext {
  industry: string;
  targetAudience: string;
  productType: string;
  brandPersonality: string;
  competitivePosition: string;
  emotionalTriggers: string[];
  painPoints: string[];
  desires: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, parameters, contentType } = await req.json();

    // Get API keys from environment
    const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

    if (!claudeApiKey && !openaiApiKey) {
      throw new Error('No AI API keys configured');
    }

    // Generate multi-model creative content
    const responses = await Promise.allSettled([
      generateWithClaude(context, parameters, contentType, claudeApiKey),
      generateWithGPT(context, parameters, contentType, openaiApiKey),
      generateWithPerplexity(context, parameters, contentType, perplexityApiKey)
    ]);

    // Synthesize best responses
    const successfulResponses = responses
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value);

    const synthesizedContent = synthesizeCreativeContent(successfulResponses, contentType);

    return new Response(JSON.stringify({
      success: true,
      content: synthesizedContent,
      metadata: {
        modelsUsed: successfulResponses.length,
        creativityScore: calculateCreativityScore(parameters),
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in advanced-creative-generator:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateWithClaude(context: CreativeContext, parameters: CreativityParameters, contentType: string, apiKey: string) {
  if (!apiKey) return null;

  const prompt = buildCreativePrompt(context, parameters, contentType, 'claude');
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.8,
      system: 'You are a master creative copywriter with expertise in persuasive marketing and storytelling.',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) throw new Error(`Claude API error: ${response.statusText}`);
  
  const data = await response.json();
  return {
    model: 'claude',
    content: data.content[0].text,
    confidence: 0.9
  };
}

async function generateWithGPT(context: CreativeContext, parameters: CreativityParameters, contentType: string, apiKey: string) {
  if (!apiKey) return null;

  const prompt = buildCreativePrompt(context, parameters, contentType, 'gpt');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4-1106-preview',
      messages: [
        { role: 'system', content: 'You are an expert creative copywriter specializing in conversion-focused content and persuasive storytelling.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 2000
    })
  });

  if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);
  
  const data = await response.json();
  return {
    model: 'gpt',
    content: data.choices[0].message.content,
    confidence: 0.85
  };
}

async function generateWithPerplexity(context: CreativeContext, parameters: CreativityParameters, contentType: string, apiKey: string) {
  if (!apiKey) return null;

  const prompt = buildCreativePrompt(context, parameters, contentType, 'perplexity');
  
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        { role: 'system', content: 'You are a market-savvy copywriter with access to current trends and consumer psychology insights.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })
  });

  if (!response.ok) throw new Error(`Perplexity API error: ${response.statusText}`);
  
  const data = await response.json();
  return {
    model: 'perplexity',
    content: data.choices[0].message.content,
    confidence: 0.8
  };
}

function buildCreativePrompt(context: CreativeContext, parameters: CreativityParameters, contentType: string, model: string): string {
  const creativityLevel = Math.round((parameters.linguisticCreativity + parameters.emotionalResonance) / 2);
  const persuasionLevel = parameters.persuasionArchitecture;
  
  const basePrompt = `
**CREATIVE BRIEF**
Product: ${context.productType} in ${context.industry}
Target: ${context.targetAudience}
Brand: ${context.brandPersonality}
Position: ${context.competitivePosition}
Pain Points: ${context.painPoints.join(', ')}
Desires: ${context.desires.join(', ')}

**CREATIVITY PARAMETERS**
- Linguistic Innovation: ${creativityLevel}% (${creativityLevel > 70 ? 'high' : creativityLevel > 50 ? 'medium' : 'low'})
- Emotional Resonance: ${parameters.emotionalResonance}%
- Persuasion Power: ${persuasionLevel}%
- Visual Storytelling: ${parameters.visualStorytelling}%

**CREATIVE TECHNIQUES TO APPLY**
${creativityLevel > 70 ? `
- Analogical thinking (unexpected comparisons)
- Paradox integration (opposing ideas harmony)
- Sensory enhancement (multi-sensory language)
- Narrative micro-hooks (story fragments)
` : ''}
${parameters.emotionalResonance > 70 ? `
- Emotional escalation arcs
- Empathy bridges
- Vulnerability moments
- Triumph scenarios
` : ''}
${persuasionLevel > 75 ? `
- Psychological triggers
- Social proof integration
- Scarcity and urgency
- Authority positioning
` : ''}
`;

  const contentTypePrompts = {
    headline: `
Create 5 compelling headlines that:
1. Hook attention in 5-12 words
2. Promise clear benefits
3. Create emotional connection
4. Imply transformation
5. Use power words effectively

Format: Return exactly 5 numbered headlines.`,
    
    description: `
Write a persuasive product description (150-250 words) that:
1. Opens with attention-grabbing hook
2. Agitates the core problem
3. Presents solution with benefits
4. Includes social proof elements
5. Ends with compelling CTA

Structure: Hook → Problem → Solution → Proof → Action`,
    
    cta: `
Create 5 irresistible call-to-action phrases that:
1. Create urgency without pressure
2. Focus on benefits, not features
3. Remove friction and risk
4. Use action-oriented language
5. Match brand personality

Format: Return exactly 5 numbered CTAs.`,
    
    full_funnel: `
Design complete funnel sequence with:
1. AWARENESS: Attention-grabbing hook
2. INTEREST: Story and benefit development
3. DESIRE: Emotional amplification and urgency
4. ACTION: Clear CTA and objection handling

Each step should flow naturally while building momentum.`
  };

  return basePrompt + contentTypePrompts[contentType as keyof typeof contentTypePrompts];
}

function synthesizeCreativeContent(responses: any[], contentType: string) {
  if (responses.length === 0) {
    throw new Error('No successful responses from AI models');
  }

  // Get the best response based on confidence
  const bestResponse = responses.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  );

  // Parse content based on type
  const content = parseGeneratedContent(bestResponse.content, contentType);
  
  return {
    ...content,
    metadata: {
      primaryModel: bestResponse.model,
      modelsUsed: responses.map(r => r.model),
      synthesisStrategy: 'best_confidence'
    }
  };
}

function parseGeneratedContent(rawContent: string, contentType: string) {
  switch (contentType) {
    case 'headline':
      return {
        headlines: extractNumberedList(rawContent, 5),
        descriptions: [],
        ctaTexts: [],
        narrativeElements: [],
        visualPrompts: [],
        emotionalHooks: extractEmotionalElements(rawContent),
        persuasionFrameworks: []
      };
    
    case 'description':
      return {
        headlines: [],
        descriptions: [rawContent.trim()],
        ctaTexts: extractCTAs(rawContent),
        narrativeElements: extractNarrativeElements(rawContent),
        visualPrompts: [],
        emotionalHooks: extractEmotionalElements(rawContent),
        persuasionFrameworks: extractPersuasionFrameworks(rawContent)
      };
    
    case 'cta':
      return {
        headlines: [],
        descriptions: [],
        ctaTexts: extractNumberedList(rawContent, 5),
        narrativeElements: [],
        visualPrompts: [],
        emotionalHooks: [],
        persuasionFrameworks: []
      };
    
    case 'full_funnel':
      return {
        headlines: extractHeadlines(rawContent),
        descriptions: extractDescriptions(rawContent),
        ctaTexts: extractCTAs(rawContent),
        narrativeElements: extractNarrativeElements(rawContent),
        visualPrompts: extractVisualPrompts(rawContent),
        emotionalHooks: extractEmotionalElements(rawContent),
        persuasionFrameworks: extractPersuasionFrameworks(rawContent)
      };
    
    default:
      return {
        headlines: [],
        descriptions: [rawContent],
        ctaTexts: [],
        narrativeElements: [],
        visualPrompts: [],
        emotionalHooks: [],
        persuasionFrameworks: []
      };
  }
}

function extractNumberedList(text: string, expectedCount: number): string[] {
  const regex = /^\d+[\.\)]\s*(.+)$/gm;
  const matches = [];
  let match;
  
  while ((match = regex.exec(text)) !== null && matches.length < expectedCount) {
    matches.push(match[1].trim());
  }
  
  return matches.length > 0 ? matches : [text.trim()];
}

function extractEmotionalElements(text: string): string[] {
  const emotionalWords = text.match(/\b(amazing|incredible|transform|unlock|achieve|breakthrough|revolutionary|powerful|exclusive|limited|urgent|guarantee|proven|trusted)\w*\b/gi) || [];
  return [...new Set(emotionalWords)];
}

function extractCTAs(text: string): string[] {
  const ctaPattern = /(get started|start now|try free|learn more|download|sign up|join now|discover|unlock|claim|book|schedule|contact)/gi;
  const matches = text.match(ctaPattern) || [];
  return [...new Set(matches)];
}

function extractNarrativeElements(text: string): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  return sentences.slice(0, 3).map(s => s.trim());
}

function extractVisualPrompts(text: string): string[] {
  const visualWords = text.match(/\b(see|imagine|visualize|picture|watch|look|bright|dark|colorful|dynamic|smooth|sharp)\w*\b/gi) || [];
  return [...new Set(visualWords)].slice(0, 5);
}

function extractPersuasionFrameworks(text: string): string[] {
  const frameworks = [];
  if (text.includes('before') && text.includes('after')) frameworks.push('Before-After-Bridge');
  if (text.includes('problem') && text.includes('solution')) frameworks.push('Problem-Agitation-Solution');
  if (text.includes('social proof') || text.includes('testimonial')) frameworks.push('Social Proof');
  if (text.includes('limited') || text.includes('urgent')) frameworks.push('Scarcity & Urgency');
  return frameworks;
}

function extractHeadlines(text: string): string[] {
  // Look for lines that could be headlines (short, impactful)
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const headlines = lines.filter(line => 
    line.length <= 80 && 
    line.length >= 20 && 
    !line.includes('.') && 
    (line.includes('?') || line.includes('!') || line.match(/^[A-Z]/))
  );
  return headlines.slice(0, 3);
}

function extractDescriptions(text: string): string[] {
  // Look for paragraph-length content
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 50);
  return paragraphs.slice(0, 2);
}

function calculateCreativityScore(parameters: CreativityParameters): number {
  return Math.round(Object.values(parameters).reduce((sum, val) => sum + val, 0) / 5);
}