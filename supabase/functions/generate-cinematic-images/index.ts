import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      productName, 
      productDescription, 
      industry, 
      sceneType, 
      visualStyle,
      specificPrompt 
    } = await req.json();

    console.log('🎨 Generating cinematic image for:', {
      productName,
      sceneType,
      industry,
      visualStyle
    });

    // Generate hyper-specific prompt based on product context
    const cinematicPrompt = generateCinematicPrompt({
      productName,
      productDescription,
      industry,
      sceneType,
      visualStyle,
      specificPrompt
    });

    console.log('🎬 Generated prompt:', cinematicPrompt);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: cinematicPrompt,
        n: 1,
        size: '1792x1024',
        quality: 'hd',
        style: 'natural'
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const imageUrl = data.data[0].url;
    console.log('✅ Image generated successfully');

    return new Response(JSON.stringify({ 
      imageUrl,
      prompt: cinematicPrompt,
      productName,
      sceneType
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error generating cinematic image:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallbackUrl: generateFallbackUrl()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateCinematicPrompt({
  productName,
  productDescription,
  industry,
  sceneType,
  visualStyle,
  specificPrompt
}: {
  productName: string;
  productDescription?: string;
  industry?: string;
  sceneType: string;
  visualStyle?: string;
  specificPrompt?: string;
}) {
  // If specific prompt provided, use it with enhancements
  if (specificPrompt) {
    return enhancePromptWithStyle(specificPrompt, visualStyle, industry);
  }

  // Industry-specific visual contexts
  const industryContexts = {
    'technology': 'modern tech environment, sleek interfaces, digital innovation, futuristic workspace',
    'health': 'clean medical environment, wellness atmosphere, professional healthcare setting, serene lighting',
    'finance': 'professional office space, success indicators, business growth visuals, corporate elegance',
    'education': 'learning environment, knowledge transfer, academic excellence, inspiring atmosphere',
    'automotive': 'precision engineering, performance focus, dynamic movement, premium materials',
    'fitness': 'energy and vitality, athletic performance, strength and determination, dynamic action',
    'food': 'appetizing presentation, fresh ingredients, culinary artistry, warm inviting atmosphere',
    'fashion': 'style and elegance, premium materials, sophisticated design, fashion-forward aesthetic',
    'travel': 'exploration and adventure, beautiful destinations, luxury experience, wanderlust inspiration',
    'real estate': 'architectural excellence, luxury living, premium locations, lifestyle aspiration',
    'default': 'professional, premium quality, sophisticated atmosphere, success and excellence'
  };

  // Visual style specifications
  const styleSpecs = {
    'minimal': 'clean minimalist design, white background, simple composition, elegant simplicity',
    'dynamic': 'energetic composition, vibrant colors, dynamic lighting, movement and action',
    'elegant': 'sophisticated luxury aesthetic, premium materials, refined composition, timeless elegance',
    'technical': 'high-tech precision, modern engineering, clean lines, professional technical environment',
    'cinematic': 'dramatic lighting, film-quality composition, depth of field, professional cinematography'
  };

  // Scene-specific contexts
  const sceneContexts = {
    'hero': `flagship presentation of ${productName}, premium hero shot, aspirational lifestyle`,
    'benefit': `demonstrating key advantages of ${productName}, problem-solving in action, clear value proposition`,
    'proof': `real-world success with ${productName}, authentic testimonials, credible results`,
    'demo': `${productName} in professional use, detailed functionality, expert demonstration`,
    'conversion': `compelling call-to-action for ${productName}, urgency and opportunity, decision moment`
  };

  const industryContext = industryContexts[industry as keyof typeof industryContexts] || industryContexts.default;
  const styleSpec = styleSpecs[visualStyle as keyof typeof styleSpecs] || styleSpecs.cinematic;
  const sceneContext = sceneContexts[sceneType as keyof typeof sceneContexts] || `professional ${productName} presentation`;

  // Build comprehensive prompt
  let prompt = `Professional commercial photography: ${sceneContext}. `;
  
  if (productDescription) {
    prompt += `Product context: ${productDescription}. `;
  }
  
  prompt += `Visual style: ${styleSpec}. `;
  prompt += `Environment: ${industryContext}. `;
  prompt += `Ultra-high quality, photorealistic, commercial grade, perfect lighting, `;
  prompt += `professional composition, sharp focus, premium aesthetic, 8K resolution, `;
  prompt += `shot with professional camera, no text overlays, no logos, clean composition`;

  return prompt;
}

function enhancePromptWithStyle(prompt: string, visualStyle?: string, industry?: string) {
  let enhanced = prompt;
  
  if (visualStyle === 'minimal') {
    enhanced += ', clean minimalist aesthetic, white background, simple elegant composition';
  } else if (visualStyle === 'dynamic') {
    enhanced += ', energetic dynamic composition, vibrant colors, movement and action';
  } else if (visualStyle === 'elegant') {
    enhanced += ', sophisticated luxury aesthetic, premium materials, refined elegance';
  } else if (visualStyle === 'technical') {
    enhanced += ', high-tech precision, modern engineering aesthetic, clean professional lines';
  }
  
  enhanced += ', ultra-high quality, photorealistic, commercial grade, perfect lighting, 8K resolution';
  
  return enhanced;
}

function generateFallbackUrl(): string {
  return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1792&h=1024&fit=crop&q=80&auto=format&cs=tinysrgb`;
}