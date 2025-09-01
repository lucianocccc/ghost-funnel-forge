import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Advanced prompt templates for different funnel sections
const SECTION_PROMPTS = {
  hero: {
    system: "You are an expert copywriter specialized in creating high-converting hero sections. Create compelling headlines and value propositions that grab attention immediately.",
    template: `Create a hero section for a {industry} business targeting {audience}. 
    Product: {productName}
    Key Benefits: {benefits}
    Brand Voice: {brandVoice}
    
    Generate:
    - A powerful headline (6-10 words)
    - A compelling subheadline (10-15 words)
    - A main description (20-30 words) focusing on the primary value proposition
    - A strong CTA text (2-4 words)
    
    Style: {brandVoice} tone, focus on immediate value and emotional connection.`
  },
  
  discovery: {
    system: "You are a pain point identification expert. Create content that helps users recognize their problems and positions your solution as the perfect fit.",
    template: `Create discovery content for {productName} in {industry} targeting {audience}.
    Key Benefits: {benefits}
    Brand Voice: {brandVoice}
    
    Generate:
    - A thought-provoking headline that identifies a pain point
    - A subtitle that amplifies the problem
    - Main content that describes the pain point and hints at the solution (40-60 words)
    - A CTA that invites exploration
    
    Focus on problem-solution fit and curiosity building.`
  },
  
  benefits: {
    system: "You are a benefits communication specialist. Transform features into compelling benefits that resonate emotionally with the target audience.",
    template: `Create benefits section for {productName} targeting {audience}.
    Key Benefits: {benefits}
    Brand Voice: {brandVoice}
    Industry: {industry}
    
    Generate:
    - A benefits-focused headline
    - A subtitle that promises transformation
    - Detailed benefit descriptions (50-80 words) that show outcomes, not features
    - A progression CTA
    
    Focus on outcomes, transformations, and emotional benefits.`
  },
  
  emotional: {
    system: "You are an emotional marketing expert. Create content that builds urgency, creates FOMO, and drives emotional decision-making.",
    template: `Create emotional content for {productName} targeting {audience}.
    Key Benefits: {benefits}
    Brand Voice: {brandVoice}
    
    Generate:
    - An emotionally charged headline
    - A subtitle that builds urgency or FOMO
    - Emotional content (40-70 words) that creates desire and urgency
    - An action-oriented CTA
    
    Focus on scarcity, social proof, and emotional triggers.`
  },
  
  conversion: {
    system: "You are a conversion optimization expert. Create final conversion content that handles objections and drives immediate action.",
    template: `Create conversion content for {productName} targeting {audience}.
    Key Benefits: {benefits}
    Brand Voice: {brandVoice}
    
    Generate:
    - A decisive headline that encourages action
    - A subtitle that reinforces value
    - Final conversion content (30-50 words) that handles objections and reinforces benefits
    - A strong final CTA (2-3 words)
    
    Focus on urgency, value reinforcement, and objection handling.`
  },
  
  qualification: {
    system: "You are a lead qualification expert. Create content that helps identify qualified prospects while building engagement.",
    template: `Create qualification content for {productName} targeting {audience}.
    Key Benefits: {benefits}
    Brand Voice: {brandVoice}
    
    Generate:
    - A qualifying headline that segments the audience
    - A subtitle that speaks to specific needs
    - Qualification content (40-60 words) that helps identify the right prospects
    - A qualifying CTA
    
    Focus on audience segmentation and need identification.`
  }
};

// Brand voice configurations
const BRAND_VOICES = {
  apple: "Innovative, simple, elegant, human-centered, inspiring",
  nike: "Motivational, empowering, athletic, bold, inspirational",
  amazon: "Customer-obsessed, reliable, efficient, trustworthy, value-focused",
  luxury: "Sophisticated, exclusive, premium, refined, aspirational",
  friendly: "Warm, approachable, conversational, helpful, human",
  professional: "Expert, credible, authoritative, reliable, solution-focused",
  startup: "Innovative, disruptive, fast-moving, technology-focused, growth-oriented"
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      sectionType, 
      productName, 
      industry, 
      audience, 
      benefits = [], 
      brandVoice = 'professional',
      customContext = {} 
    } = await req.json();

    if (!sectionType || !productName) {
      return new Response(JSON.stringify({ 
        error: "Missing required fields: sectionType and productName are required" 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const promptConfig = SECTION_PROMPTS[sectionType as keyof typeof SECTION_PROMPTS];
    if (!promptConfig) {
      return new Response(JSON.stringify({ 
        error: `Invalid section type. Supported types: ${Object.keys(SECTION_PROMPTS).join(', ')}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Get brand voice description
    const brandVoiceDescription = BRAND_VOICES[brandVoice as keyof typeof BRAND_VOICES] || brandVoice;

    // Fill the template with provided data
    const prompt = promptConfig.template
      .replace(/{productName}/g, productName)
      .replace(/{industry}/g, industry || 'technology')
      .replace(/{audience}/g, audience || 'professionals')
      .replace(/{benefits}/g, benefits.join(', ') || 'innovative solution')
      .replace(/{brandVoice}/g, brandVoiceDescription);

    console.log(`Generating ${sectionType} content for ${productName}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: `${promptConfig.system}\n\nAlways return a JSON object with these exact fields: title, subtitle, content, cta.` 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.8,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = JSON.parse(data.choices[0].message.content);

    // Add generation metadata
    const result = {
      ...generatedContent,
      metadata: {
        sectionType,
        productName,
        industry,
        audience,
        brandVoice,
        generatedAt: new Date().toISOString(),
        model: 'gpt-4.1-2025-04-14'
      }
    };

    console.log(`Successfully generated ${sectionType} content:`, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in generate-section-content:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      type: 'generation_error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});