import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FunnelStructureRequest {
  userPrompt: string;
  answers: Record<string, string>;
  businessType?: string;
  targetAudience?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userPrompt, answers, businessType, targetAudience }: FunnelStructureRequest = await req.json();

    console.log('🏗️ Generating funnel structure...', {
      promptLength: userPrompt?.length,
      answersCount: Object.keys(answers || {}).length,
      businessType,
      targetAudience
    });

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Analyze answers to extract business intelligence
    const analysisPrompt = `
Analyze this funnel request and create a structured JSON specification:

USER PROMPT: "${userPrompt}"

ANSWERS: ${JSON.stringify(answers, null, 2)}

BUSINESS TYPE: ${businessType || 'Not specified'}
TARGET AUDIENCE: ${targetAudience || 'Not specified'}

Create a detailed JSON structure for a high-converting funnel. Focus on:
1. Business analysis and target audience
2. Funnel structure and flow logic
3. Content requirements for each section
4. Psychological triggers and conversion elements
5. Visual and brand style recommendations

Return ONLY valid JSON in this exact format:
{
  "funnel_name": "Strategic name for the funnel",
  "business_analysis": {
    "business_type": "exact category",
    "industry": "specific industry",
    "target_audience": "detailed persona",
    "main_pain_points": ["pain1", "pain2", "pain3"],
    "value_proposition": "core value prop"
  },
  "funnel_structure": {
    "flow_type": "single_page|multi_step|long_form",
    "sections": [
      {
        "id": "hero",
        "type": "hero",
        "priority": 1,
        "content_needs": ["headline", "subheadline", "cta"],
        "psychological_triggers": ["urgency", "authority"],
        "conversion_goal": "capture_attention"
      },
      {
        "id": "problem",
        "type": "problem_agitation",
        "priority": 2,
        "content_needs": ["pain_points", "consequences", "frustrations"],
        "psychological_triggers": ["fear", "pain"],
        "conversion_goal": "create_urgency"
      },
      {
        "id": "solution", 
        "type": "solution_presentation",
        "priority": 3,
        "content_needs": ["benefits", "features", "transformation"],
        "psychological_triggers": ["hope", "desire"],
        "conversion_goal": "show_value"
      },
      {
        "id": "proof",
        "type": "social_proof",
        "priority": 4,
        "content_needs": ["testimonials", "results", "logos"],
        "psychological_triggers": ["social_proof", "authority"],
        "conversion_goal": "build_trust"
      },
      {
        "id": "conversion",
        "type": "final_conversion",
        "priority": 5,
        "content_needs": ["cta", "guarantee", "urgency"],
        "psychological_triggers": ["scarcity", "urgency"],
        "conversion_goal": "close_sale"
      }
    ]
  },
  "copy_requirements": {
    "tone": "professional|energetic|luxury|friendly",
    "buyer_persona": "detailed_persona",
    "psychological_framework": "AIDA|PAS|VSL",
    "objections_to_handle": ["price", "time", "trust", "need"],
    "emotional_hooks": ["fear", "greed", "pride", "anger"],
    "urgency_elements": ["limited_time", "scarcity", "consequence"]
  },
  "visual_style": {
    "brand_inspiration": "apple|nike|amazon|tesla|luxury|startup",
    "color_scheme": "modern|corporate|vibrant|minimal",
    "layout_style": "clean|bold|elegant|dynamic",
    "imagery_style": "professional|lifestyle|abstract|product"
  },
  "conversion_optimization": {
    "primary_cta": "specific action",
    "secondary_cta": "fallback action", 
    "form_fields": ["name", "email", "phone"],
    "trust_signals": ["guarantee", "security", "testimonials"],
    "urgency_tactics": ["countdown", "limited_spots", "price_increase"]
  }
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are a conversion-focused funnel strategist. Analyze business requirements and create structured funnel specifications. Return only valid JSON.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const structureContent = data.choices[0].message.content.trim();
    
    console.log('Raw structure response:', structureContent);

    // Parse and validate JSON
    let funnelStructure;
    try {
      // Clean the response if it has markdown formatting
      const cleanJson = structureContent.replace(/```json\n?|\n?```/g, '').trim();
      funnelStructure = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Content that failed to parse:', structureContent);
      throw new Error('Failed to parse funnel structure JSON');
    }

    // Validate required fields
    if (!funnelStructure.funnel_name || !funnelStructure.funnel_structure) {
      throw new Error('Invalid funnel structure format');
    }

    console.log('✅ Funnel structure generated successfully:', {
      name: funnelStructure.funnel_name,
      sectionsCount: funnelStructure.funnel_structure.sections?.length || 0,
      businessType: funnelStructure.business_analysis?.business_type,
      flowType: funnelStructure.funnel_structure?.flow_type
    });

    return new Response(JSON.stringify({
      success: true,
      structure: funnelStructure,
      metadata: {
        generatedAt: new Date().toISOString(),
        sectionsCount: funnelStructure.funnel_structure.sections?.length || 0,
        flowType: funnelStructure.funnel_structure?.flow_type
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Funnel structure generation failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to generate funnel structure',
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});