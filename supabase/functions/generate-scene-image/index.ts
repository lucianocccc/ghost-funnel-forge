import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SceneImageRequest {
  sceneId: string;
  imagePrompt: string;
  sceneType: 'hero' | 'benefit' | 'proof' | 'demo' | 'conversion';
  priority?: 'high' | 'low';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      console.error('OpenAI API key is not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'OpenAI API key is not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { sceneId, imagePrompt, sceneType, priority = 'low' }: SceneImageRequest = await req.json();

    if (!sceneId || !imagePrompt || !sceneType) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: sceneId, imagePrompt, and sceneType are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`🎨 Generating image for scene: ${sceneId} (${sceneType}) - Priority: ${priority}`);

    // Optimize prompt for faster generation
    const optimizedPrompt = optimizeImagePrompt(imagePrompt);

    // Generate image with OpenAI DALL-E 3
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: optimizedPrompt,
        n: 1,
        size: priority === 'high' ? '1792x1024' : '1024x1024', // Higher resolution for high priority
        quality: priority === 'high' ? 'hd' : 'standard',
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error(`Image generation failed for scene ${sceneId}:`, errorText);
      
      // Return fallback image URL
      const fallbackImage = generateFallbackImageUrl(sceneType);
      return new Response(JSON.stringify({
        success: true,
        sceneId,
        imageUrl: fallbackImage,
        fallback: true,
        message: 'Fallback image used due to generation failure'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const imageData = await imageResponse.json();
    const imageUrl = imageData.data[0].url;

    console.log(`✅ Image generated successfully for scene: ${sceneId}`);

    return new Response(JSON.stringify({
      success: true,
      sceneId,
      imageUrl,
      fallback: false,
      metadata: {
        sceneType,
        priority,
        generatedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-scene-image:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function optimizeImagePrompt(originalPrompt: string): string {
  // Optimize prompts for faster generation while maintaining quality
  const optimized = originalPrompt
    .replace('8K ultra high resolution', 'high resolution')
    .replace('ultra-realistic', 'realistic')
    .replace('extremely detailed', 'detailed')
    .replace('professional photography', 'photography')
    .replace('cinematic lighting', 'dramatic lighting');
  
  return optimized.length > 800 ? optimized.substring(0, 800) + '...' : optimized;
}

function generateFallbackImageUrl(sceneType: string): string {
  // Create fallback gradient based on scene type
  const colorMap = {
    hero: { start: '#667eea', end: '#764ba2' },
    benefit: { start: '#f093fb', end: '#f5576c' },
    proof: { start: '#4facfe', end: '#00f2fe' },
    demo: { start: '#43e97b', end: '#38f9d7' },
    conversion: { start: '#fa709a', end: '#fee140' }
  };
  
  const colors = colorMap[sceneType] || colorMap.hero;
  
  // Use URL encoding for safe SVG embedding
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1792" height="1024" viewBox="0 0 1792 1024">
    <defs>
      <linearGradient id="grad_${sceneType}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.start};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colors.end};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad_${sceneType})"/>
  </svg>`;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}