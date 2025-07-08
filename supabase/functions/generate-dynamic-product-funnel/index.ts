import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductFunnelRequest {
  productName: string;
  productDescription?: string;
  targetAudience?: string;
  industry?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, productDescription, targetAudience, industry }: ProductFunnelRequest = await req.json();

    console.log('Generating dynamic funnel for product:', productName);

    const prompt = `
Create a dynamic, engaging product funnel for "${productName}". ${productDescription ? `Product description: ${productDescription}` : ''}

Generate a JSON structure with the following components:

1. HERO_SECTION: An animated hero section with compelling headline, benefits, and visual elements
2. PRODUCT_BENEFITS: 3-4 key benefits with icons and descriptions
3. SOCIAL_PROOF: Testimonials and trust indicators
4. INTERACTIVE_DEMO: A simple interactive element showing the product
5. CONVERSION_FORM: A form that captures interest WITHOUT requiring email upfront

Requirements:
- Make it visually appealing with animations
- Focus on emotional connection and benefits
- Use persuasive copywriting
- Include specific details about the product
- Create urgency without being pushy
- Target audience: ${targetAudience || 'general consumers'}
- Industry context: ${industry || 'consumer products'}

Return ONLY a valid JSON object with this structure:
{
  "heroSection": {
    "headline": "Compelling headline",
    "subheadline": "Supporting text",
    "animation": "fade-slide-up",
    "backgroundGradient": "gradient colors",
    "ctaText": "Action text"
  },
  "productBenefits": [
    {
      "title": "Benefit title",
      "description": "Benefit description",
      "icon": "lucide icon name",
      "animation": "animation type"
    }
  ],
  "socialProof": {
    "testimonials": [
      {
        "name": "Customer name",
        "text": "Testimonial text",
        "rating": 5
      }
    ],
    "trustIndicators": ["trust elements"]
  },
  "interactiveDemo": {
    "type": "slider|gallery|quiz",
    "title": "Demo title",
    "description": "Demo description",
    "content": "demo specific content"
  },
  "conversionForm": {
    "title": "Form title",
    "description": "Why to fill the form",
    "fields": [
      {
        "name": "field_name",
        "label": "Field label",
        "type": "text|select|number",
        "placeholder": "Placeholder text",
        "required": true,
        "options": ["if select type"]
      }
    ],
    "submitText": "Submit button text",
    "incentive": "What user gets"
  },
  "animations": {
    "entrance": "entrance animation",
    "scroll": "scroll triggered animations",
    "interactions": "hover/click animations"
  }
}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert marketing funnel designer. Create compelling, conversion-optimized product funnels with engaging copy and clear value propositions. Always return valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Parse and validate the JSON response
    let funnelData;
    try {
      funnelData = JSON.parse(generatedContent);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      throw new Error('Invalid JSON response from AI');
    }

    console.log('Successfully generated funnel for:', productName);

    return new Response(JSON.stringify({
      success: true,
      productName,
      funnelData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-dynamic-product-funnel:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});