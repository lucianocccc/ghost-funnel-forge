import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HTMLGenerationRequest {
  structure: any;
  userPrompt: string;
  answers: Record<string, string>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { structure, userPrompt, answers }: HTMLGenerationRequest = await req.json();

    console.log('🎨 Generating HTML funnel...', {
      funnelName: structure.funnel_name,
      sectionsCount: structure.funnel_structure?.sections?.length || 0,
      businessType: structure.business_analysis?.business_type
    });

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Generate persuasive copy and HTML
    const htmlPrompt = `
Create a complete, high-converting HTML landing page based on this funnel structure:

FUNNEL STRUCTURE: ${JSON.stringify(structure, null, 2)}

ORIGINAL USER PROMPT: "${userPrompt}"
USER ANSWERS: ${JSON.stringify(answers, null, 2)}

Requirements:
1. Generate persuasive, conversion-focused copy for each section
2. Use neuro-copywriting techniques and psychological triggers
3. Create complete HTML with embedded CSS and JavaScript
4. Make it mobile-responsive and modern
5. Include conversion optimization elements
6. Use the specified brand style and tone

Generate a complete HTML document with:
- Compelling headlines and copy based on the structure
- Beautiful, conversion-optimized design
- Responsive CSS (embedded in <style> tags)
- Smooth animations and interactions
- Lead capture forms with validation
- Call-to-action buttons
- Social proof sections
- Trust signals and guarantees

The HTML should be production-ready and immediately usable as a landing page.

Business Details:
- Business: ${structure.business_analysis?.business_type}
- Target Audience: ${structure.business_analysis?.target_audience}
- Value Proposition: ${structure.business_analysis?.value_proposition}
- Tone: ${structure.copy_requirements?.tone}

Return ONLY the complete HTML code, no explanations:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert conversion copywriter and web developer. Create high-converting HTML landing pages with persuasive copy, beautiful design, and optimal user experience. Focus on conversion optimization and psychological triggers. Always return complete, valid HTML documents.'
          },
          {
            role: 'user',
            content: htmlPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let htmlContent = data.choices[0].message.content.trim();

    // Clean the response if it has markdown formatting
    htmlContent = htmlContent.replace(/```html\n?|\n?```/g, '').trim();

    // Validate HTML - check for basic HTML structure
    if (!htmlContent.includes('<html') && !htmlContent.includes('<body')) {
      console.warn('⚠️ Generated content may not be complete HTML, attempting to wrap...');
      // If it's partial HTML, wrap it in a basic structure
      if (htmlContent.includes('<') && htmlContent.includes('>')) {
        htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${structure.funnel_name || 'Landing Page'}</title>
</head>
<body>
${htmlContent}
</body>
</html>`;
      } else {
        throw new Error('Generated content is not valid HTML');
      }
    }

    console.log('✅ HTML funnel generated successfully:', {
      htmlLength: htmlContent.length,
      hasDoctype: htmlContent.includes('<!DOCTYPE'),
      hasHtml: htmlContent.includes('<html'),
      hasBody: htmlContent.includes('<body'),
      hasCss: htmlContent.includes('<style'),
      hasJs: htmlContent.includes('<script')
    });

    // Extract metadata for preview
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : structure.funnel_name;

    return new Response(JSON.stringify({
      success: true,
      html: htmlContent,
      metadata: {
        title,
        generatedAt: new Date().toISOString(),
        htmlLength: htmlContent.length,
        structure: {
          funnelName: structure.funnel_name,
          businessType: structure.business_analysis?.business_type,
          sectionsCount: structure.funnel_structure?.sections?.length || 0
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ HTML generation failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to generate HTML funnel',
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});